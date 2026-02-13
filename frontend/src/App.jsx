import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider} from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import SignupPage from "./pages/signupPage";
import AuthPage from "./pages/authLandingPage";

const ParticipantDashboard = () => <h2>Participant Dashboard</h2>;
const OrganizerDashboard = () => <h2>Organizer Dashboard</h2>;
const AdminDashboard = () => <h2>Admin Dashboard</h2>;
function App(){
    return(
        <AuthProvider>
            <Router>
                <Routes>
                    {/*Auth routes*/}
                    <Route path="/" element={<AuthPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    {/*Dashboard routes*/}
                    <Route path="/participant/dashboard" element={
                        <ProtectedRoute allowedRoles={["participant"]}>
                            <ParticipantDashboard />
                        </ProtectedRoute>
                    } />
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
            </Router>
        </AuthProvider>
    )
}
export default App;