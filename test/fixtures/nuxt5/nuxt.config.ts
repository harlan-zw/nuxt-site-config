import NuxtSiteConfig from 'nuxt-site-config'
import NuxtSeoShared from 'nuxtseo-shared'

// Stable support excludes prereleases. This fixture enables only its pinned nightly.
for (const module of [NuxtSiteConfig, NuxtSeoShared]) {
  const meta = await module.getMeta?.()
  if (!meta)
    throw new Error('Fixture module metadata unavailable')
  meta.compatibility = { ...meta.compatibility, nuxt: '^4.6.0 || ^5.0.0 || 5.0.0-2610061032-c7ad8cd' }
}

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
