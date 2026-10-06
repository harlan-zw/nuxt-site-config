import type { RequestEvent } from 'nuxt/server'
import { getNitroOrigin as resolveNitroOrigin } from 'nuxt-site-config-kit/util'

export function getNitroOrigin(event?: Pick<RequestEvent, 'context'> & Partial<Pick<RequestEvent, 'req'>>): string {
  if (event?.context.siteConfigNitroOrigin)
    return event.context.siteConfigNitroOrigin
  const headers = event?.req?.headers
  const forwardedHost = headers?.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProtocol = headers?.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const requestProtocol = event?.req ? new URL(event.req.url).protocol.slice(0, -1) as 'http' | 'https' : undefined
  return resolveNitroOrigin({
    isDev: import.meta.dev,
    isPrerender: import.meta.prerender,
    requestHost: forwardedHost || headers?.get('host') || undefined,
    requestProtocol: forwardedProtocol === 'https' || forwardedProtocol === 'http' ? forwardedProtocol : requestProtocol,
  })
}
