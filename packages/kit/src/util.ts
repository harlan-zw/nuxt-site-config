import { env, isDevelopment } from 'std-env'

export interface NitroOriginContext {
  isDev?: boolean
  isPrerender?: boolean
  requestHost?: string
  requestProtocol?: 'http' | 'https'
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
      host = origin.replace(/^https?:\/\//, '')
      protocol = origin.startsWith('https') ? 'https' : 'http'
    }
  }

  // request headers (works for proxied requests with x-forwarded-*)
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

  // extract port from host if present (e.g. "localhost:3000")
  if (host.includes(':')) {
    const i = host.lastIndexOf(':')
    port = host.slice(i + 1)
    host = host.slice(0, i)
  }

  // allow overrides
  host = env.NUXT_SITE_HOST_OVERRIDE || host
  port = env.NUXT_SITE_PORT_OVERRIDE || port

  return `${protocol}://${host}${port ? `:${port}` : ''}/`
}

/**
 * @deprecated use getNitroOrigin instead
 */
export function useNitroOrigin(): string {
  return getNitroOrigin()
}
