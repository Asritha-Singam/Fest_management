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
        }
    };
    return (
        <div>
            <h2>Sign Up</h2>
            {error && <p style={{color: "red"}}>{error}</p>}

            <form onSubmit={handleSubmit}>      
                <input name="firstName" placeholder="First Name" onChange={handleChange} required />
                <input name="lastName" placeholder="Last Name" onChange={handleChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

                <select name="participantType" onChange={handleChange}>
                    <option value="IIIT">IIIT</option>
                    <option value="NON_IIIT">Non-IIIT</option>
                </select>

                <input name="collegeOrOrg" placeholder="College/Organization" onChange={handleChange} required />
                <input name="contactNumber" placeholder="Contact Number" onChange={handleChange} required />
                <input name="interests" placeholder="Interests (comma separated)" onChange={handleChange} />
                <ReCAPTCHA
                    sitekey={siteKey}
                    onChange={(token) => setCaptchaToken(token)}
                />
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default SignupForm;
