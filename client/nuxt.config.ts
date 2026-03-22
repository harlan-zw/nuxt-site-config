import { resolve } from 'pathe'

export default defineNuxtConfig({
  ssr: false,

  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
  ],

  css: ['~/assets/css/global.css'],

  // @ts-expect-error @nuxt/fonts module config
  fonts: {
    families: [
      { name: 'Hubot Sans' },
    ],
  },

  devtools: {
    enabled: false,
  },

  nitro: {
    output: {
      publicDir: resolve(__dirname, '../packages/module/dist/client'),
    },
  },

  app: {
    baseURL: '/__nuxt-site-config',
  },

  compatibilityDate: '2025-03-13',
})
