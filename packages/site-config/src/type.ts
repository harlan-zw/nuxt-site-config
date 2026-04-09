import type { ComputedRef, Ref } from 'vue'

export interface SiteConfigResolved {
  /**
   * The canonical Site URL.
   *
   * - Build / Prerender: Inferred from CI environment (Netlify, Vercel)
   * - SSR: Inferred from request headers
   * - SPA: Inferred from `window.location`
   *
   * Used by: nuxt-simple-sitemap, nuxt-simple-robots, nuxt-schema-org, nuxt-og-image, etc.
   */
  url?: string
  /**
   * The name of the site.
   *
   * - Build / Prerender: Inferred from CI environment (Netlify)
   *
   * Used by: nuxt-schema-org, nuxt-seo-kit
   */
  name?: string
  /**
   * Whether the site is indexable by search engines.
   *
   * Allows you to opt-out productions environment from being indexed.
   */
  indexable?: boolean
  /**
   * The environment of the site. Comparable to `process.env.NODE_ENV`.
   */
  env?: 'production' | 'staging' | 'development' | 'preview' | 'uat' | string
  /**
   * Whether the site uses trailing slash.
   */
  trailingSlash?: boolean
  /**
   * The mapping of the context of each site config value being set.
   */
  _context?: Record<string, string>

  /**
   * Support any keys as site config.
   */
  [key: string]: any
}

/**
 * @deprecated use SiteConfigResolved
 */
export type SiteConfig = SiteConfigResolved

export type MaybeComputedRef<T> = T | (() => T) | ComputedRef<T> | Ref<T>
export type MaybeComputedRefEntries<T> = {
  [key in keyof T]?: MaybeComputedRef<T[key]>
}

/**
 * Strip the string index signature from a type so mapped types preserve
 * the declared named keys (required for autocomplete and type checking).
 */
type KnownKeys<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K]
}

export type SiteConfigInput = Omit<MaybeComputedRefEntries<KnownKeys<SiteConfigResolved>>, '_context' | 'indexable'> & {
  _context?: string
  _priority?: number
  // is cast as a boolean
  indexable?: MaybeComputedRef<string | boolean>
  // allow arbitrary keys for extension; named keys above still get autocomplete and type checking
  [key: string]: any
}

export interface GetSiteConfigOptions {
  debug?: boolean
  skipNormalize?: boolean
  resolveRefs?: boolean
}

export interface SiteConfigStack {
  stack: Partial<SiteConfigInput>[]
  push: (config: SiteConfigInput) => () => void
  get: (options?: GetSiteConfigOptions) => SiteConfigResolved
}
