import { useAuthStore } from "@/stores/auth";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

export function useAppLayout() {
  const router = useRouter();
  const authStore = useAuthStore();

  const sidebarCollapsed = ref(false);
  const showUserMenu = ref(false);

  const userName = computed(() => {
    return authStore.state.user?.name || "User";
  });

  const userInitials = computed(() => {
    const name = authStore.state.user?.name || "U";

    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  });

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const handleLogout = async () => {
    await authStore.logout();
    router.push("/login");
  };

  const handleClickOutside = (e) => {
    if (!e.target.closest(".user-menu")) {
      showUserMenu.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener("click", handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });

  return {
    sidebarCollapsed,
    showUserMenu,
    userName,
    userInitials,
    toggleSidebar,
    handleLogout,
  };
}
