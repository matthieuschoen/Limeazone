<template>
  <v-app>
    <v-app-bar app color="primary" dark elevation="4">
      <div style="width: 220px;"></div>
      <v-spacer></v-spacer>
      <v-toolbar-title class="minecraft-font">
        🏗️ Official Lime Shop
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon @click="toggleCart" class="cart-button">
        <img src="https://cdn-icons-png.flaticon.com/512/263/263142.png" alt="Panier"
          style="width: 24px; height: 24px; filter: brightness(0) invert(1);">
        <v-badge v-if="cartItems > 0" :content="cartItems" color="accent"></v-badge>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid class="minecraft-bg">
        <ShopGrid @add-to-cart="addToCart" />
      </v-container>
    </v-main>

    <CartDrawer v-model="showCart" :cart-items="cart" @close="showCart = false" @remove-from-cart="removeFromCart" />


  </v-app>
</template>

<script>
import ShopGrid from './components/ShopGrid.vue'
import CartDrawer from './components/CartDrawer.vue'

export default {
  name: 'App',
  components: {
    ShopGrid,
    CartDrawer
  },
  data() {
    return {
      showCart: false,
      cart: []
    }
  },
  computed: {
    cartItems() {
      return this.cart.length
    }
  },
  methods: {
    toggleCart() {
      this.showCart = !this.showCart
    },
    addToCart(data) {
      console.log('Type de données:', typeof data)
      console.log('Données complètes:', JSON.stringify(data, null, 2))
      console.log('A une propriété item?', data.hasOwnProperty('item'))
      console.log('A une propriété quantity?', data.hasOwnProperty('quantity'))

      // Version defensive pour gérer les deux cas
      let item, quantity

      if (data.item && data.quantity !== undefined) {
        // Structure avec {item, quantity}
        item = data.item
        quantity = data.quantity
        console.log('Structure avec objet:', item.name, quantity)
      } else if (data.name && data.id) {
        // Structure directe (juste l'item)
        item = data
        quantity = 1
        console.log('Structure directe:', item.name, quantity)
      } else {
        console.error('Structure de données non reconnue:', data)
        return
      }

      const existingItem = this.cart.find(cartItem => cartItem.id === item.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cart.push({ ...item, quantity: quantity })
      }
    },
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

.minecraft-font {
  font-family: 'Press Start 2P', cursive;
  font-size: 18px !important;
}

.minecraft-bg {
  background: #1e1e1e;
  min-height: 100vh;
}

.minecraft-cart-btn {
  background: rgba(255, 215, 0, 0.2) !important;
  border: 2px solid #FFD700 !important;
  transition: all 0.3s ease !important;
}

.minecraft-cart-btn:hover {
  background: rgba(255, 215, 0, 0.4) !important;
  transform: scale(1.1);
}

.minecraft-badge {
  font-family: 'Press Start 2P', cursive;
}

.cart-button {
  position: relative;
}
</style>