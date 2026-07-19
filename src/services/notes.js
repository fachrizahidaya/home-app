import api from "./api";

export const notesService = {
  async getNotes() {
    const response = await api.get("/notes");

    return response.data.data ?? [];
  },

  async createNote(payload) {
    const response = await api.post("/notes", payload);
    return response.data.data;
  },

  async updateNote(noteId, payload) {
    const response = await api.put(`/notes/${noteId}`, payload);
    return response.data.data;
  },

  async deleteNote(noteId) {
    const response = await api.delete(`/notes/${noteId}`);
    return response.data;
  },
};

export default notesService;
