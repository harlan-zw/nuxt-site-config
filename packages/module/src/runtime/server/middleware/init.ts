import type { HookSiteConfigInitContext } from '../../types'
import { eventHandler } from 'h3'
import { useNitroApp, useRuntimeConfig } from 'nitropack/runtime'
import { createSiteConfigStack, envSiteConfig, SiteConfigPriority } from 'site-config-stack'
import { parseURL } from 'ufo'
import { getNitroOrigin } from '../composables/getNitroOrigin'

const PORT_SUFFIX_RE = /:\d+$/

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
  const nitroOrigin = getNitroOrigin(e)
  e.context.siteConfigNitroOrigin = nitroOrigin
  // this will always be wrong when prerendering
  if (!import.meta.prerender) {
    siteConfig.push({
      _context: 'nitro:init',
      _priority: SiteConfigPriority.nitro,
      url: nitroOrigin,
    })
  }
  siteConfig.push({
    _context: 'runtimeEnv',
    _priority: SiteConfigPriority.runtime,
    ...(runtimeConfig.site || {}),
    ...(runtimeConfig.public.site || {}),
    ...envSiteConfig(import.meta.env || {}), // just in-case, shouldn't be needed
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
    // strip port so dev-mode hosts like example.com.local:3000 match config entries
    const host = parseURL(nitroOrigin).host?.replace(PORT_SUFFIX_RE, '') || ''
    const tenant = config.multiTenancy?.find((t: any) => t.hosts.includes(host))
    if (tenant) {
      siteConfig.push({
        _context: `multi-tenancy:${host}`,
        _priority: SiteConfigPriority.runtime,
        ...tenant.config,
      })
    }
  }
  const ctx: HookSiteConfigInitContext = { siteConfig, event: e }
  await (nitroApp.hooks as any).callHook('site-config:init', ctx)
  e.context.siteConfig = ctx.siteConfig
  e.context._initedSiteConfig = true
})
