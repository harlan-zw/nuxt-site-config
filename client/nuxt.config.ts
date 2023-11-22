import { resolve } from 'pathe'
import DevtoolsUIKit from '@nuxt/devtools-ui-kit'

export default defineNuxtConfig({
  ssr: false,
  modules: [
    DevtoolsUIKit,
  ],
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
})
