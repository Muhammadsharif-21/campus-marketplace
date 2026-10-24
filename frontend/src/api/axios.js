import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


/* baseURL is a prefix. You write /listings, and it adds http://localhost:5000/api in front for you. That address comes from your .env.
localStorage is a notepad built into the browser. After you log in, the app will write your token on it. The notepad survives page refreshes, so you stay logged in.
The interceptor is a checkpoint. Before any request leaves your app, it looks at the notepad. If a token is written there, it attaches it to the request, the same as pasting it into Postman’s Bearer Token box. If there’s no token, the request goes out without one.
import and export default are just the frontend spelling of require and module.exports. Same job, different words. */

