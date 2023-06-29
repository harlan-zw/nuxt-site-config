<h1 align='center'>nuxt-site-config</h1>

<p align="center">
<a href='https://github.com/harlan-zw/nuxt-site-config/actions/workflows/test.yml'>
</a>
<a href="https://www.npmjs.com/package/nuxt-site-config" target="__blank"><img src="https://img.shields.io/npm/v/nuxt-site-config?style=flat&colorA=002438&colorB=28CF8D" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/nuxt-site-config" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nuxt-site-config?flat&colorA=002438&colorB=28CF8D"></a>
<a href="https://github.com/harlan-zw/nuxt-site-config" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/nuxt-site-config?flat&colorA=002438&colorB=28CF8D"></a>
</p>


<p align="center">
Shared site configuration for Nuxt 3 modules.
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="800" height="0" /><br>
<i>Status:</i> <b>Experimental</b> <br>
<sup> Please report any issues 🐛</sup><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
<img width="800" height="0" />
</td>
</tbody>
</table>
</p>

## Background

Site config is a general subset of configurations related to common site-wide settings.
They are often used in many SEO and performance modules.
Some examples are: url, name, description and trailing slashes.

Usually it's expected that the end-user will configure these settings themselves for each module,
however,
as a module author it can be quite difficult to support all the ways this config is used, and the end-user experience
of not having a single source of truth becomes difficult to maintain.

Let's consider the case of a module that needs the URL of the site. 

The module can make use of the SSR utilities to get the URL from the request headers at runtime, which is great!

But what if:
- The URL is needed when prerendering or at build time?
- The URL needs to conditionally swap at runtime (such as a multi-tenant app or i18n seperated sites)
- The URL from the headers is not the canonical URL?

Now imagine this problem for every module that needs this config, and the config extends beyond just the URL.

## Solution

We need:
- The user to be able to configure this URL at build time and runtime for any modules which need it.
- The data source to remain in sync across runtimes.
- A hierarchy of config sources, so that we can provide intelligent defaults and overrides. Relying on environment data where possible.
- A generic API for modules to use this config.

The solution is a subset of the App config functionality, except with build-time support.
The underlying implementation 
is currently bespoke, but it will likely be using app config directly in the future
(once SSR runtime syncing is supported).

## Features

- 😌 Zero-config defaults: URL, name and description
- 🎨 Multiple config sources: app.config.ts, nuxt.config.ts and environment variables
- 🤖 Smart stackable overrides for build-time and runtime with ledger capabilities
- ✅ Safe fallbacks with runtime assertions
- Site-config based composables for modules to use: `resolveTrailingSlash`, `useNitroOrigin`, etc.

## Install

:Warn: This module is experimental. The default supported site config keys are subject to change based on feedback.

```bash
#
npm install nuxt-site-config
#
yarn add nuxt-site-config
#
pnpm add nuxt-site-config
```

## Setup

```ts
export default defineNuxtModule<ModuleOptions>({
  async setup(config, nuxt) {
    // ...
    await installModule('nuxt-site-config')
  }
})
```

## Config Schema

```ts
export interface SiteConfig {
  /**
   * The canonical Site URL.
   * @default `process.env.NUXT_PUBLIC_SITE_URL`
   * Fallback options are:
   * - SSR: Inferred from request headers
   * - SPA: Inferred from `window.location`
   * - Prerendered: Inferred from CI environment
   */
  url: string
  name: string
  description: string
  image: string
  index: boolean
  titleSeparator: string
  trailingSlash: boolean
  language: string
}
```

## Config Resolving

Config is resolved in the following order, starting with the lowest priority.
1. Context-aware defaults. _For example in some CI environments, we can read environment variables to determine the site URL._
2. Environment Variables
3. Runtime config
4. App config
5. User overrides

## Usage

### useSiteConfig - Build time

### useSiteConfig - Composable

## Nuxt Hooks

### `site-config:resolve`

**Type:** `async (ctx: { urls: SitemapConfig; sitemapName: string }) => void | Promise<void>`

This hook allows you to modify the sitemap(s) urls when they're prerendered.

Note: For dynamic runtime sitemaps this hook won't do anything.

```ts
export default defineNuxtConfig({
  hooks: {
    'site-config:resolve': (siteConfig) => {
      if (process.env.FOO)
        siteConfig.name = 'Bar'

    },
  },
})
```

## Nitro Hooks

### `site-config:resolve`

**Type:** `async (ctx: { urls: SitemapConfig; sitemapName: string }) => void | Promise<void>`

This hook allows you to modify the sitemap.xml as runtime before it is sent to the client.

Note: For prerendered sitemaps this hook won't do anything.

```ts
import { defineNitroPlugin } from 'nitropack/runtime/plugin'
import { getRequestHost } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:resolve', async (siteConfig) => {
    const e = useRequestEvent()
    if (getRequestHost(e).startsWith('foo.'))
      siteConfig.name = 'Foo'

  })
})
```

## Site Config

If you need further control over the sitemap.xml URLs, you can provide config on the `sitemap` key.

### `url`

- Type: `string`
- Default: `undefined`
- Required: `true`

The host of your site. This is required to generate the sitemap.xml. Example: https://example.com

### `trailingSlash`

- Type: `boolean`
- Default: `false`

Whether to add a trailing slash to the URLs in the sitemap.xml.


## License

MIT License © 2022-PRESENT [Harlan Wilton](https://github.com/harlan-zw)
