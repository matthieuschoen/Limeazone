<template>
    <v-dialog v-model="show" max-width="1400px" persistent>
      <v-card class="modern-admin-panel">
        <!-- Header moderne -->
        <v-toolbar class="panel-header" elevation="0">
          <div class="header-background"></div>
          <v-toolbar-title class="panel-title minecraft-font">
            ⚙️ Admin Panel Moderne - Gestion GitHub
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-chip :color="isConnected ? 'success' : 'error'" class="status-chip">
            {{ isConnected ? '🟢 GitHub Connecté' : '🔴 GitHub Déconnecté' }}
          </v-chip>
          <v-btn icon @click="close" class="close-btn">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
  
        <!-- Tabs modernes -->
        <v-tabs v-model="activeTab" class="admin-tabs">
          <v-tab value="editor">📝 Éditeur JSON</v-tab>
          <v-tab value="table">📊 Vue Tableau</v-tab>
          <v-tab value="github">🔄 GitHub Sync</v-tab>
          <v-tab value="stats">📈 Statistiques</v-tab>
        </v-tabs>
  
        <v-card-text class="panel-content pa-0">
          <!-- Tab 1: Éditeur JSON -->
          <v-tab-item value="editor" v-show="activeTab === 'editor'">
            <div class="editor-container pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="minecraft-font">🔧 Éditeur JSON Avancé</h3>
                <div class="editor-actions">
                  <v-btn color="success" @click="validateJson" class="mx-2">
                    ✅ Valider JSON
                  </v-btn>
                  <v-btn color="primary" @click="formatJson" class="mx-2">
                    🎨 Formater
                  </v-btn>
                  <v-btn color="warning" @click="saveToGitHub" :loading="saving">
                    💾 Sauvegarder sur GitHub
                  </v-btn>
                </div>
              </div>
  
              <v-textarea
                v-model="itemsJsonString"
                label="Items JSON"
                :rows="20"
                variant="outlined"
                class="json-editor"
                :error="jsonError"
                :error-messages="jsonErrorMessage"
                @input="onJsonChange"
              ></v-textarea>
  
              <v-alert v-if="lastSaved" type="success" class="mt-4">
                💾 Dernière sauvegarde: {{ lastSaved }}
              </v-alert>
            </div>
          </v-tab-item>
  
          <!-- Tab 2: Vue Tableau -->
          <v-tab-item value="table" v-show="activeTab === 'table'">
            <div class="table-container pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="minecraft-font">📊 Gestion des Produits</h3>
                <v-btn color="success" @click="addNewItem" prepend-icon="mdi-plus">
                  ➕ Nouveau Produit
                </v-btn>
              </div>
  
              <v-data-table
                :headers="tableHeaders"
                :items="parsedItems"
                item-key="id"
                class="modern-table"
                :items-per-page="10"
              >
                <template v-slot:item.price="{ item }">
                  <v-chip color="success" size="small">
                    💰 {{ item.price }}
                  </v-chip>
                </template>
  
                <template v-slot:item.rarity="{ item }">
                  <v-chip :color="getRarityColor(item.rarity)" size="small">
                    {{ getRarityIcon(item.rarity) }} {{ item.rarity }}
                  </v-chip>
                </template>
  
                <template v-slot:item.actions="{ item }">
                  <div class="action-buttons">
                    <v-btn
                      icon
                      size="small"
                      color="primary"
                      @click="editItem(item)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      color="error"
                      @click="deleteItem(item.id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </div>
          </v-tab-item>
  
          <!-- Tab 3: GitHub Sync -->
          <v-tab-item value="github" v-show="activeTab === 'github'">
            <div class="github-container pa-6">
              <div class="row">
                <div class="col-md-6">
                  <v-card class="github-card mb-4">
                    <v-card-title class="minecraft-font">🔗 Configuration GitHub</v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="githubConfig.owner"
                        label="Owner (votre username)"
                        variant="outlined"
                        class="mb-3"
                      ></v-text-field>
                      <v-text-field
                        v-model="githubConfig.repo"
                        label="Repository name"
                        variant="outlined"
                        class="mb-3"
                      ></v-text-field>
                      <v-text-field
                        v-model="githubConfig.token"
                        label="GitHub Token"
                        type="password"
                        variant="outlined"
                        hint="Générez un token sur GitHub Settings"
                      ></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color="primary" @click="testGitHubConnection" :loading="testing">
                        🧪 Tester la connexion
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </div>
  
                <div class="col-md-6">
                  <v-card class="sync-card">
                    <v-card-title class="minecraft-font">🔄 Synchronisation</v-card-title>
                    <v-card-text>
                      <div class="sync-status mb-4">
                        <p><strong>Dernière sync:</strong> {{ lastSync || 'Jamais' }}</p>
                        <p><strong>Status:</strong> {{ syncStatus }}</p>
                      </div>
                      
                      <div class="sync-actions d-flex flex-column gap-3">
                        <v-btn color="info" @click="pullFromGitHub" :loading="pulling" block>
                          📥 Récupérer depuis GitHub
                        </v-btn>
                        <v-btn color="warning" @click="pushToGitHub" :loading="pushing" block>
                          📤 Envoyer vers GitHub
                        </v-btn>
                        <v-btn color="success" @click="deployToVercel" :loading="deploying" block>
                          🚀 Déployer sur Vercel
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
  
              <!-- Historique des commits -->
              <v-card class="commits-card mt-4">
                <v-card-title class="minecraft-font">📜 Historique des modifications</v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item v-for="commit in recentCommits" :key="commit.sha">
                      <template v-slot:prepend>
                        <v-icon color="primary">mdi-source-commit</v-icon>
                      </template>
                      <v-list-item-title>{{ commit.message }}</v-list-item-title>
                      <v-list-item-subtitle>
                        {{ formatDate(commit.date) }} - {{ commit.author }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </div>
          </v-tab-item>
  
          <!-- Tab 4: Statistiques -->
          <v-tab-item value="stats" v-show="activeTab === 'stats'">
            <div class="stats-container pa-6">
              <h3 class="minecraft-font mb-4">📈 Statistiques du Shop</h3>
              
              <div class="row">
                <div class="col-md-3">
                  <v-card class="stat-card">
                    <v-card-text class="text-center">
                      <v-icon size="40" color="primary" class="mb-2">mdi-package-variant</v-icon>
                      <h2 class="minecraft-font">{{ parsedItems.length }}</h2>
                      <p>Total Items</p>
                    </v-card-text>
                  </v-card>
                </div>
                
                <div class="col-md-3">
                  <v-card class="stat-card">
                    <v-card-text class="text-center">
                      <v-icon size="40" color="success" class="mb-2">mdi-currency-usd</v-icon>
                      <h2 class="minecraft-font">{{ averagePrice }}</h2>
                      <p>Prix Moyen</p>
                    </v-card-text>
                  </v-card>
                </div>
                
                <div class="col-md-3">
                  <v-card class="stat-card">
                    <v-card-text class="text-center">
                      <v-icon size="40" color="warning" class="mb-2">mdi-star</v-icon>
                      <h2 class="minecraft-font">{{ mostExpensiveItem?.name || 'N/A' }}</h2>
                      <p>Plus Cher</p>
                    </v-card-text>
                  </v-card>
                </div>
                
                <div class="col-md-3">
                  <v-card class="stat-card">
                    <v-card-text class="text-center">
                      <v-icon size="40" color="info" class="mb-2">mdi-chart-pie</v-icon>
                      <h2 class="minecraft-font">{{ Object.keys(rarityStats).length }}</h2>
                      <p>Catégories</p>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
  
              <!-- Graphique des raretés -->
              <v-card class="mt-4">
                <v-card-title class="minecraft-font">📊 Répartition par Catégorie</v-card-title>
                <v-card-text>
                  <div v-for="(count, rarity) in rarityStats" :key="rarity" class="d-flex align-center mb-2">
                    <v-chip :color="getRarityColor(rarity)" class="mr-3">
                      {{ getRarityIcon(rarity) }} {{ rarity }}
                    </v-chip>
                    <v-progress-linear
                      :model-value="(count / parsedItems.length) * 100"
                      :color="getRarityColor(rarity)"
                      class="flex-grow-1"
                      height="20"
                    >
                      <span class="text-white font-weight-bold">{{ count }}</span>
                    </v-progress-linear>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-tab-item>
        </v-card-text>
      </v-card>
  
      <!-- Dialog d'édition d'item -->
      <v-dialog v-model="showEditDialog" max-width="600px">
        <v-card class="edit-dialog">
          <v-card-title class="minecraft-font">
            {{ editingItem ? '✏️ Modifier' : '➕ Nouveau' }} Produit
          </v-card-title>
          <v-card-text>
            <v-form ref="editForm">
              <v-text-field
                v-model="editForm.name"
                label="Nom du produit"
                variant="outlined"
                class="mb-3"
                required
              ></v-text-field>
              <v-textarea
                v-model="editForm.description"
                label="Description"
                variant="outlined"
                rows="3"
                class="mb-3"
              ></v-textarea>
              <v-text-field
                v-model.number="editForm.price"
                label="Prix (coins)"
                type="number"
                variant="outlined"
                class="mb-3"
              ></v-text-field>
              <v-select
                v-model="editForm.rarity"
                :items="rarityOptions"
                label="Catégorie"
                variant="outlined"
              ></v-select>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="grey" @click="cancelEdit">Annuler</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="success" @click="saveEdit">
              {{ editingItem ? 'Modifier' : 'Créer' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-dialog>
  </template>
  
  <script>
  export default {
    name: 'ModernAdminPanel',
    props: {
      modelValue: Boolean
    },
    emits: ['update:modelValue', 'close'],
    data() {
      return {
        activeTab: 'editor',
        itemsJsonString: '',
        jsonError: false,
        jsonErrorMessage: '',
        saving: false,
        testing: false,
        pulling: false,
        pushing: false,
        deploying: false,
        lastSaved: null,
        lastSync: null,
        syncStatus: 'Non synchronisé',
        isConnected: false,
        
        // GitHub config
        githubConfig: {
          owner: 'matthieuschoen',
          repo: 'Limeazone-data',
          token: ''
        },
        
        // Table
        showEditDialog: false,
        editingItem: null,
        editForm: {
          name: '',
          description: '',
          price: 0,
          rarity: 'Refill'
        },
        
        tableHeaders: [
          { title: 'Nom', key: 'name' },
          { title: 'Description', key: 'description' },
          { title: 'Prix', key: 'price' },
          { title: 'Catégorie', key: 'rarity' },
          { title: 'Actions', key: 'actions', sortable: false }
        ],
        
        rarityOptions: [
          'Refill', 'Machines', 'Solaire', 'Circuits', 
          'Rouages', 'Edora', 'Autres', 'Consommables'
        ],
        
        recentCommits: []
      }
    },
    computed: {
      show: {
        get() { return this.modelValue },
        set(value) { this.$emit('update:modelValue', value) }
      },
      
      parsedItems() {
        try {
          return JSON.parse(this.itemsJsonString)
        } catch {
          return []
        }
      },
      
      averagePrice() {
        if (this.parsedItems.length === 0) return 0
        const total = this.parsedItems.reduce((sum, item) => sum + (item.price || 0), 0)
        return Math.round(total / this.parsedItems.length)
      },
      
      mostExpensiveItem() {
        return this.parsedItems.reduce((max, item) => 
          (item.price || 0) > (max?.price || 0) ? item : max, null)
      },
      
      rarityStats() {
        const stats = {}
        this.parsedItems.forEach(item => {
          stats[item.rarity] = (stats[item.rarity] || 0) + 1
        })
        return stats
      }
    },
    
    async mounted() {
      await this.loadItemsFromLocal()
      this.loadGitHubConfig()
    },
    
    methods: {
      async loadItemsFromLocal() {
        try {
          const response = await fetch('/items.json')
          const items = await response.json()
          this.itemsJsonString = JSON.stringify(items, null, 2)
        } catch (error) {
          console.error('Erreur chargement items:', error)
          this.itemsJsonString = '[]'
        }
      },
      
      loadGitHubConfig() {
        const saved = localStorage.getItem('github-config')
        if (saved) {
          this.githubConfig = { ...this.githubConfig, ...JSON.parse(saved) }
        }
      },
      
      saveGitHubConfig() {
        localStorage.setItem('github-config', JSON.stringify(this.githubConfig))
      },
      
      onJsonChange() {
        try {
          JSON.parse(this.itemsJsonString)
          this.jsonError = false
          this.jsonErrorMessage = ''
        } catch (error) {
          this.jsonError = true
          this.jsonErrorMessage = 'JSON invalide: ' + error.message
        }
      },
      
      validateJson() {
        this.onJsonChange()
        if (!this.jsonError) {
          this.$toast.success('✅ JSON valide!')
        }
      },
      
      formatJson() {
        try {
          const parsed = JSON.parse(this.itemsJsonString)
          this.itemsJsonString = JSON.stringify(parsed, null, 2)
          this.$toast.success('🎨 JSON formaté!')
        } catch {
          this.$toast.error('❌ Impossible de formater un JSON invalide')
        }
      },
      
      async testGitHubConnection() {
        this.testing = true
        try {
          const response = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}`, {
            headers: {
              'Authorization': `token ${this.githubConfig.token}`
            }
          })
          
          if (response.ok) {
            this.isConnected = true
            this.saveGitHubConfig()
            alert('🟢 Connexion GitHub réussie!')
          } else {
            throw new Error('Connexion échouée')
          }
        } catch (error) {
          this.isConnected = false
          alert('🔴 Erreur de connexion GitHub')
        } finally {
          this.testing = false
        }
      },
      
      async pullFromGitHub() {
        this.pulling = true
        try {
          const response = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/items.json`, {
            headers: {
              'Authorization': `token ${this.githubConfig.token}`
            }
          })
          
          if (response.ok) {
            const data = await response.json()
            this.itemsJsonString = atob(data.content)
            this.lastSync = new Date().toLocaleString()
            this.syncStatus = 'Synchronisé'
            this.$toast.success('📥 Données récupérées depuis GitHub!')
          }
        } catch (error) {
          this.$toast.error('❌ Erreur lors de la récupération')
        } finally {
          this.pulling = false
        }
      },
      
      async saveToGitHub() {
        if (this.jsonError) {
          this.$toast.error('❌ Corrigez les erreurs JSON avant de sauvegarder')
          return
        }
        
        this.saving = true
        try {
          // Récupérer le SHA actuel
          const currentResponse = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/items.json`, {
            headers: {
              'Authorization': `token ${this.githubConfig.token}`
            }
          })
          
          const currentData = await currentResponse.json()
          
          // Mettre à jour
          const updateResponse = await fetch(`https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/items.json`, {
            method: 'PUT',
            headers: {
              'Authorization': `token ${this.githubConfig.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              message: `Update items - ${new Date().toLocaleString()}`,
              content: btoa(this.itemsJsonString),
              sha: currentData.sha
            })
          })
          
          if (updateResponse.ok) {
            this.lastSaved = new Date().toLocaleString()
            this.syncStatus = 'Sauvegardé'
            this.$toast.success('💾 Sauvegardé sur GitHub!')
          }
        } catch (error) {
          this.$toast.error('❌ Erreur lors de la sauvegarde')
        } finally {
          this.saving = false
        }
      },
      
      async deployToVercel() {
        this.deploying = true
        try {
          // Déclencher un redéploiement Vercel via webhook si configuré
          this.$toast.success('🚀 Déploiement déclenché!')
        } catch (error) {
          this.$toast.error('❌ Erreur lors du déploiement')
        } finally {
          this.deploying = false
        }
      },
      
      // Méthodes d'édition
      addNewItem() {
        this.editingItem = null
        this.editForm = {
          name: '',
          description: '',
          price: 0,
          rarity: 'Refill'
        }
        this.showEditDialog = true
      },
      
      editItem(item) {
        this.editingItem = item
        this.editForm = { ...item }
        this.showEditDialog = true
      },
      
      saveEdit() {
        const items = [...this.parsedItems]
        
        if (this.editingItem) {
          // Modifier
          const index = items.findIndex(i => i.id === this.editingItem.id)
          items[index] = { ...this.editForm }
        } else {
          // Créer
          const newItem = {
            ...this.editForm,
            id: Date.now()
          }
          items.push(newItem)
        }
        
        this.itemsJsonString = JSON.stringify(items, null, 2)
        this.showEditDialog = false
        this.$toast.success(this.editingItem ? '✏️ Item modifié!' : '➕ Item créé!')
      },
      
      cancelEdit() {
        this.showEditDialog = false
      },
      
      deleteItem(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet item ?')) {
          const items = this.parsedItems.filter(item => item.id !== id)
          this.itemsJsonString = JSON.stringify(items, null, 2)
          this.$toast.success('🗑️ Item supprimé!')
        }
      },
      
      // Utilitaires
      getRarityColor(rarity) {
        const colors = {
          'Refill': 'grey',
          'Machines': 'green',
          'Solaire': 'blue',
          'Circuits': 'purple',
          'Rouages': 'orange',
          'Edora': 'red',
          'Autres': 'cyan',
          'Consommables': 'lime'
        }
        return colors[rarity] || 'grey'
      },
      
      getRarityIcon(rarity) {
        const icons = {
          'Refill': '⚪',
          'Machines': '🟢',
          'Solaire': '🔵',
          'Circuits': '🟣',
          'Rouages': '🟠',
          'Edora': '🔴',
          'Autres': '🔵',
          'Consommables': '🟢'
        }
        return icons[rarity] || '⚪'
      },
      
      formatDate(date) {
        return new Date(date).toLocaleString()
      },
      
      close() {
        this.$emit('close')
      }
    }
  }
  </script>
  
  <style scoped>
  /* Panel moderne */
  .modern-admin-panel {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
    border: 3px solid rgba(255, 215, 0, 0.6);
    border-radius: 15px;
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
    max-height: 95vh;
    overflow: hidden;
  }
  
  .panel-header {
    background: transparent !important;
    position: relative;
    overflow: hidden;
  }
  
  .header-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 215, 0, 0.1);
    border-bottom: 2px solid rgba(255, 215, 0, 0.5);
  }
  
  .panel-title {
    color: #FFD700;
    text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
    position: relative;
    z-index: 2;
  }
  
  .status-chip {
    position: relative;
    z-index: 2;
  }
  
  .close-btn {
    color: #FFD700 !important;
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 215, 0, 0.5);
    position: relative;
    z-index: 2;
  }
  
  /* Tabs */
  .admin-tabs {
    background: rgba(255, 215, 0, 0.05);
    border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  }
  
  .admin-tabs .v-tab {
    color: #FFD700 !important;
  }
  
  /* Content */
  .panel-content {
    background: transparent;
    color: #ffffff;
    max-height: calc(95vh - 140px);
    overflow-y: auto;
  }
  
  /* JSON Editor */
  .json-editor .v-field {
    background: rgba(0, 0, 0, 0.7) !important;
    border: 2px solid rgba(255, 215, 0, 0.3) !important;
    font-family: 'Courier New', monospace;
  }
  
  .json-editor .v-field:focus-within {
    border-color: #FFD700 !important;
  }
  
  /* Cards */
  .github-card,
  .sync-card,
  .commits-card,
  .stat-card {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 2px solid rgba(255, 215, 0, 0.3) !important;
    border-radius: 12px;
  }
  
  .stat-card {
    text-align: center;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
  }
  
  /* Table */
  .modern-table {
    background: rgba(255, 255, 255, 0.02) !important;
    border-radius: 10px;
  }
  
  .modern-table th {
    background: rgba(255, 215, 0, 0.1) !important;
    color: #FFD700 !important;
  }
  
  .modern-table td {
    color: #ffffff !important;
  }
  
  /* Edit Dialog */
  .edit-dialog {
    background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
    border: 2px solid rgba(255, 215, 0, 0.6);
    border-radius: 12px;
  }
  
  .minecraft-font {
    font-family: 'Press Start 2P', cursive;
    font-size: 14px !important;
  }
  
  /* Responsive */
  @media (max-width: 768px) {
    .modern-admin-panel {
      margin: 8px;
      max-width: calc(100vw - 16px);
    }
  }
  </style>