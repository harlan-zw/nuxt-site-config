import type { Nuxt } from '@nuxt/schema'
import { fileURLToPath } from 'node:url'
import { describe, expect, it, vi } from 'vitest'
import { installNuxtSiteConfig, useSiteConfig } from '../../packages/kit/src/init'
import { installNuxtSiteConfig as installFromModule } from '../../packages/module/src/kit'

const installModule = vi.hoisted(() => vi.fn())

vi.mock('../../packages/module/node_modules/@nuxt/kit', async importOriginal => ({
  ...await importOriginal<object>(),
  installModule,
}))

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

  it('installs the module from its own package when imported from nuxt-site-config/kit', async () => {
    const nuxt = {
      options: {
        envName: 'own-package',
        _installedModules: [],
      },
    } as unknown as Nuxt

    await installFromModule(nuxt)

    expect(installModule).toHaveBeenCalledWith(
      fileURLToPath(new URL('../../packages/module/src/module', import.meta.url)),
      {},
      nuxt,
    )
    expect(useSiteConfig(nuxt).env).toBe('own-package')
  })
})
