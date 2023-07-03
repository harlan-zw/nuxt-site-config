import { fixSlashes, resolveSitePath } from 'site-config-stack'
import { useRuntimeConfig, useSiteConfig } from '#imports'

export function withSiteTrailingSlash(path: string) {
  const siteConfig = useSiteConfig()
  return fixSlashes(siteConfig.trailingSlash, path)
}

export function withSiteUrl(path: string, options: { withBase?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  const base = useRuntimeConfig().app.baseURL || '/'
  return resolveSitePath(path, {
    absolute: true,
    siteUrl: siteConfig.url,
    trailingSlash: siteConfig.trailingSlash,
    base,
    withBase: options.withBase,
  })
}
