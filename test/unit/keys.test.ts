import { describe, expect, it } from 'vitest'
import { envSiteConfig } from '../../packages/site-config/src/utils'

const env = {
  NUXT_SITE_URL: 'https://example.com',
  NUXT_PUBLIC_SITE_ENV: 'staging',
  NUXT_PUBLIC_SITE_FOO_BAR: 'baz',
  NUXT_FOO_BAR: 'baz',
}

describe('keys', () => {
  it('env', () => {
    expect(envSiteConfig(env)).toMatchInlineSnapshot(`
      {
        "env": "staging",
        "fooBar": "baz",
        "url": "https://example.com",
      }
    `)
  })
})
