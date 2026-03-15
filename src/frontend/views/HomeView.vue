<template>
  <section class="home-page">
    <div class="home-container">
      <header class="home-header">
        <h1 class="page-title">Live UV Alerts</h1>
        <p class="page-subtitle">
          Check the current UV level for your area and stay aware when you are outdoors.
        </p>
      </header>

      <section class="content-card">
        <p v-if="isLoading" class="status-text">
          Loading your current UV data...
        </p>

        <p v-else-if="errorMessage" class="status-text status-text--error">
          {{ errorMessage }}
        </p>

        <div v-else-if="uvData" class="uv-dashboard">
          <div class="uv-left-panel">
            <div class="location-banner">
              <div class="weather-icon" aria-hidden="true">
                <span class="weather-icon__sun"></span>
                <span class="weather-icon__cloud"></span>
              </div>

              <div>
                <h2 class="location-title">
                  Current UV Level in {{ displayLocation }}
                </h2>
                <p v-if="formattedDateLine" class="location-date">
                  {{ formattedDateLine }}
                </p>
              </div>
            </div>

            <div class="map-wrapper">
              <div ref="mapContainer" class="map-container"></div>

              <div v-if="!hasMapboxToken" class="map-overlay-message">
                Map preview is unavailable because the Mapbox token is missing.
              </div>
            </div>

            <div class="info-strip">
              <div class="info-card info-card--time">
                <div class="clock-icon" aria-hidden="true"></div>

                <div>
                  <span class="info-label">Updated</span>
                  <strong class="info-value">
                    {{ formattedUpdatedTime || 'Live now' }}
                  </strong>
                </div>
              </div>

              <div class="info-card info-card--coords">
                <span class="info-label">Specified location</span>
                <strong class="info-value">{{ formattedLatitude }}</strong>
                <strong class="info-value">{{ formattedLongitude }}</strong>
              </div>
            </div>
          </div>

          <div class="uv-right-panel">
            <div class="gauge-card">
              <svg viewBox="0 0 220 150" class="uv-gauge" aria-hidden="true">
                <path
                  d="M 30 120 A 80 80 0 0 1 190 120"
                  class="gauge-track"
                />
                <path
                  d="M 30 120 A 80 80 0 0 1 190 120"
                  class="gauge-active"
                  :style="{ stroke: uvDisplayInfo.color }"
                />
                <line
                  v-if="needlePoint"
                  x1="110"
                  y1="120"
                  :x2="needlePoint.x"
                  :y2="needlePoint.y"
                  class="gauge-needle"
                />
                <circle cx="110" cy="120" r="7" class="gauge-center" />
              </svg>

              <div class="uv-number">
                {{ uvValueText }}
              </div>

              <div
                class="uv-risk-badge"
                :style="{
                  backgroundColor: uvDisplayInfo.color,
                  color: uvDisplayInfo.textColor,
                }"
              >
                {{ uvDisplayInfo.level }}
              </div>
            </div>

            <div class="mini-info-grid">
              <div class="mini-info-card mini-info-card--purple">
                <span class="mini-info-label">Sun protection</span>
                <strong class="mini-info-value">Needed when UV is 3+</strong>
              </div>

              <div class="mini-info-card mini-info-card--light">
                <span class="mini-info-label">Skin burn time</span>
                <strong class="mini-info-value">10 to 15 minutes</strong>
                <small class="mini-info-note">Placeholder text for now</small>
              </div>
            </div>

            <div
              class="warning-card"
              :style="{ borderColor: uvDisplayInfo.color }"
            >
              <div class="warning-header">
                <span class="warning-icon" aria-hidden="true">⚠️</span>

                <div>
                  <h3 class="warning-title">
                    {{ burnWarningText }}
                  </h3>

                  <p class="warning-text">
                    {{ uvDisplayInfo.message }}
                  </p>
                </div>
              </div>

              <p class="warning-subtext">Full coverage when outside:</p>

              <div class="protection-grid">
                <div class="protection-item">
                  <span class="protection-icon" aria-hidden="true">🧴</span>
                  <span class="protection-label">SPF50+</span>
                </div>

                <div class="protection-item">
                  <span class="protection-icon" aria-hidden="true">👒</span>
                  <span class="protection-label">Hat</span>
                </div>

                <div class="protection-item">
                  <span class="protection-icon" aria-hidden="true">🕶️</span>
                  <span class="protection-label">Sunglasses</span>
                </div>
              </div>

              <p class="refresh-note">
                This page refreshes automatically every 30 minutes.
              </p>
            </div>
          </div>
        </div>

        <LocationInput
          v-if="showManualLocation"
          @submit="handleManualLocationSubmit"
        />
      </section>
    </div>
  </section>
</template>

<script setup>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import LocationInput from '../components/LocationInput.vue'
import { getCurrentUvByCoords, searchLocation } from '../services/uvService'

const isLoading = ref(false)
const errorMessage = ref('')
const uvData = ref(null)
const showManualLocation = ref(false)

const latitude = ref(null)
const longitude = ref(null)

const mapContainer = ref(null)

const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || ''
const hasMapboxToken = computed(() => Boolean(mapboxToken))

let refreshTimer = null
let map = null
let marker = null

function getValidDate(rawTime) {
  if (!rawTime) return null

  const date =
    typeof rawTime === 'number'
      ? new Date(rawTime * 1000)
      : new Date(rawTime)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

const formattedDateLine = computed(() => {
  const date = getValidDate(uvData.value?.time)

  if (!date) return ''

  return `On ${new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)}`
})

const formattedUpdatedTime = computed(() => {
  const date = getValidDate(uvData.value?.time)

  if (!date) return ''

  return new Intl.DateTimeFormat('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
})

const displayLocation = computed(() => {
  return uvData.value?.locationName || 'your area'
})

const uvValueText = computed(() => {
  const value = Number(uvData.value?.uvIndex)

  if (Number.isNaN(value)) {
    return '--'
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1)
})

function getUvDisplayInfo(uvIndex) {
  const value = Number(uvIndex)

  // Keeps the UI stable if the API sends something unexpected.
  if (Number.isNaN(value) || value < 0) {
    return {
      level: 'Unknown',
      color: '#6b7280',
      textColor: '#ffffff',
      message: 'UV data is currently unavailable.',
    }
  }

  if (value < 1) {
    return {
      level: 'Low',
      color: '#2e7d32',
      textColor: '#ffffff',
      message: 'Sun protection is usually not required unless near reflective surfaces.',
    }
  }

  if (value <= 2) {
    return {
      level: 'Low',
      color: '#2e7d32',
      textColor: '#ffffff',
      message: 'Sun protection is usually not required unless near reflective surfaces.',
    }
  }

  if (value <= 5) {
    return {
      level: 'Moderate',
      color: '#f9a825',
      textColor: '#111827',
      message: 'Sun protection recommended.',
    }
  }

  if (value <= 7) {
    return {
      level: 'High',
      color: '#ef6c00',
      textColor: '#ffffff',
      message: 'Sun protection recommended.',
    }
  }

  if (value <= 10) {
    return {
      level: 'Very High',
      color: '#c62828',
      textColor: '#ffffff',
      message: 'Sun protection recommended.',
    }
  }

  return {
    level: 'Extreme',
    color: '#6a1b9a',
    textColor: '#ffffff',
    message: 'Sun protection recommended.',
  }
}

const uvDisplayInfo = computed(() => {
  if (uvData.value?.uvIndex == null) {
    return {
      level: 'Unknown',
      color: '#6b7280',
      textColor: '#ffffff',
      message: 'UV data is currently unavailable.',
    }
  }

  return getUvDisplayInfo(uvData.value.uvIndex)
})

const needlePoint = computed(() => {
  const value = Number(uvData.value?.uvIndex)

  if (Number.isNaN(value)) {
    return null
  }

  const safeValue = Math.max(0, Math.min(value, 12))
  const angle = 180 + (safeValue / 12) * 180
  const radians = (angle * Math.PI) / 180

  const centerX = 110
  const centerY = 120
  const needleLength = 58

  return {
    x: centerX + needleLength * Math.cos(radians),
    y: centerY + needleLength * Math.sin(radians),
  }
})

const burnWarningText = computed(() => {
  const value = Number(uvData.value?.uvIndex)

  if (Number.isNaN(value) || value < 3) {
    return 'UV is lower right now, but conditions can still change.'
  }

  return 'Unprotected skin can burn in 10 to 15 minutes!'
})

const formattedLatitude = computed(() => {
  return formatCoordinate(latitude.value, 'N', 'S')
})

const formattedLongitude = computed(() => {
  return formatCoordinate(longitude.value, 'E', 'W')
})

function formatCoordinate(value, positiveDirection, negativeDirection) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) {
    return 'Not available'
  }

  const direction = numericValue >= 0 ? positiveDirection : negativeDirection
  return `${Math.abs(numericValue).toFixed(4)}°${direction}`
}

function initialiseMap() {
  if (!hasMapboxToken.value) return
  if (!mapContainer.value) return
  if (latitude.value == null || longitude.value == null) return

  mapboxgl.accessToken = mapboxToken

  if (!map) {
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [longitude.value, latitude.value],
      zoom: 9,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
  } else {
    map.setCenter([longitude.value, latitude.value])
  }

  if (!marker) {
    marker = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([longitude.value, latitude.value])
      .addTo(map)
  } else {
    marker.setLngLat([longitude.value, latitude.value])
  }

  map.resize()
}

async function fetchUvData() {
  if (latitude.value == null || longitude.value == null) return

  try {
    errorMessage.value = ''
    const data = await getCurrentUvByCoords(latitude.value, longitude.value)
    uvData.value = data
  } catch (error) {
    errorMessage.value = 'Could not load UV data right now.'
  }
}

function startAutoRefresh() {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }

  refreshTimer = setInterval(() => {
    fetchUvData()
  }, 30 * 60 * 1000)
}

function requestUserLocation() {
  isLoading.value = true
  errorMessage.value = ''
  uvData.value = null
  showManualLocation.value = false

  if (!navigator.geolocation) {
    isLoading.value = false
    errorMessage.value = 'Geolocation is not supported in this browser.'
    showManualLocation.value = true
    return
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      latitude.value = position.coords.latitude
      longitude.value = position.coords.longitude

      await fetchUvData()
      startAutoRefresh()
      isLoading.value = false
    },
    () => {
      isLoading.value = false
      errorMessage.value =
        'Location access was denied. Please enter your suburb or postcode.'
      showManualLocation.value = true
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  )
}

async function handleManualLocationSubmit(value) {
  isLoading.value = true
  errorMessage.value = ''
  uvData.value = null

  try {
    const locationData = await searchLocation(value)

    latitude.value = locationData.latitude
    longitude.value = locationData.longitude

    await fetchUvData()
    startAutoRefresh()
    showManualLocation.value = false
  } catch (error) {
    errorMessage.value =
      'We could not find that suburb or postcode. Please try again.'
  } finally {
    isLoading.value = false
  }
}

watch([isLoading, uvData, latitude, longitude], async ([loading, data, newLatitude, newLongitude]) => {
  if (loading || !data || newLatitude == null || newLongitude == null) return

  await nextTick()
  initialiseMap()
})

onMounted(() => {
  requestUserLocation()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }

  if (map) {
    map.remove()
    map = null
    marker = null
  }
})
</script>

<style scoped>
.home-page {
  width: 100%;
  padding: 2.5rem 0 3rem;
  background: linear-gradient(180deg, #f8f4e8 0%, #f6f0de 100%);
}

.home-container {
  width: min(1180px, 94%);
  margin: 0 auto;
}

.home-header {
  margin-bottom: 1.5rem;
}

.page-title {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  color: #111827;
}

.page-subtitle {
  margin: 0;
  color: #5b6170;
  line-height: 1.6;
}

.content-card {
  padding: 1.5rem;
  background: #f5efe2;
  border: 1px solid #e1d7c5;
  border-radius: 26px;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.07);
}

.status-text {
  margin: 0;
  color: #374151;
}

.status-text--error {
  color: #b91c1c;
}

.uv-dashboard {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2rem;
  align-items: start;
}

.uv-left-panel {
  padding-right: 1.5rem;
  border-right: 2px solid #403c36;
}

.location-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
}

.weather-icon {
  position: relative;
  width: 56px;
  height: 40px;
  flex-shrink: 0;
}

.weather-icon__sun {
  position: absolute;
  top: 0;
  right: 2px;
  width: 28px;
  height: 28px;
  background: #e8d65e;
  border-radius: 50%;
  box-shadow: 0 0 0 7px rgba(232, 214, 94, 0.18);
}

.weather-icon__cloud {
  position: absolute;
  left: 2px;
  bottom: 0;
  width: 38px;
  height: 18px;
  background: #d9d9d9;
  border-radius: 18px;
}

.weather-icon__cloud::before,
.weather-icon__cloud::after {
  content: '';
  position: absolute;
  background: #d9d9d9;
  border-radius: 50%;
}

.weather-icon__cloud::before {
  width: 18px;
  height: 18px;
  left: 4px;
  top: -9px;
}

.weather-icon__cloud::after {
  width: 22px;
  height: 22px;
  right: 4px;
  top: -11px;
}

.location-title {
  margin: 0;
  font-size: 2rem;
  line-height: 1.08;
  color: #1f1f1f;
}

.location-date {
  margin: 0.3rem 0 0;
  color: #54504a;
  font-size: 1.05rem;
}

.map-wrapper {
  position: relative;
  min-height: 380px;
  border-radius: 18px;
  overflow: hidden;
  border: 2px solid #aab7bd;
  background: #e5e7eb;
}

.map-container {
  width: 100%;
  height: 380px;
}

.map-overlay-message {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #374151;
  background: rgba(255, 255, 255, 0.88);
}

.info-strip {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  align-items: stretch;
}

.info-card {
  background: linear-gradient(180deg, #ffffff 0%, #eaeaea 100%);
  border: 1px solid #a7a7a7;
  border-radius: 14px;
  padding: 1rem 1.1rem;
  box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08);
}

.info-card--time {
  min-width: 185px;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.info-card--coords {
  min-width: 200px;
  display: grid;
  gap: 0.3rem;
}

.clock-icon {
  width: 36px;
  height: 36px;
  border: 3px solid #2f2f2f;
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
}

.clock-icon::before,
.clock-icon::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  background: #2f2f2f;
  transform-origin: bottom center;
  border-radius: 999px;
}

.clock-icon::before {
  width: 3px;
  height: 11px;
  transform: translate(-50%, -100%) rotate(0deg);
}

.clock-icon::after {
  width: 3px;
  height: 8px;
  transform: translate(-50%, -100%) rotate(55deg);
}

.info-label {
  display: block;
  margin-bottom: 0.25rem;
  color: #4b5563;
  font-size: 0.86rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.info-value {
  display: block;
  color: #171717;
  font-size: 1.05rem;
  line-height: 1.4;
}

.uv-right-panel {
  display: grid;
  gap: 1.3rem;
}

.gauge-card {
  display: grid;
  justify-items: center;
  padding-top: 0.5rem;
}

.uv-gauge {
  width: min(100%, 360px);
  height: auto;
}

.gauge-track {
  fill: none;
  stroke: rgba(0, 0, 0, 0.08);
  stroke-width: 12;
  stroke-linecap: round;
}

.gauge-active {
  fill: none;
  stroke-width: 12;
  stroke-linecap: round;
}

.gauge-needle {
  stroke: #28303c;
  stroke-width: 3.5;
  stroke-linecap: round;
}

.gauge-center {
  fill: #28303c;
}

.uv-number {
  margin-top: -0.5rem;
  font-size: clamp(3.8rem, 7vw, 5.4rem);
  line-height: 1;
  font-weight: 800;
  color: #000000;
}

.uv-risk-badge {
  margin-top: 0.8rem;
  padding: 0.7rem 1.2rem;
  border-radius: 14px;
  font-size: 1.55rem;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.mini-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.mini-info-card {
  padding: 1rem 1.1rem;
  border-radius: 14px;
  text-align: center;
  box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08);
}

.mini-info-card--purple {
  background: linear-gradient(180deg, #f2cbf2 0%, #d8b2dc 100%);
  border: 1px solid #d2b1d8;
}

.mini-info-card--light {
  background: linear-gradient(180deg, #ffffff 0%, #efefef 100%);
  border: 1px solid #d8d8d8;
}

.mini-info-label {
  display: block;
  color: #4b5563;
  font-size: 0.9rem;
  margin-bottom: 0.45rem;
}

.mini-info-value {
  display: block;
  color: #171717;
  font-size: 1.45rem;
  line-height: 1.25;
}

.mini-info-note {
  display: block;
  margin-top: 0.45rem;
  color: #6b7280;
  font-size: 0.78rem;
}

.warning-card {
  padding: 1.35rem;
  border: 2px solid #dc2626;
  border-radius: 18px;
  background: rgba(255, 225, 225, 0.82);
}

.warning-header {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
}

.warning-icon {
  font-size: 1.7rem;
  line-height: 1;
}

.warning-title {
  margin: 0;
  font-size: 1.85rem;
  color: #181818;
}

.warning-text {
  margin: 0.45rem 0 0;
  color: #303030;
  font-size: 1rem;
}

.warning-subtext {
  margin: 1.2rem 0 1rem;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: #171717;
}

.protection-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  text-align: center;
}

.protection-item {
  display: grid;
  gap: 0.4rem;
  justify-items: center;
}

.protection-icon {
  font-size: 2.6rem;
}

.protection-label {
  font-size: 1.15rem;
  font-weight: 700;
  color: #171717;
}

.refresh-note {
  margin: 1.2rem 0 0;
  color: #5b6170;
  text-align: center;
  font-size: 0.95rem;
}

@media (max-width: 980px) {
  .uv-dashboard {
    grid-template-columns: 1fr;
  }

  .uv-left-panel {
    padding-right: 0;
    border-right: 0;
    border-bottom: 2px solid #403c36;
    padding-bottom: 1.5rem;
  }
}

@media (max-width: 700px) {
  .location-title {
    font-size: 1.45rem;
  }

  .map-container,
  .map-wrapper {
    min-height: 280px;
    height: 280px;
  }

  .info-strip {
    flex-direction: column;
  }

  .mini-info-grid {
    grid-template-columns: 1fr;
  }

  .protection-grid {
    grid-template-columns: 1fr;
  }

  .uv-risk-badge {
    font-size: 1.15rem;
  }

  .warning-title {
    font-size: 1.35rem;
  }
}
</style>
