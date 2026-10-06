import type { RequestEvent } from 'nuxt/server'
import { getRouteRules } from 'nuxt/server'
// @ts-expect-error virtual server template
import { NUXT_SITE_CONFIG_SSR_DEFAULT } from '#nuxt-site-config/no-ssr.mjs'

export function getSiteRouteRules(event: Pick<RequestEvent, 'context'>) {
  const routeRules = getRouteRules(event)
  // Nitro 3 omits false rules and supplies ssr:true for the normal SSR baseline.
  return { site: routeRules.site, ssr: routeRules.ssr ?? NUXT_SITE_CONFIG_SSR_DEFAULT }
}
