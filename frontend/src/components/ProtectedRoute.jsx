import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        const homeByRole = {
            admin: "/admin",
            officer: "/officer",
            citizen: "/dashboard",
        };
        return <Navigate to={homeByRole[role] || "/login"} replace />;
    }

    return children;
}

export default ProtectedRoute;
