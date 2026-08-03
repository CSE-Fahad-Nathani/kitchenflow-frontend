import api from "./axios";

export const fetchCustomerCreditStats = async () => {
  const response = await api.get("/customer-credits/stats");
  return response.data.data;
};

export const fetchCustomerCredits = async ({ filter = "all", search = "" } = {}) => {
  const response = await api.get("/customer-credits", {
    params: { filter, search },
  });
  return response.data.data;
};

export const fetchCustomerCreditById = async (credit_id) => {
  const response = await api.get(`/customer-credits/${credit_id}`);
  return response.data.data;
};

export const createPaidExtra = async (payload) => {
  const response = await api.post("/customer-credits/paid-extra", payload);
  return response.data;
};

export const updateCustomerCredit = async (credit_id, payload) => {
  const response = await api.put(`/customer-credits/${credit_id}`, payload);
  return response.data;
};

export const deleteCustomerCredit = async (credit_id) => {
  const response = await api.delete(`/customer-credits/${credit_id}`);
  return response.data;
};

export const fetchOpenCreditsForCustomer = async (
  customer_id,
  { customer_name = "" } = {}
) => {
  const response = await api.get(
    `/customer-credits/by-customer/${customer_id}`,
    { params: { customer_name } }
  );
  return response.data.data;
};

export const clearOpenCreditsForCustomer = async (
  customer_id,
  { customer_name = "" } = {}
) => {
  const response = await api.delete(
    `/customer-credits/by-customer/${customer_id}`,
    { data: { customer_name } }
  );
  return response.data;
};
