<template>
  <div class="otp-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Verify Email</h1>
        <p class="tagline">Enter the 6-digit code sent to your email</p>
      </div>

      <form @submit.prevent.stop="handleVerify" class="login-form">
        <div v-if="authStore.state.error" class="error-message">
          {{ authStore.state.error }}
        </div>

        <div v-else-if="authStore.state.successMessage" class="success-message">
          {{ authStore.state.successMessage }}
        </div>

        <FormGroup
          id="otp"
          label="OTP Code"
          type="text"
          placeholder="Enter 6-digit OTP"
          v-model="form.otp"
          required
        />

        <BaseButton type="submit" :loading="verifyLoading"> Verify </BaseButton>

        <BaseButton
          type="button"
          :loading="resendLoading"
          variant="secondary"
          @click="handleResend"
          :disabled="remainingTime > 0 || resendLoading"
        >
          <span v-if="remainingTime > 0">Resend in {{ formatTime() }}</span>
          <span v-else>Resend OTP</span>
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import FormGroup from "@/components/FormGroup.vue";
import BaseButton from "@/components/BaseButton.vue";
import "@/style/verify-otp.css";
import "@/style/login.css";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const COUNTDOWN_DURATION = 90;
let messageTimeout = null;
let errorTimeout = null;
const verifyLoading = ref(false);
const resendLoading = ref(false);

const form = reactive({
  email: route.query.email || "",
  otp: "",
});

const remainingTime = ref(0);
let timer = null;

const startCountdown = (seconds) => {
  remainingTime.value = seconds;

  localStorage.setItem("otp_expired_at", Date.now() + seconds * 1000);

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      clearInterval(timer);
    }
  }, 1000);
};

const restoreCountdown = () => {
  const expiredAt = localStorage.getItem("otp_expired_at");

  if (expiredAt) {
    const diff = Math.floor((expiredAt - Date.now()) / 1000);
    if (diff > 0) {
      startCountdown(diff);
    }
  } else {
    startCountdown(COUNTDOWN_DURATION);
  }
};

onMounted(() => {
  restoreCountdown();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const formatTime = () => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const handleVerify = async () => {
  authStore.clearError();
  authStore.clearSuccess();

  if (errorTimeout) clearTimeout(errorTimeout);

  verifyLoading.value = true;

  try {
    const result = await authStore.verifyOtp({
      email: form.email,
      otp: form.otp,
    });

    if (result.success) {
      router.push("/login");
    } else {
      errorTimeout = setTimeout(() => {
        authStore.clearError();
      }, 3000);
    }
  } finally {
    verifyLoading.value = false;
  }
};

const handleResend = async () => {
  authStore.clearError();
  authStore.clearSuccess();

  if (messageTimeout) clearTimeout(messageTimeout);

  resendLoading.value = true;

  try {
    const result = await authStore.resendOtp(form.email);

    if (result.success) {
      startCountdown(COUNTDOWN_DURATION);

      messageTimeout = setTimeout(() => {
        authStore.clearSuccess();
      }, 3000);
    }
  } finally {
    resendLoading.value = false;
  }
};
</script>
