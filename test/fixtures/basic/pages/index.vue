<script lang="ts" setup>
import { useSiteConfig } from '#imports'

const siteConfig = useSiteConfig({ debug: true })

const rows = [
  ...Object.entries(siteConfig)
    .filter(([key]) => key !== '_context')
    .map(([key, value]) => {
      return {
        key,
        value,
      }
    }),
]
</script>

<template>
  <div>
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
          <td v-bind="{ [`data-${row.key}`]: true }">
            {{ row.value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
