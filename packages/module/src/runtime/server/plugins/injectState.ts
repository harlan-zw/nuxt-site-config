import devalue from '@nuxt/devalue'
import { toValue } from 'vue'
// @ts-expect-error virtual Nitro module
import { NUXT_SITE_CONFIG_NO_SSR } from '#nuxt-site-config/no-ssr.mjs'
import { defineNitroPlugin } from '#nuxtseo/nitro'
import { getSiteRouteRules } from '../composables/getRouteRules'
import { getSiteConfig } from '../composables/getSiteConfig'

const PRERENDER_NO_SSR_ROUTES = new Set(['/index.html', '/200.html', '/404.html'])

export default defineNitroPlugin(async (nitroApp) => {
  // always use cache for prerendering to speed it up
  nitroApp.hooks.hook('render:html', async (ctx, { event }) => {
    const routeOptions = getSiteRouteRules(event)
    const isIsland = (process.env.NUXT_COMPONENT_ISLANDS && event.path.startsWith('/__nuxt_island'))
    const url = event.path
    const noSSR = !!NUXT_SITE_CONFIG_NO_SSR
      || !!(process.env.NUXT_NO_SSR)
      || event.context.nuxt?.noSSR
      || (routeOptions.ssr === false && !isIsland)
      || (import.meta.prerender ? PRERENDER_NO_SSR_ROUTES.has(url) : false)
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
