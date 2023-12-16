import { createSiteConfigStack, envSiteConfig } from 'site-config-stack'
import { defineEventHandler } from 'h3'
import { useAppConfig, useRuntimeConfig } from '#imports'
import { useNitroOrigin } from '#internal/nuxt-site-config'

export default defineEventHandler((e) => {
  // this does need to be a middleware so the nitro origin is always up to date
  const config = useRuntimeConfig(e)['nuxt-site-config']
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug,
  })
  if (siteConfig) {
    const appConfig = useAppConfig(e)
    const nitroOrigin = useNitroOrigin(e)
    e.context.siteConfigNitroOrigin = nitroOrigin
    siteConfig.push({
      _context: 'nitro:init',
      _priority: -4,
      url: nitroOrigin,
    })
    siteConfig.push({
      _context: 'runtimeEnv',
      _priority: 0,
      // @ts-expect-error untyped
      ...envSiteConfig(import.meta.env),
    })
    const buildStack = config.stack || []
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
