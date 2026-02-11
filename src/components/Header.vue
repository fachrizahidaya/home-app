<template>
  <header class="main-header">
    <div class="header-left">
      <h1>Welcome back, {{ userName }}!</h1>
      <p>{{ subtitle }}</p>
    </div>

    <div class="header-right">
      <div class="user-menu" @click="toggleMenu">
        <div class="user-avatar">
          {{ userInitials }}
        </div>

        <div v-if="showMenu" class="user-dropdown">
          <button @click.stop="$emit('logout')" class="dropdown-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z"
                clip-rule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  userName: { type: String, required: true },
  userInitials: { type: String, required: true },
  subtitle: {
    type: String,
    default: "Here's what's happening in your home today.",
  },
});

defineEmits(["logout"]);

const showMenu = ref(false);
const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};
</script>

<style scoped>
/* 🔥 move ALL header-related CSS here */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-left h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.header-left p {
  color: #6b7280;
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  z-index: 100;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: #f3f4f6;
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
}

@media (max-width: 768px) {
  .main-header {
    padding: 1rem;
  }
}
</style>
