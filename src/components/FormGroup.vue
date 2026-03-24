<template>
  <div class="form-group">
    <label :for="id">{{ label }}</label>

    <div class="input-wrapper">
      <input
        :id="id"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
      />

      <!-- 👁 PrimeIcons toggle -->
      <i
        v-if="type === 'password'"
        :class="iconClass"
        class="toggle-password"
        @click="showPassword = !showPassword"
      ></i>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import "primeicons/primeicons.css";

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number], default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  disabled: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
});

defineEmits(["update:modelValue"]);

const showPassword = ref(false);

// 👇 dynamic input type
const inputType = computed(() => {
  if (props.type === "password") {
    return showPassword.value ? "text" : "password";
  }
  return props.type;
});

// 👇 dynamic icon
const iconClass = computed(() => {
  return showPassword.value ? "pi pi-eye-slash" : "pi pi-eye";
});
</script>

<style src="../style/form-group.css" scoped></style>
