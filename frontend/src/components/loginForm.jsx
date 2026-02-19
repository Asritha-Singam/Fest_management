import { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { login as loginAPI } from "../services/authServices.js";
import { AuthContext } from "../context/AuthContext.jsx";
import ReCAPTCHA from "react-google-recaptcha";

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);


  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate captcha
    if (!captchaToken) {
      setError("Please complete the captcha verification");
      return;
    }

    try {
      const response = await loginAPI({ email, password, captchaToken });
      
      const { token, role } = response.data;

      login(token, role);

      // Check if redirecting from signup (new user onboarding)
      const searchParams = new URLSearchParams(location.search);
      const shouldOnboard = searchParams.get("onboarding") === "true";

      if (role === "participant") {
        navigate(shouldOnboard ? "/onboarding" : "/dashboard");
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
        <ReCAPTCHA
          sitekey={siteKey}
          onChange={(token) => setCaptchaToken(token)}
        />
  
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginForm;
