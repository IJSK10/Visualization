import axios from "axios";

const API_BASE = "http://localhost:5001/api";

export const fetchKMeansData = async () => {
  const response = await axios.get(`${API_BASE}/kmeans`);
  return response.data;
};

export const fetchPCAData = async () => {
  const response = await axios.get(`${API_BASE}/pca`);
  return response.data;
};

export const fetchBiplotData = async (di = 2,k=2,comp1=2,comp2=3) => {
  const response = await axios.get(`${API_BASE}/biplot?di=${di}&k=${k}&comp1=${comp1}&comp2=${comp2}`);
  return response.data;
};

export const fetchScatterPlotData = async (di = 2,comp1=2,comp2=3,k) => {
  const response = await axios.get(`${API_BASE}/scatterplot?di=${di}&comp1=${comp1}&comp2=${comp2}&k=${k}`);
  return response.data;
};

export const fetchMSEPlotData = async (k = 2) => {
  const response = await axios.get(`${API_BASE}/mse_plot?k=${k}`);
  return response.data;
};
