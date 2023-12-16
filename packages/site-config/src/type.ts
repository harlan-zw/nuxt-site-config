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
   * - Build / Prerender: Inferred from CI environment (Netlify) or `package.json`
   * - SSR:
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

export type SiteConfigInput = Omit<MaybeComputedRefEntries<Partial<SiteConfigResolved>>, '_context' | 'indexable'> & {
  _context?: string
  _priority?: number
  // is cast as a boolean
  indexable?: MaybeComputedRef<string | boolean>
}

export interface GetSiteConfigOptions {
  debug?: boolean
  skipNormalize?: boolean
  resolveRefs?: boolean
}

export interface SiteConfigStack {
  stack: Partial<SiteConfigInput>[]
  push: (config: SiteConfigInput) => void
  get: (options?: GetSiteConfigOptions) => SiteConfigResolved
}
