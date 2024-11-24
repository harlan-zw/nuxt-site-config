<script lang="ts" setup>
import { ref, useSiteConfig } from '#imports'

const siteName = ref('My Site Name')

const siteConfig = useSiteConfig({
  name: siteName,
})

let counter = 0
function changeSiteName() {
  siteName.value = `New Name ${counter++}`
}
</script>

<template>
  <div>
    <p>Welcome to {{ siteConfig.name }}, the site URL is {{ siteConfig.url }}.</p>
    <p>Description: {{ siteConfig.description }}</p>
    <UButton @click="changeSiteName">
      Change site name
    </UButton>
    <div class="mt-5">
      <UButton to="/overrides">
        overrides
      </UButton>
    </div>

  </div>
</template>
