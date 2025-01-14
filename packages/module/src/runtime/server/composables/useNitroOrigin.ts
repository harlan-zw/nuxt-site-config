import type { H3Event } from 'h3'
import { getRequestHost, getRequestProtocol } from 'h3'
import { withoutProtocol, withTrailingSlash } from 'ufo'

export function useNitroOrigin(e?: H3Event): string {
  const cert = process.env.NITRO_SSL_CERT
  const key = process.env.NITRO_SSL_KEY

  let host = process.env.NITRO_HOST || process.env.HOST || false
  let port: string | false = false
  if (import.meta.dev)
    port = process.env.NITRO_PORT || process.env.PORT || '3000'
  let protocol = ((cert && key) || !process.dev) ? 'https' : 'http'
  // don't trust development nitro headers
  if ((import.meta.dev || import.meta.prerender) && process.env.__NUXT_DEV__) {
    const origin = JSON.parse(process.env.__NUXT_DEV__).proxy.url
    host = withoutProtocol(origin)
    protocol = origin.includes('https') ? 'https' : 'http'
  }
  else if ((import.meta.dev || import.meta.prerender) && process.env.NUXT_VITE_NODE_OPTIONS) {
    const origin = JSON.parse(process.env.NUXT_VITE_NODE_OPTIONS).baseURL.replace('/__nuxt_vite_node__', '')
    host = withoutProtocol(origin)
    protocol = origin.includes('https') ? 'https' : 'http'
  }
  else if (e) {
    host = getRequestHost(e, { xForwardedHost: true }) || host
    protocol = getRequestProtocol(e, { xForwardedProto: true }) || protocol
  }
  if (typeof host === 'string' && host.includes(':')) {
    port = host.split(':').pop()!
    host = host.split(':')[0]
  }
  port = port ? `:${port}` : ''
  return withTrailingSlash(`${protocol}://${host}${port}`)
}
