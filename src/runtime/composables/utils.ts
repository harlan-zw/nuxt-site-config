import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { computed, useSiteConfig } from '#imports'

function fixSlashes(trailingSlash: boolean, path: string) {
  return trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
}

export function resolveTrailingSlash(path: string) {
  const siteConfig = useSiteConfig()
  return computed(() => {
    if (typeof siteConfig.trailingSlash === 'boolean')
      return fixSlashes(siteConfig.trailingSlash, path)
    return path
  })
}
export function resolveAbsoluteInternalLink(relativeInternalLink: string) {
  const siteConfig = useSiteConfig()
  const slashes = resolveTrailingSlash(relativeInternalLink)
  return computed(() => {
    return withBase(slashes.value, siteConfig.url || '/')
  })
}

export function createInternalLinkResolver(options: { absolute?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  return (path: string) => {
    if (typeof siteConfig.trailingSlash === 'boolean')
      path = fixSlashes(siteConfig.trailingSlash, path)
    if (!options.absolute)
      return path
    return withBase(path, siteConfig.url || '/')
  }
}
