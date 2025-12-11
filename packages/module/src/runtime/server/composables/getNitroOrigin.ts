import type { H3Event } from 'h3'
import { getRequestHost, getRequestProtocol } from 'h3'

export function getNitroOrigin(e?: H3Event): string {
  let host = ''
  let port = ''
  let protocol: 'https' | 'http' = (process.env.NITRO_SSL_CERT && process.env.NITRO_SSL_KEY) ? 'https' : 'http'

  // dev/prerender: use nuxt dev server origin
  if (import.meta.dev || import.meta.prerender) {
    const devEnv = process.env.__NUXT_DEV__ || process.env.NUXT_VITE_NODE_OPTIONS
    if (devEnv) {
      const parsed = JSON.parse(devEnv)
      const origin = (parsed.proxy?.url || parsed.baseURL?.replace('/__nuxt_vite_node__', '')) as string
      host = origin.replace(/^https?:\/\//, '')
      protocol = origin.startsWith('https') ? 'https' : 'http'
    }
  }

  // request headers (works for proxied requests with x-forwarded-*)
  if (!host && e) {
    host = getRequestHost(e, { xForwardedHost: true }) || ''
    protocol = getRequestProtocol(e, { xForwardedProto: true }) as 'https' | 'http' || protocol
  }

  // fallback to env vars
  if (!host) {
    host = process.env.NITRO_HOST || process.env.HOST || ''
    if (import.meta.dev)
      port = process.env.NITRO_PORT || process.env.PORT || '3000'
  }

  // extract port from host if present (e.g. "localhost:3000")
  if (host.includes(':')) {
    const i = host.lastIndexOf(':')
    port = host.slice(i + 1)
    host = host.slice(0, i)
  }

  // allow overrides
  host = process.env.NUXT_SITE_HOST_OVERRIDE || host
  port = process.env.NUXT_SITE_PORT_OVERRIDE || port

  return `${protocol}://${host}${port ? `:${port}` : ''}/`
}
