import { withSiteUrl, eventHandler, useSiteConfig } from '#imports'

export default eventHandler(e => {
  return {
    canonical: withSiteUrl(e, '/canonical', { withBase: true }),
    absolute: withSiteUrl(e, '/absolute', { canonical: false, withBase: true }),
    _siteConfig: useSiteConfig(e)
  }
})
