<!-- src/components/AdminPanel.vue -->
<template>
    <v-dialog v-model="show" max-width="700px" persistent @keyup.escape="close">
      <v-card>
        <v-toolbar color="primary" dark>
          <v-toolbar-title class="minecraft-font">
            ⚙️ Cadre Panel
          </v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="close" @keyup.escape="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
  
        <v-card-text class="pa-6">
          <!-- Formulaire d'ajout/modification -->
          <v-card class="mb-6" elevation="2">
            <v-card-title>
              {{ editingItem ? 'Modifier le produit' : 'Ajouter un nouveau produit' }}
            </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.name"
                      label="Nom du produit"
                      :rules="[v => !!v || 'Le nom est requis']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="formData.price"
                      label="Prix (unité)"
                      type="number"
                      :rules="[v => !!v || 'Le prix est requis']"
                      required
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="formData.description"
                      label="Description"
                      rows="2"
                      :rules="[v => !!v || 'La description est requise']"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="formData.image"
                      label="URL de l'image"
                      placeholder="https://example.com/image.png"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.rarity"
                      :items="rarityOptions"
                      label="Rareté"
                      required
                    ></v-select>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="grey" @click="resetForm">Annuler</v-btn>
              <v-btn 
                color="primary" 
                @click="saveItem"
                :disabled="!valid"
              >
                {{ editingItem ? 'Modifier' : 'Ajouter' }}
              </v-btn>
            </v-card-actions>
          </v-card>
  
          <!-- Liste des produits -->
          <v-card>
            <v-card-title>
              Produits existants ({{ items.length }})
            </v-card-title>
            <v-data-table
              :headers="headers"
              :items="items"
              item-key="id"
              class="elevation-1"
            >
              <template v-slot:item.image="{ item }">
                <v-img
                  :src="item.image"
                  width="50"
                  height="50"
                  class="ma-2"
                ></v-img>
              </template>
              
              <template v-slot:item.rarity="{ item }">
                <v-chip
                  :color="getRarityColor(item.rarity)"
                  small
                >
                  {{ item.rarity }}
                </v-chip>
              </template>
  
              <template v-slot:item.price="{ item }">
                💰 {{ item.price }}
              </template>
  
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  size="small"
                  color="primary"
                  @click="editItem(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  icon
                  size="small"
                  color="error"
                  @click="deleteItem(item.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </v-card-text>
  
        <v-card-actions>
          <v-btn color="success" @click="exportData">
            📁 Exporter les données
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="close" @keyup.escape="close">
            Fermer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    name: 'CadrePanel',
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
          rarity: 'common',
          image: ''
        },
        rarityOptions: [
          { title: 'Commun', value: 'common' },
          { title: 'Peu commun', value: 'uncommon' },
          { title: 'Rare', value: 'rare' },
          { title: 'Épique', value: 'epic' },
          { title: 'Légendaire', value: 'legendary' }
        ],
        headers: [
          { title: 'Image', key: 'image', sortable: false },
          { title: 'Nom', key: 'name' },
          { title: 'Description', key: 'description' },
          { title: 'Prix', key: 'price' },
          { title: 'Rareté', key: 'rarity' },
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
          rarity: 'common',
          image: ''
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
          common: 'grey',
          uncommon: 'green',
          rare: 'blue',
          epic: 'purple',
          legendary: 'orange'
        }
        return colors[rarity?.toLowerCase()] || 'grey'
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