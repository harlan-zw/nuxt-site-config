<h1 align='center'>nuxt-site-config</h1>

<p align="center">
<a href='https://github.com/harlan-zw/nuxt-site-config/actions/workflows/test.yml'>
</a>
<a href="https://www.npmjs.com/package/nuxt-site-config" target="__blank"><img src="https://img.shields.io/npm/v/nuxt-site-config?style=flat&colorA=002438&colorB=28CF8D" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/nuxt-site-config" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nuxt-site-config?flat&colorA=002438&colorB=28CF8D"></a>
<a href="https://github.com/harlan-zw/nuxt-site-config" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/nuxt-site-config?flat&colorA=002438&colorB=28CF8D"></a>
</p>


<p align="center">
The new standard in using shared Site Config for Nuxt (maybe). 
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

ℹ️ Looking for a complete SEO solution? Check out [Nuxt SEO Kit](https://github.com/harlan-zw/nuxt-seo-kit).

## Background

Site config is a general subset of configurations related to common site-wide settings.
For example, the site name, description, canonical URL and trailing slashes.

Using site configuration is a common requirement in many Nuxt modules and apps. 

At the surface, most of this config is simple. However, some config is more complex, such as the site URL. The site URL can be inferred
from the request headers, however what if we're prerendering pages? 

By creating a standard API for accessing config, we can provide intelligent defaults and powerful overrides. Allowing modules
to better work together without slowing down end users.

## Features

- 😌 Zero-config defaults from environment: site URL, name and description
- 🎨 Multiple config sources: app.config.ts, nuxt.config.ts and environment variables
- 🤖 Smart stackable overrides for build and runtime
- Universal runtimes: Use in Nuxt, Nuxt App, Nitro
- Editable with HMR and reactivity

## Install

```bash
npm install nuxt-site-config

# Using yarn
yarn add nuxt-site-config
```

## Setup

**Modules**

```ts
export default defineNuxtModule<ModuleOptions>({
  async setup(config, nuxt) {
    // ...
    await installModule('nuxt-site-config')
  }
})
```

**Nuxt Apps**

_nuxt.config.ts_

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-site-config',
  ],
})
```

## How it works

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
      if (process.env.FOO) {
        siteConfig.name = 'Bar'
      }  
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
import {defineNitroPlugin} from 'nitropack/runtime/plugin'
import {getRequestHost} from "h3";

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:resolve', async (siteConfig) => {
    const e = useRequestEvent()
    if (getRequestHost(e).startsWith('foo.')) {
        siteConfig.name = 'Foo'
    }
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
