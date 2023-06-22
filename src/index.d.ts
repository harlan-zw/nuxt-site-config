import { SiteConfigReactiveContainer } from "./type";

declare module 'h3' {
  interface H3EventContext {
    siteConfig: SiteConfigContainer
  }
}

export {}
