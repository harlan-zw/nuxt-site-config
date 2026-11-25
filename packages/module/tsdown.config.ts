import { builder } from '@nuxt/module-builder/tsdown'
import { defineConfig } from 'tsdown'

export default defineConfig({
  plugins: [
    builder({
      entries: [
        './src/kit',
        './src/utils',
        './src/urls',
      ],
      externals: [
        '#imports',
        'nuxt/server',
        '@nuxt/schema',
      ],
    }),
  ],
})
