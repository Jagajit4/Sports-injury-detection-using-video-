import { useEffect, useState } from "react";
import { FaUserCircle, FaUpload, FaUsers, FaChartLine } from "react-icons/fa";
import api from "../services/api";
import "../styles/dashboard.css";

export default function Dashboard() {
    const [user, setUser] = useState({});
    const [videos, setVideos] = useState([]);
    const [latestAnalysis, setLatestAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        setLoading(true);

        await Promise.all([
            getUser(),
            getVideos()
        ]);

        setLoading(false);
    }

    async function getUser() {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setUser(response.data);
        } catch (err) {
            console.error("Unable to load user:", err);
        }
    }

    async function getVideos() {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get("/video/my-videos", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const formattedVideos = response.data.map((video) => ({
                id: video.id,
                filename: video.filename,
                ...(video.analysis || {})
            }));

            setVideos(formattedVideos);

            if (formattedVideos.length > 0) {
                setLatestAnalysis(
                    formattedVideos[formattedVideos.length - 1]
                );
            } else {
                setLatestAnalysis(null);
            }
        } catch (err) {
            console.error("Unable to load videos:", err);
        }
    }

    const latestVideo =
        latestAnalysis ||
        (videos.length > 0 ? videos[videos.length - 1] : null);

    const averageKneeAngle = latestVideo
        ? (
              (
                  Number(latestVideo.left_knee_angle || 0) +
                  Number(latestVideo.right_knee_angle || 0)
              ) / 2
          ).toFixed(1)
        : "--";

    if (loading) {
        return (
            <div className="dashboard-loading">
                <h2>Loading your dashboard...</h2>
            </div>
        );
    }

    return (
        <div className="dashboard">

            {/* =========================
                WELCOME / HOME SECTION
            ========================= */}

            <section className="dashboard-hero">

                <div className="hero-content">

                    <p className="dashboard-label">
                        ATHLETE HOME
                    </p>

                    <h1>
                        Welcome back, {user.username || "Athlete"}
                    </h1>

                    <p className="hero-description">
                        Monitor your movement, posture and injury risk
                        using AI-powered video analysis.
                    </p>

                    <div className="athlete-details">

                        <div>
                            <span>Sport</span>
                            <strong>
                                {user.sport || "Not updated"}
                            </strong>
                        </div>

                        <div>
                            <span>Experience</span>
                            <strong>
                                {user.experience
                                    ? `${user.experience} years`
                                    : "Not updated"}
                            </strong>
                        </div>

                        <div>
                            <span>Role</span>
                            <strong>
                                {user.role || "Athlete"}
                            </strong>
                        </div>

                    </div>

                </div>

                <div className="hero-profile">

                    <FaUserCircle className="large-profile-icon" />

                    <h3>
                        {user.username || "Athlete"}
                    </h3>

                    <p>
                        {user.email || "Email not available"}
                    </p>

                </div>

            </section>


            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <section className="quick-actions">

                <a href="/upload" className="action-card">
                    <FaUpload />
                    <div>
                        <h3>Analyze Video</h3>
                        <p>Upload a training video</p>
                    </div>
                </a>

                <a href="/profile" className="action-card">
                    <FaUserCircle />
                    <div>
                        <h3>My Profile</h3>
                        <p>View and update your information</p>
                    </div>
                </a>

                <a href="/support-team" className="action-card">
                    <FaUsers />
                    <div>
                        <h3>My Support Team</h3>
                        <p>Connect with your coach and physiotherapist</p>
                    </div>
                </a>

                <a href="#analysis-history" className="action-card">
                    <FaChartLine />
                    <div>
                        <h3>Analysis History</h3>
                        <p>Review your previous assessments</p>
                    </div>
                </a>

            </section>


            {/* =========================
                STATISTICS
            ========================= */}

            <section className="dashboard-section">

                <div className="section-heading">
                    <div>
                        <p className="dashboard-label">
                            PERFORMANCE OVERVIEW
                        </p>
                        <h2>Your latest statistics</h2>
                    </div>
                </div>

                <div className="stats-grid">

                    <div className="stat-card">
                        <span className="stat-title">
                            Videos Analyzed
                        </span>

                        <strong className="stat-value">
                            {videos.length}
                        </strong>

                        <span className="stat-description">
                            Total uploaded videos
                        </span>
                    </div>


                    <div className="stat-card">
                        <span className="stat-title">
                            Average Knee Angle
                        </span>

                        <strong className="stat-value">
                            {averageKneeAngle}
                            {averageKneeAngle !== "--" && "°"}
                        </strong>

                        <span className="stat-description">
                            Latest assessment
                        </span>
                    </div>


                    <div className="stat-card">
                        <span className="stat-title">
                            Injury Risk
                        </span>

                        <strong
                            className={`stat-value risk-${String(
                                latestVideo?.injury_risk || "unknown"
                            ).toLowerCase()}`}
                        >
                            {latestVideo?.injury_risk || "--"}
                        </strong>

                        <span className="stat-description">
                            Latest AI assessment
                        </span>
                    </div>


                    <div className="stat-card">
                        <span className="stat-title">
                            Movement Quality
                        </span>

                        <strong className="stat-value">
                            {latestVideo?.movement_quality || "--"}
                        </strong>

                        <span className="stat-description">
                            Latest movement assessment
                        </span>
                    </div>

                </div>

            </section>


            {/* =========================
                LATEST ANALYSIS
            ========================= */}

            <section className="dashboard-section">

                <div className="section-heading">

                    <div>
                        <p className="dashboard-label">
                            AI ANALYSIS
                        </p>

                        <h2>
                            Latest Biomechanical Analysis
                        </h2>
                    </div>

                    {latestVideo && (
                        <span className="analysis-file">
                            {latestVideo.filename}
                        </span>
                    )}

                </div>


                {!latestVideo ? (

                    <div className="empty-analysis">
                        <h3>No analysis available yet</h3>

                        <p>
                            Upload a training video to generate your
                            first biomechanical assessment.
                        </p>

                        <a href="/upload" className="primary-button">
                            Analyze Your First Video
                        </a>
                    </div>

                ) : (

                    <>

                        {/* Processing Information */}

                        <div className="processing-grid">

                            <div className="info-card">
                                <span>Frames Processed</span>
                                <strong>
                                    {latestVideo.frames_processed || 0}
                                </strong>
                            </div>

                            <div className="info-card">
                                <span>Pose Detected Frames</span>
                                <strong>
                                    {latestVideo.pose_detected_frames || 0}
                                </strong>
                            </div>

                            <div className="info-card">
                                <span>Posture Symmetry</span>
                                <strong>
                                    {Number(
                                        latestVideo.posture_symmetry || 0
                                    ).toFixed(1)}
                                    %
                                </strong>
                            </div>

                        </div>


                        {/* Biomechanical Measurements */}

                        <div className="analysis-card">

                            <div className="analysis-card-header">
                                <h3>
                                    Biomechanical Measurements
                                </h3>

                                <p>
                                    Joint-angle measurements detected
                                    from the analyzed video.
                                </p>
                            </div>


                            <div className="measurement-grid">

                                <div className="measurement-card">

                                    <h4>Knee</h4>

                                    <div className="measurement-values">

                                        <div>
                                            <span>Left</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.left_knee_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Right</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.right_knee_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                <div className="measurement-card">

                                    <h4>Hip</h4>

                                    <div className="measurement-values">

                                        <div>
                                            <span>Left</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.left_hip_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Right</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.right_hip_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                <div className="measurement-card">

                                    <h4>Shoulder</h4>

                                    <div className="measurement-values">

                                        <div>
                                            <span>Left</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.left_shoulder_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Right</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.right_shoulder_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                <div className="measurement-card">

                                    <h4>Elbow</h4>

                                    <div className="measurement-values">

                                        <div>
                                            <span>Left</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.left_elbow_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Right</span>
                                            <strong>
                                                {Number(
                                                    latestVideo.right_elbow_angle || 0
                                                ).toFixed(1)}
                                                °
                                            </strong>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* Movement Assessment */}

                        <div className="analysis-summary-grid">

                            <div className="summary-card">

                                <span>Movement Quality</span>

                                <strong>
                                    {latestVideo.movement_quality || "Unknown"}
                                </strong>

                            </div>


                            <div className="summary-card">

                                <span>Posture Symmetry</span>

                                <strong>
                                    {Number(
                                        latestVideo.posture_symmetry || 0
                                    ).toFixed(1)}
                                    %
                                </strong>

                            </div>


                            <div className="summary-card">

                                <span>Injury Risk</span>

                                <strong>
                                    {latestVideo.injury_risk || "Unknown"}
                                </strong>

                            </div>

                        </div>


                        {/* AI Recommendation */}

                        <div className="recommendation-card">

                            <p className="dashboard-label">
                                AI RECOMMENDATION
                            </p>

                            <h3>
                                Recommended Action
                            </h3>

                            <p>
                                {latestVideo.recommendation ||
                                    "No recommendation available for this analysis."}
                            </p>

                        </div>

                    </>

                )}

            </section>


            {/* =========================
                ANALYSIS HISTORY
            ========================= */}

            <section
                className="dashboard-section"
                id="analysis-history"
            >

                <div className="section-heading">

                    <div>
                        <p className="dashboard-label">
                            HISTORY
                        </p>

                        <h2>
                            Previous Video Analyses
                        </h2>
                    </div>

                </div>


                {videos.length === 0 ? (

                    <div className="empty-analysis">
                        <p>
                            No previous video analyses are available.
                        </p>
                    </div>

                ) : (

                    <div className="history-table-wrapper">

                        <table className="analysis-table">

                            <thead>

                                <tr>
                                    <th>Video</th>
                                    <th>Knee</th>
                                    <th>Hip</th>
                                    <th>Shoulder</th>
                                    <th>Elbow</th>
                                    <th>Symmetry</th>
                                    <th>Movement</th>
                                    <th>Risk</th>
                                </tr>

                            </thead>


                            <tbody>

                                {videos.map((video) => (

                                    <tr key={video.id}>

                                        <td className="filename-cell">
                                            {video.filename}
                                        </td>

                                        <td>
                                            {Number(
                                                video.left_knee_angle || 0
                                            ).toFixed(1)}
                                            °
                                            {" / "}
                                            {Number(
                                                video.right_knee_angle || 0
                                            ).toFixed(1)}
                                            °
                                        </td>

                                        <td>
                                            {Number(
                                                video.left_hip_angle || 0
                                            ).toFixed(1)}
                                            °
                                            {" / "}
                                            {Number(
                                                video.right_hip_angle || 0
                                            ).toFixed(1)}
                                            °
                                        </td>

                                        <td>
                                            {Number(
                                                video.left_shoulder_angle || 0
                                            ).toFixed(1)}
                                            °
                                            {" / "}
                                            {Number(
                                                video.right_shoulder_angle || 0
                                            ).toFixed(1)}
                                            °
                                        </td>

                                        <td>
                                            {Number(
                                                video.left_elbow_angle || 0
                                            ).toFixed(1)}
                                            °
                                            {" / "}
                                            {Number(
                                                video.right_elbow_angle || 0
                                            ).toFixed(1)}
                                            °
                                        </td>

                                        <td>
                                            {Number(
                                                video.posture_symmetry || 0
                                            ).toFixed(1)}
                                            %
                                        </td>

                                        <td>
                                            {video.movement_quality || "Unknown"}
                                        </td>

                                        <td>
                                            <span className="risk-badge">
                                                {video.injury_risk || "Unknown"}
                                            </span>
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </section>

        </div>
    );
}