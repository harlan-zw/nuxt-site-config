import { defineEventHandler, getRouteRules, useRuntimeConfig } from 'nuxt/server'
import { getNitroOrigin } from '../composables/getNitroOrigin'
import { initRequestSiteConfig } from '../init'
import { isNuxtErrorPath, resolveRequestPath } from '../util'

export default defineEventHandler((e) => {
  if (e.context._initedSiteConfig)
    return
  const path = resolveRequestPath(e, useRuntimeConfig().app.baseURL)
  const isError = isNuxtErrorPath(path)
  return initRequestSiteConfig(e, getNitroOrigin(e), isError ? {} : getRouteRules(e))
})
