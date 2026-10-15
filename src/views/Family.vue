<template>
  <AppLayout
    :collapsed="sidebarCollapsed"
    :items="sidebarItems"
    :user-name="userName"
    :user-initials="userInitials"
    @toggleSidebar="toggleSidebar"
    @logout="handleLogout"
  >
    <section class="family-page">
      <div class="page-header">
        <h1>Family</h1>
        <p>Kelola keluarga kamu</p>
      </div>
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>
      <div v-if="successMessage" class="success-banner">
        {{ successMessage }}
      </div>
      <div v-if="loading" class="panel loading">
        <div class="loading-spinner"></div>
        <span>Memuat data family...</span>
      </div>

      <div v-else-if="!family" class="panel empty">
        <div class="empty-icon">
          <h2>Belum tergabung dalam family</h2>
          <p>Kamu belum tergabung dalam family</p>
        </div>
      </div>

      <template v-else>
        <div class="summary-card">
          <div class="summary-info">
            <span class="summary-label"> Family </span>
            <h2>
              {{ family.name }}
            </h2>
            <span class="role-badge">
              {{ currentMembership?.role || "-" }}
            </span>
          </div>
          <div class="summary-member">
            <span>Total Members</span>
            <strong>{{ members?.length }}</strong>
          </div>
        </div>
        <div class="content-grid">
          <div class="left-column">
            <div v-if="isOwner" class="panel">
              <div class="panel-header">
                <h3>Invite Member</h3>
                <p>Undang anggota baru melalui email</p>
              </div>
            </div>
            <form @submit.prevent="handleInvite">
              <div class="field">
                <label for="invite-email"> Email </label>
                <input
                  id="invite-email"
                  v-model="inviteEmail"
                  type="email"
                  placeholder="email@example.com"
                  :disabled="inviting"
                />
              </div>
              <div class="button-group">
                <button
                  type="submit"
                  class="primary-button"
                  :disabled="inviting || !inviteEmail.trim()"
                >
                  {{ inviting ? "Mengirim" : "Invite Member" }}
                </button>
              </div>
            </form>
          </div>
          <div v-if="isOwner" class="panel">
            <div class="panel-header">
              <div>
                <h3>Pending Invitations</h3>
                <p>Invitation yang belum diterima</p>
              </div>
            </div>
            <div v-if="pendingInvitations?.length === 0" class="empty-small">
              Tidak ada invitation pending
            </div>
            <div v-else class="invitation-list">
              <div
                v-for="invitation in pendingInvitations"
                :key="invitation?.id"
                class="invitation-item"
              >
                <div class="invitation-info">
                  <strong>
                    {{ invitation?.email }}
                  </strong>
                  <span>Expired: {{ formatDate(invitation.expires_at) }}</span>
                </div>
                <span class="status-badge">
                  {{ invitation?.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="panel members-panel">
          <div class="panel-header">
            <div>
              <h3>Family Members</h3>
              <p>Daftar anggota yang tergabung dalam family</p>
            </div>
            <span class="member-count">
              {{ members?.length }}
            </span>
          </div>
          <div v-if="members.length === 0" class="empty-small">
            Belum ada anggota family
          </div>
          <div v-else class="members-list">
            <div v-for="member in members" :key="member?.id" class="member-item">
              <div class="member-info">
                <div class="avatar">
                  {{ getInitial(member?.user?.name) }}
                </div>
                <div class="member-detail">
                  <strong>
                    {{ member?.user?.name || "-" }}
                  </strong>
                  <span>
                    {{ member.user?.email || "-" }}
                  </span>
                  <small>
                    Bergabung:
                    {{ formatDate(member.joined_at) }}
                  </small>
                </div>
              </div>
              <div class="member-actions">
                <span
                  class="role-badge"
                  :class="{
                    owner: member.role === 'owner',
                    member: member.role === 'member',
                  }"
                >
                  {{ member.role }}
                </span>
                <button
                  v-if="isOwner && member.role !== 'owner'"
                  type="button"
                  class="delete-button"
                  :disabled="removingMemberId === member.id"
                  @click="handleRemoveMember(member)"
                >
                  {{ removingMemberId === member.id ? "Menghapus..." : "Remove" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import { sidebarItems } from "@/configs/sidebar";
import { useAppLayout } from "@/composables/useAppLayout";
import { familyService } from "@/services/family";

const { sidebarCollapsed, userName, userInitials, toggleSidebar, handleLogout } =
  useAppLayout();

const family = ref([]);
const members = ref([]);
const currentMembership = ref(null);
const pendingInvitations = ref([]);
const inviteEmail = ref("");

const loading = ref(false);
const inviting = ref(false);
const isSaving = ref(false);
const removingMemberId = ref(null);
const editingId = ref(null);
const errorMessage = ref("");
const successMessage = ref("");

const isOwner = computed(() => {
  return currentMembership.value?.role === "owner";
});

async function loadFamily() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await familyService.getMyFamily();
    family.value = response.family ?? null;
    currentMembership.value = response.current_membership ?? null;
    members.value = response.members ?? [];
    pendingInvitations.value = response.invitations ?? [];
  } catch (error) {
    console.error(e);
    errorMessage.value = error.response?.data?.message || "Gagal mengambil data";
  } finally {
    loading.value = false;
  }
}

const form = reactive({
  title: "",
  content: "",
});

async function handleInvite() {
  if (!inviteEmail.value) {
    return;
  }

  inviting.value = true;

  errorMessage.value = "";
  successMessage.value = "";

  try {
    await familyService.inviteMember(inviteEmail.value);
    successMessage.value = "Invitation berhasil dikirim";
    inviteEmail.value = "";
    await loadFamily();
  } catch (error) {
    console.error(error);
    errorMessage.value = error.response?.data?.message || "Gagal mengirim invitation";
  } finally {
    inviting.value = false;
  }
}

async function handleRemoveMember(member) {
  const confirmed = window.confirm(`Hapus ${member.user?.name} dari family?`);

  if (!confirmed) {
    return;
  }

  removingMemberId.value = member.div;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    await familyService.removeMember(member.id);

    successMessage.value = "Member berhasil dihapus";
    await loadFamily();
  } catch (error) {
    console.error;
    errorMessage.value = error.response?.data?.message || "Gagal menghapus member";
  } finally {
    removingMemberId.value = null;
  }
}

function getInitial(name) {
  if (!name) {
    return "?";
  }

  return name.chrAt(0).toUpperCase();
}

onMounted(loadFamily);

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
</script>

<style scoped>
.family-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}
.page-header p {
  margin: 6px 0 0;
  color: #64748b;
}
.summary-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 16px;
  border-radius: 14px;
}
.summary-card strong {
  display: block;
  font-size: 30px;
  margin-top: 8px;
}
.summary-label {
  display: block;
  color: #64748b;
  font-size: 13px;
  margin-bottom: 5px;
}
.summary-info h2 {
  margin: 0 0 10px;
  font-size: 24px;
}
.summary-member {
  text-align: right;
}
.summary-member span {
  display: block;
  color: #64748b;
  font-size: 13px;
}
.summary-member strong {
  display: block;
  margin-top: 4px;
  font-size: 30px;
}

.content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
}
.left-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.panel-header h3 {
  margin: 0;
  font-size: 8px;
}
.panel-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 14px;
}
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  gap: 8px;
}
.field label {
  font-size: 14px;
  font-weight: 600;
}
.field input,
.field textarea {
  width: 100%;
  box-sizing: border-box;

  padding: 11px 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
}
.field input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgb(37, 99, 235 / 10%);
}
.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.primary-button,
.secondary-button,
.edit-button,
.delete-button {
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}
.primary-button,
.edit-button {
  background: #2563eb;
  color: #fff;
}
.secondary-button {
  background: #e5e7eb;
}
.delete-button {
  background: #dc2626;
  color: #fff;
}

.primary-button:hover {
  background: #1d4ed8;
}
.delete-button:hover {
  background: #fecaca;
}
.primary-button:disabled,
.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-banner,
.success-banner {
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
}
.error-banner {
  background: #fee2e2;
  color: #b91c1c;
}
.success-banner {
  background: #dcfce7;
  color: #b91c1c;
}
@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
.member-count {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  font-size: 13px;
  font-weight: 600;
}
.members-list {
  display: flex;
  flex-direction: column;
}
.member-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}
.member-item:last-child {
  border-bottom: none;
}
.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.member-detail {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.member-detail strong {
  font-size: 14px;
}
.member-detail span {
  margin-top: 3px;
  color: #64748b;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.member-detail small {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 11px;
}
.member-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
}
.role-badge,
.status_badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}
.role-badge {
  background: #f1f5f9;
  color: #475569;
}
.role-badge.owner {
  background: #fef3c7;
  color: #92400e;
}
.role-badge.member {
  background: #eff6ff;
  color: #1d4ed8;
}
.invitation-list {
  display: flex;
  flex-direction: column;
}
.invitation-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.invitation-item:last-child {
  border-bottom: none;
}
.invitation-info strong {
  display: block;
  font-size: 14px;
}
.invitation-info span {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}
.status_badge {
  background: #fef3c7;
  color: #92400e;
}
.empty {
  text-align: center;
  padding: 60px 20px;
}
.empty-icon {
  font-size: 42px;
  margin-bottom: 12px;
}
.empty h2 {
  margin: 0;
  font-size: 20px;
}
.empty p {
  color: #64748b;
}
.empty-small {
  padding: 20px 0;
  color: #64748b;
  text-align: center;
  font-size: 14px;
}
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 150px;
  color: #64748b;
}
.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .family-page {
    gap: 16px;
  }
  .summary-card {
    flex-direction: column;
  }
  .summary-member {
    width: 100%;
    text-align: left;
  }
  .member-item {
    align-items: flex-start;
    flex-direction: column;
  }
  .member-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .invitation-item {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
