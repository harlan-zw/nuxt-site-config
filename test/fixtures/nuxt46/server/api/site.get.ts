import type { AppRouteRules } from 'nuxt/server'
import { getSiteConfig } from '#imports'
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
    nitroOrigin,
    rule: siteRouteRule,
  }
})
