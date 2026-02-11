<template>
  <div class="activity-item">
    <div class="activity-icon" :class="type">
      <slot name="icon" />
    </div>

    <div class="activity-content">
      <p>{{ text }}</p>
      <span class="activity-time">{{ time }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  text: String,
  time: String,
  type: String, // groceries | notes | homework
});
</script>

<style>
.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  font-size: 1.25rem;
}

.activity-content p {
  margin: 0;
  color: #374151;
  font-size: 0.875rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}
</style>
