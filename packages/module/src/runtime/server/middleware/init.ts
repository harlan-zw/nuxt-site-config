import type { HookSiteConfigInitContext } from '../../types'
import { eventHandler } from 'h3'
import { useNitroApp, useRuntimeConfig } from 'nitropack/runtime'
import { createSiteConfigStack, envSiteConfig } from 'site-config-stack'
import { parseURL } from 'ufo'
import { useNitroOrigin } from '../composables/useNitroOrigin'

export default eventHandler(async (e) => {
  if (e.context._initedSiteConfig)
    return
  const runtimeConfig = useRuntimeConfig(e)
  // this does need to be a middleware so the nitro origin is always up to date
  const config = runtimeConfig['nuxt-site-config']
  const nitroApp = useNitroApp()
  const siteConfig = e.context.siteConfig || createSiteConfigStack({
    debug: config.debug,
  })
  const nitroOrigin = useNitroOrigin(e)
  e.context.siteConfigNitroOrigin = nitroOrigin
  // this will always be wrong when prerendering
  if (!import.meta.prerender) {
    siteConfig.push({
      _context: 'nitro:init',
      _priority: -4,
      url: nitroOrigin,
    })
  }
  siteConfig.push({
    _context: 'runtimeEnv',
    _priority: 0,
    ...(runtimeConfig.site || {}),
    ...(runtimeConfig.public.site || {}),
    ...envSiteConfig(import.meta.env), // just in-case, shouldn't be needed
  })
  const buildStack = config.stack || []
  buildStack.forEach((c: any) => siteConfig.push(c))
  // append route rules
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: 'route-rules',
      ...e.context._nitro.routeRules.site,
    })
  }
  if (config.multiTenancy) {
    // iterate to find the one with hosts that match
    const host = parseURL(nitroOrigin).host
    const tenant = config.multiTenancy?.find((t: any) => t.hosts.includes(host))
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: 0,
        ...tenant.config,
      })
    }
  }
  const ctx: HookSiteConfigInitContext = { siteConfig, event: e }
  await (nitroApp.hooks as any).callHook('site-config:init', ctx)
  e.context.siteConfig = ctx.siteConfig
  e.context._initedSiteConfig = true
})
