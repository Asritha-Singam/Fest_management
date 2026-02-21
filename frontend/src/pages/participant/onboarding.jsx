import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const predefinedInterests = [
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "Cybersecurity",
  "Data Science",
  "Cloud Computing",
  "Blockchain",
  "IoT",
  "Game Development",
  "UI/UX Design",
  "DevOps",
  "Robotics"
];

const Onboarding = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: interests, 2: organizers

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const response = await api.get("/api/participants/organizers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizers(response.data.organizers || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching organizers:", error);
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleOrganizer = (organizerId) => {
    setSelectedOrganizers(prev => 
      prev.includes(organizerId)
        ? prev.filter(id => id !== organizerId)
        : [...prev, organizerId]
    );
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      await api.put(
        "/participants/profile",
        {
          interests: selectedInterests,
          followedOrganizers: selectedOrganizers
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences");
    }
  };

  if (loading) {
    return <div style={styles.container}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome! Let's personalize your experience</h1>
        <p style={styles.subtitle}>
          {step === 1 
            ? "Select your areas of interest to get personalized event recommendations"
            : "Follow organizers to stay updated on their events"
          }
        </p>

        <div style={styles.progressBar}>
          <div style={{...styles.progressStep, backgroundColor: step >= 1 ? "#2E1A47" : "#ddd"}}>1</div>
          <div style={{...styles.progressLine, backgroundColor: step >= 2 ? "#2E1A47" : "#ddd"}}></div>
          <div style={{...styles.progressStep, backgroundColor: step >= 2 ? "#2E1A47" : "#ddd"}}>2</div>
        </div>

        {step === 1 ? (
          <div>
            <h2 style={styles.sectionTitle}>Areas of Interest</h2>
            <div style={styles.grid}>
              {predefinedInterests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  style={{
                    ...styles.optionButton,
                    backgroundColor: selectedInterests.includes(interest) ? "#2E1A47" : "white",
                    color: selectedInterests.includes(interest) ? "white" : "#2E1A47"
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 style={styles.sectionTitle}>Follow Organizers</h2>
            <div style={styles.organizersList}>
              {organizers.length === 0 ? (
                <p style={styles.noData}>No organizers available yet</p>
              ) : (
                organizers.map(organizer => (
                  <div
                    key={organizer._id}
                    onClick={() => toggleOrganizer(organizer._id)}
                    style={{
                      ...styles.organizerCard,
                      borderColor: selectedOrganizers.includes(organizer._id) ? "#2E1A47" : "#ddd",
                      backgroundColor: selectedOrganizers.includes(organizer._id) ? "#f0ebf5" : "white"
                    }}
                  >
                    <div style={styles.checkbox}>
                      {selectedOrganizers.includes(organizer._id) && "✓"}
                    </div>
                    <div>
                      <h3 style={styles.organizerName}>
                        {organizer.firstName} {organizer.lastName}
                      </h3>
                      {organizer.category && (
                        <p style={styles.organizerCategory}>{organizer.category}</p>
                      )}
                      {organizer.description && (
                        <p style={styles.organizerDesc}>{organizer.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div style={styles.buttonContainer}>
          <button onClick={handleSkip} style={styles.skipButton}>
            Skip for now
          </button>
          <button 
            onClick={handleContinue} 
            style={styles.continueButton}
            disabled={step === 1 && selectedInterests.length === 0 && selectedOrganizers.length === 0}
          >
            {step === 1 ? "Continue" : "Finish"}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    maxWidth: "900px",
    width: "100%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  title: {
    fontSize: "28px",
    marginBottom: "10px",
    color: "#2E1A47"
  },
  subtitle: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "30px"
  },
  progressBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "40px"
  },
  progressStep: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "bold"
  },
  progressLine: {
    width: "100px",
    height: "4px",
    margin: "0 10px"
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "20px",
    color: "#2E1A47"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "15px",
    marginBottom: "30px"
  },
  optionButton: {
    padding: "12px 20px",
    border: "2px solid #2E1A47",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s"
  },
  organizersList: {
    maxHeight: "400px",
    overflowY: "auto",
    marginBottom: "30px"
  },
  organizerCard: {
    display: "flex",
    alignItems: "flex-start",
    padding: "15px",
    border: "2px solid",
    borderRadius: "8px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  checkbox: {
    width: "24px",
    height: "24px",
    border: "2px solid #2E1A47",
    borderRadius: "4px",
    marginRight: "15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    flexShrink: 0
  },
  organizerName: {
    margin: "0 0 5px 0",
    fontSize: "16px",
    color: "#2E1A47"
  },
  organizerCategory: {
    margin: "0 0 5px 0",
    fontSize: "12px",
    color: "#666",
    fontWeight: "bold"
  },
  organizerDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#666"
  },
  noData: {
    textAlign: "center",
    color: "#999",
    padding: "40px"
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px"
  },
  skipButton: {
    padding: "12px 30px",
    backgroundColor: "white",
    color: "#666",
    border: "2px solid #ddd",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500"
  },
  continueButton: {
    padding: "12px 30px",
    backgroundColor: "#2E1A47",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500"
  }
};

export default Onboarding;
