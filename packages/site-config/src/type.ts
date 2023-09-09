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
   * Whether the site uses trailing slash.
   */
  trailingSlash: boolean
  /**
   * Current locale, set with @nuxt/i18n.
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
   * The mapping of the context of each site config value being set.
   */
  _context: Partial<Record<Exclude<keyof SiteConfig, '_meta'>, string>>
  [key: string]: any
}

export type SiteConfigInput = Partial<Omit<SiteConfig, '_context'>> & { _context?: string }

export interface SiteConfigStack {
  stack: Partial<SiteConfigInput>[]
  push: (config: SiteConfigInput) => void
  get: () => SiteConfig
}
