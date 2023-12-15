import type { SiteConfigInput, SiteConfigResolved, SiteConfigStack } from 'site-config-stack'
import type { Ref } from 'vue'

// Once we are accessing site config within Nuxt we have access to the url through request headers / window location
export type NuxtSiteConfig = Omit<SiteConfigResolved, 'url'> & Required<Pick<SiteConfigResolved, 'url'>>

export type { SiteConfigResolved, SiteConfigStack, SiteConfigInput }

// same as CreateSitePathResolverOptions but with MaybeRef for each value
export type VueCreateSitePathResolverOptions = {
  [K in keyof CreateSitePathResolverOptions]: Ref<CreateSitePathResolverOptions[K] | undefined> | CreateSitePathResolverOptions[K] | undefined
}

export interface CreateSitePathResolverOptions {
  canonical?: boolean
  absolute?: boolean
  withBase?: boolean
}

export interface ModuleRuntimeConfig {
  debug?: boolean
  stack?: Partial<SiteConfigInput>[]
  version: string
}
