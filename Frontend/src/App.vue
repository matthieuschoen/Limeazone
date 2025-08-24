<template>
  <v-app>
    <v-app-bar app elevation="0" class="navbar-custom">
      <div class="navbar-background"></div>
      
      <!-- Centrage du titre -->
      <v-spacer></v-spacer>
      
      <!-- Logo/Titre avec effets allégés -->
      <div class="logo-container">
        <div class="logo-glow">
          <v-toolbar-title class="brand-title">
            <span class="brand-icon">🍋</span>
            <span class="brand-text">LimeAzone</span>
            <span class="brand-icon">🍋</span>
          </v-toolbar-title>
        </div>
        
        <!-- Particules subtiles -->
        <div class="particles">
          <div class="particle particle-1">⛏️</div>
          <div class="particle particle-2">💎</div>
          <div class="particle particle-3">✨</div>
        </div>
      </div>

      <v-spacer></v-spacer>

      <!-- Bouton panier simplifié -->
      <div class="cart-container">
        <v-btn 
          icon 
          @click="toggleCart" 
          class="cart-button"
          size="large"
        >
          <div class="cart-icon-wrapper">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/263/263142.png" 
              alt="Panier"
              class="cart-icon"
            >
            <v-badge 
              v-if="cartItems > 0" 
              :content="cartItems" 
              color="accent"
              class="cart-badge"
            ></v-badge>
          </div>
        </v-btn>
      </div>
    </v-app-bar>

    <v-main>
      <v-container fluid class="minecraft-bg">
        <ShopGrid @add-to-cart="addToCart" />
      </v-container>
    </v-main>

    <CartDrawer 
      v-model="showCart" 
      :cart-items="cart"
      @close="showCart = false"
      @remove-from-cart="removeFromCart"
    />
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
    removeFromCart(itemId) {
      this.cart = this.cart.filter(item => item.id !== itemId)
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

/* Navbar allégée et élégante */
.navbar-custom {
  background: transparent !important;
  position: relative;
  overflow: hidden;
  height: 80px !important;
}

.navbar-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border-bottom: 2px solid #FFD700;
  box-shadow: 0 2px 15px rgba(255, 215, 0, 0.2);
}

/* Logo container centré */
.logo-container {
  position: relative;
  z-index: 10;
  text-align: center;
}

.logo-glow {
  position: relative;
}

.brand-title {
  font-family: 'Press Start 2P', cursive !important;
  font-size: clamp(14px, 2.5vw, 20px) !important;
  color: #FFD700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.brand-title:hover {
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  transform: scale(1.02);
}

.brand-icon {
  display: inline-block;
  animation: subtle-bounce 3s ease-in-out infinite;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
}

.brand-text {
  position: relative;
}

.brand-text::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.6), transparent);
  animation: subtle-glow 3s ease-in-out infinite;
}

/* Particules subtiles */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  font-size: 10px;
  animation: gentle-float 6s ease-in-out infinite;
  opacity: 0.4;
  filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.3));
}

.particle-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.particle-2 {
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.particle-3 {
  top: 40%;
  left: 50%;
  animation-delay: 4s;
}

/* Bouton panier élégant */
.cart-container {
  position: relative;
  z-index: 10;
}

.cart-button {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 2px solid rgba(255, 215, 0, 0.6) !important;
  border-radius: 50% !important;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
  transition: all 0.3s ease !important;
  position: relative;
}

.cart-button:hover {
  background: rgba(255, 215, 0, 0.15) !important;
  border-color: #FFD700 !important;
  transform: translateY(-2px) scale(1.05) !important;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.3) !important;
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
  transition: all 0.3s ease;
}

.cart-button:hover .cart-icon {
  filter: brightness(0) invert(1) drop-shadow(0 0 5px rgba(255, 215, 0, 0.5));
}

.cart-badge {
  position: absolute !important;
  top: -8px !important;
  right: -8px !important;
  background: linear-gradient(45deg, #FF4444, #FF6666) !important;
  border: 1px solid #FFD700 !important;
  animation: subtle-pulse 2s ease-in-out infinite;
  box-shadow: 0 2px 8px rgba(255, 68, 68, 0.4);
}

/* Animations subtiles */
@keyframes subtle-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-3px) rotate(5deg); }
}

@keyframes subtle-glow {
  0%, 100% { 
    opacity: 0.6;
    width: 100%;
  }
  50% { 
    opacity: 1;
    width: 110%;
    left: -5%;
  }
}

@keyframes gentle-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
  50% { transform: translateY(-8px) rotate(180deg); opacity: 0.7; }
}

@keyframes subtle-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Background principal */
.minecraft-bg {
  background: #2c2c2c;
  min-height: 100vh;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-background {
    border-bottom-width: 1px;
  }
  
  .brand-title {
    font-size: 12px !important;
    gap: 4px;
  }
  
  .brand-icon {
    font-size: 12px;
  }
  
  .cart-icon {
    width: 20px;
    height: 20px;
  }
  
  .cart-button {
    border-width: 1px !important;
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: 10px !important;
  }
  
  .particles {
    display: none;
  }
  
  .navbar-background {
    box-shadow: 0 1px 8px rgba(255, 215, 0, 0.15);
  }
}
</style>