import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const uploadAudio = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/api/audio/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const analyzeAudio = (audioId) => {
  return api.get(`/api/audio/analyze/${audioId}`);
};

export const restoreAudio = (audioId) => {
  return api.post(`/api/audio/restore/${audioId}`, null, {
    responseType: "blob",
  });
};

export const getAudioHistory = () => {
  return api.get("/api/audio/history");
};

export default api;

