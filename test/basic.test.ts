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
    expect(siteConfig).toMatchInlineSnapshot(`
      {
        "_context": {
          "indexable": "system",
          "name": "package.json",
          "titleSeparator": "defaults",
          "trailingSlash": "defaults",
          "url": "nitro:init",
        },
        "indexable": false,
        "name": "nuxt-site-config-playground",
        "origin": "http://127.0.0.1:33601/",
        "titleSeparator": "|",
        "trailingSlash": false,
        "url": "http://127.0.0.1:33601/",
      }
    `)
  })
})
