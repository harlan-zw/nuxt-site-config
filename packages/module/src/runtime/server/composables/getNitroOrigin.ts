import type { H3Event } from 'h3'
import { getNitroOrigin as _getNitroOrigin } from 'nuxt-site-config-kit/util'
import { getRequestHost, getRequestProtocol } from '#nuxtseo/h3'

export function getNitroOrigin(e?: H3Event): string {
  return _getNitroOrigin({
    isDev: import.meta.dev,
    isPrerender: import.meta.prerender,
    requestHost: e ? getRequestHost(e, { xForwardedHost: true }) : undefined,
    requestProtocol: e ? getRequestProtocol(e, { xForwardedProto: true }) as 'http' | 'https' : undefined,
  })
}
