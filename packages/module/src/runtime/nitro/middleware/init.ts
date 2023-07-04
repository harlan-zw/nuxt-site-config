import { eventHandler, updateSiteConfig, useAppConfig, useNitroOrigin, useRuntimeConfig } from '#imports'

export default eventHandler((e) => {
  if (!e.context.siteConfig) {
    const appConfig = useAppConfig()
    const nitroOrigin = useNitroOrigin(e)
    e.context.siteConfigNitroOrigin = nitroOrigin
    const { public: publicRuntimeConfig } = useRuntimeConfig()
    updateSiteConfig(e, {
      _context: 'nitro:init',
      url: nitroOrigin,
    })
    // @ts-expect-error runtime type
    updateSiteConfig(e, publicRuntimeConfig.site)
    if (appConfig.site) {
      updateSiteConfig(e, {
        _context: 'app:config',
        ...appConfig.site,
      })
    }
  }
})
