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
  index: boolean
  titleSeparator: string
  trailingSlash: boolean
  language: string
}
