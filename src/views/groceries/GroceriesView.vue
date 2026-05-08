<template>
  <AppLayout
    :collapsed="sidebarCollapsed"
    :items="sidebarItems"
    :user-name="userName"
    :user-initials="userInitials"
    @toggleSidebar="toggleSidebar"
    @logout="handleLogout"
  >
    <div></div
  ></AppLayout>
</template>

<script setup>
import { sidebarItems } from "@/configs/sidebar";

import AppLayout from "@/layouts/AppLayout.vue";
import { useAppLayout } from "@/composables/useAppLayout";

const { sidebarCollapsed, userName, userInitials, toggleSidebar, handleLogout } =
  useAppLayout();
</script>

<style scoped>
.placeholder-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.placeholder-content {
  text-align: center;
  padding: 3rem;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  color: #1a1a2e;
  margin: 0 0 0.5rem;
}

p {
  color: #6b7280;
  margin: 0;
}

.coming-soon {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  display: inline-block;
  font-size: 0.875rem;
}

.back-link {
  display: inline-block;
  margin-top: 2rem;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
