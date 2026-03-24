<template>
  <button
    :type="type || 'button'"
    class="base-button"
    :class="{ 'is-loading': loading }"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span v-else>
      <slot />
    </span>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "button",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: "primary", // primary | secondary | link
  },
});
</script>

<style src="../style/base-button.css" scoped></style>
