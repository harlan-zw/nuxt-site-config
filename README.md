<h1 align='center'>nuxt-site-config</h1>

<p align="center">
<a href='https://github.com/harlan-zw/nuxt-site-config/actions/workflows/test.yml'>
</a>
<a href="https://www.npmjs.com/package/nuxt-site-config" target="__blank"><img src="https://img.shields.io/npm/v/nuxt-site-config?style=flat&colorA=002438&colorB=28CF8D" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/nuxt-site-config" target="__blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dm/nuxt-site-config?flat&colorA=002438&colorB=28CF8D"></a>
<a href="https://github.com/harlan-zw/nuxt-site-config" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/harlan-zw/nuxt-site-config?flat&colorA=002438&colorB=28CF8D"></a>
</p>


<p align="center">
Unifying site config with powerful and flexible APIs, for module authors and users.
</p>

<p align="center">
<table>
<tbody>
<td align="center">
<img width="800" height="0" /><br>
<i>Status:</i> <b>Released</b> <br>
<sup> Please report any issues 🐛</sup><br>
<sub>Made possible by my <a href="https://github.com/sponsors/harlan-zw">Sponsor Program 💖</a><br> Follow me <a href="https://twitter.com/harlan_zw">@harlan_zw</a> 🐦 • Join <a href="https://discord.gg/275MBUBvgP">Discord</a> for help</sub><br>
<img width="800" height="0" />
</td>
</tbody>
</table>
</p>

## Background

Site config can be considered config that is commonly used amongst modules but is not supported by the Nuxt core.

For example: `url` (canonical), `name`, `description`, `indexable`, `trailingSlash`, etc.

Without a single source of truth for these, modules have a hard time working together and end-users have to duplicate config across modules.

Nuxt Site Config aims to fix this.

The end goal is to make it possible to build SEO multilingual / multi-tenancy sites that
_just work_ with modules.

# Features

- 😌 Zero-config, best practice site config defaults
- 🎨 Site config from any source: Nuxt Config, Runtime Config, Environment Variables, App Config, Route Rules or Programmatically
- 🚀 Powerful and runtime agnostic APIs for module authors `useSiteConfig`, `createSitePathResolver`, `withSiteUrl`, `useNitroOrigin`, etc
- 🤖 Ledger capabilities
- 🤝 Integrates with `@nuxtjs/i18n`

# Documentation

[📖 Read the full documentation](https://nuxtseo.com/site-config) for more information.

## License

MIT License © 2023-PRESENT [Harlan Wilton](https://github.com/harlan-zw)
