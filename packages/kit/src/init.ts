import { tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfig } from 'site-config-stack'
import { createSiteConfigStack, envSiteConfig } from 'site-config-stack'
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

export async function initSiteConfig(): Promise<SiteConfigStack | undefined> {
  // use defaults from runtime config
  const nuxt = tryUseNuxt()
  if (!nuxt)
    return

  let siteConfig = nuxt._siteConfig
  if (siteConfig)
    return siteConfig

  const rootDir = nuxt?.options.rootDir || process.cwd()
  // only when called the first time
  siteConfig = createSiteConfigStack()
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

async function getSiteConfigStack(): Promise<SiteConfigStack> {
  const lastFunctionName = new Error('tmp').stack?.split('\n')[2].split(' ')[5]
  const container = await initSiteConfig()
  if (!container)
    throw new Error(`Site config isn't initialized. Make sure you're calling \`${lastFunctionName}\` within the Nuxt context.`)
  return container
}
export async function updateSiteConfig(input: SiteConfigInput): Promise<void> {
  const container = await getSiteConfigStack()
  container.push(input)
}

export async function useSiteConfig(): Promise<SiteConfig> {
  const container = await getSiteConfigStack()
  return container.get()
}
