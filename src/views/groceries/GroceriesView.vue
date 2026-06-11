<template>
  <AppLayout
    :collapsed="sidebarCollapsed"
    :items="sidebarItems"
    :user-name="userName"
    :user-initials="userInitials"
    @toggleSidebar="toggleSidebar"
    @logout="handleLogout"
  >
    <section class="groceries-page">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Groceries budget</p>
          <h1>Budget belanja bulanan</h1>
          <p class="heading-copy">
            Buat periode budget bulanan, lalu tambahkan pengeluaran berdasarkan
            periode yang sedang dipilih.
          </p>
        </div>
        <button class="ghost-button" type="button" @click="resetBudgetForm">
          Budget baru
        </button>
      </div>

      <div v-if="errorMessage" class="error-banner">
        {{ errorMessage }}
      </div>

      <div class="summary-grid">
        <article class="summary-card">
          <span>Budget periode</span>
          <strong>{{ formatCurrency(activeSummary.budget) }}</strong>
          <small>{{ activeSummary.periodLabel }}</small>
        </article>
        <article class="summary-card">
          <span>Total pengeluaran</span>
          <strong>{{ formatCurrency(activeSummary.totalExpenses) }}</strong>
          <small>{{ activeSummary.expenseCount }} pengeluaran tercatat</small>
        </article>
        <article
          class="summary-card"
          :class="{ danger: activeSummary.remaining < 0 }"
        >
          <span>Selisih budget</span>
          <strong>{{ formatCurrency(activeSummary.remaining) }}</strong>
          <small>{{ activeSummary.remainingLabel }}</small>
        </article>
      </div>

      <div class="content-grid">
        <form class="panel" @submit.prevent="saveBudget">
          <div class="panel-title">
            <div>
              <p class="eyebrow">{{ editingBudgetId ? "Update" : "Input" }}</p>
              <h2>{{ editingBudgetId ? "Update periode" : "Periode budget baru" }}</h2>
            </div>
            <span class="period-pill">{{ budgetFormPeriodLabel }}</span>
          </div>

          <div class="form-grid">
            <label class="field">
              <span>Nama periode</span>
              <input
                v-model.trim="budgetForm.title"
                type="text"
                placeholder="Contoh: Belanja Juni"
                required
              />
            </label>

            <label class="field">
              <span>Budget per bulan</span>
              <input
                v-model.number="budgetForm.budget_amount"
                min="0"
                step="1000"
                type="number"
                placeholder="2500000"
                required
              />
            </label>

            <label class="field">
              <span>Tanggal mulai</span>
              <input v-model="budgetForm.period_start" type="date" required />
            </label>

            <label class="field">
              <span>Tanggal berakhir otomatis</span>
              <input :value="budgetForm.period_end" type="date" disabled />
            </label>
          </div>

          <div class="form-footer">
            <p>Pengeluaran ditambahkan setelah periode budget dibuat.</p>
            <div class="button-group">
              <button
                v-if="editingBudgetId"
                class="secondary-button"
                type="button"
                @click="resetBudgetForm"
              >
                Batal
              </button>
              <button class="primary-button" type="submit" :disabled="isSaving">
                {{
                  isSaving
                    ? "Menyimpan..."
                    : editingBudgetId
                      ? "Simpan update"
                      : "Simpan budget"
                }}
              </button>
            </div>
          </div>
        </form>

        <form class="panel" @submit.prevent="saveExpense">
          <div class="panel-title">
            <div>
              <p class="eyebrow">{{ editingExpenseId ? "Update" : "Input" }}</p>
              <h2>{{ editingExpenseId ? "Update pengeluaran" : "Tambah pengeluaran" }}</h2>
            </div>
            <span class="period-pill">{{ selectedBudget?.title || "Pilih periode" }}</span>
          </div>

          <div class="form-grid single">
            <label class="field">
              <span>Periode budget</span>
              <select v-model="expenseForm.budgetId" required>
                <option disabled value="">Pilih periode</option>
                <option
                  v-for="budget in budgets"
                  :key="budget.id"
                  :value="budget.id"
                >
                  {{ budget.title }} - {{ formatPeriod(budget.period_start, budget.period_end) }}
                </option>
              </select>
            </label>

            <label class="field">
              <span>Nama pengeluaran</span>
              <input
                v-model.trim="expenseForm.name"
                type="text"
                placeholder="Contoh: Beras"
                required
              />
            </label>

            <label class="field">
              <span>Tanggal pengeluaran</span>
              <input
                v-model="expenseForm.date"
                :max="expenseDateLimit.max"
                :min="expenseDateLimit.min"
                type="date"
                required
              />
            </label>

            <label class="field">
              <span>Nominal</span>
              <input
                v-model.number="expenseForm.amount"
                min="0"
                step="1000"
                type="number"
                placeholder="150000"
                required
              />
            </label>
          </div>

          <div class="form-footer">
            <p>
              Masuk ke:
              <strong>{{ expenseBudgetLabel }}</strong>
            </p>
            <div class="button-group">
              <button
                v-if="editingExpenseId"
                class="secondary-button"
                type="button"
                @click="resetExpenseForm"
              >
                Batal
              </button>
              <button
                class="primary-button"
                type="submit"
                :disabled="!budgets.length || isSaving"
              >
                {{
                  isSaving
                    ? "Menyimpan..."
                    : editingExpenseId
                      ? "Simpan update"
                      : "Tambah pengeluaran"
                }}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div class="content-grid">
        <aside class="budget-list-panel">
          <div class="section-heading">
            <h2>Daftar periode budget</h2>
            <span>{{ budgets.length }} periode</span>
          </div>

          <div v-if="isLoading" class="empty-state">
            <strong>Memuat data budget...</strong>
            <p>Data sedang diambil dari database.</p>
          </div>

          <div v-else-if="budgets.length" class="budget-list">
            <article
              v-for="budget in budgets"
              :key="budget.id"
              class="budget-card"
              :class="{ active: budget.id === selectedBudgetId }"
              @click="selectBudget(budget.id)"
            >
              <div class="budget-card-top">
                <div>
                  <h3>{{ budget.title }}</h3>
                  <p>{{ formatPeriod(budget.period_start, budget.period_end) }}</p>
                </div>
                <span :class="['status-chip', getRemaining(budget) < 0 && 'over']">
                  {{ getRemaining(budget) < 0 ? "Over" : "Aman" }}
                </span>
              </div>

              <div class="budget-metrics">
                <span>Budget {{ formatCurrency(budget.budget_amount) }}</span>
                <span>Total {{ formatCurrency(getTotalExpenses(budget)) }}</span>
                <strong>Sisa {{ formatCurrency(getRemaining(budget)) }}</strong>
              </div>

              <div class="budget-actions">
                <button type="button" @click.stop="editBudget(budget)">
                  Edit budget
                </button>
                <button
                  class="danger-button"
                  type="button"
                  @click.stop="deleteBudget(budget.id)"
                >
                  Hapus
                </button>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <strong>Belum ada periode budget.</strong>
            <p>Buat budget bulan berjalan dulu, lalu tambahkan pengeluaran.</p>
          </div>
        </aside>

        <section class="expenses-panel">
          <div class="section-heading">
            <div>
              <p class="eyebrow">Detail</p>
              <h2>{{ selectedBudget?.title || "Pengeluaran periode" }}</h2>
            </div>
            <span>{{ selectedBudgetExpenses.length }} item</span>
          </div>

          <div v-if="selectedBudget" class="selected-summary">
            <span>{{ formatPeriod(selectedBudget.period_start, selectedBudget.period_end) }}</span>
            <strong>{{ formatCurrency(getTotalExpenses(selectedBudget)) }}</strong>
          </div>

          <div v-if="isLoading" class="empty-state">
            <strong>Memuat pengeluaran...</strong>
            <p>Data sedang diambil dari database.</p>
          </div>

          <div v-else-if="selectedBudgetExpenses.length" class="expenses-table">
            <div class="table-head">
              <span>Pengeluaran</span>
              <span>Tanggal</span>
              <span>Nominal</span>
              <span>Aksi</span>
            </div>
            <div
              v-for="expense in selectedBudgetExpenses"
              :key="expense.id"
              class="table-row"
            >
              <span>{{ expense.name }}</span>
              <span>{{ formatDate(expense.date) }}</span>
              <strong>{{ formatCurrency(expense.amount) }}</strong>
              <div class="row-actions">
                <button type="button" @click="editExpense(expense)">Edit</button>
                <button
                  class="danger-button"
                  type="button"
                  @click="deleteExpense(selectedBudget.id, expense.id)"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <strong>Belum ada pengeluaran untuk periode ini.</strong>
            <p>Pilih periode budget, lalu tambahkan pengeluaran dari form.</p>
          </div>
        </section>
      </div>
    </section>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { sidebarItems } from "@/configs/sidebar";

import AppLayout from "@/layouts/AppLayout.vue";
import { useAppLayout } from "@/composables/useAppLayout";
import groceriesService from "@/services/groceries";

const toDateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = toDateInputValue(new Date());

const parseDateInput = (value) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getLastDayOfMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate();

const calculatePeriodEnd = (period_start) => {
  if (!period_start) return "";

  const [year, month, day] = period_start.split("-").map(Number);
  const nextMonthIndex = month;
  const lastDayNextMonth = getLastDayOfMonth(year, nextMonthIndex);

  if (day > lastDayNextMonth) {
    return toDateInputValue(new Date(year, nextMonthIndex, lastDayNextMonth));
  }

  return toDateInputValue(new Date(year, nextMonthIndex, day - 1));
};

const createBudgetForm = () => ({
  title: "",
  budget_amount: 0,
  period_start: today,
  period_end: calculatePeriodEnd(today),
});

const createExpenseForm = (budgetId = "") => ({
  budgetId,
  name: "",
  date: today,
  amount: 0,
});

const normalizeBudgets = (response) => {
  const items = Array.isArray(response) ? response : response?.budgets || [];

  return items.map((budget) => ({
    ...budget,
    budget_amount: Number(budget.budget_amount || budget.budget || 0),
    period_start: budget.period_start || budget.start_date || budget.startDate,
    period_end: budget.period_end || budget.end_date || budget.endDate,
    expenses: Array.isArray(budget.expenses)
      ? budget.expenses.map((expense) => ({
          ...expense,
          date: expense.date || expense.expense_date,
          amount: Number(expense.amount || 0),
        }))
      : [],
  }));
};

const budgets = ref([]);
const editingBudgetId = ref(null);
const editingExpenseId = ref(null);
const errorMessage = ref("");
const isLoading = ref(false);
const isSaving = ref(false);
const selectedBudgetId = ref("");
const budgetForm = reactive(createBudgetForm());
const expenseForm = reactive(createExpenseForm(selectedBudgetId.value));

const { sidebarCollapsed, userName, userInitials, toggleSidebar, handleLogout } =
  useAppLayout();

const selectedBudget = computed(() =>
  budgets.value.find((budget) => budget.id === selectedBudgetId.value)
);

const selectedBudgetExpenses = computed(() => selectedBudget.value?.expenses || []);

const budgetFormPeriodLabel = computed(() =>
  formatPeriod(budgetForm.period_start, budgetForm.period_end)
);

const expenseBudgetLabel = computed(() => {
  const budget = budgets.value.find((item) => item.id === expenseForm.budgetId);
  return budget ? budget.title : "Belum ada periode dipilih";
});

const expenseDateLimit = computed(() => {
  const budget = budgets.value.find((item) => item.id === expenseForm.budgetId);
  return {
    min: budget?.period_start || "",
    max: budget?.period_end || "",
  };
});

const activeSummary = computed(() => {
  const active = selectedBudget.value;

  if (!active) {
    return {
      budget: 0,
      totalExpenses: 0,
      remaining: 0,
      expenseCount: 0,
      periodLabel: "Belum ada periode",
      remainingLabel: "Buat budget bulan berjalan",
    };
  }

  const totalExpenses = getTotalExpenses(active);
  const remaining = Number(active.budget_amount || 0) - totalExpenses;

  return {
    budget: Number(active.budget_amount || 0),
    totalExpenses,
    remaining,
    expenseCount: active.expenses.length,
    periodLabel: formatPeriod(active.period_start, active.period_end),
    remainingLabel: remaining < 0 ? "Melebihi budget" : "Masih tersedia",
  };
});

onMounted(() => {
  loadBudgets();
});

watch(
  () => budgetForm.period_start,
  (period_start) => {
    budgetForm.period_end = calculatePeriodEnd(period_start);
  }
);

watch(selectedBudgetId, (budgetId) => {
  if (!editingExpenseId.value) {
    expenseForm.budgetId = budgetId;
    const budget = budgets.value.find((item) => item.id === budgetId);
    expenseForm.date = budget?.period_start || today;
  }
});

watch(
  () => expenseForm.budgetId,
  (budgetId) => {
    const budget = budgets.value.find((item) => item.id === budgetId);
    if (!budget) return;

    selectedBudgetId.value = budgetId;

    if (expenseForm.date < budget.period_start || expenseForm.date > budget.period_end) {
      expenseForm.date = budget.period_start;
    }
  }
);

function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parseDateInput(value));
}

function formatPeriod(period_start, period_end) {
  if (!period_start || !period_end) return "-";
  return `${formatDate(period_start)} - ${formatDate(period_end)}`;
}

function getTotalExpenses(budget) {
  return budget.expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0
  );
}

function getRemaining(budget) {
  return Number(budget.budget_amount || 0) - getTotalExpenses(budget);
}

function showError(error, fallbackMessage) {
  errorMessage.value =
    error.response?.data?.message || error.message || fallbackMessage;
}

async function loadBudgets() {
  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await groceriesService.getBudgets();
    budgets.value = normalizeBudgets(response);

    if (!budgets.value.some((budget) => budget.id === selectedBudgetId.value)) {
      selectedBudgetId.value = budgets.value[0]?.id || "";
    }

    resetExpenseForm();
  } catch (error) {
    showError(error, "Gagal memuat data groceries dari database.");
  } finally {
    isLoading.value = false;
  }
}

function resetBudgetForm() {
  Object.assign(budgetForm, createBudgetForm());
  editingBudgetId.value = null;
}

function resetExpenseForm() {
  const budgetId = selectedBudgetId.value || budgets.value[0]?.id || "";
  const budget = budgets.value.find((item) => item.id === budgetId);
  Object.assign(expenseForm, createExpenseForm(budgetId));
  expenseForm.date = budget?.period_start || today;
  editingExpenseId.value = null;
}

async function saveBudget() {
  const payload = {
    title: budgetForm.title,
    budget_amount: Number(budgetForm.budget_amount || 0),
    period_start: budgetForm.period_start,
    period_end: budgetForm.period_end,
  };

  isSaving.value = true;
  errorMessage.value = "";

  try {
    if (editingBudgetId.value) {
      await groceriesService.updateBudget(editingBudgetId.value, payload);
      selectedBudgetId.value = editingBudgetId.value;
    } else {
      const createdBudget = await groceriesService.createBudget(payload);
      selectedBudgetId.value = createdBudget.id || selectedBudgetId.value;
    }

    resetBudgetForm();
    await loadBudgets();
  } catch (error) {
    showError(error, "Gagal menyimpan budget ke database.");
  } finally {
    isSaving.value = false;
  }
}

async function saveExpense() {
  if (!expenseForm.budgetId) return;

  const payload = {
    name: expenseForm.name,
    date: expenseForm.date,
    amount: Number(expenseForm.amount || 0),
  };

  isSaving.value = true;
  errorMessage.value = "";

  try {
    if (editingExpenseId.value) {
      await groceriesService.updateExpense(
        expenseForm.budgetId,
        editingExpenseId.value,
        payload
      );
    } else {
      await groceriesService.createExpense(expenseForm.budgetId, payload);
    }

    selectedBudgetId.value = expenseForm.budgetId;
    resetExpenseForm();
    await loadBudgets();
  } catch (error) {
    showError(error, "Gagal menyimpan pengeluaran ke database.");
  } finally {
    isSaving.value = false;
  }
}

function selectBudget(id) {
  selectedBudgetId.value = id;
}

function editBudget(budget) {
  editingBudgetId.value = budget.id;
  Object.assign(budgetForm, {
    title: budget.title,
    budget_amount: budget.budget_amount,
    period_start: budget.period_start,
    period_end: budget.period_end,
  });
}

function editExpense(expense) {
  if (!selectedBudget.value) return;

  editingExpenseId.value = expense.id;
  Object.assign(expenseForm, {
    budgetId: selectedBudget.value.id,
    name: expense.name,
    date: expense.date,
    amount: expense.amount,
  });
}

async function deleteBudget(id) {
  isSaving.value = true;
  errorMessage.value = "";

  try {
    await groceriesService.deleteBudget(id);

    if (selectedBudgetId.value === id) {
      selectedBudgetId.value = "";
    }

    if (editingBudgetId.value === id) {
      resetBudgetForm();
    }

    if (expenseForm.budgetId === id) {
      resetExpenseForm();
    }

    await loadBudgets();
  } catch (error) {
    showError(error, "Gagal menghapus budget dari database.");
  } finally {
    isSaving.value = false;
  }
}

async function deleteExpense(budgetId, expenseId) {
  isSaving.value = true;
  errorMessage.value = "";

  try {
    await groceriesService.deleteExpense(budgetId, expenseId);

    if (editingExpenseId.value === expenseId) {
      resetExpenseForm();
    }

    await loadBudgets();
  } catch (error) {
    showError(error, "Gagal menghapus pengeluaran dari database.");
  } finally {
    isSaving.value = false;
  }
}
</script>

<style scoped>
.groceries-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: #172033;
}

.page-heading,
.panel-title,
.section-heading,
.budget-card-top,
.form-footer,
.selected-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.page-heading {
  padding: 1.5rem;
  background:
    linear-gradient(135deg, rgba(232, 246, 239, 0.95), rgba(255, 251, 235, 0.9)),
    #ffffff;
  border: 1px solid #dce8df;
  border-radius: 8px;
}

.error-banner {
  padding: 0.85rem 1rem;
  color: #991b1b;
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-weight: 700;
}

.eyebrow {
  margin: 0 0 0.35rem;
  color: #0f766e;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  color: #132018;
  font-size: 2rem;
  line-height: 1.15;
}

h2 {
  color: #132018;
  font-size: 1.2rem;
}

h3 {
  color: #172033;
  font-size: 1rem;
}

.heading-copy,
.empty-state p,
.budget-card p,
.summary-card small,
.selected-summary span,
.form-footer p {
  color: #64748b;
}

.heading-copy {
  margin-top: 0.5rem;
  max-width: 42rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.summary-card,
.panel,
.budget-list-panel,
.expenses-panel,
.budget-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 1.25rem;
}

.summary-card span {
  color: #475569;
  font-size: 0.9rem;
  font-weight: 700;
}

.summary-card strong {
  color: #0f766e;
  font-size: 1.45rem;
}

.summary-card.danger strong {
  color: #b91c1c;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.panel,
.budget-list-panel,
.expenses-panel {
  padding: 1.25rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1.25rem;
}

.form-grid.single {
  grid-template-columns: 1fr;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.field span {
  color: #334155;
  font-size: 0.85rem;
  font-weight: 700;
}

.field input,
.field select {
  width: 100%;
  min-height: 2.75rem;
  padding: 0 0.85rem;
  color: #172033;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}

.field input:focus,
.field select:focus {
  border-color: #0f766e;
  box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.14);
  outline: none;
}

.field input:disabled {
  color: #64748b;
  background: #eef2f7;
}

.section-heading {
  margin-bottom: 1rem;
}

.section-heading span {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 700;
}

.form-footer {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.button-group,
.budget-actions,
.row-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

button {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-weight: 800;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.primary-button,
.ghost-button,
.secondary-button,
.budget-actions button,
.row-actions button {
  min-height: 2.5rem;
  padding: 0 1rem;
}

.primary-button {
  color: #ffffff;
  background: #0f766e;
}

.ghost-button,
.secondary-button {
  color: #0f766e;
  background: #ecfdf5;
  border: 1px solid #99f6e4;
}

.period-pill,
.status-chip {
  flex-shrink: 0;
  padding: 0.45rem 0.75rem;
  color: #0f766e;
  background: #ecfdf5;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.budget-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.budget-card {
  padding: 1rem;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.budget-card:hover,
.budget-card.active {
  border-color: #0f766e;
  transform: translateY(-1px);
}

.status-chip.over {
  color: #b91c1c;
  background: #fee2e2;
}

.budget-metrics {
  display: grid;
  gap: 0.45rem;
  margin: 1rem 0;
  color: #475569;
  font-size: 0.9rem;
}

.budget-metrics strong {
  color: #172033;
}

.budget-actions {
  justify-content: flex-start;
}

.budget-actions button,
.row-actions button {
  color: #0f766e;
  background: #ecfdf5;
}

.budget-actions .danger-button,
.row-actions .danger-button {
  color: #b91c1c;
  background: #fee2e2;
}

.empty-state {
  padding: 1.25rem;
  color: #172033;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
}

.empty-state p {
  margin-top: 0.35rem;
}

.selected-summary {
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
  background: #f8fafc;
  border-radius: 8px;
}

.expenses-table {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(130px, 0.7fr) minmax(120px, 0.7fr) minmax(150px, 0.8fr);
  gap: 1rem;
  align-items: center;
  padding: 0.9rem 1rem;
}

.table-head {
  color: #475569;
  background: #f1f5f9;
  font-size: 0.85rem;
  font-weight: 800;
}

.table-row + .table-row {
  border-top: 1px solid #e2e8f0;
}

.table-row strong {
  text-align: right;
}

@media (max-width: 1100px) {
  .content-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-heading,
  .panel-title,
  .section-heading,
  .form-footer,
  .selected-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid,
  .table-head,
  .table-row {
    grid-template-columns: 1fr;
  }

  .table-row strong {
    text-align: left;
  }

  .button-group,
  .primary-button,
  .secondary-button,
  .ghost-button {
    width: 100%;
  }
}
</style>
