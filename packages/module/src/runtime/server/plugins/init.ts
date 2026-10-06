import { getNitroOrigin } from 'nuxt-site-config-kit/util'
import { matchRouteRules, useRuntimeConfig } from 'nuxt/server'
import { withoutBase } from 'ufo'
import { getRequestHost, getRequestProtocol } from '#nuxtseo/h3'
import { defineNitroPlugin } from '#nuxtseo/nitro'
import { initRequestSiteConfig } from '../init'

export default defineNitroPlugin((nitroApp) => {
  // Nitro invokes this hook before user middleware and before route rules are attached.
  nitroApp.hooks.hook('request', (event) => {
    const path = withoutBase(event.path.split('?')[0] || '/', useRuntimeConfig().app.baseURL)
    return initRequestSiteConfig(event, getNitroOrigin({
      isDev: import.meta.dev,
      isPrerender: import.meta.prerender,
      requestHost: getRequestHost(event, { xForwardedHost: true }),
      requestProtocol: getRequestProtocol(event, { xForwardedProto: true }) as 'http' | 'https',
    }), matchRouteRules(path, event.method))
  })
})
