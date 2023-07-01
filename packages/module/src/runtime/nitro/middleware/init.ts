import { defu } from 'defu'
import { joinURL } from 'ufo'
import { eventHandler, updateSiteConfig, useAppConfig, useNitroOrigin, useRuntimeConfig } from '#imports'

export default eventHandler((e) => {
  if (!e.context.siteConfig) {
    const appConfig = useAppConfig()
    const { public: publicRuntimeConfig, app } = useRuntimeConfig()
    // init the site config
    updateSiteConfig(e, defu(appConfig.site, publicRuntimeConfig.site, {
      // fallback to the origin
      url: joinURL(useNitroOrigin(e), app.baseURL),
    }))
  }
})
