<template>
  <div class="dashboard-layout">
    <Sidebar :collapsed="collapsed" @toggle="$emit('toggleSidebar')">
      <SidebarItem
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :label="item.label"
        :collapsed="collapsed"
      >
        <template #icon>
          <AppIcon :name="item.icon" />
        </template>
      </SidebarItem>
    </Sidebar>
    <main class="main-content">
      <Header
        :user-name="userName"
        :user-initials="userInitials"
        @logout="$emit('logout')"
      />
      <div class="dashboard-content">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import SidebarItem from "@/components/dashboard/SidebarItem.vue";
import Header from "@/components/Header.vue";
import AppIcon from "@/components/icons/AppIcon.vue";
import Sidebar from "@/components/Sidebar.vue";
import "@/style/dashboard.css";

defineProps({
  collapsed: Boolean,
  items: Array,
  userName: String,
  userInitials: String,
});
</script>
