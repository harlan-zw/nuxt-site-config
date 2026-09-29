import { describe, expect, it } from 'vitest'
import { createSiteConfigStack, validateSiteConfigStack } from '../../packages/site-config/src'

describe('validateSiteConfigStack', () => {
  it('flags a prerender without a url', () => {
    const stack = createSiteConfigStack()
    stack.push({ env: 'production', name: 'Example' })
    const errors = validateSiteConfigStack(stack, { prerender: true })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('url')
  })

  it('accepts a prerender with a url', () => {
    const stack = createSiteConfigStack()
    stack.push({ env: 'production', url: 'https://example.com' })
    expect(validateSiteConfigStack(stack, { prerender: true })).toEqual([])
  })

  it('accepts a missing url outside a prerender', () => {
    const stack = createSiteConfigStack()
    stack.push({ env: 'production' })
    expect(validateSiteConfigStack(stack)).toEqual([])
  })
})
