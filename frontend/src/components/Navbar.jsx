import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../api";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("access");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const [unreadCount, setUnreadCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const refreshUnreadCount = useCallback(async () => {
        if (!token) {
            setUnreadCount(0);
            return;
        }
        try {
            const response = await API.get("/notifications/");
            setUnreadCount(response.data.filter(item => !item.is_read).length);
        } catch {
            // Keep the rest of the navigation usable if the notification service is offline.
        }
    }, [token]);

    useEffect(() => {
        refreshUnreadCount();
        const interval = window.setInterval(refreshUnreadCount, 60000);
        window.addEventListener("focus", refreshUnreadCount);
        window.addEventListener("notifications-updated", refreshUnreadCount);
        return () => {
            window.clearInterval(interval);
            window.removeEventListener("focus", refreshUnreadCount);
            window.removeEventListener("notifications-updated", refreshUnreadCount);
        };
    }, [refreshUnreadCount, location.pathname]);

    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

    useEffect(() => {
        if (!menuOpen) return undefined;
        const closeOnEscape = (event) => {
            if (event.key === "Escape") closeMenu();
        };
        const closeOnDesktop = () => {
            if (window.innerWidth >= 992) closeMenu();
        };
        document.body.classList.add("civicfix-menu-open");
        window.addEventListener("keydown", closeOnEscape);
        window.addEventListener("resize", closeOnDesktop);
        return () => {
            document.body.classList.remove("civicfix-menu-open");
            window.removeEventListener("keydown", closeOnEscape);
            window.removeEventListener("resize", closeOnDesktop);
        };
    }, [menuOpen]);

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
    const adminSections = [
        { id: "admin-overview", label: "Overview", icon: "bi-speedometer2" },
        { id: "admin-complaints", label: "Complaints", icon: "bi-clipboard-check" },
        { id: "admin-analytics", label: "Analytics", icon: "bi-graph-up-arrow" },
        { id: "admin-agents", label: "Agents & Officers", icon: "bi-person-badge" },
        { id: "admin-accounts", label: "Citizen Accounts", icon: "bi-people" },
    ];

    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm civicfix-navbar">
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
                    aria-controls="civicfixNavbar"
                    aria-expanded={menuOpen}
                    aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
                    onClick={() => setMenuOpen(open => !open)}
                >
                    <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`} aria-hidden="true"></i>
                </button>

                <div
                    className={`navbar-collapse civicfix-nav-drawer ${menuOpen ? "is-open" : ""}`}
                    id="civicfixNavbar"
                >
                    <div className="civicfix-drawer-heading d-lg-none">
                        <span className="small text-uppercase fw-bold">Navigation</span>
                        <button type="button" className="btn-close" aria-label="Close navigation menu" onClick={closeMenu}></button>
                    </div>
                    <div className="navbar-nav ms-auto align-items-lg-center gap-1">
                        <Link onClick={closeMenu} className={`nav-link ${isActive("/")}`} to="/">
                            Home
                        </Link>

                        <Link onClick={closeMenu} className={`nav-link ${isActive("/track")}`} to="/track">
                            <i className="bi bi-search me-1"></i>
                            Track
                        </Link>

                        {token ? (
                            <>
                                {role === "citizen" && (
                                    <Link onClick={closeMenu} className={`nav-link ${isActive("/dashboard")}`} to="/dashboard">
                                        Dashboard
                                    </Link>
                                )}

                                {role === "admin" && (
                                    <>
                                        <Link
                                            className={`nav-link ${isActive("/admin")}`}
                                            to="/admin"
                                            onClick={closeMenu}
                                        >
                                            <i className="bi bi-shield-lock me-1"></i>
                                            Admin Console
                                        </Link>
                                        <div className="nav-item dropdown">
                                            <button
                                                className="nav-link dropdown-toggle border-0 bg-transparent"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                aria-expanded="false"
                                            >
                                                <i className="bi bi-sliders me-1"></i>
                                                Manage
                                            </button>
                                            <ul className="dropdown-menu dropdown-menu-end">
                                                {adminSections.map((section) => (
                                                    <li key={section.id}>
                                                        <Link
                                                            className="dropdown-item"
                                                            to={`/admin#${section.id}`}
                                                            onClick={() => {
                                                                closeMenu();
                                                                if (location.pathname === "/admin") {
                                                                    window.setTimeout(() => {
                                                                        document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                                                                    }, 0);
                                                                }
                                                            }}
                                                        >
                                                            <i className={`bi ${section.icon} me-2`}></i>
                                                            {section.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </>
                                )}

                                {role === "officer" && (
                                    <Link
                                        onClick={closeMenu}
                                        className={`nav-link ${isActive("/officer")}`}
                                        to="/officer"
                                    >
                                        <i className="bi bi-person-badge me-1"></i>
                                        Agent Workspace
                                    </Link>
                                )}

                                {role === "citizen" && (
                                    <>
                                        <Link onClick={closeMenu} className={`nav-link ${isActive("/report")}`} to="/report">
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Report Problem
                                        </Link>

                                        <Link onClick={closeMenu} className={`nav-link ${isActive("/complaints")}`} to="/complaints">
                                            My Complaints
                                        </Link>
                                    </>
                                )}

                                <Link onClick={closeMenu} className={`nav-link nav-bell-link position-relative ${isActive("/notifications")}`} to="/notifications">
                                    <i className="bi bi-bell me-1"></i>
                                    Notifications
                                    {unreadCount > 0 && <span className="badge rounded-pill bg-warning text-dark ms-1" aria-label={`${unreadCount} unread notifications`}>
                                        {unreadCount > 99 ? "99+" : unreadCount}
                                    </span>}
                                </Link>

                                <Link onClick={closeMenu} className={`nav-link ${isActive("/ai-assistant")}`} to="/ai-assistant">
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
                                <Link onClick={closeMenu} className={`nav-link ${isActive("/login")}`} to="/login">
                                    Login
                                </Link>

                                <Link onClick={closeMenu} className="btn btn-light btn-sm px-3 ms-lg-2 btn-shimmer fw-semibold text-success shadow-sm" to="/register">
                                    <i className="bi bi-person-plus me-1"></i>
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {menuOpen && <button className="civicfix-nav-backdrop d-lg-none" aria-label="Close navigation menu" onClick={closeMenu} />}
        </nav>
    );
}

export default Navbar;
