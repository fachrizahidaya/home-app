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

        <button class="ghost-button" type="button" @click="resetForm">
          Catatan Baru
        </button>
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

        <article class="summary-card">
          <span>Catatan Hari Ini</span>
          <strong>{{ todayNotesCount }}</strong>
        </article>

        <article class="summary-card">
          <span>Terakhir Diupdate</span>
          <strong>{{ latestUpdateLabel }}</strong>
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
            <span>{{ notes.length }} catatan</span>
          </div>

          <div v-if="notes.length" class="notes-list">
            <article v-for="note in notes" :key="note.id" class="note-card">
              <div class="note-card-top">
                <div>
                  <h3>{{ note.title }}</h3>

                  <p>
                    {{ truncate(note.content, 120) }}
                  </p>
                </div>
              </div>

              <small>
                {{ formatDate(note.updated_at) }}
              </small>

              <div class="note-actions">
                <button type="button" @click="editNote(note)">Edit</button>

                <button type="button" class="danger-button" @click="deleteNote(note.id)">
                  Hapus
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <strong>Belum ada catatan.</strong>
            <p>Buat catatan pertama Anda.</p>
          </div>
        </section>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { sidebarItems } from "@/configs/sidebar";
import AppLayout from "@/layouts/AppLayout.vue";
import { reactive, ref } from "vue";

const notes = ref([]);

const editingId = ref(null);

const form = reactive({
  title: "",
  content: "",
});

const isSaving = ref(false);
const errorMessage = ref("");

async function loadNotes() {
  notes.value = await notesService.getAll();
}

async function saveNote() {
  const payload = {
    title: form.title,
    content: form.content,
  };

  if (editingId.value) {
    await notesService.update(editingId.value, payload);
  } else {
    await notesService.create(payload);
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
  await notesService.delete(id);
  await loadNotes();
}

function resetForm() {
  editingId.value = null;

  Object.assign(form, {
    title: "",
    content: "",
  });
}
</script>

<style scoped>
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-card {
  padding: 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.note-card-top {
  margin-bottom: 0.75rem;
}

.note-card p {
  margin-top: 0.5rem;
  color: #64748b;
}

.note-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

textarea {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  resize: vertical;
  font: inherit;
}
</style>
