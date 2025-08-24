const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createOrder } = require('./webhook-handler');
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

app.listen(PORT, () => {
    console.log(`🌐 Serveur webhook démarré sur le port ${PORT}`);
    console.log(`📡 Endpoint: http://localhost:${PORT}/api/order`);
});