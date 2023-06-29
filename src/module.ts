import {
  addComponent,
  addImports, addPlugin, addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { SiteConfig, SiteConfigInput, SiteConfigStack } from './type'
import { assertSiteConfig, updateSiteConfig, useSiteConfig } from './kit'
import type { AssertionModes, ModuleAssertion } from '~/src/type'

export interface ModuleOptions extends SiteConfigInput {
}

export interface ModulePublicRuntimeConfig {
  site: SiteConfigInput
}

declare module 'h3' {
  interface H3EventContext {
    siteConfig: SiteConfigStack
  }
}

declare module 'nuxt/schema' {
  interface AppConfigInput {
    /** Theme configuration */
    site?: SiteConfigInput
  }
}

declare module '@nuxt/schema' {
  interface AppConfigInput {
    /** Theme configuration */
    site?: SiteConfigInput
  }
  interface Nuxt {
    _siteConfig?: SiteConfigStack
    _siteConfigAsserts?: Partial<Record<Partial<AssertionModes>, ModuleAssertion[]>>
  }
}

declare module '@nuxt/schema' {
  export interface RuntimeNuxtHooks {
    'site-config:resolve': (siteConfig: SiteConfig) => void
  }
}

export interface ModuleHooks {
  'site-config:resolve': (siteConfig: SiteConfig) => void
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
  async setup(config, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    const composables = ['useSiteConfig', 'updateSiteConfig']
    composables.forEach((c) => {
      addImports({
        from: resolve(`./runtime/composables/${c}`),
        name: c,
      })
    })

    // merge the site config into the runtime config once modules are done extending it
    nuxt.hook('modules:done', async () => {
      // the module config should have the highest priority
      await updateSiteConfig({
        _context: 'nuxt:config:site',
        ...config,
      })
      const siteConfig = await useSiteConfig()
      // final hook for other modules to modify the site config
      // @ts-expect-error untyped
      await nuxt.callHook('site-config:resolve', siteConfig)
      // @ts-ignore runtime type
      nuxt.options.runtimeConfig.public.site = siteConfig
    })

    // on prerender
    nuxt.hooks.hook('nitro:init', async (nitro) => {
      nitro.hooks.hookOnce('prerender:generate', async () => {
        await assertSiteConfig('prerender')
      })
    })

    const linkComposables = ['createInternalLinkResolver', 'resolveAbsoluteInternalLink', 'resolveTrailingSlash']
    linkComposables.forEach((c) => {
      addImports({
        from: resolve('./runtime/composables/utils'),
        name: c,
      })
    })

    addImports({
      from: resolve('./runtime/nitro/composables/useNitroOrigin'),
      name: 'useNitroOrigin',
    })

    await addComponent({
      filePath: resolve('./runtime/component/SiteLink.vue'),
      name: 'SiteLink',
    })

    // need to transpile shared
    const shared = resolve('./runtime/siteConfig')
    nuxt.options.build.transpile.push(shared)

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
    ])

    addPlugin({
      src: resolve('./runtime/plugins/siteConfig'),
    })

    // add middleware
    addServerHandler({
      middleware: true,
      handler: resolve('./runtime/nitro/middleware/init'),
    })
  },
})
