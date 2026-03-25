export default defineNuxtConfig({
  modules: ['nuxt-site-config'],

  site: {
    url: 'https://example.com',
    name: 'My Website',
    description: 'My awesome website',
    defaultLocale: 'en',
  },

  compatibilityDate: '2025-01-01',
})
