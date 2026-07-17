import api from "./axios";

export const createMonthlyTiffinBill = async (payload) => {
  const response = await api.post("/monthly-tiffin/create", payload);
  return response.data;
};

export const fetchMonthlyTiffinBills = async (search = "") => {
  const response = await api.get("/monthly-tiffin", {
    params: search.trim() ? { search: search.trim() } : {},
  });
  return response.data.data;
};

export const fetchMonthlyTiffinBillById = async (bill_id) => {
  const response = await api.get(`/monthly-tiffin/${bill_id}`);
  return response.data.data;
};

export const deleteMonthlyTiffinBill = async (bill_id) => {
  const response = await api.delete("/monthly-tiffin/delete", {
    data: { bill_id },
  });
  return response.data;
};

export const markMonthlyTiffinPaid = async (bill_id) => {
  const response = await api.patch("/monthly-tiffin/mark-paid", { bill_id });
  return response.data;
};

export const increaseMonthlyTiffinReminder = async (bill_id) => {
  const response = await api.patch("/monthly-tiffin/increase-reminder", {
    bill_id,
  });
  return response.data;
};
