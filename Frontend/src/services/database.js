import { createClient } from '@supabase/supabase-js'

// Variables d'environnement Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Service pour gérer les items
export const itemsService = {
  // Récupérer tous les items
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transformer pour compatibilité avec le code existant
      return data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        rarity: item.rarity,
        image: item.image_url || ''
      }))
    } catch (error) {
      console.error('❌ Erreur Supabase:', error)
      throw error
    }
  },

  // Ajouter un item
  async create(item) {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([{
          name: item.name,
          description: item.description,
          price: item.price,
          rarity: item.rarity,
          image_url: item.image
        }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('❌ Erreur création item:', error)
      throw error
    }
  },

  // Modifier un item
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('items')
        .update({
          name: updates.name,
          description: updates.description,
          price: updates.price,
          rarity: updates.rarity,
          image_url: updates.image
        })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('❌ Erreur modification item:', error)
      throw error
    }
  },

  // Supprimer un item
  async delete(id) {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Erreur suppression item:', error)
      throw error
    }
  },

  // Migrer depuis JSON vers Supabase
  async migrateFromJson(jsonItems) {
    try {
      const itemsToInsert = jsonItems.map(item => ({
        name: item.name,
        description: item.description || '',
        price: item.price,
        rarity: item.rarity,
        image_url: item.image || ''
      }))

      const { data, error } = await supabase
        .from('items')
        .insert(itemsToInsert)
        .select()
      
      if (error) throw error
      console.log(`✅ Migration réussie: ${data.length} items ajoutés`)
      return data
    } catch (error) {
      console.error('❌ Erreur migration:', error)
      throw error
    }
  }
}

// Service pour gérer les catégories
export const categoriesService = {
  // Récupérer toutes les catégories
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Erreur récupération catégories:', error)
      throw error
    }
  },

  // Créer une nouvelle catégorie
  async create(category) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: category.name,
          color: category.color,
          icon: category.icon
        }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('❌ Erreur création catégorie:', error)
      throw error
    }
  },

  // Modifier une catégorie
  async update(id, updates) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update({
          name: updates.name,
          color: updates.color,
          icon: updates.icon
        })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('❌ Erreur modification catégorie:', error)
      throw error
    }
  },

  // Supprimer une catégorie
  async delete(id) {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Erreur suppression catégorie:', error)
      throw error
    }
  }
}