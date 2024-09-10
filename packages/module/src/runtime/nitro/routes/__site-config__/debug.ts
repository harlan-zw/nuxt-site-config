import { useRuntimeConfig } from '#imports'
import { useNitroOrigin, useSiteConfig } from '#internal/nuxt-site-config'
import { defineEventHandler, setHeader } from 'h3'
import type { SiteConfigInput } from 'site-config-stack'

export default defineEventHandler(async (e) => {
  const siteConfig = useSiteConfig(e)
  const nitroOrigin = useNitroOrigin(e)
  // use version
  const runtimeConfig = useRuntimeConfig(e)

  const stack = e.context.siteConfig.stack as Partial<SiteConfigInput>[]
  // add json headers
  setHeader(e, 'Content-Type', 'application/json')
  return {
    config: siteConfig,
    stack,
    nitroOrigin,
    version: runtimeConfig['nuxt-site-config'].version,
  }
})
