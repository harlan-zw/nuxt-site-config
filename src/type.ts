import type { ComputedRef, Ref } from 'vue'

export interface SiteConfig {
  /**
   * The canonical Site URL.
   *
   * @default `process.env.NUXT_PUBLIC_SITE_URL`
   *
   * - Build / Prerender: Inferred from CI environment (Netlify, Vercel)
   * - SSR: Inferred from request headers
   * - SPA: Inferred from `window.location`
   *
   * Used by: nuxt-simple-sitemap, nuxt-simple-robots, nuxt-schema-org, nuxt-og-image, etc.
   */
  url?: string

  titleSeparator?: string
  indexable?: boolean
  trailingSlash?: boolean

  locale?: string
  // content that may change depending on the language
  /**
   * The name of the site.
   *
   * @default `process.env.NUXT_PUBLIC_SITE_NAME`
   *
   * - Build / Prerender: Inferred from CI environment (Netlify) or `package.json`
   * - SSR:
   *
   * Used by: nuxt-schema-org, nuxt-seo-kit
   */
  name?: string
  /**
   * The description of the site.
   *
   * @default `process.env.NUXT_PUBLIC_SITE_DESCRIPTION`
   *
   * Used by: nuxt-schema-org, nuxt-seo-kit
   */
  description?: string
  /**
   * The logo of the site.
   *
   * @default `process.env.NUXT_PUBLIC_SITE_LOGO`
   *
   * Used by: nuxt-schema-org, nuxt-seo-kit
   */
  logo?: string
}

export interface SiteConfigInput {
  url?: string
  name?: string
  description?: string
  logo?: string
  coverImage?: string
  titleSeparator?: string
  language?: string

  indexable?: boolean | string
  trailingSlash?: boolean | string
}

declare module 'nuxt/schema' {
  interface AppConfigInput {
    /** Theme configuration */
    site?: SiteConfigInput
  }
}

// copied from @vueuse/shared
export type MaybeReadonlyRef<T> = (() => T) | ComputedRef<T>
export type MaybeComputedRef<T> = T | MaybeReadonlyRef<T> | Ref<T>

export type MaybeComputedRefEntries<T> = MaybeComputedRef<T> | {
  [key in keyof T]?: MaybeComputedRef<T[key]>
}

export interface SiteConfigContainer {
  push: (config: SiteConfigInput) => void
  get: () => SiteConfig
}

export interface SiteConfigReactiveContainer {
  push: (config: MaybeComputedRefEntries<SiteConfigInput>) => () => void
  get: () => Ref<SiteConfig>
}

// It is always important to ensure you import/export something when augmenting a type
export {}
