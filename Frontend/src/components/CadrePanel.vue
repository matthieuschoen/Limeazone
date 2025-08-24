<template>
  <v-dialog v-model="show" max-width="900px" persistent>
    <v-card class="admin-panel">
      <!-- Header harmonisé -->
      <v-toolbar class="panel-header" elevation="0">
        <div class="header-background"></div>
        <v-toolbar-title class="panel-title minecraft-font">
          ⚙️ Admin Panel - Gestion des Produits
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="close" class="close-btn">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>

      <v-card-text class="panel-content pa-8">
        <!-- Formulaire d'ajout/modification -->
        <v-card class="form-card mb-8" elevation="2">
          <v-card-title class="form-title minecraft-font">
            {{ editingItem ? '✏️ Modifier le produit' : '➕ Ajouter un nouveau produit' }}
          </v-card-title>

          <v-card-text class="form-content pa-6">
            <v-form ref="form" v-model="valid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field v-model="formData.name" label="Nom du produit"
                    :rules="[v => !!v || 'Le nom est requis']" variant="outlined" class="form-field"
                    required></v-text-field>
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field v-model.number="formData.price" label="Prix (coins)" type="number"
                    :rules="[v => !!v || 'Le prix est requis']" variant="outlined" class="form-field"
                    required></v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea v-model="formData.description" label="Description" rows="3"
                    :rules="[v => !!v || 'La description est requise']" variant="outlined"
                    class="form-field"></v-textarea>
                </v-col>

                <v-col cols="12">
                  <v-select v-model="formData.rarity" :items="rarityOptions" label="Catégorie" variant="outlined"
                    class="form-field" required></v-select>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>

          <v-card-actions class="form-actions pa-6">
            <v-spacer></v-spacer>
            <v-btn color="grey" variant="outlined" @click="resetForm" class="action-btn">
              Annuler
            </v-btn>
            <v-btn color="primary" variant="elevated" @click="saveItem" :disabled="!valid" class="action-btn save-btn">
              {{ editingItem ? 'Modifier' : 'Ajouter' }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Liste des produits -->
        <v-card class="products-card">
          <v-card-title class="products-title minecraft-font">
            📦 Produits existants ({{ items.length }})
          </v-card-title>

          <v-data-table :headers="headers" :items="items" item-key="id" class="products-table" :items-per-page="10">
            <template v-slot:item.rarity="{ item }">
              <v-chip :color="getRarityColor(item.rarity)" size="small" class="rarity-chip">
                {{ getRarityIcon(item.rarity) }} {{ item.rarity }}
              </v-chip>
            </template>

            <template v-slot:item.price="{ item }">
              <span class="price-display">💰 {{ item.price }}</span>
            </template>

            <template v-slot:item.actions="{ item }">
              <div class="action-buttons">
                <v-btn icon size="small" color="primary" variant="tonal" @click="editItem(item)" class="table-btn">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" color="error" variant="tonal" @click="deleteItem(item.id)" class="table-btn">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-card-text>

      <!-- Footer actions -->
      <v-card-actions class="panel-footer pa-6">
        <v-btn color="success" variant="elevated" @click="exportData" class="export-btn">
          📁 Exporter les données
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn color="grey" variant="outlined" @click="close" class="close-panel-btn">
          Fermer
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'AdminPanel',
  props: {
    modelValue: Boolean,
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'close', 'add-item', 'edit-item', 'delete-item'],
  data() {
    return {
      valid: false,
      editingItem: null,
      formData: {
        name: '',
        description: '',
        price: 0,
        rarity: 'Refill'
      },
      rarityOptions: [
        { title: 'Refill', value: 'Refill' },
        { title: 'Machines', value: 'Machines' },
        { title: 'Solaire', value: 'Solaire' },
        { title: 'Circuits', value: 'Circuits' },
        { title: 'Rouages', value: 'Rouages' },
        { title: 'Edora', value: 'Edora'},
        { title: 'Autres', value: 'Autres'},
        { title: 'Consommables', value: 'Consommables'}
      ],
      headers: [
        { title: 'Nom', key: 'name' },
        { title: 'Description', key: 'description' },
        { title: 'Prix', key: 'price' },
        { title: 'Catégorie', key: 'rarity' },
        { title: 'Actions', key: 'actions', sortable: false }
      ]
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
    }
  },
  methods: {
    close() {
      this.resetForm()
      this.$emit('close')
    },
    resetForm() {
      this.formData = {
        name: '',
        description: '',
        price: 0,
        rarity: 'common'
      }
      this.editingItem = null
      if (this.$refs.form) {
        this.$refs.form.resetValidation()
      }
    },
    saveItem() {
      if (this.editingItem) {
        this.$emit('edit-item', { ...this.formData, id: this.editingItem.id })
      } else {
        this.$emit('add-item', { ...this.formData, id: Date.now() })
      }
      this.resetForm()
    },
    editItem(item) {
      this.editingItem = item
      this.formData = { ...item }
    },
    deleteItem(id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        this.$emit('delete-item', id)
      }
    },
    getRarityColor(rarity) {
      const colors = {
        Refill: 'grey',
        Machines: 'green',
        Solaire: 'blue',
        Circuits: 'purple',
        Rouages: 'orange',
        Edora: 'red',
        Autres: 'cyan',
        Consommables: 'lime'
      }
      return colors[rarity?.toLowerCase()] || 'grey'
    },
    getRarityIcon(rarity) {
      const icons = {
        common: '⚪',
        uncommon: '🟢',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟠'
      }
      return icons[rarity?.toLowerCase()] || '⚪'
    },
    exportData() {
      const data = JSON.stringify(this.items, null, 2)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'minecraft-shop-items.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }
}
</script>

<style>
/* Styles globaux pour forcer le texte blanc - SANS scoped */
.admin-panel .v-field input,
.admin-panel .v-field textarea,
.admin-panel .v-text-field input,
.admin-panel .v-textarea textarea,
.admin-panel .v-select input {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.admin-panel .v-field .v-field__input {
  color: #ffffff !important;
}

.admin-panel .v-field .v-field__input input {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

.admin-panel .v-field--focused input,
.admin-panel .v-field--focused textarea {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

/* Pour les labels */
.admin-panel .v-label {
  color: rgba(255, 255, 255, 0.7) !important;
}

.admin-panel .v-label--active {
  color: #FFD700 !important;
}

/* Pour le tableau des items existants */
.admin-panel .v-data-table td {
  color: #ffffff !important;
}

.admin-panel .v-data-table tbody tr td {
  color: #ffffff !important;
}

.admin-panel .products-table td {
  color: #ffffff !important;
}

.admin-panel .products-table .v-data-table__td {
  color: #ffffff !important;
}

/* Headers du tableau en doré */
.admin-panel .v-data-table th {
  color: #FFD700 !important;
}

.admin-panel .v-data-table thead tr th {
  color: #FFD700 !important;
}

/* Pour la pagination et les éléments du bas */
.admin-panel .v-data-table-footer {
  color: #ffffff !important;
}

.admin-panel .v-data-table__footer {
  color: #ffffff !important;
}

.admin-panel .v-data-table-footer .v-select__selection {
  color: #ffffff !important;
}

.admin-panel .v-pagination {
  color: #ffffff !important;
}

.admin-panel .v-pagination .v-btn {
  color: #ffffff !important;
}

.admin-panel .v-data-table-footer__items-per-page {
  color: #ffffff !important;
}

.admin-panel .v-data-table-footer__info {
  color: #ffffff !important;
}
</style>

<style scoped>
/* Panel principal harmonisé */
.admin-panel {
  background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 50%, #1a1a1a 100%);
  border: 3px solid rgba(255, 215, 0, 0.6);
  border-radius: 15px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
  max-height: 90vh;
  overflow-y: auto;
}

/* Header harmonisé */
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
  transform: scale(1.1);
}

/* Contenu principal */
.panel-content {
  color: #ffffff;
}

/* Carte de formulaire */
.form-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 2px solid rgba(255, 215, 0, 0.3) !important;
  border-radius: 12px;
}

.form-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  background: rgba(255, 215, 0, 0.05);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  padding: 20px;
}

.form-content {
  padding: 24px !important;
}

/* Champs de formulaire avec texte BLANC - Version renforcée */
.admin-panel .form-field .v-field {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  margin-bottom: 16px;
}

.admin-panel .form-field .v-field input,
.admin-panel .form-field .v-field textarea,
.admin-panel .form-field .v-text-field input,
.admin-panel .form-field .v-textarea textarea {
  color: #ffffff !important;
  /* Texte blanc */
  caret-color: #ffffff !important;
  /* Curseur blanc */
}

.admin-panel .form-field .v-field .v-field__input,
.admin-panel .form-field .v-field .v-field__input input {
  color: #ffffff !important;
  /* Texte dans les champs en blanc */
}

.admin-panel .form-field .v-field .v-label,
.admin-panel .form-field .v-text-field .v-label,
.admin-panel .form-field .v-textarea .v-label,
.admin-panel .form-field .v-select .v-label {
  color: rgba(255, 255, 255, 0.7) !important;
  /* Labels en blanc transparent */
}

.admin-panel .form-field .v-field .v-label--active {
  color: #FFD700 !important;
  /* Labels actifs dorés */
}

.admin-panel .form-field .v-field:hover {
  border-color: rgba(255, 215, 0, 0.6) !important;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.2) !important;
}

.admin-panel .form-field .v-field:focus-within {
  border-color: #FFD700 !important;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.3) !important;
}

/* Pour les select avec texte blanc */
.admin-panel .form-field .v-select .v-field__input,
.admin-panel .form-field .v-select .v-selection,
.admin-panel .form-field .v-select .v-field__input .v-selection {
  color: #ffffff !important;
}

/* Placeholder en blanc aussi */
.admin-panel .form-field .v-field input::placeholder,
.admin-panel .form-field .v-field textarea::placeholder {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* Version universelle pour forcer */
.admin-panel input,
.admin-panel textarea {
  color: #ffffff !important;
}

/* Actions du formulaire */
.form-actions {
  background: rgba(255, 215, 0, 0.02);
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.action-btn {
  margin: 0 8px;
  min-width: 120px;
  transition: all 0.3s ease;
}

.save-btn {
  background: linear-gradient(45deg, #32CD32, #28a745) !important;
  color: #ffffff !important;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(50, 205, 50, 0.4) !important;
}

/* Carte des produits */
.products-card {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 2px solid rgba(255, 215, 0, 0.3) !important;
  border-radius: 12px;
}

.products-title {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  background: rgba(255, 215, 0, 0.05);
  border-bottom: 1px solid rgba(255, 215, 0, 0.3);
  padding: 20px;
}

/* Table des produits */
.products-table {
  background: transparent !important;
}

.products-table .v-data-table__wrapper {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.products-table th {
  background: rgba(255, 215, 0, 0.1) !important;
  color: #FFD700 !important;
  font-weight: bold;
  border-bottom: 2px solid rgba(255, 215, 0, 0.3) !important;
}

.products-table td {
  color: #ffffff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 16px 8px !important;
}

.products-table tr:hover {
  background: rgba(255, 215, 0, 0.05) !important;
}

/* Chips de rareté */
.rarity-chip {
  font-weight: bold;
  border: 1px solid currentColor !important;
}

.price-display {
  color: #FFD700;
  font-weight: bold;
  text-shadow: 0 0 5px rgba(255, 215, 0, 0.3);
}

/* Boutons d'action du tableau */
.action-buttons {
  display: flex;
  gap: 8px;
}

.table-btn {
  transition: all 0.3s ease;
}

.table-btn:hover {
  transform: scale(1.1);
}

/* Footer du panel */
.panel-footer {
  background: rgba(255, 215, 0, 0.02);
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.export-btn {
  background: linear-gradient(45deg, #17a2b8, #138496) !important;
  color: #ffffff !important;
  transition: all 0.3s ease;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(23, 162, 184, 0.4) !important;
}

.close-panel-btn {
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  transition: all 0.3s ease;
}

.close-panel-btn:hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.minecraft-font {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px !important;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-panel {
    margin: 16px;
    max-width: calc(100vw - 32px);
  }

  .panel-content {
    padding: 16px !important;
  }

  .form-content {
    padding: 16px !important;
  }

  .minecraft-font {
    font-size: 12px !important;
  }
}
</style>