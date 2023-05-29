import {
  addComponent,
  addImports,
  createResolver,
  defineNuxtModule,
} from '@nuxt/kit'
import defu from 'defu'
import type { SiteConfig } from './type'
import { useSiteConfig } from './build/useSiteConfig'

export interface ModuleOptions extends SiteConfig {
}

export interface ModulePublicRuntimeConfig {
  site: Partial<SiteConfig>
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
      nuxt: '^3.5.0',
      bridge: false,
    },
    configKey: 'site',
  },
  async setup(config, nuxt) {
    nuxt.options.runtimeConfig.public.site = defu(config, nuxt.options.runtimeConfig.public.site || {})
    const { resolve } = createResolver(import.meta.url)

    const composables = ['useSiteConfig', 'createInternalLinkResolver', 'resolveAbsoluteInternalLink', 'resolveTrailingSlash']
    composables.forEach((c) => {
      addImports({
        from: resolve('./runtime/composables'),
        name: c,
      })
    })

    await addComponent({
      filePath: resolve('./runtime/component/SiteLink.vue'),
      name: 'SiteLink',
    })

    // need to transpile shared
    const shared = resolve('./runtime/shared')
    nuxt.options.build.transpile.push(shared)

    nuxt.hook('modules:done', async () => {
      nuxt.options.runtimeConfig.public.site = await useSiteConfig(nuxt.options.runtimeConfig.public.site)
    })
  },
})
