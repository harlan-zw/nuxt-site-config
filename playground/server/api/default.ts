import { useSiteConfig, useNitroOrigin, eventHandler } from '#imports'

export default eventHandler(e => {
  return {
    origin: useNitroOrigin(e),
    ...useSiteConfig(e)
  }
})
