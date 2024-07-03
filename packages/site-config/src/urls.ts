import {
  hasProtocol,
  parseURL,
  withBase,
  withLeadingSlash,
  withTrailingSlash,
  withoutTrailingSlash,
} from 'ufo'

export function resolveSitePath(pathOrUrl: string, options: { siteUrl: string, trailingSlash?: boolean, base?: string, absolute?: boolean, withBase?: boolean }) {
  let path = pathOrUrl
  // check we should check what we're working with, either an absolute or relative path
  if (hasProtocol(pathOrUrl, { strict: false, acceptRelative: true })) {
    // need to extract just the path
    const parsed = parseURL(pathOrUrl)
    path = parsed.pathname
  }
  const base = withLeadingSlash(options.base || '/')
  if (base !== '/' && path.startsWith(base)) {
    // remove the base from the path, it will be re-added if we need it
    path = path.slice(base.length)
  }
  let origin = withoutTrailingSlash(options.absolute ? options.siteUrl : '')
  if (base !== '/' && origin.endsWith(base)) {
    // remove the base from the path, it will be re-added if we need it
    origin = origin.slice(0, origin.indexOf(base))
  }
  const baseWithOrigin = options.withBase ? withBase(base, origin || '/') : origin
  const resolvedUrl = withBase(path, baseWithOrigin)
  return (path === '/' && !options.withBase) ? withTrailingSlash(resolvedUrl) : fixSlashes(options.trailingSlash, resolvedUrl)
}

export function fixSlashes(trailingSlash: boolean | undefined, pathOrUrl: string) {
  const $url = parseURL(pathOrUrl)
  const isFileUrl = $url.pathname.includes('.')
  if (isFileUrl)
    return pathOrUrl
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname)
  // reconstruct the url
  return `${$url.protocol ? `${$url.protocol}//` : ''}${$url.host || ''}${fixedPath}${$url.search || ''}${$url.hash || ''}`
}
