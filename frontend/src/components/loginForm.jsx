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
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={formCard}>
        <h2 style={title}>Login</h2>

        {error && <p style={errorText}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={inputGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={input}
            />
          </div>

          <div style={inputGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={input}
            />
          </div>

          <div style={captchaContainer}>
            <ReCAPTCHA
              sitekey={siteKey}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>
    
          <button type="submit" style={submitButton} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Styles
const container = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px',
};

const formCard = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  padding: '30px',
  width: '100%',
  maxWidth: '400px',
};

const title = {
  fontSize: '24px',
  marginBottom: '20px',
};

const errorText = {
  color: 'red',
  marginBottom: '15px',
};

const inputGroup = {
  marginBottom: '15px',
};

const input = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ccc',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const captchaContainer = {
  marginBottom: '15px',
};

const submitButton = {
  width: '100%',
  padding: '12px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
};

export default LoginForm;
