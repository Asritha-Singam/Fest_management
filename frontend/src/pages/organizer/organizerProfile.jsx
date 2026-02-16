import { useEffect, useState, useContext } from "react";
import OrganizerNavbar from "../../components/organizerNavbar";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const OrganizerProfile = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/organizer/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.organizer);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(
        "/organizer/profile",
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchProfile();
      setEditData({});
      alert("Profile updated");

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <OrganizerNavbar />
      <h2>Organizer Profile</h2>

      <p><strong>Login Email:</strong> {profile.email}</p>

      <input
        placeholder="First Name"
        defaultValue={profile.firstName}
        onChange={(e) =>
          setEditData({ ...editData, firstName: e.target.value })
        }
      />

      <input
        placeholder="Last Name"
        defaultValue={profile.lastName}
        onChange={(e) =>
          setEditData({ ...editData, lastName: e.target.value })
        }
      />

      <input
        placeholder="Category"
        defaultValue={profile.category}
        onChange={(e) =>
          setEditData({ ...editData, category: e.target.value })
        }
      />

      <textarea
        placeholder="Description"
        defaultValue={profile.description}
        onChange={(e) =>
          setEditData({ ...editData, description: e.target.value })
        }
      />

      <input
        placeholder="Contact Email"
        defaultValue={profile.contactEmail}
        onChange={(e) =>
          setEditData({ ...editData, contactEmail: e.target.value })
        }
      />

      <input
        placeholder="Contact Number"
        defaultValue={profile.contactNumber}
        onChange={(e) =>
          setEditData({ ...editData, contactNumber: e.target.value })
        }
      />

      <button onClick={handleUpdate}>Save Changes</button>
    </>
  );
};

export default OrganizerProfile;
