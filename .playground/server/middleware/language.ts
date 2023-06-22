import { updateSiteConfig } from '#imports'

export default defineEventHandler(async e => {
  if (e.node.req.url?.startsWith('/blog')) {
    updateSiteConfig(e, {
      name: 'Blog',
      url: 'https://blog.example.com',
    })
  }
})
