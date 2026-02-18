<template>
  <div class="login-container">
    <div class="features-preview">
      <h2>Create your smart home space</h2>
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
        <p class="tagline">Create your account to get started</p>
      </div>

      <form @submit.prevent="handleRegister" class="login-form">
        <div v-if="authStore.state.error" class="error-message">
          {{ authStore.state.error }}
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

        <!-- 🔥 USERNAME FIELD -->
        <div>
          <FormGroup
            id="username"
            label="Username"
            type="text"
            placeholder="Choose a username"
            v-model="form.username"
            :disabled="authStore.state.loading"
            required
          />

          <p v-if="usernameStatus === 'checking'" class="username-check checking">
            Checking availability...
          </p>

          <p v-if="usernameStatus === 'available'" class="username-check available">
            ✓ Username is available
          </p>

          <p v-if="usernameStatus === 'taken'" class="username-check taken">
            ✕ Username is already taken
          </p>
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

        <BaseButton
          type="submit"
          :loading="authStore.state.loading"
          :disabled="usernameStatus === 'taken' || usernameStatus === 'checking'"
        >
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
import { reactive, watch, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FormGroup from "@/components/FormGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import api from "@/services/api"; // axios instance
import "@/style/login.css";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: "",
  username: "",
  email: "",
  password: "",
  password_confirmation: "",
});

const usernameStatus = ref(null);
let debounceTimer = null;

// 🔥 Watch username with debounce
watch(
  () => form.username,
  (value) => {
    usernameStatus.value = null;

    if (!value || value.length < 3) return;

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      usernameStatus.value = "checking";
      try {
        const response = await api.post("/auth/check-username", {
          username: value,
        });

        usernameStatus.value = response.data.available ? "available" : "taken";
      } catch {
        usernameStatus.value = null;
      }
    }, 500);
  },
);

const handleRegister = async () => {
  authStore.clearError();

  if (usernameStatus.value === "taken") return;

  const result = await authStore.register(form);

  if (result.success) {
    router.push({
      path: "/verify-otp",
      query: { email: form.email },
    });
  }
};
</script>

<style scoped>
.username-check {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.username-check.available {
  color: #16a34a;
}

.username-check.taken {
  color: #dc2626;
}

.username-check.checking {
  color: #6b7280;
}
</style>
