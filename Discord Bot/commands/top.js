const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getTopUsers } = require('../services/googleSheets');

const topCommand = new SlashCommandBuilder()
    .setName('top')
    .setDescription('Voir le classement des meilleurs clients');

async function handleTopCommand(interaction) {
    await interaction.deferReply();

    try {
        const topUsers = await getTopUsers(10); // Top 10

        if (!topUsers || topUsers.length === 0) {
            await interaction.editReply('📊 Aucune donnée de classement disponible.');
            return;
        }

        let description = '';
        topUsers.forEach((user, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
            description += `${medal} **${user.username}**\n`;
            description += `   📦 ${user.totalOrders} commandes • 💰 ${user.totalSpent} coins\n\n`;
        });

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🏆 Top Clients Limeazone')
            .setDescription(description)
            .setTimestamp()
            .setFooter({ text: 'Classement basé sur le nombre de commandes', iconURL: 'https://i.imgur.com/DinoSFu.png' });

        await interaction.editReply({ embeds: [embed] });

    } catch (error) {
        console.error('❌ Erreur top:', error);
        await interaction.editReply('❌ Erreur lors de la récupération du classement.');
    }
}

module.exports = {
    topCommand,
    handleTopCommand
};