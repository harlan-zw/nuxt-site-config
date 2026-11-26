import type { AppRouteRules } from 'nuxt/server'
import { createSiteConfigStack } from 'site-config-stack'
import { afterEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  routeRules: {} as AppRouteRules,
  baseURL: '/',
  noSSR: false,
  getRouteRules: vi.fn<(event: unknown) => AppRouteRules>(() => state.routeRules),
  matchRouteRules: vi.fn<(path: string, method?: string) => AppRouteRules>(() => state.routeRules),
}))

vi.mock('nuxt/server', () => ({
  defineEventHandler: (fn: any) => fn,
  getRouteRules: (event: unknown) => state.getRouteRules(event),
  matchRouteRules: (path: string, method?: string) => state.matchRouteRules(path, method),
  useRuntimeConfig: () => ({
    'app': { baseURL: state.baseURL },
    'public': { site: {} },
    'site': {},
    'nuxt-site-config': {
      debug: false,
      stack: [{ _priority: -3, name: 'Test Site', url: 'https://example.com' }],
    },
  }),
}))

vi.mock('#nuxt-site-config/no-ssr.mjs', () => ({
  get NUXT_SITE_CONFIG_NO_SSR() {
    return state.noSSR
  },
  // Simulates Nitro 3 prior to the fix, where missing ssr defaulted to false.
  NUXT_SITE_CONFIG_SSR_DEFAULT: false,
}))

vi.mock('#nuxtseo/nitro', () => ({
  defineNitroPlugin: (fn: any) => fn,
  useNitroApp: () => ({ hooks: { callHook: async () => {} } }),
}))

vi.mock('#nuxtseo/h3', () => ({
  getRequestHost: () => 'example.com',
  getRequestProtocol: () => 'https',
}))

vi.mock('site-config-stack', () => vi.importActual('../../packages/site-config/src/index'))

const { getSiteRouteRules } = await import('../../packages/module/src/runtime/server/composables/getRouteRules')
const { default: injectStatePlugin } = await import('../../packages/module/src/runtime/server/plugins/injectState')
const { default: initMiddleware } = await import('../../packages/module/src/runtime/server/middleware/init')
const { default: initPlugin } = await import('../../packages/module/src/runtime/server/plugins/init')

function createRenderHtmlHarness() {
  let renderHtmlHook: ((ctx: { body: string[], bodyAppend: string[] }, extra: { event: any }) => Promise<void> | void) | undefined
  const nitroApp = {
    hooks: {
      hook: (name: string, fn: any) => {
        if (name === 'render:html')
          renderHtmlHook = fn
      },
    },
  }
  injectStatePlugin(nitroApp as any)
  return renderHtmlHook!
}

function createRequestHookHarness() {
  let requestHook: ((event: any) => Promise<void> | void) | undefined
  const nitroApp = {
    hooks: {
      hook: (name: string, fn: any) => {
        if (name === 'request')
          requestHook = fn
      },
    },
  }
  initPlugin(nitroApp as any)
  return requestHook!
}

function makeEvent(overrides: Record<string, any> = {}) {
  const siteConfig = createSiteConfigStack()
  siteConfig.push({ name: 'Test Site', url: 'https://example.com' })
  return {
    path: '/',
    method: 'GET',
    res: { status: 200 },
    context: {
      _initedSiteConfig: true,
      siteConfig,
    },
    ...overrides,
  }
}

afterEach(() => {
  state.routeRules = {}
  state.baseURL = '/'
  state.noSSR = false
  state.getRouteRules.mockClear()
  state.matchRouteRules.mockClear()
})

describe('getSiteRouteRules', () => {
  it('defaults ssr to true when route rules omit ssr', () => {
    state.routeRules = {}
    expect(getSiteRouteRules({ context: {} })).toEqual({ site: undefined, ssr: true })
  })

  it('preserves site rules while defaulting ssr to true when ssr is omitted', () => {
    state.routeRules = { site: { name: 'Docs' } }
    expect(getSiteRouteRules({ context: {} })).toEqual({ site: { name: 'Docs' }, ssr: true })
  })

  it('returns ssr: false only when explicitly set to false', () => {
    state.routeRules = { ssr: false, site: { name: 'SPA' } }
    expect(getSiteRouteRules({ context: {} })).toEqual({ site: { name: 'SPA' }, ssr: false })
  })
})

describe('injectState plugin', () => {
  it('does not inject window.__NUXT_SITE_CONFIG__ when route rules omit ssr', async () => {
    const onRenderHtml = createRenderHtmlHarness()
    state.routeRules = {}
    const ctx = {
      body: [],
      bodyAppend: ['<script type="application/json" data-nuxt-data="nuxt-app" data-ssr="true" id="__NUXT_DATA__">[]</script>'],
    }

    await onRenderHtml(ctx, { event: makeEvent({ path: '/about' }) })

    expect(ctx.body).toEqual([])
  })

  it('injects window.__NUXT_SITE_CONFIG__ when route rules set ssr: false', async () => {
    const onRenderHtml = createRenderHtmlHarness()
    state.routeRules = { ssr: false }
    const ctx = { body: [], bodyAppend: [] }

    await onRenderHtml(ctx, { event: makeEvent({ path: '/spa' }) })

    expect(ctx.body).toHaveLength(1)
    expect(ctx.body[0]).toContain('window.__NUXT_SITE_CONFIG__=')
    expect(ctx.body[0]).toContain('Test Site')
  })

  it('injects window.__NUXT_SITE_CONFIG__ for Nitro 3 ssr: false routes where payload marks data-ssr="false"', async () => {
    const onRenderHtml = createRenderHtmlHarness()
    // Nitro 3 strips ssr: false from matched route rules; Nuxt marks the payload script data-ssr="false".
    state.routeRules = { site: { name: 'SPA' } }
    const ctx = {
      body: [],
      bodyAppend: ['<script type="application/json" data-nuxt-data="nuxt-app" data-ssr="false" id="__NUXT_DATA__">[{"serverRendered":1},false]</script>'],
    }

    await onRenderHtml(ctx, { event: makeEvent({ path: '/spa' }) })

    expect(ctx.body).toHaveLength(1)
    expect(ctx.body[0]).toContain('window.__NUXT_SITE_CONFIG__=')
  })

  it('skips injecting state on /__nuxt_error and error HTML responses', async () => {
    const onRenderHtml = createRenderHtmlHarness()
    state.routeRules = { ssr: false }

    const errorRouteCtx = { body: [], bodyAppend: [] }
    await onRenderHtml(errorRouteCtx, { event: makeEvent({ path: '/__nuxt_error?statusCode=404' }) })
    expect(errorRouteCtx.body).toEqual([])

    state.baseURL = '/base/'
    const baseErrorRouteCtx = { body: [], bodyAppend: [] }
    await onRenderHtml(baseErrorRouteCtx, { event: makeEvent({ path: '/base/__nuxt_error?statusCode=404' }) })
    expect(baseErrorRouteCtx.body).toEqual([])

    const renderingErrorCtx = { body: [], bodyAppend: [] }
    await onRenderHtml(renderingErrorCtx, {
      event: makeEvent({
        path: '/spa',
        context: { _initedSiteConfig: true, siteConfig: createSiteConfigStack(), nuxt: { '~rendering-error': true } },
      }),
    })
    expect(renderingErrorCtx.body).toEqual([])

    const status404Ctx = { body: [], bodyAppend: [] }
    await onRenderHtml(status404Ctx, { event: makeEvent({ path: '/missing', res: { status: 404 } }) })
    expect(status404Ctx.body).toEqual([])
  })

  it('detects data-ssr="false" case-insensitively on script opening tags only', async () => {
    const onRenderHtml = createRenderHtmlHarness()

    const uppercaseCtx = {
      body: [],
      bodyAppend: ['<script>1</script><SCRIPT TYPE="application/json" DATA-NUXT-DATA="nuxt-app" DATA-SSR="false">[]</SCRIPT>'],
    }
    await onRenderHtml(uppercaseCtx, { event: makeEvent({ path: '/spa' }) })
    expect(uppercaseCtx.body).toHaveLength(1)
    expect(uppercaseCtx.body[0]).toContain('window.__NUXT_SITE_CONFIG__=')

    const bodyTextCtx = {
      body: [],
      bodyAppend: ['<script>const s = \'data-nuxt-data="nuxt-app" data-ssr="false"\'</script>'],
    }
    await onRenderHtml(bodyTextCtx, { event: makeEvent({ path: '/ssr' }) })
    expect(bodyTextCtx.body).toEqual([])
  })

  it('injects window.__NUXT_SITE_CONFIG__ on error pages when global ssr: false is enabled', async () => {
    const onRenderHtml = createRenderHtmlHarness()
    state.noSSR = true

    const errorRouteCtx = { body: [], bodyAppend: [] }
    await onRenderHtml(errorRouteCtx, { event: makeEvent({ path: '/__nuxt_error?statusCode=404' }) })
    expect(errorRouteCtx.body).toHaveLength(1)
    expect(errorRouteCtx.body[0]).toContain('window.__NUXT_SITE_CONFIG__=')

    const renderingErrorCtx = { body: [], bodyAppend: [] }
    await onRenderHtml(renderingErrorCtx, {
      event: makeEvent({
        path: '/missing',
        context: { _initedSiteConfig: true, siteConfig: createSiteConfigStack(), nuxt: { '~rendering-error': true } },
      }),
    })
    expect(renderingErrorCtx.body).toHaveLength(1)
    expect(renderingErrorCtx.body[0]).toContain('window.__NUXT_SITE_CONFIG__=')

    const status404Ctx = { body: [], bodyAppend: [] }
    await onRenderHtml(status404Ctx, { event: makeEvent({ path: '/missing', res: { status: 404 } }) })
    expect(status404Ctx.body).toHaveLength(1)
    expect(status404Ctx.body[0]).toContain('window.__NUXT_SITE_CONFIG__=')
  })

  it('skips injecting state when SSR already serialized site config into the payload', async () => {
    const onRenderHtml = createRenderHtmlHarness()
    state.routeRules = { ssr: false }
    const ctx = { body: [], bodyAppend: [] }

    await onRenderHtml(ctx, {
      event: makeEvent({
        path: '/spa',
        context: { _initedSiteConfig: true, _siteConfigInPayload: true, siteConfig: createSiteConfigStack() },
      }),
    })

    expect(ctx.body).toEqual([])
  })
})

describe('init middleware and request hook', () => {
  it('skips route-rule lookup in middleware when site config is already initialized', async () => {
    const event = makeEvent()

    await (initMiddleware as any)(event)

    expect(state.getRouteRules).not.toHaveBeenCalled()
  })

  it('initializes siteConfig on direct /__nuxt_error requests while skipping route rules', async () => {
    const onRequest = createRequestHookHarness()
    const requestEvent: any = { path: '/__nuxt_error', method: 'GET', context: {} }

    await onRequest(requestEvent)
    expect(state.matchRouteRules).not.toHaveBeenCalled()
    expect(requestEvent.context._initedSiteConfig).toBe(true)
    expect(requestEvent.context.siteConfig.get().name).toBe('Test Site')

    const middlewareEvent: any = { path: '/__nuxt_error', method: 'GET', context: {} }
    await (initMiddleware as any)(middlewareEvent)
    expect(state.getRouteRules).not.toHaveBeenCalled()
    expect(middlewareEvent.context._initedSiteConfig).toBe(true)
    expect(middlewareEvent.context.siteConfig.get().name).toBe('Test Site')
  })

  it('initializes siteConfig on Nitro 2 localFetch error renders when event.context.nuxt is unset', async () => {
    const onRequest = createRequestHookHarness()
    const requestEvent: any = {
      path: '/__nuxt_error?__nuxt_error_payload=foo',
      method: 'GET',
      node: { req: { __unenv__: { nuxt: { '~rendering-error': true } } } },
      context: {},
    }

    await onRequest(requestEvent)
    expect(state.matchRouteRules).not.toHaveBeenCalled()
    expect(requestEvent.context._initedSiteConfig).toBe(true)
    expect(requestEvent.context.siteConfig.get().name).toBe('Test Site')

    const middlewareEvent: any = {
      path: '/__nuxt_error?__nuxt_error_payload=foo',
      method: 'GET',
      node: { req: { __unenv__: { nuxt: { '~rendering-error': true } } } },
      context: {},
    }

    await (initMiddleware as any)(middlewareEvent)
    expect(state.getRouteRules).not.toHaveBeenCalled()
    expect(middlewareEvent.context._initedSiteConfig).toBe(true)
    expect(middlewareEvent.context.siteConfig.get().name).toBe('Test Site')
  })

  it('skips route-rule matching on internal /__nuxt_error renders while keeping siteConfig available for error.vue', async () => {
    const onRequest = createRequestHookHarness()
    const event: any = {
      path: '/__nuxt_error?__nuxt_error_payload=foo',
      method: 'GET',
      context: { nuxt: { '~rendering-error': true } },
    }

    await onRequest(event)

    expect(state.matchRouteRules).not.toHaveBeenCalled()
    expect(event.context._initedSiteConfig).toBe(true)
    expect(event.context.siteConfig.get().name).toBe('Test Site')
  })
})
