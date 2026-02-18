<template>
  <div class="login-container">
    <div class="features-preview">
      <h2>Manage your home with ease</h2>
      <ul class="features-list">
        <li>🛒 Track groceries & shopping lists</li>
        <li>📝 Organize family notes</li>
        <li>📚 Manage homework tasks</li>
      </ul>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="logo-icon"
          >
            <path
              d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z"
            />
            <path
              d="M12 5.432l8.159 8.159v6.284c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625A1.875 1.875 0 013.75 19.125v-6.284L12 5.432z"
            />
          </svg>
        </div>
        <h1>HomeSync</h1>
        <p class="tagline">Your smart home management companion</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="authStore.state.error" class="error-message">
          {{ authStore.state.error }}
        </div>

        <FormGroup
          id="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          v-model="form.email"
          :disabled="authStore.state.loading"
          required
        />

        <FormGroup
          id="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          v-model="form.password"
          :disabled="authStore.state.loading"
          required
        />

        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.remember" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>

        <BaseButton type="submit" :loading="authStore.state.loading">
          Sign In
        </BaseButton>
      </form>

      <div class="login-footer">
        <p>
          Don't have an account?
          <router-link to="/register">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FormGroup from "@/components/FormGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import "@/style/login.css";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  email: "",
  password: "",
  remember: false,
});

const handleLogin = async () => {
  authStore.clearError();

  const result = await authStore.login({
    email: form.email,
    password: form.password,
    remember: form.remember,
  });

  if (result.success) {
    const redirectPath = route.query.redirect || "/dashboard";
    router.push(redirectPath);
  }
};
</script>

<style scoped>
.feature-icon {
  font-size: 1.5rem;
}
</style>
