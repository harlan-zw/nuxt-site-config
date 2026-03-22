import { eventHandler, getSiteConfig, withSiteUrl } from '#imports'

export default eventHandler((e) => {
  return {
    canonical: withSiteUrl(e, '/canonical', { withBase: true }),
    absolute: withSiteUrl(e, '/absolute', { canonical: false, withBase: true }),
    _siteConfig: getSiteConfig(e),
  }
})
