<template>
  <section class="chart-card">
    <div class="chart-copy">
      <p class="chart-kicker">Year-round pattern</p>
      <h2 class="chart-title">UV rises and stays strong for long stretches, especially in warmer months.</h2>
      <p class="chart-description">
        This chart focuses on the big pattern instead of every daily detail. The key message is that UV can stay high long enough to affect ordinary outdoor routines.
      </p>
    </div>

    <div class="insight-row">
      <article class="insight-pill">
        <span class="insight-pill__label">Watch for</span>
        <strong class="insight-pill__value">{{ highestCityMessage }}</strong>
      </article>

      <article class="insight-pill">
        <span class="insight-pill__label">User takeaway</span>
        <strong class="insight-pill__value">Check UV before recurring outdoor plans, not only special events.</strong>
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
  uvTrend: {
    type: Object,
    required: true
  }
})

function average(values) {
  const validValues = values.filter((value) => Number.isFinite(value))

  if (!validValues.length) return 0

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length
}

const highestCityMessage = computed(() => {
  const cities = [
    { name: 'Melbourne', values: props.uvTrend.melbourne },
    { name: 'Sydney', values: props.uvTrend.sydney },
    { name: 'Brisbane', values: props.uvTrend.brisbane },
  ].map((city) => ({ ...city, average: average(city.values) }))

  const highest = cities.sort((left, right) => right.average - left.average)[0]

  return `${highest.name} has the strongest average UV pattern in this comparison.`
})

const chartData = computed(() => ({
  labels: props.uvTrend.dates,
  datasets: [
    {
      label: 'Melbourne',
      data: props.uvTrend.melbourne,
      borderColor: '#2a6f97',
      backgroundColor: 'rgba(42, 111, 151, 0.08)',
      borderWidth: 3,
      tension: 0.28,
      pointRadius: 0,
      fill: false
    },
    {
      label: 'Sydney',
      data: props.uvTrend.sydney,
      borderColor: '#d97706',
      backgroundColor: 'rgba(217, 119, 6, 0.08)',
      borderWidth: 3,
      tension: 0.28,
      pointRadius: 0,
      fill: false
    },
    {
      label: 'Brisbane',
      data: props.uvTrend.brisbane,
      borderColor: '#c2410c',
      backgroundColor: 'rgba(194, 65, 12, 0.08)',
      borderWidth: 3,
      tension: 0.28,
      pointRadius: 0,
      fill: false
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        boxWidth: 10,
      },
    },
    title: {
      display: false,
    }
  },
  scales: {
    x: {
      ticks: {
        maxTicksLimit: 6,
        color: '#6b5a4d',
      },
      grid: {
        display: false,
      }
    },
    y: {
      beginAtZero: true,
      max: 14,
      ticks: {
        stepSize: 2,
        color: '#6b5a4d',
      },
      title: {
        display: true,
        text: 'Daily peak UV index',
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

.insight-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin: 1.2rem 0 1.3rem;
}

.insight-pill {
  padding: 1rem 1.1rem;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff7ea 0%, #fff1d7 100%);
  border: 1px solid #efd29e;
}

.insight-pill__label {
  display: block;
  margin-bottom: 0.35rem;
  color: #99622c;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.insight-pill__value {
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
  .insight-row {
    grid-template-columns: 1fr;
  }
}
</style>
