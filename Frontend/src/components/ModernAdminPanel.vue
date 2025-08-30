<template>
  <v-dialog v-model="show" max-width="1200px" persistent>
    <v-card class="modern-admin-panel">
      <!-- Header moderne -->
      <v-toolbar class="panel-header" elevation="0">
        <div class="header-background"></div>
        <v-toolbar-title class="panel-title minecraft-font">
          ⚙️ Admin Panel - Gestion Supabase
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-chip :color="supabaseConnected ? 'success' : 'error'" class="status-chip">
          {{ supabaseConnected ? '🟢 Supabase OK' : '🔴 GitHub Mode' }}
        </v-chip>
        <v-btn icon @click="close" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" class="admin-tabs">
        <v-tab value="migration">🔄 Migration</v-tab>
        <v-tab value="items">📊 Gestion Items</v-tab>
        <v-tab value="categories">🏷️ Catégories</v-tab>
        <v-tab value="stats">📈 Statistiques</v-tab>
      </v-tabs>

      <v-card-text class="panel-content pa-0">
        <v-window v-model="activeTab">
          <!-- Tab Migration -->
          <v-window-item value="migration">
            <div class="migration-container pa-6">
              <h3 class="minecraft-font mb-4">🔄 Migration GitHub → Supabase</h3>
              
              <!-- Étape 1: Charger depuis GitHub -->
              <v-card class="step-card mb-4">
                <v-card-title>📥 Étape 1: Charger depuis GitHub</v-card-title>
                <v-card-text>
                  <p class="mb-4">Chargez vos items existants depuis votre fichier GitHub JSON.</p>
                  <v-btn 
                    color="primary" 
                    @click="loadFromGitHub" 
                    :loading="loadingFromGitHub"
                    prepend-icon="mdi-download"
                    class="mr-3"
                  >
                    📥 Charger depuis GitHub
                  </v-btn>
                  <v-chip v-if="githubItems.length > 0" color="success">
                    ✅ {{ githubItems.length }} items chargés
                  </v-chip>
                </v-card-text>
              </v-card>

              <!-- Étape 2: Migrer vers Supabase -->
              <v-card class="step-card mb-4" :disabled="!githubItems.length">
                <v-card-title>🚀 Étape 2: Migrer vers Supabase</v-card-title>
                <v-card-text>
                  <p class="mb-4">Transférez vos items vers la base de données Supabase.</p>
                  <v-btn 
                    color="success" 
                    @click="migrateToSupabase" 
                    :loading="migrating"
                    :disabled="!githubItems.length"
                    prepend-icon="mdi-database-import"
                    class="mr-3"
                  >
                    🚀 Migrer vers Supabase ({{ githubItems.length }} items)
                  </v-btn>
                  <v-chip v-if="migrationDone" color="success">
                    ✅ Migration terminée
                  </v-chip>
                </v-card-text>
              </v-card>

              <!-- Étape 3: Basculer le site -->
              <v-card class="step-card" :disabled="!migrationDone">
                <v-card-title>🔄 Étape 3: Basculer vers Supabase</v-card-title>
                <v-card-text>
                  <p class="mb-4">Votre site utilisera maintenant Supabase au lieu de GitHub.</p>
                  <v-btn 
                    color="warning" 
                    @click="switchToSupabase" 
                    :disabled="!migrationDone"
                    prepend-icon="mdi-swap-horizontal"
                  >
                    🔄 Basculer vers Supabase
                  </v-btn>
                </v-card-text>
              </v-card>

              <!-- État actuel -->
              <v-alert :type="currentSource === 'supabase' ? 'success' : 'info'" class="mt-4">
                <strong>Source de données actuelle:</strong> 
                {{ currentSource === 'supabase' ? '🗄️ Supabase (Base de données)' : '📁 GitHub (Fichier JSON)' }}
              </v-alert>
            </div>
          </v-window-item>

          <!-- Tab Gestion Items -->
          <v-window-item value="items">
            <div class="items-container pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="minecraft-font">📊 Gestion des Items</h3>
                <div class="d-flex gap-2">
                  <v-btn color="info" @click="refreshItems" :loading="refreshing">
                    🔄 Actualiser
                  </v-btn>
                  <v-btn color="success" @click="addNewItem" v-if="currentSource === 'supabase'">
                    ➕ Nouveau Item
                  </v-btn>
                  <v-btn color="warning" @click="openCategoryDialog" v-if="currentSource === 'supabase'">
                    🏷️ Nouvelle Catégorie
                  </v-btn>
                </div>
              </div>

              <v-alert v-if="currentSource === 'github'" type="info" class="mb-4">
                ℹ️ Mode GitHub: Pour modifier les items, utilisez le panel GitHub ou migrez vers Supabase.
              </v-alert>

              <v-data-table
                :headers="itemHeaders"
                :items="displayItems"
                item-key="id"
                class="modern-table"
                :items-per-page="15"
                :loading="refreshing"
              >
                <template v-slot:item.price="{ item }">
                  <v-chip color="success" size="small">💰 {{ item.price }}</v-chip>
                </template>

                <template v-slot:item.rarity="{ item }">
                  <v-chip :color="getCategoryColor(item.rarity)" size="small">
                    {{ getCategoryIcon(item.rarity) }} {{ item.rarity }}
                  </v-chip>
                </template>

                <template v-slot:item.actions="{ item }" v-if="currentSource === 'supabase'">
                  <div class="action-buttons">
                    <v-btn icon size="small" color="primary" @click="editItem(item)">
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon size="small" color="error" @click="deleteItem(item.id)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </div>
          </v-window-item>

          <!-- Tab Catégories -->
          <v-window-item value="categories">
            <div class="categories-container pa-6">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="minecraft-font">🏷️ Gestion des Catégories</h3>
                <v-btn color="success" @click="openCategoryDialog" v-if="currentSource === 'supabase'">
                  ➕ Nouvelle Catégorie
                </v-btn>
              </div>

              <v-row>
                <v-col v-for="category in categories" :key="category.id" cols="12" sm="6" md="4">
                  <v-card class="category-card">
                    <v-card-text class="text-center">
                      <v-chip :color="category.color" size="large" class="mb-3">
                        <span class="text-h6">{{ category.icon }}</span>
                        <span class="ml-2 font-weight-bold">{{ category.name }}</span>
                      </v-chip>
                      <div class="d-flex justify-center gap-2 mt-3">
                        <v-btn 
                          icon 
                          size="small" 
                          color="error" 
                          @click="deleteCategory(category.id, category.name)"
                          v-if="!isDefaultCategory(category.name)"
                        >
                          <v-icon>mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-window-item>

          <!-- Tab Statistiques -->
          <v-window-item value="stats">
            <div class="stats-container pa-6">
              <h3 class="minecraft-font mb-4">📈 Statistiques</h3>
              
              <div class="row">
                <div class="col-md-3">
                  <v-card class="stat-card">
                    <v-card-text class="text-center">
                      <v-icon size="40" color="primary" class="mb-2">mdi-package-variant</v-icon>
                      <h2 class="minecraft-font">{{ displayItems.length }}</h2>
                      <p>Total Items</p>
                    </v-card-text>
                  </v-card>
                </div>
                
                <div class="col-md-3">
                  <v-card class="stat-card">
                    <v-card-text class="text-center">
                      <v-icon size="40" color="warning" class="mb-2">mdi-tag</v-icon>
                      <h2 class="minecraft-font">{{ categories.length }}</h2>
                      <p>Catégories</p>
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
                      <v-icon size="40" color="info" class="mb-2">mdi-database</v-icon>
                      <h2 class="minecraft-font text-caption">{{ currentSource.toUpperCase() }}</h2>
                      <p>Source</p>
                    </v-card-text>
                  </v-card>
                </div>
              </div>

              <!-- Graphique des raretés -->
              <v-card class="mt-4">
                <v-card-title class="minecraft-font">📊 Répartition par Catégorie</v-card-title>
                <v-card-text>
                  <div v-for="(count, rarity) in rarityStats" :key="rarity" class="d-flex align-center mb-2">
                    <v-chip :color="getCategoryColor(rarity)" class="mr-3">
                      {{ getCategoryIcon(rarity) }} {{ rarity }}
                    </v-chip>
                    <v-progress-linear
                      :model-value="(count / displayItems.length) * 100"
                      :color="getCategoryColor(rarity)"
                      class="flex-grow-1"
                      height="20"
                    >
                      <span class="text-white font-weight-bold">{{ count }}</span>
                    </v-progress-linear>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Dialog d'édition d'item -->
    <v-dialog v-model="showEditDialog" max-width="600px">
      <v-card class="edit-dialog">
        <v-card-title class="minecraft-font">
          {{ editingItem ? '✏️ Modifier' : '➕ Nouveau' }} Item
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
              class="mb-3"
            >
              <template v-slot:selection="{ item }">
                <v-chip :color="getCategoryColor(item)" size="small">
                  {{ getCategoryIcon(item) }} {{ item }}
                </v-chip>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-chip :color="getCategoryColor(item.title)" size="x-small">
                      {{ getCategoryIcon(item.title) }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
            <v-text-field
              v-model="editForm.image"
              label="URL de l'image (optionnel)"
              variant="outlined"
              placeholder="https://example.com/image.png"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" @click="cancelEdit">Annuler</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="saveEdit" :loading="saving">
            {{ editingItem ? 'Modifier' : 'Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog de création de catégorie -->
    <v-dialog v-model="showCategoryDialog" max-width="500px">
      <v-card class="category-dialog">
        <v-card-title class="minecraft-font">
          🏷️ {{ editingCategory ? 'Modifier' : 'Nouvelle' }} Catégorie
        </v-card-title>
        <v-card-text>
          <v-form ref="categoryForm">
            <v-text-field
              v-model="categoryForm.name"
              label="Nom de la catégorie"
              variant="outlined"
              class="mb-3"
              required
              placeholder="Ex: Outils magiques"
            ></v-text-field>
            
            <v-select
              v-model="categoryForm.color"
              :items="colorOptions"
              label="Couleur"
              variant="outlined"
              class="mb-3"
            >
              <template v-slot:selection="{ item }">
                <v-chip :color="item.value" size="small" class="mr-2">
                  {{ item.title }}
                </v-chip>
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-chip :color="item.value" size="x-small"></v-chip>
                  </template>
                </v-list-item>
              </template>
            </v-select>
            
            <v-select
              v-model="categoryForm.icon"
              :items="iconOptions"
              label="Icône"
              variant="outlined"
              class="mb-3"
            >
              <template v-slot:selection="{ item }">
                <span class="text-h6 mr-2">{{ item }}</span>{{ item }}
              </template>
              <template v-slot:item="{ item, props }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <span class="text-h6">{{ item }}</span>
                  </template>
                  <v-list-item-title>{{ item }}</v-list-item-title>
                </v-list-item>
              </template>
            </v-select>
            
            <!-- Aperçu -->
            <v-card class="mt-4 pa-3" variant="outlined">
              <div class="text-center">
                <strong>Aperçu :</strong>
                <v-chip :color="categoryForm.color" class="ml-2">
                  {{ categoryForm.icon }} {{ categoryForm.name }}
                </v-chip>
              </div>
            </v-card>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" @click="cancelCategoryCreation">Annuler</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="createCategory" :loading="saving">
            {{ editingCategory ? '✏️ Modifier' : '✅ Créer' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import { itemsService, categoriesService } from '../services/database.js'

export default {
  name: 'ModernAdminPanel',
  props: {
    modelValue: Boolean,
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'close', 'switch-to-supabase', 'refresh-items', 'categories-updated'],
  
  data() {
    return {
      activeTab: 'migration',
      
      // États de chargement
      loadingFromGitHub: false,
      migrating: false,
      refreshing: false,
      saving: false,
      
      // États de migration
      githubItems: [],
      migrationDone: false,
      supabaseConnected: false,
      
      // Items pour affichage
      supabaseItems: [],
      
      // Catégories - PLUS DE VALEURS HARDCODÉES
      categories: [],
      showCategoryDialog: false,
      editingCategory: null,
      categoryForm: {
        name: '',
        color: 'grey',
        icon: '⚪'
      },
      
      // Édition d'items
      showEditDialog: false,
      editingItem: null,
      editForm: {
        name: '',
        description: '',
        price: 0,
        rarity: '',
        image: ''
      },
      
      itemHeaders: [
        { title: 'ID', key: 'id', width: '80px' },
        { title: 'Nom', key: 'name' },
        { title: 'Description', key: 'description' },
        { title: 'Prix', key: 'price', width: '120px' },
        { title: 'Catégorie', key: 'rarity', width: '150px' },
        { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
      ],
      
      rarityOptions: [], // Chargé depuis la BDD
      
      // Options pour les couleurs et icônes
      colorOptions: [
        { title: 'Gris', value: 'grey' },
        { title: 'Vert', value: 'green' },
        { title: 'Bleu', value: 'blue' },
        { title: 'Violet', value: 'purple' },
        { title: 'Orange', value: 'orange' },
        { title: 'Rouge', value: 'red' },
        { title: 'Cyan', value: 'cyan' },
        { title: 'Lime', value: 'lime' },
        { title: 'Rose', value: 'pink' },
        { title: 'Marron', value: 'brown' },
        { title: 'Indigo', value: 'indigo' },
        { title: 'Jaune', value: 'yellow' }
      ],
      
      iconOptions: [
        '⚪', '🟢', '🔵', '🟣', '🟠', '🔴', '🟡', '⚫',
        '🧪', '⛏️', '📚', '🚀', '⭐', '💎', '🔥', '❄️',
        '🎯', '🗡️', '🏹', '🛡️', '💊', '🔮', '🎭', '🎪'
      ]
    }
  },
  
  computed: {
    show: {
      get() { return this.modelValue },
      set(value) { this.$emit('update:modelValue', value) }
    },
    
    currentSource() {
      return localStorage.getItem('use-supabase') === 'true' ? 'supabase' : 'github'
    },
    
    displayItems() {
      return this.currentSource === 'supabase' ? this.supabaseItems : this.items
    },
    
    averagePrice() {
      if (this.displayItems.length === 0) return 0
      const total = this.displayItems.reduce((sum, item) => sum + (item.price || 0), 0)
      return Math.round(total / this.displayItems.length)
    },
    
    mostExpensiveItem() {
      return this.displayItems.reduce((max, item) => 
        (item.price || 0) > (max?.price || 0) ? item : max, null)
    },
    
    rarityStats() {
      const stats = {}
      this.displayItems.forEach(item => {
        stats[item.rarity] = (stats[item.rarity] || 0) + 1
      })
      return stats
    }
  },
  
  async mounted() {
    await this.checkSupabaseConnection()
    await this.loadCategories()
    if (this.currentSource === 'supabase') {
      await this.loadSupabaseItems()
    }
  },
  
  methods: {
    async checkSupabaseConnection() {
      try {
        await itemsService.getAll()
        this.supabaseConnected = true
      } catch (error) {
        this.supabaseConnected = false
      }
    },
    
    // Gestion des catégories - TOUT DEPUIS LA BDD
    async loadCategories() {
      try {
        this.categories = await categoriesService.getAll()
        this.rarityOptions = this.categories.map(cat => cat.name)
        console.log(`✅ ${this.categories.length} catégories chargées depuis Supabase`)
      } catch (error) {
        console.error('Erreur chargement catégories:', error)
        this.categories = []
        this.rarityOptions = []
      }
    },
    
    getCategoryColor(categoryName) {
      const category = this.categories.find(cat => cat.name === categoryName)
      return category ? category.color : 'grey'
    },
    
    getCategoryIcon(categoryName) {
      const category = this.categories.find(cat => cat.name === categoryName)
      return category ? category.icon : '⚪'
    },
    
    openCategoryDialog() {
      this.editingCategory = null
      this.categoryForm = {
        name: '',
        color: 'grey',
        icon: '⚪'
      }
      this.showCategoryDialog = true
    },
    
    cancelCategoryCreation() {
      this.showCategoryDialog = false
    },
    
    async createCategory() {
      if (!this.categoryForm.name.trim()) {
        alert('⚠️ Le nom de la catégorie est requis!')
        return
      }
      
      this.saving = true
      try {
        if (this.editingCategory) {
          await categoriesService.update(this.editingCategory.id, this.categoryForm)
          alert(`✏️ Catégorie "${this.categoryForm.name}" modifiée!`)
        } else {
          await categoriesService.create(this.categoryForm)
          alert(`✅ Catégorie "${this.categoryForm.name}" créée!`)
        }
        
        await this.loadCategories()
        this.$emit('categories-updated')
        this.showCategoryDialog = false
      } catch (error) {
        if (error.message.includes('duplicate')) {
          alert('❌ Une catégorie avec ce nom existe déjà!')
        } else {
          alert('❌ Erreur: ' + error.message)
        }
      } finally {
        this.saving = false
      }
    },
    
    async deleteCategory(id, name) {
      if (!confirm(`Supprimer la catégorie "${name}" ?\n\nAttention: Les items de cette catégorie devront être recatégorisés.`)) return
      
      try {
        await categoriesService.delete(id)
        alert(`🗑️ Catégorie "${name}" supprimée!`)
        await this.loadCategories()
        this.$emit('categories-updated')
      } catch (error) {
        alert('❌ Erreur suppression: ' + error.message)
      }
    },
    
    isDefaultCategory(name) {
      const defaultCategories = ['Refill', 'Machines', 'Solaire', 'Circuits', 'Rouages', 'Edora']
      return defaultCategories.includes(name)
    },
    
    // Migration depuis GitHub
    async loadFromGitHub() {
      this.loadingFromGitHub = true
      try {
        const response = await fetch('https://raw.githubusercontent.com/matthieuschoen/limeazone-data/main/items.json')
        this.githubItems = await response.json()
        alert(`✅ ${this.githubItems.length} items chargés depuis GitHub`)
      } catch (error) {
        alert('❌ Erreur chargement GitHub: ' + error.message)
      } finally {
        this.loadingFromGitHub = false
      }
    },
    
    async migrateToSupabase() {
      if (!confirm(`Migrer ${this.githubItems.length} items vers Supabase ?`)) return
      
      this.migrating = true
      try {
        await itemsService.migrateFromJson(this.githubItems)
        alert(`✅ Migration réussie! ${this.githubItems.length} items ajoutés à Supabase`)
        this.migrationDone = true
        this.supabaseConnected = true
        await this.loadSupabaseItems()
      } catch (error) {
        alert('❌ Erreur migration: ' + error.message)
      } finally {
        this.migrating = false
      }
    },
    
    switchToSupabase() {
      if (confirm('Basculer vers Supabase ? Votre site utilisera la base de données.')) {
        localStorage.setItem('use-supabase', 'true')
        this.$emit('switch-to-supabase')
        alert('✅ Votre site utilise maintenant Supabase!')
      }
    },
    
    async loadSupabaseItems() {
      try {
        this.supabaseItems = await itemsService.getAll()
      } catch (error) {
        console.error('Erreur chargement Supabase:', error)
      }
    },
    
    async refreshItems() {
      this.refreshing = true
      try {
        if (this.currentSource === 'supabase') {
          await this.loadSupabaseItems()
        }
        this.$emit('refresh-items')
      } finally {
        this.refreshing = false
      }
    },
    
    // CRUD Operations
    addNewItem() {
      this.editingItem = null
      this.editForm = {
        name: '',
        description: '',
        price: 0,
        rarity: this.rarityOptions[0] || '',
        image: ''
      }
      this.showEditDialog = true
    },
    
    editItem(item) {
      this.editingItem = item
      this.editForm = { ...item }
      this.showEditDialog = true
    },
    
    async saveEdit() {
      this.saving = true
      try {
        if (this.editingItem) {
          await itemsService.update(this.editingItem.id, this.editForm)
          alert('✏️ Item modifié!')
        } else {
          await itemsService.create(this.editForm)
          alert('➕ Item créé!')
        }
        
        this.showEditDialog = false
        await this.loadSupabaseItems()
        this.$emit('refresh-items')
      } catch (error) {
        alert('❌ Erreur: ' + error.message)
      } finally {
        this.saving = false
      }
    },
    
    cancelEdit() {
      this.showEditDialog = false
    },
    
    async deleteItem(id) {
      if (!confirm('Supprimer cet item ?')) return
      
      try {
        await itemsService.delete(id)
        alert('🗑️ Item supprimé!')
        await this.loadSupabaseItems()
        this.$emit('refresh-items')
      } catch (error) {
        alert('❌ Erreur: ' + error.message)
      }
    },
    
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
/* Styles existants */
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

.admin-tabs {
  background: rgba(255, 215, 0, 0.05);
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

.admin-tabs .v-tab {
  color: #FFD700 !important;
}

.panel-content {
  background: transparent;
  color: #ffffff;
  max-height: calc(95vh - 140px);
  overflow-y: auto;
}

.step-card,
.stat-card,
.category-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 2px solid rgba(255, 215, 0, 0.3) !important;
  border-radius: 12px;
}

.step-card[disabled] {
  opacity: 0.6;
}

.stat-card,
.category-card {
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover,
.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.2);
}

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

.edit-dialog,
.category-dialog {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 12px;
}

.minecraft-font {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px !important;
}

@media (max-width: 768px) {
  .modern-admin-panel {
    margin: 8px;
    max-width: calc(100vw - 16px);
  }
}
</style>