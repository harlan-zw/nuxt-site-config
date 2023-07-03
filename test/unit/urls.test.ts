import { describe, expect, it } from 'vitest'
import { resolveSitePath } from '../../packages/site-config/src'

const defaults = {
  siteUrl: 'https://example.com',
  base: '/',
  trailingSlash: false,
}
describe('urls', () => {
  it('basic', () => {
    const url = resolveSitePath('/blog', {
      ...defaults,
    })
    expect(url).toMatchInlineSnapshot('"/blog"')
  })

  it('absolute', () => {
    const url = resolveSitePath('/blog', {
      ...defaults,
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"https://example.com/blog"')
  })

  it('base', () => {
    const url = resolveSitePath('/blog', {
      ...defaults,
      base: '/base',
      withBase: true,
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"https://example.com/base/blog"')
  })

  it('trailing slash', () => {
    const url = resolveSitePath('/blog/', {
      ...defaults,
    })
    expect(url).toMatchInlineSnapshot('"/blog"')
  })
})
