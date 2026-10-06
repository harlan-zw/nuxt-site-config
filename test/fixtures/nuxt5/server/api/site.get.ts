import type { AppRouteRules } from 'nuxt/server'
import { getSiteConfig, withSiteUrl } from '#site-config/server'
import { defineEventHandler } from 'nuxt/server'

const siteRouteRule = {
  site: {
    name: 'Nuxt 5 Route Site',
  },
} satisfies AppRouteRules

export default defineEventHandler((event) => {
  const nitroOrigin: string | undefined = event.context.siteConfigNitroOrigin
  return {
    config: getSiteConfig(event),
    aliasUrl: withSiteUrl(event, '/alias-proof'),
    nitroOrigin,
    rule: siteRouteRule,
  }
})
