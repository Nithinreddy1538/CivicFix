import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import "./Login.css";

const loginRoles = [
    {
        id: "citizen",
        title: "Citizen",
        detail: "Sign in with your username or registered email",
        icon: "bi-people",
        badge: "Community portal",
    },
    {
        id: "officer",
        title: "Agent / Officer",
        detail: "Use the email address and password assigned by your admin",
        icon: "bi-person-badge",
        badge: "Field operations",
    },
    {
        id: "admin",
        title: "Administrator",
        detail: "Sign in with the Admin username and password",
        icon: "bi-building-gear",
        badge: "Management portal",
    },
];

function Login() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState("citizen");
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const roleInfo = loginRoles.find((role) => role.id === selectedRole);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await API.post("/accounts/login/", { username: identifier, password });
            const actualRole = response.data.role;

            if (actualRole !== selectedRole) {
                setError(`This account is registered as ${actualRole === "officer" ? "an agent / officer" : `a ${actualRole}`}. Choose the matching login and try again.`);
                return;
            }

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("role", actualRole);
            localStorage.setItem("is_admin", response.data.is_admin);
            localStorage.setItem("is_officer", response.data.is_officer);

            navigate(actualRole === "admin" ? "/admin" : actualRole === "officer" ? "/officer" : "/dashboard");
        } catch (loginError) {
            setError(loginError.response?.data?.message || "Invalid username or password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page page-enter">
            <div className="login-glow login-glow-one" aria-hidden="true" />
            <div className="login-glow login-glow-two" aria-hidden="true" />

            <div className="login-shell">
                <section className="login-intro" aria-labelledby="login-heading">
                    <Link to="/" className="login-brand" aria-label="CivicFix home">
                        <span className="login-brand-mark"><i className="bi bi-buildings" /></span>
                        <span>Civic<span>Fix</span></span>
                    </Link>
                    <div className="login-intro-copy">
                        <span className="login-eyebrow"><span /> YOUR CITY, BETTER TOGETHER</span>
                        <h1 id="login-heading">Good to have<br />you <em>back.</em></h1>
                        <p>One place to raise concerns, coordinate local action, and make progress visible.</p>
                    </div>
                    <div className="login-trust-note">
                        <span className="login-trust-icon"><i className="bi bi-shield-check" /></span>
                        <span><strong>A more responsive city starts here.</strong><small>Secure access for every CivicFix community member.</small></span>
                    </div>
                    <span className="login-decorative-number" aria-hidden="true">01</span>
                </section>

                <section className="login-panel" aria-label="Sign in">
                    <div className="login-panel-heading">
                        <span className="login-kicker">CIVICFIX ACCOUNT</span>
                        <h2>Sign in to continue</h2>
                        <p>Choose your workspace to get started.</p>
                    </div>

                    <div className="login-role-grid" role="group" aria-label="Choose your account type">
                        {loginRoles.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                className={`login-role-option${selectedRole === role.id ? " is-selected" : ""}`}
                                aria-pressed={selectedRole === role.id}
                                onClick={() => { setSelectedRole(role.id); setError(""); }}
                            >
                                <span className="login-role-icon"><i className={`bi ${role.icon}`} /></span>
                                <span className="login-role-copy"><strong>{role.title}</strong><small>{role.badge}</small></span>
                                <span className="login-role-check"><i className="bi bi-check2" /></span>
                            </button>
                        ))}
                    </div>

                    <div className="login-selected-note"><i className={`bi ${roleInfo.icon}`} /><span>{roleInfo.detail}</span></div>

                    {error && <div className="login-error" role="alert"><i className="bi bi-exclamation-circle-fill" /><span>{error}</span></div>}

                    <form className="login-form" onSubmit={handleSubmit}>
                        <label className="login-field-label" htmlFor="login-username">
                            {selectedRole === "officer" ? "Agent email address" : selectedRole === "admin" ? "Admin username" : "Username or email"}
                        </label>
                        <div className="login-input-wrap">
                            <i className={`bi ${selectedRole === "officer" || (selectedRole === "citizen" && identifier.includes("@")) ? "bi-envelope" : "bi-person"}`} aria-hidden="true" />
                            <input
                                id="login-username"
                                type={selectedRole === "officer" ? "email" : "text"}
                                autoComplete="username"
                                placeholder={selectedRole === "officer" ? "name@municipality.gov" : selectedRole === "admin" ? "Admin" : "Username or email address"}
                                value={identifier}
                                onChange={(event) => setIdentifier(event.target.value)}
                                required
                            />
                        </div>

                        <div className="login-password-heading">
                            <label className="login-field-label" htmlFor="login-password">Password</label>
                            {selectedRole !== "admin" && <Link className="login-forgot-link" to="/forgot-password">Forgot password?</Link>}
                        </div>
                        <div className="login-input-wrap">
                            <i className="bi bi-lock" aria-hidden="true" />
                            <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                            <button className="login-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}><i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} /></button>
                        </div>

                        <button className="login-submit" type="submit" disabled={loading}>
                            {loading ? <><span className="spinner-border spinner-border-sm" /> Signing you in…</> : <>Continue to {roleInfo.title}<i className="bi bi-arrow-right" /></>}
                        </button>
                    </form>

                    <div className="login-register">New to CivicFix? <Link to="/register">Create a citizen account <i className="bi bi-arrow-up-right" /></Link></div>
                    <div className="login-panel-footer"><i className="bi bi-lock-fill" /> Your account details are protected</div>
                </section>
            </div>
        </main>
    );
}

export default Login;
