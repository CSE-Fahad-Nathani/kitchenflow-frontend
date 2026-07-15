import api from "./axios";

export const createSundaySpecial = async (payload) => {
  const response = await api.post("/sunday-specials/create", payload);
  return response.data;
};

export const fetchSundaySpecials = async (search = "") => {
  const response = await api.get("/sunday-specials", {
    params: search.trim() ? { search: search.trim() } : {},
  });
  return response.data.data;
};

export const fetchSundaySpecialById = async (special_id) => {
  const response = await api.get(`/sunday-specials/${special_id}`);
  return response.data.data;
};

export const deleteSundaySpecial = async (special_id) => {
  const response = await api.delete("/sunday-specials/delete", {
    data: { special_id },
  });
  return response.data;
};
