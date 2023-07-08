import { defineEventHandler, useNitroOrigin, useSiteConfig } from '#imports'

export default defineEventHandler(async (e) => {
  const siteConfig = useSiteConfig(e)
  const nitroOrigin = useNitroOrigin(e)
  return {
    ...siteConfig,
    nitroOrigin,
  }
})
