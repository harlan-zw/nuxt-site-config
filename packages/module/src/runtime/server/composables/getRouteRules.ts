import type { RequestEvent } from 'nuxt/server'
import { getRouteRules } from 'nuxt/server'

export function getSiteRouteRules(event: Pick<RequestEvent, 'context'>) {
  const routeRules = getRouteRules(event)
  // Missing ssr means SSR is enabled unless explicitly disabled via ssr: false.
  return { site: routeRules.site, ssr: routeRules.ssr !== false }
}
