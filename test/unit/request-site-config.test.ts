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

function request() {
  return { context: {} as { siteConfig?: SiteConfigStack } }
}

afterEach(() => vi.unstubAllEnvs())

describe('request site config environment', () => {
  it('reads environment values supplied after the server module loads', async () => {
    vi.stubEnv('NUXT_SITE_NAME', 'Worker binding')
    vi.stubEnv('NUXT_PUBLIC_SITE_DESCRIPTION', 'Public worker binding')
    const event = request()

    await initRequestSiteConfig(event, 'https://example.com', {})

    expect(event.context.siteConfig!.get().name).toBe('Worker binding')
    expect(event.context.siteConfig!.get().description).toBe('Public worker binding')
  })

  it('reads the current environment for each request without changing earlier stacks', async () => {
    vi.stubEnv('NUXT_SITE_NAME', 'First binding')
    const first = request()
    await initRequestSiteConfig(first, 'https://first.example.com', {})

    vi.stubEnv('NUXT_SITE_NAME', 'Second binding')
    const second = request()
    await initRequestSiteConfig(second, 'https://second.example.com', {})

    expect(first.context.siteConfig!.get().name).toBe('First binding')
    expect(second.context.siteConfig!.get().name).toBe('Second binding')
  })
})
