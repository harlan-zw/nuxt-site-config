import NuxtSiteConfig from 'nuxt-site-config'

export default defineNuxtConfig({
  workspaceDir: import.meta.dirname,
  vite: { resolve: { dedupe: ['nuxt', 'vue', 'vue-router'] } },
  app: { baseURL: process.env.NUXT_TEST_BASE_URL || '/base/' },
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
