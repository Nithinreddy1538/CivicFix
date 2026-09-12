import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import ComplaintMap from "../components/ComplaintMap";

function Dashboard() {
    const [complaints, setComplaints] = useState([]);
    const username = localStorage.getItem("username");

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const response = await API.get("/complaints/");
            setComplaints(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    const pending = complaints.filter(
        item => item.status === "pending"
    ).length;

    const inProgress = complaints.filter(
        item => item.status === "in_progress"
    ).length;

    const resolved = complaints.filter(
        item => item.status === "resolved"
    ).length;

    return (
        <div className="container py-5 page-enter">

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Welcome, {username}</h2>
                    <p className="text-muted mb-0">
                        Manage and track your civic complaints with live SLA transparency.
                    </p>
                </div>

                <Link
                    to="/report"
                    className="btn btn-success btn-shimmer px-4 py-2 shadow-sm"
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Report Problem
                </Link>
            </div>

            <div className="row g-4 mb-5">

                <div className="col-md-4">
                    <div className="card stat-card stat-card-warning h-100">
                        <div className="card-body d-flex justify-content-between align-items-center p-4">
                            <div>
                                <span className="badge bg-warning text-dark mb-2">Awaiting Review</span>
                                <h6 className="text-muted text-uppercase small fw-bold mb-1">
                                    Pending
                                </h6>
                                <h2 className="fw-bold mb-0 text-dark">
                                    {pending}
                                </h2>
                            </div>
                            <div className="stat-icon-wrapper bg-warning bg-opacity-10 text-warning">
                                <i className="bi bi-clock fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card stat-card stat-card-primary h-100">
                        <div className="card-body d-flex justify-content-between align-items-center p-4">
                            <div>
                                <span className="badge bg-primary mb-2">On-Site Work</span>
                                <h6 className="text-muted text-uppercase small fw-bold mb-1">
                                    In Progress
                                </h6>
                                <h2 className="fw-bold mb-0 text-dark">
                                    {inProgress}
                                </h2>
                            </div>
                            <div className="stat-icon-wrapper bg-primary bg-opacity-10 text-primary">
                                <i className="bi bi-arrow-repeat fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card stat-card stat-card-success h-100">
                        <div className="card-body d-flex justify-content-between align-items-center p-4">
                            <div>
                                <span className="badge bg-success mb-2">Completed</span>
                                <h6 className="text-muted text-uppercase small fw-bold mb-1">
                                    Resolved
                                </h6>
                                <h2 className="fw-bold mb-0 text-dark">
                                    {resolved}
                                </h2>
                            </div>
                            <div className="stat-icon-wrapper bg-success bg-opacity-10 text-success">
                                <i className="bi bi-check-circle fs-2"></i>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="card shadow-sm">
                <div className="card-body">

                    <h4 className="mb-4">
                        Recent Complaints
                    </h4>

                    {complaints.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-inbox fs-1 text-muted"></i>

                            <p className="mt-3">
                                You haven't reported any problems yet.
                            </p>

                            <Link
                                to="/report"
                                className="btn btn-success"
                            >
                                Report Your First Problem
                            </Link>
                        </div>
                    ) : (
                        <div className="table-responsive">

                            <table className="table table-hover table-glide">

                                <thead>
                                    <tr>
                                        <th>Complaint ID</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {complaints.slice(0, 5).map(item => (
                                        <tr key={item.id}>

                                            <td>
                                                <Link
                                                    to={`/complaints/${item.id}`}
                                                >
                                                    {item.complaint_id}
                                                </Link>
                                            </td>

                                            <td>
                                                {item.title}
                                            </td>

                                            <td>
                                                {item.category}
                                            </td>

                                            <td>
                                                {item.priority}
                                            </td>

                                            <td>
                                                {item.status}
                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    )}

                </div>
            </div>

            <div className="card shadow-sm mt-4">

                <div className="card-body">

                    <h4 className="mb-3">
                        Complaint Locations
                    </h4>

                    <p className="text-muted">
                        View the locations of your reported civic problems.
                    </p>

                    <ComplaintMap complaints={complaints} />

                </div>

            </div>

        </div>
    );
}

export default Dashboard;
