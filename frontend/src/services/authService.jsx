// src/services/authService.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const loginUser = async (credentials) => {
  const res = await axios.post(`${BASE_URL}/auth/login.php`, credentials);
  return res.data;
};
