// src/config.js
// Central config for API endpoints and other constants


export const API_BASE_URL = 'http://localhost:5000/api';
export const UPLOAD_IMAGE_URL = `${API_BASE_URL}/upload-image`;
export const POSTS_RANDOM_URL = `${API_BASE_URL}/posts/random`;
export const LOGIN_URL = `${API_BASE_URL}/login`;
export const REGISTER_URL = `${API_BASE_URL}/register`;

// Admin emails - only these users can access the admin dashboard
export const ADMIN_EMAILS = [
  'alvin@gmail.com',
  // Add more admin emails here
];
