import { resolve } from 'node:path'
import { defineNuxtModule } from '@nuxt/kit'
import { updateSiteConfig, useSiteConfig } from '../../../packages/kit/src'

export default defineNuxtConfig({
  modules: [
    defineNuxtModule({
      meta: { name: 'site-config-consumer' },
      moduleDependencies: {
        'nuxt-site-config': {},
      },
      setup() {
        const site = useSiteConfig()
        updateSiteConfig({ name: 'Module Site', description: `Read ${site.name} during setup` })
      },
    }),
  ],
  alias: {
    'nuxt-site-config': resolve(import.meta.dirname, '../../../packages/module/src/module'),
  },
  site: {
    url: 'https://dependency.example.com',
    name: 'User Site',
  },
  compatibilityDate: '2026-10-01',
})
