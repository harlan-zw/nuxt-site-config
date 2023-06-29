import { describe, expect, it } from 'vitest'
import { createSiteConfigStack } from '../src/runtime/siteConfig'

describe('stack', () => {
  it('basic', () => {
    const stack = createSiteConfigStack()
    stack.push({
      name: 'My Site Name',
      _context: 'foo',
    })
    expect(stack.get()).toMatchInlineSnapshot(`
      {
        "_meta": {
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

  it ('hydrate', () => {
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
    const resolvedStack = stack.get()
    const newStack = createSiteConfigStack()
    newStack.push(resolvedStack)
    expect(newStack.get()).toMatchInlineSnapshot()
  })
  it ('anonymous context', () => {
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
})
