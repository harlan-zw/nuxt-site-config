import { defineNitroPlugin } from '#nuxtseo/nitro'
import { initRequestSiteConfig } from '../init'

// Server middleware runs in registration order, and the user's own middleware is registered
// first. The request hook runs before all of it, so getSiteConfig(event) works everywhere.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', initRequestSiteConfig)
})
