import type { SiteConfigInput } from 'site-config-stack'
import {
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  addServerImportsDir,
  addServerPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  hasNuxtModuleCompatibility,
  useLogger,
} from '@nuxt/kit'
import { getSiteConfigStack, initSiteConfig, updateSiteConfig } from 'nuxt-site-config-kit'
import { readPackageJSON } from 'pkg-types'
import { validateSiteConfigStack } from 'site-config-stack'
import { parseURL } from 'ufo'
import { setupDevToolsUI } from './devtools'
import { extendTypes } from './nuxt-kit'

export interface ModuleOptions extends SiteConfigInput {
  /**
   * Enable the module.
   *
   * @default true
   */
  enabled?: boolean
  /**
   * Enable debug mode.
   *
   * @default false
   */
  debug: boolean
  /**
   * Configure multi-tenancy apps at build-time.
   */
  multiTenancy?: { hosts: string[], config: SiteConfigInput }[]
}

export interface ModuleRuntimeConfig {
  site: SiteConfigInput
}

export interface ModuleHooks {
  'site-config:resolve': () => void
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-site-config',
    compatibility: {
      nuxt: '>=3.9.0',
      bridge: false,
    },
    configKey: 'site',
  },
  defaults(nuxt) {
    return {
      enabled: true,
      debug: nuxt.options.debug || false,
    }
  },
  async setup(config, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const { name, version } = await readPackageJSON(resolve('../package.json'))
    const logger = useLogger(name)
    logger.level = config.debug ? 4 : 3
    if (config.enabled === false) {
      logger.debug('The module is disabled, skipping setup.')
      return
    }

    await initSiteConfig()
    // the module config should have the highest priority
    // site config input should be config except without the debug option
    const siteConfigInput = { ...config }
    // @ts-expect-error untyped
    delete siteConfigInput.debug
    delete siteConfigInput.enabled
    updateSiteConfig({
      // we should allow environment variables to override the site config
      _priority: -3,
      _context: 'nuxt-site-config:config',
      ...siteConfigInput,
    })

    // merge the site config into the runtime config once modules are done extending it
    nuxt.hook('modules:done', async () => {
      // @ts-ignore untyped
      await nuxt.callHook('site-config:resolve')
      // let's validate the stack
      const errors = validateSiteConfigStack(getSiteConfigStack())
      if (errors.length > 0) {
        logger.warn('[Nuxt Site Config] Invalid config provided, please correct:')
        for (const error of errors)
          logger.log(`  - ${error}`)
        logger.log('')
      }
      nuxt.options.runtimeConfig['nuxt-site-config'] = {
        stack: getSiteConfigStack().stack,
        version: version!,
        debug: config.debug,
        multiTenancy: (config.multiTenancy || [])?.map((t) => {
          // normalize hosts
          t.hosts = (t.hosts || []).map(h => parseURL(h, 'https://').host).filter(Boolean) as string[]
          if (!t.hosts.length) {
            return false
          }
          return t
        }).filter(Boolean),
      }
    })

    extendTypes('nuxt-site-config', async ({ typesPath }) => {
      return `
declare module 'nitropack' {
  interface NitroRouteRules {
    site?: import('${typesPath}').SiteConfigInput
  }
  interface NitroRouteConfig {
    site?: import('${typesPath}').SiteConfig
  }
  interface NitroRuntimeHooks {
    'site-config:init': (ctx: import('${typesPath}').HookSiteConfigInitContext) => void | Promise<void>
  }
}

declare module 'h3' {
  interface H3EventContext {
    siteConfig: import('${typesPath}').SiteConfigStack
    siteConfigNitroOrigin: string
  }
}

declare module '@nuxt/schema' {
  interface Nuxt {
    _siteConfig?: import('${typesPath}').SiteConfigStack
  }
}
declare module 'nuxt/app' {
  interface NuxtApp {
     $nuxtSiteConfig: import('${typesPath}').SiteConfigStack
  }
}
declare module '#app' {
  interface NuxtApp {
    $nuxtSiteConfig: import('${typesPath}').SiteConfigStack
  }
}
declare global {
  interface Window {
    __NUXT_SITE_CONFIG__: import('${typesPath}').SiteConfigResolved
  }
}
`
    })

    addImportsDir(resolve('./runtime/app/composables'))

    // on prerender

    if (process.env.playground) {
      nuxt.options.alias['site-config-stack/urls'] = resolve('../../site-config/src/urls')
      nuxt.options.alias['site-config-stack'] = resolve('../../site-config/src/index')
    }

    addServerImportsDir(resolve('./runtime/server/composables'))
    nuxt.options.alias['#site-config'] = resolve('./runtime')
    // support legacy
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#internal/nuxt-site-config'] = resolve('./runtime/server/composable-barrel-deprecated')

    // add site-config-stack to transpile
    nuxt.options.build.transpile.push('site-config-stack')

    addPlugin({
      src: resolve('./runtime/app/plugins/0.siteConfig'),
    })
    if (hasNuxtModule('@nuxtjs/i18n')) {
      const isNuxtI18nV9 = await hasNuxtModuleCompatibility('@nuxtjs/i18n', '>=9')
      addTemplate({
        filename: 'nuxt-site-config/i18n-plugin-deps.mjs',
        getContents() {
          const v9 = ['i18n:plugin', 'i18n:plugin:ssg-detect', 'i18n:plugin:route-locale-detect']
          const v8 = ['i18n:plugin']
          return `export const i18nPluginDeps = ${JSON.stringify(isNuxtI18nV9 ? v9 : v8)}`
        },
      })
      addPlugin({
        src: resolve('./runtime/app/plugins/i18n'),
      })

      // @ts-expect-error untyped
      const baseUrl = nuxt.options.i18n?.baseUrl
      // @ts-expect-error untyped
      const locale = nuxt.options.i18n?.locales?.find(l => l.code === nuxt.options.i18n?.defaultLocale)
      updateSiteConfig({
        _context: '@nuxtjs/i18n',
        url: typeof baseUrl === 'string' ? baseUrl : undefined,
        // @ts-expect-error untyped
        defaultLocale: locale?.language || locale?.iso || nuxt.options.i18n?.defaultLocale,
      })
    }
    else if (hasNuxtModule('nuxt-i18n-micro')) {
      addPlugin({
        src: resolve('./runtime/app/plugins/i18n-micro'),
      })
      // @ts-expect-error untyped
      const baseUrl = nuxt.options.i18n?.baseUrl
      // @ts-expect-error untyped
      const locale = nuxt.options.i18n?.locales?.find(l => l.code === nuxt.options.i18n?.defaultLocale)
      updateSiteConfig({
        _context: 'nuxt-i18n-micro',
        url: typeof baseUrl === 'string' ? baseUrl : undefined,
        // @ts-expect-error untyped
        defaultLocale: locale?.language || locale?.iso || nuxt.options.i18n?.defaultLocale,
      })
    }

    // add middleware
    addServerHandler({
      middleware: true,
      handler: resolve('./runtime/server/middleware/init'),
    })

    if (config.debug || nuxt.options.dev) {
      addServerHandler({
        route: '/__site-config__/debug.json',
        handler: resolve('./runtime/server/routes/__site-config__/debug'),
      })

      if (nuxt.options._generate)
        addPrerenderRoutes('/__site-config__/debug.json')
    }

    if (nuxt.options.dev)
      setupDevToolsUI(resolve)

    // injects the payload for non-ssr templates
    addServerPlugin(resolve('./runtime/server/plugins/injectState'))
  },
})
