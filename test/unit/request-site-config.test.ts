import type { SiteConfigStack } from '../../packages/site-config/src/type'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { initRequestSiteConfig } from '../../packages/module/src/runtime/server/init'

vi.mock('nuxt/server', () => ({
  useRuntimeConfig: () => ({
    'public': { site: {} },
    'site': { name: 'Runtime config' },
    'nuxt-site-config': {
      debug: false,
      stack: [{ _priority: -3, name: 'Build config' }],
    },
  }),
}))
vi.mock('#nuxtseo/nitro', () => ({
  useNitroApp: () => ({ hooks: { callHook: async () => {} } }),
}))
vi.mock('site-config-stack', () => vi.importActual('../../packages/site-config/src/index'))

function request(context = {}, req?: Request) {
  return { context: context as { siteConfig?: SiteConfigStack }, req }
}

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('request site config environment', () => {
  it('reads process environment values supplied after the server module loads', async () => {
    vi.stubEnv('NUXT_SITE_NAME', 'Runtime environment name')
    vi.stubEnv('NUXT_PUBLIC_SITE_DESCRIPTION', 'Public environment description')
    const event = request()

    await initRequestSiteConfig(event, 'https://example.com', {})

    expect(event.context.siteConfig!.get().name).toBe('Runtime environment name')
    expect(event.context.siteConfig!.get().description).toBe('Public environment description')
  })

  it('reuses a parsed Worker environment without mixing it with other bindings', async () => {
    vi.stubGlobal('__env__', { NUXT_SITE_NAME: 'Global binding' })
    const ownKeys = vi.fn(Reflect.ownKeys)
    const env = new Proxy({ NUXT_SITE_NAME: 'First binding', NUXT_PUBLIC_SITE_CUSTOM_FIELD: 'Custom value' }, { ownKeys })
    const first = request({ cloudflare: { env } })
    const next = request({}, Object.assign(new Request('https://example.com'), { runtime: { cloudflare: { env } } }))
    const other = request({ cloudflare: { env: { NUXT_SITE_NAME: 'Other binding' } } })

    await Promise.all([first, next, other].map(event => initRequestSiteConfig(event, 'https://example.com', {})))

    expect(first.context.siteConfig!.get().name).toBe('First binding')
    expect(next.context.siteConfig!.get()).toMatchObject({ name: 'First binding', customField: 'Custom value' })
    expect(other.context.siteConfig!.get().name).toBe('Other binding')
    expect(ownKeys).toHaveBeenCalledTimes(1)
  })

  it('reads the current Nitro environment when a synthesized request has no Worker bindings', async () => {
    vi.stubGlobal('__env__', { NUXT_SITE_NAME: 'Original environment' })
    const first = request()
    await initRequestSiteConfig(first, 'https://example.com', {})

    vi.stubGlobal('__env__', { NUXT_SITE_NAME: 'New environment' })
    const next = request()
    await initRequestSiteConfig(next, 'https://example.com', {})

    expect(first.context.siteConfig!.get().name).toBe('Original environment')
    expect(next.context.siteConfig!.get().name).toBe('New environment')
  })
})
