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
    expect(envSiteConfig(env)).toEqual({
      url: 'https://example.com',
      env: 'staging',
      fooBar: 'baz',
    })
  })

  it('ignores inherited and non-enumerable properties', () => {
    const inheritedEnv = Object.create({ NUXT_SITE_NAME: 'Inherited' })
    inheritedEnv.NUXT_SITE_URL = 'https://example.com'
    Object.defineProperty(inheritedEnv, 'NUXT_SITE_ENV', { value: 'hidden' })

    expect(envSiteConfig(inheritedEnv)).toEqual({ url: 'https://example.com' })
  })
})
