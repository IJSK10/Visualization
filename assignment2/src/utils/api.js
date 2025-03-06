import axios from "axios";

const API_BASE = "http://localhost:5001/api"; // Ensure this matches your Flask backend

export const fetchKMeansData = async () => {
  const response = await axios.get(`${API_BASE}/kmeans`);
  return response.data;
};

export const fetchPCAData = async () => {
  const response = await axios.get(`${API_BASE}/pca`);
  return response.data;
};

export const fetchBiplotData = async (di = 2,k=2) => {
  const response = await axios.get(`${API_BASE}/biplot?di=${di}&k=${k}`);
  return response.data;
};

export const fetchScatterPlotData = async (di = 2) => {
  const response = await axios.get(`${API_BASE}/scatterplot?di=${di}`);
  return response.data;
};

export const fetchMSEPlotData = async (k = 2) => {
  const response = await axios.get(`${API_BASE}/mse_plot?k=${k}`);
  return response.data;
};
