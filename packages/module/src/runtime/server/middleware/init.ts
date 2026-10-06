import { defineEventHandler, getRouteRules } from 'nuxt/server'
import { getNitroOrigin } from '../composables/getNitroOrigin'
import { initRequestSiteConfig } from '../init'

export default defineEventHandler(e => initRequestSiteConfig(e, getNitroOrigin(e), getRouteRules(e)))
