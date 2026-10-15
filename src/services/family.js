import api from "./api";

export const familyService = {
  async getMyFamily() {
    const response = await api.get("/family");

    return response.data.data ?? [];
  },

  async inviteMember(email) {
    const response = await api.post("/family", email);

    return response.data.data;
  },

  async removeMember(id) {
    const response = await api.delete(`/family/${id}`);

    return response.data.data;
  },

  async acceptInvitation(id) {
    const response = await api.delete(`/family/${id}`);

    return response.data.data;
  },
};

export default familyService;
