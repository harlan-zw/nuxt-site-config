import type Process from 'node:process'
import type { SiteConfigInput } from 'site-config-stack'

export const processShim = typeof process !== 'undefined' ? process : {} as typeof Process
export const envShim = processShim.env || {}
export const DefaultSiteConfig: SiteConfigInput = {
  _context: 'defaults',
  defaultLocale: 'en',
  trailingSlash: false,
}

export const VendorEnv: SiteConfigInput = {
  _context: 'vendorEnv',
  url: [
    // vercel
    envShim.VERCEL_URL, envShim.NUXT_ENV_VERCEL_URL,
    // netlify
    envShim.URL,
    // cloudflare pages
    envShim.CF_PAGES_URL,
  ].find(k => Boolean(k)),
  name: [
    // vercel
    envShim.NUXT_ENV_VERCEL_GIT_REPO_SLUG,
    // netlify
    envShim.SITE_NAME,
  ].find(k => Boolean(k)),
}
