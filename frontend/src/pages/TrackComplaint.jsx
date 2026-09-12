import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function TrackComplaint() {
    const [complaintId, setComplaintId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const trackComplaint = async (targetId) => {
        const idToSearch = (typeof targetId === "string" ? targetId : complaintId).trim();

        if (!idToSearch) {
            setError("Please enter a valid complaint tracking reference number.");
            return;
        }

        setError("");

        try {
            setLoading(true);
            const response = await API.get(`/complaints/track/${idToSearch}/`);
            navigate(`/track/${response.data.complaint_id}`);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError(`No complaint found matching "${idToSearch}". Please check the ID or tracking token.`);
            } else {
                setError("Unable to connect to municipal tracking server. Please check your network.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            trackComplaint();
        }
    };

    const handleSampleClick = (sampleId) => {
        setComplaintId(sampleId);
        trackComplaint(sampleId);
    };

    return (
        <div className="container py-5 position-relative page-enter">
            <div className="hero-orb hero-orb-1"></div>
            <div className="hero-orb hero-orb-2"></div>

            <div className="row justify-content-center position-relative" style={{ zIndex: 2 }}>
                <div className="col-md-8 col-lg-6">

                    <div className="card auth-card shadow-lg border-0">
                        <div className="auth-header py-4">
                            <div className="p-3 rounded-circle bg-white text-success d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "56px", height: "56px" }}>
                                <i className="bi bi-search fs-3"></i>
                            </div>
                            <h3 className="fw-bold mb-1 text-white">Public Grievance Tracker</h3>
                            <p className="small mb-0 text-white-50">
                                Real-time SLA progress, assigned officers & resolution evidence without logging in
                            </p>
                        </div>

                        <div className="card-body p-4 p-md-5">

                            {error && (
                                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-4">
                                    <i className="bi bi-exclamation-triangle-fill flex-shrink-0"></i>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="form-label small fw-semibold text-muted mb-2">
                                    Complaint Reference ID or Tracking Token
                                </label>
                                <div className="input-group input-group-lg shadow-sm">
                                    <span className="input-group-text bg-white border-end-0 text-success">
                                        <i className="bi bi-hash fs-5"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="CF-2026-4821"
                                        value={complaintId}
                                        onChange={(e) => setComplaintId(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        autoFocus
                                    />
                                    <button
                                        className="btn btn-success btn-shimmer px-4 fw-bold"
                                        onClick={() => trackComplaint()}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="spinner-border spinner-border-sm"></span>
                                        ) : (
                                            <>
                                                <i className="bi bi-arrow-right me-1"></i>
                                                Track
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top">
                                <span className="small text-muted fw-semibold">
                                    <i className="bi bi-lightning-charge text-warning me-1"></i>
                                    Sample tracking IDs:
                                </span>
                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="quick-chip-btn fw-mono"
                                        onClick={() => handleSampleClick("CF-2026-4821")}
                                    >
                                        CF-2026-4821
                                    </button>
                                    <button
                                        type="button"
                                        className="quick-chip-btn fw-mono"
                                        onClick={() => handleSampleClick("CF-2026-1001")}
                                    >
                                        CF-2026-1001
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-light rounded-3 d-flex align-items-center gap-3">
                                <div className="text-success fs-3">
                                    <i className="bi bi-qr-code-scan"></i>
                                </div>
                                <div className="small text-muted">
                                    <strong className="text-dark d-block">Have a printed or digital QR pass?</strong>
                                    Point your smartphone camera directly at the QR code on your grievance acknowledgment.
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default TrackComplaint;
