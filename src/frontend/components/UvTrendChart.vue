<template>
  <div class="chart-wrapper">
    <Line :data="chartData" :options="chartOptions" />
  </div>
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

const chartData = computed(() => ({
  labels: props.uvTrend.dates,
  datasets: [
    {
      label: 'Melbourne',
      data: props.uvTrend.melbourne,
      borderColor: '#2563eb',
      backgroundColor: '#2563eb',
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 0
    },
    {
      label: 'Sydney',
      data: props.uvTrend.sydney,
      borderColor: '#dc2626',
      backgroundColor: '#dc2626',
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 0
    },
    {
      label: 'Brisbane',
      data: props.uvTrend.brisbane,
      borderColor: '#16a34a',
      backgroundColor: '#16a34a',
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 0
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true
    },
    title: {
      display: true,
      text: 'UV Trend Across Selected Australian Cities, Last 12 Months'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Date'
      },
      ticks: {
        maxTicksLimit: 12
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Daily Maximum UV Index'
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  height: 400px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-sizing: border-box;
}
</style>