<template>
  <component :is="iconComponent" v-if="iconComponent" class="app-icon" />
</template>

<script setup>
import { computed } from "vue";

import IconDashboard from "./IconDashboard.vue";
import IconGroceries from "./IconGroceries.vue";
import IconNotes from "./IconNotes.vue";
import IconHomework from "./IconHomework.vue";

const props = defineProps({
  name: String,
});

const icons = {
  dashboard: IconDashboard,
  groceries: IconGroceries,
  notes: IconNotes,
  homework: IconHomework,
};

const iconComponent = computed(() => icons[props.name]);
</script>

<style>
.app-icon {
  width: 20px;
  height: 20px;
}
</style>
