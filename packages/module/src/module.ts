import {
  addComponent,
  addImportsDir,
  addPlugin,
  addPrerenderRoutes,
  addServerHandler,
  addServerPlugin,
  createResolver,
  defineNuxtModule,
  hasNuxtModule,
  useLogger,
} from '@nuxt/kit'
import { getSiteConfigStack, initSiteConfig, updateSiteConfig } from 'nuxt-site-config-kit'
import type { SiteConfigInput } from 'nuxt-site-config-kit'
import type { Preset } from 'unimport'
import { version } from '../package.json'
import { extendTypes } from './kit'
import { setupDevToolsUI } from './devtools'

export interface ModuleOptions extends SiteConfigInput {
  componentOptions?: {
    global?: boolean
    prefix?: string
  }
  /**
   * Enable debug mode.
   *
   * @default false
   */
  debug: boolean
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
      nuxt: '^3.6.0',
      bridge: false,
    },
    configKey: 'site',
  },
  defaults(nuxt) {
    return {
      debug: nuxt.options.debug || false,
    }
  },
  async setup(config, nuxt) {
    const logger = useLogger('nuxt-site-config')
    logger.level = config.debug ? 4 : 3

    const { resolve } = createResolver(import.meta.url)

    await initSiteConfig()
    // the module config should have the highest priority
    // site config input should be config except without the debug option
    const siteConfigInput = { ...config }
    // @ts-expect-error untyped
    delete siteConfigInput.debug
    await updateSiteConfig({
      // we should allow environment variables to override the site config
      _priority: -3,
      _context: 'nuxt-site-config:config',
      ...siteConfigInput,
    })

    // merge the site config into the runtime config once modules are done extending it
    nuxt.hook('modules:done', async () => {
      // @ts-expect-error untyped
      await nuxt.callHook('site-config:resolve')
      nuxt.options.runtimeConfig['nuxt-site-config'] = {
        stack: getSiteConfigStack().stack,
        version,
        debug: config.debug,
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
}

declare module 'h3' {
  interface H3EventContext {
    siteConfig: import('${typesPath}').SiteConfigStack
  }
}

declare module 'nuxt/schema' {
  interface AppConfigInput {
    /** Theme configuration */
    site?: import('${typesPath}').SiteConfigInput
  }
}

declare module '@nuxt/schema' {
  interface AppConfigInput {
    /** Theme configuration */
    site?: import('${typesPath}').SiteConfigInput
  }
  interface Nuxt {
    _siteConfig?: import('${typesPath}').SiteConfigStack
  }
}

declare module '@nuxt/schema' {
  export interface RuntimeNuxtHooks {
    'site-config:resolve': (siteConfig: import('${typesPath}').SiteConfig) => void
  }
}
`
    })

    addImportsDir(resolve('./runtime/nuxt/composables'))

    // on prerender

    await addComponent({
      filePath: resolve('./runtime/nuxt/component/SiteLink.vue'),
      name: `${config.componentOptions?.prefix || ''}SiteLink`,
      global: config.componentOptions?.global,
    })

    if (process.env.playground)
      nuxt.options.alias['site-config-stack'] = resolve('../../site-config/src/index')

    const siteConfigPreset: Preset = {
      from: '#internal/nuxt-site-config',
      imports: [
        'useSiteConfig',
        'useNitroOrigin',
        'updateSiteConfig',
        'withSiteUrl',
        'withSiteTrailingSlash',
        'createSitePathResolver',
      ],
    }
    nuxt.options.nitro = nuxt.options.nitro || {}
    nuxt.options.nitro.imports = nuxt.options.nitro.imports || {}
    nuxt.options.nitro.imports.presets = nuxt.options.nitro.imports.presets || []
    nuxt.options.nitro.imports.presets.push(siteConfigPreset)
    nuxt.options.nitro.alias = nuxt.options.nitro.alias || {}
    nuxt.options.nitro.alias['#internal/nuxt-site-config'] = resolve('./runtime/nitro/composables')

    // add site-config-stack to transpile
    nuxt.options.build.transpile.push('site-config-stack')

    addPlugin({
      src: resolve('./runtime/nuxt/plugins/0.siteConfig'),
    })
    if (hasNuxtModule('@nuxtjs/i18n')) {
      addPlugin({
        src: resolve('./runtime/nuxt/plugins/i18n'),
      })
      updateSiteConfig({
        _context: '@nuxtjs/i18n',
        // @ts-expect-error untyped
        url: nuxt.options.i18n?.baseUrl,
        // @ts-expect-error untyped
        defaultLocale: nuxt.options.i18n?.defaultLocale,
      })
    }

    // add middleware
    addServerHandler({
      middleware: true,
      handler: resolve('./runtime/nitro/middleware/init'),
    })

    if (config.debug || nuxt.options.dev) {
      addServerHandler({
        route: '/__site-config__/debug.json',
        handler: resolve('./runtime/nitro/routes/__site-config__/debug'),
      })

      if (nuxt.options._generate)
        addPrerenderRoutes('/__site-config__/debug.json')
    }

    if (nuxt.options.dev)
      setupDevToolsUI(resolve)

    // injects the payload for non-ssr templates
    addServerPlugin(resolve('./runtime/nitro/plugins/injectState'))
  },
})
