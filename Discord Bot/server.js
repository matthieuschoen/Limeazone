const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createOrder, createCustomRequest } = require('./webhook-handler');
const fetch = require('node-fetch');
require('dotenv').config();

// Démarrer le bot Discord
require('./bot');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Route de santé
app.get('/', (req, res) => {
    res.json({ 
        status: 'Bot Discord actif', 
        timestamp: new Date().toISOString() 
    });
});

function waitForBot(timeout = 10000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkBot = () => {
            const client = getClient();
            if (client && client.isReady()) {
                resolve(client);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error('Timeout: Bot non prêt'));
            } else {
                setTimeout(checkBot, 100);
            }
        };
        
        checkBot();
    });
}


// Webhook pour recevoir les commandes du site
app.post('/api/order', async (req, res) => {
    try {
        const { cartItems, discordUsername, customerInfo } = req.body;
        
        if (!cartItems || !discordUsername) {
            return res.status(400).json({ 
                error: 'Données manquantes (cartItems, discordUsername requis)' 
            });
        }

        // Traiter la commande via Discord
        const result = await createOrder(cartItems, discordUsername, customerInfo);
        
        res.json({ 
            success: true, 
            message: 'Commande créée avec succès',
            channelId: result.channelId 
        });

    } catch (error) {
        console.error('Erreur webhook:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            details: error.message 
        });
    }
});

// Webhook pour recevoir les demandes personnalisées
app.post('/api/request', async (req, res) => {
    try {
        console.log('📨 Nouvelle demande personnalisée reçue:', req.body);
        
        const { itemName, description, quantity, budget, urgency, discordUsername, timestamp } = req.body;
        
        if (!itemName || !discordUsername || !quantity) {
            return res.status(400).json({ 
                error: 'Données manquantes (itemName, discordUsername, quantity requis)' 
            });
        }

        // Traiter la demande via Discord
        const result = await createCustomRequest({
            itemName,
            description,
            quantity,
            budget,
            urgency,
            discordUsername,
            timestamp
        });
        
        res.json({ 
            success: true, 
            message: 'Demande créée avec succès',
            channelId: result.channelId 
        });

    } catch (error) {
        console.error('❌ Erreur webhook demande:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            details: error.message 
        });
    }
});

async function simpleKeepAlive() {
    try {
        const response = await fetch(`https://limeazone.onrender.com/`);
        console.log(`🌐 Keep-alive HTTP: ${response.status} - ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.log(`⚠️ Keep-alive HTTP échoué: ${error.message}`);
    }
}

setInterval(simpleKeepAlive, 1 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🌐 Serveur webhook démarré sur le port ${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/order`);
    console.log(`🔄 Keep-alive HTTP activé: toutes les 1 minutes`);
    simpleKeepAlive();
});