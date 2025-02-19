import type { Nuxt } from '@nuxt/schema'
import type { SiteConfigInput, SiteConfigResolved, SiteConfigStack } from 'site-config-stack'
import { installModule, resolvePath, tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import { createSiteConfigStack, envSiteConfig } from 'site-config-stack'

export async function initSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): Promise<SiteConfigStack | undefined> {
  if (!nuxt)
    return

  let siteConfig = nuxt._siteConfig
  if (siteConfig)
    return siteConfig

  // only when called the first time
  siteConfig = createSiteConfigStack()

  const rootDir = nuxt?.options.rootDir || process.cwd?.() || false
  // the root dir is maybe the name of the site
  siteConfig.push({
    _context: 'system',
    _priority: -15,
    name: rootDir ? rootDir.split('/').pop() : undefined,
    env: process.env.NODE_ENV,
  })
  if (rootDir) {
    const pkgJson = await readPackageJSON(undefined, { startingFrom: rootDir })
    if (pkgJson) {
      siteConfig.push({
        _context: 'package.json',
        _priority: -10,
        name: pkgJson.name,
        description: pkgJson.description,
      })
    }
  }

  // add the env vars lowest priority
  siteConfig.push({
    _context: 'vendorEnv',
    _priority: -5,
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

  const runtimeConfig = nuxt.options.runtimeConfig

  // TODO drop support for this in a v3
  const runtimeConfigEnvKeys = [
    ...Object.entries(runtimeConfig.site || {})
      .filter(([k]) => k.startsWith('site'))
      .map(([k, v]) => [k.replace(/^site/, ''), v] as const),
    ...Object.entries([...Object.entries(runtimeConfig), ...Object.entries(runtimeConfig.public)])
      .filter(([k]) => k.startsWith('site'))
      .map(([k, v]) => [k.replace(/^site/, ''), v] as const),
  ]
  siteConfig.push({
    _priority: -2,
    _context: 'legacyRuntimeConfig',
    ...Object.fromEntries(runtimeConfigEnvKeys),
  })
  // env is highest support
  siteConfig.push({
    _context: 'buildEnv',
    _priority: -1,
    ...envSiteConfig(process.env),
  })
  nuxt._siteConfig = siteConfig
  return siteConfig
}

export async function installNuxtSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): Promise<void> {
  await installModule(await resolvePath('nuxt-site-config'))
  await initSiteConfig(nuxt)
}

export function getSiteConfigStack(nuxt: Nuxt | null = tryUseNuxt()): SiteConfigStack {
  if (!nuxt)
    throw new Error('Nuxt context is missing.')

  if (!nuxt._siteConfig)
    throw new Error('Site config is not initialized. Make sure you are running your module after nuxt-site-config.')

  return nuxt._siteConfig
}
export function updateSiteConfig(input: SiteConfigInput, nuxt: Nuxt | null = tryUseNuxt()): () => void {
  const container = getSiteConfigStack(nuxt)
  return container.push(input)
}

export function useSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): SiteConfigResolved {
  const container = getSiteConfigStack(nuxt)
  return container.get()
}
