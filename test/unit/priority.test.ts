import type { Nuxt } from '@nuxt/schema'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { initSiteConfig, updateSiteConfig } from '../../packages/kit/src/init'

afterEach(() => {
  vi.unstubAllEnvs()
})

async function createNuxt() {
  const nuxt = { options: {} } as Nuxt
  await initSiteConfig(nuxt)
  return nuxt
}

describe('build time updateSiteConfig', () => {
  it('loses to NUXT_SITE_URL without a _priority', async () => {
    vi.stubEnv('NUXT_SITE_URL', 'https://env.example.com')
    const nuxt = await createNuxt()
    updateSiteConfig({ url: 'https://module.example.com' }, nuxt)
    expect(nuxt._siteConfig!.get().url).toBe('https://env.example.com')
  })

  it('keeps an explicit _priority', async () => {
    vi.stubEnv('NUXT_SITE_URL', 'https://env.example.com')
    const nuxt = await createNuxt()
    updateSiteConfig({ url: 'https://module.example.com', _priority: 1 }, nuxt)
    expect(nuxt._siteConfig!.get().url).toBe('https://module.example.com')
  })
})
