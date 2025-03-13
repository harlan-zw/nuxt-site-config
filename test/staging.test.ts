import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

process.env.NUXT_PUBLIC_SITE_URL = 'https://staging.harlanzw.com'
process.env.NUXT_PUBLIC_SITE_ENV = 'staging'
await setup({
  rootDir: fileURLToPath(new URL('../.playground', import.meta.url)),
  server: true,
  build: true,
})

describe('staging', async () => {
  it('ssr debug', async () => {
    const siteConfig = await $fetch('/__site-config__/debug.json')
    delete siteConfig.version
    // replace ports in snapshot with pattern `:port/`
    // convert json to string
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
          "env": "staging",
          "foo": "</script><script>alert("xss")</script>",
          "name": "nuxt-site-config-playground",
          "url": "https://staging.harlanzw.com",
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
          },
          {
            "_context": "buildEnv",
            "_priority": -1,
            "env": "staging",
            "url": "https://staging.harlanzw.com",
          },
          {
            "_context": "runtimeEnv",
            "_priority": 0,
            "bar": "baz",
            "env": "staging",
            "url": "https://staging.harlanzw.com",
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
