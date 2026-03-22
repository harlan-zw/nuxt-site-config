import { eventHandler, getSiteConfig, useNitroOrigin } from '#imports'

export default eventHandler((e) => {
  return {
    origin: useNitroOrigin(e),
    ...getSiteConfig(e),
  }
})
