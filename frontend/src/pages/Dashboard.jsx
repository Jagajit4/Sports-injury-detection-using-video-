import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import api from "../services/api";
import VideoUpload from "../components/VideoUpload";
import "../styles/dashboard.css";

export default function Dashboard() {

    const [user, setUser] = useState({});
    const [videos, setVideos] = useState([]);

    useEffect(() => {

        getUser();
        getVideos();

    }, []);

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

    return (

        <div className="dashboard">

            <div className="hero">

                <div>

                    <h1>Welcome back, {user.username} 👋</h1>

                    <p>

                        Track your training sessions,
                        upload videos and analyze movement
                        to prevent sports injuries.

                    </p>

                    <h3>

                        Sport

                        <span> Athlete</span>

                    </h3>

                </div>

                <FaUserCircle
                    className="profile-icon"
                />

            </div>


            <div className="stats">

                <div className="stat-card">

                    <h2>{videos.length}</h2>

                    <p>Videos Uploaded</p>

                </div>

                <div className="stat-card">

                    <h2>0</h2>

                    <p>Hours Analysed</p>

                </div>

                <div className="stat-card">

                    <h2>0</h2>

                    <p>Injury Alerts</p>

                </div>

            </div>


            <div className="middle-section">

                <div className="upload-card">

                    <h2>Training Video</h2>

                    <p>

                        Upload your latest training
                        session.

                    </p>

                    <VideoUpload />

                </div>

                <div className="tips-card">

                    <h2>Training Tips</h2>

                    <ul>

                        <li>Warm up before training</li>

                        <li>Maintain correct posture</li>

                        <li>Stay hydrated</li>

                        <li>Take recovery seriously</li>

                    </ul>

                </div>

            </div>


            <div className="recent-card">

                <h2>

                    Recent Uploads

                </h2>

                {

                    videos.length === 0 ?

                        (

                            <p>No videos uploaded.</p>

                        )

                        :

                        (

                            <table>

                                <thead>

                                    <tr>

                                        <th>Video</th>

                                        <th>Status</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        videos.map(video => (

                                            <tr key={video.id}>

                                                <td>{video.filename}</td>

                                                <td>

                                                    ✅ Uploaded

                                                </td>

                                            </tr>

                                        ))

                                    }

                                </tbody>

                            </table>

                        )

                }

            </div>

        </div>

    );

}