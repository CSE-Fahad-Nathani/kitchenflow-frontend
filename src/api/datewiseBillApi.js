import api from "./axios";

export const createDatewiseBill = async (payload) => {
  const response = await api.post("/datewise-bills/create", payload);
  return response.data;
};

export const fetchDatewiseBills = async (search = "") => {
  const response = await api.get("/datewise-bills", {
    params: search.trim() ? { search: search.trim() } : {},
  });
  return response.data.data;
};

export const fetchDatewiseBillById = async (bill_id) => {
  const response = await api.get(`/datewise-bills/${bill_id}`);
  return response.data.data;
};

export const deleteDatewiseBill = async (bill_id) => {
  const response = await api.delete("/datewise-bills/delete", {
    data: { bill_id },
  });
  return response.data;
};
