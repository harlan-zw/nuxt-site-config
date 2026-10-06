import { getSiteConfig } from '#site-config/server'
import { defineEventHandler } from 'nuxt/server'

// A user middleware that reads site config. Nitro registers it before the module's init middleware.
export default defineEventHandler((event) => {
  event.res.headers.set('x-site-name', String(getSiteConfig(event).name))
})
