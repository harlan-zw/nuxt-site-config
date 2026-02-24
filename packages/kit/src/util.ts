import { env, isDevelopment } from 'std-env'

export interface NitroOriginContext {
  isDev?: boolean
  isPrerender?: boolean
  requestHost?: string
  requestProtocol?: 'http' | 'https'
}

function isLocalhostHost(host: string): boolean {
  if (!host || host.startsWith('localhost') || host.startsWith('127.') || host.startsWith('0.0.0.0'))
    return true
  // Handle IPv6 loopback/wildcard with or without port: [::1], [::1]:3000, ::1, [::], [::]
  const hostname = host.startsWith('[') ? host.slice(0, host.indexOf(']') + 1) : host
  return hostname === '[::1]' || hostname === '::1' || hostname === '[::]' || hostname === '::'
}

// Extract hostname (without port) from a host string, handling IPv6 brackets
function extractHostname(host: string): string {
  if (host.startsWith('[')) {
    const close = host.indexOf(']')
    return close !== -1 ? host.slice(0, close + 1) : host
  }
  // Single colon = host:port, multiple colons = bare IPv6
  const colonCount = host.split(':').length - 1
  return colonCount === 1 ? host.slice(0, host.indexOf(':')) : host
}

// Extract port and host separately, handling IPv6 bracket notation.
// Normalizes IPv6 loopback (::1, [::1]) and wildcard (::, [::], 0.0.0.0) to "localhost".
function splitHostPort(host: string): { host: string, port: string } {
  if (host.startsWith('[')) {
    const close = host.indexOf(']')
    const hostname = close !== -1 ? host.slice(0, close + 1) : host
    const port = (close !== -1 && host[close + 1] === ':') ? host.slice(close + 2) : ''
    const normalized = (hostname === '[::1]' || hostname === '[::]') ? 'localhost' : hostname
    return { host: normalized, port }
  }
  // 0.0.0.0 is "all interfaces" wildcard — normalize to localhost
  if (host === '0.0.0.0' || host.startsWith('0.0.0.0:')) {
    const i = host.indexOf(':')
    return { host: 'localhost', port: i !== -1 ? host.slice(i + 1) : '' }
  }
  // Single colon = host:port, multiple colons = bare IPv6
  const colonCount = host.split(':').length - 1
  if (colonCount === 1) {
    const i = host.indexOf(':')
    return { host: host.slice(0, i), port: host.slice(i + 1) }
  }
  // Bare IPv6 (e.g. ::1, 2001:db8::1)
  if (colonCount > 1) {
    const normalized = (host === '::1' || host === '::') ? 'localhost' : `[${host}]`
    return { host: normalized, port: '' }
  }
  return { host, port: '' }
}

export function getNitroOrigin(ctx: NitroOriginContext = {}): string {
  const isDev = ctx.isDev ?? isDevelopment
  const isPrerender = ctx.isPrerender ?? !!env.prerender

  let host = ''
  let port = ''
  let protocol: 'https' | 'http' = (env.NITRO_SSL_CERT && env.NITRO_SSL_KEY) ? 'https' : 'http'

  // dev/prerender: use nuxt dev server origin
  if (isDev || isPrerender) {
    const devEnv = env.__NUXT_DEV__ || env.NUXT_VITE_NODE_OPTIONS
    if (devEnv) {
      const parsed = JSON.parse(devEnv)
      const origin = (parsed.proxy?.url || parsed.baseURL?.replace('/__nuxt_vite_node__', '')) as string
      host = origin.replace(/^https?:\/\//, '').replace(/\/$/, '')
      protocol = origin.startsWith('https') ? 'https' : 'http'
    }
  }

  // in dev mode, prefer request host over localhost/127.0.0.1/[::1] from env var
  // handles custom devServer.host that Nuxt doesn't propagate to env vars
  if (isDev && isLocalhostHost(host) && ctx.requestHost) {
    const reqHost = extractHostname(ctx.requestHost)
    if (reqHost && !isLocalhostHost(reqHost)) {
      host = ctx.requestHost
      protocol = ctx.requestProtocol || protocol
    }
  }

  // request headers fallback (works for proxied requests with x-forwarded-*)
  if (!host && ctx.requestHost) {
    host = ctx.requestHost
    protocol = ctx.requestProtocol || protocol
  }

  // fallback to env vars
  if (!host) {
    host = env.NITRO_HOST || env.HOST || ''
    if (isDev)
      port = env.NITRO_PORT || env.PORT || '3000'
  }

  // extract port from host if present (e.g. "localhost:3000", "[::1]:3000")
  const split = splitHostPort(host)
  host = split.host
  if (split.port)
    port = split.port

  // allow overrides
  host = env.NUXT_SITE_HOST_OVERRIDE || host
  port = env.NUXT_SITE_PORT_OVERRIDE || port

  // handle host with protocol
  if (host.startsWith('http://') || host.startsWith('https://')) {
    protocol = host.startsWith('https://') ? 'https' : 'http'
    host = host.replace(/^https?:\/\//, '')
  }
  // in production, default non-localhost hosts to https
  // in dev mode, trust the protocol from dev env / request headers
  else if (!isDev && (!host || !isLocalhostHost(host))) {
    protocol = 'https'
  }

  return `${protocol}://${host}${port ? `:${port}` : ''}/`
}

/**
 * @deprecated use getNitroOrigin instead
 */
export function useNitroOrigin(): string {
  return getNitroOrigin()
}
