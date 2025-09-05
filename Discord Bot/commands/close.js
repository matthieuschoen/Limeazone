const { PermissionFlagsBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { updateUserStats } = require('../services/googleSheets');
const { handleProfileCommand } = require('./profile');
const { handleTopCommand } = require('./top');
const { handlePingCommand } = require('./ping');

// Fonction pour gérer la commande /close
// Fonction pour gérer la commande /close
async function handleCloseCommand(interaction) {
    // ⚡ Defer immédiatement pour éviter l'expiration
    await interaction.deferReply();

    const channel = interaction.channel;

    // Vérifier que c'est un channel de commande
    if (!channel.name.startsWith('commande-')) {
        await interaction.editReply({
            content: '❌ Cette commande ne peut être utilisée que dans un channel de commande!'
        });
        return;
    }

    // Vérifier les permissions
    const hasManageChannels = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels);
    const hasAdminRole1 = interaction.member.roles.cache.has('1397013643102654605');
    const hasAdminRole2 = interaction.member.roles.cache.has('1397015527117033482');

    console.log(`🔍 Permissions pour ${interaction.user.username}:`);
    console.log(`   ManageChannels: ${hasManageChannels}`);
    console.log(`   Role 1397013643102654605: ${hasAdminRole1}`);
    console.log(`   Role 1397015527117033482: ${hasAdminRole2}`);
    console.log(`   Roles utilisateur: ${interaction.member.roles.cache.map(r => `${r.name}(${r.id})`).join(', ')}`);

    const hasPermission = hasManageChannels || hasAdminRole1 || hasAdminRole2;

    if (!hasPermission) {
        await interaction.editReply({
            content: '❌ Vous n\'avez pas les permissions pour fermer cette commande!'
        });
        return;
    }



    // Extraire les infos du channel pour mettre à jour les stats
    try {
        // Récupérer les messages du channel pour trouver la commande
        const messages = await channel.messages.fetch({ limit: 10 });
        const orderMessage = messages.find(msg =>
            msg.embeds.length > 0 &&
            msg.embeds[0].title &&
            msg.embeds[0].title.includes('Nouvelle Commande')
        );

        if (orderMessage && orderMessage.embeds[0]) {
            const embed = orderMessage.embeds[0];
            const clientField = embed.fields.find(field => field.name.includes('Client'));
            const totalField = embed.fields.find(field => field.name.includes('Total'));

            if (clientField && totalField) {
                // Extraire l'ID utilisateur du mention <@123456789>
                const userMention = clientField.value.match(/<@(\d+)>/);
                if (userMention) {
                    const userId = userMention[1];
                    const totalAmount = parseInt(totalField.value.replace(/\D/g, '')) || 0;

                    // Récupérer l'utilisateur pour son nom
                    const user = await interaction.guild.members.fetch(userId);
                    const username = user.displayName || user.user.username;

                    // Mettre à jour les stats
                    await updateUserStats(userId, username, totalAmount);
                    console.log(`📊 Stats mises à jour pour ${username}: +1 commande, +${totalAmount} coins`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur mise à jour stats:', error);
        // Continue quand même la fermeture
    }

    // ✅ UTILISER EDITREPLY (pas reply) car on a déjà fait deferReply()
    await interaction.editReply({
        content: '✅ **Commande validée et fermée!**\n' +
            '📊 Les statistiques du client ont été mises à jour.\n' +
            '🗑️ Channel supprimé dans 10 secondes.\n' +
            `🔧 Validée par: ${interaction.user.displayName}`
    });

    // Log de l'action
    console.log(`🔒 Commande ${channel.name} validée par ${interaction.user.username} (${interaction.user.id})`);

    // Supprimer le channel après 10 secondes
    setTimeout(async () => {
        try {
            await channel.delete(`Commande validée et fermée par ${interaction.user.username}`);
            console.log(`✅ Channel ${channel.name} supprimé avec succès`);
        } catch (error) {
            console.error('❌ Erreur lors de la suppression du channel:', error);
        }
    }, 10000);
}

// Fonction pour gérer toutes les interactions
async function handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    try {
        switch (interaction.commandName) {
            case 'close':
                await handleCloseCommand(interaction);
                break;

            case 'profil':
                await handleProfileCommand(interaction);
                break;

            case 'top':
                await handleTopCommand(interaction);
                break;

            case 'ping':
                await handlePingCommand(interaction);
                break;

            default:
                await interaction.reply({
                    content: '❌ Commande inconnue!',
                    ephemeral: true
                });
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution de la commande:', error);

        const errorMessage = {
            content: '❌ Une erreur est survenue lors de l\'exécution de la commande.',
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.editReply(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}

// Fonction pour enregistrer toutes les commandes slash
async function registerSlashCommands(client) {
    const commands = [
        new SlashCommandBuilder()
            .setName('close')
            .setDescription('Valider et fermer une commande en cours')
            // ❌ SUPPRIMEZ CETTE LIGNE QUI LIMITE AUX PERMISSIONS DISCORD :
            // .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        ,
        
        new SlashCommandBuilder()
            .setName('profil')
            .setDescription('Voir vos statistiques de commandes')
            .addUserOption(option =>
                option.setName('utilisateur')
                    .setDescription('Voir le profil d\'un autre utilisateur (admin seulement)')
                    .setRequired(false)
            ),

        new SlashCommandBuilder()
            .setName('top')
            .setDescription('Voir le classement des meilleurs clients'),

        new SlashCommandBuilder()
            .setName('ping')
            .setDescription('Prévenir le client que sa commande est prête')
            .addUserOption(option =>
                option.setName('client')
                    .setDescription('Le client à notifier')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName('message')
                    .setDescription('Message personnalisé (optionnel)')
                    .setRequired(false)
            )
            // ❌ SUPPRIMEZ AUSSI CETTE LIGNE :
            // .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    ];
    
    try {
        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        console.log('🔄 Suppression des anciennes commandes...');
        // Supprimer toutes les commandes existantes
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
            { body: [] }
        );
        
        console.log('🔄 Enregistrement des nouvelles commandes...');
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
            { body: commands }
        );
        
        console.log('✅ Commandes slash mises à jour avec succès!');
        console.log('📋 Commandes disponibles: /close, /profil, /top, /ping');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement des commandes:', error);
        return false;
    }
}

module.exports = {
    handleInteraction,
    handleCloseCommand,
    registerSlashCommands
};