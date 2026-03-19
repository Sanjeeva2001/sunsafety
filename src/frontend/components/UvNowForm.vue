<template>
  <section class="home-page">
    <div class="home-container">
      <header class="home-header">
        <p class="page-kicker">Today's UV Risk</p>
        <h1 class="page-title">
          Check the UV where you are and what protection you need today.
        </h1>
        <p class="page-subtitle">
          Check before a walk, workout, beach trip, commute, or anything outdoors.
        </p>
      </header>

      <section class="content-card">
        <p v-if="isLoading" class="status-text">
          Loading your UV...
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
                    Today’s UV in {{ displayLocation }}
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
              <div class="mini-info-card mini-info-card--gold">
                <span class="mini-info-label">When to act</span>
                <strong class="mini-info-value">Protect when UV hits 3+</strong>
              </div>

              <div class="mini-info-card mini-info-card--sand">
                <span class="mini-info-label">So what?</span>
                <strong class="mini-info-value">{{ practicalTakeaway }}</strong>
              </div>
            </div>

            <div
              class="warning-card"
              :style="{ borderColor: uvDisplayInfo.color }"
            >
              <div class="warning-header">
                <span class="warning-icon" aria-hidden="true">🚨</span>

                <div>
                  <h3 class="warning-title">
                    {{ burnWarningText }}
                  </h3>

                  <p class="warning-text">
                    {{ uvDisplayInfo.message }}
                  </p>
                </div>
              </div>

              <p class="warning-subtext">Before you head out:</p>

              <div class="protection-grid">
                <div class="protection-item">
                  <span class="protection-icon" aria-hidden="true">🧴</span>
                  <span class="protection-label">Apply SPF50+</span>
                </div>

                <div class="protection-item">
                  <span class="protection-icon" aria-hidden="true">🧢</span>
                  <span class="protection-label">Pack a hat</span>
                </div>

                <div class="protection-item">
                  <span class="protection-icon" aria-hidden="true">🕶️</span>
                  <span class="protection-label">Cover eyes + seek shade</span>
                </div>
              </div>

              <p class="refresh-note">
                Auto-refreshes every 30 minutes.
              </p>
            </div>
          </div>
        </div>

        <LocationInput
          v-if="showManualLocation"
          @submit="handleManualLocationSubmit"
        />
      </section>

      <section v-if="uvData" id="protection-guide" class="lower-panels">
        <section class="detail-card detail-card--postcard">
          <div class="detail-card__header">
            <div class="detail-icon detail-icon--postcard" aria-hidden="true">✉️</div>

            <div>
              <h2 class="detail-title">Postcard from today</h2>
              <p class="detail-subtitle">
                A quick takeaway before you step outside.
              </p>
            </div>
          </div>

          <div class="postcard-panel">
            <p class="postcard-panel__lead">{{ postcardHeadline }}</p>
            <p class="postcard-panel__text">{{ postcardMessage }}</p>
          </div>
        </section>

        <section class="detail-card">
          <div class="detail-card__header">
            <div class="detail-icon detail-icon--alert" aria-hidden="true">⏱️</div>

            <div>
              <h2 class="detail-title">Estimated skin damage times at today’s UV</h2>
              <p class="detail-subtitle">
                A simple estimate to make the number feel real.
              </p>
            </div>
          </div>

          <div class="skin-grid">
            <div
              v-for="item in skinDamageItems"
              :key="item.label"
              class="skin-card"
            >
              <span class="skin-card__label">{{ item.label }}</span>

              <span
                class="skin-card__time"
                :class="item.toneClass"
              >
                {{ item.timeText }}
              </span>
            </div>
          </div>
        </section>
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

const skinTypeReference = [
  { label: 'Type I (Very Fair)', baseMinutesAtUv8: 7 },
  { label: 'Type II (Fair)', baseMinutesAtUv8: 11 },
  { label: 'Type III (Medium)', baseMinutesAtUv8: 22 },
  { label: 'Type IV (Olive)', baseMinutesAtUv8: 33 },
  { label: 'Type V (Brown)', baseMinutesAtUv8: 44 },
  { label: 'Type VI (Dark)', baseMinutesAtUv8: 56 },
]

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

const practicalTakeaway = computed(() => {
  const value = Number(uvData.value?.uvIndex)

  if (!Number.isFinite(value)) {
    return 'UV data unavailable right now'
  }

  if (value < 3) {
    return 'Lower risk now, but recheck before a longer outdoor session'
  }

  if (value <= 5) {
    return 'A normal lunch break outside can still add up'
  }

  if (value <= 7) {
    return 'Outdoor plans need shade, sunscreen, and timing'
  }

  return 'Limit direct sun and protect skin from the start'
})

const postcardHeadline = computed(() => {
  const value = Number(uvData.value?.uvIndex)

  if (!Number.isFinite(value)) {
    return 'The sun risk is unclear until fresh UV data loads.'
  }

  if (value < 3) {
    return 'Today looks calmer, but that does not mean you can ignore the UV.'
  }

  if (value <= 5) {
    return 'Today’s sun can still catch you out during everyday routines.'
  }

  if (value <= 7) {
    return 'Today is the kind of day where a short outdoor plan can become overexposure.'
  }

  return 'Today is a high-risk UV day, so protection should start before you step outside.'
})

const postcardMessage = computed(() => {
  const value = Number(uvData.value?.uvIndex)

  if (!Number.isFinite(value)) {
    return 'Try again in a moment or enter a suburb or postcode so we can load the local conditions.'
  }

  if (value < 3) {
    return 'If you are outside for longer, especially around reflective surfaces, keep an eye on changes and check again later.'
  }

  if (value <= 5) {
    return 'Walking to class, waiting for transport, or eating outside can be enough time to need sunscreen, a hat, and shade.'
  }

  if (value <= 7) {
    return 'This is a day to avoid relying on cloud cover or comfort level. The sun may not feel harsh, but UV can still damage skin.'
  }

  return 'Treat this like a plan-ahead day: sunscreen before leaving, a hat with you, sunglasses on, and shade built into your routine.'
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
  return `${Math.abs(numericValue).toFixed(4)}📍${direction}`
}

function getSkinToneClass(minutes) {
  if (minutes <= 10) return 'skin-card__time--danger'
  if (minutes <= 20) return 'skin-card__time--warning'
  if (minutes <= 35) return 'skin-card__time--caution'
  return 'skin-card__time--safe'
}

const skinDamageItems = computed(() => {
  const currentUv = Number(uvData.value?.uvIndex)

  return skinTypeReference.map((item) => {
    if (!Number.isFinite(currentUv) || currentUv <= 0) {
      return {
        ...item,
        timeText: 'Low risk',
        toneClass: 'skin-card__time--safe',
      }
    }

    if (currentUv < 3) {
      return {
        ...item,
        timeText: 'Minimal',
        toneClass: 'skin-card__time--safe',
      }
    }

    const estimatedMinutes = Math.max(
      2,
      Math.round((item.baseMinutesAtUv8 * 8) / currentUv)
    )

    return {
      ...item,
      timeText: `${estimatedMinutes} min`,
      toneClass: getSkinToneClass(estimatedMinutes),
    }
  })
})

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

    map.on('load', () => {
      map.resize()
    })
  } else {
    map.setCenter([longitude.value, latitude.value])
    map.resize()
  }

  if (!marker) {
    marker = new mapboxgl.Marker({ color: '#ef4444' })
      .setLngLat([longitude.value, latitude.value])
      .addTo(map)
  } else {
    marker.setLngLat([longitude.value, latitude.value])
  }
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

watch(
  [isLoading, uvData, latitude, longitude],
  async ([loading, data, newLatitude, newLongitude]) => {
    if (loading || !data || newLatitude == null || newLongitude == null) return

    await nextTick()
    initialiseMap()
  }
)

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
  background:
    radial-gradient(circle at top right, rgba(255, 213, 140, 0.3), transparent 22%),
    linear-gradient(180deg, #fff8ef 0%, #fff3df 100%);
}

.home-container {
  width: min(1180px, 94%);
  margin: 0 auto;
}

.home-header {
  margin-bottom: 1.75rem;
}

.page-kicker {
  margin: 0 0 0.5rem;
  color: #b24c12;
  font-size: 0.92rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-title {
  max-width: 820px;
  margin: 0;
  color: #2f2218;
  font-size: clamp(2.2rem, 4vw, 3.4rem);
  line-height: 1.12;
}

.page-subtitle {
  max-width: 760px;
  margin: 0.9rem 0 0;
  color: #655546;
  line-height: 1.6;
  font-size: 1.08rem;
}

.content-card {
  padding: 1.5rem;
  background: rgba(255, 251, 246, 0.92);
  border: 1px solid #ecd8bf;
  border-radius: 26px;
  box-shadow: 0 18px 36px rgba(130, 76, 27, 0.08);
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
  border-right: 1px solid #e3cfba;
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
  color: #2a2017;
}

.location-date {
  margin: 0.3rem 0 0;
  color: #6d5d50;
  font-size: 1.05rem;
}

.map-wrapper {
  position: relative;
  min-height: 380px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid #d8c6b1;
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
  background: linear-gradient(180deg, #ffffff 0%, #fff6ea 100%);
  border: 1px solid #e6d0b6;
  border-radius: 14px;
  padding: 1rem 1.1rem;
  box-shadow: 0 10px 24px rgba(130, 76, 27, 0.08);
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
  padding: 1rem 1rem 0.5rem;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 244, 220, 0.8) 0%, rgba(255, 255, 255, 0.95) 100%);
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
  color: #2f241b;
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

.mini-info-card--gold {
  background: linear-gradient(180deg, #fff0c8 0%, #ffe0a1 100%);
  border: 1px solid #f0ca7f;
}

.mini-info-card--sand {
  background: linear-gradient(180deg, #fff8eb 0%, #f5e6cf 100%);
  border: 1px solid #e6d0b2;
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

.warning-card {
  padding: 1.35rem;
  border: 2px solid #dc2626;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 237, 231, 0.95) 0%, rgba(255, 247, 243, 0.92) 100%);
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

.lower-panels {
  display: grid;
  gap: 1.3rem;
  margin-top: 1.3rem;
}

.detail-card {
  padding: 1.35rem;
  background: rgba(255, 251, 246, 0.92);
  border: 1px solid #ecd8bf;
  border-radius: 22px;
  box-shadow: 0 12px 30px rgba(130, 76, 27, 0.06);
}

.detail-card--postcard {
  background:
    linear-gradient(135deg, rgba(255, 244, 220, 0.95) 0%, rgba(255, 251, 243, 0.95) 100%);
}

.detail-card__header {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.detail-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.detail-icon--alert {
  background: #ffd8d8;
}

.detail-icon--postcard {
  background: #ffe9bf;
}

.detail-title {
  margin: 0;
  font-size: 1.8rem;
  color: #1f1f1f;
}

.detail-subtitle {
  margin: 0.3rem 0 0;
  color: #5b6170;
  line-height: 1.5;
}

.postcard-panel {
  padding: 1.2rem 1.3rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px dashed #e2ba80;
}

.postcard-panel__lead {
  margin: 0 0 0.65rem;
  color: #32241b;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.4;
}

.postcard-panel__text {
  margin: 0;
  color: #645345;
  line-height: 1.7;
}

.skin-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.skin-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 1rem 1.1rem;
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #fff6ea 100%);
  border: 1px solid #e6d0b6;
  box-shadow: 0 10px 20px rgba(130, 76, 27, 0.06);
}

.skin-card__label {
  color: #2d2d2d;
  line-height: 1.4;
}

.skin-card__time {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
}

.skin-card__time--danger {
  background: #ffd5d5;
  color: #c81e1e;
}

.skin-card__time--warning {
  background: #ffe4be;
  color: #ca6a04;
}

.skin-card__time--caution {
  background: #fff0b3;
  color: #9a6700;
}

.skin-card__time--safe {
  background: #d8f5ca;
  color: #15803d;
}

@media (max-width: 980px) {
  .uv-dashboard {
    grid-template-columns: 1fr;
  }

  .uv-left-panel {
    padding-right: 0;
    border-right: 0;
    border-bottom: 1px solid #e3cfba;
    padding-bottom: 1.5rem;
  }

  .skin-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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

  .detail-title {
    font-size: 1.35rem;
  }

  .skin-grid {
    grid-template-columns: 1fr;
  }

  .skin-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
