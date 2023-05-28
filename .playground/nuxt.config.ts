import { defineNuxtConfig } from 'nuxt/config'
import NuxtSiteConfig from '../src/module'

export default defineNuxtConfig({
  modules: [
    NuxtSiteConfig,
    '@nuxthq/ui',
    'nuxt-icon'
  ],
})
