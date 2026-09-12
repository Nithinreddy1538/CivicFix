import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api";
import ComplaintTracking from "../components/ComplaintTracking";
import ComplaintSLA from "../components/ComplaintSLA";

function PublicComplaintTracking() {
    const { complaintId } = useParams();
    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadComplaint = async () => {
            try {
                const response = await API.get(`/complaints/track/${complaintId}/`);
                setComplaint(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadComplaint();
    }, [complaintId]);

    const copyToken = () => {
        if (complaint?.tracking_token) {
            navigator.clipboard.writeText(complaint.tracking_token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="container py-5 text-center page-enter">
                <div className="spinner-border text-success" role="status" style={{ width: "3rem", height: "3rem" }}></div>
                <p className="mt-3 text-muted fw-semibold">Connecting to municipal tracking ledger...</p>
            </div>
        );
    }

    if (!complaint) {
        return (
            <div className="container py-5 text-center page-enter">
                <div className="card glass-card p-5 mx-auto" style={{ maxWidth: "520px" }}>
                    <i className="bi bi-shield-x text-danger display-3 mb-3"></i>
                    <h3 className="fw-bold">Grievance Not Found</h3>
                    <p className="text-muted">The tracking identifier "{complaintId}" does not exist in the municipal system.</p>
                    <Link to="/track" className="btn btn-success btn-shimmer mt-2">
                        <i className="bi bi-arrow-left me-1"></i> Search Another ID
                    </Link>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "resolved": return "bg-success";
            case "in_progress": return "bg-primary";
            case "assigned": return "bg-info";
            case "rejected": return "bg-danger";
            default: return "bg-warning text-dark";
        }
    };

    return (
        <div className="container py-5 page-enter">
            {/* Header Hero Card */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "18px", overflow: "hidden" }}>
                <div className="card-body p-4 p-md-5" style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)" }}>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                            <span className="badge bg-light text-dark border px-3 py-1 mb-2 fw-mono">
                                <i className="bi bi-hash text-success me-1"></i>
                                {complaint.complaint_id}
                            </span>
                            <h2 className="fw-bold text-dark mt-1 mb-2">
                                {complaint.title}
                            </h2>
                            <p className="text-muted mb-3">
                                <i className="bi bi-geo-alt-fill text-success me-1"></i>
                                {complaint.location}
                            </p>
                        </div>

                        <div className="text-md-end">
                            <span className={`badge ${getStatusBadge(complaint.status)} px-3 py-2 text-uppercase fs-6 shadow-sm`}>
                                {complaint.status.replace("_", " ")}
                            </span>
                        </div>
                    </div>

                    {complaint.tracking_token && (
                        <div className="d-inline-flex align-items-center gap-2 p-2 px-3 bg-white rounded-pill border shadow-sm mt-2">
                            <i className="bi bi-shield-lock text-success"></i>
                            <span className="small text-muted">Token:</span>
                            <code className="small text-dark fw-mono">{complaint.tracking_token}</code>
                            <button
                                type="button"
                                className="btn btn-sm btn-link text-success p-0 ms-1 text-decoration-none"
                                onClick={copyToken}
                                title="Copy Token"
                            >
                                <i className={`bi ${copied ? "bi-check-lg" : "bi-copy"}`}></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Complaint Info Grid */}
            <div className="card shadow-sm border-0 mb-4" style={{ borderRadius: "18px" }}>
                <div className="card-body p-4">
                    <h5 className="fw-bold mb-3 text-dark">
                        <i className="bi bi-info-circle me-2 text-success"></i>
                        Administrative Overview
                    </h5>
                    <div className="row g-3">
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block">Category</small>
                            <span className="fw-bold text-dark text-capitalize">{complaint.category?.replace("_", " ")}</span>
                        </div>
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block">Priority</small>
                            <span className="fw-bold text-dark text-capitalize">{complaint.priority}</span>
                        </div>
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block">Assigned Department</small>
                            <span className="fw-bold text-dark text-capitalize">{complaint.department || "Municipal Dispatch"}</span>
                        </div>
                        <div className="col-6 col-md-3">
                            <small className="text-muted d-block">Assigned Officer</small>
                            <span className="fw-bold text-dark text-capitalize">{complaint.assigned_to?.username || "Pending Assignment"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stepper Progress */}
            <ComplaintTracking complaint={complaint} />

            {/* SLA Countdown if still active */}
            {complaint.status !== "resolved" && complaint.status !== "rejected" && (
                <div className="mt-4">
                    <ComplaintSLA complaint={complaint} />
                </div>
            )}

            {/* Photographic Evidence Before & After Section */}
            {(complaint.image || complaint.resolution_image) && (
                <div className="card shadow-sm border-0 mt-4" style={{ borderRadius: "18px" }}>
                    <div className="card-body p-4">
                        <h5 className="fw-bold mb-4 text-dark">
                            <i className="bi bi-images me-2 text-success"></i>
                            Photographic Evidence & Proof of Resolution
                        </h5>

                        <div className="row g-4">
                            {complaint.image && (
                                <div className={complaint.resolution_image ? "col-md-6" : "col-12"}>
                                    <div className="border rounded-3 p-2 bg-light">
                                        <span className="badge bg-secondary mb-2">Original Grievance (Before)</span>
                                        <img
                                            src={complaint.image.startsWith("http") ? complaint.image : `https://civicfix-fs43.onrender.com${complaint.image}`}
                                            alt="Original Complaint"
                                            className="comparison-image rounded"
                                        />
                                    </div>
                                </div>
                            )}

                            {complaint.resolution_image && (
                                <div className={complaint.image ? "col-md-6" : "col-12"}>
                                    <div className="border rounded-3 p-2 bg-light">
                                        <span className="badge bg-success mb-2">Officer Resolution Proof (After)</span>
                                        <img
                                            src={complaint.resolution_image.startsWith("http") ? complaint.resolution_image : `https://civicfix-fs43.onrender.com${complaint.resolution_image}`}
                                            alt="Resolution Proof"
                                            className="comparison-image rounded"
                                        />
                                        {complaint.resolution_note && (
                                            <div className="mt-3 p-3 bg-white rounded border">
                                                <small className="text-muted fw-bold d-block">Officer Resolution Note:</small>
                                                <p className="mb-0 text-dark small">{complaint.resolution_note}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PublicComplaintTracking;
