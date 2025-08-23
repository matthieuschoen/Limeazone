// src/plugins/vuetify.js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'minecraft',
    themes: {
      minecraft: {
        dark: false,
        colors: {
          primary: '#8B4513',     // Brown like dirt blocks
          secondary: '#228B22',   // Green like grass
          accent: '#FFD700',      // Gold like gold blocks
          error: '#DC143C',       // Red like redstone
          info: '#1E90FF',        // Blue like water
          success: '#32CD32',     // Lime green
          warning: '#FFA500',     // Orange
          background: '#87CEEB',  // Sky blue
          surface: '#F5DEB3'      // Wheat color
        }
      }
    }
  }
})