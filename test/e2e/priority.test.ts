import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'
import { updateSiteConfig } from '../../packages/kit/src/init'

process.env.NUXT_SITE_URL = 'https://runtime-env.example.com'
await setup({
  rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)),
  server: true,
  build: true,
  nuxtConfig: {
    modules: [
      // a module that sets site config during setup, as the module author docs show
      () => {
        updateSiteConfig({ name: 'Module Name', url: 'https://module.example.com', description: 'Module description' })
      },
    ],
    // @ts-expect-error module augments NuxtConfig
    site: {
      name: 'User Name',
      url: 'https://user.example.com',
    },
    hooks: {
      // @ts-expect-error module hook
      'site-config:resolve': () => {
        updateSiteConfig({ url: 'https://hook.example.com' })
      },
    },
  },
})

describe('build time priority', () => {
  it('the site key beats a module', async () => {
    const s = await $fetch<string>('/')
    expect(s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]).toBe('User Name')
    expect(s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]).toBe('Module description')
  })

  it('a runtime NUXT_SITE_URL beats a module, the site key, and the resolve hook', async () => {
    const s = await $fetch<string>('/')
    expect(s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]).toBe('https://runtime-env.example.com')
  })
})
