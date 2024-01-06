<script lang="ts" setup>
import { useNitroOrigin, useSiteConfig, useState } from '#imports'

const siteConfig = useSiteConfig({ debug: true })

const origin = useState()

if (process.server)
  origin.value = useNitroOrigin()

const rows = [
  ...Object.entries(siteConfig)
    .filter(([key]) => key !== '_context')
    .map(([key, value]) => {
      return {
        key,
        value,
      }
    }),
  {
    key: 'nitroOrigin',
    value: origin.value,
  },
]
</script>

<template>
  <div>
    <h1>{{ $t('welcome') }}</h1>
    <table>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.key">
          <td>{{ row.key }}</td>
          <td>{{ row.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
