import type { SiteConfigResolved } from 'site-config-stack'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig, useState } from '#app'
import { createSiteConfigStack } from 'site-config-stack'

export default defineNuxtPlugin({
  name: 'nuxt-site-config:init',
  enforce: 'pre',
  async setup(nuxtApp) {
    const stack = import.meta.server ? useRequestEvent()?.context?.siteConfig : createSiteConfigStack()
    const state = useState<SiteConfigResolved | undefined>('site-config')
    if (import.meta.server) {
      nuxtApp.hooks.hook('app:rendered', () => {
        // this is the last point before we render it for the client-side, let's validate it
        state.value = stack?.get({
          debug: useRuntimeConfig()['nuxt-site-config'].debug,
          resolveRefs: true,
        })
      })
    }

    if (import.meta.client) {
      const store = (state.value || window.__NUXT_SITE_CONFIG__) || {}
      for (const k in store) {
        if (k[0] !== '_') {
          stack!.push({ [k]: store[k], _priority: store._priority?.[k] || -1 })
        }
      }
    }
    return {
      provide: {
        nuxtSiteConfig: stack,
      },
    }
  },
})
