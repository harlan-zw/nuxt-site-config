import type Process from 'node:process'
import type { SiteConfigInput } from '../../type'

const processShim = typeof process !== 'undefined' ? process : {} as typeof Process
const envShim = processShim.env || {}

export const envSiteConfig: SiteConfigInput = {
  url: [
    envShim.NUXT_PUBLIC_VERCEL_URL, // vercel
    envShim.NUXT_PUBLIC_URL, // netlify
    envShim.NUXT_PUBLIC_CF_PAGES_URL, // cloudflare pages
    envShim.NUXT_PUBLIC_SITE_URL, // nuxt-site-config
  ].find(k => Boolean(k)),
  name: envShim.NUXT_PUBLIC_SITE_NAME,
  description: envShim.NUXT_PUBLIC_SITE_DESCRIPTION,
  logo: envShim.NUXT_PUBLIC_SITE_IMAGE,
  indexable: envShim.NUXT_PUBLIC_SITE_INDEXABLE || envShim.NUXT_PUBLIC_SITE_INDEX,
  titleSeparator: envShim.NUXT_PUBLIC_SITE_TITLE_SEPARATOR,
  trailingSlash: envShim.NUXT_PUBLIC_SITE_TRAILING_SLASH,
  locale: envShim.NUXT_PUBLIC_SITE_LANGUAGE || envShim.NUXT_PUBLIC_SITE_LOCALE,
}
