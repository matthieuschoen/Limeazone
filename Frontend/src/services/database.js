import { createClient } from '@supabase/supabase-js'

// Variables d'environnement Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fngewrukuslstsffysxr.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuZ2V3cnVrdXNsc3RzZmZ5c3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTQyNzksImV4cCI6MjA3MVc5MDI3OX0.MeHCZ8wI22aYS7bzO-l8NqCnBJ96feHt1'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Service pour gérer les items
export const itemsService = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
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

  async migrateFromJson(jsonItems) {
    try {
      const itemsToInsert = jsonItems.map(item => ({
        name: item.name,
        description: item.description || '',
        price: Math.round(parseFloat(item.price) || 0),
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

// Service pour la configuration du site
export const configService = {
  async get(key) {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('value')
        .eq('key', key)
        .single()
      
      if (error) throw error
      return data.value
    } catch (error) {
      console.error(`❌ Erreur récupération config ${key}:`, error)
      throw error
    }
  },

  async getAvailableColors() {
    try {
      return await this.get('available_colors')
    } catch (error) {
      // Fallback en cas d'erreur
      return [
        { title: 'Gris', value: 'grey' },
        { title: 'Vert', value: 'green' },
        { title: 'Bleu', value: 'blue' },
        { title: 'Violet', value: 'purple' }
      ]
    }
  },

  async getAvailableIcons() {
    try {
      return await this.get('available_icons')
    } catch (error) {
      // Fallback en cas d'erreur
      return ['⚪', '🟢', '🔵', '🟣', '🟠', '🔴', '🟡', '⚫']
    }
  }
}