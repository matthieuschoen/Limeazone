const { EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

let discordClient = null;

function setClient(client) {
    discordClient = client;
}

async function createOrder(cartItems, discordUsername, customerInfo = {}) {
    if (!discordClient) {
        throw new Error('Bot Discord non initialisé');
    }

    const guild = discordClient.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) {
        throw new Error('Serveur Discord introuvable');
    }

    let targetUser = null;
    try {
        console.log(`🔍 Recherche de l'utilisateur: "${discordUsername}"`);

        // 1. Chercher par username#discriminator exact (format ancien)
        targetUser = guild.members.cache.find(member =>
            member.user.tag === discordUsername
        );

        if (!targetUser) {
            // 2. Chercher par username seul (format nouveau Discord)
            targetUser = guild.members.cache.find(member =>
                member.user.username.toLowerCase() === discordUsername.toLowerCase()
            );
        }

        if (!targetUser) {
            // 3. Chercher par display name/nickname
            targetUser = guild.members.cache.find(member =>
                member.displayName.toLowerCase() === discordUsername.toLowerCase()
            );
        }

        if (!targetUser) {
            // 4. Chercher par ID si c'est un nombre
            if (/^\d+$/.test(discordUsername)) {
                console.log(`🔍 Tentative de recherche par ID: ${discordUsername}`);
                targetUser = await guild.members.fetch(discordUsername);
            }
        }

        if (!targetUser) {
            // 5. Recherche partielle dans le cache (au cas où)
            console.log('🔍 Recherche partielle...');
            targetUser = guild.members.cache.find(member =>
                member.user.username.toLowerCase().includes(discordUsername.toLowerCase()) ||
                member.displayName.toLowerCase().includes(discordUsername.toLowerCase())
            );
        }

        if (!targetUser) {
            // 6. Forcer le fetch de tous les membres (si pas en cache)
            console.log('🔍 Fetch de tous les membres...');
            await guild.members.fetch();

            targetUser = guild.members.cache.find(member =>
                member.user.username.toLowerCase() === discordUsername.toLowerCase() ||
                member.displayName.toLowerCase() === discordUsername.toLowerCase()
            );
        }

        if (targetUser) {
            console.log(`✅ Utilisateur trouvé: ${targetUser.displayName} (${targetUser.user.username})`);
        } else {
            console.log(`❌ Utilisateur "${discordUsername}" non trouvé sur le serveur`);
            console.log('👥 Membres disponibles:');
            guild.members.cache.forEach(member => {
                console.log(`  - ${member.displayName} (${member.user.username})`);
            });
        }
    } catch (error) {
        console.log(`❌ Erreur lors de la recherche: ${error.message}`);
    }
    // Calculer le total
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // Créer le channel privé
    const category = guild.channels.cache.get(process.env.CATEGORY_ID);
    const channelName = `commande-${Date.now()}`;

    const privateChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
            {
                id: guild.roles.everyone,
                deny: [PermissionFlagsBits.ViewChannel],
            },
            // Si l'utilisateur est trouvé, lui donner accès
            ...(targetUser ? [{
                id: targetUser.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory
                ],
            }] : []),
            {
                id: '1397013643102654605', // Premier rôle admin
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageMessages
                ]
            },
            {
                id: '1397015527117033482', // Deuxième rôle admin
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageMessages
                ]
            }
        ],
    });

    // Créer l'embed détaillé de la commande
    const orderEmbed = new EmbedBuilder()
        .setColor('#8B4513')
        .setTitle('🛒 Nouvelle Commande Minecraft Shop')
        .setDescription('**Détails de la commande passée via le site web**')
        .addFields(
            {
                name: '👤 Client',
                value: targetUser ? `${targetUser} (${discordUsername})` : discordUsername,
                inline: true
            },
            {
                name: '💰 Total',
                value: `${totalPrice} coins`,
                inline: true
            },
            {
                name: '📦 Articles',
                value: `${totalItems} item(s)`,
                inline: true
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Limeazone Shop • Commande automatique' });

    // Ajouter les détails des articles
    let itemsDescription = '';
    cartItems.forEach(item => {
        const subtotal = item.price * item.quantity;
        itemsDescription += `**${item.name}**\n`;
        itemsDescription += `📊 Rareté: ${item.rarity}\n`;
        itemsDescription += `💰 ${item.price} coins × ${item.quantity} = ${subtotal} coins\n`;
        itemsDescription += `📝 *${item.description}*\n\n`;
    });

    const itemsEmbed = new EmbedBuilder()
        .setColor('#32CD32')
        .setTitle('📋 Détail des Articles')
        .setDescription(itemsDescription)
        .setThumbnail('https://i.imgur.com/DinoSFu.png');

    // Message de bienvenue dans le channel
    const welcomeMessage = targetUser
        ? `🎉 Salut ${targetUser}! Votre commande a été créée automatiquement depuis le site web.`
        : `🎉 Commande créée pour **${discordUsername}** (utilisateur non trouvé sur ce serveur)`;

    await privateChannel.send({
        content: welcomeMessage,
        embeds: [orderEmbed, itemsEmbed]
    });

    // Notification pour les admins
    const adminChannel = guild.channels.cache.find(channel =>
        channel.name === 'commandes-admin' ||
        channel.name === 'admin' ||
        channel.name === 'staff'
    );

    console.log(`🔍 Recherche channel admin...`);
    console.log(`📋 Channels disponibles:`, guild.channels.cache.map(c => c.name).join(', '));

    if (adminChannel) {
        console.log(`✅ Channel admin trouvé: ${adminChannel.name} (Type: ${adminChannel.type})`);

        try {
            // Vérifier que c'est bien un channel texte
            if (adminChannel.isTextBased && adminChannel.isTextBased()) {
                const adminNotif = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle('🔔 Nouvelle Commande Site Web')
                    .addFields(
                        { name: 'Client', value: discordUsername, inline: true },
                        { name: 'Channel', value: `${privateChannel}`, inline: true },
                        { name: 'Total', value: `${totalPrice} coins`, inline: true },
                        { name: 'Articles', value: `${totalItems} item(s)`, inline: true },
                        { name: 'Item(s)', value: `${cartItems.map(item => item.name).join(', ')}` }
                    )
                    .setTimestamp();

                await adminChannel.send({
                    content: '@here Nouvelle commande automatique!',
                    embeds: [adminNotif]
                });

                console.log(`📢 Notification admin envoyée!`);
            } else {
                console.log(`⚠️ Le channel ${adminChannel.name} n'est pas un channel texte`);
            }
        } catch (error) {
            console.log(`❌ Erreur envoi notification admin: ${error.message}`);
            // Ne pas faire planter le processus, continuer quand même
        }
    } else {
        console.log(`⚠️ Aucun channel admin trouvé`);
        console.log(`💡 Channels disponibles: ${guild.channels.cache.map(c => c.name).join(', ')}`);
    }

    console.log(`✅ Commande créée: ${channelName} pour ${discordUsername}`);

    return {
        channelId: privateChannel.id,
        channelName: privateChannel.name,
        totalPrice,
        totalItems
    };
}

module.exports = { createOrder, setClient };