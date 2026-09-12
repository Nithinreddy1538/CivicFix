import { useEffect, useState } from "react";
import API from "../api";

function AdminCommandCenter() {

    const [data, setData] = useState(null);

    const loadAnalytics = async () => {

        try {

            const response = await API.get(
                "/complaints/analytics/"
            );

            setData(response.data);

        } catch (error) {

            console.error(error);

        }
    };

    useEffect(() => {
        loadAnalytics();

        const interval = setInterval(
            loadAnalytics,
            30000
        );

        return () => clearInterval(interval);

    }, []);

    if (!data) {
        return (
            <div className="text-center py-4">
                Loading command center...
            </div>
        );
    }

    const summary = data.summary;

    return (
        <div>

            <div className="row g-3 mb-4">

                <div className="col-md-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">
                                Total Complaints
                            </small>

                            <h2 className="fw-bold">
                                {summary.total}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">
                                Pending
                            </small>

                            <h2 className="fw-bold text-warning">
                                {summary.pending}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">
                                Resolved
                            </small>

                            <h2 className="fw-bold text-success">
                                {summary.resolved}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">
                                Overdue
                            </small>

                            <h2 className="fw-bold text-danger">
                                {summary.overdue}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">
                                Resolution Rate
                            </small>

                            <h2 className="fw-bold text-success">
                                {summary.resolution_rate}%
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="card shadow-sm h-100">
                        <div className="card-body">
                            <small className="text-muted">
                                Citizen Rating
                            </small>

                            <h2 className="fw-bold">
                                ⭐ {summary.average_rating}
                            </h2>
                        </div>
                    </div>
                </div>

            </div>

            <div className="row g-4">

                <div className="col-lg-6">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">
                                Department Workload
                            </h5>

                            {data.departments.map(
                                department => (

                                    <div
                                        key={department.department}
                                        className="mb-3"
                                    >

                                        <div className="d-flex justify-content-between">

                                            <span>
                                                {department.department}
                                            </span>

                                            <strong>
                                                {department.count}
                                            </strong>

                                        </div>

                                        <div className="progress">

                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${Math.min(
                                                        department.count * 10,
                                                        100
                                                    )}%`
                                                }}
                                            />

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

                <div className="col-lg-6">

                    <div className="card shadow-sm h-100">

                        <div className="card-body">

                            <h5 className="fw-bold mb-3">
                                Officer Workload
                            </h5>

                            {data.officers.map(
                                officer => (

                                    <div
                                        key={officer.id}
                                        className="border-bottom py-3"
                                    >

                                        <div className="d-flex justify-content-between">

                                            <strong>
                                                {officer.username}
                                            </strong>

                                            <span className="badge bg-primary">
                                                {officer.assigned}
                                            </span>

                                        </div>

                                        <small className="text-muted">
                                            {officer.resolved} resolved
                                        </small>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default AdminCommandCenter;

