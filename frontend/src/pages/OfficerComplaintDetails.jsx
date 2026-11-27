import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api";
import ComplaintMap from "../components/ComplaintMap";

function OfficerComplaintDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [complaint, setComplaint] = useState(null);
    const [statusValue, setStatusValue] = useState("");
    const [note, setNote] = useState("");
    const [resolutionImage, setResolutionImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const loadComplaint = async () => {

        try {

            const response = await API.get(
                `/complaints/${id}/`
            );

            setComplaint(response.data);

            setStatusValue(
                response.data.status
            );

            setNote(
                response.data.resolution_note || ""
            );

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Unable to load complaint"
            );

            navigate("/officer");

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

        loadComplaint();

    }, [id]);

    const updateComplaint = async () => {

        if (!statusValue) {
            alert("Please select a status");
            return;
        }

        setUpdating(true);

        try {

            const formData = new FormData();

            formData.append(
                "status",
                statusValue
            );

            formData.append(
                "note",
                note
            );

            if (resolutionImage) {
                formData.append(
                    "resolution_image",
                    resolutionImage
                );
            }

            await API.put(
                `/complaints/officer/${id}/update/`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert("Complaint updated successfully");

            loadComplaint();

            setResolutionImage(null);

        } catch (error) {

            console.error(error);

            alert(
                error.response?.data?.message ||
                "Failed to update complaint"
            );

        } finally {

            setUpdating(false);

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
        return null;
    }

    return (

        <div className="container py-5">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold">
                        Complaint Details
                    </h2>

                    <p className="text-muted">
                        {complaint.complaint_id}
                    </p>

                </div>

                <button
                    className="btn btn-outline-secondary"
                    onClick={() =>
                        navigate("/officer")
                    }
                >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
                </button>

            </div>

            <div className="row g-4">

                <div className="col-lg-8">

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h3 className="fw-bold">
                                {complaint.title}
                            </h3>

                            <p className="text-muted">
                                {complaint.location}
                            </p>

                            <hr />

                            <h5 className="fw-bold">
                                Description
                            </h5>

                            <p>
                                {complaint.description}
                            </p>

                            <div className="row g-3 mt-2">

                                <div className="col-md-4">

                                    <div className="bg-light p-3 rounded">

                                        <small className="text-muted">
                                            Category
                                        </small>

                                        <div className="fw-bold">
                                            {complaint.category}
                                        </div>

                                    </div>

                                </div>

                                <div className="col-md-4">

                                    <div className="bg-light p-3 rounded">

                                        <small className="text-muted">
                                            Priority
                                        </small>

                                        <div className="fw-bold">
                                            {complaint.priority}
                                        </div>

                                    </div>

                                </div>

                                <div className="col-md-4">

                                    <div className="bg-light p-3 rounded">

                                        <small className="text-muted">
                                            Department
                                        </small>

                                        <div className="fw-bold">
                                            {complaint.department || "Not specified"}
                                        </div>

                                    </div>

                                </div>

                            </div>

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

                    <div className="card shadow-sm">

                        <div className="card-body">

                            <h5 className="fw-bold mb-4">
                                Update Work Status
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

                                    <option value="assigned">
                                        Assigned
                                    </option>

                                    <option value="in_progress">
                                        In Progress
                                    </option>

                                    <option value="resolved">
                                        Resolved
                                    </option>

                                </select>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    Work / Resolution Note
                                </label>

                                <textarea
                                    className="form-control"
                                    rows="4"
                                    value={note}
                                    onChange={e =>
                                        setNote(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Describe the work completed..."
                                >
                                </textarea>

                            </div>

                            <div className="mb-3">

                                <label className="form-label">
                                    After Repair Image
                                </label>

                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={e =>
                                        setResolutionImage(
                                            e.target.files[0]
                                        )
                                    }
                                />

                                <small className="text-muted">
                                    Upload a photo showing the completed work.
                                </small>

                            </div>

                            <button
                                className="btn btn-success w-100"
                                onClick={updateComplaint}
                                disabled={updating}
                            >

                                {updating ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                        >
                                        </span>
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Update Complaint
                                    </>
                                )}

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

                        <div className="alert alert-warning">
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

                        {complaint.status_history
                            ?.slice()
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
                            )}

                    </div>

                </div>

            </div>

        </div>

    );
}

export default OfficerComplaintDetails;
