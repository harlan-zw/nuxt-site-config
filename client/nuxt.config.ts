import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'pathe'

const layerDir = resolve(dirname(fileURLToPath(import.meta.resolve('nuxtseo-shared'))), 'layer-devtools')

export default defineNuxtConfig({
  extends: [layerDir],

  nitro: {
    output: {
      publicDir: resolve(__dirname, '../packages/module/dist/client'),
    },
  },

  app: {
    baseURL: '/__nuxt-site-config',
  },
})
