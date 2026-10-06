import NuxtSiteConfig from 'nuxt-site-config'

export default defineNuxtConfig({
  future: { compatibilityVersion: process.env.NUXT_TEST_FUTURE === '5' ? 5 : 4 },
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

  compatibilityDate: '2026-10-06',
})
