<template>
  <v-card class="minecraft-card" elevation="8" hover>
    <v-img :src="item.image || defaultImage" height="200" cover class="item-image">
      <v-chip v-if="item.rarity" :color="getRarityColor(item.rarity)" class="ma-2" small>
        {{ item.rarity.toUpperCase() }}
      </v-chip>
    </v-img>

    <v-card-title class="minecraft-font">
      {{ item.name }}
    </v-card-title>

    <v-card-text>
      <div class="text-body-2 mb-2">
        {{ item.description }}
      </div>

      <v-chip color="accent" text-color="black" class="minecraft-font">
        💰 {{ item.price }} $/u
      </v-chip>
    </v-card-text>

    <v-card-actions>
      <v-btn color="success" variant="elevated" block @click="addToCart" class="minecraft-font">
        🛒 Add to Cart
      </v-btn>
    </v-card-actions>
  </v-card>

  <!-- Dialog de sélection de quantité -->
  <v-dialog v-model="showQuantityDialog" max-width="400">
    <v-card class="minecraft-card">
      <v-card-title class="minecraft-font text-center">
        🛒 Choisir la quantité
      </v-card-title>

      <v-card-text class="text-center pa-6">
        <div class="mb-4">
          <v-img :src="item.image || defaultImage" height="80" width="80" class="mx-auto mb-2"></v-img>
          <div class="text-h6 minecraft-font">{{ item.name }}</div>
          <div class="text-body-2">💰 {{ item.price }} $/u</div>
        </div>

        <v-text-field v-model.number="selectedQuantity" label="Quantité" type="number" min="1" variant="outlined"
          class="mx-auto" style="max-width: 150px;" hide-details></v-text-field>

        <div class="mt-3 text-h6">
          Total: 💰 {{ item.price * selectedQuantity }} $/u
        </div>
      </v-card-text>

      <v-card-actions class="justify-center pb-4">
        <v-btn color="grey" variant="outlined" @click="cancelQuantity" class="minecraft-font"
          @keyup.escape="cancelQuantity">
          Annuler
        </v-btn>
        <v-btn color="success" variant="elevated" @click="confirmAddToCart" class="minecraft-font ml-3">
          Confirmer
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
        common: 'grey',
        uncommon: 'green',
        rare: 'blue',
        epic: 'purple',
        legendary: 'orange'
      }
      return colors[rarity?.toLowerCase()] || 'grey'
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
.minecraft-card {
  border: 3px solid #8B4513;
  border-radius: 8px !important;
  background: linear-gradient(135deg, #F5DEB3 0%, #DEB887 100%);
}

.minecraft-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.3) !important;
}

.item-image {
  border-bottom: 2px solid #8B4513;
}
</style>