import { useNavigate } from "react-router-dom";

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome</h1>
      <p>Please choose an option</p>

      <button onClick={() => navigate("/login")}>
        Login
      </button>

      <button onClick={() => navigate("/signup")} style={{ marginLeft: "20px" }}>
        Signup
      </button>
    </div>
  );
};

export default AuthPage;
