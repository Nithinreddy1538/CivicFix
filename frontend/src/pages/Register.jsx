import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await API.post("/accounts/register/", form);
            alert("Account registered successfully! Please log in.");
            navigate("/login");
        } catch (error) {
            setError(
                typeof error.response?.data === "object"
                    ? Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(", ")
                    : "Registration failed. Please check your information."
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
                <div className="col-md-7 col-lg-6">

                    <div className="auth-card shadow-lg">
                        <div className="auth-header">
                            <div className="p-2 rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "48px", height: "48px" }}>
                                <i className="bi bi-person-badge fs-4"></i>
                            </div>
                            <h4 className="fw-bold mb-1">Citizen Registration</h4>
                            <p className="small mb-0 opacity-75">Create your profile to file grievances and track resolutions</p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            {error && (
                                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
                                    <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            First Name
                                        </label>
                                        <div className="input-icon-wrapper">
                                            <i className="bi bi-person"></i>
                                            <input
                                                className="form-control"
                                                name="first_name"
                                                placeholder="e.g. Rahul"
                                                value={form.first_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            Last Name
                                        </label>
                                        <div className="input-icon-wrapper">
                                            <i className="bi bi-person"></i>
                                            <input
                                                className="form-control"
                                                name="last_name"
                                                placeholder="e.g. Sharma"
                                                value={form.last_name}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label small fw-semibold text-muted">
                                        Username
                                    </label>
                                    <div className="input-icon-wrapper">
                                        <i className="bi bi-at"></i>
                                        <input
                                            className="form-control"
                                            name="username"
                                            placeholder="Choose a username"
                                            value={form.username}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="row g-3 mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            Email Address
                                        </label>
                                        <div className="input-icon-wrapper">
                                            <i className="bi bi-envelope"></i>
                                            <input
                                                type="email"
                                                className="form-control"
                                                name="email"
                                                placeholder="name@example.com"
                                                value={form.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label small fw-semibold text-muted">
                                            Mobile Phone
                                        </label>
                                        <div className="input-icon-wrapper">
                                            <i className="bi bi-telephone"></i>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                name="phone"
                                                placeholder="10-digit number"
                                                value={form.phone}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small fw-semibold text-muted">
                                        Password
                                    </label>
                                    <div className="input-icon-wrapper">
                                        <i className="bi bi-lock"></i>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            placeholder="Create a strong password"
                                            value={form.password}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    className="btn btn-success btn-shimmer w-100 py-2 shadow-sm fw-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-person-check me-2"></i>
                                            Create Citizen Account
                                        </>
                                    )}
                                </button>

                            </form>

                            <div className="text-center mt-4 pt-3 border-top">
                                <span className="small text-muted">Already registered with CivicFix? </span>
                                <Link to="/login" className="small text-success fw-bold text-decoration-none">
                                    Sign In here
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Register;
