import type { RequestEvent } from 'nuxt/server'
import { getNitroOrigin as resolveNitroOrigin } from 'nuxt-site-config-kit/util'
import { getRequestHost, getRequestProtocol } from 'nuxt/server'

export function getNitroOrigin(event?: Pick<RequestEvent, 'context'> & Partial<Pick<RequestEvent, 'req'>>): string {
  if (event?.context.siteConfigNitroOrigin)
    return event.context.siteConfigNitroOrigin
  return resolveNitroOrigin({
    isDev: import.meta.dev,
    isPrerender: import.meta.prerender,
    requestHost: event?.req ? getRequestHost({ req: event.req }, { xForwardedHost: true }) : undefined,
    requestProtocol: event?.req ? getRequestProtocol({ req: event.req }, { xForwardedProto: true }) as 'http' | 'https' : undefined,
  })
}
