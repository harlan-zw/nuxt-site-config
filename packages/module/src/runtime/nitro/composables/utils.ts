import { fixSlashes, resolveSitePath } from 'site-config-stack'
import type { H3Event } from 'h3'

export function withSiteTrailingSlash(e: H3Event, path: string) {
  const siteConfig = e.context.siteConfig?.get()
  return fixSlashes(siteConfig.trailingSlash, path)
}

export function withSiteUrl(e: H3Event, path: string, options: { canonical?: boolean; withBase?: boolean } = {}) {
  const siteConfig = e.context.siteConfig?.get()
  return resolveSitePath(path, {
    absolute: true,
    siteUrl: options.canonical !== false || process.env.prerender ? siteConfig.url : e.context.siteConfigNitroOrigin,
    trailingSlash: siteConfig.trailingSlash,
    base: e.context.nitro.baseURL,
    withBase: options.withBase,
  })
}
