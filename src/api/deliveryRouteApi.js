import api from "./axios";

export const fetchDeliveryRouteSnapshot = async (date) => {
  const response = await api.get(`/delivery-route/${date}`);
  return response.data.data;
};

export const saveDeliveryRouteSnapshot = async (date, payload) => {
  const response = await api.put(`/delivery-route/${date}`, payload);
  return response.data.data;
};
