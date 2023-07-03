import { joinURL, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import type { SiteConfig } from './type'

export function normalizeSiteConfig(config: SiteConfig) {
  // fix booleans index / trailingSlash
  if (typeof config.indexable !== 'undefined')
    config.indexable = String(config.indexable) !== 'false'
  if (typeof config.trailingSlash !== 'undefined')
    config.trailingSlash = String(config.trailingSlash) !== 'false'
  return config as SiteConfig
}

export function resolveSitePath(path: string, options: { siteUrl: string; trailingSlash: boolean; base: string; absolute?: boolean; withBase?: boolean }) {
  const origin = options.absolute ? options.siteUrl : ''
  const baseWithOrigin = options.withBase ? joinURL(origin || '/', options.base) : origin
  const resolvedUrl = joinURL(baseWithOrigin, path)
  return fixSlashes(options.trailingSlash, resolvedUrl)
}

export function fixSlashes(trailingSlash: boolean, path: string) {
  const isFileUrl = path.includes('.')
  if (isFileUrl)
    return path
  return trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
}
