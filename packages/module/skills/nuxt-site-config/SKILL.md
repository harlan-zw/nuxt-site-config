---
name: nuxt-site-config
description: Set, read, and debug shared site config (url, name, env, indexable, trailingSlash) in a Nuxt app with the nuxt-site-config module. Use when a task mentions the site config key, useSiteConfig, getSiteConfig, updateSiteConfig, createSitePathResolver, withSiteUrl, getNitroOrigin, NUXT_SITE_URL or other NUXT_SITE_ env vars, multiTenancy, the site-config:init hook, nuxtSiteConfig i18n messages, nuxt-site-config/kit, or a wrong canonical URL, site name, or indexable value in Nuxt SEO modules.
---

# nuxt-site-config

Tested against `nuxt-site-config` 4.2.3 with the fixes from #113 and #114, on Nuxt 4.5.2 (requires Nuxt `>=3.9.0`).
The module resolves one site config per request from many sources. The Nuxt SEO modules (sitemap, robots, schema.org, OG image) read it.
`@nuxtjs/seo` installs it already. Docs: https://nuxtseo.com/docs/site-config

## Setup

Set `url` and `name` under the `site` key. Nothing infers `name` from `package.json`.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-site-config'],
  site: { url: 'https://example.com', name: 'Example' },
})
```

For staging or preview deploys, set env vars instead: `NUXT_SITE_URL`, `NUXT_SITE_NAME`, `NUXT_SITE_ENV`.
Any `NUXT_SITE_<KEY>` or `NUXT_PUBLIC_SITE_<KEY>` var maps to a camelCase key (`NUXT_SITE_TRAILING_SLASH` to `trailingSlash`).
They work at build time and at server runtime. You do not declare them in `runtimeConfig`.

## Automatic behaviour

Sources, from lowest to highest priority:

1. `env`: Nuxt `envName`, else `NODE_ENV`. A production build is `production`.
2. CI vars: `VERCEL_URL`, `URL` (Netlify), `CF_PAGES_URL`; `SITE_NAME` for the name.
3. The request origin (SSR only). It trusts `X-Forwarded-Host` and `X-Forwarded-Proto`.
4. The `site` key in `nuxt.config.ts`.
5. i18n values (see below).
6. `NUXT_SITE_*` env vars at build, then at runtime.
7. Per request: `multiTenancy`, route rules, then the `site-config:init` hook.

An entry without `_priority` counts as runtime priority. At equal priority, the last push wins.

- Without `url`, SSR uses the request origin. A prerender has no request, so `url` is undefined and "absolute" URLs render as relative paths. The build warns at prerender start.
- `indexable` defaults to `env === 'production'`. `getSiteConfig(event).indexable` and `getSiteIndexable(event)` return the same value.
- A staging deploy that runs a production build is indexable. Set `NUXT_SITE_ENV=staging` or `NUXT_SITE_INDEXABLE=false`.

## Read site config

In app code, `useSiteConfig()` is auto imported. In `server/`, use `getSiteConfig(event)`.
Server helpers are auto imported. The explicit path is `#site-config/server/composables`.

```ts
// server/api/canonical.ts
export default defineEventHandler((event) => {
  const { name } = getSiteConfig(event)
  const toAbsolute = createSitePathResolver(event, { absolute: true, withBase: true })
  return { name, about: toAbsolute('/about'), indexable: getSiteIndexable(event) }
})
```

In app code, `createSitePathResolver()` returns a function that returns a computed ref. `withSiteUrl(path)` returns a computed ref.
Options: `absolute`, `withBase` (prefix `app.baseURL`, default `false`), and `canonical`. `canonical: false` uses the request origin instead of `url`.
`getNitroOrigin()` returns the request origin with a trailing slash, such as `https://example.com/`.

## Set config per request

Use the `site-config:init` Nitro hook. It runs after every other source.

```ts
// server/plugins/site-config.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', ({ event, siteConfig }) => {
    if (getHeader(event, 'host')?.startsWith('fr.'))
      siteConfig.push({ _context: 'fr-host', name: 'Mon Site', url: 'https://fr.example.com' })
  })
})
```

For a fixed list of domains, use `site.multiTenancy`. The request host must match an entry in `hosts`; ports are ignored.

```ts
export default defineNuxtConfig({
  site: {
    url: 'https://example.com',
    multiTenancy: [
      { hosts: ['foo.com', 'www.foo.com'], config: { name: 'Foo', url: 'https://foo.com' } },
    ],
  },
})
```

A route rule sets config for a path: `routeRules: { '/fr/**': { site: { name: 'Mon Site' } } }`.
In a Nuxt plugin, `updateSiteConfig({ ... })` changes config for the current render. Use `enforce: 'pre'`.

## i18n

With `@nuxtjs/i18n` or `nuxt-i18n-micro`, the module sets `defaultLocale` and `currentLocale` from the locale `language`, and `url` from `i18n.baseUrl`.
Per locale `name` and `description` come from the `nuxtSiteConfig.name` and `nuxtSiteConfig.description` messages.
These messages override `site.name`. A runtime `NUXT_SITE_NAME` overrides the messages.

```json
{ "nuxtSiteConfig": { "name": "Mon Site", "description": "Ma description" } }
```

On Nuxt 4.1 or later, the module order in `modules` does not matter.

## Traps

- **`i18n.baseUrl` overrides `site.url` and a runtime `NUXT_SITE_URL`.** Set one of them only, or give them the same value.
- **`updateSiteConfig()` in the `site-config:resolve` Nuxt hook beats runtime env vars.** It has no `_priority`, so it counts as runtime. Pass `_priority: SiteConfigPriority.config` (from `nuxt-site-config/kit`) to let env vars win.
- **A `url` with a path warns and prefixes every URL with that path.** Put the path in `app.baseURL`, and keep `url` as the origin.
- **`withSiteUrl()` and `createSitePathResolver()` leave out `app.baseURL` by default.** Pass `withBase: true`.

## Version limits

v4 removed these. Code written for v3 still uses them:

```diff
- const config = useSiteConfig(event)       // server
+ const config = getSiteConfig(event)
- runtimeConfig: { public: { siteUrl: 'https://example.com' } }
+ site: { url: 'https://example.com' }
- import type { SiteConfig } from 'nuxt-site-config'
+ import type { SiteConfigResolved } from 'nuxt-site-config'
```

`useNitroOrigin()` is deprecated. Use `getNitroOrigin()`. The `#internal/nuxt-site-config` import path is gone.

In 4.2.3 and earlier:

- `NUXT_SITE_TRAILING_SLASH=false` turns trailing slashes on. Remove the var instead.
- `getSiteConfig(event)` in a `server/middleware/` file returns empty values. Use the `site-config:init` hook.
- The whole `multiTenancy` array ships to the client payload. Keep private values out of it.
- `getSiteConfig(event).indexable` is `undefined` unless set. Use `getSiteIndexable(event)`.

## Config

- `enabled` (`true`), `debug` (`false`), `multiTenancy` (`[]`). Every other key under `site` is site config.
- Custom keys are allowed: `site: { twitter: '@example' }` resolves as `siteConfig.twitter`.
- Reference: https://nuxtseo.com/docs/site-config/api/config

Module authors: see [references/module-authors.md](references/module-authors.md).

## Debug

- `/__site-config__/debug.json` shows the resolved config and the full stack. It exists in dev, or in production with `site: { debug: true }`.
- `useSiteConfig({ debug: true })._context` names the source of each key.
- Nuxt DevTools has a Site Config tab.
