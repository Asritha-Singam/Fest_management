import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginAPI } from "../services/authServices.js";
import { AuthContext } from "../context/AuthContext.jsx";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await loginAPI({ email, password });
      const { token, role } = response.data;

      login(token, role);

      if (role === "participant") {
        navigate("/dashboard");
      } else if (role === "organizer") {
        navigate("/organizer/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
