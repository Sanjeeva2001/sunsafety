<template>
  <section class="awareness-page">
    <p class="page-kicker">UV Trends</p>
    <h1 class="page-title">See how UV builds over time, not just today.</h1>

    <p class="page-description">
      See how UV shifts across the year and why that matters for real outdoor plans.
    </p>

    <div v-if="loading" class="status-box">
      Loading UV trends...
    </div>

    <div v-else-if="error" class="status-box error">
      {{ error }}
    </div>

    <div v-else class="content-block">
      <section class="story-grid">
        <article class="story-card story-card--warm">
          <span class="story-label">What this means</span>
          <h2>High UV is not just a beach-day problem.</h2>
          <p>
            It shows up in walks, errands, sport, lunch breaks, and everyday time outside.
          </p>
        </article>

        <article class="story-card story-card--light">
          <span class="story-label">The practical takeaway</span>
          <h2>{{ practicalSummaryTitle }}</h2>
          <p>{{ practicalSummaryText }}</p>
        </article>
      </section>

      <SkinCancerChart :stats="skinCancerStats" />

      <UvTrendChart :uvTrend="uvTrendData" />

      <div class="insight-box">
        <h2>So what should users do?</h2>
        <p>
          Use today’s UV for the quick check, and use these trends as the bigger reminder:
          don’t wait for the sun to feel intense before you protect your skin.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import SkinCancerChart from './SkinCancerChart.vue'
import UvTrendChart from './UvTrendChart.vue'

const skinCancerStats = ref([])
const uvTrendData = ref(null)
const loading = ref(true)
const error = ref('')

const practicalSummaryTitle = computed(() => {
  if (!uvTrendData.value) {
    return 'UV can matter for longer than most people think.'
  }

  const peakValues = [
    ...uvTrendData.value.melbourne,
    ...uvTrendData.value.sydney,
    ...uvTrendData.value.brisbane,
  ].filter((value) => Number.isFinite(value))

  const highestUv = peakValues.length ? Math.max(...peakValues) : null

  if (highestUv != null && highestUv >= 10) {
    return 'Some days get seriously high, so last-minute protection is not enough.'
  }

  return 'UV matters often enough that habits beat one-off warnings.'
})

const practicalSummaryText = computed(() => {
  if (!uvTrendData.value) {
    return 'The best habit is simple: check the UV, plan ahead, and protect early.'
  }

  const citySeries = [
    { name: 'Melbourne', values: uvTrendData.value.melbourne },
    { name: 'Sydney', values: uvTrendData.value.sydney },
    { name: 'Brisbane', values: uvTrendData.value.brisbane },
  ]

  const highestAverageCity = citySeries
    .map((city) => ({
      name: city.name,
      average:
        city.values.reduce((sum, value) => sum + value, 0) / city.values.length,
    }))
    .sort((left, right) => right.average - left.average)[0]

  return `${highestAverageCity.name} trends highest here, but the main point is the same everywhere: if you are outside, plan your protection before you get there.`
})

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
  padding: 32px 16px 56px;
}

.page-title {
  max-width: 760px;
  margin: 0 0 12px;
  color: #2f2218;
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  line-height: 1.1;
}

.page-kicker {
  margin: 0 0 0.55rem;
  color: #b24c12;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-description {
  max-width: 760px;
  margin-bottom: 24px;
  line-height: 1.7;
  color: #645345;
}

.content-block {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.story-card {
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid #ecd8bf;
  box-shadow: 0 14px 30px rgba(130, 76, 27, 0.08);
}

.story-card--warm {
  background: linear-gradient(135deg, #fff1cf 0%, #ffe3ae 100%);
}

.story-card--light {
  background: linear-gradient(135deg, #fffaf2 0%, #ffffff 100%);
}

.story-label {
  display: inline-block;
  margin-bottom: 0.7rem;
  color: #a54a12;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.story-card h2 {
  margin: 0 0 0.75rem;
  color: #2f241b;
  font-size: 1.45rem;
  line-height: 1.3;
}

.story-card p {
  margin: 0;
  color: #655546;
  line-height: 1.7;
}

.status-box {
  padding: 16px;
  border-radius: 18px;
  background: #fff7ef;
  border: 1px solid #ecd8bf;
}

.status-box.error {
  background: #fff0ee;
  border-color: #efb3ac;
  color: #a40000;
}

.insight-box {
  background: linear-gradient(135deg, #5f260d 0%, #8e3b12 100%);
  color: #fff7ef;
  border-radius: 24px;
  padding: 22px;
  line-height: 1.7;
}

.insight-box h2 {
  margin: 0 0 0.7rem;
}

.insight-box p {
  margin: 0;
  color: rgba(255, 247, 239, 0.86);
}

@media (max-width: 780px) {
  .awareness-page {
    padding: 28px 16px 48px;
  }

  .story-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 900px) {
  .awareness-page {
    padding-left: 24px;
    padding-right: 24px;
  }
}
</style>
