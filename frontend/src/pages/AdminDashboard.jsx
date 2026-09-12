import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import API from "../api";
import ComplaintMap from "../components/ComplaintMap";
import ComplaintHeatmap from "../components/ComplaintHeatmap";
import AdminAnalytics from "../components/AdminAnalytics";
import AdminCommandCenter from "../components/AdminCommandCenter";

function AdminDashboard() {

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mapMode, setMapMode] = useState("pins");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [priorityFilter, setPriorityFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("");
    const [viewFilter, setViewFilter] = useState("all");

    // Officer Management & Recruitment States
    const [officers, setOfficers] = useState([]);
    const [officersLoading, setOfficersLoading] = useState(false);
    const [showRecruitForm, setShowRecruitForm] = useState(false);
    const [recruitForm, setRecruitForm] = useState({
        username: "",
        password: "",
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        department: "Roads"
    });
    const [recruitSubmitting, setRecruitSubmitting] = useState(false);
    const [recruitError, setRecruitError] = useState("");
    const [recruitSuccess, setRecruitSuccess] = useState("");

    const isAdmin = localStorage.getItem("role") === "admin";

    useEffect(() => {
        if (isAdmin) {
            loadComplaints();
            loadOfficers();
        }
    }, [isAdmin]);

    const loadComplaints = async () => {
        try {
            const response = await API.get("/complaints/");
            setComplaints(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const loadOfficers = async () => {
        try {
            setOfficersLoading(true);
            const response = await API.get("/accounts/staff/");
            setOfficers(response.data);
        } catch (error) {
            console.error("Failed to load officers:", error);
        } finally {
            setOfficersLoading(false);
        }
    };

    const handleRecruitChange = (e) => {
        setRecruitForm({
            ...recruitForm,
            [e.target.name]: e.target.value
        });
    };

    const handleRecruitSubmit = async (e) => {
        e.preventDefault();
        setRecruitError("");
        setRecruitSuccess("");
        setRecruitSubmitting(true);

        try {
            const res = await API.post("/accounts/staff/", recruitForm);
            setRecruitSuccess(res.data.message || "Officer recruited successfully!");
            setRecruitForm({
                username: "",
                password: "",
                email: "",
                first_name: "",
                last_name: "",
                phone: "",
                department: "Roads"
            });
            loadOfficers();
            setTimeout(() => {
                setRecruitSuccess("");
                setShowRecruitForm(false);
            }, 3000);
        } catch (err) {
            setRecruitError(
                err.response?.data?.message ||
                "Failed to recruit officer. Please verify details."
            );
        } finally {
            setRecruitSubmitting(false);
        }
    };

    if (!isAdmin) {
        return <Navigate to="/dashboard" />;
    }

    const filteredComplaints = complaints.filter((complaint) => {

        const searchMatch =
            !search ||
            complaint.complaint_id?.toLowerCase().includes(search.toLowerCase()) ||
            complaint.title?.toLowerCase().includes(search.toLowerCase()) ||
            complaint.location?.toLowerCase().includes(search.toLowerCase());

        const statusMatch =
            statusFilter === "all" ||
            !statusFilter ||
            complaint.status === statusFilter;

        const priorityMatch =
            priorityFilter === "all" ||
            !priorityFilter ||
            complaint.priority === priorityFilter;

        const categoryMatch =
            categoryFilter === "all" ||
            !categoryFilter ||
            complaint.category === categoryFilter;

        const dateMatch =
            !dateFilter ||
            complaint.created_at?.startsWith(dateFilter);

        const viewMatch =
            viewFilter === "all" ||
            (viewFilter === "active" &&
                !["resolved", "rejected"].includes(complaint.status)) ||
            (viewFilter === "resolved" &&
                complaint.status === "resolved");

        return (
            searchMatch &&
            statusMatch &&
            priorityMatch &&
            categoryMatch &&
            dateMatch &&
            viewMatch
        );
    });

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setPriorityFilter("all");
        setCategoryFilter("all");
        setDateFilter("");
        setViewFilter("all");
    };

    const handleDeleteComplaint = async (id, complaintId) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete complaint ${complaintId}?\nThis action will erase the complaint record and cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await API.delete(`/complaints/${id}/`);
            setComplaints((prev) => prev.filter((c) => c.id !== id));
            alert(`Complaint ${complaintId} has been successfully deleted.`);
        } catch (err) {
            console.error("Failed to delete complaint:", err);
            alert(
                err.response?.data?.message ||
                "Failed to delete complaint. Please check your admin privileges."
            );
        }
    };

    const pending = complaints.filter(
        complaint => complaint.status === "pending"
    ).length;

    const assigned = complaints.filter(
        complaint => complaint.status === "assigned"
    ).length;

    const inProgress = complaints.filter(
        complaint => complaint.status === "in_progress"
    ).length;

    const resolved = complaints.filter(
        complaint => complaint.status === "resolved"
    ).length;

    const critical = complaints.filter(
        complaint => complaint.priority === "critical"
    ).length;

    return (
        <div className="container py-5 page-enter">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2 className="fw-bold">
                        Admin Dashboard
                    </h2>

                    <p className="text-muted mb-0">
                        Manage and monitor all CivicFix complaints
                    </p>
                </div>

                <button
                    className="btn btn-outline-success"
                    onClick={loadComplaints}
                >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Refresh
                </button>

            </div>

            <div className="row g-3 mb-4">

                <div className="col-md-2">
                    <div className="card stat-card h-100">
                        <div className="card-body p-3">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Total
                            </small>
                            <h3 className="fw-bold mb-0">
                                {complaints.length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card stat-card stat-card-warning h-100">
                        <div className="card-body p-3">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Pending
                            </small>
                            <h3 className="text-warning fw-bold mb-0">
                                {pending}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card stat-card stat-card-primary h-100">
                        <div className="card-body p-3">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Assigned
                            </small>
                            <h3 className="text-primary fw-bold mb-0">
                                {assigned}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card stat-card stat-card-info h-100">
                        <div className="card-body p-3">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                In Progress
                            </small>
                            <h3 className="text-info fw-bold mb-0">
                                {inProgress}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card stat-card stat-card-success h-100">
                        <div className="card-body p-3">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Resolved
                            </small>
                            <h3 className="text-success fw-bold mb-0">
                                {resolved}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-2">
                    <div className="card stat-card stat-card-danger h-100">
                        <div className="card-body p-3">
                            <small className="text-muted fw-bold text-uppercase d-block mb-1">
                                Critical
                            </small>
                            <h3 className="text-danger fw-bold mb-0">
                                {critical}
                            </h3>
                        </div>
                    </div>
                </div>

            </div>

            <div className="mb-5">

                <h3 className="fw-bold mb-3">
                    Command Center
                </h3>

                <AdminCommandCenter />

            </div>

            <div className="mb-5">

                <h3 className="fw-bold mb-3">
                    Analytics & Statistics
                </h3>

                <AdminAnalytics
                    complaints={complaints}
                />

            </div>

            {/* Officer Force & Recruitment Section */}
            <div className="card shadow-sm border-0 mb-5" style={{ borderRadius: "18px" }}>
                <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                        <div>
                            <div className="d-inline-flex align-items-center gap-2 mb-1">
                                <h4 className="fw-bold mb-0">
                                    <i className="bi bi-people-fill text-success me-2"></i>
                                    Municipal Officer Force
                                </h4>
                                <span className="badge bg-success rounded-pill px-3 py-1">
                                    {officers.length} Active Officers
                                </span>
                            </div>
                            <p className="text-muted small mb-0">
                                Recruit, commission, and authorize municipal department officers to handle field complaints.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn-success btn-shimmer shadow-sm px-3"
                            onClick={() => setShowRecruitForm(!showRecruitForm)}
                        >
                            <i className={`bi ${showRecruitForm ? "bi-x-lg" : "bi-person-plus-fill"} me-1`}></i>
                            {showRecruitForm ? "Cancel" : "Recruit New Officer"}
                        </button>
                    </div>

                    {/* Officer Recruitment Form */}
                    {showRecruitForm && (
                        <div className="card stat-card stat-card-success mb-4 p-4 border shadow-sm">
                            <h5 className="fw-bold text-dark mb-1">
                                <i className="bi bi-award-fill text-success me-2"></i>
                                Commission New Municipal Field Officer
                            </h5>
                            <p className="small text-muted mb-3">
                                This will generate official staff login credentials for CivicFix.
                            </p>

                            {recruitError && (
                                <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-exclamation-circle-fill"></i>
                                    <span>{recruitError}</span>
                                </div>
                            )}

                            {recruitSuccess && (
                                <div className="alert alert-success py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>{recruitSuccess}</span>
                                </div>
                            )}

                            <form onSubmit={handleRecruitSubmit}>
                                <div className="row g-3 mb-3">
                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold text-muted">Username *</label>
                                        <div className="input-icon-wrapper">
                                            <i className="bi bi-person"></i>
                                            <input
                                                type="text"
                                                name="username"
                                                className="form-control"
                                                placeholder="e.g. officer_ramesh"
                                                value={recruitForm.username}
                                                onChange={handleRecruitChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold text-muted">Password *</label>
                                        <div className="input-icon-wrapper">
                                            <i className="bi bi-key"></i>
                                            <input
                                                type="password"
                                                name="password"
                                                className="form-control"
                                                placeholder="Officer login password"
                                                value={recruitForm.password}
                                                onChange={handleRecruitChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <label className="form-label small fw-semibold text-muted">Assigned Department *</label>
                                        <select
                                            name="department"
                                            className="form-select"
                                            value={recruitForm.department}
                                            onChange={handleRecruitChange}
                                            required
                                        >
                                            <option value="Roads">Roads & Potholes</option>
                                            <option value="Sanitation">Sanitation & Solid Waste</option>
                                            <option value="Electrical">Electrical & Street Lights</option>
                                            <option value="Water Supply">Water Supply & Pipelines</option>
                                            <option value="Drainage">Drainage & Stormwater</option>
                                            <option value="Traffic">Traffic & Transport Signals</option>
                                            <option value="Public Property">Public Works & Property</option>
                                            <option value="General">General Municipal Response</option>
                                        </select>
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold text-muted">First Name</label>
                                        <input
                                            type="text"
                                            name="first_name"
                                            className="form-control"
                                            placeholder="e.g. Ramesh"
                                            value={recruitForm.first_name}
                                            onChange={handleRecruitChange}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold text-muted">Last Name</label>
                                        <input
                                            type="text"
                                            name="last_name"
                                            className="form-control"
                                            placeholder="e.g. Varma"
                                            value={recruitForm.last_name}
                                            onChange={handleRecruitChange}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold text-muted">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-control"
                                            placeholder="officer@civicfix.gov.in"
                                            value={recruitForm.email}
                                            onChange={handleRecruitChange}
                                        />
                                    </div>

                                    <div className="col-md-3">
                                        <label className="form-label small fw-semibold text-muted">Phone</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-control"
                                            placeholder="Mobile phone"
                                            value={recruitForm.phone}
                                            onChange={handleRecruitChange}
                                        />
                                    </div>
                                </div>

                                <div className="d-flex justify-content-end gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm px-3"
                                        onClick={() => setShowRecruitForm(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-sm btn-shimmer px-4 fw-bold"
                                        disabled={recruitSubmitting}
                                    >
                                        {recruitSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-1"></span>
                                                Authorizing Officer...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-circle-fill me-1"></i>
                                                Authorize & Recruit Officer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Officers Table */}
                    {officersLoading ? (
                        <div className="text-center py-3 text-muted">
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Loading officer force...
                        </div>
                    ) : officers.length === 0 ? (
                        <div className="alert alert-info mb-0 text-center py-4">
                            <i className="bi bi-people display-6 d-block mb-2"></i>
                            No field officers recruited yet. Click <strong>"Recruit New Officer"</strong> above to commission staff.
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover table-glide align-middle">
                                <thead>
                                    <tr>
                                        <th>Officer</th>
                                        <th>Department</th>
                                        <th>Contact</th>
                                        <th>Active Workload</th>
                                        <th>Recruited Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {officers.map((officer) => (
                                        <tr key={officer.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: "36px", height: "36px" }}>
                                                        {officer.first_name ? officer.first_name[0].toUpperCase() : officer.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <strong className="d-block text-dark">
                                                            {officer.first_name || officer.last_name
                                                                ? `${officer.first_name} ${officer.last_name}`.trim()
                                                                : officer.username}
                                                        </strong>
                                                        <small className="text-muted fw-mono">@{officer.username}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-primary px-3 py-1">
                                                    {officer.department}
                                                </span>
                                            </td>
                                            <td>
                                                <small className="d-block text-dark">
                                                    <i className="bi bi-envelope me-1 text-muted"></i>
                                                    {officer.email || "No email"}
                                                </small>
                                                {officer.phone && (
                                                    <small className="d-block text-muted">
                                                        <i className="bi bi-telephone me-1 text-muted"></i>
                                                        {officer.phone}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${officer.active_complaints > 0 ? "bg-warning text-dark" : "bg-light text-muted border"} px-3 py-1`}>
                                                    {officer.active_complaints} Assigned
                                                </span>
                                            </td>
                                            <td>
                                                <small className="text-muted">{officer.date_joined || "Active"}</small>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-3">
                        <i className="bi bi-funnel me-2"></i>
                        Search & Filters
                    </h5>

                    <div className="row g-3">

                        <div className="col-md-4">

                            <label className="form-label">
                                Search
                            </label>

                            <div className="input-group">

                                <span className="input-group-text">
                                    <i className="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Complaint ID, title or location"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />

                            </div>

                        </div>

                        <div className="col-md-2">

                            <label className="form-label">
                                Status
                            </label>

                            <select
                                className="form-select"
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(e.target.value)
                                }
                            >

                                <option value="">
                                    All Status
                                </option>

                                <option value="pending">
                                    Pending
                                </option>

                                <option value="assigned">
                                    Assigned
                                </option>

                                <option value="in_progress">
                                    In Progress
                                </option>

                                <option value="resolved">
                                    Resolved
                                </option>

                                <option value="rejected">
                                    Rejected
                                </option>

                            </select>

                        </div>

                        <div className="col-md-2">

                            <label className="form-label">
                                Priority
                            </label>

                            <select
                                className="form-select"
                                value={priorityFilter}
                                onChange={(e) =>
                                    setPriorityFilter(e.target.value)
                                }
                            >

                                <option value="">
                                    All Priority
                                </option>

                                <option value="low">
                                    Low
                                </option>

                                <option value="medium">
                                    Medium
                                </option>

                                <option value="high">
                                    High
                                </option>

                                <option value="critical">
                                    Critical
                                </option>

                            </select>

                        </div>

                        <div className="col-md-2">

                            <label className="form-label">
                                Category
                            </label>

                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) =>
                                    setCategoryFilter(e.target.value)
                                }
                            >

                                <option value="all">
                                    All Categories
                                </option>

                                <option value="pothole">
                                    Road Pothole
                                </option>

                                <option value="street_light">
                                    Street Light
                                </option>

                                <option value="garbage">
                                    Garbage
                                </option>

                                <option value="water_leakage">
                                    Water Leakage
                                </option>

                                <option value="drainage">
                                    Drainage
                                </option>

                                <option value="traffic_signal">
                                    Traffic Signal
                                </option>

                                <option value="public_property">
                                    Public Property
                                </option>

                                <option value="other">
                                    Other
                                </option>

                            </select>

                        </div>

                        <div className="col-md-3">

                            <label className="form-label">
                                View
                            </label>

                            <select
                                className="form-select"
                                value={viewFilter}
                                onChange={(e) =>
                                    setViewFilter(e.target.value)
                                }
                            >
                                <option value="all">All Complaints</option>
                                <option value="active">Active Complaints</option>
                                <option value="resolved">Resolved Complaints</option>
                            </select>

                        </div>

                        <div className="col-md-3">

                            <label className="form-label">
                                Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                value={dateFilter}
                                onChange={(e) =>
                                    setDateFilter(e.target.value)
                                }
                            />

                        </div>

                        <div className="col-md-2 d-flex align-items-end">

                            <button
                                className="btn btn-outline-secondary w-100"
                                onClick={clearFilters}
                            >
                                <i className="bi bi-x-circle me-1"></i>
                                Clear
                            </button>

                        </div>

                    </div>

                    <div className="mt-3 text-muted">

                        Showing{" "}
                        <strong>
                            {filteredComplaints.length}
                        </strong>{" "}
                        of{" "}
                        <strong>
                            {complaints.length}
                        </strong>{" "}
                        complaints

                    </div>

                </div>

            </div>

            <div className="card shadow-sm mb-4">

                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h4 className="mb-1">
                                <i className="bi bi-map me-2"></i>
                                {mapMode === "pins" ? "Live Complaint Map" : "Civic Hotspot Heatmap"}
                            </h4>
                            <p className="text-muted mb-0">
                                Monitor reported civic issues and geographic problem clusters.
                            </p>
                        </div>
                        <div className="btn-group">
                            <button
                                type="button"
                                className={`btn btn-sm ${mapMode === "pins" ? "btn-success" : "btn-outline-success"}`}
                                onClick={() => setMapMode("pins")}
                            >
                                <i className="bi bi-geo-alt me-1"></i>
                                Pins View
                            </button>
                            <button
                                type="button"
                                className={`btn btn-sm ${mapMode === "heatmap" ? "btn-danger" : "btn-outline-danger"}`}
                                onClick={() => setMapMode("heatmap")}
                            >
                                <i className="bi bi-fire me-1"></i>
                                Heatmap View
                            </button>
                        </div>
                    </div>

                    {mapMode === "pins" ? (
                        <ComplaintMap
                            complaints={filteredComplaints}
                        />
                    ) : (
                        <ComplaintHeatmap
                            complaints={filteredComplaints}
                        />
                    )}

                </div>

            </div>

            <div className="card shadow-sm">

                <div className="card-body">

                    <h4 className="mb-4">
                        Complaints
                    </h4>

                    {loading ? (

                        <div className="text-center py-4">
                            Loading complaints...
                        </div>

                    ) : filteredComplaints.length === 0 ? (

                        <div className="alert alert-info">
                            No complaints match your filters.
                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover table-glide align-middle">

                                <thead>

                                    <tr>
                                        <th>ID</th>
                                        <th>Photo</th>
                                        <th>Title</th>
                                        <th>Category</th>
                                        <th>Location</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {filteredComplaints.map(
                                        complaint => (

                                            <tr key={complaint.id}>

                                                <td>
                                                    <strong>
                                                        {complaint.complaint_id}
                                                    </strong>
                                                    {complaint.priority === "critical" && (
                                                        <span className="badge bg-danger ms-2">
                                                            <i className="bi bi-exclamation-triangle me-1"></i>
                                                            Critical
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {complaint.image ? (
                                                        <a
                                                            href={complaint.image.startsWith("http") ? complaint.image : `http://127.0.0.1:8000${complaint.image}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            title="Click to view full image"
                                                        >
                                                            <img
                                                                src={complaint.image.startsWith("http") ? complaint.image : `http://127.0.0.1:8000${complaint.image}`}
                                                                alt="Complaint"
                                                                className="rounded shadow-sm border"
                                                                style={{ width: "42px", height: "42px", objectFit: "cover" }}
                                                            />
                                                        </a>
                                                    ) : (
                                                        <span className="badge bg-light text-muted border p-2" title="No photo uploaded">
                                                            <i className="bi bi-image"></i>
                                                        </span>
                                                    )}
                                                </td>

                                                <td>
                                                    {complaint.title}
                                                </td>

                                                <td>
                                                    {complaint.category.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </td>

                                                <td>
                                                    {complaint.location}
                                                </td>

                                                <td>

                                                    <span
                                                        className={`badge ${
                                                            complaint.priority === "critical"
                                                                ? "bg-danger"
                                                                : complaint.priority === "high"
                                                                ? "bg-warning text-dark"
                                                                : complaint.priority === "medium"
                                                                ? "bg-primary"
                                                                : "bg-secondary"
                                                        }`}
                                                    >
                                                        {complaint.priority}
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`badge ${
                                                            complaint.status === "resolved"
                                                                ? "bg-success"
                                                                : complaint.status === "rejected"
                                                                ? "bg-danger"
                                                                : complaint.status === "in_progress"
                                                                ? "bg-info text-dark"
                                                                : complaint.status === "assigned"
                                                                ? "bg-primary"
                                                                : "bg-warning text-dark"
                                                        }`}
                                                    >
                                                        {complaint.status.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </span>

                                                    {complaint.status !== "resolved" &&
                                                        complaint.status !== "rejected" &&
                                                        new Date(complaint.created_at).getTime() +
                                                            (complaint.sla_hours || 48) * 60 * 60 * 1000 <
                                                            Date.now() && (
                                                            <span className="badge bg-danger ms-2">
                                                                Overdue
                                                            </span>
                                                        )}

                                                </td>

                                                <td className="text-end">

                                                    <div className="d-inline-flex gap-2">
                                                        <Link
                                                            to={`/admin/complaints/${complaint.id}`}
                                                            className="btn btn-sm btn-outline-success"
                                                            title="View details and dispatch officer"
                                                        >
                                                            <i className="bi bi-eye me-1"></i>
                                                            View
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleDeleteComplaint(complaint.id, complaint.complaint_id)}
                                                            title="Delete this complaint permanently"
                                                        >
                                                            <i className="bi bi-trash3 me-1"></i>
                                                            Delete
                                                        </button>
                                                    </div>

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

export default AdminDashboard;
