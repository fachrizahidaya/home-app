<template>
  <router-link :to="to" class="action-card">
    <span class="action-icon">
      <slot name="icon" />
    </span>
    <span>{{ label }}</span>
  </router-link>
</template>

<script setup>
defineProps({
  to: String,
  label: String,
});
</script>

<style>
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  border: 2px solid transparent;
}

.action-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -4px rgba(102, 126, 234, 0.2);
}

.action-icon {
  font-size: 2rem;
}
</style>
