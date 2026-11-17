import { setImmediate } from 'node:timers/promises'
import { describe, expect, it, vi } from 'vitest'
import { computed, nextTick, ref } from 'vue'
import i18nPlugin from '../packages/module/src/runtime/app/plugins/i18n'
import { createSiteConfigStack } from '../packages/site-config/src/stack'

const request = vi.hoisted(() => ({ event: undefined as any, app: undefined as any }))
vi.mock('nuxt/app', () => ({
  defineNuxtPlugin: (plugin: any) => plugin.setup,
  useRequestURL: () => new URL('https://example.com/'),
  useRequestEvent: () => request.event,
  useNuxtApp: () => request.app,
}))
vi.mock('#build/nuxt-site-config/i18n-plugin-deps.mjs', () => ({ i18nPluginDeps: [] }))

function createApp() {
  const stack = createSiteConfigStack()
  const locale = ref('en')
  const app: any = { $nuxtSiteConfig: stack, payload: { content: 'Rendered payload' } }
  app.$i18n = {
    nuxtApp: app,
    locale,
    defaultLocale: 'en',
    locales: [{ code: 'en', language: 'en-US' }, { code: 'fr', language: 'fr-FR' }],
    localeProperties: computed(() => ({ language: locale.value === 'fr' ? 'fr-FR' : 'en-US' })),
    baseUrl: 'https://example.com',
    te: () => true,
    t: (key: string) => `${locale.value}:${key}`,
  }
  request.event = { context: { siteConfig: stack } }
  request.app = app
  i18nPlugin(app)
  return { app, stack, locale }
}

describe('i18n plugin', () => {
  it('reads the locale set after plugin setup', async () => {
    const { stack, locale } = createApp()
    locale.value = 'fr'
    await nextTick()
    await setImmediate()
    globalThis.gc!()
    expect(stack.get({ resolveRefs: true })).toMatchObject({
      url: 'https://example.com',
      defaultLocale: 'en-US',
      currentLocale: 'fr-FR',
      name: 'fr:nuxtSiteConfig.name',
      description: 'fr:nuxtSiteConfig.description',
    })
    locale.value = 'en'
    await nextTick()
    expect(stack.get({ resolveRefs: true }).currentLocale).toBe('en-US')
  })

  it.skipIf(!import.meta.server).each([false, true])('releases the app while the request stack survives (render error: %s)', async (renderError) => {
    function retainedRequest() {
      const { app, stack } = createApp()
      if (renderError) {
        app.$i18n.t = () => {
          throw new Error('Translation failed')
        }
      }
      return { app: new WeakRef(app), event: { context: { siteConfig: stack } } }
    }
    const { app, event } = retainedRequest()
    // The renderer owns nuxtApp during SSR. These mocks must not keep that ownership after SSR.
    request.app = undefined
    request.event = undefined
    if (renderError)
      expect(() => event.context.siteConfig.get({ resolveRefs: true })).toThrow('Translation failed')
    else
      expect(event.context.siteConfig.get({ resolveRefs: true }).currentLocale).toBe('en-US')
    for (let attempt = 0; attempt < 10; attempt++) {
      await setImmediate()
      globalThis.gc!()
      if (!app.deref())
        break
    }
    expect(app.deref()).toBeUndefined()
    expect(event.context.siteConfig.get({ resolveRefs: true }).currentLocale).toBeUndefined()
  })
})
