<template>
  <div class="login-container">
    <div class="login-image">
      <img src="/src/assets/image/login.jpg" alt="Login Image" />
    </div>
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome Back</h1>
        <p class="tagline">Please enter your details to manage your home</p>
      </div>

      <form @submit.prevent.stop="handleLogin" class="login-form">
        <div v-if="authStore.state.error" class="error-message">
          {{ authStore.state.error }}
        </div>

        <div v-else-if="authStore.state.successMessage" class="success-message">
          {{ authStore.state.successMessage }}
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
          <!-- <label class="checkbox-label">
            <input type="checkbox" v-model="form.remember" />
            <span>Remember me</span>
          </label> -->
          <a href="#" @click.prevent class="forgot-link">Forgot password?</a>
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

let errorTimeout = null;

const form = reactive({
  email: "",
  password: "",
  remember: false,
});

const handleLogin = async () => {
  authStore.clearError();

  if (errorTimeout) clearTimeout(errorTimeout);

  const result = await authStore.login({
    email: form.email,
    password: form.password,
    remember: form.remember,
  });

  if (result.success) {
    const redirectPath = route.query.redirect || "/dashboard";
    router.push(redirectPath);
    return;
  }

  if (result.requiresVerification) {
    router.push({
      path: "/verify-otp",
      query: { email: result.email },
    });
    return;
  }

  errorTimeout = setTimeout(() => {
    authStore.clearError();
  }, 3000);
};
</script>
