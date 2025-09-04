import { env, isDevelopment } from 'std-env'
import { withoutProtocol } from 'ufo'

export function useNitroOrigin() {
  const cert = env.NITRO_SSL_CERT
  const key = env.NITRO_SSL_KEY

  let host = env.NITRO_HOST || env.HOST || false
  let port = env.NITRO_PORT || env.PORT || (isDevelopment ? 3000 : false)
  let protocol = ((cert && key) || !isDevelopment) ? 'https' : 'http'
  // don't trust development nitro headers
  // in dev and prerendering we can rely on the vite node env
  if ((isDevelopment || env.prerender) && env.NUXT_VITE_NODE_OPTIONS) {
    const origin = JSON.parse(env.NUXT_VITE_NODE_OPTIONS).baseURL.replace('/__nuxt_vite_node__', '')
    host = withoutProtocol(origin)
    protocol = origin.includes('https') ? 'https' : 'http'
  }
  if (typeof host === 'string' && host.includes(':')) {
    port = host.split(':').pop()!
    host = host.split(':')[0] || false
  }
  port = port ? `:${port}` : ''
  return `${protocol}://${host}${port}/`
}
