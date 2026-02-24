import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Welcome</h1>
        <p style={subtitle}>Please choose an option</p>

        <div style={buttonGroup}>
          <button onClick={() => navigate("/login")} style={button}>
            Login
          </button>

          <button onClick={() => navigate("/signup")} style={button}>
            Signup
          </button>
        </div>
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

const card = {
  backgroundColor: '#fff',
  border: '1px solid #ccc',
  padding: '40px',
  width: '100%',
  maxWidth: '500px',
  textAlign: 'center',
};

const title = {
  fontSize: '32px',
  marginBottom: '10px',
};

const subtitle = {
  fontSize: '14px',
  marginBottom: '30px',
};

const buttonGroup = {
  display: 'flex',
  gap: '10px',
  justifyContent: 'center',
};

const button = {
  padding: '12px 30px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
};

export default AuthPage;
