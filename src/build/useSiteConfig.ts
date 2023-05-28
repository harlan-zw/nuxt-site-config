import { tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfig } from '../type'
import { SITE_CONFIG_ENV, createSiteConfig } from '../runtime/shared'

export async function useSiteConfig(overrides: Partial<SiteConfig> = {}) {
  const siteConfig = createSiteConfig({ overrides })
  // use defaults from runtime config
  const runtimeConfig: Partial<SiteConfig> = {}
  const nuxt = tryUseNuxt()
  // not actually needed
  if (nuxt) {
    for (const k of Object.keys(SITE_CONFIG_ENV) as (keyof SiteConfig)[]) {
      const env = runtimeConfig[k as keyof SiteConfig] = nuxt?.options.runtimeConfig.public.site[k]
      if (env)
        runtimeConfig[k] = env
    }
  }
  const contextConfig: Partial<SiteConfig> = {}
  const pkgJson = await readPackageJSON(undefined, { startingFrom: nuxt?.options.rootDir })
  if (pkgJson) {
    if (pkgJson.name)
      contextConfig.name = pkgJson.name
    if (pkgJson.description)
      contextConfig.description = pkgJson.description
  }
  if (!contextConfig.name) {
    // use root dir basename
    contextConfig.name = nuxt?.options.rootDir.split('/').pop()
  }
  return siteConfig.compute({ runtimeConfig, contextConfig })
}
