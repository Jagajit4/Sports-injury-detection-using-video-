import { useEffect, useState } from "react";
import { FaUsers, FaUserShield, FaRunning, FaUserTie, FaHeartbeat, FaVideo } from "react-icons/fa";
import api from "../services/api";
import "../styles/admin.css";

export default function AdminDashboard() {

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadAdminDashboard();
    }, []);

    async function loadAdminDashboard() {

        try {

            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Admin login required.");
                return;
            }

            const headers = {
                Authorization: `Bearer ${token}`
            };

            const [dashboardResponse, usersResponse] = await Promise.all([
                api.get("/admin/dashboard", { headers }),
                api.get("/admin/users", { headers })
            ]);

            setStats(dashboardResponse.data);
            setUsers(usersResponse.data);

        } catch (err) {

            console.error("Admin dashboard error:", err);

            if (err.response?.status === 403) {
                setError("Access denied. This account does not have Admin privileges.");
            } else if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else {
                setError("Unable to load admin dashboard.");
            }

        } finally {

            setLoading(false);

        }
    }

    function getRiskCount(type) {

        if (!stats?.risk_distribution) {
            return 0;
        }

        return stats.risk_distribution[type] || 0;
    }

    if (loading) {

        return (
            <div className="admin-page">
                <div className="admin-loading">
                    Loading Admin Dashboard...
                </div>
            </div>
        );

    }

    if (error) {

        return (
            <div className="admin-page">
                <div className="admin-error">
                    <h2>Admin Dashboard</h2>
                    <p>{error}</p>
                    <button onClick={loadAdminDashboard}>
                        Try Again
                    </button>
                </div>
            </div>
        );

    }

    return (

        <div className="admin-page">

            {/* Header */}

            <div className="admin-header">

                <div>
                    <p className="admin-label">ADMINISTRATION</p>
                    <h1>Admin Dashboard</h1>
                    <p className="admin-subtitle">
                        Overall platform monitoring and analysis
                    </p>
                </div>

                <button
                    className="refresh-button"
                    onClick={loadAdminDashboard}
                >
                    Refresh Data
                </button>

            </div>


            {/* Overview */}

            <section>

                <h2 className="section-title">
                    Platform Overview
                </h2>

                <div className="admin-stats-grid">

                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            <FaUsers />
                        </div>

                        <div>
                            <h3>{stats?.total_users ?? 0}</h3>
                            <p>Total Users</p>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            <FaRunning />
                        </div>

                        <div>
                            <h3>{stats?.total_athletes ?? 0}</h3>
                            <p>Athletes</p>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            <FaUserTie />
                        </div>

                        <div>
                            <h3>{stats?.total_coaches ?? 0}</h3>
                            <p>Coaches</p>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            <FaHeartbeat />
                        </div>

                        <div>
                            <h3>{stats?.total_physios ?? 0}</h3>
                            <p>Physiotherapists</p>
                        </div>

                    </div>


                    <div className="admin-stat-card">

                        <div className="stat-icon">
                            <FaVideo />
                        </div>

                        <div>
                            <h3>{stats?.total_videos ?? 0}</h3>
                            <p>Videos Analyzed</p>
                        </div>

                    </div>

                </div>

            </section>


            {/* Risk Analysis */}

            <section className="risk-section">

                <h2 className="section-title">
                    Injury Risk Analysis
                </h2>

                <div className="risk-grid">

                    <div className="risk-card high-risk">

                        <span className="risk-dot"></span>

                        <div>
                            <h3>{getRiskCount("high")}</h3>
                            <p>High Risk Cases</p>
                        </div>

                    </div>


                    <div className="risk-card medium-risk">

                        <span className="risk-dot"></span>

                        <div>
                            <h3>{getRiskCount("medium")}</h3>
                            <p>Medium Risk Cases</p>
                        </div>

                    </div>


                    <div className="risk-card low-risk">

                        <span className="risk-dot"></span>

                        <div>
                            <h3>{getRiskCount("low")}</h3>
                            <p>Low Risk Cases</p>
                        </div>

                    </div>

                </div>

            </section>


            {/* Users */}

            <section className="users-section">

                <div className="section-heading-row">

                    <div>
                        <h2 className="section-title">
                            Registered Users
                        </h2>

                        <p className="section-description">
                            Users currently registered on the platform
                        </p>
                    </div>

                    <span className="user-count">
                        {users.length} Users
                    </span>

                </div>


                <div className="users-table-container">

                    {users.length === 0 ? (

                        <div className="empty-state">
                            No registered users found.
                        </div>

                    ) : (

                        <table className="admin-users-table">

                            <thead>

                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Sport</th>
                                    <th>Experience</th>
                                    <th>Coach</th>
                                    <th>Physio</th>
                                </tr>

                            </thead>

                            <tbody>

                                {users.map((user) => (

                                    <tr key={user.id}>

                                        <td>
                                            #{user.id}
                                        </td>

                                        <td className="username-cell">
                                            {user.username}
                                        </td>

                                        <td>
                                            {user.email}
                                        </td>

                                        <td>

                                            <span
                                                className={`role-badge ${String(
                                                    user.role || ""
                                                ).toLowerCase()}`}
                                            >
                                                {user.role}
                                            </span>

                                        </td>

                                        <td>
                                            {user.sport || "—"}
                                        </td>

                                        <td>
                                            {user.experience != null
                                                ? `${user.experience} years`
                                                : "—"}
                                        </td>

                                        <td>
                                            {user.coach_id
                                                ? `#${user.coach_id}`
                                                : "Not assigned"}
                                        </td>

                                        <td>
                                            {user.physio_id
                                                ? `#${user.physio_id}`
                                                : "Not assigned"}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    )}

                </div>

            </section>


            {/* Admin Information */}

            <section className="admin-info-card">

                <div>
                    <h2>Platform Administration</h2>

                    <p>
                        Monitor registered users, athlete participation,
                        professional accounts, video analyses and injury
                        risk distribution from one centralized dashboard.
                    </p>
                </div>

                <div className="admin-info-items">

                    <span>? User Monitoring</span>
                    <span>? Video Analysis Monitoring</span>
                    <span>? Risk Monitoring</span>
                    <span>? Role Management</span>

                </div>

            </section>

        </div>

    );
}
