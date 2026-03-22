import { $fetch } from '@nuxt/test-utils'
import { describe, expect, it } from 'vitest'

const CURRENT_LOCALE_RE = /<td data-currentlocale="true">(.+?)<\/td>/
const DEFAULT_LOCALE_RE = /<td data-defaultlocale="true">(.+?)<\/td>/
const DESCRIPTION_RE = /<td data-description="true">(.+?)<\/td>/
const ENV_RE = /<td data-env="true">(.+?)<\/td>/
const NAME_RE = /<td data-name="true">(.+?)<\/td>/
const URL_RE = /<td data-url="true">(.+?)<\/td>/

// this is broken for some reason

describe('i18n-micro', async () => {
  it('en', async () => {
    const s = (await $fetch('/')) as string
    const currentLocale = s.match(CURRENT_LOCALE_RE)?.[1]
    const defaultLocale = s.match(DEFAULT_LOCALE_RE)?.[1]
    const description = s.match(DESCRIPTION_RE)?.[1]
    const env = s.match(ENV_RE)?.[1]
    const name = s.match(NAME_RE)?.[1]
    const url = s.match(URL_RE)?.[1]
    expect(currentLocale).toBe('en-US')
    expect(defaultLocale).toBe('en-US')
    expect(description).toBe('My site description')
    expect(env).toBe('test')
    expect(name).toBe('My Site')
    expect(url).toBe('https://env.harlanzw.com')
  })
  it('fr', async () => {
    const s = (await $fetch('/fr')) as string
    const currentLocale = s.match(CURRENT_LOCALE_RE)?.[1]
    const defaultLocale = s.match(DEFAULT_LOCALE_RE)?.[1]
    const description = s.match(DESCRIPTION_RE)?.[1]
    const env = s.match(ENV_RE)?.[1]
    const name = s.match(NAME_RE)?.[1]
    const url = s.match(URL_RE)?.[1]
    expect(currentLocale).toBe('fr-FR')
    expect(defaultLocale).toBe('en-US')
    expect(description).toBe('La description de mon site')
    expect(env).toBe('test')
    expect(name).toBe('Mon site')
    expect(url).toBe('https://env.harlanzw.com')
  })
})
