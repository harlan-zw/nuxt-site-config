import { getSiteConfig } from '#imports'
import { eventHandler } from 'nitro/h3'

// A user middleware that reads site config. Nitro registers it before the module's init middleware.
export default eventHandler((event) => {
  event.res.headers.set('x-site-name', String(getSiteConfig(event).name))
})
