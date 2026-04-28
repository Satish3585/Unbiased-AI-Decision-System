import axios from 'axios';

const API = axios.create({
  baseURL: 'https://unbiased-ai-decision-system-7961.onrender.com',
});

export const uploadCSV = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const analyzeBias = (target, group) => {
  const formData = new FormData();
  formData.append('target', target);
  formData.append('group', group);
  return API.post('/analyze', formData);
};

export const fixBias = (target, group) => {
  const formData = new FormData();
  formData.append('target', target);
  formData.append('group', group);
  return API.post('/fix', formData);
};

export const explainWithAI = (target, group) => {
  const formData = new FormData();
  formData.append('target', target);
  formData.append('group', group);
  return API.post('/explain', formData);
};

export const resetData = () => {
  return API.post('/reset');
};
