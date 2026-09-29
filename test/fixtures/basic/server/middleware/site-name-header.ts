import { defineEventHandler, setHeader } from 'h3'
import { getSiteConfig } from '#site-config/server/composables'

// A user middleware that reads site config. Nitro registers it before the module's init middleware.
export default defineEventHandler((e) => {
  const { name, url } = getSiteConfig(e)
  setHeader(e, 'x-site-name', String(name))
  setHeader(e, 'x-site-url', String(url))
})
