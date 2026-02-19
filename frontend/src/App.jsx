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
import Onboarding from "./pages/participant/onboarding";
import OrganizersList from "./pages/participant/organizersList";
import OrganizerDetail from "./pages/participant/organizerDetail";
import EventDetail from "./pages/participant/eventDetail";
import Navbar from "./components/participantNavbar";
import OrganizerDashboard from "./pages/organizer/organizerDashboard";
import OrganizerEventDetail from "./pages/organizer/organizerEventDetail";
import CreateEvent from "./pages/organizer/createEvent";
import OrganizerProfile from "./pages/organizer/organizerProfile";
import OngoingEvents from "./pages/organizer/ongoingEvents";
import AdminDashboardComponent from "./pages/admin/adminDashboard";
import CreateOrganizer from "./pages/admin/createOrganizer";
import PasswordResetRequests from "./pages/admin/passwordResetRequests";
import SecurityDashboard from "./pages/admin/securityDashboard";

function AppContent() {
    const { token, role } = useContext(AuthContext);
    const location = useLocation();
    
    // Show navbar only for authenticated participants and not on auth pages
    const showNavbar = token && role === "participant" && 
                       !["/", "/login", "/signup", "/onboarding"].includes(location.pathname);

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
                        path="/onboarding"
                        element={
                        <ProtectedRoute allowedRoles={["participant"]}>
                            <Onboarding />
                        </ProtectedRoute>
                        }
                    />

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
                    <Route
                        path="/organizers"
                        element={
                            <ProtectedRoute allowedRoles={["participant"]}>
                                <OrganizersList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/organizer/:id"
                        element={
                            <ProtectedRoute allowedRoles={["participant"]}>
                                <OrganizerDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/event/:id"
                        element={
                            <ProtectedRoute allowedRoles={["participant"]}>
                                <EventDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/organizer/dashboard" element={
                        
                        <ProtectedRoute allowedRoles={["organizer"]}>
                            <OrganizerDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/organizer/events/:id" element={
                        <ProtectedRoute allowedRoles={["organizer"]}>
                            <OrganizerEventDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/organizer/my-events/:id" element={
                        <ProtectedRoute allowedRoles={["organizer"]}>
                            <OrganizerEventDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/organizer/ongoing" element={
                        <ProtectedRoute allowedRoles={["organizer"]}>
                            <OngoingEvents />
                        </ProtectedRoute>
                    } />
                    <Route path="/organizer/create-event" element={
                        <ProtectedRoute allowedRoles={["organizer"]}>
                            <CreateEvent />
                        </ProtectedRoute>
                    } />
                    <Route path="/organizer/profile" element={
                        <ProtectedRoute allowedRoles={["organizer"]}>
                            <OrganizerProfile />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboardComponent />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/create-organizer" element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <CreateOrganizer />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/password-reset-requests" element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <PasswordResetRequests />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/security" element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <SecurityDashboard />
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