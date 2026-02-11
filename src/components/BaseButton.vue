<template>
  <button
    :type="type"
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
});
</script>

<style src="../style/base-button.css" scoped></style>
