import { describe, expect, it } from 'vitest'
import { computed, ref, shallowRef } from 'vue'
import { createSiteConfigStack } from '../../packages/site-config/src/stack'
import { toValue } from '../../packages/site-config/src/utils'

// `toValue` is reimplemented in `site-config-stack` so the server runtime never
// imports `vue` (see the comment on the function). That reimplementation reads
// `__v_isRef` directly, so these cases run against real Vue refs: if Vue ever
// stops marking refs that way, this goes red rather than silently resolving
// every ref to the ref object.
describe('toValue', () => {
  it('unwraps a ref', () => {
    expect(toValue(ref('https://example.com'))).toBe('https://example.com')
  })

  it('unwraps a shallowRef', () => {
    expect(toValue(shallowRef({ name: 'Example' }))).toEqual({ name: 'Example' })
  })

  it('unwraps a computed', () => {
    const name = ref('Example')
    const upper = computed(() => name.value.toUpperCase())
    expect(toValue(upper)).toBe('EXAMPLE')
    name.value = 'Other'
    expect(toValue(upper)).toBe('OTHER')
  })

  it('calls a getter', () => {
    expect(toValue(() => 'https://example.com')).toBe('https://example.com')
  })

  it('passes plain values through', () => {
    expect(toValue('https://example.com')).toBe('https://example.com')
    expect(toValue(0)).toBe(0)
    expect(toValue(false)).toBe(false)
    expect(toValue(null)).toBe(null)
    expect(toValue(undefined)).toBe(undefined)
  })

  it('leaves a plain object with a value key alone', () => {
    expect(toValue({ value: 'not a ref' })).toEqual({ value: 'not a ref' })
  })
})

describe('site config stack resolves refs', () => {
  it('resolveRefs unwraps ref and computed entries', () => {
    const stack = createSiteConfigStack()
    const name = ref('Example')
    stack.push({ url: 'https://example.com', name, description: computed(() => `${name.value} site`) })
    expect(stack.get({ resolveRefs: true })).toMatchObject({
      url: 'https://example.com',
      name: 'Example',
      description: 'Example site',
    })
  })

  it('leaves refs intact without resolveRefs', () => {
    const stack = createSiteConfigStack()
    stack.push({ name: ref('Example') })
    expect(stack.get().name).toHaveProperty('value', 'Example')
  })
})
