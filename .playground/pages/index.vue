<script lang="ts" setup>
import { computed, toValue, useNitroOrigin, useSiteConfig, useState } from '#imports'

const siteConfig = useSiteConfig({ debug: true })

const origin = useState()

if (process.server)
  origin.value = useNitroOrigin()

const rows = computed(() => [
  ...Object.entries(toValue(siteConfig))
    .filter(([key]) => key[0] !== '_')
    .map(([key, value]) => {
      return {
        key,
        value,
        context: siteConfig._context[key],
      }
    }),
  {
    key: 'nitroOrigin',
    value: origin.value,
  },
])
</script>

<template>
  <div>
    <h2 class="text-xl my-10 font-semibold">
      Site Config
    </h2>
    <!--  going to make a table of all the site config values -->
    <ClientOnly>
      <UTable :rows="rows" />
    </ClientOnly>
    <div class="mt-5">
      <UButton to="/overrides">
        overrides
      </UButton>
    </div>
  </div>
</template>
