import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { computed, useSiteConfig } from '#imports'

export function resolveTrailingSlash(path: string) {
  const siteConfig = useSiteConfig()
  return computed(() => {
    return siteConfig.value.trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
  })
}
export function resolveAbsoluteInternalLink(relativeInternalLink: string) {
  const siteConfig = useSiteConfig()
  const slashes = resolveTrailingSlash(relativeInternalLink)
  return computed(() => {
    return withBase(slashes.value, siteConfig.value.url || '/')
  })
}

export function createInternalLinkResolver(options: { absolute?: boolean } = {}) {
  const siteConfig = useSiteConfig()
  return (path: string) => {
    if (typeof siteConfig.value.trailingSlash === 'boolean')
      path = fixSlashes(siteConfig.value.trailingSlash, path)
    if (!options.absolute)
      return path
    return withBase(path, siteConfig.value.url || '/')
  }
}
