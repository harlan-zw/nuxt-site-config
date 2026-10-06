import { defineEventHandler } from 'nuxt/server'
import { getNitroOrigin, withSiteUrl } from '#site-config/server'

export default defineEventHandler((event) => {
  delete event.context.siteConfigNitroOrigin
  const portable = { context: event.context, req: new Request(event.req.url, { headers: new Headers(event.req.headers) }) }
  return {
    origin: getNitroOrigin(event),
    portableOrigin: getNitroOrigin(portable),
    url: withSiteUrl(portable, '/pre-init', { canonical: false }),
  }
})
