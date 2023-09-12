import {
  addComponent,
  addImports, addPlugin, addPrerenderRoutes, addServerHandler,
  createResolver,
  defineNuxtModule, hasNuxtModule, useLogger,
} from '@nuxt/kit'
import { initSiteConfig, updateSiteConfig, useSiteConfig } from 'nuxt-site-config-kit'
import type { SiteConfig, SiteConfigInput } from 'nuxt-site-config-kit'
import { extendTypes } from './kit'

export interface ModuleOptions extends SiteConfigInput {
  /**
   * Enable debug mode.
   *
   * @default false
   */
  debug: boolean
}

export interface ModulePublicRuntimeConfig {
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
    await updateSiteConfig({
      // we should allow environment variables to override the site config
      _priority: -3,
      _context: 'nuxt-site-config:config',
      ...config,
    })

    // merge the site config into the runtime config once modules are done extending it
    nuxt.hook('modules:done', async () => {
      // @ts-expect-error untyped
      await nuxt.callHook('site-config:resolve')
      // @ts-expect-error runtime
      nuxt.options.runtimeConfig.public.site = useSiteConfig()
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

    const composables = ['useSiteConfig', 'updateSiteConfig', 'useNitroOrigin']
    composables.forEach((c) => {
      addImports({
        from: resolve(`./runtime/composables/${c}`),
        name: c,
      })
    })
    const linkComposables = ['createSitePathResolver', 'withSiteTrailingSlash', 'withSiteUrl']
    linkComposables.forEach((c) => {
      addImports({
        from: resolve('./runtime/composables/utils'),
        name: c,
      })
    })

    // on prerender

    await addComponent({
      filePath: resolve('./runtime/component/SiteLink.vue'),
      name: 'SiteLink',
    })

    if (process.env.playground)
      nuxt.options.alias['site-config-stack'] = resolve('../../site-config/src/index')

    nuxt.options.nitro.imports = nuxt.options.nitro.imports || {}
    nuxt.options.nitro.imports.imports = nuxt.options.nitro.imports.imports || []
    nuxt.options.nitro.imports.imports.push(...[
      {
        as: 'useSiteConfig',
        name: 'useSiteConfig',
        from: resolve('./runtime/nitro/composables/useSiteConfig'),
      },
      {
        as: 'useNitroOrigin',
        name: 'useNitroOrigin',
        from: resolve('./runtime/nitro/composables/useNitroOrigin'),
      },
      {
        as: 'updateSiteConfig',
        name: 'updateSiteConfig',
        from: resolve('./runtime/nitro/composables/updateSiteConfig'),
      },
      {
        as: 'withSiteUrl',
        name: 'withSiteUrl',
        from: resolve('./runtime/nitro/composables/utils'),
      },
      {
        as: 'withSiteTrailingSlash',
        name: 'withSiteTrailingSlash',
        from: resolve('./runtime/nitro/composables/utils'),
      },
      {
        as: 'createSitePathResolver',
        name: 'createSitePathResolver',
        from: resolve('./runtime/nitro/composables/utils'),
      },
    ])

    // add site-config-stack to transpile
    nuxt.options.build.transpile.push('site-config-stack')

    addPlugin({
      src: resolve('./runtime/plugins/0.siteConfig'),
    })
    if (hasNuxtModule('@nuxtjs/i18n')) {
      addPlugin({
        src: resolve('./runtime/plugins/i18n'),
      })
    }

    // add middleware
    addServerHandler({
      middleware: true,
      handler: resolve('./runtime/nitro/middleware/init'),
    })

    if (config.debug) {
      addServerHandler({
        route: '/api/__site-config__/debug',
        handler: resolve('./runtime/nitro/routes/debug'),
      })

      addPrerenderRoutes('/api/__site-config__/debug')
    }
  },
})
