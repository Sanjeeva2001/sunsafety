<template>
  <div class="home-page">
    <section ref="heroSection" class="hero-section" :style="heroStyle">
      <div class="hero-parallax hero-parallax--image" aria-hidden="true"></div>
      <div class="overlay"></div>
      <div class="hero-parallax hero-parallax--sun" aria-hidden="true"></div>

      <div class="hero-content">
        <p class="eyebrow">Check before you go</p>
        <div class="hero-heading">
          <h1>Check today’s UV before you head out.</h1>
          <router-link to="/uv-now" class="hero-arrow" aria-label="Check today's UV risk">
            <span aria-hidden="true">→</span>
          </router-link>
        </div>
        <p class="tagline">
          See the risk, know what it means, and figure out how much protection you actually need.
        </p>

        <div class="button-group">
          <router-link to="/uv-now" class="hero-btn primary-btn">
            Check Today’s UV
          </router-link>

          <router-link to="/awareness" class="hero-btn secondary-btn">
            See Past UV Trends
          </router-link>
        </div>

        <div class="hero-highlights">
          <router-link to="/uv-now" class="highlight-card highlight-card--action">
            <strong>Check now</strong>
            <p>Use your location to see today’s UV and what to do next.</p>
          </router-link>

          <router-link to="/awareness" class="highlight-card highlight-card--action">
            <strong>See the pattern</strong>
            <p>Look at past UV trends so high-risk days are less random.</p>
          </router-link>

          <router-link to="/uv-now#protection-guide" class="highlight-card highlight-card--action">
            <strong>Protect better</strong>
            <p>Work out how much protection you need for sport, walks, or beach time.</p>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

const heroSection = ref(null)
const imageOffset = ref(0)
const contentOffset = ref(0)
const glowOffset = ref(0)

const heroStyle = computed(() => ({
  '--hero-image-offset': `${imageOffset.value}px`,
  '--hero-content-offset': `${contentOffset.value}px`,
  '--hero-glow-offset': `${glowOffset.value}px`,
}))

function updateParallax() {
  if (!heroSection.value) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isPhone = window.innerWidth <= 768

  if (reducedMotion || isPhone) {
    imageOffset.value = 0
    contentOffset.value = 0
    glowOffset.value = 0
    return
  }

  const bounds = heroSection.value.getBoundingClientRect()
  const progress = Math.max(-1, Math.min(1, -bounds.top / Math.max(bounds.height, 1)))

  imageOffset.value = progress * 48
  contentOffset.value = progress * -16
  glowOffset.value = progress * 30
}

onMounted(() => {
  updateParallax()
  window.addEventListener('scroll', updateParallax, { passive: true })
  window.addEventListener('resize', updateParallax)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateParallax)
  window.removeEventListener('resize', updateParallax)
})
</script>

<style scoped>
.home-page {
  background:
    linear-gradient(180deg, #2f1207 0%, #6a2a0d 16%, #fff7ef 16%, #fff7ef 100%);
}

.hero-section {
  position: relative;
  min-height: calc(100vh - 75px);
  overflow: hidden;
}

.hero-parallax {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-parallax--image {
  background-image: url('/Homepage.png');
  background-size: cover;
  background-position: center 30%;
  background-repeat: no-repeat;
  transform: translateY(var(--hero-image-offset));
  will-change: transform;
}

.hero-parallax--sun {
  inset: auto auto 12% 72%;
  width: clamp(180px, 22vw, 320px);
  height: clamp(180px, 22vw, 320px);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 210, 138, 0.58) 0%, rgba(255, 210, 138, 0.22) 38%, transparent 68%);
  transform: translateY(var(--hero-glow-offset));
  filter: blur(10px);
  will-change: transform;
}

.overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 18%, rgba(255, 192, 89, 0.2), transparent 16%),
    linear-gradient(to bottom, rgba(40, 14, 4, 0.22), rgba(40, 14, 4, 0.84)),
    linear-gradient(90deg, rgba(40, 14, 4, 0.72), rgba(40, 14, 4, 0.14));
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  width: min(1160px, 92%);
  margin: 0 auto;
  min-height: calc(100vh - 75px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding: 3rem 0 4rem;
  text-align: left;
  color: white;
  transform: translateY(var(--hero-content-offset));
  will-change: transform;
}

.hero-content::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 3rem;
  width: min(28vw, 320px);
  height: min(28vw, 320px);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 208, 134, 0.28) 0%, rgba(255, 208, 134, 0.08) 45%, transparent 70%);
  filter: blur(8px);
  pointer-events: none;
}

.eyebrow {
  margin: 0 0 1rem;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  background: rgba(255, 241, 215, 0.18);
  border: 1px solid rgba(255, 241, 215, 0.3);
  color: #ffe8bf;
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-content h1 {
  max-width: 680px;
  font-size: clamp(2.9rem, 6vw, 5rem);
  font-weight: 800;
  margin: 0;
  line-height: 1.04;
}

.hero-heading {
  display: flex;
  align-items: flex-end;
  gap: 0.9rem;
}

.hero-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: clamp(3rem, 5vw, 4rem);
  height: clamp(3rem, 5vw, 4rem);
  margin-bottom: 0.45rem;
  border-radius: 50%;
  background: #ffbf66;
  color: #592000;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  box-shadow: 0 12px 24px rgba(89, 32, 0, 0.22);
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}

.hero-arrow:hover {
  background: #ffd39a;
  transform: translateY(-2px);
  box-shadow: 0 16px 28px rgba(89, 32, 0, 0.28);
}

.tagline {
  max-width: 660px;
  margin-top: 1.25rem;
  font-size: 1.18rem;
  line-height: 1.7;
  color: #f8ebdb;
  text-wrap: balance;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.hero-btn {
  text-decoration: none;
  padding: 1rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.98rem;
  transition: transform 0.25s ease, background 0.25s ease, color 0.25s ease;
  display: inline-block;
  min-width: 220px;
  text-align: center;
}

.primary-btn {
  background-color: #ffbf66;
  color: #592000;
}

.primary-btn:hover {
  background-color: #ffcf8d;
  transform: translateY(-2px);
}

.secondary-btn {
  background-color: rgba(255, 255, 255, 0.12);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.secondary-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.hero-highlights {
  width: min(760px, 100%);
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.highlight-card {
  padding: 1.1rem 1.1rem 1.15rem;
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(255, 250, 241, 0.14) 0%, rgba(255, 250, 241, 0.08) 100%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
  box-shadow: 0 16px 26px rgba(22, 10, 4, 0.14);
}

.highlight-card--action {
  text-decoration: none;
  transition: transform 0.25s ease, background 0.25s ease, border-color 0.25s ease;
}

.highlight-card strong {
  display: block;
  margin-bottom: 0.45rem;
  color: #fff3dc;
  font-size: 1rem;
}

.highlight-card p {
  margin: 0;
  color: #f9ead9;
  line-height: 1.6;
}

.highlight-card--action:hover {
  transform: translateY(-3px);
  background: linear-gradient(180deg, rgba(255, 250, 241, 0.22) 0%, rgba(255, 250, 241, 0.14) 100%);
  border-color: rgba(255, 255, 255, 0.36);
}

@media (max-width: 1100px) {
  .hero-content {
    width: min(92%, 860px);
  }

  .hero-highlights {
    width: 100%;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: calc(100svh - 75px);
  }

  .hero-parallax--image,
  .hero-parallax--sun,
  .hero-content {
    transform: none;
  }

  .hero-content::after {
    display: none;
  }

  .hero-content {
    min-height: calc(100svh - 75px);
    align-items: center;
    text-align: center;
    padding: 2.6rem 0 3rem;
  }

  .hero-heading {
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-highlights {
    grid-template-columns: 1fr;
  }

  .button-group {
    width: 100%;
    gap: 1rem;
    justify-content: center;
  }

  .hero-btn {
    width: 100%;
    max-width: 320px;
  }
}
</style>
