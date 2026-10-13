import type { GetSiteConfigOptions, SiteConfigInput, SiteConfigResolved, SiteConfigStack } from './type'
import { getQuery, hasProtocol, parseHost, parseURL, withHttps } from 'ufo'
import { toValue } from './utils'

/**
 * Copy plain objects and arrays at every depth, so a stack entry never shares an object with its input.
 *
 * On the server, inputs are often deep frozen: Nitro freezes the shared runtime config that the
 * build-time stack and the `site` runtime config come from. Consumers write into the resolved
 * config, so a shared object either throws or leaks the write into the input, and from there into
 * later requests. Refs, getters, reactive proxies and class instances keep their identity.
 */
function copyPlainData(value: unknown): any {
  if (Array.isArray(value))
    return value.map(copyPlainData)
  // `__v_isRef` is the marker `toValue` reads, so a ref stays live between reads
  if (!value || typeof value !== 'object' || (value as { __v_isRef?: boolean }).__v_isRef || (value as { __v_isReactive?: boolean }).__v_isReactive)
    return value
  const proto = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null)
    return value
  const copy: Record<string, unknown> = {}
  for (const key in value)
    copy[key] = copyPlainData((value as Record<string, unknown>)[key])
  return copy
}

export function normalizeSiteConfig(config: SiteConfigResolved): SiteConfigResolved {
  // env vars arrive as strings, so "false" must not read as truthy
  if (typeof config.indexable !== 'undefined')
    config.indexable = String(config.indexable) !== 'false'
  else if (typeof config.env !== 'undefined')
    config.indexable = config.env === 'production'
  if (typeof config.trailingSlash !== 'undefined')
    config.trailingSlash = String(config.trailingSlash) !== 'false'
  if (config.url && !hasProtocol(String(config.url), { acceptRelative: true, strict: false }))
    config.url = withHttps(String(config.url))

  // sort the keys
  const keys = Object.keys(config)
    .sort((a, b) => a.localeCompare(b))
  // create new object
  const newConfig: Partial<SiteConfigResolved> = {}
  for (const k of keys)
    newConfig[k] = config[k]

  return newConfig as SiteConfigResolved
}

export function validateSiteConfigStack(stack: SiteConfigStack, options?: { dev?: boolean, prerender?: boolean }): string[] {
  const resolved = normalizeSiteConfig(stack.get({
    // we need the context
    debug: true,
  }))
  const errors: string[] = []
  if (resolved.url) {
    const val = resolved.url
    const context = resolved._context?.url || 'unknown'
    const url = parseURL(val)
    const { hostname } = parseHost(url.host)
    if (!url.host)
      errors.push(`url "${val}" from ${context} is not absolute`)
    else if (url.pathname && url.pathname !== '/')
      errors.push(`url "${val}" from ${context} should not contain a path`)
    else if (url.hash)
      errors.push(`url "${val}" from ${context} should not contain a hash`)
    else if (Object.keys(getQuery(val)).length > 0)
      errors.push(`url "${val}" from ${context} should not contain a query`)
    else if (hostname === 'localhost' && !options?.dev && resolved.env !== 'development')
      errors.push(`url "${val}" from ${context} should not be localhost`)
  }
  // a prerender has no request origin to fall back on, so absolute URLs would render as relative paths
  else if (options?.prerender) {
    errors.push('url is not set, so prerendered pages render absolute URLs as relative paths. Set site.url or NUXT_SITE_URL')
  }
  return errors
}

export function createSiteConfigStack(options?: { debug: boolean }): { stack: Partial<SiteConfigInput>[], push: (input: SiteConfigInput | SiteConfigResolved) => () => void, get: (options?: GetSiteConfigOptions) => SiteConfigResolved } {
  const debug = options?.debug || false
  const stack: Partial<SiteConfigInput>[] = []

  function push(input: SiteConfigInput | SiteConfigResolved) {
    if (!input || typeof input !== 'object' || Object.keys(input).length === 0) {
      return () => {
        // noop
      }
    }
    const entry: Record<string, any> = {}
    // filter input, make sure values are defined and not ''
    for (const k in input) {
      const val = input[k]
      if (typeof val !== 'undefined' && val !== '')
        entry[k] = copyPlainData(val)
    }
    // only push if entry has non-internal keys
    if (!Object.keys(entry).some(k => !k.startsWith('_'))) {
      return () => {}
    }
    // avoid exposing internals unless we're debugging
    if (!entry._context && debug) {
      // use stack trace to determine function name calling this
      let lastFunctionName = new Error('tmp').stack?.split('\n')[2]?.split(' ')[5]
      // avoid exposing paths
      if (lastFunctionName?.includes('/'))
        lastFunctionName = 'anonymous'
      entry._context = lastFunctionName
    }
    stack.push(entry)
    // return function to remove by reference (not index - indices shift on removal)
    return () => {
      const idx = stack.indexOf(entry)
      if (idx !== -1)
        stack.splice(idx, 1)
    }
  }

  function get(options?: GetSiteConfigOptions): SiteConfigResolved {
    const siteConfig: SiteConfigResolved = {}
    if (options?.debug)
      siteConfig._context = {}
    siteConfig._priority = {}
    // resolve the stack, we need to defu the fields but we also want to make a _meta property which maps each field to
    // what context it came from, we'll need a custom defu function
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k as keyof SiteConfigResolved
        const val = options?.resolveRefs ? toValue(stack[o][k]) : stack[o][k]
        // first do the merge, pretty simple, avoid empty strings
        if (!k.startsWith('_') && typeof val !== 'undefined' && val !== '') {
          // make sure the priority is correct
          siteConfig[k] = val
          if (typeof stack[o]._priority !== 'undefined' && stack[o]._priority !== -1) {
            siteConfig._priority[key] = stack[o]._priority // -1 default
          }
          // we're setting the key value, update the meta
          if (options?.debug)
            // @ts-expect-error untyped
            siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || 'anonymous'
        }
      }
    }
    return options?.skipNormalize ? siteConfig : normalizeSiteConfig(siteConfig)
  }

  return {
    stack,
    push,
    get,
  }
}
