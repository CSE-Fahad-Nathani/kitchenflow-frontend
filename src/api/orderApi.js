import api from "./axios";

export const fetchOrders = async () => {
  const response = await api.get("/orders/fetch-orders");

  return response.data.data;
};

export const addOrder = async (payload) => {
  const response = await api.post(
    "/orders/add-order",
    payload
  );

  return response.data;
};

export const updateOrder = async (payload) => {
  const response = await api.put(
    "/orders/update-order",
    payload
  );

  return response.data;
};

export const deleteOrder = async (order_id) => {
  const response = await api.delete(
    "/orders/delete-order",
    {
      data: { order_id },
    }
  );

  return response.data;
};

export const increaseReminder = async (order_id) => {
  const response = await api.patch(
    "/orders/increase-reminder",
    {
      order_id,
    }
  );

  return response.data;
};

export const markOrderPaid = async (order_id) => {
  const response = await api.patch(
    "/orders/mark-paid",
    {
      order_id,
    }
  );

  return response.data;
};
