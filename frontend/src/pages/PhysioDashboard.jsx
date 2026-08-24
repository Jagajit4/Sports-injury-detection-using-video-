import { useEffect, useState } from "react";

import {
    FaHeartbeat,
    FaRunning,
    FaClipboardCheck,
    FaUserInjured,
    FaUsers,
    FaExclamationTriangle,
    FaCheckCircle,
    FaTimesCircle,
    FaUserClock,
    FaSyncAlt
} from "react-icons/fa";

import api from "../services/api";

import "../styles/dashboard.css";


export default function PhysioDashboard() {

    const [athletes, setAthletes] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [latestAnalyses, setLatestAnalyses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingRequest, setProcessingRequest] = useState(null);


    useEffect(() => {

        loadDashboard();

    }, []);


    /*
     * If the dashboard is opened using
     * /physio#patients, automatically scroll
     * to the Patients section.
     */

    useEffect(() => {

        if (loading) {
            return;
        }

        if (window.location.hash === "#patients") {

            setTimeout(() => {

                const element =
                    document.getElementById("patients");

                if (element) {

                    element.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }, 100);

        }

    }, [loading]);


    async function loadDashboard() {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");


            if (!token) {

                setError(
                    "Please login again."
                );

                setLoading(false);

                return;

            }


            const headers = {

                Authorization:
                    `Bearer ${token}`

            };


            const [
                connectionsResponse,
                requestsResponse,
                analysesResponse
            ] = await Promise.all([

                api.get(
                    "/connections/my-connections",
                    { headers }
                ),

                api.get(
                    "/connections/pending",
                    { headers }
                ),

                api.get(
                    "/video/assigned-athletes/latest",
                    { headers }
                )

            ]);


            const connectionData =
                connectionsResponse.data || {};


            setAthletes(

                Array.isArray(
                    connectionData.athletes
                )
                    ? connectionData.athletes
                    : []

            );


            setPendingRequests(

                Array.isArray(
                    requestsResponse.data
                )
                    ? requestsResponse.data
                    : []

            );


            const analysisData =
                analysesResponse.data || {};


            setLatestAnalyses(

                Array.isArray(
                    analysisData.athletes
                )
                    ? analysisData.athletes
                    : []

            );

        }

        catch (err) {

            console.error(
                "Physiotherapist dashboard error:",
                err
            );


            if (
                err.response?.status === 403
            ) {

                setError(
                    "Access denied. Please make sure the logged-in account is a Physiotherapist."
                );

            }

            else if (
                err.response?.status === 401
            ) {

                setError(
                    "Your session has expired. Please login again."
                );

            }

            else {

                setError(
                    err.response?.data?.detail ||
                    "Unable to load physiotherapist dashboard."
                );

            }

        }

        finally {

            setLoading(false);

        }

    }


    async function acceptRequest(requestId) {

        try {

            setProcessingRequest(requestId);
            setError("");
            setMessage("");


            const token =
                localStorage.getItem("token");


            await api.put(

                `/connections/accept/${requestId}`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            setMessage(
                "Athlete connection accepted successfully."
            );


            await loadDashboard();

        }

        catch (err) {

            console.error(
                "Accept request error:",
                err
            );


            setError(
                err.response?.data?.detail ||
                "Unable to accept connection request."
            );

        }

        finally {

            setProcessingRequest(null);

        }

    }


    async function rejectRequest(requestId) {

        try {

            setProcessingRequest(requestId);
            setError("");
            setMessage("");


            const token =
                localStorage.getItem("token");


            await api.put(

                `/connections/reject/${requestId}`,

                {},

                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }

            );


            setMessage(
                "Connection request rejected."
            );


            await loadDashboard();

        }

        catch (err) {

            console.error(
                "Reject request error:",
                err
            );


            setError(
                err.response?.data?.detail ||
                "Unable to reject connection request."
            );

        }

        finally {

            setProcessingRequest(null);

        }

    }


    async function refreshDashboard() {

        setMessage("");

        await loadDashboard();

    }


    function getAnalysis(item) {

        return (
            item?.latest_video?.analysis ||
            null
        );

    }


    function getRisk(item) {

        const analysis =
            getAnalysis(item);


        return String(
            analysis?.injury_risk ||
            ""
        )
            .trim()
            .toLowerCase();

    }


    function getRiskLabel(item) {

        const analysis =
            getAnalysis(item);


        return (
            analysis?.injury_risk ||
            "No analysis"
        );

    }


    function getRiskClass(item) {

        const risk =
            getRisk(item);


        if (risk === "high") {

            return "risk-high";

        }


        if (risk === "medium") {

            return "risk-medium";

        }


        if (risk === "low") {

            return "risk-low";

        }


        return "risk-unknown";

    }


    const analysedAthletes =
        latestAnalyses.filter(
            item =>
                item?.latest_video
        );


    const highRisk =
        analysedAthletes.filter(
            item =>
                getRisk(item) === "high"
        ).length;


    const mediumRisk =
        analysedAthletes.filter(
            item =>
                getRisk(item) === "medium"
        ).length;


    const lowRisk =
        analysedAthletes.filter(
            item =>
                getRisk(item) === "low"
        ).length;


    const totalReports =
        analysedAthletes.length;


    if (loading) {

        return (

            <div className="dashboard">

                <div className="empty-analysis">

                    <FaHeartbeat size={40} />

                    <h2>
                        Loading Physiotherapist Dashboard...
                    </h2>

                    <p>
                        Retrieving athletes, requests and
                        biomechanical analysis.
                    </p>

                </div>

            </div>

        );

    }


    if (
        error &&
        !athletes.length &&
        !pendingRequests.length
    ) {

        return (

            <div className="dashboard">

                <div className="empty-analysis">

                    <FaExclamationTriangle size={40} />

                    <h2>
                        Physiotherapist Dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-button"
                        onClick={loadDashboard}
                    >
                        Try Again
                    </button>

                </div>

            </div>

        );

    }


    return (

        <div className="dashboard">

            {/* HERO */}

            <section className="dashboard-hero">

                <div className="hero-content">

                    <p className="dashboard-label">
                        PHYSIOTHERAPIST PORTAL
                    </p>

                    <h1>
                        Physiotherapist Dashboard
                    </h1>

                    <p className="hero-description">
                        Manage athlete connections, monitor
                        biomechanical analysis, assess injury
                        risk and support rehabilitation progress.
                    </p>

                </div>


                <div className="hero-profile">

                    <FaHeartbeat
                        className="large-profile-icon"
                    />

                    <h3>
                        Rehabilitation Monitoring
                    </h3>

                    <p>
                        Athlete Recovery & Injury Prevention
                    </p>

                </div>

            </section>


            {/* MESSAGES */}

            {message && (

                <div className="support-message success">

                    <FaCheckCircle />

                    <span>
                        {message}
                    </span>

                </div>

            )}


            {error && (

                <div className="support-message error">

                    <FaExclamationTriangle />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* QUICK ACTIONS */}

            <section className="quick-actions">

                <a
                    href="#requests"
                    className="action-card"
                >

                    <FaUserClock />

                    <div>

                        <h3>
                            Requests
                        </h3>

                        <p>
                            Review athlete connection requests
                        </p>

                    </div>

                </a>


                <a
                    href="#patients"
                    className="action-card"
                >

                    <FaUsers />

                    <div>

                        <h3>
                            Patients
                        </h3>

                        <p>
                            View assigned athletes and patient status
                        </p>

                    </div>

                </a>


                <a
                    href="#risk-monitoring"
                    className="action-card"
                >

                    <FaUserInjured />

                    <div>

                        <h3>
                            Injury Risk
                        </h3>

                        <p>
                            Monitor current injury risk levels
                        </p>

                    </div>

                </a>


                <a
                    href="#reports"
                    className="action-card"
                >

                    <FaClipboardCheck />

                    <div>

                        <h3>
                            Reports
                        </h3>

                        <p>
                            Review latest AI assessments
                        </p>

                    </div>

                </a>

            </section>


            {/* OVERVIEW */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            REHABILITATION OVERVIEW
                        </p>

                        <h2>
                            Current Athlete Statistics
                        </h2>

                    </div>


                    <button
                        className="secondary-button"
                        onClick={refreshDashboard}
                    >

                        <FaSyncAlt />

                        Refresh

                    </button>

                </div>


                <div className="stats-grid">

                    <div className="stat-card">

                        <FaUsers size={26} />

                        <span className="stat-title">
                            Assigned Athletes
                        </span>

                        <strong className="stat-value">
                            {athletes.length}
                        </strong>

                        <span className="stat-description">
                            Connected athletes
                        </span>

                    </div>


                    <div className="stat-card">

                        <FaUserClock size={26} />

                        <span className="stat-title">
                            Pending Requests
                        </span>

                        <strong className="stat-value">
                            {pendingRequests.length}
                        </strong>

                        <span className="stat-description">
                            Requests awaiting approval
                        </span>

                    </div>


                    <div className="stat-card">

                        <FaExclamationTriangle size={26} />

                        <span className="stat-title">
                            High Risk
                        </span>

                        <strong className="stat-value">
                            {highRisk}
                        </strong>

                        <span className="stat-description">
                            Athletes requiring attention
                        </span>

                    </div>


                    <div className="stat-card">

                        <FaClipboardCheck size={26} />

                        <span className="stat-title">
                            AI Reports
                        </span>

                        <strong className="stat-value">
                            {totalReports}
                        </strong>

                        <span className="stat-description">
                            Completed movement assessments
                        </span>

                    </div>

                </div>

            </section>


            {/* REQUESTS */}

            <section
                className="dashboard-section"
                id="requests"
            >

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            CONNECTIONS
                        </p>

                        <h2>
                            Athlete Connection Requests
                        </h2>

                    </div>

                    <span className="count-badge">
                        {pendingRequests.length}
                    </span>

                </div>


                {pendingRequests.length === 0 ? (

                    <div className="empty-analysis">

                        <FaCheckCircle size={36} />

                        <h3>
                            No pending requests
                        </h3>

                        <p>
                            New athlete requests will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="professional-grid">

                        {pendingRequests.map(
                            request => (

                                <div
                                    className="professional-card"
                                    key={request.id}
                                >

                                    <div className="professional-icon">

                                        <FaRunning />

                                    </div>


                                    <div className="professional-info">

                                        <h3>
                                            {request.athlete_name}
                                        </h3>

                                        <p>
                                            {request.athlete_email}
                                        </p>

                                        <p>
                                            <strong>
                                                Sport:
                                            </strong>{" "}
                                            {request.sport ||
                                                "Not updated"}
                                        </p>

                                        <p>
                                            <strong>
                                                Experience:
                                            </strong>{" "}
                                            {request.experience != null
                                                ? `${request.experience} years`
                                                : "Not updated"}
                                        </p>

                                    </div>


                                    <div className="professional-action">

                                        <button
                                            className="request-button"
                                            disabled={
                                                processingRequest ===
                                                request.id
                                            }
                                            onClick={() =>
                                                acceptRequest(
                                                    request.id
                                                )
                                            }
                                        >

                                            <FaCheckCircle />

                                            {processingRequest ===
                                            request.id
                                                ? "Processing..."
                                                : "Accept"}

                                        </button>


                                        <button
                                            className="cancel-button"
                                            disabled={
                                                processingRequest ===
                                                request.id
                                            }
                                            onClick={() =>
                                                rejectRequest(
                                                    request.id
                                                )
                                            }
                                        >

                                            <FaTimesCircle />

                                            Reject

                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* ==================================================
                PATIENTS / ASSIGNED ATHLETES
                IMPORTANT: id="patients"
            ================================================== */}

            <section
                className="dashboard-section"
                id="patients"
            >

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            PATIENT MANAGEMENT
                        </p>

                        <h2>
                            Assigned Patients
                        </h2>

                        <p className="hero-description">
                            View athletes assigned to your
                            physiotherapy care and their latest
                            biomechanical assessment.
                        </p>

                    </div>

                    <span className="count-badge">
                        {athletes.length}
                    </span>

                </div>


                {athletes.length === 0 ? (

                    <div className="empty-analysis">

                        <FaUsers size={40} />

                        <h3>
                            No patients assigned yet
                        </h3>

                        <p>
                            Accept an athlete connection request
                            to begin monitoring that athlete.
                        </p>

                    </div>

                ) : (

                    <div className="professional-grid">

                        {athletes.map(
                            athlete => {

                                const latest =
                                    latestAnalyses.find(
                                        item =>
                                            Number(
                                                item?.athlete?.id
                                            ) ===
                                            Number(
                                                athlete.id
                                            )
                                    );


                                const analysis =
                                    getAnalysis(latest);


                                return (

                                    <div
                                        className="professional-card"
                                        key={athlete.id}
                                    >

                                        <div className="professional-icon">

                                            <FaRunning />

                                        </div>


                                        <div className="professional-info">

                                            <h3>
                                                {athlete.username}
                                            </h3>

                                            <p>
                                                {athlete.email}
                                            </p>

                                            <p>

                                                <strong>
                                                    Sport:
                                                </strong>{" "}

                                                {athlete.sport ||
                                                    "Not updated"}

                                            </p>

                                            <p>

                                                <strong>
                                                    Experience:
                                                </strong>{" "}

                                                {athlete.experience != null
                                                    ? `${athlete.experience} years`
                                                    : "Not updated"}

                                            </p>


                                            <p>

                                                <strong>
                                                    Movement:
                                                </strong>{" "}

                                                {analysis?.movement_quality ||
                                                    "No analysis yet"}

                                            </p>


                                            <p>

                                                <strong>
                                                    Risk:
                                                </strong>{" "}

                                                {analysis?.injury_risk ||
                                                    "No analysis yet"}

                                            </p>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


            {/* RISK MONITORING */}

            <section
                className="dashboard-section"
                id="risk-monitoring"
            >

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            RISK MONITORING
                        </p>

                        <h2>
                            Athlete Injury Risk
                        </h2>

                    </div>

                </div>


                <div className="stats-grid">

                    <div className="stat-card">

                        <span className="stat-title">
                            High Risk
                        </span>

                        <strong className="stat-value">
                            {highRisk}
                        </strong>

                        <span className="stat-description">
                            Immediate attention recommended
                        </span>

                    </div>


                    <div className="stat-card">

                        <span className="stat-title">
                            Medium Risk
                        </span>

                        <strong className="stat-value">
                            {mediumRisk}
                        </strong>

                        <span className="stat-description">
                            Continue monitoring
                        </span>

                    </div>


                    <div className="stat-card">

                        <span className="stat-title">
                            Low Risk
                        </span>

                        <strong className="stat-value">
                            {lowRisk}
                        </strong>

                        <span className="stat-description">
                            Normal movement assessment
                        </span>

                    </div>

                </div>

            </section>


            {/* REHABILITATION */}

            <section
                className="dashboard-section"
                id="rehabilitation"
            >

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            REHABILITATION
                        </p>

                        <h2>
                            Movement & Recovery Monitoring
                        </h2>

                    </div>

                </div>


                {analysedAthletes.length === 0 ? (

                    <div className="empty-analysis">

                        <FaRunning size={36} />

                        <h3>
                            No biomechanical analyses available
                        </h3>

                        <p>
                            Once an assigned athlete uploads a
                            training video, the AI analysis will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="analysis-summary-grid">

                        {analysedAthletes.map(
                            item => {

                                const analysis =
                                    getAnalysis(item);


                                return (

                                    <div
                                        className="summary-card"
                                        key={
                                            item?.latest_video?.id ||
                                            item?.athlete?.id
                                        }
                                    >

                                        <span>
                                            {item?.athlete?.username ||
                                                "Athlete"}
                                        </span>

                                        <strong>
                                            {analysis?.movement_quality ||
                                                "Unknown"}
                                        </strong>

                                        <small>
                                            Movement Quality
                                        </small>

                                        <small>
                                            Risk:{" "}
                                            {analysis?.injury_risk ||
                                                "Unknown"}
                                        </small>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </section>


            {/* REPORTS */}

            <section
                className="dashboard-section"
                id="reports"
            >

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            REPORTS
                        </p>

                        <h2>
                            Latest Biomechanical Reports
                        </h2>

                    </div>

                </div>


                {analysedAthletes.length === 0 ? (

                    <div className="empty-analysis">

                        <FaClipboardCheck size={36} />

                        <p>
                            No reports available yet.
                        </p>

                    </div>

                ) : (

                    <div className="history-table-wrapper">

                        <table className="analysis-table">

                            <thead>

                                <tr>

                                    <th>
                                        Athlete
                                    </th>

                                    <th>
                                        Video
                                    </th>

                                    <th>
                                        Movement
                                    </th>

                                    <th>
                                        Risk
                                    </th>

                                    <th>
                                        Symmetry
                                    </th>

                                    <th>
                                        Knee Angle
                                    </th>

                                    <th>
                                        Recommendation
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {analysedAthletes.map(
                                    item => {

                                        const video =
                                            item?.latest_video;

                                        const analysis =
                                            video?.analysis;


                                        return (

                                            <tr
                                                key={
                                                    video?.id ||
                                                    item?.athlete?.id
                                                }
                                            >

                                                <td>
                                                    <strong>
                                                        {
                                                            item?.athlete?.username ||
                                                            "Unknown"
                                                        }
                                                    </strong>
                                                </td>


                                                <td>
                                                    {video?.filename ||
                                                        "Unknown"}
                                                </td>


                                                <td>
                                                    {analysis?.movement_quality ||
                                                        "Unknown"}
                                                </td>


                                                <td>

                                                    <span
                                                        className={
                                                            `risk-badge ${getRiskClass(item)}`
                                                        }
                                                    >

                                                        {getRiskLabel(item)}

                                                    </span>

                                                </td>


                                                <td>

                                                    {analysis
                                                        ? `${Number(
                                                            analysis.posture_symmetry ||
                                                            0
                                                        ).toFixed(1)}%`
                                                        : "--"}

                                                </td>


                                                <td>

                                                    {analysis
                                                        ? `${Number(
                                                            analysis.average_knee_angle ||
                                                            0
                                                        ).toFixed(1)}°`
                                                        : "--"}

                                                </td>


                                                <td>

                                                    {analysis?.recommendation ||
                                                        "No recommendation"}

                                                </td>

                                            </tr>

                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>


            {/* SYSTEM STATUS */}

            <section className="dashboard-section">

                <div className="recommendation-card">

                    <FaCheckCircle />

                    <h3>
                        AI Monitoring System Active
                    </h3>

                    <p>
                        Connected athlete videos are processed
                        through the biomechanical analysis pipeline.
                        Latest assessments are displayed for
                        rehabilitation monitoring and injury-risk
                        assessment.
                    </p>

                </div>

            </section>

        </div>

    );

}