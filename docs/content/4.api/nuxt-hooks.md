---
title: Nuxt Hooks
description: Learn how to use Nuxt Hooks to customize your site config.
---

## `site-config:resolve`

**Type:** `async () => void | Promise<void>`{lang="html"}

Modify the build time site config after the module resolves it.

It's recommended to use runtime [Nitro hooks](/docs/site-config/nitro-api/nitro-hooks) if you need to modify the site config at runtime.

```ts
import { updateSiteConfig } from 'nuxt-site-config/kit'

export default defineNuxtConfig({
  hooks: {
    'site-config:resolve': () => {
      if (process.env.FOO) {
        updateSiteConfig({
          name: 'Bar'
        })
      }
    },
  },
})
```
