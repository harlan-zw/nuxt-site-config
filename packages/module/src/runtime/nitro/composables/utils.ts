import type { H3Event } from 'h3'
import type { CreateSitePathResolverOptions } from '../../types'
import { useRuntimeConfig } from '#imports'
import { useNitroOrigin, useSiteConfig } from '#internal/nuxt-site-config'
import { fixSlashes, resolveSitePath } from 'site-config-stack/urls'

export function createSitePathResolver(e: H3Event, options: CreateSitePathResolverOptions = {}) {
  const siteConfig = useSiteConfig(e)
  const nitroOrigin = useNitroOrigin(e)
  const nuxtBase = useRuntimeConfig(e).app.baseURL || '/'
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

export function withSiteUrl(e: H3Event, path: string, options: CreateSitePathResolverOptions = {}) {
  const siteConfig = e.context.siteConfig?.get()
  let siteUrl = e.context.siteConfigNitroOrigin
  if ((options.canonical !== false || process.env.prerender) && siteConfig.url)
    siteUrl = siteConfig.url

  return resolveSitePath(path, {
    absolute: true,
    siteUrl,
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase,
  })
}
