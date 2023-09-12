import type { SiteConfigInput } from 'site-config-stack'
import { env } from 'std-env'

export const DefaultSiteConfig: SiteConfigInput = {
  _context: 'defaults',
  defaultLocale: 'en',
  trailingSlash: false,
}

export const VendorEnv: SiteConfigInput = {
  _context: 'vendorEnv',
  url: [
    // vercel
    env.VERCEL_URL, env.NUXT_ENV_VERCEL_URL,
    // netlify
    env.URL,
    // cloudflare pages
    env.CF_PAGES_URL,
  ].find(k => Boolean(k)),
  name: [
    // vercel
    env.NUXT_ENV_VERCEL_GIT_REPO_SLUG,
    // netlify
    env.SITE_NAME,
  ].find(k => Boolean(k)),
}
