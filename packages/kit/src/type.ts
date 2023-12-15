import type { SiteConfigInput, SiteConfigStack } from 'site-config-stack'

export type AssertionModes = 'prerender' | 'generate' | 'build'
export interface ModuleAssertion { context: string, requirements: Partial<Record<keyof SiteConfigInput, string>> }

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
