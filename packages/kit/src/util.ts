import { useNuxt } from '@nuxt/kit'
import { fixSlashes, resolveSitePath } from 'site-config-stack'
import { useNitroOrigin, useSiteConfig } from './'

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

export function createSitePathResolver(options: { canonical?: boolean; absolute?: boolean; withBase?: boolean } = {}, nuxt = useNuxt()) {
  const siteConfig = useSiteConfig()
  const nitroOrigin = useNitroOrigin()
  const nuxtBase = nuxt.options.app.baseURL || '/'
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
