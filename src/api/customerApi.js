import api from "./axios";

export const fetchCustomers = async () => {
  const response = await api.get("/customers");

  return response.data.data;
};

export const searchCustomers = async (search) => {
  const response = await api.get("/customers/search-customers", {
    params: {
      q: search,
    },
  });

  return response.data.data;
};

export const addCustomer = async (payload) => {
  const response = await api.post("/customers", payload);

  return response.data;
};

export const updateCustomer = async (payload) => {
  const response = await api.post(
    "/customers/update-customer",
    payload
  );

  return response.data;
};

export const deleteCustomer = async (customer_id) => {
  const response = await api.post("/customers/delete-customer", {
    customer_id,
  });

  return response.data;
};