import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  server: true,
  build: true,
})

describe('basic', async () => {
  it ('ssr', async () => {
    const siteConfig = await $fetch('/api/default')
    // replace ports in snapshot with pattern `:port/`
    // convert json to string
    const s = JSON.stringify(siteConfig)
    expect(JSON.parse(s.replace(/:\d+\//g, ':port/'))).toMatchInlineSnapshot(`
      {
        "_context": {
          "debug": "nuxt-site-config:config",
          "defaultLocale": "defaults",
          "indexable": "system",
          "name": "package.json",
          "trailingSlash": "defaults",
          "url": "app:config",
        },
        "debug": true,
        "defaultLocale": "en",
        "indexable": false,
        "name": "nuxt-site-config-playground",
        "origin": "http://127.0.0.1:port/",
        "trailingSlash": false,
        "url": "https://harlanzw.com",
      }
    `)
  })
})
