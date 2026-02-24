import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

process.env.NUXT_PUBLIC_SITE_URL = 'https://env.harlanzw.com'
process.env.NUXT_PUBLIC_SITE_ENV = 'test'
await setup({
  rootDir: fileURLToPath(new URL('../fixtures/basic', import.meta.url)),
  server: true,
  build: true,
  nuxtConfig: {
    // @ts-expect-error module augments NuxtConfig
    site: {
      multiTenancy: [
        {
          hosts: ['www.example.com', 'example.com', 'local.example.com'],
          config: {
            name: 'Example',
            description: 'Example description',
            url: 'example.com', // canonical
            defaultLocale: 'en',
            currentLocale: 'en',
          },
        },
        {
          hosts: ['www.foo.com', 'foo.com', 'local.foo.com'],
          config: {
            url: 'foo.com',
            name: 'Foo',
            description: 'Foo description',
          },
        },
      ],
    },
  },
})

describe('mutlitenancy', async () => {
  it('example.com', async () => {
    const s = await $fetch('/', {
      headers: {
        'x-forwarded-host': 'local.example.com',
      },
    })
    const currentLocale = s.match(/<td data-currentlocale="true">(.+?)<\/td>/)?.[1]
    const defaultLocale = s.match(/<td data-defaultlocale="true">(.+?)<\/td>/)?.[1]
    const description = s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]
    const env = s.match(/<td data-env="true">(.+?)<\/td>/)?.[1]
    const name = s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]
    const url = s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]
    expect(currentLocale).toBe('en')
    expect(defaultLocale).toBe('en')
    expect(description).toBe('Example description')
    expect(env).toBe('test')
    expect(name).toBe('Example')
    expect(url).toBe('https://example.com')
  })
  it('foo.com', async () => {
    const s = await $fetch('/', {
      headers: {
        'x-forwarded-host': 'local.foo.com',
      },
    })
    const description = s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]
    const name = s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]
    const url = s.match(/<td data-url="true">(.+?)<\/td>/)?.[1]
    expect(description).toBe('Foo description')
    expect(name).toBe('Foo')
    expect(url).toBe('https://foo.com')
  })
  it('matches host with port (local dev)', async () => {
    const s = await $fetch('/', {
      headers: {
        'x-forwarded-host': 'local.example.com:3000',
      },
    })
    const name = s.match(/<td data-name="true">(.+?)<\/td>/)?.[1]
    const description = s.match(/<td data-description="true">(.+?)<\/td>/)?.[1]
    expect(name).toBe('Example')
    expect(description).toBe('Example description')
  })
})
