import { defineNuxtPlugin } from '#app'
import { useRequestEvent, useRuntimeConfig, useState } from '#imports'
import type { SiteConfigResolved } from 'site-config-stack'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:init',
  enforce: 'pre',
  async setup(nuxtApp) {
    const state = useState<SiteConfigResolved>('site-config')
    if (import.meta.server) {
      const context = useRequestEvent()?.context
      nuxtApp.hooks.hook('app:rendered', () => {
        // this is the last point before we render it for the client-side, let's validate it
        state.value = context?.siteConfig.get({
          debug: useRuntimeConfig()['nuxt-site-config'].debug,
          resolveRefs: true,
        })
      })
    }

    let stack: SiteConfigResolved = {}
    if (import.meta.client)
      stack = state.value || window.__NUXT_SITE_CONFIG__
    return {
      provide: {
        nuxtSiteConfig: stack,
      },
    }
  },
})
