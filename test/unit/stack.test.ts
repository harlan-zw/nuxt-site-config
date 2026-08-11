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

  it('reflects pushes and disposal after repeated reads', () => {
    const stack = createSiteConfigStack()
    stack.push({ name: 'base', _priority: 0 })

    expect(stack.get().name).toBe('base')
    const dispose = stack.push({ name: 'override', _priority: 1 })
    expect(stack.get().name).toBe('override')

    dispose()
    expect(stack.get().name).toBe('base')
  })

  it('reflects reactive value mutations between reads', () => {
    const name = { __v_isRef: true, value: 'first' }
    const stack = createSiteConfigStack()
    stack.push({ name })

    expect(stack.get({ resolveRefs: true }).name).toBe('first')
    name.value = 'second'
    expect(stack.get({ resolveRefs: true }).name).toBe('second')
  })

  it('isolates resolved values between stacks', () => {
    const first = createSiteConfigStack()
    const second = createSiteConfigStack()
    first.push({ name: 'first' })
    second.push({ name: 'second' })

    expect(first.get().name).toBe('first')
    expect(second.get().name).toBe('second')
  })

  it('does not retain mutations to a resolved value', () => {
    const stack = createSiteConfigStack()
    stack.push({ name: 'original' })

    stack.get().name = 'changed'

    expect(stack.get().name).toBe('original')
  })

  it('reflects direct stack mutations after a read', () => {
    const stack = createSiteConfigStack()
    stack.push({ name: 'high', _priority: 1 })
    expect(stack.get().name).toBe('high')

    stack.stack.push({ name: 'low', _priority: 0 })
    expect(stack.get().name).toBe('high')

    stack.stack[0]._priority = 2
    expect(stack.get().name).toBe('low')
  })

  it('keeps debug and normalization options independent', () => {
    const stack = createSiteConfigStack()
    stack.push({ url: 'example.com', _context: 'fixture' })

    expect(stack.get({ skipNormalize: true }).url).toBe('example.com')
    expect(stack.get().url).toBe('https://example.com')
    expect(stack.get({ debug: true })._context?.url).toBe('fixture')
    expect(stack.get()._context).toBeUndefined()
  })
})
