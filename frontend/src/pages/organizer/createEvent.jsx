import { useState, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import OrganizerNavbar from "../../components/organizerNavbar";

const CreateEvent = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventType: "NORMAL",
    eligibility: "ALL",
    registrationDeadline: "",
    eventStartDate: "",
    eventEndDate: "",
    registrationLimit: 0,
    registrationFee: 0
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post(
        "/organizer/events/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate("/organizer/dashboard");

    } catch (error) {
      console.error("Error creating event", error);
    }
  };

  return (
    <>
      <OrganizerNavbar />
      <h2>Create Event</h2>

      <form onSubmit={handleSubmit}>
        <input name="eventName" placeholder="Event Name" onChange={handleChange} required />
        <input name="eventDescription" placeholder="Description" onChange={handleChange} required />
        <input type="datetime-local" name="registrationDeadline" onChange={handleChange} required />
        <input type="datetime-local" name="eventStartDate" onChange={handleChange} required />
        <input type="datetime-local" name="eventEndDate" onChange={handleChange} required />
        <button type="submit">Create Draft</button>
      </form>
    </>
  );
};

export default CreateEvent;
