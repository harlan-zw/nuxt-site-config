import { getNitroOrigin } from 'nuxt-site-config-kit/util'
import { matchRouteRules, useRuntimeConfig } from 'nuxt/server'
import { getRequestHost, getRequestProtocol } from '#nuxtseo/h3'
import { defineNitroPlugin } from '#nuxtseo/nitro'
import { initRequestSiteConfig } from '../init'
import { isNuxtErrorPath, resolveRequestPath } from '../util'

export default defineNitroPlugin((nitroApp) => {
  // Nitro invokes this hook before user middleware and before route rules are attached.
  nitroApp.hooks.hook('request', (event) => {
    if (event.context._initedSiteConfig)
      return
    const path = resolveRequestPath(event, useRuntimeConfig().app.baseURL)
    const isError = isNuxtErrorPath(path)
    return initRequestSiteConfig(event, getNitroOrigin({
      isDev: import.meta.dev,
      isPrerender: import.meta.prerender,
      requestHost: getRequestHost(event, { xForwardedHost: true }),
      requestProtocol: getRequestProtocol(event, { xForwardedProto: true }) as 'http' | 'https',
    }), isError ? {} : matchRouteRules(path, event.method))
  })
})
