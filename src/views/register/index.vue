<template>
  <div class="login-container">
    <div class="login-image">
      <img src="/src/assets/image/register.jpg" alt="Login Image" />
    </div>
    <div class="login-card">
      <div class="login-header">
        <h1>HomeSync</h1>
        <p class="tagline">Create your account to get started</p>
      </div>

      <form @submit.prevent="handleRegister" class="login-form">
        <div v-if="authStore.state.error" class="error-message">
          {{ authStore.state.error }}
        </div>

        <div v-else-if="authStore.state.successMessage" class="success-message">
          {{ authStore.state.successMessage }}
        </div>

        <FormGroup
          id="name"
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          v-model="form.name"
          :disabled="authStore.state.loading"
          required
        />

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
          placeholder="Create a password"
          v-model="form.password"
          :disabled="authStore.state.loading"
          required
        />

        <FormGroup
          id="password_confirmation"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          v-model="form.password_confirmation"
          :disabled="authStore.state.loading"
          required
        />
        <p
          v-if="isPasswordFilled"
          :class="['password-check', isPasswordMatch ? 'match' : 'not-match']"
        >
          {{ isPasswordMatch ? "✓ Passwords match" : "✕ Passwords do not match" }}
        </p>

        <BaseButton type="submit" :loading="authStore.state.loading" :disabled="false">
          Create Account
        </BaseButton>
      </form>

      <div class="login-footer">
        <p>
          Already have an account?
          <router-link to="/login">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FormGroup from "@/components/FormGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import "@/style/login.css";
import "@/style/register.css";

const router = useRouter();
const authStore = useAuthStore();

let errorTimeout = null;

const form = reactive({
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const isPasswordMatch = computed(() => {
  return (
    form.password &&
    form.password_confirmation &&
    form.password === form.password_confirmation
  );
});

const isPasswordFilled = computed(() => {
  return form.password && form.password_confirmation;
});

const handleRegister = async () => {
  authStore.clearError();

  if (!isPasswordMatch.value) {
    authStore.state.error = "Passwords do not match";
    return;
  }

  if (errorTimeout) clearTimeout(errorTimeout);

  const result = await authStore.register(form);

  if (result.success) {
    router.push({
      path: "/verify-otp",
      query: { email: form.email },
    });
  }

  errorTimeout = setTimeout(() => {
    authStore.clearError();
  }, 3000);
};
</script>
