import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [resetToken, setResetToken] = useState("");
    const [complete, setComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const requestCode = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await API.post("/accounts/password-reset/request/", { email });
            setCodeSent(true);
            setEmailVerified(false);
            setResetToken("");
            setCode("");
            setPassword("");
            setConfirmPassword("");
            setError("");
            setNotice(response.data.message);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not send a reset code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const [notice, setNotice] = useState("");

    const verifyCode = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await API.post("/accounts/password-reset/verify-code/", { email, code });
            setResetToken(response.data.reset_token);
            setEmailVerified(true);
            setNotice(response.data.message);
        } catch (verifyError) {
            setError(verifyError.response?.data?.message || "That code could not be verified. Check it and try again.");
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
            setError(resetError.response?.data?.message || "Could not reset the password. Check the code and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="reset-page page-enter">
            <section className="reset-card" aria-labelledby="reset-title">
                <Link to="/login" className="reset-brand">
                    <span><i className="bi bi-shield-check" /></span> CivicFix
                </Link>
                <div className="reset-icon"><i className={`bi ${complete ? "bi-check2-circle" : emailVerified ? "bi-lock" : codeSent ? "bi-envelope-check" : "bi-key"}`} /></div>
                <span className="reset-eyebrow">ACCOUNT RECOVERY</span>
                <h1 id="reset-title">{complete ? "Password updated" : emailVerified ? "Choose a new password" : codeSent ? "Verify your account" : "Forgot your password?"}</h1>
                <p className="reset-description">
                    {complete
                        ? "Your password has been changed. You can now sign in with it."
                        : emailVerified
                            ? "Your email is verified. Set and confirm a new password for your account."
                            : codeSent
                                ? "Enter the six-digit code sent to your registered email. Your new-password fields will appear after the code is verified. The code expires in 10 minutes."
                            : "Enter the email address registered to your citizen or officer account. We’ll send a one-time code to verify it’s yours."}
                </p>

                {error && <div className="reset-alert reset-alert-error" role="alert"><i className="bi bi-exclamation-circle" />{error}</div>}
                {notice && !error && <div className="reset-alert reset-alert-info" role="status"><i className="bi bi-info-circle" />{notice}</div>}

                {!complete && !codeSent && <form onSubmit={requestCode}>
                    <label htmlFor="reset-email">Registered email</label>
                    <div className="reset-input-wrap"><i className="bi bi-envelope" /><input id="reset-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
                    <button className="reset-submit" type="submit" disabled={loading}>
                        {loading ? "Sending code…" : "Send reset code"}<i className="bi bi-arrow-right" />
                    </button>
                </form>}

                {!complete && codeSent && !emailVerified && <form onSubmit={verifyCode}>
                    <div className="reset-email-summary"><i className="bi bi-envelope-check" /><span>Code sent to <strong>{email}</strong></span></div>
                    <label htmlFor="reset-code">Six-digit email code</label>
                    <div className="reset-input-wrap"><i className="bi bi-shield-lock" /><input id="reset-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" required /></div>
                    <button className="reset-submit" type="submit" disabled={loading || code.length !== 6}>
                        {loading ? "Verifying account…" : "Verify account"}<i className="bi bi-shield-check" />
                    </button>
                    <button className="reset-text-button" type="button" disabled={loading} onClick={requestCode}>Send a new code</button>
                </form>}

                {!complete && emailVerified && <form onSubmit={resetPassword}>
                    <label htmlFor="new-password">New password</label>
                    <div className="reset-input-wrap"><i className="bi bi-lock" /><input id="new-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 8 characters" required /></div>
                    <label htmlFor="confirm-password">Retype new password</label>
                    <div className="reset-input-wrap"><i className="bi bi-lock-fill" /><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} placeholder="Enter the same password again" required /></div>
                    <button className="reset-submit" type="submit" disabled={loading || !resetToken}>
                        {loading ? "Updating password…" : "Update password"}<i className="bi bi-arrow-right" />
                    </button>
                </form>}

                {complete && <Link className="reset-submit reset-signin" to="/login">Back to sign in<i className="bi bi-arrow-right" /></Link>}
                {!complete && <Link className="reset-back-link" to="/login"><i className="bi bi-arrow-left" /> Back to sign in</Link>}
            </section>
        </main>
    );
}

export default ForgotPassword;
