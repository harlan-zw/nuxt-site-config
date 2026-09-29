import { setHeader } from 'h3'
import { defineNitroPlugin } from 'nitropack/runtime'
import { getSiteConfig } from '#site-config/server/composables'

// A user Nitro plugin that reads site config from its own `request` hook.
// Registered through `nitro.plugins`, which lands before module plugins, so this hook runs first.
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('request', (e) => {
    const { name } = getSiteConfig(e)
    setHeader(e, 'x-plugin-site-name', String(name))
  })
})
