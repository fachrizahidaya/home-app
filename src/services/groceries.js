import api from "./api";

const normalizeResponse = (response) => response.data?.data || response.data;

const mapBudgetPayload = (payload) => ({
  title: payload.title,
  budget_amount: payload.budget_amount,
  period_start: payload.period_start,
  period_end: payload.period_end,
});

const mapExpensePayload = (payload) => ({
  name: payload.name,
  expense_date: payload.date,
  amount: payload.amount,
});

export const groceriesService = {
  async getBudgets() {
    const response = await api.get("/groceries/budgets");
    return normalizeResponse(response);
  },

  async createBudget(payload) {
    const response = await api.post("/groceries/budgets", mapBudgetPayload(payload));
    return normalizeResponse(response);
  },

  async updateBudget(id, payload) {
    const response = await api.put(`/groceries/budgets/${id}`, mapBudgetPayload(payload));
    return normalizeResponse(response);
  },

  async deleteBudget(id) {
    const response = await api.delete(`/groceries/budgets/${id}`);
    return normalizeResponse(response);
  },

  async createExpense(budgetId, payload) {
    const response = await api.post(
      `/groceries/budgets/${budgetId}/expenses`,
      mapExpensePayload(payload),
    );
    return normalizeResponse(response);
  },

  async updateExpense(budgetId, expenseId, payload) {
    const response = await api.put(
      `/groceries/budgets/${budgetId}/expenses/${expenseId}`,
      mapExpensePayload(payload),
    );
    return normalizeResponse(response);
  },

  async deleteExpense(budgetId, expenseId) {
    const response = await api.delete(
      `/groceries/budgets/${budgetId}/expenses/${expenseId}`,
    );
    return normalizeResponse(response);
  },
};

export default groceriesService;
