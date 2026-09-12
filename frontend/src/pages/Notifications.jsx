import { useEffect, useState } from "react";
import API from "../api";

function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {

        try {

            const response = await API.get(
                "/notifications/"
            );

            setNotifications(response.data);

        } catch (error) {

            console.log(error);

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
                notifications.map(
                    notification =>
                        notification.id === id
                            ? {
                                ...notification,
                                is_read: true
                            }
                            : notification
                )
            );

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
                notifications.map(
                    notification => ({
                        ...notification,
                        is_read: true
                    })
                )
            );

        } catch (error) {

            console.log(error);

        }
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

                    <p className="text-muted mb-0">
                        Stay updated about your complaints and resolution milestones.
                    </p>

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

                        {notifications.map(
                            (notification, idx) => (

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

                                                {!notification.is_read && (

                                                    <div className="mt-3">

                                                        <button
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() =>
                                                                markAsRead(
                                                                    notification.id
                                                                )
                                                            }
                                                        >
                                                            Mark as Read
                                                        </button>

                                                    </div>

                                                )}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}

        </div>
    );
}

export default Notifications;

