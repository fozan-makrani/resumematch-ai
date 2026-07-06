import api from './axios';

export const submitMatch = (resumeText, jobDescriptionText) =>
  api.post('/match', { resumeText, jobDescriptionText }).then((res) => res.data);

export const getHistory = (page = 1, limit = 10) =>
  api.get(`/match/history?page=${page}&limit=${limit}`).then((res) => res.data);

export const getHistoryDetail = (id) =>
  api.get(`/match/history/${id}`).then((res) => res.data);