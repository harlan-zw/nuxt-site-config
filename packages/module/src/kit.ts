import type { Nuxt } from '@nuxt/schema'
import { createResolver, installModule, tryUseNuxt } from '@nuxt/kit'
import { initSiteConfig } from 'nuxt-site-config-kit'

export * from 'nuxt-site-config-kit'

export async function installNuxtSiteConfig(nuxt: Nuxt | null = tryUseNuxt()): Promise<void> {
  if (!nuxt)
    return
  const installed = nuxt.options._installedModules.some(module => module.meta.name === 'nuxt-site-config')
  if (!installed)
    await installModule(createResolver(import.meta.url).resolve('./module'), {}, nuxt)
  await initSiteConfig(nuxt)
}
