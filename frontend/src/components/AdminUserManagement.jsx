import { useCallback, useEffect, useState } from "react";
import API from "../api";

function AdminUserManagement() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");

    const loadAccounts = useCallback(async () => {
        setError("");
        try {
            const response = await API.get("/accounts/users/");
            setAccounts(response.data);
        } catch (loadError) {
            setError(loadError.response?.data?.message || "Could not load citizen and agent accounts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    const toggleAccount = async (account) => {
        const action = account.is_active ? "deactivate" : "activate";
        if (account.is_active && !window.confirm(`Deactivate ${account.username}'s account? They will no longer be able to sign in.`)) {
            return;
        }

        setUpdatingId(account.id);
        setError("");
        try {
            await API.patch("/accounts/users/", {
                user_id: account.id,
                is_active: !account.is_active,
            });
            setAccounts((current) => current.map((item) => (
                item.id === account.id ? { ...item, is_active: !item.is_active } : item
            )));
        } catch (updateError) {
            setError(updateError.response?.data?.message || `Could not ${action} this account.`);
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <section id="admin-accounts" className="card shadow-sm border-0 mb-5" aria-labelledby="admin-accounts-heading" style={{ scrollMarginTop: "88px" }}>
            <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                    <div>
                        <h4 id="admin-accounts-heading" className="fw-bold mb-1">
                            <i className="bi bi-person-lock text-success me-2" />
                            Citizen &amp; Agent Accounts
                        </h4>
                        <p className="small text-muted mb-0">Admin-only account directory. Activate or suspend access as needed.</p>
                    </div>
                    <button type="button" className="btn btn-outline-success btn-sm" onClick={loadAccounts} disabled={loading}>
                        <i className="bi bi-arrow-clockwise me-1" /> Refresh
                    </button>
                </div>

                {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

                {loading ? (
                    <div className="text-center py-4 text-muted"><span className="spinner-border spinner-border-sm me-2" />Loading accounts…</div>
                ) : accounts.length === 0 ? (
                    <div className="alert alert-info mb-0">No citizen or agent accounts have been registered yet.</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th>Account</th>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                    <th className="text-end">Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accounts.map((account) => (
                                    <tr key={account.id}>
                                        <td>
                                            <strong className="d-block">{`${account.first_name} ${account.last_name}`.trim() || account.username}</strong>
                                            <small className="text-muted">@{account.username}</small>
                                        </td>
                                        <td><span className={`badge ${account.role === "officer" ? "bg-primary" : "bg-success"}`}>{account.role === "officer" ? "Agent / Officer" : "Citizen"}</span></td>
                                        <td>{account.email || <span className="text-muted">Not provided</span>}</td>
                                        <td>{account.department || "—"}</td>
                                        <td><span className={`badge ${account.is_active ? "bg-success" : "bg-secondary"}`}>{account.is_active ? "Active" : "Inactive"}</span></td>
                                        <td><small className="text-muted">{account.date_joined || "—"}</small></td>
                                        <td className="text-end">
                                            <button
                                                type="button"
                                                className={`btn btn-sm ${account.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                                                onClick={() => toggleAccount(account)}
                                                disabled={updatingId === account.id}
                                            >
                                                {updatingId === account.id ? "Saving…" : account.is_active ? "Deactivate" : "Activate"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminUserManagement;
