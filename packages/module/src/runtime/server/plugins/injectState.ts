import devalue from '@nuxt/devalue'
import { useRuntimeConfig } from 'nuxt/server'
import { toValue } from 'site-config-stack'
// @ts-expect-error virtual Nitro module
import { NUXT_SITE_CONFIG_NO_SSR } from '#nuxt-site-config/no-ssr.mjs'
import { defineNitroPlugin } from '#nuxtseo/nitro'
import { getSiteRouteRules } from '../composables/getRouteRules'
import { getSiteConfig } from '../composables/getSiteConfig'
import { isNuxtErrorPath, resolveRequestPath } from '../util'

const PRERENDER_NO_SSR_ROUTES = new Set(['/index.html', '/200.html', '/404.html'])
// Nitro 3 strips `ssr: false` from matched route rules; Nuxt marks SPA payload scripts with `data-ssr="false"`.
const SCRIPT_TAG_PREFIX = '<script'

function getResponseStatus(event: unknown): number {
  const candidate = event as { res?: { status?: number }, node?: { res?: { statusCode?: number } } }
  return candidate.res?.status ?? candidate.node?.res?.statusCode ?? 200
}

function isTagBoundaryChar(char: string | undefined): boolean {
  return char === '>' || char === ' ' || char === '\t' || char === '\n' || char === '\r' || char === '/'
}

function isNoSSRPayload(ctx: { bodyAppend?: string[] }): boolean {
  if (!Array.isArray(ctx.bodyAppend))
    return false
  for (const chunk of ctx.bodyAppend) {
    const lower = chunk.toLowerCase()
    let index = lower.indexOf(SCRIPT_TAG_PREFIX)
    while (index !== -1) {
      const afterPrefix = index + SCRIPT_TAG_PREFIX.length
      if (isTagBoundaryChar(lower[afterPrefix])) {
        const close = lower.indexOf('>', afterPrefix)
        if (close === -1)
          break
        const tag = lower.slice(index, close + 1)
        if (tag.includes('data-nuxt-data=') && tag.includes('data-ssr="false"'))
          return true
        index = lower.indexOf(SCRIPT_TAG_PREFIX, close + 1)
      }
      else {
        index = lower.indexOf(SCRIPT_TAG_PREFIX, afterPrefix)
      }
    }
  }
  return false
}

export default defineNitroPlugin(async (nitroApp) => {
  // always use cache for prerendering to speed it up
  nitroApp.hooks.hook('render:html', async (ctx, { event }) => {
    if ((event.context as Record<string, unknown>)._siteConfigInPayload)
      return
    const pathname = resolveRequestPath(event, useRuntimeConfig().app.baseURL)
    if (!NUXT_SITE_CONFIG_NO_SSR && (isNuxtErrorPath(pathname) || event.context.nuxt?.['~rendering-error'] || (!import.meta.prerender && getResponseStatus(event) >= 400)))
      return
    const isIsland = Boolean(process.env.NUXT_COMPONENT_ISLANDS && pathname.startsWith('/__nuxt_island'))
    const noSSR = !!NUXT_SITE_CONFIG_NO_SSR
      || !!(process.env.NUXT_NO_SSR)
      || event.context.nuxt?.noSSR
      || (!isIsland && (getSiteRouteRules(event).ssr === false || isNoSSRPayload(ctx)))
      || (import.meta.prerender ? PRERENDER_NO_SSR_ROUTES.has(pathname) : false)
    if (noSSR) {
      // need to toValue all siteConfig entries
      const siteConfig = Object.fromEntries(
        Object.entries(getSiteConfig(event))
          .map(([k, v]) => [k, toValue(v)]),
      )
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}</script>`)
    }
  })
})
