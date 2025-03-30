---
title: Nuxt Config
description: The config options available for Nuxt Site Config.
---

## `enabled`

- Type: `boolean`{lang="ts"}
- Default: `true`{lang="ts"}

Whether the site config is enabled.

## `debug`

- Type: `boolean`
- Default: `false`

Whether the debug mode of the site config is enabled.

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

The canonical site URL.

## `env`

- Type: `string`
- Default: `process.env.NODE_ENV`

The environment the site is running in.

See [this issue](https://github.com/nuxt/nuxt/issues/19819) on why we can't use `process.env.NODE_ENV`.

## `name`

- Type: `string`

The name of the site.

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
