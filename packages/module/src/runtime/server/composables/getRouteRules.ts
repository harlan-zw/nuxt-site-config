import type { H3Event } from 'h3'
import type { SiteConfigInput } from '../../types'
import { normalizeNitroMatchedRouteRules } from 'nuxtseo-shared/server'
import { getNitroRouteRules, hasMatchedRouteRules } from '#nuxt-site-config/route-rules'

interface MatchedRouteRule {
  options: unknown
}

interface SiteRouteRules {
  site?: SiteConfigInput
  ssr?: boolean
}

export function getSiteRouteRules(event: H3Event): SiteRouteRules & { ssr: boolean } {
  const nitroRouteRules = getNitroRouteRules(event)
  const routeRules = hasMatchedRouteRules
    ? normalizeNitroMatchedRouteRules(nitroRouteRules as Record<string, MatchedRouteRule>) as SiteRouteRules
    : nitroRouteRules as SiteRouteRules
  return {
    site: routeRules.site,
    // Nitro 3 removes matched false rules, while Nuxt treats a missing ssr rule as no-SSR.
    ssr: routeRules.ssr ?? false,
  }
}
