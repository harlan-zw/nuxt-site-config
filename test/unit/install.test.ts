import type { Nuxt } from '@nuxt/schema'
import { describe, expect, it } from 'vitest'
import { installNuxtSiteConfig, useSiteConfig } from '../../packages/kit/src/init'

describe('installNuxtSiteConfig', () => {
  it('uses an installed nested module without resolving another root package', async () => {
    const nuxt = {
      options: {
        envName: 'nested-install',
        _installedModules: [{ meta: { name: 'nuxt-site-config' } }],
      },
    } as Nuxt

    await installNuxtSiteConfig(nuxt)

    expect(useSiteConfig(nuxt).env).toBe('nested-install')
  })
})
