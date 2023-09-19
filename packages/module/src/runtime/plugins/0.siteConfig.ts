import { createSiteConfigStack } from 'site-config-stack'
import type { SiteConfig } from 'site-config-stack'
import { defineNuxtPlugin, useRequestEvent, useState } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config',
  enforce: 'pre',
  async setup(nuxtApp) {
    let siteConfigStack
    if (process.server) {
      siteConfigStack = useRequestEvent().context.siteConfig
      nuxtApp.hooks.hook('app:rendered', () => {
        useState('site-config', () => useRequestEvent().context.siteConfig.get())
      })
    }
    if (!siteConfigStack)
      siteConfigStack = createSiteConfigStack()
    if (process.client) {
      // let's add the site origin as the site name for SPA
      siteConfigStack.push({
        _context: 'window',
        url: window.location.origin,
      })
      // init with runtime config and app config
      const state = useState<SiteConfig>('site-config')
      if (state.value)
        siteConfigStack.push(state.value)
    }
    return {
      provide: {
        nuxtSiteConfig: siteConfigStack,
      },
    }
  },
})
