import { createSiteConfigStack } from 'site-config-stack'
import type { SiteConfigInput, SiteConfigResolved, SiteConfigStack } from 'site-config-stack'
import { defineNuxtPlugin, useNuxtApp, useRequestEvent, useRuntimeConfig, useState } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config',
  enforce: 'pre',
  async setup(nuxtApp) {
    const config = (useRuntimeConfig()['nuxt-site-config'] || { debug: false }) as SiteConfigInput
    let stack: SiteConfigStack | undefined
    const state = useState<SiteConfigResolved>('site-config')
    if (process.server) {
      const { context } = useRequestEvent()
      stack = context.siteConfig
      nuxtApp.hooks.hook('app:rendered', () => {
        state.value = context.siteConfig.get({
          debug: false,
          skipNormalize: true,
          resolveRefs: true,
        })
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
        stack.push(state.value as any as SiteConfigInput)
        // state is missing, we need to fallback to
      }
      // @ts-expect-error untyped
      else if (typeof window.__NUXT_SITE_CONFIG__ !== 'undefined') {
        // need to hydrate from the template
        // @ts-expect-error untyped
        stack.push(window.__NUXT_SITE_CONFIG__)
      }
    }
    return {
      provide: {
        nuxtSiteConfig: stack,
      },
    }
  },
})
