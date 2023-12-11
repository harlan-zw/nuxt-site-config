import { fixSlashes, resolveSitePath } from 'site-config-stack'
import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#internal/nitro'
import { useNitroOrigin, useSiteConfig } from '#internal/nuxt-site-config'

export function createSitePathResolver(e: H3Event, options: { canonical?: boolean, absolute?: boolean, withBase?: boolean } = {}) {
  const siteConfig = useSiteConfig(e)
  const nitroOrigin = useNitroOrigin(e)
  const nuxtBase = useRuntimeConfig().app.baseURL || '/'
  return (path: string) => {
    // don't use any composables within here
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || process.env.prerender ? siteConfig.url : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase,
    })
  }
}

export function withSiteTrailingSlash(e: H3Event, path: string) {
  const siteConfig = e.context.siteConfig?.get()
  return fixSlashes(siteConfig.trailingSlash, path)
}

export function withSiteUrl(e: H3Event, path: string, options: { canonical?: boolean, withBase?: boolean } = {}) {
  const siteConfig = e.context.siteConfig?.get()
  return resolveSitePath(path, {
    absolute: true,
    siteUrl: options.canonical !== false || process.env.prerender ? siteConfig.url : e.context.siteConfigNitroOrigin,
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase,
  })
}
