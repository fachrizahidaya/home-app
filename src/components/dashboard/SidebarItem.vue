<template>
  <router-link :to="to" class="nav-item" :class="{ active: isActive }">
    <span class="nav-icon">
      <slot name="icon" />
    </span>
    <span v-if="!collapsed" class="nav-label">
      {{ label }}
    </span>
  </router-link>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  to: { type: String, required: true },
  label: { type: String, required: true },
  collapsed: { type: Boolean, default: false },
});

const route = useRoute();
const isActive = computed(() => route.path === props.to);
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.active {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  border-left: 3px solid #667eea;
}

.nav-icon svg {
  width: 22px;
  height: 22px;
}
</style>
