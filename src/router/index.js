import { createRouter, createWebHistory } from "vue-router";
import authService from "@/services/auth";

// Views
import LoginView from "@/views/login/index.vue";
import DashboardView from "@/views/dashboard/index.vue";
import RegisterView from "@/views/register/index.vue";
import VerifyOtpView from "@/views/dashboard/VerifyOtpView.vue";

const routes = [
  {
    path: "/",
    redirect: "/dashboard",
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    meta: { requiresGuest: true },
  },
  {
    path: "/verify-otp",
    name: "Verify OTP",
    component: VerifyOtpView,
    meta: { requiresGuest: true },
  },

  {
    path: "/dashboard",
    name: "Dashboard",
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  // Future routes for HomeSync features
  {
    path: "/groceries",
    name: "Groceries",
    component: () => import("@/views/GroceriesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/notes",
    name: "Notes",
    component: () => import("@/views/NotesView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/homework",
    name: "Homework",
    component: () => import("@/views/HomeworkView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: "Dashboard" });
  } else {
    next();
  }
});

export default router;
