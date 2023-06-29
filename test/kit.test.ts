import { describe, expect, it } from 'vitest'
import { updateSiteConfig } from '../src/kit'

describe('kit', async () => {
  it('context', async () => {
    let exception = false
    try {
      await updateSiteConfig({
        name: 'My Site Name',
      })
    }
    catch (e) {
      exception = e
    }
    expect(exception).toMatchInlineSnapshot('[Error: Site config isn\'t initialized. Make sure you\'re calling Module.updateSiteConfig within the Nuxt context.]')
  })
})
