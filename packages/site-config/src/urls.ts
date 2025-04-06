import {
  hasProtocol,
  parseURL,
  withBase,
  withLeadingSlash,
  withoutTrailingSlash,
  withTrailingSlash,
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

const fileExtensions = [
  // Images
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'svg',
  'ico',

  // Documents
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'md',
  'markdown',

  // Archives
  'zip',
  'rar',
  '7z',
  'tar',
  'gz',

  // Audio
  'mp3',
  'wav',
  'flac',
  'ogg',
  'opus',
  'm4a',
  'aac',
  'midi',
  'mid',

  // Video
  'mp4',
  'avi',
  'mkv',
  'mov',
  'wmv',
  'flv',
  'webm',

  // Web
  'html',
  'css',
  'js',
  'json',
  'xml',
  'tsx',
  'jsx',
  'ts',
  'vue',
  'svelte',
  'xsl',
  'rss',
  'atom',

  // Programming
  'php',
  'py',
  'rb',
  'java',
  'c',
  'cpp',
  'h',
  'go',

  // Data formats
  'csv',
  'tsv',
  'sql',
  'yaml',
  'yml',

  // Fonts
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',

  // Executables/Binaries
  'exe',
  'msi',
  'apk',
  'ipa',
  'dmg',
  'iso',
  'bin',

  // Scripts/Config
  'bat',
  'cmd',
  'sh',
  'env',
  'htaccess',
  'conf',
  'toml',
  'ini',

  // Package formats
  'deb',
  'rpm',
  'jar',
  'war',

  // E-books
  'epub',
  'mobi',

  // Common temporary/backup files
  'log',
  'tmp',
  'bak',
  'old',
  'sav',
]

export function isPathFile(path: string) {
  const lastSegment = path.split('/').pop()
  const ext = ((lastSegment || path).match(/\.[0-9a-z]+$/i)?.[0])
  return ext && fileExtensions.includes(ext.replace('.', ''))
}

export function fixSlashes(trailingSlash: boolean | undefined, pathOrUrl: string) {
  const $url = parseURL(pathOrUrl)
  if (isPathFile($url.pathname))
    return pathOrUrl
  const fixedPath = trailingSlash ? withTrailingSlash($url.pathname) : withoutTrailingSlash($url.pathname)
  // reconstruct the url
  return `${$url.protocol ? `${$url.protocol}//` : ''}${$url.host || ''}${fixedPath}${$url.search || ''}${$url.hash || ''}`
}
