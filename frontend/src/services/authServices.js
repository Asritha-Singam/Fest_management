//Services abstract backend communication from UI
import API from "./api.js";
export const register = (formData) => API.post("/auth/register", formData);
export const login = (formData) => API.post("/auth/login", formData);

