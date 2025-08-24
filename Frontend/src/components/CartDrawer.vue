<template>
  <v-navigation-drawer
    v-model="show"
    location="right"
    temporary
    width="420"
    class="minecraft-cart"
  >
    <!-- Header harmonisé -->
    <v-toolbar class="cart-header" elevation="0">
      <div class="header-background"></div>
      <v-toolbar-title class="cart-title minecraft-font">
        🛒 PANIER ({{ cartItems.length }})
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="close" class="close-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- Liste des items -->
    <v-list v-if="cartItems.length > 0" class="items-list pa-0">
      <v-list-item
        v-for="item in cartItems"
        :key="item.id"
        class="cart-item pa-4"
      >
        <template v-slot:prepend>
          <div class="item-image-container">
            <v-img
              :src="item.image"
              width="60"
              height="60"
              class="item-thumbnail"
            ></v-img>
          </div>
        </template>

        <div class="flex-grow-1">
          <v-list-item-title class="item-name minecraft-font text-caption mb-1">
            {{ item.name }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="item-details mb-2">
            💰 {{ item.price }} $ × {{ item.quantity }}
            <br>
            <strong class="subtotal">Sous-total: {{ item.price * item.quantity }} coins</strong>
          </v-list-item-subtitle>

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center quantity-controls">
              <v-btn
                icon
                size="small"
                class="quantity-btn"
                @click="decreaseQuantity(item)"
              >
                <v-icon>mdi-minus</v-icon>
              </v-btn>
              <span class="mx-3 font-weight-bold quantity-display">{{ item.quantity }}</span>
              <v-btn
                icon
                size="small"
                class="quantity-btn"
                @click="increaseQuantity(item)"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>

            <v-btn
              icon
              size="small"
              class="delete-btn"
              @click="removeFromCart(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-list-item>
    </v-list>

    <!-- État vide -->
    <v-container v-else class="empty-cart text-center pa-8">
      <v-icon size="80" class="empty-icon">mdi-cart-outline</v-icon>
      <p class="text-h6 mt-4 minecraft-font empty-title">Panier vide</p>
      <p class="text-body-2 empty-subtitle">Ajoutez des items pour commencer !</p>
    </v-container>

    <!-- Footer avec total et commande -->
    <template v-if="cartItems.length > 0">
      <div class="cart-divider"></div>
      
      <v-card-text class="cart-footer text-center pa-6">
        <div class="total-container">
          <div class="total-amount minecraft-font mb-4">
            TOTAL: 💰 {{ totalPrice }} $
          </div>
          <div class="total-items text-body-2 mb-4">
            {{ totalItems }} article(s) au total
          </div>
        </div>
        
        <v-btn
          class="order-btn minecraft-font mt-4"
          variant="elevated"
          block
          size="large"
          @click="checkout"
        >
          🏦 COMMANDER
        </v-btn>
      </v-card-text>
    </template>

    <!-- Modal Discord harmonisé -->
    <v-dialog v-model="showDiscordModal" max-width="500">
      <v-card class="discord-modal">
        <div class="modal-header">
          <v-card-title class="modal-title minecraft-font text-center">
            🤖 Finaliser la commande
          </v-card-title>
        </div>
        
        <v-card-text class="modal-content pa-6">
          <p class="mb-4 text-center modal-description">
            Entrez votre pseudo Discord pour que nous puissions vous contacter :
          </p>
          
          <v-text-field
            v-model="discordUsername"
            label="Pseudo Discord"
            placeholder="VotrePseudo#1234 ou VotrePseudo"
            variant="outlined"
            :disabled="isOrdering"
            @keyup.enter="confirmOrder"
            class="discord-input"
          />
          
          <div class="text-caption mt-2 text-center modal-info">
            📋 Un channel privé sera créé automatiquement sur notre serveur Discord.<br>
            💰 Total de votre commande: <strong>{{ totalPrice }} coins</strong>
          </div>

          <!-- Résumé harmonisé -->
          <v-card class="mt-4 order-summary" variant="outlined">
            <v-card-subtitle class="summary-title minecraft-font">
              📦 Résumé de votre commande:
            </v-card-subtitle>
            <v-card-text class="summary-content">
              <div v-for="item in cartItems" :key="item.id" class="summary-item d-flex justify-space-between mb-1">
                <span>{{ item.name }} × {{ item.quantity }}</span>
                <span class="summary-price">{{ item.price * item.quantity }} $</span>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
        
        <v-card-actions class="modal-actions pa-4">
          <v-btn 
            class="cancel-btn"
            variant="outlined"
            @click="cancelOrder"
            :disabled="isOrdering"
          >
            Annuler
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn 
            class="confirm-btn minecraft-font"
            variant="elevated"
            @click="confirmOrder"
            :loading="isOrdering"
            :disabled="!discordUsername.trim()"
          >
            🚀 Confirmer la commande
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: 'CartDrawer',
  props: {
    modelValue: Boolean,
    cartItems: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'close', 'remove-from-cart'],
  data() {
    return {
      showDiscordModal: false,
      discordUsername: '',
      isOrdering: false
    }
  },
  computed: {
    show: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      }
    },
    totalPrice() {
      return this.cartItems.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      )
    },
    totalItems() {
      return this.cartItems.reduce((total, item) => 
        total + item.quantity, 0
      )
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    removeFromCart(itemId) {
      this.$emit('remove-from-cart', itemId)
    },
    increaseQuantity(item) {
      item.quantity++
    },
    decreaseQuantity(item) {
      if (item.quantity > 1) {
        item.quantity--
      } else {
        this.removeFromCart(item.id)
      }
    },
    checkout() {
      this.showDiscordModal = true
    },
    cancelOrder() {
      this.showDiscordModal = false
      this.discordUsername = ''
      this.isOrdering = false
    },
    async confirmOrder() {
      if (!this.discordUsername.trim()) {
        alert('⚠️ Veuillez entrer votre pseudo Discord!')
        return
      }

      this.isOrdering = true

      try {
        const response = await fetch('https://limeazone.onrender.com/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cartItems: this.cartItems,
            discordUsername: this.discordUsername,
            customerInfo: {
              timestamp: new Date().toISOString(),
              totalPrice: this.totalPrice,
              totalItems: this.totalItems
            }
          })
        })

        const result = await response.json()

        if (result.success) {
          alert(`🎉 Commande envoyée avec succès!\n\n📋 Résumé:\n• ${this.totalItems} article(s)\n• ${this.totalPrice} coins\n• Pseudo Discord: ${this.discordUsername}\n\n🔔 Un channel privé a été créé sur Discord.\nVous recevrez bientôt vos items!`)
          
          this.cartItems.splice(0)
          this.showDiscordModal = false
          this.discordUsername = ''
          this.close()
        } else {
          alert(`❌ Erreur lors de la création de la commande:\n${result.error}`)
        }
      } catch (error) {
        console.error('Erreur de connexion:', error)
        alert('❌ Erreur de connexion au bot Discord.\nVérifiez que le bot est en ligne et réessayez.')
      } finally {
        this.isOrdering = false
      }
    }
  }
}
</script>

<style scoped>
/* Panier principal harmonisé mais allégé */
.minecraft-cart {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border-left: 2px solid #FFD700;
  box-shadow: -4px 0 15px rgba(255, 215, 0, 0.2);
}

/* Header allégé */
.cart-header {
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
  background: #2c2c2c;
  border-bottom: 1px solid #FFD700;
}

.cart-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  position: relative;
  z-index: 2;
}

.close-btn {
  color: #FFD700 !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 215, 0, 0.5);
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 215, 0, 0.1) !important;
  transform: scale(1.05);
}

/* Liste des items allégée */
.items-list {
  background: transparent;
}

.cart-item {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  margin: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(3px);
  border-color: rgba(255, 215, 0, 0.3);
}

.item-image-container {
  position: relative;
}

.item-thumbnail {
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.item-name {
  color: #FFD700;
  text-shadow: none;
}

.item-details {
  color: #cccccc;
}

.subtotal {
  color: #FFD700;
  text-shadow: none;
}

/* Contrôles de quantité simplifiés */
.quantity-controls {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 2px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.quantity-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: none !important;
  color: #ffffff !important;
  transition: all 0.3s ease;
}

.quantity-btn:hover {
  background: rgba(255, 215, 0, 0.2) !important;
  color: #FFD700 !important;
  transform: scale(1.05);
}

.quantity-display {
  color: #ffffff;
  text-shadow: none;
  min-width: 30px;
  text-align: center;
}

.delete-btn {
  background: rgba(220, 20, 60, 0.1) !important;
  border: 1px solid rgba(220, 20, 60, 0.3) !important;
  color: #ff6b6b !important;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  background: rgba(220, 20, 60, 0.2) !important;
  transform: scale(1.05);
}

/* État vide */
.empty-cart {
  color: #cccccc;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.3);
}

.empty-title {
  color: #FFD700;
  text-shadow: none;
}

.empty-subtitle {
  color: #aaaaaa;
}

/* Footer du panier simplifié */
.cart-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent);
  margin: 16px;
}

.cart-footer {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.total-container {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.total-amount {
  color: #FFD700;
  font-size: 18px !important;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.total-items {
  color: #cccccc;
}

.order-btn {
  background: linear-gradient(45deg, #32CD32, #28a745) !important;
  color: #ffffff !important;
  border: 1px solid #32CD32 !important;
  box-shadow: 0 4px 15px rgba(50, 205, 50, 0.3) !important;
  transition: all 0.3s ease !important;
}

.order-btn:hover {
  background: linear-gradient(45deg, #28a745, #32CD32) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(50, 205, 50, 0.4) !important;
}

/* Modal Discord allégé */
.discord-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 2px solid #FFD700;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.5);
}

.modal-header {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 215, 0, 0.5);
}

.modal-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.modal-content {
  color: #cccccc;
}

.modal-description {
  color: #aaaaaa;
}

.modal-info {
  color: #cccccc;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.discord-input .v-field {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

.discord-input .v-field:hover,
.discord-input .v-field:focus-within {
  border-color: #FFD700 !important;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.2) !important;
}

/* Résumé de commande simplifié */
.order-summary {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.summary-title {
  color: #FFD700;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-content {
  color: #cccccc;
}

.summary-item {
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.summary-price {
  color: #FFD700;
  font-weight: bold;
}

/* Actions du modal */
.modal-actions {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn {
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #cccccc !important;
  background: rgba(255, 255, 255, 0.05) !important;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
}

.confirm-btn {
  background: linear-gradient(45deg, #32CD32, #28a745) !important;
  color: #ffffff !important;
  border: 1px solid #32CD32 !important;
  box-shadow: 0 4px 15px rgba(50, 205, 50, 0.3) !important;
}

.confirm-btn:hover {
  background: linear-gradient(45deg, #28a745, #32CD32) !important;
  transform: translateY(-1px) !important;
}

.minecraft-font {
  font-family: 'Press Start 2P', cursive;
}
</style>