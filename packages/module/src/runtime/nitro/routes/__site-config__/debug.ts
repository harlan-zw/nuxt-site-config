import { setHeader } from 'h3'
import type { SiteConfigInput } from 'site-config-stack'
import { defineEventHandler, useNitroOrigin, useRuntimeConfig, useSiteConfig } from '#imports'

export default defineEventHandler(async (e) => {
  const siteConfig = useSiteConfig(e)
  const nitroOrigin = useNitroOrigin(e)
  // use version
  const { public: publicRuntimeConfig } = useRuntimeConfig()

  const stack = e.context.siteConfig.stack as Partial<SiteConfigInput>[]
  // add json headers
  setHeader(e, 'Content-Type', 'application/json')
  return {
    config: siteConfig,
    stack,
    nitroOrigin,
    version: publicRuntimeConfig['nuxt-site-config'],
  }
})
