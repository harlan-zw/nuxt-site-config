import type { SiteConfigInput } from '../../packages/site-config/src/type'
import { describe, it } from 'vitest'

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
