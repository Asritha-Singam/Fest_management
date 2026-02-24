import { useState, useContext } from "react";
import { register } from "../services/authServices";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { AuthContext } from "../context/AuthContext.jsx";

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const SignupForm = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        participantType: "IIIT",
        collegeOrOrg: "",
        contactNumber: "",
        interests: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError("");

        // Validate captcha
        if (!captchaToken) {
            setError("Please complete the captcha verification");
            return;
        }

        setIsLoading(true);
        try{
            const response = await register({ ...formData, captchaToken });
            const { token, role } = response.data;

            if (token && role) {
                login(token, role);
                navigate("/onboarding");
                return;
            }

            navigate("/login");
        }catch(err){
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={container}>
            <div style={formCard}>
                <h2 style={title}>Sign Up</h2>

                {error && <p style={errorText}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={rowGroup}>
                        <div style={inputGroup}>
                            <label>First Name</label>
                            <input
                                name="firstName"
                                placeholder="Enter first name"
                                onChange={handleChange}
                                required
                                style={input}
                            />
                        </div>
                        <div style={inputGroup}>
                            <label>Last Name</label>
                            <input
                                name="lastName"
                                placeholder="Enter last name"
                                onChange={handleChange}
                                required
                                style={input}
                            />
                        </div>
                    </div>

                    <div style={inputGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            required
                            style={input}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            onChange={handleChange}
                            required
                            style={input}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label>Participant Type</label>
                        <select
                            name="participantType"
                            onChange={handleChange}
                            style={select}
                        >
                            <option value="IIIT">IIIT Student</option>
                            <option value="NON_IIIT">Non-IIIT Participant</option>
                        </select>
                    </div>

                    <div style={inputGroup}>
                        <label>College/Organization</label>
                        <input
                            name="collegeOrOrg"
                            placeholder="Enter your college or organization"
                            onChange={handleChange}
                            required
                            style={input}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label>Contact Number</label>
                        <input
                            name="contactNumber"
                            placeholder="Enter your contact number"
                            onChange={handleChange}
                            required
                            style={input}
                        />
                    </div>

                    <div style={inputGroup}>
                        <label>Interests</label>
                        <input
                            name="interests"
                            placeholder="e.g., Web Development, AI, Mobile Apps"
                            onChange={handleChange}
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
                        {isLoading ? 'Creating Account...' : 'Create Account'}
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
    maxWidth: '550px',
};

const title = {
    fontSize: '24px',
    marginBottom: '20px',
};

const errorText = {
    color: 'red',
    marginBottom: '15px',
};

const rowGroup = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
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

const select = {
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

export default SignupForm;
