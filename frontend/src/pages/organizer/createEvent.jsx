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
    registrationFee: 0,
    eventTags: "",
    // Merchandise-specific
    sizes: "",
    colors: "",
    merchandiseStock: 0,
    purchaseLimitPerUser: 1,
    // Normal event custom form
    customFormFields: []
  });

  const [newFormField, setNewFormField] = useState({
    fieldName: "",
    fieldType: "text",
    required: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const addFormField = () => {
    if (newFormField.fieldName) {
      setFormData({
        ...formData,
        customFormFields: [...formData.customFormFields, newFormField]
      });
      setNewFormField({ fieldName: "", fieldType: "text", required: false });
    }
  };

  const removeFormField = (index) => {
    setFormData({
      ...formData,
      customFormFields: formData.customFormFields.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = {
      eventName: formData.eventName,
      eventDescription: formData.eventDescription,
      eventType: formData.eventType,
      eligibility: formData.eligibility,
      registrationDeadline: formData.registrationDeadline,
      eventStartDate: formData.eventStartDate,
      eventEndDate: formData.eventEndDate,
      registrationLimit: parseInt(formData.registrationLimit),
      registrationFee: parseInt(formData.registrationFee),
      eventTags: formData.eventTags.split(",").map(tag => tag.trim()).filter(t => t)
    };

    if (formData.eventType === "MERCHANDISE") {
      submitData.merchandiseDetails = {
        sizes: formData.sizes.split(",").map(s => s.trim()).filter(s => s),
        colors: formData.colors.split(",").map(c => c.trim()).filter(c => c),
        stock: parseInt(formData.merchandiseStock),
        purchaseLimitPerUser: parseInt(formData.purchaseLimitPerUser)
      };
    }

    if (formData.eventType === "NORMAL" && formData.customFormFields.length > 0) {
      submitData.customFormFields = formData.customFormFields;
    }

    try {
      await api.post(
        "/organizer/events/create",
        submitData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      navigate("/organizer/dashboard");

    } catch (error) {
      console.error("Error creating event", error);
      alert("Failed to create event");
    }
  };

  return (
    <>
      <OrganizerNavbar />
      <h2>Create Event</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Event Name *</label>
          <input name="eventName" placeholder="Event Name" onChange={handleChange} value={formData.eventName} required />
        </div>

        <div>
          <label>Event Description *</label>
          <textarea name="eventDescription" placeholder="Event Description" onChange={handleChange} value={formData.eventDescription} required />
        </div>

        <div>
          <label>Event Type *</label>
          <select name="eventType" onChange={handleChange} value={formData.eventType}>
            <option value="NORMAL">Normal Event</option>
            <option value="MERCHANDISE">Merchandise Event</option>
          </select>
        </div>

        <div>
          <label>Eligibility *</label>
          <select name="eligibility" onChange={handleChange} value={formData.eligibility}>
            <option value="ALL">All</option>
            <option value="IIIT_ONLY">IIIT Only</option>
            <option value="NON_IIIT_ONLY">Non-IIIT Only</option>
          </select>
        </div>

        <div>
          <label>Event Start Date *</label>
          <input type="datetime-local" name="eventStartDate" onChange={handleChange} value={formData.eventStartDate} required />
        </div>

        <div>
          <label>Event End Date *</label>
          <input type="datetime-local" name="eventEndDate" onChange={handleChange} value={formData.eventEndDate} required />
        </div>

        <div>
          <label>Registration Deadline *</label>
          <input type="datetime-local" name="registrationDeadline" onChange={handleChange} value={formData.registrationDeadline} required />
        </div>

        <div>
          <label>Registration Limit</label>
          <input type="number" name="registrationLimit" placeholder="0 for unlimited" onChange={handleChange} value={formData.registrationLimit} />
        </div>

        <div>
          <label>Registration Fee (₹)</label>
          <input type="number" name="registrationFee" placeholder="0" onChange={handleChange} value={formData.registrationFee} />
        </div>

        <div>
          <label>Event Tags (comma-separated)</label>
          <input type="text" name="eventTags" placeholder="AI, Web Dev, Cloud" onChange={handleChange} value={formData.eventTags} />
        </div>

        {formData.eventType === "MERCHANDISE" && (
          <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
            <h3>Merchandise Details</h3>

            <div>
              <label>Sizes (comma-separated)</label>
              <input type="text" name="sizes" placeholder="S, M, L, XL" onChange={handleChange} value={formData.sizes} />
            </div>

            <div>
              <label>Colors (comma-separated)</label>
              <input type="text" name="colors" placeholder="Red, Blue, Black" onChange={handleChange} value={formData.colors} />
            </div>

            <div>
              <label>Stock Quantity</label>
              <input type="number" name="merchandiseStock" placeholder="0" onChange={handleChange} value={formData.merchandiseStock} />
            </div>

            <div>
              <label>Purchase Limit Per Participant</label>
              <input type="number" name="purchaseLimitPerUser" placeholder="1" onChange={handleChange} value={formData.purchaseLimitPerUser} />
            </div>
          </div>
        )}

        {formData.eventType === "NORMAL" && (
          <div style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
            <h3>Custom Registration Form Fields</h3>

            <div>
              <label>Field Name</label>
              <input 
                type="text" 
                placeholder="e.g., Phone Number" 
                value={newFormField.fieldName}
                onChange={(e) => setNewFormField({ ...newFormField, fieldName: e.target.value })}
              />
            </div>

            <div>
              <label>Field Type</label>
              <select value={newFormField.fieldType} onChange={(e) => setNewFormField({ ...newFormField, fieldType: e.target.value })}>
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
              </select>
            </div>

            <div>
              <label>
                <input 
                  type="checkbox" 
                  checked={newFormField.required}
                  onChange={(e) => setNewFormField({ ...newFormField, required: e.target.checked })}
                />
                Required
              </label>
            </div>

            <button type="button" onClick={addFormField}>Add Field</button>

            {formData.customFormFields.length > 0 && (
              <div style={{ marginTop: "10px" }}>
                <h4>Added Fields:</h4>
                {formData.customFormFields.map((field, idx) => (
                  <div key={idx} style={{ padding: "5px", border: "1px solid #ddd", marginBottom: "5px" }}>
                    <p>{field.fieldName} ({field.fieldType}) {field.required ? "- Required" : ""}</p>
                    <button type="button" onClick={() => removeFormField(idx)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button type="submit" style={{ marginTop: "20px", padding: "10px 20px", fontSize: "16px" }}>Create Draft</button>
      </form>
    </>
  );
};

export default CreateEvent;
