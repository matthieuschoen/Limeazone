const { Client, GatewayIntentBits } = require('discord.js');
const { setClient } = require('./webhook-handler');
// ✅ CORRECT pour le dossier commands :
const { handleInteraction, registerSlashCommands } = require('./commands/close');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', async () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}!`);
    console.log(`🤖 Prêt à recevoir les commandes du site web!`);
    
    // Enregistrer les commandes slash
    await registerSlashCommands(client);
    
    // Passer le client au gestionnaire de webhook
    setClient(client);
});

// Utiliser le gestionnaire d'interactions depuis close.js
client.on('interactionCreate', handleInteraction);

client.login(process.env.DISCORD_TOKEN);

module.exports = client;