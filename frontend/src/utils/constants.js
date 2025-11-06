export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ROUTES = {
  HOME: '/',
  FORUM: '/forum',
  LOGIN: '/login',
  CREATE_POST: '/forum/create',
  POST_DETAIL: '/forum/post/:id',
  AUTH_SUCCESS: '/auth-success'
};

export const CATEGORIES = [
  { id: 'general', name: 'General' },
  { id: 'questions', name: 'Preguntas' },
  { id: 'announcements', name: 'Anuncios' },
  { id: 'help', name: 'Ayuda' }
];

export const COMMUNITY_STATS = {
  MEMBERS: '1.2K+',
  DISCUSSIONS: '458',
  MESSAGES: '2.3K',
  ACTIVE: '24/7'
};