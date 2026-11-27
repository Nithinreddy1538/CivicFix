import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import ComplaintMap from "../components/ComplaintMap";

function AdminComplaintDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [officers, setOfficers] = useState([]);

    const [statusValue, setStatusValue] = useState("");
    const [priority, setPriority] = useState("");
    const [resolutionNote, setResolutionNote] = useState("");

    const [assignedTo, setAssignedTo] = useState("");
    const [department, setDepartment] = useState("");

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [assigning, setAssigning] = useState(false);

    const departments = [
        "Roads",
        "Electrical",
        "Sanitation",
        "Water Supply",
        "Drainage",
        "Traffic",
        "Public Works",
        "General Services"
    ];

    const loadComplaint = async () => {

        try {

            const response = await API.get(
                `/complaints/${id}/`
            );

            setComplaint(response.data);

            setStatusValue(
                response.data.status
            );

            setPriority(
                response.data.priority
            );

            setResolutionNote(
                response.data.resolution_note || ""
            );

            setAssignedTo(
                response.data.assigned_to || ""
            );

            setDepartment(
                response.data.department || ""
            );

        } catch (error) {

            console.error(error);

            alert(
                "Unable to load complaint"
            );

        } finally {

            setLoading(false);

        }
    };

    const loadOfficers = async () => {

        try {

            const response = await API.get(
                "/accounts/staff/"
            );

            setOfficers(response.data);

        } catch (error) {

            console.error(error);

        }
    };

    useEffect(() => {

        if (localStorage.getItem("role") !== "admin") {
            navigate("/dashboard");
            return;
        }

        loadComplaint();
        loadOfficers();

    }, [id]);

    const updateComplaint = async () => {

        setUpdating(true);

        try {

            await API.put(
                `/complaints/${id}/status/`,
                {
                    status: statusValue,
                    priority: priority,
                    resolution_note: resolutionNote
                }
            );

            alert(
                "Complaint updated successfully"
            );

            loadComplaint();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to update complaint"
            );

        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteComplaint = async () => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete complaint ${complaint?.complaint_id}?\nThis action cannot be undone.`
        );
        if (!confirmed) return;

        try {
            await API.delete(`/complaints/${id}/`);
            alert(`Complaint ${complaint?.complaint_id} has been successfully deleted.`);
            navigate("/admin");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to delete complaint.");
        }
    };

    const assignComplaint = async () => {

        if (!assignedTo) {

            alert(
                "Please select an officer"
            );

            return;
        }

        if (!department) {

            alert(
                "Please select a department"
            );

            return;
        }

        setAssigning(true);

        try {

            await API.put(
                `/complaints/${id}/assign/`,
                {
                    assigned_to: assignedTo,
                    department: department
                }
            );

            alert(
                "Complaint assigned successfully"
            );

            loadComplaint();

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to assign complaint"
            );

        } finally {

            setAssigning(false);

        }
    };

    if (loading) {

        return (
            <div className="container py-5 text-center">

                <div
                    className="spinner-border text-success"
                >
                </div>

                <p className="mt-3">
                    Loading complaint...
                </p>

            </div>
        );
    }

    if (!complaint) {

        return (
            <div className="container py-5">

                <div className="alert alert-danger">
                    Complaint not found
                </div>

            </div>
        );
    }

    const currentOfficer =
        officers.find(
            officer =>
                officer.id === complaint.assigned_to
        );

    return (

        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold">
                        Complaint Management
                    </h2>

                    <p className="text-muted mb-0">
                        {complaint.complaint_id}
                    </p>

                </div>

                <div className="d-flex gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={handleDeleteComplaint}
                        title="Permanently delete this complaint"
                    >
                        <i className="bi bi-trash3 me-2"></i>
                        Delete Complaint
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => navigate("/admin")}
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to Admin
                    </button>
                </div>

            </div>

            <div className="row g-4">

                <div className="col-lg-8">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <div className="d-flex justify-content-between align-items-start">

                                <div>

                                    <h3 className="fw-bold">
                                        {complaint.title}
                                    </h3>

                                    <p className="text-muted">
                                        {complaint.location}
                                    </p>

                                </div>

                                <span className="badge bg-success fs-6">
                                    {complaint.status.replace(
                                        "_",
                                        " "
                                    )}
                                </span>

                            </div>

                            <hr />

                            <div className="row g-3 mb-4">

                                <div className="col-md-4">

                                    <div className="bg-light rounded p-3">

                                        <small className="text-muted">
                                            Category
                                        </small>

                                        <div className="fw-bold mt-1">
                                            {complaint.category}
                                        </div>

                                    </div>

                                </div>

                                <div className="col-md-4">

                                    <div className="bg-light rounded p-3">

                                        <small className="text-muted">
                                            Priority
                                        </small>

                                        <div className="fw-bold mt-1">
                                            {complaint.priority}
                                        </div>

                                    </div>

                                </div>

                                <div className="col-md-4">

                                    <div className="bg-light rounded p-3">

                                        <small className="text-muted">
                                            Reported By
                                        </small>

                                        <div className="fw-bold mt-1">
                                            {complaint.user}
                                        </div>

                                    </div>

                                </div>

                            </div>

                            <h5 className="fw-bold">
                                Description
                            </h5>

                            <p>
                                {complaint.description}
                            </p>

                            {complaint.image && (

                                <div className="mt-4">

                                    <h5 className="fw-bold">
                                        Evidence Image
                                    </h5>

                                    <img
                                        src={
                                            complaint.image.startsWith(
                                                "http"
                                            )
                                                ? complaint.image
                                                : `https://civicfix-fs43.onrender.com${complaint.image}`
                                        }
                                        alt="Complaint"
                                        className="detail-image rounded"
                                    />

                                </div>

                            )}

                            {complaint.resolution_image && (

                                <div className="mt-4">

                                    <h5 className="fw-bold text-success">
                                        <i className="bi bi-patch-check me-2"></i>
                                        Resolution Proof
                                    </h5>

                                    <img
                                        src={
                                            complaint.resolution_image.startsWith(
                                                "http"
                                            )
                                                ? complaint.resolution_image
                                                : `https://civicfix-fs43.onrender.com${complaint.resolution_image}`
                                        }
                                        alt="Resolution proof"
                                        className="detail-image rounded"
                                    />

                                </div>

                            )}

                        </div>

                    </div>

                </div>

                <div className="col-lg-4">

                    <div className="card shadow-sm mb-4">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">

                                <i className="bi bi-person-badge me-2"></i>

                                Assign Complaint

                            </h5>

                            <div className="mb-3">

                                <label className="form-label">
                                    Department
                                </label>

                                <select
                                    className="form-select"
                                    value={department}
                                    onChange={e =>
                                        setDepartment(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select Department
                                    </option>

                                    {departments.map(
                                        dept => (

                                            <option
                                                key={dept}
                                                value={dept}
                                            >
                                                {dept}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Assigned Officer
                                </label>

                                <select
                                    className="form-select"
                                    value={assignedTo}
                                    onChange={e =>
                                        setAssignedTo(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        Select Officer
                                    </option>

                                    {officers.map(
                                        officer => (

                                            <option
                                                key={officer.id}
                                                value={officer.id}
                                            >
                                                {officer.username}
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>

                            <button
                                className="btn btn-success w-100"
                                onClick={assignComplaint}
                                disabled={
                                    assigning ||
                                    complaint.status === "resolved" ||
                                    complaint.status === "rejected"
                                }
                            >

                                {assigning ? (

                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                        >
                                        </span>

                                        Assigning...

                                    </>

                                ) : (

                                    <>
                                        <i className="bi bi-person-check me-2"></i>
                                        Assign Complaint
                                    </>

                                )}

                            </button>

                            {currentOfficer && (

                                <div className="alert alert-success mt-3 mb-0">

                                    <small>
                                        Currently Assigned To
                                    </small>

                                    <div className="fw-bold">
                                        {currentOfficer.username}
                                    </div>

                                    <small>
                                        {complaint.department}
                                    </small>

                                </div>

                            )}

                        </div>

                    </div>

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Update Complaint
                            </h5>

                            <div className="mb-3">

                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    value={statusValue}
                                    onChange={e =>
                                        setStatusValue(
                                            e.target.value
                                        )
                                    }
                                >

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

                            <div className="mb-3">

                                <label className="form-label">
                                    Priority
                                </label>

                                <select
                                    className="form-select"
                                    value={priority}
                                    onChange={e =>
                                        setPriority(
                                            e.target.value
                                        )
                                    }
                                >

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

                            <div className="mb-3">

                                <label className="form-label">
                                    Resolution Note
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={resolutionNote}
                                    onChange={e =>
                                        setResolutionNote(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter resolution details..."
                                >
                                </textarea>

                            </div>

                            <button
                                className="btn btn-primary w-100"
                                onClick={updateComplaint}
                                disabled={updating}
                            >

                                {updating
                                    ? "Updating..."
                                    : "Update Complaint"}

                            </button>

                        </div>

                    </div>

                </div>

            </div>

            <div className="card shadow-sm mt-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-4">
                        Complaint Location
                    </h5>

                    {complaint.latitude &&
                    complaint.longitude ? (

                        <ComplaintMap
                            complaints={[complaint]}
                        />

                    ) : (

                        <div className="alert alert-warning mb-0">
                            Location coordinates are not available.
                        </div>

                    )}

                </div>

            </div>

            <div className="card shadow-sm mt-4">

                <div className="card-body">

                    <h5 className="fw-bold mb-4">
                        Status History
                    </h5>

                    <div className="timeline">

                        {complaint.status_history &&
                        complaint.status_history.length > 0 ? (

                            complaint.status_history
                                .slice()
                                .reverse()
                                .map(
                                    history => (

                                        <div
                                            className="timeline-item"
                                            key={history.id}
                                        >

                                            <div className="timeline-dot">
                                                <i className="bi bi-check"></i>
                                            </div>

                                            <div className="timeline-content">

                                                <h6 className="fw-bold">
                                                    {history.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </h6>

                                                <p>
                                                    {history.note ||
                                                        "Status updated"}
                                                </p>

                                                <small className="text-muted">
                                                    {new Date(
                                                        history.created_at
                                                    ).toLocaleString()}
                                                </small>

                                            </div>

                                        </div>

                                    )
                                )

                        ) : (

                            <p className="text-muted">
                                No status history available.
                            </p>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );
}

export default AdminComplaintDetails;
