import type { SiteConfigResolved } from 'site-config-stack'
import { defineNuxtPlugin, useRequestEvent, useRuntimeConfig, useState } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config',
  enforce: 'pre',
  async setup(nuxtApp) {
    const state = useState<SiteConfigResolved>('site-config')
    if (process.server) {
      const { context } = useRequestEvent()
      nuxtApp.hooks.hook('app:rendered', () => {
        // this is the last point before we render it for the client-side, let's validate it
        state.value = context.siteConfig.get({
          debug: useRuntimeConfig()['nuxt-site-config'].debug,
          resolveRefs: true,
        })
      })
    }

    let stack: SiteConfigResolved = {}
    if (process.client)
      stack = state.value || window.__NUXT_SITE_CONFIG__
    return {
      provide: {
        nuxtSiteConfig: stack,
      },
    }
  },
})
