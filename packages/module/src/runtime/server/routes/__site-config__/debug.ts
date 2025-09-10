import type { SiteConfigInput } from 'site-config-stack'
import { eventHandler, setHeader } from 'h3'
import { useRuntimeConfig } from 'nitropack/runtime'
import { getNitroOrigin } from '../../composables/getNitroOrigin'
import { getSiteConfig } from '../../composables/getSiteConfig'

export default eventHandler(async (e) => {
  const siteConfig = getSiteConfig(e)
  const nitroOrigin = getNitroOrigin(e)
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
