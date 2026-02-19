//Services abstract backend communication from UI
import API from "./api.js";
export const register = (formData, captchaToken) => API.post("/auth/register", { ...formData, captchaToken });
export const login = (formData, captchaToken) => API.post("/auth/login", { ...formData, captchaToken });

