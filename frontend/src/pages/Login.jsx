import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await API.post("/accounts/login/", {
                username,
                password
            });

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("role", response.data.role);
            localStorage.setItem("is_admin", response.data.is_admin);
            localStorage.setItem("is_officer", response.data.is_officer);

            if (response.data.role === "admin") {
                navigate("/admin");
            } else if (response.data.role === "officer") {
                navigate("/officer");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Invalid username or password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 position-relative page-enter">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>

            <div className="row justify-content-center position-relative" style={{ zIndex: 2 }}>
                <div className="col-md-5 col-lg-4">

                    <div className="auth-card shadow-lg">
                        <div className="auth-header">
                            <div className="p-2 rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "48px", height: "48px" }}>
                                <i className="bi bi-shield-lock fs-4"></i>
                            </div>
                            <h4 className="fw-bold mb-1">Welcome Back</h4>
                            <p className="small mb-0 opacity-75">Sign in to your CivicFix portal</p>
                        </div>

                        <div className="card-body p-4">

                            {error && (
                                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2">
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted">
                                        Username
                                    </label>
                                    <div className="input-icon-wrapper">
                                        <i className="bi bi-person"></i>
                                        <input
                                            className="form-control"
                                            placeholder="Enter your username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold text-muted">
                                        Password
                                    </label>
                                    <div className="input-icon-wrapper position-relative">
                                        <i className="bi bi-key"></i>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="form-control pe-5"
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted text-decoration-none pe-3"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-success btn-shimmer w-100 py-2 shadow-sm fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Sign In
                                        </>
                                    )}
                                </button>

                            </form>

                            <div className="text-center mt-4 pt-3 border-top">
                                <span className="small text-muted">Don't have an account? </span>
                                <Link to="/register" className="small text-success fw-bold text-decoration-none">
                                    Create Account
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Login;
