import { useEffect, useState } from "react";

import {
    FaUsers,
    FaUserClock,
    FaCheckCircle,
    FaTimesCircle,
    FaRunning,
    FaHeartbeat,
    FaChartLine
} from "react-icons/fa";

import api from "../services/api";
import "../styles/dashboard.css";


export default function CoachDashboard() {

    const [athletes, setAthletes] = useState([]);
    const [requests, setRequests] = useState([]);
    const [latestAnalyses, setLatestAnalyses] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [processingRequest, setProcessingRequest] = useState(null);


    useEffect(() => {

        loadDashboard();

    }, []);


    /*
     * If the page is opened through /coach#athletes,
     * automatically scroll to the athlete section.
     */

    useEffect(() => {

        if (loading) {
            return;
        }

        const hash =
            window.location.hash;

        if (hash === "#athletes") {

            setTimeout(() => {

                const element =
                    document.getElementById("athletes");

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

            const headers = {
                Authorization:
                    `Bearer ${token}`
            };


            const [
                connectionsResponse,
                requestsResponse,
                latestResponse
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


            setRequests(
                Array.isArray(
                    requestsResponse.data
                )
                    ? requestsResponse.data
                    : []
            );


            const latestData =
                latestResponse.data || {};


            setLatestAnalyses(
                Array.isArray(
                    latestData.athletes
                )
                    ? latestData.athletes
                    : []
            );

        }

        catch (err) {

            console.error(
                "Coach dashboard error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Unable to load coach dashboard."
            );

        }

        finally {

            setLoading(false);

        }

    }


    async function acceptRequest(requestId) {

        try {

            setProcessingRequest(requestId);
            setMessage("");
            setError("");

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

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to accept request."
            );

        }

        finally {

            setProcessingRequest(null);

        }

    }


    async function rejectRequest(requestId) {

        try {

            setProcessingRequest(requestId);
            setMessage("");
            setError("");

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

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Unable to reject request."
            );

        }

        finally {

            setProcessingRequest(null);

        }

    }


    function getLatestForAthlete(athleteId) {

        return latestAnalyses.find(
            item =>
                Number(item?.athlete?.id) ===
                Number(athleteId)
        );

    }


    if (loading) {

        return (

            <div className="dashboard">

                <div className="empty-analysis">

                    <h2>
                        Loading Coach Dashboard...
                    </h2>

                    <p>
                        Retrieving athletes and connection requests.
                    </p>

                </div>

            </div>

        );

    }


    return (

        <div className="dashboard">

            {/* ==================================================
                HEADER
            ================================================== */}

            <section className="dashboard-hero">

                <div className="hero-content">

                    <p className="dashboard-label">
                        COACH PORTAL
                    </p>

                    <h1>
                        Coach Dashboard
                    </h1>

                    <p className="hero-description">
                        Manage athlete connections, monitor movement
                        analysis and review injury-risk indicators.
                    </p>

                </div>

            </section>


            {/* ==================================================
                MESSAGES
            ================================================== */}

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

                    <FaTimesCircle />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* ==================================================
                STATISTICS
            ================================================== */}

            <section className="dashboard-section">

                <div className="stats-grid">

                    <div className="stat-card">

                        <FaUsers size={28} />

                        <span className="stat-title">
                            Connected Athletes
                        </span>

                        <strong className="stat-value">
                            {athletes.length}
                        </strong>

                        <span className="stat-description">
                            Athletes currently assigned to you
                        </span>

                    </div>


                    <div className="stat-card">

                        <FaUserClock size={28} />

                        <span className="stat-title">
                            Pending Requests
                        </span>

                        <strong className="stat-value">
                            {requests.length}
                        </strong>

                        <span className="stat-description">
                            Athletes waiting for approval
                        </span>

                    </div>


                    <div className="stat-card">

                        <FaRunning size={28} />

                        <span className="stat-title">
                            Analysed Athletes
                        </span>

                        <strong className="stat-value">

                            {
                                latestAnalyses.filter(
                                    item =>
                                        item?.latest_video
                                ).length
                            }

                        </strong>

                        <span className="stat-description">
                            Athletes with movement analysis
                        </span>

                    </div>


                    <div className="stat-card">

                        <FaHeartbeat size={28} />

                        <span className="stat-title">
                            Monitoring
                        </span>

                        <strong className="stat-value">
                            Active
                        </strong>

                        <span className="stat-description">
                            AI biomechanical monitoring
                        </span>

                    </div>

                </div>

            </section>


            {/* ==================================================
                CONNECTION REQUESTS
            ================================================== */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            CONNECTIONS
                        </p>

                        <h2>
                            Athlete Requests
                        </h2>

                    </div>

                    <span className="count-badge">
                        {requests.length}
                    </span>

                </div>


                {requests.length === 0 ? (

                    <div className="empty-analysis">

                        <FaCheckCircle size={32} />

                        <h3>
                            No pending requests
                        </h3>

                        <p>
                            New athlete connection requests
                            will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="professional-grid">

                        {requests.map(request => (

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


                                    {request.sport && (

                                        <p>

                                            <strong>
                                                Sport:
                                            </strong>{" "}

                                            {request.sport}

                                        </p>

                                    )}


                                    {request.experience != null && (

                                        <p>

                                            <strong>
                                                Experience:
                                            </strong>{" "}

                                            {request.experience} years

                                        </p>

                                    )}

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

                        ))}

                    </div>

                )}

            </section>


            {/* ==================================================
                CONNECTED ATHLETES
                IMPORTANT: id="athletes"
            ================================================== */}

            <section
                className="dashboard-section"
                id="athletes"
            >

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            YOUR TEAM
                        </p>

                        <h2>
                            Connected Athletes
                        </h2>

                        <p className="hero-description">
                            View athletes assigned to your coaching
                            team and their latest movement assessment.
                        </p>

                    </div>

                    <span className="count-badge">
                        {athletes.length}
                    </span>

                </div>


                {athletes.length === 0 ? (

                    <div className="empty-analysis">

                        <FaUsers size={36} />

                        <h3>
                            No athletes connected yet
                        </h3>

                        <p>
                            When an athlete request is accepted,
                            that athlete will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="professional-grid">

                        {athletes.map(athlete => {

                            const latest =
                                getLatestForAthlete(
                                    athlete.id
                                );

                            const latestVideo =
                                latest?.latest_video;

                            const analysis =
                                latestVideo?.analysis;


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

                                            {athlete.experience ??
                                                0} years

                                        </p>


                                        {analysis ? (

                                            <>

                                                <p>

                                                    <strong>
                                                        Movement:
                                                    </strong>{" "}

                                                    {analysis.movement_quality ||
                                                        "Unknown"}

                                                </p>


                                                <p>

                                                    <strong>
                                                        Risk:
                                                    </strong>{" "}

                                                    {analysis.injury_risk ||
                                                        "Unknown"}

                                                </p>

                                            </>

                                        ) : (

                                            <p>

                                                <strong>
                                                    Analysis:
                                                </strong>{" "}

                                                No analysis available yet

                                            </p>

                                        )}

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </section>


            {/* ==================================================
                LATEST ANALYSES
            ================================================== */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>

                        <p className="dashboard-label">
                            AI ANALYSIS
                        </p>

                        <h2>
                            Latest Athlete Analyses
                        </h2>

                    </div>

                </div>


                {latestAnalyses.length === 0 ? (

                    <div className="empty-analysis">

                        <FaChartLine size={32} />

                        <h3>
                            No analyses available
                        </h3>

                        <p>
                            Connected athletes will appear here
                            after uploading training videos.
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
                                        Sport
                                    </th>

                                    <th>
                                        Movement Quality
                                    </th>

                                    <th>
                                        Injury Risk
                                    </th>

                                    <th>
                                        Symmetry
                                    </th>

                                    <th>
                                        Knee Angle
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {latestAnalyses.map(item => {

                                    const video =
                                        item?.latest_video;

                                    const analysis =
                                        video?.analysis;


                                    return (

                                        <tr
                                            key={
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
                                                {
                                                    item?.athlete?.sport ||
                                                    "Not updated"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    analysis?.movement_quality ||
                                                    "No analysis"
                                                }
                                            </td>

                                            <td>

                                                <span className="risk-badge">

                                                    {
                                                        analysis?.injury_risk ||
                                                        "No analysis"
                                                    }

                                                </span>

                                            </td>

                                            <td>

                                                {
                                                    analysis
                                                        ? `${Number(
                                                            analysis.posture_symmetry || 0
                                                        ).toFixed(1)}%`
                                                        : "--"
                                                }

                                            </td>

                                            <td>

                                                {
                                                    analysis
                                                        ? `${Number(
                                                            analysis.average_knee_angle || 0
                                                        ).toFixed(1)}°`
                                                        : "--"
                                                }

                                            </td>

                                        </tr>

                                    );

                                })}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>

    );

}