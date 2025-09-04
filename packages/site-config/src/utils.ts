export function envSiteConfig(env: Record<string, any>) {
  return Object.fromEntries(Object.entries(env)
    .filter(([k]) => k.startsWith('NUXT_SITE_') || k.startsWith('NUXT_PUBLIC_SITE_'))
    .map(([k, v]) => [
      k.replace(/^NUXT_(PUBLIC_)?SITE_/, '')
        .split('_')
        .map((s, i) => i === 0 ? s.toLowerCase() : (s[0]?.toUpperCase() + s.slice(1).toLowerCase()))
        .join(''),
      v,
    ] as const))
}
