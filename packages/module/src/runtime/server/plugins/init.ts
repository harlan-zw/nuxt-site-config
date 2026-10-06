import { getNitroOrigin } from 'nuxt-site-config-kit/util'
import { matchRouteRules } from 'nuxt/server'
import { getRequestHost, getRequestProtocol } from '#nuxtseo/h3'
import { defineNitroPlugin } from '#nuxtseo/nitro'
import { initRequestSiteConfig } from '../init'

export default defineNitroPlugin((nitroApp) => {
  // Nitro invokes this hook before user middleware and before route rules are attached.
  nitroApp.hooks.hook('request', event => initRequestSiteConfig(event, getNitroOrigin({
    isDev: import.meta.dev,
    isPrerender: import.meta.prerender,
    requestHost: getRequestHost(event, { xForwardedHost: true }),
    requestProtocol: getRequestProtocol(event, { xForwardedProto: true }) as 'http' | 'https',
  }), matchRouteRules(event.path, event.method)))
})
