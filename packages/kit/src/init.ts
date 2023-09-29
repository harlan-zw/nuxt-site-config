import { installModule, resolvePath, tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfig } from 'site-config-stack'
import { createSiteConfigStack } from 'site-config-stack'
import type { Nuxt } from '@nuxt/schema'
import { env, isProduction, process } from 'std-env'
import type { SiteConfigInput, SiteConfigStack } from './type'

export async function initSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): Promise<SiteConfigStack | undefined> {
  if (!nuxt)
    return

  let siteConfig = nuxt._siteConfig
  if (siteConfig)
    return siteConfig

  // only when called the first time
  siteConfig = createSiteConfigStack()

  // 1. Defaults
  siteConfig.push({
    _priority: -20,
    _context: 'defaults',
    defaultLocale: 'en',
    trailingSlash: false,
  })
  const rootDir = nuxt?.options.rootDir || process.cwd?.() || false
  // the root dir is maybe the name of the site
  siteConfig.push({
    _context: 'system',
    _priority: -15,
    name: rootDir ? rootDir.split('/').pop() : undefined,
    indexable: isProduction,
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
      env.VERCEL_URL,
      env.NUXT_ENV_VERCEL_URL,
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
  })

  // not actually needed
  const runtimeConfig = nuxt.options.runtimeConfig
  function getRuntimeConfig(config: string): string | undefined {
    return (runtimeConfig[`site${config}`] || runtimeConfig.public?.[`site${config}`]) as string | undefined
  }
  function getEnv(config: string): string | undefined {
    const key = config.toUpperCase()
    if (env[`NUXT_SITE_${key}`])
      return env[`NUXT_SITE_${key}`]
    if (env[`NUXT_PUBLIC_SITE_${key}`])
      return env[`NUXT_PUBLIC_SITE_${key}`]
  }
  // support legacy config
  siteConfig.push({
    _priority: -1,
    _context: 'runtimeConfig',
    url: getRuntimeConfig('Url'),
    name: getRuntimeConfig('Name'),
    description: getRuntimeConfig('Description'),
    logo: getRuntimeConfig('Image'),
    defaultLocale: getRuntimeConfig('Language'),
    indexable: getRuntimeConfig('Indexable'),
    ...(nuxt?.options.runtimeConfig.public.site as any as SiteConfigInput || {}),
  })
  // env is highest support
  siteConfig.push({
    _context: 'env',
    _priority: 0,
    url: getEnv('Url'),
    name: getEnv('Name'),
    description: getEnv('Description'),
    logo: getEnv('Image'),
    defaultLocale: getEnv('Language'),
    indexable: getEnv('Indexable'),
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
export function updateSiteConfig(input: SiteConfigInput, nuxt: Nuxt | null = tryUseNuxt()): void {
  const container = getSiteConfigStack(nuxt)
  container.push(input)
}

export function useSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): SiteConfig {
  const container = getSiteConfigStack(nuxt)
  return container.get()
}
