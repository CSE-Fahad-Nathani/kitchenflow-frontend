import api from "./axios";

export const fetchDashboardStatistics = async () => {
  const response = await api.get("/dashboard/statistics");
  return response.data.data;
};

export const fetchMonthlyStatistics = async (month, year) => {
  const response = await api.get("/dashboard/monthly", {
    params: { month, year },
  });
  return response.data.data;
};

export const fetchTodaysOrders = async () => {
  const response = await api.get("/orders/fetch-todays-orders");
  return response.data.data;
};
