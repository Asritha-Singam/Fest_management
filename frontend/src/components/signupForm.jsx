import { useState } from "react";
import {register} from "../services/authServices"
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
    const navigate = useNavigate();
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

        try{
            await register(formData);
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

                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default SignupForm;
