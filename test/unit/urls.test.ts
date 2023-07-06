import { describe, expect, it } from 'vitest'
import { fixSlashes, resolveSitePath } from '../../packages/site-config/src'

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

  it('absolute paths - relative', () => {
    const url = resolveSitePath('http://localhost:3000/blog/', {
      ...defaults,
    })
    expect(url).toMatchInlineSnapshot('"/blog"')
  })

  it('root path', () => {
    const url = resolveSitePath('http://localhost:3000', {
      ...defaults,
    })
    expect(url).toMatchInlineSnapshot('"/"')
  })

  // do some absolutes
  it('absolute paths - absolute', () => {
    const url = resolveSitePath('http://localhost:3000/blog/', {
      ...defaults,
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"https://example.com/blog"')
  })

  it('absolute slashes', () => {
    const url = fixSlashes(false, 'https://example.com/blog/')
    expect(url).toMatchInlineSnapshot('"https://example.com/blog"')
  })

  it('base ', () => {
    const url = resolveSitePath('http://localhost:3000/base/blog/', {
      ...defaults,
      base: 'base',
      absolute: false,
      withBase: false,
    })
    expect(url).toMatchInlineSnapshot('"/blog"')
  })

  it ('home slash url absolute', () => {
    const url = resolveSitePath('/', {
      ...defaults,
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"https://example.com/"')
  })

  it ('home slash url relative', () => {
    const url = resolveSitePath('/', {
      ...defaults,
    })
    expect(url).toMatchInlineSnapshot('"/"')
  })
})
