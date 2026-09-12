import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

function MyComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const response = await API.get("/complaints/");
            setComplaints(response.data);
        } catch (error) {
            setError("Unable to load complaints.");
        } finally {
            setLoading(false);
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

    const getPriorityBadge = (priority) => {
        const badges = {
            low: "bg-success",
            medium: "bg-warning text-dark",
            high: "bg-danger",
            critical: "bg-dark"
        };

        return badges[priority] || "bg-secondary";
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-success"></div>
                <p className="mt-3">Loading complaints...</p>
            </div>
        );
    }

    return (
        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2>My Complaints</h2>
                    <p className="text-muted">
                        Track all the civic problems you have reported.
                    </p>
                </div>

                <Link
                    to="/report"
                    className="btn btn-success"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    New Complaint
                </Link>

            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {complaints.length === 0 ? (

                <div className="card shadow-sm">
                    <div className="card-body text-center py-5">

                        <i className="bi bi-inbox fs-1 text-muted"></i>

                        <h4 className="mt-3">
                            No complaints found
                        </h4>

                        <p className="text-muted">
                            You have not reported any civic problems yet.
                        </p>

                        <Link
                            to="/report"
                            className="btn btn-success"
                        >
                            Report a Problem
                        </Link>

                    </div>
                </div>

            ) : (

                <div className="row g-4">

                    {complaints.map((complaint) => (

                        <div
                            className="col-md-6 col-lg-4"
                            key={complaint.id}
                        >

                            <div className="card shadow-sm h-100">

                                {complaint.image && (
                                    <img
                                        src={
                                            complaint.image.startsWith("http")
                                                ? complaint.image
                                                : `https://civicfix-fs43.onrender.com${complaint.image}`
                                        }
                                        className="card-img-top complaint-image"
                                        alt={complaint.title}
                                    />
                                )}

                                <div className="card-body">

                                    <div className="d-flex justify-content-between mb-2">

                                        <span className="badge bg-secondary">
                                            {complaint.complaint_id}
                                        </span>

                                        <span
                                            className={`badge ${getPriorityBadge(
                                                complaint.priority
                                            )}`}
                                        >
                                            {complaint.priority}
                                        </span>

                                    </div>

                                    <h5 className="card-title">
                                        {complaint.title}
                                    </h5>

                                    <p className="text-muted mb-2">
                                        <i className="bi bi-tag me-2"></i>
                                        {complaint.category}
                                    </p>

                                    <p className="text-muted">
                                        <i className="bi bi-geo-alt me-2"></i>
                                        {complaint.location}
                                    </p>

                                    <span
                                        className={`badge ${getStatusBadge(
                                            complaint.status
                                        )}`}
                                    >
                                        {complaint.status.replace(
                                            "_",
                                            " "
                                        )}
                                    </span>

                                </div>

                                <div className="card-footer bg-white border-0">

                                    <Link
                                        to={`/complaints/${complaint.id}`}
                                        className="btn btn-outline-success w-100"
                                    >
                                        View Details
                                    </Link>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default MyComplaints;
