import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [accountVerified, setAccountVerified] = useState(false);
    const [complete, setComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const verifyEmail = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        setLoading(true);
        try {
            const response = await API.post("/accounts/password-reset/verify-email/", { email });
            setResetToken(response.data.reset_token);
            setAccountVerified(true);
            setNotice(response.data.message || "Registered email verified. Choose a new password.");
        } catch (verifyError) {
            setError(verifyError.response?.data?.message || "This email is not registered. Enter the email used for your account.");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (event) => {
        event.preventDefault();
        setError("");
        if (password !== confirmPassword) {
            setError("The new passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const response = await API.post("/accounts/password-reset/confirm/", {
                email,
                reset_token: resetToken,
                new_password: password,
                confirm_password: confirmPassword,
            });
            setNotice(response.data.message);
            setComplete(true);
        } catch (resetError) {
            setError(resetError.response?.data?.message || "Could not reset the password. Verify your registered email again.");
        } finally {
            setLoading(false);
        }
    };

    const changeEmail = () => {
        setAccountVerified(false);
        setResetToken("");
        setPassword("");
        setConfirmPassword("");
        setError("");
        setNotice("");
    };

    return (
        <main className="reset-page auth-page-background page-enter">
            <section className="reset-card" aria-labelledby="reset-title">
                <Link to="/login" className="reset-brand">
                    <span><i className="bi bi-shield-check" /></span> Fixora
                </Link>
                <div className="reset-icon"><i className={`bi ${complete ? "bi-check2-circle" : accountVerified ? "bi-unlock" : "bi-key"}`} /></div>
                <span className="reset-eyebrow">ACCOUNT RECOVERY</span>
                <h1 id="reset-title">{complete ? "Password updated" : accountVerified ? "Choose a new password" : "Forgot your password?"}</h1>
                <p className="reset-description">
                    {complete
                        ? "Your password has been changed. You can now sign in with it."
                        : accountVerified
                            ? "Your registered email matches an active account. Set and confirm a new password."
                            : "Enter the email address registered to your citizen or officer account, then verify it to continue."}
                </p>

                {error && <div className="reset-alert reset-alert-error" role="alert"><i className="bi bi-exclamation-circle" />{error}</div>}
                {notice && !error && <div className="reset-alert reset-alert-info" role="status"><i className="bi bi-info-circle" />{notice}</div>}

                {!complete && !accountVerified && <form onSubmit={verifyEmail}>
                    <label htmlFor="reset-email">Registered email</label>
                    <div className="reset-input-wrap"><i className="bi bi-envelope" /><input id="reset-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
                    <button className="reset-submit" type="submit" disabled={loading || !email.trim()}>
                        {loading ? "Verifying email…" : "Verify email"}<i className="bi bi-arrow-right" />
                    </button>
                </form>}

                {!complete && accountVerified && <form onSubmit={resetPassword}>
                    <div className="reset-email-summary"><i className="bi bi-patch-check-fill" /><span>Registered account <strong>{email}</strong></span></div>
                    <label htmlFor="new-password">New password</label>
                    <div className="reset-input-wrap"><i className="bi bi-lock" /><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" required /></div>
                    <label htmlFor="confirm-password">Retype new password</label>
                    <div className="reset-input-wrap"><i className="bi bi-lock-fill" /><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Enter the same password again" required /></div>
                    <button className="reset-submit" type="submit" disabled={loading || !resetToken}>
                        {loading ? "Updating password…" : "Update password"}<i className="bi bi-arrow-right" />
                    </button>
                    <button className="reset-text-button" type="button" disabled={loading} onClick={changeEmail}>Use a different email</button>
                </form>}

                {complete && <Link className="reset-submit reset-signin" to="/login">Back to sign in<i className="bi bi-arrow-right" /></Link>}
                {!complete && <Link className="reset-back-link" to="/login"><i className="bi bi-arrow-left" /> Back to sign in</Link>}
            </section>
        </main>
    );
}

export default ForgotPassword;
