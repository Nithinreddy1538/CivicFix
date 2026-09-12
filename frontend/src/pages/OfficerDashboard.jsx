import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function OfficerDashboard() {

    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadComplaints = async () => {

        try {

            const response = await API.get(
                "/complaints/officer/"
            );

            setComplaints(response.data);

        } catch (error) {

            console.error(error);

            if (error.response?.status === 403) {

                alert(
                    "Officer access required"
                );

                navigate("/dashboard");

            }

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        if (localStorage.getItem("role") !== "officer") {
            alert("Officer access required");
            navigate("/dashboard");
            return;
        }

        loadComplaints();

    }, []);

    const assigned = complaints.filter(
        complaint =>
            complaint.status === "assigned"
    ).length;

    const inProgress = complaints.filter(
        complaint =>
            complaint.status === "in_progress"
    ).length;

    const resolved = complaints.filter(
        complaint =>
            complaint.status === "resolved"
    ).length;

    const critical = complaints.filter(
        complaint =>
            complaint.priority === "critical"
    ).length;

    return (

        <div className="container py-5 page-enter">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold">
                        Officer Dashboard
                    </h2>

                    <p className="text-muted mb-0">
                        Manage complaints assigned to you
                    </p>

                </div>

                <button
                    className="btn btn-outline-success"
                    onClick={loadComplaints}
                >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                </button>

            </div>

            <div className="row g-4 mb-5">

                <div className="col-md-3">
                    <div className="card stat-card h-100">
                        <div className="card-body p-4">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Total Assigned
                            </small>
                            <h2 className="fw-bold mb-0 text-dark">
                                {complaints.length}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card stat-card stat-card-warning h-100">
                        <div className="card-body p-4">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Assigned
                            </small>
                            <h2 className="fw-bold text-warning mb-0">
                                {assigned}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card stat-card stat-card-primary h-100">
                        <div className="card-body p-4">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                In Progress
                            </small>
                            <h2 className="fw-bold text-primary mb-0">
                                {inProgress}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card stat-card stat-card-success h-100">
                        <div className="card-body p-4">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Resolved
                            </small>
                            <h2 className="fw-bold text-success mb-0">
                                {resolved}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            {critical > 0 && (

                <div className="alert alert-danger">

                    <i className="bi bi-exclamation-triangle me-2"></i>

                    <strong>
                        {critical}
                    </strong>{" "}
                    critical complaint
                    {critical > 1 ? "s" : ""} require
                    attention.

                </div>

            )}

            <div className="card shadow-sm">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-4">

                        <h4 className="fw-bold mb-0">
                            My Assigned Complaints
                        </h4>

                        <span className="badge bg-success">
                            {complaints.length}
                        </span>

                    </div>

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-success"
                            >
                            </div>

                            <p className="mt-3">
                                Loading complaints...
                            </p>

                        </div>

                    ) : complaints.length === 0 ? (

                        <div className="text-center py-5">

                            <i
                                className="bi bi-check-circle fs-1 text-success"
                            ></i>

                            <h5 className="mt-3">
                                No complaints assigned
                            </h5>

                            <p className="text-muted">
                                New complaints assigned by admin
                                will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover table-glide align-middle">

                                <thead>

                                    <tr>

                                        <th>
                                            Complaint
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Location
                                        </th>

                                        <th>
                                            Priority
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {complaints.map(
                                        complaint => (

                                            <tr
                                                key={
                                                    complaint.id
                                                }
                                            >

                                                <td>

                                                    <strong>
                                                        {
                                                            complaint.complaint_id
                                                        }
                                                    </strong>

                                                    <div className="small text-muted">
                                                        {
                                                            complaint.title
                                                        }
                                                    </div>

                                                </td>

                                                <td>
                                                    {
                                                        complaint.category
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        complaint.location
                                                    }
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            complaint.priority === "critical"
                                                                ? "badge bg-danger"
                                                                : complaint.priority === "high"
                                                                ? "badge bg-warning text-dark"
                                                                : "badge bg-secondary"
                                                        }
                                                    >
                                                        {
                                                            complaint.priority
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            complaint.status === "resolved"
                                                                ? "badge bg-success"
                                                                : complaint.status === "in_progress"
                                                                ? "badge bg-primary"
                                                                : "badge bg-warning text-dark"
                                                        }
                                                    >
                                                        {
                                                            complaint.status.replace(
                                                                "_",
                                                                " "
                                                            )
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() =>
                                                            navigate(
                                                                `/officer/complaints/${complaint.id}`
                                                            )
                                                        }
                                                    >
                                                        <i className="bi bi-eye me-1"></i>
                                                        Manage
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );
}

export default OfficerDashboard;

