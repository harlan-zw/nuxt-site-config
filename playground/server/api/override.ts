import { eventHandler, updateSiteConfig, useNitroOrigin, useSiteConfig } from '#imports'

export default eventHandler((e) => {
  updateSiteConfig(e, {
    name: 'Override',
    url: 'https://override.com',
  })
  return {
    origin: useNitroOrigin(e),
    ...useSiteConfig(e),
  }
})
