import { useNuxt } from '@nuxt/kit'
import { fixSlashes, resolveSitePath } from 'site-config-stack'
import { useSiteConfig } from './'

export function withSiteUrl(path: string, options: { withBase?: boolean; throwErrorOnMissingSiteUrl?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  if (!siteConfig.url && options.throwErrorOnMissingSiteUrl)
    throw new Error('Missing url in site config. Please add `{ site: { url: <url> } }` to nuxt.config.ts.')

  const nuxt = useNuxt()
  const base = nuxt.options.app.baseURL || nuxt.options.nitro.baseURL || '/'
  return resolveSitePath(path, {
    absolute: true,
    siteUrl: siteConfig.url || '',
    trailingSlash: siteConfig.trailingSlash,
    base,
    withBase: options.withBase,
  })
}

export function withSiteTrailingSlash(path: string) {
  const siteConfig = useSiteConfig()
  return fixSlashes(siteConfig.trailingSlash, path)
}
