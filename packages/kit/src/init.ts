import { installModule, resolvePath, tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfig } from 'site-config-stack'
import { createSiteConfigStack } from 'site-config-stack'
import type { Nuxt } from '@nuxt/schema'
import type { SiteConfigInput, SiteConfigStack } from './type'
import { DefaultSiteConfig, VendorEnv, envShim } from './const'

async function getPkgJsonContextConfig(rootDir: string) {
  const pkgJson = await readPackageJSON(undefined, { startingFrom: rootDir })
  if (!pkgJson)
    return {}

  return <SiteConfigInput> {
    _context: 'package.json',
    name: pkgJson.name,
    description: pkgJson.description,
  }
}

export async function initSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): Promise<SiteConfigStack | undefined> {
  if (!nuxt)
    return

  let siteConfig = nuxt._siteConfig
  if (siteConfig)
    return siteConfig

  // only when called the first time
  siteConfig = createSiteConfigStack()

  // 1. Defaults
  siteConfig.push(DefaultSiteConfig)
  const rootDir = nuxt?.options.rootDir || process.cwd()
  const isNodeEnv = !!envShim.NODE_ENV
  // the root dir is maybe the name of the site
  siteConfig.push({
    _context: 'system',
    name: rootDir.split('/').pop(),
    indexable: isNodeEnv ? envShim.NODE_ENV === 'production' : !process.dev,
  })
  siteConfig.push(await getPkgJsonContextConfig(rootDir))

  // add the env vars lowest priority
  siteConfig.push(VendorEnv)
  nuxt._siteConfig = siteConfig
  return siteConfig
}

export async function installNuxtSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): Promise<void> {
  await installModule(await resolvePath('nuxt-site-config'))
  await initSiteConfig(nuxt)
}

function getSiteConfigStack(nuxt: Nuxt | null = tryUseNuxt()): SiteConfigStack {
  if (!nuxt)
    throw new Error('Nuxt context is missing.')

  if (!nuxt._siteConfig)
    throw new Error('Site config is not initialized. Make sure you are running your module after nuxt-site-config.')

  return nuxt._siteConfig
}
export function updateSiteConfig(input: SiteConfigInput, nuxt: Nuxt | null = tryUseNuxt()): void {
  const container = getSiteConfigStack(nuxt)
  container.push(input)
}

export function useSiteConfig(context?: { path: string }, nuxt: Nuxt | null = tryUseNuxt()): SiteConfig {
  const container = getSiteConfigStack(nuxt)
  return container.get()
}
