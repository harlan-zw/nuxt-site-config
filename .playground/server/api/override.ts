import { eventHandler, getSiteConfig, updateSiteConfig, useNitroOrigin } from '#imports'

export default eventHandler((e) => {
  updateSiteConfig(e, {
    name: 'Override',
    url: 'https://override.com',
  })
  return {
    origin: useNitroOrigin(e),
    ...getSiteConfig(e),
  }
})
