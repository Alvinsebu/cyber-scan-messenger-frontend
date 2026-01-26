// src/config.js
// Central config for API endpoints and other constants


export const API_BASE_URL = 'http://localhost:5000/api';
export const UPLOAD_IMAGE_URL = `${API_BASE_URL}/upload-image`;
export const POSTS_RANDOM_URL = `${API_BASE_URL}/posts/random`;
export const LOGIN_URL = `${API_BASE_URL}/login`;
export const REGISTER_URL = `${API_BASE_URL}/register`;

// Chat API endpoints
export const CHAT_MESSAGES_URL = `${API_BASE_URL}/chat/messages`;
export const CHAT_CONVERSATIONS_URL = `${API_BASE_URL}/chat/conversations`;
export const CHAT_ONLINE_USERS_URL = `${API_BASE_URL}/chat/online-users`;
export const CHAT_BULLYING_REPORT_URL = `${API_BASE_URL}/chat/bullying-report`;

// Socket.IO server URL
export const SOCKET_SERVER_URL = 'http://localhost:5000';

// Admin emails - only these users can access the admin dashboard
export const ADMIN_EMAILS = [
  'alvin@gmail.com',
  // Add more admin emails here
];
