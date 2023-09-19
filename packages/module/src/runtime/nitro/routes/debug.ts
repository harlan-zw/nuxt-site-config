import { setHeader } from 'h3'
import { defineEventHandler, useNitroOrigin, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineEventHandler(async (e) => {
  const siteConfig = useSiteConfig(e)
  const nitroOrigin = useNitroOrigin(e)
  // use version
  const { public: publicRuntimeConfig } = useRuntimeConfig()

  // add json headers
  setHeader(e, 'Content-Type', 'application/json')
  return {
    ...siteConfig,
    nitroOrigin,
    version: publicRuntimeConfig['nuxt-site-config']?.version,
  }
})
