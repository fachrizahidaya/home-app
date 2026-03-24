<template>
  <div class="otp-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Verify Email</h1>
        <p class="tagline">Enter the 6-digit code sent to your email</p>
      </div>

      <form @submit.prevent="handleVerify" class="login-form">
        <div v-if="authStore.error" class="error-message">
          {{ authStore.state.error }}
        </div>

        <FormGroup
          id="otp"
          label="OTP Code"
          type="text"
          placeholder="Enter 6-digit OTP"
          v-model="form.otp"
          required
        />

        <BaseButton type="submit" :loading="authStore.loading">Verify</BaseButton>

        <BaseButton type="button" variant="secondary" @click="handleResend"
          >Resend OTP
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FormGroup from "@/components/FormGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import "@/style/verify-otp.css";
import "@/style/login.css";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  email: route.query.email || "",
  otp: "",
});

const handleVerify = async () => {
  const result = await authStore.verifyOtp(form);

  if (result.success) {
    router.push("/dashboard");
  }
};

const handleResend = async () => {
  await authStore.resendOtp(form.email);
};
</script>
