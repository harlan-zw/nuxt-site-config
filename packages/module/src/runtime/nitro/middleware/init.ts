import { createSiteConfigStack } from 'site-config-stack'
import { defineEventHandler, useAppConfig, useNitroOrigin, useRuntimeConfig } from '#imports'

function getEnv(config: string): string | undefined {
  const key = config.toUpperCase()
  const env = import.meta.env || {}
  const privateKey = `NUXT_SITE_${key}`
  const publicKey = `NUXT_PUBLIC_SITE_${key}`
  if (privateKey in env)
    return env[privateKey]
  if (publicKey in env)
    return env[publicKey]
}

export default defineEventHandler((e) => {
  // this does need to be a middleware so the nitro origin is always up to date
  const config = useRuntimeConfig()['nuxt-site-config']
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
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
    siteConfig.push({
      _context: 'runtimeEnv',
      _priority: 0,
      env: getEnv('Env'),
      url: getEnv('Url'),
      name: getEnv('Name'),
      description: getEnv('Description'),
      logo: getEnv('Image'),
      defaultLocale: getEnv('Language'),
      indexable: getEnv('Indexable'),
    })
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
