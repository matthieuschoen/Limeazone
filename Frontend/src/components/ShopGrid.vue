<!-- src/components/ShopGrid.vue -->
<template>
  <v-container fluid>
    <!-- Hero Section -->
    <v-row class="hero-section">
      <v-col cols="12">
        <div class="hero-content">
          <!-- Logo/Titre principal -->
          <div class="title-container">
            <div class="title-glow">
              <h1 class="main-title">
                <span class="title-icon">⛏️</span>
                NationsGlory Lime Shop
                <span class="title-icon">⛏️</span>
              </h1>
            </div>

            <!-- Slogan avec animation -->
            <div class="slogan-container">
              <p class="slogan-text">
                ✨ Découvrez nos meilleurs items pour votre aventure ! ✨
              </p>
              <div class="slogan-underline"></div>
            </div>

            <!-- Boutons d'action -->
            <div class="action-buttons">
              <v-btn v-if="isAdmin" color="warning" @click="openAdminPanel" class="minecraft-font admin-btn"
                prepend-icon="mdi-cog" size="large">
                Admin Panel
              </v-btn>

              <!-- Stats du shop -->
              <div class="shop-stats">
                <v-chip color="primary" class="stat-chip">
                  📦 {{ items.length }} Items
                </v-chip>
                <v-chip color="success" class="stat-chip">
                  🔥 Top Qualité
                </v-chip>
                <v-chip color="info" class="stat-chip">
                  ⚡ Livraison Rapide
                </v-chip>
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Sidebar de filtrage -->
      <v-col cols="12" md="3" lg="2">
        <v-card class="filter-card" elevation="4">
          <v-card-title class="minecraft-font text-center">
            🔍 Filtres
          </v-card-title>

          <v-card-text>
            <!-- Recherche par nom -->
            <v-text-field v-model="searchQuery" label="Rechercher un item" prepend-inner-icon="mdi-magnify"
              variant="outlined" density="compact" clearable class="mb-4"></v-text-field>

            <!-- Filtre par rareté -->
            <v-divider class="mb-3"></v-divider>
            <h4 class="minecraft-font mb-3">✨ Catégorie</h4>

            <v-chip-group v-model="selectedRarity" column multiple>
              <v-chip v-for="rarity in rarityFilters" :key="rarity.value" :color="rarity.color" variant="outlined"
                filter size="small" class="mb-1">
                {{ rarity.icon }} {{ rarity.label }}
              </v-chip>
            </v-chip-group>

            <!-- Filtre par prix -->
            <v-divider class="my-3"></v-divider>
            <h4 class="minecraft-font mb-3">💰 Prix</h4>

            <v-range-slider v-model="priceRange" :min="minPrice" :max="maxPrice" :step="5" thumb-label="always"
              color="primary" class="mb-2"></v-range-slider>

            <div class="d-flex justify-space-between text-caption">
              <span>{{ priceRange[0] }} coins</span>
              <span>{{ priceRange[1] }} coins</span>
            </div>

            <!-- Bouton reset -->
            <v-btn color="grey" variant="outlined" block size="small" @click="resetFilters" class="mt-4">
              🔄 Reset Filtres
            </v-btn>

            <!-- Statistiques -->
            <v-divider class="my-3"></v-divider>
            <div class="text-center">
              <v-chip color="info" size="small">
                {{ filteredItems.length }} / {{ items.length }} items
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Grille des items -->
      <v-col cols="12" md="9" lg="10">
        <v-row>
          <v-col v-for="item in filteredItems" :key="item.id" cols="12" sm="6" md="4" xl="3">
            <ItemCard :item="item" @add-to-cart="$emit('add-to-cart', $event)" />
          </v-col>

          <!-- Message si aucun résultat -->
          <v-col v-if="filteredItems.length === 0" cols="12">
            <v-card class="no-results-card text-center pa-8" elevation="4">
              <div class="no-results-content">
                <v-icon size="80" class="no-results-icon mb-4">mdi-package-variant-closed</v-icon>
                <h3 class="no-results-title minecraft-font mb-4">Aucun item trouvé</h3>
                <p class="no-results-subtitle text-body-1 mb-6">
                  Aucun produit ne correspond à vos critères de recherche.<br>
                  Essayez de modifier vos filtres pour voir plus d'articles.
                </p>
                <v-btn color="primary" variant="elevated" @click="resetFilters" class="reset-btn minecraft-font"
                  prepend-icon="mdi-refresh">
                  🔄 Réinitialiser les filtres
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <AdminPanel v-model="showAdmin" :items="items" @close="showAdmin = false" @add-item="addItem" @edit-item="editItem"
      @delete-item="deleteItem" />
  </v-container>
</template>

<script>
import ItemCard from './ItemCard.vue'
import AdminPanel from './CadrePanel.vue'
import ModernAdminPanel from './ModernAdminPanel.vue'

export default {
  name: 'ShopGrid',
  components: {
    ItemCard,
    AdminPanel: ModernAdminPanel // Utiliser le nouveau panneau moderne
  },
  emits: ['add-to-cart'],
  data() {
    return {
      showAdmin: false,
      isAdmin: false,
      adminkey: 'RenforcedConcretewithLime',
      items: [],

      // Filtres
      searchQuery: '',
      selectedRarity: [],
      priceRange: [0, 1000],

      // Options de rareté
      rarityFilters: [
        { label: 'Refill', value: 'Refill', color: 'grey', icon: '⚪' },
        { label: 'Machines', value: 'Machines', color: 'green', icon: '🟢' },
        { label: 'Solaire', value: 'Solaire', color: 'blue', icon: '🔵' },
        { label: 'Circuits', value: 'Circuits', color: 'purple', icon: '🟣' },
        { label: 'Rouages', value: 'Rouages', color: 'orange', icon: '🟠' },
        { label: 'Edora', value: 'Edora', color: 'red', icon: '🔴' },
        { label: 'Autres', value: 'Autres', color: 'cyan', icon: '🔵' },
        { label: 'Consommables', value: 'Consommables', color: 'lime', icon: '🟢' },
        { label: 'Alchimie', value: 'Alchimie', color: 'pink', icon: '🧪' },        // ← Nouveau
        { label: 'Minerais', value: 'Minerais', color: 'brown', icon: '⛏️' },      // ← Nouveau
        { label: 'Livres', value: 'Livres', color: 'indigo', icon: '📚' },         // ← Nouveau
        { label: 'Missiles', value: 'Missiles', color: 'deep-orange', icon: '🚀' }  // ← Nouveau
      ]
    }
  },
  computed: {
    // Items filtrés
    filteredItems() {
      let filtered = this.items

      // Filtre par recherche textuelle
      if (this.searchQuery) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }

      // Filtre par rareté
      if (this.selectedRarity.length > 0) {
        const selectedRarityValues = this.selectedRarity.map(index =>
          this.rarityFilters[index].value
        )
        filtered = filtered.filter(item =>
          selectedRarityValues.includes(item.rarity)
        )
      }

      // Filtre par prix
      filtered = filtered.filter(item =>
        item.price >= this.priceRange[0] && item.price <= this.priceRange[1]
      )

      return filtered
    },

    // Prix min/max pour le slider
    minPrice() {
      if (this.items.length === 0) return 0
      return Math.min(...this.items.map(item => item.price))
    },
    maxPrice() {
      if (this.items.length === 0) return 1000
      return Math.max(...this.items.map(item => item.price))
    }
  },
  watch: {
    // Ajuster le slider quand les items changent
    items: {
      handler() {
        this.priceRange = [this.minPrice, this.maxPrice]
      },
      immediate: true
    }
  },
  async mounted() {
    await this.loadItems()
    this.checkAdminAccess()
  },
  methods: {
    resetFilters() {
      this.searchQuery = ''
      this.selectedRarity = []
      this.priceRange = [this.minPrice, this.maxPrice]
    },

    async loadItems() {
      try {
        const response = await fetch('https://raw.githubusercontent.com/matthieuschoen/limeazone-data/main/items.json')
        const publicItems = await response.json()
        const localItems = JSON.parse(localStorage.getItem('minecraft-shop-items') || '[]')
        this.items = this.mergeItems(publicItems, localItems)
      } catch (error) {
        console.error('Erreur chargement items:', error)
        this.loadItemsFromLocal()
      }
    },

    loadItemsFromLocal() {
      const saved = localStorage.getItem('minecraft-shop-items')
      if (saved) {
        this.items = JSON.parse(saved)
      } else {
        this.items = []
      }
    },

    mergeItems(publicItems, localItems) {
      const merged = [...publicItems]

      localItems.forEach(localItem => {
        const existingIndex = merged.findIndex(item => item.id === localItem.id)
        if (existingIndex >= 0) {
          merged[existingIndex] = localItem
        } else {
          merged.push(localItem)
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

      const a = document.createElement('a')
      a.href = url
      a.download = 'items.json'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

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
    },
    openAdminPanel() {
      if (!this.isAdmin) {
        alert('🔒 Accès refusé ! Vous n\'avez pas les permissions administrateur.')
        return
      }
      this.showAdmin = true
    }
  }
}

</script>

<style scoped>
/* Hero Section allégée et centrée */
.hero-section {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border-radius: 15px;
  margin-bottom: 30px;
  padding: 30px 20px;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.title-container {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.title-glow {
  position: relative;
  margin-bottom: 25px;
  text-align: center;
}

/* Titre principal centré - VRAIMENT AGRANDI */
.main-title {
  font-family: 'Press Start 2P', cursive !important;
  font-size: clamp(2rem, 6vw, 2rem) !important;
  color: #FFD700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
  margin: 0 auto;
  line-height: 1.3 !important;
  transition: all 0.3s ease;
  text-align: center;
  display: block;
  font-weight: normal !important;
}

.main-title:hover {
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: scale(1.02);
}

.title-icon {
  display: inline-block;
  animation: gentle-bounce 4s ease-in-out infinite;
  margin: 0 8px;
}

/* Slogan centré */
.slogan-container {
  position: relative;
  margin: 25px auto 30px;
  text-align: center;
}

.slogan-text {
  font-size: clamp(1.2rem, 3vw, 1.8rem) !important;
  color: #FFD700;
  font-weight: 500;
  margin: 0 auto;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
  text-align: center;
  max-width: 600px;
}

.slogan-underline {
  width: 150px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
  margin: 10px auto 0;
  border-radius: 1px;
  animation: subtle-expand 4s ease-in-out infinite;
}

/* Boutons d'action centrés */
.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
  text-align: center;
}

.admin-btn {
  background: rgba(255, 140, 0, 0.15) !important;
  color: #FFD700 !important;
  border: 2px solid rgba(255, 215, 0, 0.6) !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease;
  margin: 0 auto;
}

.admin-btn:hover {
  background: rgba(255, 215, 0, 0.2) !important;
  border-color: #FFD700 !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3) !important;
}

/* Stats chips centrées */
.shop-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.stat-chip {
  font-family: 'Press Start 2P', cursive;
  font-size: 9px !important;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(5px);
  animation: subtle-float 4s ease-in-out infinite;
  margin: 0 auto;
}

.stat-chip:nth-child(1) {
  animation-delay: 0s;
}

.stat-chip:nth-child(2) {
  animation-delay: 0.5s;
}

.stat-chip:nth-child(3) {
  animation-delay: 1s;
}

/* Sidebar allégée et AÉRÉE */
.filter-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 15px;
  position: sticky;
  top: 20px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  padding: 8px;
}

.filter-card:hover {
  border-color: #FFD700;
  box-shadow: 0 6px 25px rgba(255, 215, 0, 0.2);
}

.filter-card .v-card-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  padding: 20px 16px 16px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 16px !important;
}

.filter-card .v-card-text {
  color: #ffffff;
  padding: 0 20px 20px;
}

.filter-card h4 {
  color: #FFD700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
  text-align: center;
  margin: 25px 0 15px;
  font-size: 14px !important;
  padding: 10px 0;
}

/* Champ de recherche plus aéré */
.filter-card .v-text-field {
  background: rgba(255, 215, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 25px !important;
}

.filter-card .v-text-field .v-field {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  padding: 8px 12px;
  min-height: 50px;
}

.filter-card .v-text-field .v-field:hover {
  border-color: rgba(255, 215, 0, 0.6) !important;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.2) !important;
}

/* Chips plus espacés */
.filter-card .v-chip-group {
  margin: 0 -4px;
}

.filter-card .v-chip {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
  transition: all 0.3s ease;
  margin: 4px 4px 8px;
  padding: 8px 12px;
  min-height: 36px;
}

.filter-card .v-chip:hover {
  background: rgba(255, 215, 0, 0.15) !important;
  border-color: rgba(255, 215, 0, 0.6) !important;
  transform: scale(1.02);
}

.filter-card .v-chip--selected {
  background: rgba(255, 215, 0, 0.2) !important;
  border-color: #FFD700 !important;
  color: #FFD700 !important;
  font-weight: bold;
}

/* Slider plus aéré */
.filter-card .v-range-slider {
  color: #FFD700;
  margin: 20px 0;
  padding: 0 8px;
}

.filter-card .v-range-slider .v-slider-track__fill {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.6), rgba(255, 165, 0, 0.8));
}

.filter-card .v-range-slider .v-slider-thumb {
  background: #FFD700;
  border: 1px solid rgba(255, 165, 0, 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  width: 20px;
  height: 20px;
}

/* Affichage des prix plus aéré */
.filter-card .d-flex.justify-space-between {
  margin-top: 15px;
  padding: 0 8px;
  font-size: 13px;
}

/* Bouton reset plus aéré */
.filter-card .v-btn {
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.05) !important;
  transition: all 0.3s ease;
  margin: 20px 0 10px;
  padding: 12px 16px;
  min-height: 45px;
  border-radius: 8px;
}

.filter-card .v-btn:hover {
  background: rgba(255, 215, 0, 0.1) !important;
  border-color: rgba(255, 215, 0, 0.6) !important;
  transform: translateY(-1px);
}

/* Dividers plus espacés */
.filter-card .v-divider {
  border-color: #FFD700;
  opacity: 0.6;
  margin: 20px 0;
}

/* Stats en bas plus aérées */
.filter-card .text-center:last-child {
  padding: 20px 0;
}

.filter-card .v-chip[color="info"] {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: bold;
}

/* Message aucun résultat harmonisé */
.no-results-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 2px solid rgba(255, 215, 0, 0.4);
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
}

.no-results-card:hover {
  border-color: rgba(255, 215, 0, 0.6);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.2);
}

.no-results-content {
  max-width: 500px;
  margin: 0 auto;
}

.no-results-icon {
  color: rgba(255, 215, 0, 0.6);
  animation: gentle-pulse 2s ease-in-out infinite;
}

.no-results-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  font-size: 18px !important;
}

.no-results-subtitle {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
}

.reset-btn {
  background: linear-gradient(45deg, #FFD700, #FFA500) !important;
  color: #1a1a1a !important;
  border: 2px solid #FFD700 !important;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3) !important;
  transition: all 0.3s ease !important;
}

.reset-btn:hover {
  background: linear-gradient(45deg, #FFA500, #FFD700) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4) !important;
}

/* Animations allégées */
@keyframes gentle-bounce {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-5px) rotate(3deg);
  }
}

@keyframes subtle-expand {

  0%,
  100% {
    width: 150px;
    opacity: 0.6;
  }

  50% {
    width: 180px;
    opacity: 1;
  }
}

@keyframes subtle-float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-3px);
  }
}

@keyframes gentle-pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.6;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

/* Scrollbar discrète */
.filter-card::-webkit-scrollbar {
  width: 6px;
}

.filter-card::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.filter-card::-webkit-scrollbar-thumb {
  background: rgba(255, 215, 0, 0.6);
  border-radius: 3px;
}

.filter-card::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 215, 0, 0.8);
}

.minecraft-font {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px !important;
}

/* Responsive - maintenir le centrage et l'aération */
@media (max-width: 768px) {
  .hero-section {
    padding: 20px 15px;
    margin-bottom: 20px;
    text-align: center;
  }

  .main-title {
    font-size: clamp(2rem, 5vw, 3rem) !important;
  }

  .slogan-text {
    font-size: clamp(1rem, 2.5vw, 1.4rem) !important;
  }

  .action-buttons {
    gap: 15px;
    align-items: center;
  }

  .shop-stats {
    gap: 10px;
    justify-content: center;
  }

  .stat-chip {
    font-size: 8px !important;
    padding: 6px 12px;
  }

  .filter-card {
    border-width: 2px;
    border-radius: 10px;
    padding: 6px;
  }

  .filter-card .v-card-text {
    padding: 0 16px 16px;
  }

  .filter-card h4 {
    margin: 20px 0 12px;
  }

  .title-container {
    max-width: 100%;
    text-align: center;
  }

  .minecraft-font {
    font-size: 12px !important;
  }
}

@media (max-width: 480px) {
  .main-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem) !important;
  }

  .slogan-text {
    text-align: center;
    padding: 0 10px;
    font-size: clamp(0.9rem, 2vw, 1.2rem) !important;
  }

  .action-buttons {
    align-items: center;
  }
}
</style>