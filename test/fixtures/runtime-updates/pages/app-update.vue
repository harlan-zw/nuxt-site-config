<script lang="ts" setup>
import { useState } from '#imports'

const report = useState('site-config-report')
</script>

<template>
  <pre id="report">{{ JSON.stringify(report) }}</pre>
</template>
