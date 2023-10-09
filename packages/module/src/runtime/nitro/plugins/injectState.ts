import type { NitroAppPlugin } from 'nitropack'
import devalue from '@nuxt/devalue'
import { toValue } from 'vue'
import { getRouteRules } from '#internal/nitro'
import { useSiteConfig } from '#imports'

const PRERENDER_NO_SSR_ROUTES = new Set(['/index.html', '/200.html', '/404.html'])

const InjectStatePlugin: NitroAppPlugin = async (nitroApp) => {
  // always use cache for prerendering to speed it up
  nitroApp.hooks.hook('render:html', async (ctx, { event }) => {
    const routeOptions = getRouteRules(event)
    const isIsland = (process.env.NUXT_COMPONENT_ISLANDS && event.path.startsWith('/__nuxt_island'))
    const url = event.path
    const noSSR = !!(process.env.NUXT_NO_SSR)
      || event.context.nuxt?.noSSR
      || (routeOptions.ssr === false && !isIsland)
      || (import.meta.prerender ? PRERENDER_NO_SSR_ROUTES.has(url) : false)
    if (noSSR) {
      // need to toValue all siteConfig entries
      const siteConfig = Object.fromEntries(
        Object.entries(useSiteConfig(event))
          .map(([k, v]) => [k, toValue(v)]),
      )
      ctx.body.push(`<script>window.__NUXT_SITE_CONFIG__=${devalue(siteConfig)}</script>`)
    }
  })
}

export default InjectStatePlugin
