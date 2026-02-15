import { useState } from "react";

const Profile = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    collegeOrOrg: "",
    interests: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/api/participants/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...form,
        interests: form.interests.split(",")
      })
    });

    alert("Profile updated");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Profile</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="First Name"
          onChange={(e) =>
            setForm({ ...form, firstName: e.target.value })
          }
        />

        <input
          placeholder="Last Name"
          onChange={(e) =>
            setForm({ ...form, lastName: e.target.value })
          }
        />

        <input
          placeholder="Contact Number"
          onChange={(e) =>
            setForm({ ...form, contactNumber: e.target.value })
          }
        />

        <input
          placeholder="College / Org"
          onChange={(e) =>
            setForm({ ...form, collegeOrOrg: e.target.value })
          }
        />

        <input
          placeholder="Interests (comma separated)"
          onChange={(e) =>
            setForm({ ...form, interests: e.target.value })
          }
        />

        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default Profile;
