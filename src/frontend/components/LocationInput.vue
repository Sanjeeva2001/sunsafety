<template>
  <section class="location-box">
    <h3 class="location-title">Use a suburb or postcode instead</h3>
    <p class="location-text">
      If location access is unavailable, enter your suburb or postcode to check today's UV risk manually.
    </p>

    <div class="location-form">
      <input
        v-model="inputValue"
        type="text"
        placeholder="Enter suburb or postcode"
        class="location-input"
        @keyup.enter="submitValue"
      />

      <button type="button" class="location-button" @click="submitValue">
        Check UV Risk
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submit'])
const inputValue = ref('')

function submitValue() {
  const cleaned = inputValue.value.trim()

  if (!cleaned) return

  emit('submit', cleaned)
}
</script>

<style scoped>
.location-box {
  margin-top: 1.25rem;
  padding: 1.25rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
}

.location-title {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  color: #111827;
}

.location-text {
  margin: 0 0 1rem;
  color: #4b5563;
  line-height: 1.5;
}

.location-form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.location-input {
  flex: 1;
  min-width: 220px;
  padding: 0.8rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
}

.location-button {
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 10px;
  background: #f59e0b;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
}
</style>
