import { useSiteConfig, updateSiteConfig, eventHandler } from '#imports'

export default eventHandler(e => {
  debugger
  const siteConfigStart = useSiteConfig(e)
  const descriptionStart = siteConfigStart.value.description

  updateSiteConfig(e, {
    description: 'Description'
  })

  const descriptionStartAfterChange = siteConfigStart.value.description
  const siteConfigEnd = useSiteConfig(e)
  const descriptionEnd = siteConfigEnd.value.description

  return [descriptionStart, descriptionStartAfterChange, descriptionEnd]
})
