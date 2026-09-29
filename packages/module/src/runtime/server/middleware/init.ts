import { eventHandler } from '#nuxtseo/h3'
import { initRequestSiteConfig } from '../init'

export default eventHandler(e => initRequestSiteConfig(e))
