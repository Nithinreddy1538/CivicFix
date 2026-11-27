import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import "./ForgotPassword.css";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [recoveryCode, setRecoveryCode] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [codeSent, setCodeSent] = useState(false);
    const [accountVerified, setAccountVerified] = useState(false);
    const [complete, setComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const requestRecoveryCode = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await API.post("/accounts/password-reset/request/", { email });
            setCodeSent(true);
            setAccountVerified(false);
            setResetToken("");
            setRecoveryCode("");
            setPassword("");
            setConfirmPassword("");
            setNotice(response.data.message);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not send a recovery code. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const verifyRecoveryCode = async (event) => {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await API.post("/accounts/password-reset/verify-recovery-code/", {
                email,
                recovery_code: recoveryCode,
            });
            setResetToken(response.data.reset_token);
            setAccountVerified(true);
            setNotice(response.data.message);
        } catch (verifyError) {
            setError(verifyError.response?.data?.message || "The recovery code could not be verified. Check it and try again.");
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
            setError(resetError.response?.data?.message || "Could not reset the password. Request a new recovery code and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="reset-page page-enter">
            <section className="reset-card" aria-labelledby="reset-title">
                <Link to="/login" className="reset-brand">
                    <span><i className="bi bi-shield-check" /></span> Fixora
                </Link>
                <div className="reset-icon"><i className={`bi ${complete ? "bi-check2-circle" : accountVerified ? "bi-unlock" : codeSent ? "bi-shield-lock" : "bi-key"}`} /></div>
                <span className="reset-eyebrow">ACCOUNT RECOVERY</span>
                <h1 id="reset-title">{complete ? "Password updated" : accountVerified ? "Choose a new password" : codeSent ? "Verify your account" : "Forgot your password?"}</h1>
                <p className="reset-description">
                    {complete
                        ? "Your password has been changed. You can now sign in with it."
                        : accountVerified
                            ? "Your recovery code is verified. Set and confirm a new password for your account."
                            : codeSent
                                ? "Enter the recovery code sent to your registered email. New-password fields appear after verification. The code expires in 10 minutes."
                                : "Enter the email registered to your citizen or officer account. We’ll send a recovery code to that address."}
                </p>

                {error && <div className="reset-alert reset-alert-error" role="alert"><i className="bi bi-exclamation-circle" />{error}</div>}
                {notice && !error && <div className="reset-alert reset-alert-info" role="status"><i className="bi bi-info-circle" />{notice}</div>}

                {!complete && !codeSent && <form onSubmit={requestRecoveryCode}>
                    <label htmlFor="reset-email">Registered email</label>
                    <div className="reset-input-wrap"><i className="bi bi-envelope" /><input id="reset-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required /></div>
                    <button className="reset-submit" type="submit" disabled={loading}>
                        {loading ? "Checking account…" : "Verify email"}<i className="bi bi-arrow-right" />
                    </button>
                </form>}

                {!complete && codeSent && !accountVerified && <form onSubmit={verifyRecoveryCode}>
                    <div className="reset-email-summary"><i className="bi bi-envelope-check" /><span>Recovery code sent to <strong>{email}</strong></span></div>
                    <label htmlFor="recovery-code">Recovery code</label>
                    <div className="reset-input-wrap"><i className="bi bi-shield-lock" /><input id="recovery-code" type="text" autoComplete="off" minLength={30} maxLength={100} value={recoveryCode} onChange={event => setRecoveryCode(event.target.value.trim())} placeholder="Paste your emailed recovery code" required /></div>
                    <button className="reset-submit" type="submit" disabled={loading || recoveryCode.length < 30}>
                        {loading ? "Verifying account…" : "Verify recovery code"}<i className="bi bi-shield-check" />
                    </button>
                    <button className="reset-text-button" type="button" disabled={loading} onClick={requestRecoveryCode}>Send a new recovery code</button>
                </form>}

                {!complete && accountVerified && <form onSubmit={resetPassword}>
                    <div className="reset-email-summary"><i className="bi bi-patch-check-fill" /><span>Verified account <strong>{email}</strong></span></div>
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
