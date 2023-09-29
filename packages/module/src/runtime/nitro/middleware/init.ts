import { createSiteConfigStack } from 'site-config-stack'
import { defineEventHandler, useAppConfig, useNitroOrigin, useRuntimeConfig } from '#imports'

export default defineEventHandler((e) => {
  const config = useRuntimeConfig()['nuxt-site-config']
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    // @ts-expect-error untyped
    debug: config.debug,
  })
  if (siteConfig) {
    const appConfig = useAppConfig()
    const nitroOrigin = useNitroOrigin(e)
    e.context.siteConfigNitroOrigin = nitroOrigin
    siteConfig.push({
      _context: 'nitro:init',
      _priority: -4,
      url: nitroOrigin,
    })
    // @ts-expect-error runtime type
    const buildStack = config.stack || []
    // @ts-expect-error runtime type
    buildStack.forEach(c => siteConfig.push(c))
    if (appConfig.site) {
      siteConfig.push({
        _priority: -2,
        _context: 'app:config',
        ...appConfig.site,
      })
    }
    // append route rules
    if (e.context._nitro.routeRules.site) {
      siteConfig.push({
        _context: 'route-rules',
        ...e.context._nitro.routeRules.site,
      })
    }
  }
  e.context.siteConfig = siteConfig
})
