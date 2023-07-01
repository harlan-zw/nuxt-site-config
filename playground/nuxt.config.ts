import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    'nuxt-site-config',
    '@nuxthq/ui',
    'nuxt-icon',
    '@nuxtjs/i18n'
  ],

  i18n: {
    lazy: true,
    langDir: 'locales/',
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en-US.json',
      },
      {
        code: 'fr',
        iso: 'fr-FR',
        file: 'fr-FR.json',
      }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
  }
})
