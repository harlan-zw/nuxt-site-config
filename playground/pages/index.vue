<script lang="ts" setup>
import { useSiteConfig, useNitroOrigin, useState } from '#imports'

const siteConfig = useSiteConfig()

const origin = useState()

if (process.server) {
  origin.value = useNitroOrigin()
}
</script>
<template>
<div>
  <p>Welcome to {{ siteConfig.name }}, the site URL is {{ siteConfig.url }}.</p>
  <p>Description: {{ siteConfig.description }}</p>
  <p>origin: {{ origin }}</p>
  <div class="mt-5">
    <UButton to="/overrides">overrides</UButton>
  </div>
  <div>
    SiteLink examples
    <SiteLink to="/blog">No trailing slash set</SiteLink>
    <SiteLink to="/">home</SiteLink>
    <div class="w-[200px] my-10 children:(flex items-center justify-between)">
      <div>
        <label>Default Locale</label>
        <div>{{ siteConfig.defaultLocale }}</div>
      </div>
      <div>
        <label>Current Locale</label>
        <div>{{ siteConfig.currentLocale }}</div>
      </div>
    </div>
  </div>
</div>
</template>
