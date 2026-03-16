<template>
  <div class="home-page">
    <div class="hero-section">
      <div class="overlay"></div>

      <div class="hero-content">
        <h1>SunSafety</h1>
        <p class="tagline">Keeping you safe from the sun.</p>

        <p class="description">
          SunSafety is a website dedicated to raising awareness
          about UV radiation and how it affects skin health and skin cancer rates in Australia.
        </p>

        <div class="button-group">
          <router-link to="/uv-now" class="hero-btn primary-btn">
            View current UV Levels
          </router-link>

          <router-link to="/awareness" class="hero-btn secondary-btn">
            Skin Cancer Facts
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background-color: #1b0d05;
}

.hero-section {
  position: relative;
  min-height: 100vh;
  background-image: url('/Homepage.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom, rgba(20, 8, 2, 0.35), rgba(20, 8, 2, 0.75)),
    linear-gradient(to top, rgba(0, 0, 0, 0.45), transparent 40%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem 1.5rem 4rem;
  text-align: center;
  color: white;
}

.hero-content h1 {
  font-size: 4rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

.tagline {
  margin-top: 0.75rem;
  font-size: 1.4rem;
  font-weight: 500;
  color: #fff2e6;
}

.description {
  max-width: 760px;
  margin-top: 2rem;
  font-size: 1rem;
  line-height: 1.7;
  color: #f8e8dc;
  background-color: rgba(0, 0, 0, 0.22);
  padding: 1rem 1.25rem;
  border-radius: 10px;
}

.button-group {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2.5rem;
}

.hero-btn {
  text-decoration: none;
  padding: 0.95rem 1.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.25s ease;
  display: inline-block;
  min-width: 210px;
  text-align: center;
}

.primary-btn {
  background-color: #f28c28;
  color: white;
}

.primary-btn:hover {
  background-color: #de7818;
}

.secondary-btn {
  background-color: #8a4b17;
  color: white;
}

.secondary-btn:hover {
  background-color: #6f3b11;
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.8rem;
  }

  .tagline {
    font-size: 1.1rem;
  }

  .description {
    font-size: 0.95rem;
    max-width: 90%;
  }

  .button-group {
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }

  .hero-btn {
    width: 100%;
    max-width: 260px;
  }
}
</style>
