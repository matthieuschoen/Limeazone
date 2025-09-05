const { PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Commande ping
const pingCommand = new SlashCommandBuilder()
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
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

// Fonction pour gérer la commande /ping
async function handlePingCommand(interaction) {
    // Vérifier les permissions (admin seulement)
    const hasPermission = interaction.member.permissions.has(PermissionFlagsBits.ManageChannels) ||
                         interaction.member.roles.cache.has('1397013643102654605') ||
                         interaction.member.roles.cache.has('1397015527117033482');
    
    if (!hasPermission) {
        await interaction.reply({
            content: '❌ Vous n\'avez pas les permissions pour utiliser cette commande!',
            ephemeral: true
        });
        return;
    }
    
    const client = interaction.options.getUser('client');
    const customMessage = interaction.options.getString('message');
    
    // Message par défaut ou personnalisé
    const defaultMessage = "**Votre commande est prête, veuillez ping le vendeur in-game dès que possible** 🎮";
    const messageToSend = customMessage || defaultMessage;
    
    try {
        // Créer l'embed de notification
        const notificationEmbed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('🔔 Commande Prête!')
            .setDescription(messageToSend)
            .addFields(
                { name: '👤 Client', value: `<@${client.id}>`, inline: true },
                { name: '🔧 Notifié par', value: `${interaction.user.displayName}`, inline: true },
                { name: '⏰ Heure', value: `<t:${Math.floor(Date.now() / 1000)}:t>`, inline: true }
            )
            .setThumbnail('https://i.imgur.com/DinoSFu.png')
            .setTimestamp()
            .setFooter({ text: 'Limeazone Shop', iconURL: 'https://i.imgur.com/DinoSFu.png' });
        
        // Envoyer la notification dans le channel
        await interaction.reply({
            content: `🔔 ${client} ${messageToSend}`,
            embeds: [notificationEmbed]
        });
        
        // Log de l'action
        console.log(`📢 ${interaction.user.username} a notifié ${client.username} que sa commande est prête`);
        
        // Optionnel: Envoyer un MP au client
        try {
            await client.send({
                content: `🔔 **Limeazone Shop**\n\n${messageToSend}\n\n📍 Rendez-vous dans le channel de votre commande sur le serveur Discord!`,
                embeds: [notificationEmbed]
            });
            
            // Confirmer l'envoi du MP
            setTimeout(async () => {
                try {
                    await interaction.followUp({
                        content: `✅ Message privé envoyé à ${client.displayName}`,
                        ephemeral: true
                    });
                } catch (error) {
                    // Ignore les erreurs de follow-up
                }
            }, 1000);
            
        } catch (dmError) {
            // Si on ne peut pas envoyer de MP (DM fermés)
            setTimeout(async () => {
                try {
                    await interaction.followUp({
                        content: `⚠️ Impossible d'envoyer un MP à ${client.displayName} (DM fermés)`,
                        ephemeral: true
                    });
                } catch (error) {
                    // Ignore les erreurs de follow-up
                }
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Erreur commande ping:', error);
        await interaction.reply({
            content: '❌ Erreur lors de l\'envoi de la notification.',
            ephemeral: true
        });
    }
}

module.exports = {
    pingCommand,
    handlePingCommand
};