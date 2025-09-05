<template>
  <!-- Encadré de demande pour la sidebar -->
  <v-card class="request-sidebar-card" elevation="4">
    <v-card-text class="pa-4">
      <h4 class="minecraft-font mb-3 text-center" style="color: #FFD700;">
        📝 Item Introuvable ?
      </h4>
      
      <v-card class="request-mini-card pa-3" elevation="2">
        <div class="text-center">
          <v-icon size="30" color="#FFD700" class="mb-2">mdi-plus-circle-outline</v-icon>
          <p class="text-caption mb-2" style="color: rgba(255, 255, 255, 0.8);">
            Vous ne trouvez pas ce que vous cherchez ?
          </p>
          <v-btn
            color="#FFD700"
            size="small"
            @click="openModal"
            class="minecraft-font request-btn-custom"
            block
          >
            📝 Faire une demande
          </v-btn>
        </div>
      </v-card>
    </v-card-text>
  </v-card>

  <!-- Modal de demande -->
  <v-dialog v-model="showModal" max-width="600px" persistent>
    <v-card class="request-modal">
      <v-toolbar class="modal-header" elevation="0">
        <div class="header-background"></div>
        <v-toolbar-title class="modal-title minecraft-font">
          📝 Demander un Item 
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="closeModal" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="pa-6">
        <div class="request-intro mb-4">
          <p class="text-body-1">
            🎯 Vous ne trouvez pas l'item que vous cherchez ? <br>
            Décrivez-nous ce que vous voulez et nous vous ferons un devis !
          </p>
        </div>

        <v-form ref="requestForm" @submit.prevent="submitRequest">
          <!-- Nom de l'item -->
          <v-text-field
            v-model="requestForm.itemName"
            label="Nom de l'item souhaité"
            variant="outlined"
            prepend-inner-icon="mdi-package-variant"
            class="mb-3"
            :rules="[rules.required]"
            placeholder="Ex: Épée en Netherite Sharpness V"
          ></v-text-field>

          <!-- Description détaillée -->
          <v-textarea
            v-model="requestForm.description"
            label="Description détaillée"
            variant="outlined"
            prepend-inner-icon="mdi-text"
            rows="3"
            class="mb-3"
            placeholder="Décrivez précisément l'item, ses enchantements, quantité souhaitée..."
          ></v-textarea>

          <!-- Quantité -->
          <v-text-field
            v-model.number="requestForm.quantity"
            label="Quantité souhaitée"
            variant="outlined"
            type="number"
            min="1"
            prepend-inner-icon="mdi-counter"
            class="mb-3"
            :rules="[rules.required, rules.minQuantity]"
          ></v-text-field>

          <!-- Budget approximatif -->
          <v-text-field
            v-model.number="requestForm.budget"
            label="Budget approximatif (coins)"
            variant="outlined"
            type="number"
            min="0"
            prepend-inner-icon="mdi-currency-usd"
            class="mb-3"
            placeholder="Optionnel - votre budget indicatif"
          ></v-text-field>

          <!-- Pseudo Discord -->
          <v-text-field
            v-model="requestForm.discordUsername"
            label="Votre pseudo Discord"
            variant="outlined"
            prepend-inner-icon="mdi-discord"
            class="mb-3"
            :rules="[rules.required]"
            placeholder="Ex: VotreNom#1234 ou VotreNom"
            hint="Nous vous contacterons sur Discord pour le devis"
          ></v-text-field>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-6">
        <v-btn
          color="grey"
          variant="outlined"
          @click="closeModal"
          class="minecraft-font"
        >
          Annuler
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
          color="#FFD700"
          @click="submitRequest"
          :loading="isSubmitting"
          class="minecraft-font request-submit-btn"
          prepend-icon="mdi-send"
        >
          📨 Envoyer la demande
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'RequestModal',
  data() {
    return {
      showModal: false,
      isSubmitting: false,
      
      requestForm: {
        itemName: '',
        description: '',
        quantity: 1,
        budget: null,
        discordUsername: ''
      },
      
      rules: {
        required: value => !!value || 'Ce champ est requis',
        minQuantity: value => value >= 1 || 'La quantité doit être d\'au moins 1'
      }
    }
  },
  
  methods: {
    // Méthode exposée pour ouvrir le modal depuis l'extérieur
    openModal() {
      this.showModal = true
      this.resetForm()
    },
    
    closeModal() {
      this.showModal = false
      this.resetForm()
    },
    
    resetForm() {
      this.requestForm = {
        itemName: '',
        description: '',
        quantity: 1,
        budget: null,
        discordUsername: ''
      }
    },
    
    async submitRequest() {
      // Valider le formulaire
      const { valid } = await this.$refs.requestForm.validate()
      if (!valid) return
      
      this.isSubmitting = true
      
      try {
        // Utiliser l'URL en fonction de l'environnement
        const apiUrl = import.meta.env.VITE_API_URL || 'https://limeazone.onrender.com'
        
        const response = await fetch(`${apiUrl}/api/request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...this.requestForm,
            timestamp: new Date().toISOString()
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          alert('✅ Demande envoyée avec succès!\n\n📋 Résumé:\n' +
                `• Item: ${this.requestForm.itemName}\n` +
                `• Quantité: ${this.requestForm.quantity}\n` +
                `• Discord: ${this.requestForm.discordUsername}\n\n` +
                '🔔 Nous vous contacterons bientôt sur Discord avec un devis!')
          
          this.closeModal()
        } else {
          throw new Error(result.error || 'Erreur inconnue')
        }
      } catch (error) {
        console.error('Erreur envoi demande:', error)
        alert('❌ Erreur lors de l\'envoi de la demande.\nVeuillez réessayer plus tard.')
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
/* Encadré sidebar - VERSION COMPACTE ALIGNÉE À GAUCHE */
.request-sidebar-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%) !important;
  border: 2px solid rgba(255, 215, 0, 0.4) !important;
  border-radius: 15px !important;
  margin-top: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
  max-width: 290px;
  margin-left: 0;
  margin-right: auto;
}

.request-sidebar-card .v-card-text {
  padding: 18px !important;
}

.request-sidebar-card h4 {
  font-size: 10px !important;
  margin-bottom: 12px !important;
}

.request-sidebar-card:hover {
  border-color: rgba(255, 215, 0, 0.6) !important;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.15) !important;
}

.request-mini-card {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%) !important;
  border: 2px solid rgba(255, 215, 0, 0.2) !important;
  border-radius: 10px !important;
  transition: all 0.3s ease;
  padding: 14px !important;
}

.request-mini-card .v-icon {
  font-size: 24px !important;
}

.request-mini-card p {
  font-size: 11px !important;
  line-height: 1.3 !important;
  margin-bottom: 8px !important;
}

.request-mini-card:hover {
  border-color: rgba(255, 215, 0, 0.3) !important;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.1) !important;
}

.request-btn-custom {
  background: rgba(255, 215, 0, 0.1) !important;
  color: #FFD700 !important;
  border: 1px solid rgba(255, 215, 0, 0.4) !important;
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.2) !important;
  transition: all 0.3s ease !important;
  font-size: 9px !important;
  min-height: 34px !important;
  border-radius: 8px !important;
}

.request-btn-custom:hover {
  background: rgba(255, 215, 0, 0.2) !important;
  border-color: rgba(255, 215, 0, 0.6) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3) !important;
}

/* Modal styles */
.request-modal {
  color: white !important;
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 2px solid rgba(255, 215, 0, 0.5) !important;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.modal-header {
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
  background: rgba(255, 215, 0, 0.05) !important;
  border-bottom: 1px solid rgba(255, 215, 0, 0.3) !important;
}

.modal-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  position: relative;
  z-index: 2;
}

.close-btn {
  color: #FFD700 !important;
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 215, 0, 0.3);
  position: relative;
  z-index: 2;
}

.request-intro {
  background: rgba(255, 215, 0, 0.05) !important;
  border: 1px solid rgba(255, 215, 0, 0.2) !important;
  color: white !important;
  border-radius: 8px;
  padding: 12px;
}

.request-submit-btn {
  background: rgba(255, 215, 0, 0.1) !important;
  color: #FFD700 !important;
  border: 1px solid rgba(255, 215, 0, 0.5) !important;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.2) !important;
  transition: all 0.3s ease !important;
}

.request-submit-btn:hover {
  background: rgba(255, 215, 0, 0.2) !important;
  border-color: rgba(255, 215, 0, 0.7) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3) !important;
}

.minecraft-font {
  font-family: 'Press Start 2P', cursive !important;
  font-size: 9px !important;
}

@media (max-width: 768px) {
  .request-sidebar-card {
    max-width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
  
  .request-modal {
    margin: 8px;
    max-width: calc(100vw - 16px);
  }
  
  .minecraft-font {
    font-size: 10px !important;
  }
}
</style>