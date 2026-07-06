import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // httpOnly cookies auto-sent with every request
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
