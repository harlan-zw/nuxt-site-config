import { tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfig, SiteConfigContainer, SiteConfigInput } from '../type'
import { createSiteConfigContainer } from '../runtime/siteConfig'
import { envSiteConfig } from '../runtime/siteConfig/env'

let siteConfigContainer: SiteConfigContainer

async function getPkgJsonContextConfig(rootDir: string) {
  const pkgJson = await readPackageJSON(undefined, { startingFrom: rootDir })
  if (!pkgJson)
    return {}

  return <SiteConfigInput> {
    name: pkgJson.name,
    description: pkgJson.description,
  }
}

export async function initSiteConfig(): Promise<SiteConfig> {
  // use defaults from runtime config
  const nuxt = tryUseNuxt()
  const rootDir = nuxt?.options.rootDir || process.cwd()

  // only when called the first time
  if (!siteConfigContainer) {
    siteConfigContainer = createSiteConfigContainer()
    const isNodeEnv = !!process.env.NODE_ENV
    // the root dir is maybe the name of the site
    siteConfigContainer.push({
      name: rootDir.split('/').pop(),
      indexable: isNodeEnv ? process.env.NODE_ENV === 'production' : !process.dev,
    })
    siteConfigContainer.push(await getPkgJsonContextConfig(rootDir))

    // add the env vars lowest priority
    siteConfigContainer.push(envSiteConfig)
    // not actually needed
    if (nuxt) {
      const runtimeConfig = nuxt.options.runtimeConfig
      function getRuntimeConfig(config: string, env: string): string | undefined {
        if (process.env[`NUXT_${env}}`])
          return process.env[`NUXT_${env}}`]
        if (process.env[`NUXT_PUBLIC_${env}}`])
          return process.env[`NUXT_PUBLIC_${env}}`]
        return (runtimeConfig[config] || runtimeConfig.public?.[config]) as string | undefined
      }
      // support legacy config
      siteConfigContainer.push(<SiteConfigInput> {
        url: getRuntimeConfig('siteUrl', 'SITE_URL'),
        name: getRuntimeConfig('siteName', 'SITE_NAME'),
        description: getRuntimeConfig('siteDescription', 'SITE_DESCRIPTION'),
        logo: getRuntimeConfig('siteImage', 'SITE_IMAGE'),
        language: getRuntimeConfig('siteLanguage', 'SITE_LANGUAGE'),
        indexable: getRuntimeConfig('siteIndexable', 'SITE_INDEXABLE'),
      })
      siteConfigContainer.push(nuxt?.options.runtimeConfig.public.site as SiteConfigInput)
    }
  }
  return siteConfigContainer.get()
}

export async function updateSiteConfig(siteConfig: SiteConfigInput) {
  if (!siteConfigContainer)
    await initSiteConfig()
  siteConfigContainer.push(siteConfig)
}

export async function useSiteConfig() {
  if (!siteConfigContainer)
    await initSiteConfig()
  return siteConfigContainer.get()
}
