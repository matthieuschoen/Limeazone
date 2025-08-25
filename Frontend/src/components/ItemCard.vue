<template>
  <v-card class="minecraft-card" elevation="8" hover @click="addToCart">
    <div class="card-header">
      <v-chip v-if="item.rarity" :color="getRarityColor(item.rarity)" class="rarity-chip" size="small">
        {{ getRarityIcon(item.rarity) }} {{ item.rarity.toUpperCase() }}
      </v-chip>
    </div>

    <v-img :src="item.image || defaultImage" height="180" contain class="item-image">
    </v-img>

    <v-card-title class="item-title minecraft-font text-center">
      {{ item.name }}
    </v-card-title>

    <v-card-text class="item-content">
      <div class="item-description text-body-2 mb-3">
        {{ item.description }}
      </div>

      <div class="d-flex justify-center">
        <v-chip color="accent" class="price-chip minecraft-font" size="large">
          💰 {{ item.price }} $/u
        </v-chip>
      </div>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-btn color="success" variant="elevated" block size="large" @click="addToCart" class="add-btn minecraft-font">
        🛒 AJOUTER AU PANIER
      </v-btn>
    </v-card-actions>
  </v-card>

  <!-- Dialog de sélection de quantité harmonisé -->
  <v-dialog v-model="showQuantityDialog" max-width="450">
    <v-card class="quantity-dialog">
      <div class="dialog-header">
        <v-card-title class="dialog-title minecraft-font text-center">
          🛒 Choisir la quantité
        </v-card-title>
      </div>

      <v-card-text class="dialog-content text-center pa-6">
        <div class="item-preview mb-4">
          <v-img :src="item.image || defaultImage" height="80" width="80" class="preview-image mx-auto mb-2"></v-img>
          <div class="preview-name minecraft-font">{{ item.name }}</div>
          <div class="preview-price">💰 {{ item.price }} coins chacun</div>
        </div>

        <v-text-field v-model.number="selectedQuantity" label="Quantité" type="number" min="1" max="99"
          variant="outlined" class="quantity-field mx-auto" hide-details @keyup.enter="confirmAddToCart"
          @keyup.escape="cancelQuantity"></v-text-field>

        <div class="total-preview mt-4 text-h6">
          <span class="total-label">Total: </span>
          <span class="total-amount">💰 {{ item.price * selectedQuantity }} coins</span>
        </div>
      </v-card-text>

      <v-card-actions class="dialog-actions pa-4">
        <v-btn color="grey" variant="outlined" @click="cancelQuantity" class="cancel-btn">
          Annuler
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="success" variant="elevated" @click="confirmAddToCart" class="confirm-btn minecraft-font">
          ✅ Confirmer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ItemCard',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  emits: ['add-to-cart'],
  data() {
    return {
      showQuantityDialog: false,
      selectedQuantity: 1
    }
  },
  computed: {
    defaultImage() {
      return 'https://via.placeholder.com/200x200/8B4513/FFFFFF?text=Minecraft+Item'
    }
  },
  methods: {
    getRarityColor(rarity) {
      const colors = {
        Refill: 'grey',
        Machines: 'green',
        Solaire: 'blue',
        Circuits: 'purple',
        Rouages: 'orange',
        Edora: 'red',
        Autres: 'cyan',
        Consommables: 'lime',
        Alchimie: 'pink',        // ← Nouveau
        Minerais: 'brown',       // ← Nouveau
        Livres: 'indigo',        // ← Nouveau
        Missiles: 'deep-orange'  // ← Nouveau
      }
      return colors[rarity?.toLowerCase()] || 'grey'
    },
    getRarityIcon(rarity) {
      const icons = {
        Refill: '🔄',
        Machines: '🏭',
        Solaire: '☀️',
        Circuits: '🔌',
        Rouages: '⚙️',
        Edora: '🌍',
        Autres: '❓',
        Consommables: '🍔'
      }
      return icons[rarity?.toLowerCase()] || '⚪'
    },
    addToCart() {
      this.showQuantityDialog = true
    },
    confirmAddToCart() {
      this.$emit('add-to-cart', {
        item: this.item,
        quantity: this.selectedQuantity
      })
      this.showQuantityDialog = false
      this.selectedQuantity = 1
    },
    cancelQuantity() {
      this.showQuantityDialog = false
      this.selectedQuantity = 1
    }
  }
}
</script>

<style scoped>
/* Carte principale harmonisée */
.minecraft-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 2px solid rgba(255, 215, 0, 0.6);
  border-radius: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.minecraft-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 35px rgba(255, 215, 0, 0.3);
  border-color: #FFD700;
}

.card-header {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
}

.rarity-chip {
  font-weight: bold;
  font-size: 10px !important;
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid currentColor !important;
}

.item-image {
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
  padding: 15px;
}

.item-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  background: rgba(255, 215, 0, 0.05);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding: 16px;
}

.item-content {
  color: #ffffff;
  padding: 16px;
}

.item-description {
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  line-height: 1.4;
}

.price-chip {
  background: linear-gradient(45deg, #FFD700, #FFA500) !important;
  color: #1a1a1a !important;
  border: 2px solid #FFD700 !important;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
  font-weight: bold;
}

.add-btn {
  background: linear-gradient(45deg, #32CD32, #28a745) !important;
  color: #ffffff !important;
  border: 2px solid #32CD32 !important;
  box-shadow: 0 4px 15px rgba(50, 205, 50, 0.3) !important;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: linear-gradient(45deg, #28a745, #32CD32) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(50, 205, 50, 0.4) !important;
}

/* Dialog de quantité harmonisé */
.quantity-dialog {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 3px solid rgba(255, 215, 0, 0.6);
  border-radius: 15px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
}

.dialog-header {
  background: rgba(255, 215, 0, 0.1);
  border-bottom: 2px solid rgba(255, 215, 0, 0.3);
}

.dialog-title {
  color: #FFD700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
  padding: 20px;
}

.dialog-content {
  color: #ffffff;
}

.item-preview {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
}

.preview-image {
  border: 2px solid rgba(255, 215, 0, 0.5);
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.preview-name {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  font-size: 14px !important;
}

.preview-price {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.quantity-field {
  max-width: 150px;
}

.quantity-field .v-field {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 2px solid rgba(255, 215, 0, 0.5) !important;
  color: #ffffff !important;
}

.quantity-field .v-field:hover {
  border-color: rgba(255, 215, 0, 0.8) !important;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.2) !important;
}

.quantity-field .v-field:focus-within {
  border-color: #FFD700 !important;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3) !important;
}

.quantity-field input {
  color: #ffffff !important;
  text-align: center;
  font-weight: bold;
}

.total-preview {
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.4);
  border-radius: 8px;
  padding: 15px;
}

.total-label {
  color: rgba(255, 255, 255, 0.8);
}

.total-amount {
  color: #FFD700;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.dialog-actions {
  background: rgba(255, 215, 0, 0.02);
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.cancel-btn {
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.confirm-btn {
  background: linear-gradient(45deg, #32CD32, #28a745) !important;
  color: #ffffff !important;
  border: 2px solid #32CD32 !important;
  box-shadow: 0 4px 15px rgba(50, 205, 50, 0.3) !important;
}

.confirm-btn:hover {
  background: linear-gradient(45deg, #28a745, #32CD32) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(50, 205, 50, 0.4) !important;
}

.minecraft-font {
  font-family: 'Press Start 2P', cursive;
  font-size: 12px !important;
}

/* Responsive */
@media (max-width: 768px) {
  .minecraft-card {
    border-width: 2px;
  }

  .item-title {
    font-size: 10px !important;
    padding: 12px;
  }

  .add-btn {
    font-size: 9px !important;
  }

  .minecraft-font {
    font-size: 10px !important;
  }
}
</style>