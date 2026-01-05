---
title: Multi-Tenancy
description: Learn how to serve multiple sites with different configurations based on the hostname.
---

## Introduction

Multi-tenancy allows you to serve multiple sites with different configurations using a single Nuxt application. This is useful when you need to:
- Host multiple domains with different branding
- Serve region-specific content
- Maintain multiple sites with shared codebase

You can configure multi-tenancy using static configuration or dynamically at [runtime](/docs/site-config/guides/runtime-site-config).

## Usage

To use build-time multi-tenancy configuration you can use the `multiTenancy` option:

```ts
export default defineNuxtConfig({
  site: {
    multiTenancy: [
      {
        hosts: ['www.example.com', 'example.com', 'local.example.com'],
        config: {
          name: 'Example',
          url: 'example.com' // canonical
        },
      },
      {
        hosts: ['www.foo.com', 'foo.com', 'local.foo.com'],
        config: {
          name: 'Foo',
          url: 'foo.com', // canonical
          description: 'Foo description',
        },
      },
    ]
  }
})
```

Each multi-tenant configuration requires:

- `hosts`: An array of hostnames that should use this configuration

It's recommended to add any non-canonical hostnames to the `hosts` array to avoid duplicate content issues. For example,
www.* and non-www.* hostnames should use the same configuration.

- `config`: The site configuration to apply when the hostname matches

The config object supports all standard site configuration options plus any custom properties you need.

## How it works

1. When a request is received, the module checks the hostname against the configured hosts arrays
2. If a match is found, the corresponding config is applied
3. The configuration is made available through the `useSiteConfig()` composable

## Runtime Multi-Tenancy

Runtime multi-tenancy is useful when you need to:

- Set configuration based on complex runtime conditions
- Load configuration from external sources
- Handle dynamic subdomains
- Implement A/B testing scenarios

To use get started with runtime multi-tenancy you'll need to create a Nitro plugin.

```ts [server/plugins/site-config.ts]
import { getNitroOrigin } from '#site-config/server/composables'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('site-config:init', ({ event, siteConfig }) => {
    const origin = getNitroOrigin(event)
    // Example: Set configuration based on subdomain
    if (origin.startsWith('fr.')) {
      // push whatever config you'd like for this request
      siteConfig.push({
        name: 'Mon Site',
        url: 'https://fr.example.com',
        defaultLocale: 'fr',
        currentLocale: 'fr',
      })
    }
  })
})
```

Check the [`site-config:init`](/docs/site-config/nitro-api/nitro-hooks#site-config-init) hook documentation for more information.
