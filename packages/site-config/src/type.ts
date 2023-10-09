import type { ComputedRef, Ref } from 'vue'

export interface SiteConfig {
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
  name: string
  /**
   * Whether the site is indexable by search engines.
   */
  indexable: boolean
  /**
   * The environment of the site. Comparable to `process.env.NODE_ENV`.
   */
  env: 'production' | 'staging' | 'development' | string
  /**
   * Whether the site uses trailing slash.
   */
  trailingSlash: boolean
  /**
   * Current locale, set with `@nuxt/i18n`.
   *
   * Falls back to the defaultLocale.
   */
  currentLocale?: string
  /**
   * The default locale of the site.
   */
  defaultLocale: string
  /**
   * The description of the site.
   *
   * @default `process.env.NUXT_PUBLIC_SITE_DESCRIPTION`
   *
   * Used by: nuxt-schema-org, nuxt-seo-kit
   */
  description?: string
  /**
   * Configure the identity of the site.
   */
  identity?: {
    /**
     * Use Organization for when the site is a company, business, etc.
     * Use Person for when the site is a personal blog, portfolio, etc.
     */
    type: 'Organization' | 'Person'
  }
  /**
   * Twitter (X) profile ID.
   *
   * Used for Schema.org sameAs and `<meta profile>`.
   *
   * @example `@harlan_zw`
   */
  twitter?: string
  /**
   * The mapping of the context of each site config value being set.
   */
  _context: Partial<Record<Exclude<keyof SiteConfig, '_meta'>, string>>
  [key: (string & Record<never, never>)]: any
}

export type MaybeComputedRef<T> = T | (() => T) | ComputedRef<T> | Ref<T>
export type MaybeComputedRefEntries<T> = {
  [key in keyof T]?: MaybeComputedRef<T[key]>
}

export type SiteConfigInput = Omit<MaybeComputedRefEntries<Partial<SiteConfig>>, '_context' | 'indexable'> & {
  _context?: string
  _priority?: number
  // is cast as a boolean
  indexable?: MaybeComputedRef<string | boolean>
}

export interface SiteConfigStack {
  stack: Partial<SiteConfigInput>[]
  push: (config: SiteConfigInput) => void
  get: () => SiteConfig
}
