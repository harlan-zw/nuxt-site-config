import type { Nuxt } from '@nuxt/schema'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { initSiteConfig } from '../../packages/kit/src/init'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('initSiteConfig', () => {
  it('uses the Nuxt environment name before NODE_ENV', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const nuxt = {
      options: {
        envName: 'staging',
      },
    } as Nuxt

    const siteConfig = await initSiteConfig(nuxt)

    expect(siteConfig?.get().env).toBe('staging')
  })

  it('uses NUXT_SITE_ENV before the Nuxt environment name', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NUXT_SITE_ENV', 'preview')
    const nuxt = {
      options: {
        envName: 'staging',
      },
    } as Nuxt

    const siteConfig = await initSiteConfig(nuxt)

    expect(siteConfig?.get().env).toBe('preview')
  })

  it('falls back to NODE_ENV without a Nuxt environment name', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const nuxt = {
      options: {},
    } as Nuxt

    const siteConfig = await initSiteConfig(nuxt)

    expect(siteConfig?.get().env).toBe('production')
  })
})
