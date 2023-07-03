import { fixSlashes, resolveSitePath } from 'site-config-stack'
import type { H3Event } from 'h3'

export function withSiteTrailingSlash(e: H3Event, path: string) {
  const siteConfig = e.context.siteConfig?.get()
  return fixSlashes(siteConfig.trailingSlash, path)
}

export function withSiteUrl(e: H3Event, path: string, options: { withBase?: boolean } = {}) {
  const siteConfig = e.context.siteConfig?.get()
  return resolveSitePath(path, {
    absolute: true,
    siteUrl: siteConfig.url || '',
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase,
  })
}
