import { installModule, resolvePath, tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfig } from 'site-config-stack'
import { createSiteConfigStack, envSiteConfig } from 'site-config-stack'
import type { Nuxt } from '@nuxt/schema'
import type { SiteConfigInput, SiteConfigStack } from './type'

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
  siteConfig.push({
    _context: 'defaults',
    locale: 'en',
    trailingSlash: false,
    titleSeparator: '|',
  })
  const rootDir = nuxt?.options.rootDir || process.cwd()
  const isNodeEnv = !!process.env.NODE_ENV
  // the root dir is maybe the name of the site
  siteConfig.push({
    _context: 'system',
    name: rootDir.split('/').pop(),
    indexable: isNodeEnv ? process.env.NODE_ENV === 'production' : !process.dev,
  })
  siteConfig.push(await getPkgJsonContextConfig(rootDir))

  // add the env vars lowest priority
  siteConfig.push(envSiteConfig)
  // not actually needed
  const runtimeConfig = nuxt.options.runtimeConfig
  function getRuntimeConfig(config: string, env: string): string | undefined {
    if (process.env[`NUXT_${env}}`])
      return process.env[`NUXT_${env}}`]
    if (process.env[`NUXT_PUBLIC_${env}}`])
      return process.env[`NUXT_PUBLIC_${env}}`]
    return (runtimeConfig[`site${config}`] || runtimeConfig.public?.[`site${config}`]) as string | undefined
  }
  // support legacy config
  siteConfig.push(<SiteConfigInput> {
    _context: 'legacyRuntimeConfig',
    url: getRuntimeConfig('Url', '_URL'),
    name: getRuntimeConfig('Name', '_NAME'),
    description: getRuntimeConfig('Description', '_DESCRIPTION'),
    logo: getRuntimeConfig('Image', '_IMAGE'),
    locale: getRuntimeConfig('Language', '_LANGUAGE'),
    indexable: getRuntimeConfig('Indexable', '_INDEXABLE'),
  })
  siteConfig.push({
    _context: 'runtimeConfig',
    ...(nuxt?.options.runtimeConfig.public.site as any as SiteConfigInput || {}),
  })

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

export function useSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): SiteConfig {
  const container = getSiteConfigStack(nuxt)
  return container.get()
}
