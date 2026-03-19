<template>
  <header class="site-header">
    <div class="header-inner">
      <RouterLink to="/home" class="brand">
        <span class="brand-icon" aria-hidden="true">☀️</span>
        <span class="brand-text">SunSafety</span>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/home" class="nav-link">
          Home
        </RouterLink>

        <RouterLink to="/uv-now" class="nav-link">
          Today's UV Risk
        </RouterLink>

        <RouterLink to="/awareness" class="nav-link">
          UV Trends
        </RouterLink>

        <RouterLink to="/resources" class="nav-link">
          Resources
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.site-header {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 20;
  background:
    linear-gradient(180deg, rgba(255, 251, 245, 0.96) 0%, rgba(255, 248, 238, 0.92) 100%);
  border-bottom: 1px solid rgba(181, 111, 41, 0.16);
  backdrop-filter: blur(14px);
  box-shadow: 0 10px 24px rgba(125, 77, 29, 0.06);
}

.header-inner {
  width: min(1100px, 92%);
  margin: 0 auto;
  min-height: 92px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.4rem;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.9rem;
  text-decoration: none;
  color: #2f2216;
  font-weight: 800;
  font-size: 1.35rem;
  letter-spacing: 0.01em;
}

.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.9rem;
  height: 2.9rem;
  padding: 0 0.7rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffe2a8 0%, #ffb864 100%);
  color: #7a3000;
  font-size: 0.98rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
}

.brand-text {
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: 0.01em;
}

.nav {
  display: flex;
  gap: 0.95rem;
  flex-wrap: wrap;
}

.nav-link {
  text-decoration: none;
  color: #5a4738;
  font-weight: 700;
  font-size: 1.02rem;
  padding: 0.95rem 1.2rem;
  border-radius: 999px;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: #fff1d7;
  color: #9a3d03;
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(154, 61, 3, 0.08);
}

@media (max-width: 700px) {
  .header-inner {
    padding: 1rem 0 1.15rem;
    align-items: flex-start;
    flex-direction: column;
    gap: 0.9rem;
  }

  .nav {
    width: 100%;
  }
}
</style>
