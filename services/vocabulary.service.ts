import axiosInstance, { createAxios } from "./http";

const axiosFileInstance = createAxios("", "multipart/form-data");
const importCSVInstance = createAxios("", "multipart/form-data", 0);
export const vocabularyService = {
  getWords: async (page = 1, limit = 10, search = "") =>
    axiosInstance.get(`/vocabulary/words`, {
      params: { page, limit, search },
    }),
  getLevels: async () => axiosInstance.get("/vocabulary/levels"),
  getPosTags: async () => axiosInstance.get("/vocabulary/posTags"),
  getCategories: async () => axiosInstance.get("/vocabulary/categories"),
  importCSV: async (formData: FormData) =>
    importCSVInstance.post("/vocabulary/import", formData),
  addWord: async (formData: FormData) =>
    axiosFileInstance.post("/vocabulary/words", formData),
  isWordExist: async (word: string) =>
    axiosInstance.get(`/vocabulary/words/isExist/${word}`),
  getWordById: async (id: string) =>
    axiosInstance.get(`/vocabulary/words/${id}`),
  updateWord: async (id: string, data: FormData) =>
    axiosFileInstance.patch(`/vocabulary/words/${id}`, data),
  deleteWord: async (id: string) =>
    axiosInstance.delete(`/vocabulary/words/${id}`),
  getWordsByWordPosIds: async (wordPosIds: string[]) =>
    axiosInstance.post("/vocabulary/wordsPosIds", {
      wordPosIds,
    }),
};
