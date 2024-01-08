import { createSiteConfigStack, envSiteConfig } from 'site-config-stack'
import { defineEventHandler } from 'h3'
import { useAppConfig, useNitroApp, useRuntimeConfig } from '#imports'
import { useNitroOrigin } from '#internal/nuxt-site-config'
import type { HookSiteConfigInitContext } from '~/src/runtime/types'

export default defineEventHandler(async (e) => {
  if (e.context.siteConfig)
    return
  const runtimeConfig = useRuntimeConfig(e)
  // this does need to be a middleware so the nitro origin is always up to date
  const config = runtimeConfig['nuxt-site-config']
  const nitroApp = useNitroApp()
  const siteConfig = createSiteConfigStack({
    debug: config.debug,
  })
  const appConfig = useAppConfig(e)
  const nitroOrigin = useNitroOrigin(e)
  e.context.siteConfigNitroOrigin = nitroOrigin
  siteConfig.push({
    _context: 'nitro:init',
    _priority: -4,
    url: nitroOrigin,
  })
  siteConfig.push({
    _context: 'runtimeEnv',
    _priority: 0,
    ...(runtimeConfig.site || {}),
    ...(runtimeConfig.public.site || {}),
    // @ts-expect-error untyped
    ...envSiteConfig(import.meta.env), // just in-case, shouldn't be needed
  })
  const buildStack = config.stack || []
  buildStack.forEach(c => siteConfig.push(c))
  if (appConfig.site) {
    siteConfig.push({
      _priority: -2,
      _context: 'app:config',
      ...appConfig.site,
    })
  }
  // append route rules
  if (e.context._nitro.routeRules.site) {
    siteConfig.push({
      _context: 'route-rules',
      ...e.context._nitro.routeRules.site,
    })
  }
  const ctx: HookSiteConfigInitContext = { siteConfig, event: e }
  await nitroApp.hooks.callHook('site-config:init', ctx)
  e.context.siteConfig = ctx.siteConfig
})
