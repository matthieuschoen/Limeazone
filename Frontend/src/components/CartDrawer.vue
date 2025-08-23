<!-- src/components/CartDrawer.vue -->
<template>
  <v-navigation-drawer
    v-model="show"
    location="right"
    temporary
    width="420"
    class="minecraft-cart"
  >
    <v-toolbar color="primary" dark elevation="4">
      <v-toolbar-title class="minecraft-font">
        🛒 PANIER
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>

    <v-list v-if="cartItems.length > 0" class="pa-0">
      <v-list-item
        v-for="item in cartItems"
        :key="item.id"
        class="cart-item pa-4"
      >
        <template v-slot:prepend>
          <v-img
            :src="item.image"
            width="60"
            height="60"
            class="mr-4 item-thumbnail"
          ></v-img>
        </template>

        <div class="flex-grow-1">
          <v-list-item-title class="minecraft-font text-caption mb-1">
            {{ item.name }}
          </v-list-item-title>
          
          <v-list-item-subtitle class="mb-2">
            💰 {{ item.price }} coins × {{ item.quantity }}
            <br>
            <strong>Sous-total: {{ item.price * item.quantity }} coins</strong>
          </v-list-item-subtitle>

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-btn
                icon
                size="small"
                variant="outlined"
                @click="decreaseQuantity(item)"
              >
                <v-icon>mdi-minus</v-icon>
              </v-btn>
              <span class="mx-3 font-weight-bold">{{ item.quantity }}</span>
              <v-btn
                icon
                size="small"
                variant="outlined"
                @click="increaseQuantity(item)"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>

            <v-btn
              icon
              size="small"
              color="error"
              variant="tonal"
              @click="removeFromCart(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-list-item>
    </v-list>

    <v-container v-else class="text-center pa-8">
      <v-icon size="80" color="grey-lighten-1">mdi-cart-outline</v-icon>
      <p class="text-h6 mt-4 minecraft-font">Panier vide</p>
      <p class="text-body-2">Ajoutez des items pour commencer !</p>
    </v-container>

    <template v-if="cartItems.length > 0">
      <v-divider class="mx-4"></v-divider>
      
      <v-card-text class="text-center pa-6">
        <div class="text-h5 minecraft-font text-primary mb-4">
          TOTAL: 💰 {{ totalPrice }} coins
        </div>
        <div class="text-body-2">
          {{ totalItems }} article(s) au total
        </div>
        
        <v-btn
          color="success"
          variant="elevated"
          block
          size="large"
          class="minecraft-font mt-4"
          @click="checkout"
        >
          🏦 COMMANDER
        </v-btn>
      </v-card-text>
    </template>
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
      alert(`🎉 Commande validée!\nTotal: ${this.totalPrice} coins\nNombre d'articles: ${this.totalItems}`)
      this.cartItems.splice(0)
      this.close()
    }
  }
}
</script>