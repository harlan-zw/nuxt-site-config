import { useSiteConfig, useNitroOrigin, updateSiteConfig, eventHandler } from '#imports'

export default eventHandler(e => {
  updateSiteConfig(e, {
    name: 'Override',
    url: 'https://override.com',
  })
  return {
    origin: useNitroOrigin(e),
    ...useSiteConfig(e)
  }
})
