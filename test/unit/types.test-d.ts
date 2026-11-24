import type { NuxtSiteConfig } from '../../packages/module/src/runtime/types'
import type { SiteConfigInput } from '../../packages/site-config/src/type'
import { describe, expectTypeOf, it } from 'vitest'
import { isPathFile } from '../../packages/site-config/src/urls'

it('accepts isPathFile as a filter callback', () => {
  const files = ['/report.pdf'].filter(isPathFile)
  expectTypeOf(files).toEqualTypeOf<string[]>()
})

describe('SiteConfigInput', () => {
  it('rejects wrong types on known keys (autocomplete + type checking)', () => {
    // @ts-expect-error url must be a string, not a number
    const _badUrl: SiteConfigInput = { url: 123 }
    // @ts-expect-error name must be a string, not a boolean
    const _badName: SiteConfigInput = { name: true }
    // @ts-expect-error trailingSlash must be boolean, not string
    const _badTrailingSlash: SiteConfigInput = { trailingSlash: 'yes' }
  })

  it('accepts valid known keys and arbitrary extension keys', () => {
    const _ok: SiteConfigInput = {
      url: 'https://example.com',
      name: 'My Site',
      trailingSlash: true,
      indexable: true,
      env: 'production',
      // arbitrary keys remain allowed via the index signature
      myCustomField: 'anything',
    }
  })
})

describe('NuxtSiteConfig', () => {
  it('preserves resolved field types when reading config', () => {
    const config: NuxtSiteConfig = { url: 'https://example.com' }

    expectTypeOf(config.url).toEqualTypeOf<string>()
    expectTypeOf(config.name).toEqualTypeOf<string | undefined>()
    expectTypeOf(config.indexable).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(config.env).toEqualTypeOf<string | undefined>()
    expectTypeOf(config.trailingSlash).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(config._context).toEqualTypeOf<Record<string, string> | undefined>()
  })

  it('rejects invalid known fields and requires a URL', () => {
    // @ts-expect-error name must be a string
    const _badName: NuxtSiteConfig = { url: 'https://example.com', name: true }
    // @ts-expect-error trailingSlash must be a boolean
    const _badTrailingSlash: NuxtSiteConfig = { url: 'https://example.com', trailingSlash: 'yes' }
    // @ts-expect-error url is required
    const _missingUrl: NuxtSiteConfig = {}
    // @ts-expect-error url must be a string
    const _badUrl: NuxtSiteConfig = { url: 123 }
    // @ts-expect-error url cannot be undefined
    const _undefinedUrl: NuxtSiteConfig = { url: undefined }
  })

  it('allows arbitrary extension keys and optional resolved fields', () => {
    const config: NuxtSiteConfig = { url: 'https://example.com', customField: { enabled: true } }
    config.name = 'My Site'
    config.indexable = false
    config.trailingSlash = true
    config._context = { name: 'runtime' }
    config.customField = 123
  })
})
