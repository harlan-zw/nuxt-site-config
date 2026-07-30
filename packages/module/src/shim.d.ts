declare module '#nuxt-site-config/server-runtime' {
  export { eventHandler, getRequestHost, getRequestProtocol, setHeader } from 'h3'
  export { defineNitroPlugin, useNitroApp, useRuntimeConfig } from 'nitropack/runtime'

  export function getRouteRules(event: import('h3').H3Event): ReturnType<typeof import('nitropack/runtime').getRouteRules> & {
    site?: import('./runtime/types').SiteConfigInput
  }
}
