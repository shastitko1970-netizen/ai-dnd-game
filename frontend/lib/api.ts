// API клиент для всех бэкенд реквестов

import axios, { AxiosInstance } from 'axios';
import type { Character, GameSession, CustomRace, CustomClass, CustomFeat, ApiResponse } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Ошибка:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// РАВНОИ API
export const apiClient = {
  // Правила
  rules: {
    getCore: () => api.get<ApiResponse<any>>('/rules/core'),
    getMerged: () => api.get<ApiResponse<any>>('/rules/merged'),
    getRace: (name: string) => api.get<ApiResponse<any>>(`/rules/race/${name}`),
  },

  // Персонажи
  character: {
    create: (data: Partial<Character>) =>
      api.post<ApiResponse<Character>>('/character/create', data),
    get: (id: string) => api.get<ApiResponse<Character>>(`/character/${id}`),
    list: () => api.get<ApiResponse<Character[]>>('/character/list'),
  },

  // Пользовательские расы
  customRaces: {
    list: () => api.get<ApiResponse<CustomRace[]>>('/custom-races'),
    create: (data: CustomRace) => api.post<ApiResponse<CustomRace>>('/custom-races', data),
    update: (name: string, data: CustomRace) =>
      api.put<ApiResponse<CustomRace>>(`/custom-races/${name}`, data),
    delete: (name: string) => api.delete<ApiResponse<void>>(`/custom-races/${name}`),
  },

  // Пользовательские классы
  customClasses: {
    list: () => api.get<ApiResponse<CustomClass[]>>('/custom-classes'),
    create: (data: CustomClass) => api.post<ApiResponse<CustomClass>>('/custom-classes', data),
    update: (name: string, data: CustomClass) =>
      api.put<ApiResponse<CustomClass>>(`/custom-classes/${name}`, data),
    delete: (name: string) => api.delete<ApiResponse<void>>(`/custom-classes/${name}`),
  },

  // Пользовательские особенности
  customFeats: {
    list: () => api.get<ApiResponse<CustomFeat[]>>('/custom-feats'),
    create: (data: CustomFeat) => api.post<ApiResponse<CustomFeat>>('/custom-feats', data),
    update: (name: string, data: CustomFeat) =>
      api.put<ApiResponse<CustomFeat>>(`/custom-feats/${name}`, data),
    delete: (name: string) => api.delete<ApiResponse<void>>(`/custom-feats/${name}`),
  },

  // Игра
  game: {
    startSession: (data: Partial<GameSession>) =>
      api.post<ApiResponse<GameSession>>('/game/start', data),
    getSession: (sessionId: string) =>
      api.get<ApiResponse<GameSession>>(`/game/session/${sessionId}`),
    performAction: (sessionId: string, action: any) =>
      api.post<ApiResponse<any>>(`/game/action`, { sessionId, ...action }),
  },
};

export default apiClient;
