import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  server: true,
  build: true,
})

describe('basic', async () => {
  it('renders the index page with expected meta', async () => {
    // Get response to a server-rendered page with `$fetch`.
    const html = await $fetch('/')
    expect(html).toContain('Welcome to My Site Name')
  })
})
