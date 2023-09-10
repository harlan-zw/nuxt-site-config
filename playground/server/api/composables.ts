import { useSiteConfig, updateSiteConfig, eventHandler } from '#imports'

export default eventHandler(e => {
  debugger
  const siteConfigStart = useSiteConfig(e)
  const descriptionStart = siteConfigStart.description

  updateSiteConfig(e, {
    description: 'Description'
  })

  const descriptionStartAfterChange = siteConfigStart.description
  const siteConfigEnd = useSiteConfig(e)
  const descriptionEnd = siteConfigEnd.description

  return [descriptionStart, descriptionStartAfterChange, descriptionEnd]
})
