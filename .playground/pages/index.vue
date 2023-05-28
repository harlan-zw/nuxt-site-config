<script lang="ts" setup>
import {useSiteConfig} from '#imports'

const siteConfig = useSiteConfig()
</script>
<template>
<div>
  <p>Welcome to {{ siteConfig.name }}, the site URL is {{ siteConfig.url }}.</p>
  <p>Description: {{ siteConfig.description }}</p>
  <div class="mt-5">
    <UButton to="/overrides">overrides</UButton>
  </div>
</div>
</template>
