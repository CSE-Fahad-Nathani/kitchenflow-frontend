import api from "./axios";

export const createCalendarBill = async (payload) => {
  const response = await api.post("/calendar-bills/create", payload);
  return response.data;
};

export const fetchCalendarBills = async (search = "") => {
  const response = await api.get("/calendar-bills", {
    params: search.trim() ? { search: search.trim() } : {},
  });
  return response.data.data;
};

export const fetchCalendarBillById = async (bill_id) => {
  const response = await api.get(`/calendar-bills/${bill_id}`);
  return response.data.data;
};

export const deleteCalendarBill = async (bill_id) => {
  const response = await api.delete("/calendar-bills/delete", {
    data: { bill_id },
  });
  return response.data;
};

export const markCalendarBillPaid = async (bill_id) => {
  const response = await api.patch("/calendar-bills/mark-paid", { bill_id });
  return response.data;
};

export const increaseCalendarBillReminder = async (bill_id) => {
  const response = await api.patch("/calendar-bills/increase-reminder", {
    bill_id,
  });
  return response.data;
};
