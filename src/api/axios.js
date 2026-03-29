import axios from "axios";

// Base URL for all API calls
const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }
  return req;
});

export default API;