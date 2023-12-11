import type { SiteConfig, SiteConfigInput, SiteConfigStack } from 'site-config-stack'
import type { MaybeRef } from '@vue/reactivity'

// Once we are accessing site config within Nuxt we have access to the url through request headers / window location
export type NuxtSiteConfig = Omit<SiteConfig, 'url'> & Required<Pick<SiteConfig, 'url'>>

export type { SiteConfig, SiteConfigStack, SiteConfigInput }

// same as CreateSitePathResolverOptions but with MaybeRef for each value
export type VueCreateSitePathResolverOptions = {
  [K in keyof CreateSitePathResolverOptions]: MaybeRef<CreateSitePathResolverOptions[K] | undefined> | undefined
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
