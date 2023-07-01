import { createSiteConfigStack } from 'site-config-stack'
import type { SiteConfig } from 'site-config-stack'
import { defineNuxtPlugin, useRequestEvent, useState } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    // this is the equivalent of a normal functional plugin
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
      // init with runtime config and app config
      const state = useState<SiteConfig>('site-config')
      if (state)
        siteConfigStack.push(state.value)
    }
    return {
      provide: {
        siteConfig: siteConfigStack,
      },
    }
  },
})
