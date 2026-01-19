import { describe, expect, it } from 'vitest'
import { createSiteConfigStack } from '../../packages/site-config/src/stack'

describe('createSiteConfigStack', () => {
  it('removes entries by reference, not index', () => {
    const stack = createSiteConfigStack()

    // Push 3 entries
    const remove1 = stack.push({ url: 'https://a.com', _context: 'a' })
    const remove2 = stack.push({ url: 'https://b.com', _context: 'b' })
    const remove3 = stack.push({ url: 'https://c.com', _context: 'c' })

    expect(stack.stack.length).toBe(3)

    // Remove middle entry first
    remove2()
    expect(stack.stack.length).toBe(2)
    expect(stack.get().url).toBe('https://c.com') // c should still be there

    // Remove first entry
    remove1()
    expect(stack.stack.length).toBe(1)
    expect(stack.get().url).toBe('https://c.com') // c should still be there

    // Remove last entry
    remove3()
    expect(stack.stack.length).toBe(0)
  })

  it('handles removing same entry twice gracefully', () => {
    const stack = createSiteConfigStack()

    const remove = stack.push({ url: 'https://test.com', _context: 'test' })
    expect(stack.stack.length).toBe(1)

    remove()
    expect(stack.stack.length).toBe(0)

    // Second removal should be no-op
    remove()
    expect(stack.stack.length).toBe(0)
  })

  it('handles out-of-order removal correctly', () => {
    const stack = createSiteConfigStack()

    const entries = []
    for (let i = 0; i < 5; i++) {
      entries.push(stack.push({ url: `https://${i}.com`, _context: `entry-${i}` }))
    }

    expect(stack.stack.length).toBe(5)

    // Remove in reverse order
    entries[4]()
    entries[2]()
    entries[0]()
    entries[3]()
    entries[1]()

    expect(stack.stack.length).toBe(0)
  })
})
