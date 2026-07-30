import NuxtSiteConfig from '../../../packages/module/src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSiteConfig,
  ],

  site: {
    name: 'Nuxt 5 SPA',
    url: 'https://nuxt5.example.com',
  },

  routeRules: {
    '/spa': {
      ssr: false,
      site: {
        name: 'Nuxt 5 Route Site',
      },
    },
  },

  compatibilityDate: '2026-06-10',
})
