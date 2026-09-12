import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    const logout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("is_admin");
        localStorage.removeItem("is_officer");
        navigate("/login");
    };

    const isActive = (path) => location.pathname === path ? "active" : "";

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/">
                    <span className="p-1 rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center me-1" style={{ width: "32px", height: "32px" }}>
                        <i className="bi bi-shield-check"></i>
                    </span>
                    CivicFix
                </Link>

                <button
                    className="navbar-toggler border-0"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#civicfixNavbar"
                    aria-controls="civicfixNavbar"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div
                    className="collapse navbar-collapse"
                    id="civicfixNavbar"
                >
                    <div className="navbar-nav ms-auto align-items-lg-center gap-1">
                        <Link className={`nav-link ${isActive("/")}`} to="/">
                            Home
                        </Link>

                        <Link className={`nav-link ${isActive("/track")}`} to="/track">
                            <i className="bi bi-search me-1"></i>
                            Track
                        </Link>

                        {token ? (
                            <>
                                <Link className={`nav-link ${isActive("/dashboard")}`} to="/dashboard">
                                    Dashboard
                                </Link>

                                {role === "admin" && (
                                    <Link
                                        className={`nav-link ${isActive("/admin")}`}
                                        to="/admin"
                                    >
                                        <i className="bi bi-shield-lock me-1"></i>
                                        Admin
                                    </Link>
                                )}

                                {role === "officer" && (
                                    <Link
                                        className={`nav-link ${isActive("/officer")}`}
                                        to="/officer"
                                    >
                                        <i className="bi bi-person-badge me-1"></i>
                                        Officer
                                    </Link>
                                )}

                                <Link className={`nav-link ${isActive("/report")}`} to="/report">
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Report Problem
                                </Link>

                                <Link className={`nav-link ${isActive("/complaints")}`} to="/complaints">
                                    My Complaints
                                </Link>

                                <Link className={`nav-link nav-bell-link position-relative ${isActive("/notifications")}`} to="/notifications">
                                    <i className="bi bi-bell me-1"></i>
                                    Notifications
                                    <span className="position-absolute top-1 start-100 translate-middle p-1 bg-warning border border-light rounded-circle">
                                        <span className="visually-hidden">Alerts</span>
                                    </span>
                                </Link>

                                <Link className={`nav-link ${isActive("/ai-assistant")}`} to="/ai-assistant">
                                    <i className="bi bi-stars me-1 text-warning"></i>
                                    AI Assistant
                                </Link>

                                <div className="d-flex align-items-center ms-lg-2 my-2 my-lg-0 gap-2">
                                    {role && (
                                        <span className="badge bg-white text-success px-2 py-1 small text-capitalize fw-bold">
                                            {role}
                                        </span>
                                    )}

                                    <button
                                        className="btn btn-outline-light btn-sm btn-shimmer px-3"
                                        onClick={logout}
                                    >
                                        <i className="bi bi-box-arrow-right me-1"></i>
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link className={`nav-link ${isActive("/login")}`} to="/login">
                                    Login
                                </Link>

                                <Link className="btn btn-light btn-sm px-3 ms-lg-2 btn-shimmer fw-semibold text-success shadow-sm" to="/register">
                                    <i className="bi bi-person-plus me-1"></i>
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
