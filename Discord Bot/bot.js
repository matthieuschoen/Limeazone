const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const { setClient } = require('./webhook-handler');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}!`);
    console.log(`🤖 Prêt à recevoir les commandes du site web!`);
    
    // Passer le client au gestionnaire de webhook
    setClient(client);
});

// Commande admin pour fermer une commande
client.on('messageCreate', async message => {
    if (message.content === '!close' && 
        message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        
        const channel = message.channel;
        
        if (channel.name.startsWith('commande-')) {
            await message.reply('⚠️ Commande fermée dans 10 secondes...');
            setTimeout(async () => {
                await channel.delete('Commande traitée et fermée par un admin');
            }, 10000);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;