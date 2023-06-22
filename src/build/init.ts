import { tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfig, SiteConfigInput } from '../type'
import { createSiteConfigContainer } from '../runtime/siteConfig'
import { envSiteConfig } from '../runtime/siteConfig/env'

export const siteConfigContainer = createSiteConfigContainer()

async function getPkgJsonContextConfig(rootDir: string) {
  const pkgJson = await readPackageJSON(undefined, { startingFrom: rootDir })
  if (!pkgJson)
    return {}

  return <SiteConfigInput> {
    name: pkgJson.name,
    description: pkgJson.description,
  }
}

export async function initSiteConfig(siteConfig: SiteConfigInput): Promise<SiteConfig> {
  // use defaults from runtime config
  const nuxt = tryUseNuxt()
  const rootDir = nuxt?.options.rootDir || process.cwd()

  const isNodeEnv = !!process.env.NODE_ENV
  // the root dir is maybe the name of the site
  siteConfigContainer.push({
    name: rootDir.split('/').pop(),
    index: isNodeEnv ? process.env.NODE_ENV === 'production' : !process.dev,
  })
  siteConfigContainer.push(await getPkgJsonContextConfig(rootDir))

  // add the env vars lowest priority
  siteConfigContainer.push(envSiteConfig)
  // not actually needed
  if (nuxt)
    siteConfigContainer.push(nuxt?.options.runtimeConfig.public.site)

  siteConfigContainer.push(siteConfig)

  return siteConfigContainer.get()
}
