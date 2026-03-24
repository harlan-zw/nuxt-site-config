import { resolve } from 'node:path'
import { startSubprocess } from '@nuxt/devtools-kit'
import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { defineNuxtConfig } from 'nuxt/config'
import NuxtSitConfig from '../packages/module/src/module'

const resolver = createResolver(import.meta.url)

process.env.playground = true

export default defineNuxtConfig({
  modules: [
    NuxtSitConfig,
    '@nuxtjs/i18n',
  ],

  nitro: {
    plugins: [
      '~/server/plugin/site-config',
    ],
    typescript: {
      internalPaths: true,
    },
  },

  runtimeConfig: {
    public: {
      site: {
        bar: 'baz',
      },
    },
  },

  site: {
    foo: '<\/script><script>alert("xss")<\/script>',
    debug: true,
  },

  i18n: {
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        language: 'en-US',
        file: resolver.resolve('locales/en-US.json'),
      },
      {
        code: 'fr',
        language: 'fr-FR',
        file: resolver.resolve('locales/fr-FR.json'),
      },
    ],
    defaultLocale: 'en',
    strategy: 'prefix_except_default',
  },

  compatibilityDate: '2024-11-03',
})
