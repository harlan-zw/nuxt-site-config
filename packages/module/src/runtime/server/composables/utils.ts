import type { RequestEvent } from 'nuxt/server'
import type { CreateSitePathResolverOptions } from '../../types'
import { useRuntimeConfig } from 'nuxt/server'
import { fixSlashes, resolveSitePath } from 'site-config-stack/urls'
import { getNitroOrigin } from './getNitroOrigin'
import { getSiteConfig } from './getSiteConfig'

export function createSitePathResolver(e: Pick<RequestEvent, 'context'>, options: CreateSitePathResolverOptions = {}): (path: string) => string {
  const siteConfig = getSiteConfig(e)
  const nitroOrigin = getNitroOrigin(e)
  const nuxtBase = useRuntimeConfig().app.baseURL || '/'
  return (path: string) => {
    // don't use any composables within here
    return resolveSitePath(path, {
      ...options,
      siteUrl: options.canonical !== false || import.meta.prerender ? (siteConfig.url || nitroOrigin) : nitroOrigin,
      trailingSlash: siteConfig.trailingSlash,
      base: nuxtBase,
    })
  }
}

export function withSiteTrailingSlash(e: Pick<RequestEvent, 'context'>, path: string): string {
  const siteConfig = getSiteConfig(e)
  return fixSlashes(siteConfig.trailingSlash, path)
}

export function withSiteUrl(e: Pick<RequestEvent, 'context'>, path: string, options: CreateSitePathResolverOptions = {}): string {
  const siteConfig = getSiteConfig(e)
  let siteUrl = getNitroOrigin(e)
  if ((options.canonical !== false || import.meta.prerender) && siteConfig.url)
    siteUrl = siteConfig.url

  return resolveSitePath(path, {
    absolute: true,
    siteUrl,
    trailingSlash: siteConfig.trailingSlash,
    base: useRuntimeConfig().app.baseURL || '/',
    withBase: options.withBase,
  })
}
