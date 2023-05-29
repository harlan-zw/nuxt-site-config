import type { ComputedRef, Ref } from 'vue'

export interface SiteConfig {
  /**
   * The canonical Site URL.
   * @default `process.env.NUXT_PUBLIC_SITE_URL`
   * Fallback options are:
   * - SSR: Inferred from request headers
   * - SPA: Inferred from `window.location`
   * - Prerendered: Inferred from CI environment
   */
  url: string
  name: string
  description: string
  image: string
  titleSeparator: string
  language: string

  index: boolean
  trailingSlash: boolean
}

export interface SiteConfigInput {
  url?: string
  name?: string
  description?: string
  image?: string
  titleSeparator?: string
  language?: string

  index?: boolean | string
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

// It is always important to ensure you import/export something when augmenting a type
export {}
