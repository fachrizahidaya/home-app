<template>
  <AppLayout
    :collapsed="sidebarCollapsed"
    :items="sidebarItems"
    :user-name="userName"
    :user-initials="userInitials"
    @toggleSidebar="toggleSidebar"
    @logout="handleLogout"
  >
    <div class="stats-grid">
      <StatCard
        v-for="stat in stats"
        :key="stat.type"
        :title="stat.title"
        :value="stat.value"
        :label="stat.label"
        :type="stat.type"
      >
        <template #icon>
          <svg
            v-if="stat.icon === 'groceries'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"
            />
          </svg>

          <svg
            v-else-if="stat.icon === 'notes'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 017.5 15zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z"
              clip-rule="evenodd"
            />
            <path
              d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z"
            />
          </svg>

          <svg
            v-else-if="stat.icon === 'homework'"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M11.7 2.805a.75.75 0 01.6 0A60.65 60.65 0 0122.83 8.72a.75.75 0 01-.231 1.337 49.949 49.949 0 00-9.902 3.912l-.003.002-.34.18a.75.75 0 01-.707 0A50.009 50.009 0 007.5 12.174v-.224c0-.131.067-.248.172-.311a54.614 54.614 0 014.653-2.52.75.75 0 00-.65-1.352 56.129 56.129 0 00-4.78 2.589 1.858 1.858 0 00-.859 1.228 49.803 49.803 0 00-4.634-1.527.75.75 0 01-.231-1.337A60.653 60.653 0 0111.7 2.805z"
            />
            <path
              d="M13.06 15.473a48.45 48.45 0 017.666-3.282c.134 1.414.22 2.843.255 4.285a.75.75 0 01-.46.71 47.878 47.878 0 00-8.105 4.342.75.75 0 01-.832 0 47.877 47.877 0 00-8.104-4.342.75.75 0 01-.461-.71c.035-1.442.121-2.87.255-4.286A48.4 48.4 0 016 13.18v1.27a1.5 1.5 0 00-.14 2.508c-.09.38-.222.753-.397 1.11.452.213.901.434 1.346.661a6.729 6.729 0 00.551-1.608 1.5 1.5 0 00.14-2.67v-.645a48.549 48.549 0 013.44 1.668 2.25 2.25 0 002.12 0z"
            />
          </svg>
        </template>
      </StatCard>
    </div>
    <!-- Quick Actions -->
    <section class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <ActionCard
          v-for="(action, index) in quickActions"
          :key="index"
          :to="action.to"
          :label="action.label"
        >
          <template #icon>
            {{ action.icon }}
          </template>
        </ActionCard>
      </div>
    </section>

    <!-- Recent Activity -->
    <section class="recent-activity">
      <h2>Recent Activity</h2>
      <div class="activity-list">
        <ActivityItem
          v-for="(activity, index) in recentActivities"
          :key="index"
          :text="activity.text"
          :time="activity.time"
          :type="activity.type"
        >
          <template #icon>
            {{ activity.icon }}
          </template>
        </ActivityItem>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import ActivityItem from "@/components/dashboard/ActivityItem.vue";
import StatCard from "@/components/dashboard/StatCard.vue";
import ActionCard from "@/components/dashboard/ActionCard.vue";
import "@/style/dashboard.css";
import AppLayout from "@/layouts/AppLayout.vue";
import { sidebarItems } from "@/configs/sidebar";
import { useAppLayout } from "@/composables/useAppLayout";

const stats = [
  {
    title: "Groceries",
    value: "12 items",
    label: "in shopping list",
    type: "groceries",
    icon: "groceries",
  },
  {
    title: "Notes",
    value: "8 notes",
    label: "active notes",
    type: "notes",
    icon: "notes",
  },
  {
    title: "Homework",
    value: "5 tasks",
    label: "pending tasks",
    type: "homework",
    icon: "homework",
  },
];

const recentActivities = [
  {
    text: 'Added "Milk" to groceries',
    time: "2 hours ago",
    type: "groceries",
    icon: "🛒",
  },
  {
    text: 'Created note "Meeting reminder"',
    time: "Yesterday",
    type: "notes",
    icon: "📝",
  },
  {
    text: 'Completed "Math assignment"',
    time: "2 days ago",
    type: "homework",
    icon: "📚",
  },
];

const quickActions = [
  {
    to: "/groceries",
    label: "Add Grocery Item",
    icon: "🛒",
  },
  {
    to: "/notes",
    label: "Create Note",
    icon: "📝",
  },
  {
    to: "/homework",
    label: "Add Homework",
    icon: "📚",
  },
];

const { sidebarCollapsed, userName, userInitials, toggleSidebar, handleLogout } =
  useAppLayout();
</script>

<style scoped></style>
