const { google } = require('googleapis');
const path = require('path');

// Configuration
const SHEET_ID = '1gn6ClTe_Tq-rH4YIDMZ5KxalN10gVlLElIWo_CJLgas';
const CREDENTIALS_PATH = path.join(__dirname, '../google-credentials.json');

// Initialiser l'authentification
let auth = null;
let sheets = null;

async function initializeAuth() {
    try {
        auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_PATH,
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });
        
        sheets = google.sheets({ version: 'v4', auth });
        return true;
    } catch (error) {
        console.error('❌ Erreur initialisation auth:', error);
        return false;
    }
}

// Test de connexion
async function testConnection() {
    try {
        if (!sheets) {
            await initializeAuth();
        }
        
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID
        });
        
        console.log('✅ Connexion Google Sheets réussie!');
        console.log(`📊 Sheet: ${response.data.properties.title}`);
        console.log(`📄 Nombre de feuilles: ${response.data.sheets.length}`);
        return true;
    } catch (error) {
        console.error('❌ Erreur connexion Google Sheets:', error);
        console.error('Détails:', error.message);
        return false;
    }
}

// Lire les données d'un utilisateur
async function getUserStats(discordId) {
    try {
        if (!sheets) await initializeAuth();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'A:F',
        });
        
        const rows = response.data.values;
        if (!rows || rows.length === 0) return null;
        
        // Chercher l'utilisateur (en ignorant la ligne d'en-tête)
        const userRow = rows.slice(1).find(row => row[0] === discordId);
        
        if (userRow) {
            return {
                discordId: userRow[0],
                username: userRow[1],
                totalOrders: parseInt(userRow[2]) || 0,
                totalSpent: parseInt(userRow[3]) || 0,
                lastOrder: userRow[4],
                createdAt: userRow[5]
            };
        }
        
        return null;
    } catch (error) {
        console.error('❌ Erreur lecture utilisateur:', error);
        throw error;
    }
}

// Ajouter ou mettre à jour un utilisateur
async function updateUserStats(discordId, username, orderAmount = 0) {
    try {
        if (!sheets) await initializeAuth();
        
        // Lire toutes les données
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'A:F',
        });
        
        const rows = response.data.values || [];
        
        // Si c'est vide, ajouter les en-têtes
        if (rows.length === 0) {
            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: 'A1:F1',
                valueInputOption: 'RAW',
                resource: {
                    values: [['discord_id', 'username', 'total_orders', 'total_spent', 'last_order', 'created_at']]
                }
            });
        }
        
        // Chercher l'utilisateur existant
        const userRowIndex = rows.slice(1).findIndex(row => row[0] === discordId);
        
        if (userRowIndex >= 0) {
            // Utilisateur existant - mettre à jour
            const actualRowIndex = userRowIndex + 2; // +1 pour l'en-tête +1 pour l'index base 0
            const currentOrders = parseInt(rows[userRowIndex + 1][2]) || 0;
            const currentSpent = parseInt(rows[userRowIndex + 1][3]) || 0;
            
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `A${actualRowIndex}:F${actualRowIndex}`,
                valueInputOption: 'RAW',
                resource: {
                    values: [[
                        discordId,
                        username,
                        currentOrders + 1,
                        currentSpent + orderAmount,
                        new Date().toISOString(),
                        rows[userRowIndex + 1][5] || new Date().toISOString()
                    ]]
                }
            });
            
            console.log(`✅ Utilisateur ${username} mis à jour: ${currentOrders + 1} commandes`);
        } else {
            // Nouvel utilisateur - ajouter
            await sheets.spreadsheets.values.append({
                spreadsheetId: SHEET_ID,
                range: 'A:F',
                valueInputOption: 'RAW',
                resource: {
                    values: [[
                        discordId,
                        username,
                        1,
                        orderAmount,
                        new Date().toISOString(),
                        new Date().toISOString()
                    ]]
                }
            });
            
            console.log(`✅ Nouvel utilisateur ${username} ajouté`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Erreur mise à jour utilisateur:', error);
        throw error;
    }
}

// Ajoutez cette fonction à la fin de googleSheets.js
async function getTopUsers(limit = 10) {
    try {
        if (!sheets) await initializeAuth();
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: 'A:F',
        });
        
        const rows = response.data.values;
        if (!rows || rows.length <= 1) return [];
        
        // Convertir en objets et trier
        const users = rows.slice(1).map(row => ({
            discordId: row[0],
            username: row[1],
            totalOrders: parseInt(row[2]) || 0,
            totalSpent: parseInt(row[3]) || 0,
            lastOrder: row[4],
            createdAt: row[5]
        }));
        
        // Trier par nombre de commandes (décroissant)
        users.sort((a, b) => b.totalOrders - a.totalOrders);
        
        return users.slice(0, limit);
    } catch (error) {
        console.error('❌ Erreur getTopUsers:', error);
        throw error;
    }
}

// Ajoutez getTopUsers aux exports
module.exports = {
    testConnection,
    getUserStats,
    updateUserStats,
    getTopUsers,  // ← Nouveau
    initializeAuth
};
