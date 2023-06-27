import { tryUseNuxt } from '@nuxt/kit'
import { readPackageJSON } from 'pkg-types'
import type { SiteConfigContainer, SiteConfigInput } from '../type'
import { createSiteConfigContainer } from '../runtime/siteConfig'
import { envSiteConfig } from '../runtime/siteConfig/env'

async function getPkgJsonContextConfig(rootDir: string) {
  const pkgJson = await readPackageJSON(undefined, { startingFrom: rootDir })
  if (!pkgJson)
    return {}

  return <SiteConfigInput> {
    name: pkgJson.name,
    description: pkgJson.description,
  }
}

export async function initSiteConfig(): Promise<SiteConfigContainer | undefined> {
  // use defaults from runtime config
  const nuxt = tryUseNuxt()
  if (!nuxt)
    return

  // @ts-expect-error hacking nuxt instance
  let siteConfig = nuxt._siteConfig
  if (siteConfig)
    return

  const rootDir = nuxt?.options.rootDir || process.cwd()
  // only when called the first time
  // @ts-expect-error hacking nuxt instance
  nuxt._siteConfig = siteConfig = createSiteConfigContainer()
  const isNodeEnv = !!process.env.NODE_ENV
  // the root dir is maybe the name of the site
  siteConfig.push({
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
    url: getRuntimeConfig('Url', '_URL'),
    name: getRuntimeConfig('Name', '_NAME'),
    description: getRuntimeConfig('Description', '_DESCRIPTION'),
    logo: getRuntimeConfig('Image', '_IMAGE'),
    locale: getRuntimeConfig('Language', '_LANGUAGE'),
    indexable: getRuntimeConfig('Indexable', '_INDEXABLE'),
  })
  siteConfig.push(nuxt?.options.runtimeConfig.public.site as SiteConfigInput)

  // @ts-expect-error hacking nuxt instance
  return nuxt._siteConfig
}

export async function updateSiteConfig(input: SiteConfigInput) {
  // make sure it is initialized
  (await initSiteConfig())?.push(input)
}

export async function useSiteConfig() {
  // make sure it is initialized
  return (await initSiteConfig())?.get()
}
