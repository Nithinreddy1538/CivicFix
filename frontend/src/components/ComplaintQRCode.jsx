import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

function ComplaintQRCode({ complaint }) {
    const [copied, setCopied] = useState(false);

    const trackingUrl =
        `${window.location.origin}/track/${complaint.complaint_id}`;

    const copyTrackingLink = () => {
        navigator.clipboard.writeText(trackingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="card qr-scanner-card shadow-sm mt-4">
            <div className="card-body text-center p-4">

                <div className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-2 rounded-pill hero-badge">
                    <span className="badge-pulse-dot"></span>
                    <small className="fw-semibold">Tamper-Proof Verification</small>
                </div>

                <h5 className="fw-bold mb-1">
                    Live QR Tracking Pass
                </h5>

                <p className="text-muted small mb-3">
                    Scan with any smartphone camera to open real-time civic grievance progress.
                </p>

                <div className="d-flex justify-content-center my-3">
                    <div className="qr-scanner-container">
                        <div className="qr-laser-line"></div>
                        <div className="qr-target-corner qr-target-tl"></div>
                        <div className="qr-target-corner qr-target-tr"></div>
                        <div className="qr-target-corner qr-target-bl"></div>
                        <div className="qr-target-corner qr-target-br"></div>

                        <QRCodeSVG
                            value={trackingUrl}
                            size={180}
                            fgColor="#0f5132"
                            level="M"
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-center align-items-center gap-2 mt-3 flex-wrap">
                    <span className="badge bg-light text-dark border px-3 py-2 fw-mono">
                        <i className="bi bi-hash me-1 text-success"></i>
                        {complaint.complaint_id}
                    </span>

                    <button
                        type="button"
                        className="btn btn-sm btn-outline-success btn-shimmer"
                        onClick={copyTrackingLink}
                    >
                        <i className={`bi ${copied ? "bi-check-lg text-success" : "bi-link-45deg"} me-1`}></i>
                        {copied ? "Link Copied!" : "Copy Link"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ComplaintQRCode;
