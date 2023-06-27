import {
  addComponent,
  addImports, addPlugin, addServerHandler,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import type { SiteConfig, SiteConfigInput } from './type'
import { updateSiteConfig, useSiteConfig } from './build'

export * from './type'

export interface ModuleOptions extends SiteConfigInput {
}

export interface ModulePublicRuntimeConfig {
  site: SiteConfigInput
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
      await updateSiteConfig(config)
      const siteConfig = await useSiteConfig()
      // final hook for other modules to modify the site config
      await nuxt.callHook('site-config:resolve', siteConfig)
      // @ts-expect-error untyped
      nuxt.options.runtimeConfig.public.site = siteConfig
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
      src: resolve('./runtime/plugins/siteConfig.ts'),
    })

    // add middleware
    addServerHandler({
      middleware: true,
      handler: resolve('./runtime/nitro/middleware/init'),
    })
  },
})
