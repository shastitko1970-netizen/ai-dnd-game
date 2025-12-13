import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Rules
export const fetchMergedRules = () => api.get('/api/rules/merged').then(r => r.data);
export const fetchCoreRules = () => api.get('/api/rules/core').then(r => r.data);

// Character
export const createCharacter = (data: any) => api.post('/api/character/create', data).then(r => r.data);
export const getCharacter = (id: string) => api.get(`/api/character/${id}`).then(r => r.data);

// Game
export const startGame = (character: any, world: any) => 
  api.post('/api/game/start', { character, world }).then(r => r.data);
export const playerAction = (sessionId: string, action: any) => 
  api.post('/api/game/action', { sessionId, action }).then(r => r.data);
export const getGameSession = (sessionId: string) => 
  api.get(`/api/game/session/${sessionId}`).then(r => r.data);

// Custom Races
export const fetchCustomRaces = () => api.get('/api/custom-races').then(r => r.data);
export const createCustomRace = (data: any) => api.post('/api/custom-races', data).then(r => r.data);
export const updateCustomRace = (name: string, data: any) => api.put(`/api/custom-races/${name}`, data).then(r => r.data);
export const deleteCustomRace = (name: string) => api.delete(`/api/custom-races/${name}`).then(r => r.data);

// Custom Classes
export const fetchCustomClasses = () => api.get('/api/custom-classes').then(r => r.data);
export const createCustomClass = (data: any) => api.post('/api/custom-classes', data).then(r => r.data);
export const updateCustomClass = (name: string, data: any) => api.put(`/api/custom-classes/${name}`, data).then(r => r.data);
export const deleteCustomClass = (name: string) => api.delete(`/api/custom-classes/${name}`).then(r => r.data);

// Custom Feats
export const fetchCustomFeats = () => api.get('/api/custom-feats').then(r => r.data);
export const createCustomFeat = (data: any) => api.post('/api/custom-feats', data).then(r => r.data);
export const updateCustomFeat = (name: string, data: any) => api.put(`/api/custom-feats/${name}`, data).then(r => r.data);
export const deleteCustomFeat = (name: string) => api.delete(`/api/custom-feats/${name}`).then(r => r.data);
