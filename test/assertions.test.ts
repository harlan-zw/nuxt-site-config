import { describe, expect, it } from 'vitest'
import { assertSiteConfig, requireSiteConfig, updateSiteConfig } from '../packages/kit'

// @todo refactor out stateless api
describe.skip('assertions', async () => {
  it('prerender', async () => {
    await updateSiteConfig({
      name: 'My Site Name',
    })

    requireSiteConfig('nuxt-my-module', {
      url: 'Needed to generate module data.',
    }, {
      prerender: true,
    })

    const { valid, messages } = await assertSiteConfig('prerender', { throwError: false, logErrors: false })
    expect(valid).toBe(false)
    expect(messages).toMatchInlineSnapshot(`
      [
        "\`nuxt-my-module\` requires \`url\` to be set. Needed to generate module data.",
      ]
    `)
  })
})
