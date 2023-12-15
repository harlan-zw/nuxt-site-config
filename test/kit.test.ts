import { describe, expect, it } from 'vitest'
import { updateSiteConfig } from '../packages/kit/src'

// @todo provide a context object api
describe('kit', async () => {
  it('fails without nuxt context', async () => {
    let exception = false
    try {
      updateSiteConfig({
        name: 'My Site Name',
      })
    }
    catch (e) {
      exception = e
    }
    expect(exception).toMatchInlineSnapshot(`[Error: Nuxt context is missing.]`)
  })
})
