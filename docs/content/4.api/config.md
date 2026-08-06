---
title: Nuxt Config
description: The config options available for Nuxt Site Config.
relatedPages:
  - path: /docs/site-config/guides/how-it-works
    title: How it works
  - path: /docs/site-config/guides/setting-site-config
    title: Recommended Config
  - path: /docs/robots/api/config
    title: Nuxt Config
---

## `enabled: boolean`{lang="ts"}

- Default: `true`{lang="ts"}

Whether site config activates for this project.

## `debug: boolean`{lang="ts"}

- Default: `false`{lang="ts"}

Whether to activate debug mode for site config.

## `multiTenancy: { hosts: string[]; config: SiteConfigInput }[]`{lang="ts"}

- Default: `[]`{lang="ts"}

Configure multiple sites with different configurations based on the host. Each site configuration requires:

- `hosts`: An array of hostnames that should use this configuration
- `config`: The site configuration to use when the hostname matches

```ts [nuxt.config.ts]
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

## `url: string`{lang="ts"}

The canonical site URL. On supported CI platforms (Vercel, [Netlify](https://netlify.com), Cloudflare Pages), this is automatically populated from platform environment variables if not explicitly set. See [How it works](/docs/site-config/guides/how-it-works) for details.

## `env: string`{lang="ts"}

- Default: `import.meta.envName`{lang="ts"}, then `process.env.NODE_ENV`{lang="ts"}

The environment the site is running in.

`NUXT_SITE_ENV` takes priority over this default when configured.

## `name: string`{lang="ts"}

The name of the site. On [Vercel](https://vercel.com) and Netlify, this is automatically populated from platform environment variables if not explicitly set. See [How it works](/docs/site-config/guides/how-it-works) for details.

## `indexable: boolean`{lang="ts"}

- Default: `siteConfig.env === 'production'`{lang="ts"}

Whether the site can be indexed by search engines.

## `trailingSlash: boolean`{lang="ts"}

- Default: `false`{lang="ts"}

Whether to add trailing slashes to the URLs.

## `defaultLocale: string`{lang="ts"}

The default locale of the site.
