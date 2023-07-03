import { withSiteUrl, eventHandler } from '#imports'

export default eventHandler(e => {
  return {
    url: withSiteUrl(e, '/test', { withBase: true }),
  }
})
