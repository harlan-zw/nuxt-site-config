import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

process.env.NUXT_PUBLIC_SITE_URL = 'https://env.harlanzw.com'
process.env.NUXT_PUBLIC_SITE_ENV = 'test'
await setup({
  rootDir: fileURLToPath(new URL('../.playground', import.meta.url)),
  server: true,
  build: true,
  nuxtConfig: {
    site: {
      url: 'https://harlanzw.com',
    },
  },
})

describe('basic', async () => {
  it('ssr', async () => {
    const siteConfig = await $fetch('/__site-config__/debug.json')
    // replace ports in snapshot with pattern `:port/`
    // convert json to string
    delete siteConfig.version
    const s = JSON.stringify(siteConfig)
    expect(JSON.parse(s.replace(/:\d+\//g, ':port/'))).toMatchInlineSnapshot(`
      {
        "config": {
          "_context": {
            "bar": "runtimeEnv",
            "defaultLocale": "@nuxtjs/i18n",
            "env": "runtimeEnv",
            "foo": "nuxt-site-config:config",
            "name": "package.json",
            "url": "runtimeEnv",
          },
          "_priority": {
            "bar": 0,
            "env": 0,
            "foo": -3,
            "name": -10,
            "url": 0,
          },
          "bar": "baz",
          "defaultLocale": "en-US",
          "env": "test",
          "foo": "</script><script>alert("xss")</script>",
          "name": "nuxt-site-config-playground",
          "url": "https://env.harlanzw.com",
        },
        "nitroOrigin": "http://127.0.0.1:port/",
        "stack": [
          {
            "_context": "system",
            "_priority": -15,
            "env": "test",
            "name": ".playground",
          },
          {
            "_context": "package.json",
            "_priority": -10,
            "name": "nuxt-site-config-playground",
          },
          {
            "_context": "nitro:init",
            "_priority": -4,
            "url": "http://127.0.0.1:port/",
          },
          {
            "_context": "nuxt-site-config:config",
            "_priority": -3,
            "foo": "</script><script>alert("xss")</script>",
            "url": "https://harlanzw.com",
          },
          {
            "_context": "buildEnv",
            "_priority": -1,
            "env": "test",
            "url": "https://env.harlanzw.com",
          },
          {
            "_context": "runtimeEnv",
            "_priority": 0,
            "bar": "baz",
            "env": "test",
            "url": "https://env.harlanzw.com",
          },
          {
            "_context": "@nuxtjs/i18n",
            "defaultLocale": "en-US",
          },
        ],
      }
    `)
  })
})
