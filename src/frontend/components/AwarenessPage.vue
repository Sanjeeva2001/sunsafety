<template>
  <section class="awareness-page">
    <h1 class="page-title">Sun Safety Awareness</h1>

    <p class="page-description">
      This section shows skin cancer statistics in Australia and a 12-month UV trend across selected Australian cities.
    </p>

    <div v-if="loading" class="status-box">
      Loading awareness data...
    </div>

    <div v-else-if="error" class="status-box error">
      {{ error }}
    </div>

    <div v-else class="content-block">
      <SkinCancerChart :stats="skinCancerStats" />

      <UvTrendChart :uvTrend="uvTrendData" />

      <div class="insight-box">
        <h2>Why this matters</h2>
        <p>
          UV levels in Australia can stay high for long periods, especially in warmer months.
          Repeated exposure to strong UV radiation can damage the skin over time and increase
          the risk of skin cancer. This is why sun protection should be used whenever UV levels are high.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import SkinCancerChart from './SkinCancerChart.vue'
import UvTrendChart from './UvTrendChart.vue'

const skinCancerStats = ref([])
const uvTrendData = ref(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    const [skinCancerResponse, uvTrendResponse] = await Promise.all([
      fetch('/api/awareness/skin-cancer'),
      fetch('/api/awareness/uv-trend')
    ])

    if (!skinCancerResponse.ok) {
      throw new Error('Failed to load skin cancer statistics')
    }

    if (!uvTrendResponse.ok) {
      throw new Error('Failed to load UV trend data')
    }

    skinCancerStats.value = await skinCancerResponse.json()
    uvTrendData.value = await uvTrendResponse.json()
  } catch (err) {
    error.value = err.message || 'Something went wrong while loading the awareness data.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.awareness-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-title {
  margin-bottom: 12px;
}

.page-description {
  margin-bottom: 24px;
  line-height: 1.6;
}

.content-block {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-box {
  padding: 16px;
  border-radius: 12px;
  background: #f4f4f4;
}

.status-box.error {
  background: #ffe5e5;
  color: #a40000;
}

.insight-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  line-height: 1.6;
}
</style>