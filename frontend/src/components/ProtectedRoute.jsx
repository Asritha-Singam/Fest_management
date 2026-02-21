import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { token, role } = useContext(AuthContext);

    //if someone is not logged in
    if (!token) {
        return <Navigate to="/" replace />;
    }

    //logined but wrong route
    if(allowedRoles && !allowedRoles.includes(role)){
        return <Navigate to="/" replace />;
    }

    //allowed
    return children;
}

export default ProtectedRoute;