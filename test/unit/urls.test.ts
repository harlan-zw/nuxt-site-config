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

  it('home slash url absolute', () => {
    const url = resolveSitePath('/', {
      ...defaults,
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"https://example.com/"')
  })

  it('home slash url relative', () => {
    const url = resolveSitePath('/', {
      ...defaults,
    })
    expect(url).toMatchInlineSnapshot('"/"')
  })

  it('base x2', () => {
    let url = resolveSitePath('/blog', {
      siteUrl: 'http://localhost:3000/',
      trailingSlash: false,
      withBase: true,
      base: '/base',
      absolute: true,
    })
    url = resolveSitePath(url, {
      siteUrl: 'http://localhost:3000/',
      trailingSlash: false,
      withBase: true,
      base: '/base',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/base/blog"')
  })

  it('queries - no slash', () => {
    const rel = fixSlashes(false, '/blog/?foo=bar')
    expect(rel).toMatchInlineSnapshot('"/blog?foo=bar"')
    const abs = fixSlashes(false, 'http://localhost:3000/base/blog/?foo=bar')
    expect(abs).toMatchInlineSnapshot('"http://localhost:3000/base/blog?foo=bar"')
    const url = resolveSitePath('/blog/?foo=bar', {
      siteUrl: 'http://localhost:3000/',
      trailingSlash: false,
      withBase: true,
      base: '/base',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/base/blog?foo=bar"')
  })

  it('queries - slash', () => {
    const rel = fixSlashes(true, '/blog/?foo=bar')
    expect(rel).toMatchInlineSnapshot('"/blog/?foo=bar"')
    const abs = fixSlashes(true, 'http://localhost:3000/base/blog/?foo=bar')
    expect(abs).toMatchInlineSnapshot('"http://localhost:3000/base/blog/?foo=bar"')
    const url = resolveSitePath('/blog/?foo=bar', {
      siteUrl: 'http://localhost:3000/',
      trailingSlash: true,
      withBase: true,
      base: '/base',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/base/blog/?foo=bar"')
  })

  it('hash - no slash', () => {
    const rel = fixSlashes(false, '/blog/#foo')
    expect(rel).toMatchInlineSnapshot('"/blog#foo"')
    const abs = fixSlashes(false, 'http://localhost:3000/base/blog/#foo')
    expect(abs).toMatchInlineSnapshot('"http://localhost:3000/base/blog#foo"')
    const url = resolveSitePath('/blog/#foo', {
      siteUrl: 'http://localhost:3000/',
      trailingSlash: false,
      withBase: true,
      base: '/base',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/base/blog#foo"')
  })

  it('hash - slash', () => {
    const rel = fixSlashes(true, '/blog#foo')
    expect(rel).toMatchInlineSnapshot('"/blog/#foo"')
    const rel2 = fixSlashes(true, '/blog/#foo')
    expect(rel2).toMatchInlineSnapshot('"/blog/#foo"')
    const abs = fixSlashes(true, 'http://localhost:3000/base/blog?foo=bar#foo')
    expect(abs).toMatchInlineSnapshot('"http://localhost:3000/base/blog/?foo=bar#foo"')
    const url = resolveSitePath('/blog#foo', {
      siteUrl: 'http://localhost:3000/',
      trailingSlash: true,
      withBase: true,
      base: '/base',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/base/blog/#foo"')
  })

  it('base - home slash', () => {
    const url = resolveSitePath('/', {
      siteUrl: 'http://localhost:3000/',
      trailingSlash: false,
      withBase: true,
      base: '/base/',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/base"')
  })
  it('base - remove base slash home slash', () => {
    const url = resolveSitePath('/base/', {
      siteUrl: 'http://localhost:3000',
      trailingSlash: false,
      withBase: false,
      base: '/base',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/"')
  })
  it('root slash', () => {
    const url = resolveSitePath('/', {
      siteUrl: 'http://localhost:3000',
      trailingSlash: false,
      withBase: false,
      base: '',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/"')
  })
  it('base url root slash', () => {
    const url = resolveSitePath('/', {
      siteUrl: 'http://localhost:3000',
      trailingSlash: true,
      withBase: true,
      base: '/subdir/',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/subdir/"')

    const url2 = fixSlashes(true, url)
    expect(url2).toMatchInlineSnapshot('"http://localhost:3000/subdir/"')
  })
  it('base url root slash with base', () => {
    const url = resolveSitePath('/subdir/', {
      siteUrl: 'http://localhost:3000',
      trailingSlash: true,
      withBase: true,
      base: '/subdir/',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot('"http://localhost:3000/subdir/"')
  })
  it('base url empty', () => {
    const url = resolveSitePath('/subdir', {
      siteUrl: 'http://localhost:3000',
      trailingSlash: true,
      withBase: true,
      base: '/subdir/',
      absolute: true,
    })
    expect(url).toMatchInlineSnapshot(`"http://localhost:3000/subdir/subdir/"`)

    const url2 = fixSlashes(true, url)
    expect(url2).toMatchInlineSnapshot(`"http://localhost:3000/subdir/subdir/"`)
  })
})
