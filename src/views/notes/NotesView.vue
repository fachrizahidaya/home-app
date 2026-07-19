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
      <!-- Header -->
      <div class="page-heading">
        <div>
          <p class="eyebrow">Family Notes</p>
          <h1>Catatan Keluarga</h1>
          <p class="heading-copy">
            Simpan catatan, pengingat, ide, dan informasi penting keluarga.
          </p>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <!-- Summary -->
      <div class="summary-grid">
        <article class="summary-card">
          <span>Total Catatan</span>
          <strong>{{ notes.length }}</strong>
        </article>
      </div>

      <!-- Form + List -->
      <div class="content-grid">
        <!-- Form -->
        <form class="panel" @submit.prevent="saveNote">
          <div class="panel-title">
            <div>
              <p class="eyebrow">
                {{ editingId ? "Update" : "Input" }}
              </p>

              <h2>
                {{ editingId ? "Update Catatan" : "Catatan Baru" }}
              </h2>
            </div>
          </div>

          <div class="form-grid single">
            <label class="field">
              <span>Judul</span>
              <input
                v-model="form.title"
                type="text"
                placeholder="Masukkan judul catatan"
                required
              />
            </label>

            <label class="field">
              <span>Isi Catatan</span>
              <textarea
                v-model="form.content"
                rows="8"
                placeholder="Tulis catatan..."
                required
              />
            </label>
          </div>

          <div class="form-footer">
            <div class="button-group">
              <button
                v-if="editingId"
                type="button"
                class="secondary-button"
                @click="resetForm"
              >
                Batal
              </button>

              <button class="primary-button" type="submit" :disabled="isSaving">
                {{
                  isSaving
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Update"
                      : "Simpan Catatan"
                }}
              </button>
            </div>
          </div>
        </form>

        <!-- List -->
        <section class="notes-panel">
          <div class="section-heading">
            <h2>Daftar Catatan</h2>
          </div>

          <div v-if="notes.length">
            <div
              v-for="note in notes"
              :key="note.id"
              style="border: 1px solid #ccc; padding: 12px; margin-bottom: 12px"
            >
              <h3>{{ note.title }}</h3>

              <p>{{ note.content }}</p>

              <small>{{ note.updated_at }}</small>
            </div>
          </div>

          <div v-else>Tidak ada data</div>
        </section>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { useAppLayout } from "@/composables/useAppLayout";
import { sidebarItems } from "@/configs/sidebar";
import AppLayout from "@/layouts/AppLayout.vue";
import notesService from "@/services/notes";
import { computed, onMounted, reactive, ref, watch } from "vue";

const notes = ref([]);

const editingId = ref(null);

const form = reactive({
  title: "",
  content: "",
});

const isSaving = ref(false);
const errorMessage = ref("");

const { sidebarCollapsed, userName, userInitials, toggleSidebar, handleLogout } =
  useAppLayout();

const todayNotesCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10);

  return notes.value.filter((note) => note.created_at?.slice(0, 10) === today).length;
});

const latestUpdateLabel = computed(() => {
  if (!notes.value.length) return "-";

  return formatDate(notes.value[0].updated_at);
});

async function loadNotes() {
  try {
    errorMessage.value = "";

    const data = await notesService.getNotes();
    console.log(data);

    notes.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(error);

    errorMessage.value = "Gagal memuat catatan.";

    notes.value = [];
  }
}

async function saveNote() {
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
}

function editNote(note) {
  editingId.value = note.id;

  Object.assign(form, {
    title: note.title,
    content: note.content,
  });
}

async function deleteNote(id) {
  await notesService.deleteNote(id);
  await loadNotes();
}

function resetForm() {
  editingId.value = null;

  Object.assign(form, {
    title: "",
    content: "",
  });
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parseDateInput(value));
}

onMounted(() => {
  loadNotes();
});
</script>

<style scoped>
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 1rem 1.2rem;
  transition: 0.25s;
  background: white;
}

.note-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
}

.note-card h3 {
  margin: 0;
  font-size: 1.05rem;
  color: #0f172a;
}

.note-card-top {
  margin-bottom: 0.75rem;
}

.note-card p {
  margin: 0.75rem 0;
  color: #64748b;
  line-height: 1.6;

  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-card small {
  display: block;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.note-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-start;
  flex-wrap: wrap;
}

.note-actions button {
  min-height: 2.5rem;
  padding: 0 1rem;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
  color: #0f766e;
  background: #ecfdf5;
  transition: all 0.2s ease;
}

.note-actions button:hover {
  background: #d1fae5;
}

.note-actions .danger-button {
  color: #b91c1c;
  background: #fee2e2;
}

.note-actions .danger-button:hover {
  background: #fecaca;
}

textarea {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font: inherit;
}

.notes-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 1.5rem;
  align-items: start;
}

.panel,
.notes-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 1.5rem;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}

.panel-title,
.section-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.panel-title h2,
.section-heading h2 {
  margin: 0.25rem 0 0;
}

.section-heading span {
  font-size: 0.9rem;
  color: #64748b;
}

.form-grid {
  display: grid;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field span {
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  padding: 0.9rem 1rem;
  font: inherit;
  transition: 0.2s;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.field textarea {
  resize: vertical;
  min-height: 220px;
}

.form-footer {
  margin-top: 1.5rem;
}

.button-group {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
</style>
