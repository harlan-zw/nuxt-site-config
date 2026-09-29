import { describe, expect, it } from 'vitest'
import { createSiteConfigStack, envSiteConfig } from '../../packages/site-config/src'

function resolve(...entries: Record<string, any>[]) {
  const stack = createSiteConfigStack()
  for (const entry of entries)
    stack.push(entry)
  return stack.get()
}

describe('resolved booleans', () => {
  it('reads NUXT_SITE_TRAILING_SLASH=false as false', () => {
    expect(resolve(envSiteConfig({ NUXT_SITE_TRAILING_SLASH: 'false' })).trailingSlash).toBe(false)
  })

  it('reads NUXT_SITE_TRAILING_SLASH=true as true', () => {
    expect(resolve(envSiteConfig({ NUXT_SITE_TRAILING_SLASH: 'true' })).trailingSlash).toBe(true)
  })

  it('reads NUXT_SITE_INDEXABLE=false as false in production', () => {
    expect(resolve({ env: 'production' }, envSiteConfig({ NUXT_SITE_INDEXABLE: 'false' })).indexable).toBe(false)
  })

  it('defaults indexable to true when env is production', () => {
    expect(resolve({ env: 'production' }).indexable).toBe(true)
  })

  it('defaults indexable to false when env is not production', () => {
    expect(resolve({ env: 'staging' }).indexable).toBe(false)
  })

  it('keeps an explicit indexable over the env default', () => {
    expect(resolve({ env: 'staging', indexable: true }).indexable).toBe(true)
  })
})
