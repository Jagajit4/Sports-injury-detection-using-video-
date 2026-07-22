import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import api from "../services/api";
import VideoUpload from "../components/VideoUpload";
import "../styles/dashboard.css";

export default function Dashboard() {

    const [user, setUser] = useState({});
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        await getUser();
        await getVideos();
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

        }

        catch (err) {

            console.log(err);

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

            setVideos(response.data);

        }

        catch (err) {

            console.log(err);

        }

    }

    const latestVideo =
        videos.length > 0
            ? videos[videos.length - 1]
            : null;

    return (

        <div className="dashboard">

            <div className="hero">

                <div>

                    <h1>Welcome back, {user.username} 👋</h1>

                    <p>

                        Upload training videos and let AI analyze
                        your posture, knee movement and injury risk.

                    </p>

                    <h3>

                        Sport :
                        <span> {user.sport || "Athlete"}</span>

                    </h3>

                </div>

                <FaUserCircle className="profile-icon" />

            </div>



            <div className="stats">

                <div className="stat-card">

                    <h2>{videos.length}</h2>

                    <p>Videos Uploaded</p>

                </div>

                <div className="stat-card">

                    <h2>

                        {
                            latestVideo
                                ? latestVideo.analysis.average_knee_angle.toFixed(1)
                                : "--"
                        }°

                    </h2>

                    <p>Average Knee Angle</p>

                </div>

                <div className="stat-card">

                    <h2>

                        {
                            latestVideo
                                ? latestVideo.analysis.injury_risk
                                : "--"
                        }

                    </h2>

                    <p>Current Injury Risk</p>

                </div>

            </div>



            <div className="middle-section">

                <div className="upload-card">

                    <h2>Upload Training Video</h2>

                    <p>

                        Upload your latest athlete movement
                        video for AI-powered posture analysis.

                    </p>

                    <VideoUpload />

                </div>

                <div className="tips-card">

                    <h2>AI Recommendations</h2>

                    <ul>

                        <li>✔ Warm up before every training session.</li>

                        <li>✔ Keep knees aligned while landing.</li>

                        <li>✔ Avoid excessive inward knee movement.</li>

                        <li>✔ Maintain balanced posture.</li>

                        <li>✔ Take sufficient recovery time.</li>

                    </ul>

                </div>

            </div>



            <div className="recent-card">

                <h2>Analysis History</h2>

                {

                    videos.length === 0 ?

                        <p>No videos uploaded.</p>

                        :

                        <table>

                            <thead>

                                <tr>

                                    <th>Video</th>

                                    <th>Frames</th>

                                    <th>Pose Frames</th>

                                    <th>Knee Angle</th>

                                    <th>Risk</th>

                                </tr>

                            </thead>

                            <tbody>

                                {

                                    videos.map(video => (

                                        <tr key={video.id}>

                                            <td>{video.filename}</td>

                                            <td>{video.analysis.frames_processed}</td>

                                            <td>{video.analysis.pose_detected_frames}</td>

                                            <td>

                                                {video.analysis.average_knee_angle.toFixed(2)}°

                                            </td>

                                            <td>

                                                {video.analysis.injury_risk}

                                            </td>

                                        </tr>

                                    ))

                                }

                            </tbody>

                        </table>

                }

            </div>

        </div>

    );

}