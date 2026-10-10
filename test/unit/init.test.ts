import type { Nuxt } from '@nuxt/schema'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getSiteConfigStack, initSiteConfig, updateSiteConfig, useSiteConfig } from '../../packages/kit/src/init'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('initSiteConfig', () => {
  it('reads user config before the dependency module runs', () => {
    const nuxt = {
      options: {
        site: {
          url: 'https://user.example.com',
          name: 'User Site',
          enabled: true,
          debug: true,
          multiTenancy: [{ hosts: ['private.example.com'], config: { name: 'Private Site' } }],
        },
      },
    } as unknown as Nuxt

    expect(useSiteConfig(nuxt)).toMatchObject({ url: 'https://user.example.com', name: 'User Site' })
    expect(useSiteConfig(nuxt)).not.toHaveProperty('multiTenancy')
    expect(useSiteConfig(nuxt)).not.toHaveProperty('enabled')
    expect(useSiteConfig(nuxt)).not.toHaveProperty('debug')
  })

  it('keeps build environment values above early user config', () => {
    vi.stubEnv('NUXT_SITE_URL', 'https://env.example.com')
    const nuxt = { options: { site: { url: 'https://user.example.com' } } } as Nuxt

    expect(useSiteConfig(nuxt).url).toBe('https://env.example.com')
  })

  it('keeps module contributions when initialization runs later', async () => {
    const nuxt = { options: {} } as Nuxt

    updateSiteConfig({ name: 'Module Site' }, nuxt)
    await initSiteConfig(nuxt)

    expect(useSiteConfig(nuxt).name).toBe('Module Site')
    expect(getSiteConfigStack(nuxt).get().name).toBe('Module Site')
  })

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
