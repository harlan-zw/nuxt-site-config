import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

await setup({
  rootDir: fileURLToPath(new URL('../../fixtures/i18n-base-path', import.meta.url)),
  server: true,
  build: true,
})

function extractAttribute(html: string, tagRe: RegExp, attribute: string): string | undefined {
  const tag = html.match(tagRe)?.[0]
  return tag?.match(new RegExp(`${attribute}="([^"]+)"`))?.[1]
}

describe('i18n base path', () => {
  it('keeps app.baseURL exactly once in canonical and og:url without an i18n baseUrl', async () => {
    const html = await $fetch('/sub/page') as string
    const canonical = extractAttribute(html, /<link[^>]+rel="canonical"[^>]*>/, 'href')
    const ogUrl = extractAttribute(html, /<meta[^>]+property="og:url"[^>]*>/, 'content')
    expect(canonical).toBe('https://example.com/sub/page')
    expect(ogUrl).toBe('https://example.com/sub/page')
  })
})
