<h1>nuxt-site-config</h1>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Nuxt Site Config is a module for module authors to share common site config across modules.

It is not meant to be consumed by end-users directly, but rather to be used by module authors to provide a common site config API.

<p align="center">
<table>
<tbody>
<td align="center">
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
</td>
</tbody>
</table>
</p>

## Features

- 😌 Zero-config, best practice site config defaults
- 🎨 Site config from any source: Nuxt Config, Environment Variables or Programmatically
- 🚀 Powerful and runtime agnostic APIs for module authors `useSiteConfig`, `createSitePathResolver`, `withSiteUrl`, `useNitroOrigin`, etc
- 🤖 Ledger capabilities
- 🤝 Integrates with `@nuxtjs/i18n`

## Installation

Install `nuxt-site-config` dependency to your project:

```bash
npx nuxi@latest module add site-config
```

> [!TIP]
> Generate an Agent Skill for this package using [skilld](https://github.com/harlan-zw/skilld):
> ```bash
> npx skilld add nuxt-site-config
> ```

## Documentation

[📖 Read the full documentation](https://nuxtseo.com/site-config) for more information.

## License

Licensed under the [MIT license](https://github.com/harlan-zw/nuxt-site-config/blob/main/LICENSE.md).

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-site-config/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-site-config

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-site-config.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-site-config

[license-src]: https://img.shields.io/github/license/harlan-zw/nuxt-site-config.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://github.com/harlan-zw/nuxt-site-config/blob/main/LICENSE.md

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
