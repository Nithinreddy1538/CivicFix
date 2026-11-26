import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Notifications() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role") || "citizen";

    const [notifications, setNotifications] = useState([]);
    const [complaintPaths, setComplaintPaths] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {

        try {
            setError("");

            const [notificationResult, complaintResult] = await Promise.all([
                API.get("/notifications/"),
                API.get("/complaints/").catch(() => ({ data: [] }))
            ]);
            let loadedNotifications = notificationResult.data;
            if (loadedNotifications.some(notification => !notification.is_read)) {
                try {
                    await API.put("/notifications/read-all/");
                    loadedNotifications = loadedNotifications.map(notification => ({
                        ...notification,
                        is_read: true
                    }));
                    window.dispatchEvent(new Event("notifications-updated"));
                } catch {
                    setError("Notifications loaded, but unread messages could not be marked as read. Use Mark All as Read to retry.");
                }
            }
            setNotifications(loadedNotifications);

            const detailBase = role === "admin"
                ? "/admin/complaints/"
                : role === "officer"
                    ? "/officer/complaints/"
                    : "/complaints/";
            const paths = {};
            complaintResult.data.forEach(complaint => {
                paths[complaint.complaint_id.toUpperCase()] = `${detailBase}${complaint.id}`;
            });
            setComplaintPaths(paths);

        } catch (error) {
            setError(error.response?.data?.detail || "Notifications could not be loaded. Check your connection and try again.");

        } finally {

            setLoading(false);

        }
    };

    const markAsRead = async (id) => {

        try {

            await API.put(
                `/notifications/${id}/read/`
            );

            setNotifications(
                current => current.map(
                    notification =>
                        notification.id === id
                            ? {
                                ...notification,
                                is_read: true
                            }
                            : notification
                )
            );
            window.dispatchEvent(new Event("notifications-updated"));

        } catch (error) {

            console.log(error);

        }
    };

    const markAllAsRead = async () => {

        try {

            await API.put(
                "/notifications/read-all/"
            );

            setNotifications(
                current => current.map(
                    notification => ({
                        ...notification,
                        is_read: true
                    })
                )
            );
            window.dispatchEvent(new Event("notifications-updated"));

        } catch (error) {

            console.log(error);

        }
    };

    const openComplaint = async (notification, path) => {
        if (!notification.is_read) await markAsRead(notification.id);
        navigate(path);
    };

    const unreadCount = notifications.filter(
        notification => !notification.is_read
    ).length;

    if (loading) {

        return (
            <div className="container py-5 text-center">

                <div className="spinner-border text-success"></div>

                <p className="mt-3">
                    Loading notifications...
                </p>

            </div>
        );

    }

    return (
        <div className="container py-5 page-enter">

            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">

                <div>

                    <h2 className="fw-bold mb-1">
                        Notifications
                    </h2>

                    <p className="text-muted mb-0">Updates for your account, assignments, and complaint activity.</p>

                </div>

                {unreadCount > 0 && (

                    <button
                        className="btn btn-outline-success btn-shimmer"
                        onClick={markAllAsRead}
                    >
                        <i className="bi bi-check2-all me-1"></i>
                        Mark All as Read
                    </button>

                )}

            </div>

            {error && <div className="alert alert-warning d-flex justify-content-between align-items-center" role="alert">
                <span>{error}</span>
                <button className="btn btn-sm btn-outline-dark ms-3" onClick={loadNotifications}>Retry</button>
            </div>}

            {notifications.length === 0 ? (

                <div className="card shadow-sm border-0" style={{ borderRadius: "16px" }}>

                    <div className="card-body text-center py-5">

                        <i className="bi bi-bell-slash fs-1 text-muted"></i>

                        <h4 className="mt-3 fw-bold">
                            No Notifications
                        </h4>

                        <p className="text-muted mb-0">
                            You don't have any notifications yet.
                        </p>

                    </div>

                </div>

            ) : (

                <div className="row">

                    <div className="col-lg-8 mx-auto">

                        {notifications.map((notification, idx) => {
                            const complaintId = notification.message.match(/CF-\d{4}-\d{4}/i)?.[0]?.toUpperCase();
                            const complaintPath = complaintId ? complaintPaths[complaintId] : null;
                            return (

                                <div
                                    key={notification.id}
                                    className={`notification-card ${
                                        notification.is_read
                                            ? ""
                                            : "unread"
                                    }`}
                                    style={{ animation: `fadeInUp 0.4s ease forwards ${idx * 0.06}s` }}
                                >

                                    <div className="card-body">

                                        <div className="d-flex">

                                            <div className="me-3">

                                                <i
                                                    className={`bi ${
                                                        notification.is_read
                                                            ? "bi-bell text-muted"
                                                            : "bi-bell-fill text-success"
                                                    } fs-3`}
                                                ></i>

                                            </div>

                                            <div className="flex-grow-1">

                                                <div className="d-flex justify-content-between">

                                                    <h5>
                                                        {notification.title}
                                                    </h5>

                                                    {!notification.is_read && (

                                                        <span className="badge bg-success">
                                                            New
                                                        </span>

                                                    )}

                                                </div>

                                                <p className="mb-2">
                                                    {notification.message}
                                                </p>

                                                <small className="text-muted">

                                                    {new Date(
                                                        notification.created_at
                                                    ).toLocaleString()}

                                                </small>

                                                {(complaintPath || !notification.is_read) && (

                                                    <div className="mt-3 d-flex flex-wrap gap-2">

                                                        {complaintPath && <button
                                                            className="btn btn-sm btn-success"
                                                            onClick={() => openComplaint(notification, complaintPath)}
                                                        >
                                                            <i className="bi bi-box-arrow-up-right me-1"></i>
                                                            Open Complaint
                                                        </button>}

                                                        {!notification.is_read && <button
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }
                                                        >
                                                            Mark as Read
                                                        </button>}

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </div>

            )}

        </div>
    );
}

export default Notifications;

