import type { SiteConfig } from '../../type'
import { createSiteConfigContainer } from '../siteConfig'
import { defineNuxtPlugin, useRequestEvent, useState } from '#imports'

export default defineNuxtPlugin({
  name: 'nuxt-site-config',
  enforce: 'pre', // or 'post'
  async setup(nuxtApp) {
    // this is the equivalent of a normal functional plugin
    let siteConfigContainer
    if (process.server) {
      siteConfigContainer = useRequestEvent().context.siteConfig
      nuxtApp.hooks.hook('app:rendered', () => {
        useState('site-config', () => useRequestEvent().context.siteConfig.get())
      })
    }
    if (!siteConfigContainer)
      siteConfigContainer = createSiteConfigContainer()
    if (process.client) {
      // init with runtime config and app config
      const state = useState<SiteConfig>('site-config')
      if (state)
        siteConfigContainer.push(state.value)
    }
    return {
      provide: {
        siteConfig: siteConfigContainer,
      },
    }
  },
})
