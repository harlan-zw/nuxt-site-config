---
title: Nuxt Config
description: The config options available for Nuxt Site Config.
---

## `enabled`

- Type: `boolean`{lang="ts"}
- Default: `true`{lang="ts"}

Whether site config activates for this project.

## `debug`

- Type: `boolean`
- Default: `false`

Whether to activate debug mode for site config.

## `multiTenancy`

- Type: `{ hosts: string[]; config: SiteConfigInput }[]`{lang="ts"}
- Default: `[]`{lang="ts"}

Configure multiple sites with different configurations based on the host. Each site configuration requires:

- `hosts`: An array of hostnames that should use this configuration
- `config`: The site configuration to use when the hostname matches

```ts [Example]
export default defineNuxtConfig({
  site: {
    multiTenancy: [
      {
        hosts: ['www.example.com', 'example.com', 'local.example.com'],
        config: {
          name: 'Example',
          description: 'Example description',
          url: 'example.com',
          defaultLocale: 'en',
          currentLocale: 'en',
        },
      },
      {
        hosts: ['www.foo.com', 'foo.com', 'local.foo.com'],
        config: {
          url: 'foo.com',
          name: 'Foo',
          description: 'Foo description',
        },
      },
    ]
  }
})
```

## `url`

- Type: `string`

The canonical site URL. On supported CI platforms (Vercel, [Netlify](https://netlify.com), Cloudflare Pages), this is automatically populated from platform environment variables if not explicitly set. See [How it works](/docs/site-config/guides/how-it-works) for details.

## `env`

- Type: `string`
- Default: `process.env.NODE_ENV`

The environment the site is running in.

See [this issue](https://github.com/nuxt/nuxt/issues/19819) on why we can't use `process.env.NODE_ENV`.

## `name`

- Type: `string`

The name of the site. On [Vercel](https://vercel.com) and Netlify, this is automatically populated from platform environment variables if not explicitly set. See [How it works](/docs/site-config/guides/how-it-works) for details.

## `indexable`

- Type: `boolean`
- Default: `siteConfig.env === 'production' || process.env.NODE_ENV === 'production'`

Can the site be indexed by search engines.

## `trailingSlash`

- Type: `boolean`
- Default: `false`

Whether to add trailing slashes to the URLs.

## `defaultLocale`

- Type: `string`

The default locale of the site.
