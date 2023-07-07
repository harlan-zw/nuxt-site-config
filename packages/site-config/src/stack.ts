import type { SiteConfig, SiteConfigInput, SiteConfigStack } from './type'
import { normalizeSiteConfig } from './'

export function createSiteConfigStack(): SiteConfigStack {
  const stack: Partial<SiteConfigInput>[] = []

  function push(input: SiteConfigInput) {
    if (!input || typeof input !== 'object' || Object.keys(input).length === 0)
      return
    if (!input._context) {
      // use stack trace to determine function name calling this
      let lastFunctionName = new Error('tmp').stack?.split('\n')[2].split(' ')[5]
      // avoid exposing paths
      if (lastFunctionName?.includes('/'))
        lastFunctionName = 'anonymous'
      input._context = lastFunctionName
    }
    stack.push(input)
  }

  function get() {
    // @ts-expect-error untyped
    const siteConfig: SiteConfig = {
      _context: {},
    }
    // resolve the stack, we need to defu the fields but we also want to make a _meta property which maps each field to
    // what context it came from, we'll need a custom defu function
    for (const o in stack) {
      for (const k in stack[o]) {
        const key = k as keyof SiteConfig
        // @ts-expect-error untyped
        const val = stack[o][k]
        // first do the merge, pretty simple
        if (!k.endsWith('context') && typeof val !== 'undefined') {
          // @ts-expect-error untyped
          siteConfig[k] = val
          // we're setting the key value, update the meta
          // @ts-expect-error untyped
          siteConfig._context[key] = stack[o]._context?.[key] || stack[o]._context || 'anonymous'
        }
      }
    }
    return normalizeSiteConfig(siteConfig)
  }

  return {
    push,
    get,
  }
}
