import type { NitroRouteConfig } from 'nitro/types'
import { getSiteConfig } from '#imports'
import { eventHandler } from 'nitro/h3'

const siteRouteRule = {
  site: {
    name: 'Nuxt 5 Route Site',
  },
} satisfies NitroRouteConfig

export default eventHandler((event) => {
  const nitroOrigin: string = event.context.siteConfigNitroOrigin
  return {
    config: getSiteConfig(event),
    nitroOrigin,
    rule: siteRouteRule,
  }
})
