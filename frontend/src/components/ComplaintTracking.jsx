function ComplaintTracking({ complaint }) {

    const steps = [
        {
            key: "pending",
            label: "Complaint Submitted",
            icon: "bi-file-earmark-text"
        },
        {
            key: "assigned",
            label: "Officer Assigned",
            icon: "bi-person-check"
        },
        {
            key: "in_progress",
            label: "Work In Progress",
            icon: "bi-tools"
        },
        {
            key: "resolved",
            label: "Complaint Resolved",
            icon: "bi-check-circle"
        }
    ];

    const statusOrder = {
        pending: 0,
        assigned: 1,
        in_progress: 2,
        resolved: 3
    };

    const currentIndex =
        statusOrder[complaint.status] ?? 0;

    return (
        <div className="card shadow-sm mt-4">

            <div className="card-body">

                <h4 className="fw-bold mb-4">
                    Complaint Progress
                </h4>

                <div className="tracking-container">

                    {steps.map((step, index) => {

                        const completed =
                            index <= currentIndex;

                        return (
                            <div
                                className={`tracking-step ${
                                    completed ? "completed" : ""
                                } ${index === currentIndex ? "active-step" : ""}`}
                                key={step.key}
                            >

                                <div className="tracking-icon">

                                    <i
                                        className={`bi ${step.icon}`}
                                    ></i>

                                </div>

                                <div className="tracking-content">

                                    <h6>
                                        {step.label}
                                    </h6>

                                    {index === currentIndex && (
                                        <span className="badge bg-success">
                                            Current Status
                                        </span>
                                    )}

                                </div>

                            </div>
                        );

                    })}

                </div>

                {complaint.status === "rejected" && (

                    <div className="alert alert-danger mt-3">

                        <i className="bi bi-x-circle me-2"></i>

                        This complaint has been rejected.

                    </div>

                )}

            </div>

        </div>
    );
}

export default ComplaintTracking;

