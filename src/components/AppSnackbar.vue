<template>
  <transition name="fade">
    <div v-if="snackbar.show" :class="['snackbar', snackbar.color]">
      {{ snackbar.message }}
    </div>
  </transition>
</template>

<script setup>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";

const authStore = useAuthStore();

const snackbar = computed(() => authStore.snackbar);
</script>

<style scoped>
.snackbar {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 12px 16px;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  z-index: 9999;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.snackbar.success {
  background: #22c55e;
}

.snackbar.error {
  background: #ef4444;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
