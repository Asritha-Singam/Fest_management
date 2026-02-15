import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider} from "./context/AuthContext";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import LoginPage from "./pages/public/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SignupPage from "./pages/public/signupPage";
import AuthPage from "./pages/public/authLandingPage";
import BrowseEvents from "./pages/participant/browseEvents";
import Dashboard from "./pages/participant/dashboard";
import TicketPage from "./pages/participant/ticketPage";
import Profile from "./pages/participant/profile";
import Navbar from "./components/participantNavbar";
const OrganizerDashboard = () => <h2>Organizer Dashboard</h2>;
const AdminDashboard = () => <h2>Admin Dashboard</h2>;

function AppContent() {
    const { token, role } = useContext(AuthContext);
    const location = useLocation();
    
    // Show navbar only for authenticated participants and not on auth pages
    const showNavbar = token && role === "participant" && 
                       !["/", "/login", "/signup"].includes(location.pathname);

    return (
        <>
            {showNavbar && <Navbar />}
            <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Protected Participant Routes */}
                    <Route
                        path="/dashboard"
                        element={
                        <ProtectedRoute allowedRoles={["participant"]}>
                            <Dashboard />
                        </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/browse"
                        element={
                        <ProtectedRoute allowedRoles={["participant"]}>
                            <BrowseEvents />
                        </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/ticket/:ticketId"
                        element={
                            <ProtectedRoute allowedRoles={["participant"]}>
                                <TicketPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute allowedRoles={["participant"]}>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/organizer/dashboard" element={
                        
                        <ProtectedRoute allowedRoles={["organizer"]}>
                            <OrganizerDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                </Routes>
        </>
    );
}

function App(){
    return(
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    )
}
export default App;