<!-- src/components/ShopGrid.vue -->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="minecraft-font text-center mb-2 text-primary">
              ⛏️ MINECRAFT ITEMS SHOP ⛏️
            </h1>
            <p class="text-center text-h6 mb-4" style="color: orange !important;">
              Découvrez nos meilleurs items pour votre aventure !
            </p>
          </div>
          <v-btn
            v-if="isAdmin"
            color="warning"
            @click="showAdmin = true"
            class="minecraft-font"
            prepend-icon="mdi-cog"
          >
            Admin Panel
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="item in items"
        :key="item.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <ItemCard 
          :item="item"
          @add-to-cart="$emit('add-to-cart', $event)"
        />
      </v-col>
    </v-row>

    <AdminPanel
      v-model="showAdmin"
      :items="items"
      @close="showAdmin = false"
      @add-item="addItem"
      @edit-item="editItem"
      @delete-item="deleteItem"
    />
  </v-container>
</template>

<script>
import ItemCard from './ItemCard.vue'
import AdminPanel from './CadrePanel.vue'

export default {
  name: 'ShopGrid',
  components: {
    ItemCard,
    AdminPanel
  },
  emits: ['add-to-cart'],
  data() {
    return {
      showAdmin: false,
      isAdmin: false,
      adminkey: 'RenforcedConcretewithLime',
      items: []
    }
  },
  async mounted() {
    await this.loadItems()
    this.checkAdminAccess()
  },
  methods: {
    async loadItems() {
      try {
        // Charger depuis le fichier public
        const response = await fetch('/items.json')
        const publicItems = await response.json()
        
        // Merger avec les items locaux (modifications temporaires)
        const localItems = JSON.parse(localStorage.getItem('minecraft-shop-items') || '[]')
        
        // Les items locaux écrasent les publics (même ID)
        this.items = this.mergeItems(publicItems, localItems)
      } catch (error) {
        console.error('Erreur chargement items:', error)
        this.loadItemsFromLocal() // Fallback
      }
    },

    loadItemsFromLocal() {
      const saved = localStorage.getItem('minecraft-shop-items')
      if (saved) {
        this.items = JSON.parse(saved)
      } else {
        // Items par défaut si aucune sauvegarde
        this.items = []
      }
    },
    
    mergeItems(publicItems, localItems) {
      const merged = [...publicItems]
      
      localItems.forEach(localItem => {
        const existingIndex = merged.findIndex(item => item.id === localItem.id)
        if (existingIndex >= 0) {
          merged[existingIndex] = localItem // Écraser
        } else {
          merged.push(localItem) // Ajouter nouveau
        }
      })
      
      return merged
    },
    
    addItem(item) {
      this.items.push(item)
      this.saveItems()
      this.generateNewItemsFile()
    },
    
    editItem(updatedItem) {
      const index = this.items.findIndex(item => item.id === updatedItem.id)
      if (index !== -1) {
        this.items[index] = updatedItem
        this.saveItems()
        this.generateNewItemsFile()
      }
    },
    
    deleteItem(id) {
      this.items = this.items.filter(item => item.id !== id)
      this.saveItems()
      this.generateNewItemsFile()
    },
    
    saveItems() {
      localStorage.setItem('minecraft-shop-items', JSON.stringify(this.items))
    },
    
    generateNewItemsFile() {
      const data = JSON.stringify(this.items, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Créer un lien de téléchargement automatique
      const a = document.createElement('a')
      a.href = url
      a.download = 'items.json'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Notification
      alert('📁 Nouveau fichier items.json généré ! Remplacez le fichier dans public/items.json et redéployez.')
    },
    
    checkAdminAccess() {
      const urlParams = new URLSearchParams(window.location.search)
      const adminParam = urlParams.get('Concrete')
      
      if (adminParam === this.adminkey) {
        this.isAdmin = true
        sessionStorage.setItem('adminAccess', 'true')
      } else {
        this.isAdmin = sessionStorage.getItem('adminAccess') === 'true'
      }
    }
  }
}
</script>