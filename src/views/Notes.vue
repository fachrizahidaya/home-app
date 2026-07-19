<template>
  <AppLayout
    :collapsed="sidebarCollapsed"
    :items="sidebarItems"
    :user-name="userName"
    :user-initials="userInitials"
    @toggleSidebar="toggleSidebar"
    @logout="handleLogout"
  >
    <section class="notes-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Family Notes</p>
          <h1>Catatan Keluarga</h1>
          <p class="heading-copy">Simpan catatan penting keluarga.</p>
        </div>
      </div>

      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <div class="summary-card">
        <span>Total Catatan</span>
        <strong>{{ notes.length }}</strong>
      </div>

      <div class="content-grid">
        <form class="panel" @submit.prevent="saveNote">
          <h2>{{ editingId ? "Edit Catatan" : "Tambah Catatan" }}</h2>

          <label class="field">
            <span>Judul</span>
            <input v-model="form.title" placeholder="Masukkan judul" required />
          </label>

          <label class="field">
            <span>Isi Catatan</span>
            <textarea
              v-model="form.content"
              rows="10"
              placeholder="Tulis catatan..."
              required
            />
          </label>

          <div class="button-group">
            <button
              v-if="editingId"
              type="button"
              class="secondary-button"
              @click="resetForm"
            >
              Batal
            </button>

            <button class="primary-button" :disabled="isSaving">
              {{ isSaving ? "Menyimpan..." : editingId ? "Update" : "Simpan" }}
            </button>
          </div>
        </form>

        <section class="panel">
          <h2>Daftar Catatan</h2>

          <div v-if="loading" class="empty">Memuat data...</div>

          <div v-else-if="notes.length" class="notes-list">
            <div class="note-card" v-for="note in notes" :key="note.id">
              <div class="note-header">
                <h3>{{ note.title }}</h3>

                <small>{{ formatDate(note.updated_at) }}</small>
              </div>

              <p>{{ note.content }}</p>

              <div class="note-actions">
                <button class="edit-button" @click="editNote(note)">Edit</button>

                <button class="delete-button" @click="deleteNote(note.id)">Hapus</button>
              </div>
            </div>
          </div>

          <div v-else class="empty">Belum ada catatan.</div>
        </section>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import { sidebarItems } from "@/configs/sidebar";
import { useAppLayout } from "@/composables/useAppLayout";
import notesService from "@/services/notes";

const { sidebarCollapsed, userName, userInitials, toggleSidebar, handleLogout } =
  useAppLayout();

const notes = ref([]);
const loading = ref(false);
const isSaving = ref(false);
const editingId = ref(null);
const errorMessage = ref("");

const form = reactive({
  title: "",
  content: "",
});

onMounted(loadNotes);

async function loadNotes() {
  loading.value = true;
  errorMessage.value = "";

  try {
    notes.value = await notesService.getNotes();
  } catch (e) {
    console.error(e);
    errorMessage.value = "Gagal memuat catatan.";
    notes.value = [];
  } finally {
    loading.value = false;
  }
}

async function saveNote() {
  isSaving.value = true;

  try {
    const payload = {
      title: form.title,
      content: form.content,
    };

    if (editingId.value) {
      await notesService.updateNote(editingId.value, payload);
    } else {
      await notesService.createNote(payload);
    }

    resetForm();
    await loadNotes();
  } catch (e) {
    console.error(e);
    errorMessage.value = "Gagal menyimpan catatan.";
  } finally {
    isSaving.value = false;
  }
}

function editNote(note) {
  editingId.value = note.id;
  form.title = note.title;
  form.content = note.content;
}

async function deleteNote(id) {
  if (!confirm("Hapus catatan ini?")) return;

  try {
    await notesService.deleteNote(id);

    if (editingId.value === id) {
      resetForm();
    }

    await loadNotes();
  } catch (e) {
    console.error(e);
    errorMessage.value = "Gagal menghapus catatan.";
  }
}

function resetForm() {
  editingId.value = null;
  form.title = "";
  form.content = "";
}

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
.notes-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.summary-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  padding: 16px;
  border-radius: 14px;
  width: 220px;
}
.summary-card strong {
  display: block;
  font-size: 30px;
  margin-top: 8px;
}
.content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 24px;
}
.panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
}
.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  gap: 8px;
}
.field input,
.field textarea {
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font: inherit;
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
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.note-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
}
.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.note-card p {
  white-space: pre-wrap;
  color: #475569;
  margin: 12px 0;
}
.note-actions {
  display: flex;
  gap: 8px;
}
.empty {
  text-align: center;
  padding: 40px;
  color: #64748b;
}
.error-banner {
  background: #fee2e2;
  color: #b91c1c;
  padding: 12px;
  border-radius: 8px;
}
@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
