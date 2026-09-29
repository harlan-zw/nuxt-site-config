# nuxt-site-config for module authors

Use this when you write a Nuxt module that reads or sets site config at build time.
Tested against `nuxt-site-config` 4.2.3 with the fixes from #113, #114, and #116, on Nuxt 4.5.2.

## Install from your module

Add `nuxt-site-config` to your package `dependencies`, then import the kit from `nuxt-site-config/kit`.
It re-exports `nuxt-site-config-kit`, including `SiteConfigPriority`.

```ts
import { defineNuxtModule } from '@nuxt/kit'
import { installNuxtSiteConfig, updateSiteConfig, useSiteConfig } from 'nuxt-site-config/kit'

export default defineNuxtModule({
  meta: { name: 'my-module', configKey: 'myModule' },
  defaults: { siteUrl: undefined as string | undefined },
  async setup(options, nuxt) {
    await installNuxtSiteConfig()
    updateSiteConfig({
      _context: 'my-module',
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

`updateSiteConfig()` without `_priority` ranks with the user's `site` key (`config`).
The user's `site` key and `NUXT_SITE_*` env vars win over your value.
Your value still beats the request origin when the user sets no `url`.
To override the user, pass a higher `_priority`, such as `SiteConfigPriority.runtime`.

| Constant | Value | Source |
| --- | --- | --- |
| `system` | -15 | `env` default |
| `vendor` | -5 | CI vars |
| `nitro` | -4 | request origin |
| `config` | -3 | `site` key, and a build time `updateSiteConfig()` without `_priority` |
| `i18n` | -2 | i18n messages and `i18n.baseUrl` |
| `build` | -1 | build env vars |
| `runtime` | 0 | runtime env vars, and a runtime push without `_priority` |

At equal priority, the last push wins.
An `undefined` or `''` value is skipped, so an unset module option does not clear a key.

## Read at build time

- `useSiteConfig()` from the kit returns only what is pushed so far. Read it in `modules:done` or later, after other modules push.
- `getSiteConfigStack()` throws "Site config is not initialized" if `installNuxtSiteConfig()` did not run first.
- `withSiteUrl(path)` from the kit returns an absolute URL. Pass `throwErrorOnMissingSiteUrl: true` to fail the build when `url` is missing.

## Runtime code in your module

Your runtime files use the same auto imports as the app: `useSiteConfig()` in app code, and `getSiteConfig(event)` in Nitro.
Site config resolves in the Nitro `request` hook, so server middleware, handlers, and the `site-config:init` hook can all read it.
`getSiteConfig(event).indexable` defaults to `env === 'production'`, the same value as `getSiteIndexable(event)`.
