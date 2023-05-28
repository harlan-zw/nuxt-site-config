import { withBase, withTrailingSlash, withoutTrailingSlash } from 'ufo'
import { useSiteConfig } from '#imports'

export function resolveTrailingSlash(path: string) {
  const { trailingSlash } = useSiteConfig()
  return trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path)
}
export function resolveAbsoluteInternalLink(relativeInternalLink: string) {
  const { url } = useSiteConfig()
  return withBase(resolveTrailingSlash(relativeInternalLink), url)
}

export function createInternalLinkResolver() {
  const { trailingSlash, url } = useSiteConfig()
  return (path: string) => {
    return withBase(trailingSlash ? withTrailingSlash(path) : withoutTrailingSlash(path), url)
  }
}
