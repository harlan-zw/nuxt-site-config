import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

process.env.NUXT_PUBLIC_SITE_URL = 'https://env.harlanzw.com'
await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
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
    const siteConfig = await $fetch('/api/__site-config__/debug')
    // replace ports in snapshot with pattern `:port/`
    // convert json to string
    const s = JSON.stringify(siteConfig)
    expect(JSON.parse(s.replace(/:\d+\//g, ':port/'))).toMatchInlineSnapshot(`
      {
        "config": {
          "_context": {
            "defaultLocale": "@nuxtjs/i18n",
            "indexable": "system",
            "name": "package.json",
            "trailingSlash": "defaults",
            "url": "env",
          },
          "defaultLocale": "en",
          "indexable": false,
          "name": "nuxt-site-config-playground",
          "trailingSlash": false,
          "url": "https://env.harlanzw.com",
        },
        "nitroOrigin": "http://localhost/",
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
            "indexable": false,
            "name": "playground",
          },
          {
            "_context": "package.json",
            "_priority": -10,
            "name": "nuxt-site-config-playground",
          },
          {
            "_context": "nitro:init",
            "_priority": -4,
            "url": "http://localhost/",
          },
          {
            "_context": "nuxt-site-config:config",
            "_priority": -3,
            "url": "https://harlanzw.com",
          },
          {
            "_context": "app:config",
            "_priority": -2,
            "url": "harlanzw.com",
          },
          {
            "_context": "env",
            "_priority": 0,
            "url": "https://env.harlanzw.com",
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
