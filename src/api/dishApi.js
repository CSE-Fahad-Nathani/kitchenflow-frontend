import api from "./axios";

export const searchDishes = async (search) => {
  const response = await api.get("/dishes/search-dishes", {
    params: {
      q: search,
    },
  });

  return response.data.data;
};

export const fetchDishes = async () => {
  const response = await api.get("/dishes/fetch-dishes");

  return response.data.data;
};

export const addDish = async (payload) => {
  const response = await api.post(
    "/dishes/add-dish",
    payload
  );

  return response.data;
};

export const updateDish = async (payload) => {
  const response = await api.post(
    "/dishes/update-dish",
    payload
  );

  return response.data;
};

export const deleteDish = async (dish_id) => {
  const response = await api.post(
    "/dishes/delete-dish",
    {
      dish_id,
    }
  );

  return response.data;
};