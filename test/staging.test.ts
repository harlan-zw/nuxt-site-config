import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

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
    // replace ports in snapshot with pattern `:port/`
    // convert json to string
    const s = JSON.stringify(siteConfig)
    expect(JSON.parse(s.replace(/:\d+\//g, ':port/'))).toMatchInlineSnapshot(`
      {
        "config": {
          "_context": {
            "defaultLocale": "@nuxtjs/i18n",
            "env": "runtimeEnv",
            "indexable": "computed-env",
            "name": "package.json",
            "trailingSlash": "defaults",
            "url": "runtimeEnv",
          },
          "defaultLocale": "en",
          "env": "staging",
          "indexable": false,
          "name": "nuxt-site-config-playground",
          "trailingSlash": false,
          "url": "https://staging.harlanzw.com",
        },
        "nitroOrigin": "http://127.0.0.1:port/",
        "stack": [
          {
            "_context": "defaults",
            "_priority": -20,
            "defaultLocale": "en",
            "trailingSlash": false,
          },
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
            "_context": "computed-env",
            "_priority": -4,
            "indexable": false,
          },
          {
            "_context": "app:config",
            "_priority": -2,
            "url": "harlanzw.com",
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
            "env": "staging",
            "url": "https://staging.harlanzw.com",
          },
          {
            "_context": "@nuxtjs/i18n",
            "defaultLocale": "en",
          },
        ],
      }
    `)
  })
})
