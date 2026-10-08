import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSitePathResolver, withSiteUrl } from '../../packages/module/src/runtime/server/composables/utils'

vi.mock('nuxt/server', () => ({ useRuntimeConfig: () => ({ app: { baseURL: '/' } }) }))
vi.mock('../../packages/module/src/runtime/server/composables/getSiteConfig', () => ({ getSiteConfig: (event: any) => event.context.config }))
vi.mock('../../packages/module/src/runtime/server/composables/getNitroOrigin', () => ({ getNitroOrigin: (event: any) => event.context.origin }))

describe('server path resolver', () => {
  let event: any
  beforeEach(() => {
    event = { context: { origin: 'https://tenant.example', config: { trailingSlash: false } } }
  })
  it('uses the request origin when the canonical URL is absent', () => {
    const resolve = createSitePathResolver(event, { absolute: true, withBase: true })
    expect(resolve('/page')).toBe('https://tenant.example/page')
    expect(resolve('/page')).toBe(withSiteUrl(event, '/page', { withBase: true }))
  })
  it('prefers a configured canonical URL and preserves relative defaults', () => {
    event.context.config.url = 'https://canonical.example'
    expect(createSitePathResolver(event, { absolute: true })('/page')).toBe('https://canonical.example/page')
    expect(createSitePathResolver(event)('/page')).toBe('/page')
    expect(createSitePathResolver(event, { canonical: false, absolute: true })('/page')).toBe('https://tenant.example/page')
  })
  it('keeps request origins isolated between factory calls', () => {
    const first = createSitePathResolver(event, { absolute: true })
    const second = createSitePathResolver({ context: { origin: 'https://other.example', config: {} } } as any, { absolute: true })
    expect(first('/one')).toBe('https://tenant.example/one')
    expect(second('/two')).toBe('https://other.example/two')
  })
})
