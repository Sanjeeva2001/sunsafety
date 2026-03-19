<template>
  <section class="chart-card">
    <div class="chart-copy">
      <p class="chart-kicker">Health impact</p>
      <h2 class="chart-title">Long-term UV exposure matters because skin cancer burden stays significant.</h2>
      <p class="chart-description">
        This chart keeps the message simple: when sun exposure repeats over time, the health impact is not abstract.
      </p>
    </div>

    <div class="insight-strip">
      <article class="metric-card">
        <span class="metric-card__label">Latest rate shown</span>
        <strong class="metric-card__value">{{ latestRate }}</strong>
      </article>

      <article class="metric-card">
        <span class="metric-card__label">Why it matters</span>
        <strong class="metric-card__value">Daily protection helps reduce cumulative damage over the years.</strong>
      </article>
    </div>

    <div class="chart-wrapper">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
)

const props = defineProps({
  stats: {
    type: Array,
    required: true
  }
})

const latestRate = computed(() => {
  if (!props.stats.length) return 'Not available'

  const latestItem = props.stats[props.stats.length - 1]
  const rate = Number(latestItem.age_standardised_rate)

  if (!Number.isFinite(rate)) return 'Not available'

  return `${rate.toFixed(1)} per 100,000`
})

const chartData = computed(() => ({
  labels: props.stats.map(item => item.year),
  datasets: [
    {
      label: 'Melanoma incidence rate',
      data: props.stats.map(item => item.age_standardised_rate),
      borderColor: '#b45309',
      backgroundColor: 'rgba(180, 83, 9, 0.12)',
      borderWidth: 3,
      pointBackgroundColor: '#b45309',
      pointRadius: 3,
      pointHoverRadius: 4,
      fill: true,
      tension: 0.25
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    title: {
      display: false
    }
  },
  scales: {
    x: {
      ticks: {
        color: '#6b5a4d',
      },
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: false,
      ticks: {
        color: '#6b5a4d',
      },
      title: {
        display: true,
        text: 'Rate per 100,000 people',
        color: '#6b5a4d',
      },
      grid: {
        color: 'rgba(107, 90, 77, 0.14)',
      },
    }
  }
}
</script>

<style scoped>
.chart-card {
  padding: 1.5rem;
  background: rgba(255, 251, 246, 0.92);
  border: 1px solid #ecd8bf;
  border-radius: 24px;
  box-shadow: 0 14px 32px rgba(130, 76, 27, 0.08);
}

.chart-copy {
  max-width: 760px;
}

.chart-kicker {
  margin: 0 0 0.5rem;
  color: #b24c12;
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.chart-title {
  margin: 0 0 0.8rem;
  color: #2f241b;
  font-size: 1.7rem;
  line-height: 1.28;
}

.chart-description {
  margin: 0;
  color: #655546;
  line-height: 1.7;
}

.insight-strip {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.2rem 0 1.3rem;
}

.metric-card {
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff7ea 0%, #fff1d7 100%);
  border: 1px solid #efd29e;
}

.metric-card__label {
  display: block;
  margin-bottom: 0.35rem;
  color: #99622c;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-card__value {
  color: #37271c;
  line-height: 1.5;
}

.chart-wrapper {
  width: 100%;
  height: 360px;
  background: white;
  border-radius: 18px;
  padding: 16px;
  box-sizing: border-box;
}

@media (max-width: 780px) {
  .insight-strip {
    grid-template-columns: 1fr;
  }
}
</style>
