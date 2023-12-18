import { defineNitroPlugin } from 'nitropack/dist/runtime/plugin'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', ({ event, siteConfig }) => {
    if (event.path.startsWith('/fr')) {
      siteConfig.push({
        name: 'Mon Site - nitro site config plugin',
        url: 'https://fr.example.com',
      })
    }
  })
})
