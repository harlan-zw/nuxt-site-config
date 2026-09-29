import type { H3Event } from 'h3'
import type { HookSiteConfigInitContext } from '../types'
import { createSiteConfigStack, envSiteConfig, SiteConfigPriority } from 'site-config-stack'
import { parseURL } from 'ufo'
import { useNitroApp, useRuntimeConfig } from '#nuxtseo/nitro'
import { getNitroOrigin } from './composables/getNitroOrigin'
import { getSiteRouteRules } from './composables/getRouteRules'

const PORT_SUFFIX_RE = /:\d+$/
const serverEnvSiteConfig = envSiteConfig(import.meta.env || {})

/**
 * Resolve the site config stack for a request, once.
 *
 * Runs from the Nitro `request` hook, so it lands before every server middleware,
 * including the user's own. The middleware stays as a fallback.
 */
export async function initRequestSiteConfig(e: H3Event): Promise<void> {
  if (e.context._initedSiteConfig)
    return
  const runtimeConfig = useRuntimeConfig(e)
  // resolved per request so the nitro origin is always up to date
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
    ...serverEnvSiteConfig,
  })
  const buildStack = config.stack || []
  buildStack.forEach((c: any) => siteConfig.push(c))
  // append route rules
  const routeRules = getSiteRouteRules(e)
  if (routeRules.site) {
    siteConfig.push({
      _context: 'route-rules',
      ...routeRules.site,
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
}
