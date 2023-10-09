import { createSiteConfigStack } from 'site-config-stack'
import type { SiteConfig } from 'site-config-stack'
import { parse } from 'devalue'
import { defineNuxtPlugin, useNuxtApp, useRequestEvent, useRuntimeConfig, useState } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config',
  enforce: 'pre',
  async setup(nuxtApp) {
    const config = useRuntimeConfig()['nuxt-site-config'] || { debug: false }
    let stack
    const state = useState<SiteConfig>('site-config')
    if (process.server) {
      stack = useRequestEvent().context.siteConfig
      nuxtApp.hooks.hook('app:rendered', () => {
        state.value = useRequestEvent().context.siteConfig.get()
      })
    }
    if (!stack) {
      stack = createSiteConfigStack({
        debug: config.debug,
      })
    }
    if (process.client) {
      // let's add the site origin as the site name for SPA
      stack.push({
        _context: 'window',
        url: window.location.origin,
      })
      const nuxt = useNuxtApp()
      if (nuxt.payload.serverRendered) {
        // init with runtime config and app config
        stack.push(state.value)
        // state is missing, we need to fallback to
      }
      else {
        // need to hydrate from the template
        stack.push(parse(window.__NUXT_SITE_CONFIG__))
      }
    }
    return {
      provide: {
        nuxtSiteConfig: stack,
      },
    }
  },
})
