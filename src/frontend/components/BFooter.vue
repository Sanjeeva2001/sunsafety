<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <p class="footer-brand">☀️ SunSafety</p>
      <p class="footer-text">
        Check today's UV risk, understand the pattern, and make a safer plan before you head outside.
      </p>
    </div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.site-footer {
  width: 100%;
  background:
    radial-gradient(circle at top center, rgba(255, 198, 122, 0.22), transparent 24%),
    linear-gradient(135deg, #5a2208 0%, #8e3b12 35%, #cf6d1d 100%);
  color: #fff8f0;
  margin-top: auto;
}

.footer-inner {
  width: min(1100px, 92%);
  margin: 0 auto;
  padding: 1.8rem 0;
  text-align: center;
}

.footer-brand {
  margin: 0 0 0.45rem;
  font-weight: 700;
}

.footer-text {
  margin: 0;
  color: rgba(255, 248, 240, 0.8);
  line-height: 1.6;
}
</style>
