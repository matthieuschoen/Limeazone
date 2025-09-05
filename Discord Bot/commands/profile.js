const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserStats } = require('../services/googleSheets');

const profileCommand = new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Voir vos statistiques de commandes')
    .addUserOption(option =>
        option.setName('utilisateur')
            .setDescription('Voir le profil d\'un autre utilisateur (admin seulement)')
            .setRequired(false)
    );

async function handleProfileCommand(interaction) {
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    const isAdmin = interaction.member.permissions.has('ManageChannels') ||
                   interaction.member.roles.cache.has('1397013643102654605') ||
                   interaction.member.roles.cache.has('1397015527117033482');

    // Vérifier si on peut voir le profil d'un autre utilisateur
    if (targetUser.id !== interaction.user.id && !isAdmin) {
        await interaction.reply({
            content: '❌ Vous ne pouvez voir que votre propre profil !',
            ephemeral: true
        });
        return;
    }

    await interaction.deferReply();

    try {
        const stats = await getUserStats(targetUser.id);

        if (!stats) {
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('📊 Profil Client - Limeazone')
                .setDescription(`${targetUser.displayName} n'a pas encore passé de commande.`)
                .setThumbnail(targetUser.displayAvatarURL())
                .addFields(
                    { name: '📦 Commandes', value: '0', inline: true },
                    { name: '💰 Total dépensé', value: '0 coins', inline: true },
                    { name: '📅 Première commande', value: 'Jamais', inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#32CD32')
            .setTitle('📊 Profil Client - Limeazone')
            .setDescription(`Statistiques de ${stats.username}`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '📦 Commandes totales', value: `${stats.totalOrders}`, inline: true },
                { name: '💰 Total dépensé', value: `${stats.totalSpent} coins`, inline: true },
                { name: '📅 Dernière commande', value: `<t:${Math.floor(new Date(stats.lastOrder).getTime() / 1000)}:R>`, inline: true },
                { name: '🎯 Client depuis', value: `<t:${Math.floor(new Date(stats.createdAt).getTime() / 1000)}:D>`, inline: true },
                { name: '💎 Statut', value: getClientStatus(stats.totalOrders), inline: true },
                { name: '📈 Moyenne par commande', value: `${Math.round(stats.totalSpent / stats.totalOrders)} coins`, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: 'Limeazone Shop', iconURL: 'https://i.imgur.com/DinoSFu.png' });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('❌ Erreur profil:', error);
        await interaction.editReply({
            content: '❌ Erreur lors de la récupération du profil.',
            ephemeral: true
        });
    }
}

function getClientStatus(orders) {
    if (orders >= 50) return '👑 Client VIP';
    if (orders >= 20) return '💎 Client Premium';
    if (orders >= 10) return '⭐ Client Fidèle';
    if (orders >= 5) return '🥉 Client Régulier';
    if (orders >= 1) return '🆕 Nouveau Client';
    return '👤 Visiteur';
}

module.exports = {
    profileCommand,
    handleProfileCommand
};