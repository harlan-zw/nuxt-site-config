import { toValue } from 'vue'
import { getQuery, hasProtocol, parseURL, withHttps } from 'ufo'
import type { GetSiteConfigOptions, SiteConfigInput, SiteConfigResolved, SiteConfigStack } from './type'

export function normalizeSiteConfig(config: SiteConfigResolved) {
  // fix booleans index / trailingSlash
  if (typeof config.indexable !== 'undefined')
    config.indexable = String(config.indexable) !== 'false'
  if (typeof config.trailingSlash !== 'undefined' && !config.trailingSlash)
    config.trailingSlash = String(config.trailingSlash) !== 'false'
  if (config.url && !hasProtocol(config.url, { acceptRelative: true, strict: false }))
    config.url = withHttps(config.url)

  // sort the keys
  const keys = Object.keys(config)
    .sort((a, b) => a.localeCompare(b))
  // create new object
  const newConfig: Partial<SiteConfigResolved> = {}
  for (const k of keys)
    newConfig[k] = config[k]

  return newConfig as SiteConfigResolved
}

export function validateSiteConfigStack(stack: SiteConfigStack) {
  const resolved = normalizeSiteConfig(stack.get({
    // we need the context
    debug: true,
  }))
  const errors: string[] = []
  if (resolved.url) {
    const val = resolved.url
    const context = resolved._context?.url || 'unknown'
    const url = parseURL(val)
    if (!url.host)
      errors.push(`url "${val}" from ${context} is not absolute`)
    else if (url.pathname && url.pathname !== '/')
      errors.push(`url "${val}" from ${context} should not contain a path`)
    else if (url.hash)
      errors.push(`url "${val}" from ${context} should not contain a hash`)
    else if (Object.keys(getQuery(val)).length > 0)
      errors.push(`url "${val}" from ${context} should not contain a query`)
    else if (url.host === 'localhost')
      errors.push(`url "${val}" from ${context} should not be localhost`)
  }
  return errors
}

export function createSiteConfigStack(options?: { debug: boolean }): SiteConfigStack {
  const debug = options?.debug || false
  const stack: Partial<SiteConfigInput>[] = []

  function push(input: SiteConfigInput | SiteConfigResolved) {
    if (!input || typeof input !== 'object' || Object.keys(input).length === 0)
      return
    // avoid exposing internals unless we're debugging
    if (!input._context && debug) {
      // use stack trace to determine function name calling this
      let lastFunctionName = new Error('tmp').stack?.split('\n')[2].split(' ')[5]
      // avoid exposing paths
      if (lastFunctionName?.includes('/'))
        lastFunctionName = 'anonymous'
      input._context = lastFunctionName
    }
    const entry: Record<string, any> = {}
    // filter input, make sure values are defined and not ''
    for (const k in input) {
      const val = input[k]
      if (typeof val !== 'undefined' && val !== '')
        entry[k] = val
    }
    if (Object.keys(entry).filter(k => !k.startsWith('_')).length > 0)
      stack.push(entry)
  }

  function get(options?: GetSiteConfigOptions) {
    const siteConfig: SiteConfigResolved = {}
    if (options?.debug)
      siteConfig._context = {}
    // resolve the stack, we need to defu the fields but we also want to make a _meta property which maps each field to
    // what context it came from, we'll need a custom defu function
    for (const o in stack.sort((a, b) => (a._priority || 0) - (b._priority || 0))) {
      for (const k in stack[o]) {
        const key = k as keyof SiteConfigResolved
        const val = options?.resolveRefs ? toValue(stack[o][k]) : stack[o][k]
        // first do the merge, pretty simple, avoid empty strings
        if (!k.startsWith('_') && typeof val !== 'undefined') {
          // make sure the priority is correct
          siteConfig[k] = val
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
