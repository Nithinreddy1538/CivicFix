import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api";
import ComplaintTracking from "../components/ComplaintTracking";
import ComplaintSLA from "../components/ComplaintSLA";
import ComplaintMap from "../components/ComplaintMap";
import ComplaintQRCode from "../components/ComplaintQRCode";

function ComplaintDetails() {
    const { id } = useParams();

    const [complaint, setComplaint] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);
    const [downloadingReceipt, setDownloadingReceipt] = useState(false);

    useEffect(() => {
        loadComplaint();
    }, [id]);

    const loadComplaint = async () => {
        try {
            const response = await API.get(
                `/complaints/${id}/`
            );

            setComplaint(response.data);

        } catch (error) {
            setError("Complaint not found.");
        } finally {
            setLoading(false);
        }
    };

    const downloadReceipt = async () => {
        try {
            setDownloadingReceipt(true);
            const response = await API.get(
                `/complaints/${id}/receipt/`,
                {
                    responseType: "blob"
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = `${complaint.complaint_id}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Unable to generate receipt");
        } finally {
            setDownloadingReceipt(false);
        }
    };

    const submitFeedback = async (e) => {
        e.preventDefault();
        try {
            setSubmittingFeedback(true);
            const res = await API.post(`/complaints/${id}/feedback/`, {
                rating,
                comment
            });
            setComplaint({
                ...complaint,
                feedback: res.data
            });
            alert("Thank you for your feedback!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit feedback.");
        } finally {
            setSubmittingFeedback(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: "bg-warning text-dark",
            assigned: "bg-info text-dark",
            in_progress: "bg-primary",
            resolved: "bg-success",
            rejected: "bg-danger"
        };

        return badges[status] || "bg-secondary";
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-success"></div>
                <p className="mt-3">
                    Loading complaint...
                </p>
            </div>
        );
    }

    if (error || !complaint) {
        return (
            <div className="container py-5">

                <div className="alert alert-danger">
                    {error}
                </div>

                <Link
                    to="/complaints"
                    className="btn btn-success"
                >
                    Back to Complaints
                </Link>

            </div>
        );
    }

    return (
        <div className="container py-5">

            <div className="mb-4">

                <Link
                    to="/complaints"
                    className="text-success text-decoration-none"
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to My Complaints
                </Link>

            </div>

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-start">

                        <div>

                            <small className="text-muted">
                                Complaint Tracking Number
                            </small>

                            <h2 className="fw-bold text-success mt-1">
                                {complaint.complaint_id}
                            </h2>

                            {complaint.tracking_token && (
                                <p className="text-muted small mb-2">
                                    <i className="bi bi-shield-lock me-1"></i>
                                    Security Token: <code>{complaint.tracking_token}</code>
                                </p>
                            )}

                            <h5>
                                {complaint.title}
                            </h5>

                        </div>

                        <div className="d-flex flex-column align-items-end gap-2">

                            <span
                                className={`badge ${getStatusBadge(
                                    complaint.status
                                )} fs-6`}
                            >
                                {complaint.status.replace(
                                    "_",
                                    " "
                                )}
                            </span>

                            <button
                                className="btn btn-outline-success btn-sm"
                                onClick={downloadReceipt}
                                disabled={downloadingReceipt}
                            >
                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                {downloadingReceipt ? "Generating..." : "Download Receipt"}
                            </button>

                        </div>

                    </div>

                </div>

            </div>

            <ComplaintTracking
                complaint={complaint}
            />

            {complaint.status !== "resolved" &&
                complaint.status !== "rejected" && (
                    <ComplaintSLA
                        complaint={complaint}
                    />
                )}

            <div className="row g-4 mt-2">

                <div className="col-lg-8">

                    <div className="card shadow-sm mb-4">

                        <div className="card-body">

                            <h4 className="fw-bold mb-4">
                                Assignment Details
                            </h4>

                            <div className="row">

                                <div className="col-md-6 mb-3">

                                    <small className="text-muted">
                                        Department
                                    </small>

                                    <h6 className="mt-1">
                                        {complaint.department || "Not assigned"}
                                    </h6>

                                </div>

                                <div className="col-md-6 mb-3">

                                    <small className="text-muted">
                                        Assigned Officer
                                    </small>

                                    <h6 className="mt-1">
                                        {complaint.assigned_officer ||
                                            "Not assigned"}
                                    </h6>

                                </div>

                            </div>

                        </div>

                    </div>

                    <div className="card shadow-sm mb-4">

                        <div className="card-body p-4">

                            <h4 className="fw-bold mb-3">
                                Complaint Information
                            </h4>

                            <p className="text-muted">
                                {complaint.description}
                            </p>

                            <hr />

                            <div className="row">

                                <div className="col-md-6 mb-3">

                                    <strong>
                                        Category
                                    </strong>

                                    <p className="mb-0">
                                        {complaint.category}
                                    </p>

                                </div>

                                <div className="col-md-6 mb-3">

                                    <strong>
                                        Priority
                                    </strong>

                                    <p className="mb-0">
                                        {complaint.priority}
                                    </p>

                                </div>

                                <div className="col-md-12 mb-3">

                                    <strong>
                                        Location
                                    </strong>

                                    <p className="mb-0">
                                        <i className="bi bi-geo-alt me-2"></i>
                                        {complaint.location}
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                    {(complaint.image || complaint.resolution_image) && (
                        <div className="card shadow-sm mb-4">

                            <div className="card-body">

                                <h4 className="mb-4">
                                    Complaint Evidence
                                </h4>

                                <div className="row g-4">

                                    {complaint.image && (
                                        <div className={complaint.resolution_image ? "col-md-6" : "col-12"}>

                                            <h5 className="mb-3">
                                                Before
                                            </h5>

                                            <img
                                                src={
                                                    complaint.image.startsWith("http")
                                                        ? complaint.image
                                                        : `https://civicfix-fs43.onrender.com${complaint.image}`
                                                }
                                                alt="Complaint"
                                                className="comparison-image rounded"
                                            />

                                        </div>
                                    )}

                                    {complaint.resolution_image && (
                                        <div className={complaint.image ? "col-md-6" : "col-12"}>

                                            <h5 className="mb-3 text-success">
                                                After Resolution
                                            </h5>

                                            <img
                                                src={
                                                    complaint.resolution_image.startsWith("http")
                                                        ? complaint.resolution_image
                                                        : `https://civicfix-fs43.onrender.com${complaint.resolution_image}`
                                                }
                                                alt="Resolution"
                                                className="comparison-image rounded"
                                            />

                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>
                    )}

                    {complaint.resolution_note && (
                        <div className="card shadow-sm mb-4">

                            <div className="card-body">

                                <h4 className="mb-3">
                                    Resolution Details
                                </h4>

                                <p>
                                    {complaint.resolution_note}
                                </p>

                                {complaint.resolved_at && (
                                    <p className="text-muted mb-0">
                                        <i className="bi bi-calendar-check me-2"></i>
                                        Resolved on:{" "}
                                        {new Date(
                                            complaint.resolved_at
                                        ).toLocaleString()}
                                    </p>
                                )}

                            </div>

                        </div>
                    )}

                    {complaint.status === "resolved" && (
                        <div className="card shadow-sm mb-4 border-success">
                            <div className="card-body">
                                <h4 className="fw-bold mb-3">
                                    <i className="bi bi-star-fill text-warning me-2"></i>
                                    Citizen Feedback & Rating
                                </h4>

                                {complaint.feedback ? (
                                    <div>
                                        <div className="mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <i
                                                    key={star}
                                                    className={`bi bi-star-fill ${
                                                        star <= complaint.feedback.rating
                                                            ? "text-warning"
                                                            : "text-muted"
                                                    } fs-4 me-1`}
                                                ></i>
                                            ))}
                                            <span className="ms-2 fw-bold fs-5">
                                                {complaint.feedback.rating} / 5
                                            </span>
                                        </div>
                                        {complaint.feedback.comment && (
                                            <p className="text-muted mb-0 fst-italic">
                                                "{complaint.feedback.comment}"
                                            </p>
                                        )}
                                        <small className="text-muted d-block mt-2">
                                            Submitted on: {new Date(complaint.feedback.created_at).toLocaleString()}
                                        </small>
                                    </div>
                                ) : (
                                    <form onSubmit={submitFeedback}>
                                        <p className="text-muted">
                                            Your complaint has been resolved. Please share your feedback:
                                        </p>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">
                                                Rate the resolution (1 to 5 stars):
                                            </label>
                                            <select
                                                className="form-select"
                                                value={rating}
                                                onChange={(e) => setRating(Number(e.target.value))}
                                            >
                                                <option value="5">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                                                <option value="4">⭐⭐⭐⭐ 4 - Good</option>
                                                <option value="3">⭐⭐⭐ 3 - Average</option>
                                                <option value="2">⭐⭐ 2 - Poor</option>
                                                <option value="1">⭐ 1 - Very Bad</option>
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label fw-bold">
                                                Comments (optional):
                                            </label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                placeholder="Tell us how well the issue was resolved..."
                                                value={comment}
                                                onChange={(e) => setComment(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            className="btn btn-success"
                                            disabled={submittingFeedback}
                                        >
                                            {submittingFeedback ? "Submitting..." : "Submit Feedback"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    {complaint.latitude && complaint.longitude && (
                        <div className="card shadow-sm mb-4">
                            <div className="card-body">
                                <h5 className="fw-bold mb-3">
                                    Location Map
                                </h5>
                                <ComplaintMap complaints={[complaint]} />
                            </div>
                        </div>
                    )}

                </div>

                <div className="col-lg-4">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h4 className="mb-4">
                                Status Timeline
                            </h4>

                            <div className="timeline">

                                {complaint.status_history &&
                                    complaint.status_history.map(
                                        (item, index) => (

                                            <div
                                                className="timeline-item"
                                                key={item.id || index}
                                            >

                                                <div className="timeline-dot">
                                                    <i className="bi bi-check"></i>
                                                </div>

                                                <div className="timeline-content">

                                                    <h6>
                                                        {item.status.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </h6>

                                                    {item.note && (
                                                        <p>
                                                            {item.note}
                                                        </p>
                                                    )}

                                                    <small className="text-muted">
                                                        {new Date(
                                                            item.created_at
                                                        ).toLocaleString()}
                                                    </small>

                                                </div>

                                            </div>

                                        )
                                    )}

                            </div>

                        </div>

                    </div>

                    <ComplaintQRCode complaint={complaint} />

                </div>

            </div>

        </div>
    );
}

export default ComplaintDetails;
