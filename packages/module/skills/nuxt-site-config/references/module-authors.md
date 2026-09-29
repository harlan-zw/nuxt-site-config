# nuxt-site-config for module authors

Use this when you write a Nuxt module that reads or sets site config at build time.
Tested against `nuxt-site-config` 4.2.3 on Nuxt 4.5.2.

## Install from your module

Add `nuxt-site-config` to your package `dependencies`, then import the kit from `nuxt-site-config/kit`.
It re-exports `nuxt-site-config-kit`, including `SiteConfigPriority`.

```ts
import { defineNuxtModule } from '@nuxt/kit'
import { installNuxtSiteConfig, SiteConfigPriority, updateSiteConfig, useSiteConfig } from 'nuxt-site-config/kit'

export default defineNuxtModule({
  meta: { name: 'my-module', configKey: 'myModule' },
  defaults: { siteUrl: undefined as string | undefined },
  async setup(options, nuxt) {
    await installNuxtSiteConfig()
    updateSiteConfig({
      _context: 'my-module',
      _priority: SiteConfigPriority.nitro,
      url: options.siteUrl,
    })
    nuxt.hook('modules:done', () => {
      const { url, name } = useSiteConfig()
      // build time values only: no request origin, no runtime env vars
    })
  },
})
```

## Priority of your values

`updateSiteConfig()` without `_priority` counts as runtime priority.
Then your module option overrides the user's `site.url` and a runtime `NUXT_SITE_URL`.
The installation docs example has this problem.

With `_priority: SiteConfigPriority.nitro`, the user's `site` key and env vars win.
Your value still beats the request origin when the user sets no `url`.

| Constant | Value | Source |
| --- | --- | --- |
| `system` | -15 | `env` default |
| `vendor` | -5 | CI vars |
| `nitro` | -4 | request origin |
| `config` | -3 | `site` key |
| `i18n` | -2 | i18n messages |
| `build` | -1 | build env vars |
| `runtime` | 0 | runtime env vars, and any entry without `_priority` |

At equal priority, the last push wins.
An `undefined` or `''` value is skipped, so an unset module option does not clear a key.

## Read at build time

- `useSiteConfig()` from the kit returns only what is pushed so far. Read it in `modules:done` or later, after other modules push.
- `getSiteConfigStack()` throws "Site config is not initialized" if `installNuxtSiteConfig()` did not run first.
- `withSiteUrl(path)` from the kit returns an absolute URL. Pass `throwErrorOnMissingSiteUrl: true` to fail the build when `url` is missing.

## Runtime code in your module

Your runtime files use the same auto imports as the app: `useSiteConfig()` in app code, and `getSiteConfig(event)` in Nitro.
Read site config inside a handler or a `site-config:init` hook, not in your own server middleware. Your middleware can run before the module sets up the request.
For `indexable`, call `getSiteIndexable(event)`. The resolved config has no `indexable` key unless a user sets it.
