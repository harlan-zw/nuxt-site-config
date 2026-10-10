import type { Nuxt } from '@nuxt/schema'
import type { SiteConfigInput, SiteConfigResolved, SiteConfigStack } from 'site-config-stack'
import { tryUseNuxt } from '@nuxt/kit'
import { createSiteConfigStack, envSiteConfig, SiteConfigPriority } from 'site-config-stack'

export async function initSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): Promise<SiteConfigStack | undefined> {
  if (!nuxt)
    return
  return initSiteConfigStack(nuxt)
}

function initSiteConfigStack(nuxt: Nuxt): SiteConfigStack {
  let siteConfig = nuxt._siteConfig
  if (siteConfig)
    return siteConfig

  // only when called the first time
  siteConfig = createSiteConfigStack()

  siteConfig.push({
    _context: 'system',
    _priority: SiteConfigPriority.system,
    env: nuxt.options.envName || process.env.NODE_ENV,
  })

  // add the env vars lowest priority
  siteConfig.push({
    _context: 'vendorEnv',
    _priority: SiteConfigPriority.vendor,
    url: [
      // vercel
      process.env.VERCEL_URL,
      process.env.NUXT_ENV_VERCEL_URL,
      // netlify
      process.env.URL,
      // cloudflare pages
      process.env.CF_PAGES_URL,
    ].find(k => Boolean(k)),
    name: [
      // vercel
      process.env.NUXT_ENV_VERCEL_GIT_REPO_SLUG,
      // netlify
      process.env.SITE_NAME,
    ].find(k => Boolean(k)),
  })

  // env is highest support
  siteConfig.push({
    _context: 'buildEnv',
    _priority: SiteConfigPriority.build,
    ...envSiteConfig(process.env || {}),
  })

  // Dependency modules can run after their consumers. Seed config for early reads.
  const options = nuxt.options as Nuxt['options'] & { site?: SiteConfigInput | false }
  const { enabled: _enabled, debug: _debug, multiTenancy: _multiTenancy, ...siteConfigInput } = options.site || {}
  siteConfig.push({
    _priority: SiteConfigPriority.config,
    ...siteConfigInput,
    _context: 'nuxt-site-config:init',
  })
  nuxt._siteConfig = siteConfig
  return siteConfig
}

export function getSiteConfigStack(nuxt: Nuxt | null = tryUseNuxt()): SiteConfigStack {
  if (!nuxt)
    throw new Error('Nuxt context is missing.')

  return initSiteConfigStack(nuxt)
}
/**
 * Push build time site config.
 *
 * Without a `_priority`, the entry ranks with the user's `site` key (`SiteConfigPriority.config`),
 * so `NUXT_SITE_*` env vars at build and at runtime still override it.
 */
export function updateSiteConfig(input: SiteConfigInput, nuxt: Nuxt | null = tryUseNuxt()): () => void {
  const container = getSiteConfigStack(nuxt)
  return container.push({ _priority: SiteConfigPriority.config, ...input })
}

export function useSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): SiteConfigResolved {
  const container = getSiteConfigStack(nuxt)
  return container.get()
}
