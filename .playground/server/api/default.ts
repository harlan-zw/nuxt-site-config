import { useSiteConfig, useNitroOrigin } from '#imports'

export default eventHandler(e => {
  return {
    origin: useNitroOrigin(e),
    ...useSiteConfig(e)
  }
})
