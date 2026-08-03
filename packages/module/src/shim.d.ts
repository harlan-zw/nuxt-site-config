declare module '#nuxt-site-config/route-rules' {
  export const hasMatchedRouteRules: boolean
  export function getNitroRouteRules(event: import('h3').H3Event): Record<string, unknown>
}
