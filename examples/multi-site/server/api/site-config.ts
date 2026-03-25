export default defineEventHandler((e) => {
  const siteConfig = useSiteConfig(e)
  return siteConfig
})
