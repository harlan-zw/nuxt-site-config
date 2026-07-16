---
title: Nitro Hooks
description: Learn how to use Nitro Hooks to customize your site config.
relatedPages:
  - path: /docs/site-config/api/nuxt-hooks
    title: Nuxt Hooks
  - path: /docs/site-config/guides/multi-tenancy
    title: Multi-Tenancy
  - path: /docs/site-config/guides/runtime-site-config
    title: Runtime Site Config
---

## `site-config:init`

**Type:**
```ts
export interface HookSiteConfigInitContext {
  event: H3Event
  siteConfig: SiteConfigStack
}
```

Modify site config after initialization.

```ts [server/plugins/site-config.ts]
import { getNitroOrigin } from '#site-config/server/composables'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', ({ event, siteConfig }) => {
    const origin = getNitroOrigin(event)
    if (origin.startsWith('https://fr.')) {
      siteConfig.push({
        _context: 'french nitro plugin', // helps you debug
        name: 'Mon Site',
        url: 'https://fr.example.com',
      })
    }
  })
})
```
