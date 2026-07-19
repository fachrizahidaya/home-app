<template>
  <AppLayout
    :collapsed="sidebarCollapsed"
    :items="sidebarItems"
    :user-name="userName"
    :user-initials="userInitials"
    @toggleSidebar="toggleSidebar"
    @logout="handleLogout"
  >
    <section class="homework-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Family Notes</p>
          <h1>Pekerjaan Rumah Tangga</h1>
          <p class="heading-copy">Kelola daftar pekerjaan rumah.</p>
        </div>

        <button class="primary-btn" @click="openCreate">+ Tambah Homework</button>
      </div>

      <div v-if="homeworks.length === 0" class="empty-state">Belum ada pekerjaan.</div>

      <div class="homework-grid">
        <div class="card" v-for="item in homeworks" :key="item.id">
          <h3>{{ item.title }}</h3>

          <p>
            {{ item.description }}
          </p>

          <div class="actions">
            <button @click="editHomework(item)">Edit</button>

            <button class="danger" @click="deleteHomework(item.id)">Hapus</button>
          </div>
        </div>
      </div>

      <!-- Modal -->

      <div class="modal-overlay" v-if="showModal">
        <div class="modal">
          <h2>
            {{ editingId ? "Edit Homework" : "Tambah Homework" }}
          </h2>

          <input v-model="form.title" placeholder="Judul" />

          <textarea v-model="form.description" rows="5" placeholder="Deskripsi" />

          <div class="modal-actions">
            <button @click="closeModal">Batal</button>

            <button class="primary-btn" @click="saveHomework">Simpan</button>
          </div>
        </div>
      </div>

      <div class="error-banner" v-if="errorMessage">
        {{ errorMessage }}
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "@/services/api";

import AppLayout from "@/layouts/AppLayout.vue";
import { sidebarItems } from "@/configs/sidebar";
import { useAppLayout } from "@/composables/useAppLayout";

const { sidebarCollapsed, userName, userInitials, toggleSidebar, handleLogout } =
  useAppLayout();

const homeworks = ref([]);
const showModal = ref(false);
const editingId = ref(null);

const errorMessage = ref("");

const form = reactive({
  title: "",
  description: "",
});

onMounted(() => {
  loadHomework();
});

async function loadHomework() {
  try {
    const response = await axios.get("/homework");
    homeworks.value = response.data.data;
  } catch (error) {
    console.error(error);
    errorMessage.value = "Gagal mengambil data homework.";
  }
}

function openCreate() {
  editingId.value = null;

  form.title = "";
  form.description = "";

  showModal.value = true;
}

function editHomework(item) {
  editingId.value = item.id;

  form.title = item.title;
  form.description = item.description;

  showModal.value = true;
}

function closeModal() {
  showModal.value = false;

  form.title = "";
  form.description = "";

  editingId.value = null;
}

async function saveHomework() {
  try {
    if (!form.title.trim()) {
      alert("Judul wajib diisi");
      return;
    }

    if (!form.description.trim()) {
      alert("Deskripsi wajib diisi");
      return;
    }

    if (editingId.value) {
      await axios.put(`/homework/${editingId.value}`, form);
    } else {
      await axios.post("/homework", form);
    }

    closeModal();
    loadHomework();
  } catch (error) {
    console.error(error);

    if (error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = "Gagal menyimpan homework.";
    }
  }
}

async function deleteHomework(id) {
  const confirmDelete = confirm("Yakin ingin menghapus homework?");

  if (!confirmDelete) return;

  try {
    await axios.delete(`/homework/${id}`);
    loadHomework();
  } catch (error) {
    console.error(error);
    errorMessage.value = "Gagal menghapus homework.";
  }
}
</script>

<style scoped>
.homework-page {
  padding: 32px;
}

.page-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.primary-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
}

.homework-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.08);
}

.card h3 {
  margin-bottom: 10px;
}

.card p {
  color: #666;
  min-height: 70px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.actions button {
  flex: 1;
}

.danger {
  background: #ef4444;
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  width: 500px;
  background: white;
  padding: 25px;
  border-radius: 14px;
}

.modal input,
.modal textarea {
  width: 100%;
  margin-top: 15px;
  padding: 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  color: gray;
  margin-top: 60px;
}
</style>
