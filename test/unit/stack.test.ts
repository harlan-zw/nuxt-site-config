import { describe, expect, it } from 'vitest'
import { createSiteConfigStack } from '../../packages/site-config/src/index'

describe('stack', () => {
  it('basic', () => {
    const stack = createSiteConfigStack()
    stack.push({
      name: 'My Site Name',
      _context: 'foo',
    })
    expect(stack.get()).toMatchInlineSnapshot(`
      {
        "_context": {
          "name": "foo",
        },
        "name": "My Site Name",
      }
    `)
  })
  it('many', () => {
    const stack = createSiteConfigStack()
    stack.push({
      name: 'My Site Name',
      _context: 'foo',
    })
    stack.push({
      name: 'New Site Name',
      url: 'https://example.com',
      _context: 'bar',
    })
    stack.push({
      url: undefined,
      name: null,
      _context: 'app',
    })
    expect(stack.get()).toMatchInlineSnapshot(`
      {
        "_context": {
          "name": "app",
          "url": "bar",
        },
        "name": null,
        "url": "https://example.com",
      }
    `)
  })

  it('hydrate', () => {
    const stack = createSiteConfigStack()
    stack.push({
      name: 'My Site Name',
      logo: 'https://example.com/logo.png',
      _context: 'foo',
    })
    stack.push({
      name: 'New Site Name',
      url: 'https://example.com',
      _context: 'bar',
    })
    const resolvedStack = stack.get()
    const newStack = createSiteConfigStack()
    newStack.push(resolvedStack)
    expect(newStack.get()).toMatchInlineSnapshot(`
      {
        "_context": {
          "logo": "foo",
          "name": "bar",
          "url": "bar",
        },
        "logo": "https://example.com/logo.png",
        "name": "New Site Name",
        "url": "https://example.com",
      }
    `)
  })
  it('anonymous context', () => {
    const stack = createSiteConfigStack()
    stack.push({
      name: 'My Site Name',
      logo: 'https://example.com/logo.png',
      _context: 'foo',
    })
    stack.push({
      name: 'New Site Name',
      url: 'https://example.com',
    })
    expect(stack.get()).toMatchInlineSnapshot(`
      {
        "_context": {
          "logo": "foo",
          "name": "anonymous",
          "url": "anonymous",
        },
        "logo": "https://example.com/logo.png",
        "name": "New Site Name",
        "url": "https://example.com",
      }
    `)
  })
  it('priority', () => {
    const stack = createSiteConfigStack()
    stack.push({
      name: 'My Site Name',
      logo: 'https://example.com/logo.png',
      _context: 'foo',
    })
    stack.push({
      name: 'Low priority config',
      url: 'https://example.com',
      trailingSlash: true,
      _priority: -1,
    })
    expect(stack.get()).toMatchInlineSnapshot(`
      {
        "_context": {
          "logo": "foo",
          "name": "foo",
          "trailingSlash": "anonymous",
          "url": "anonymous",
        },
        "logo": "https://example.com/logo.png",
        "name": "My Site Name",
        "trailingSlash": true,
        "url": "https://example.com",
      }
    `)
  })
})
