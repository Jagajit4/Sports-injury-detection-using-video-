import { useState } from "react";
import api from "../services/api";
import "../styles/upload.css";

export default function UploadVideo() {

    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    async function uploadVideo() {

        if (!file) {
            alert("Please select a video.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("token");

        setLoading(true);

        try {

            const response = await api.post(
                "/video/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setAnalysis(response.data.analysis);

        } catch (err) {

            console.log(err);
            alert("Upload Failed");

        }

        setLoading(false);
    }

    return (

        <div className="upload-page">

            <div className="upload-card">

                <h1>Sports Injury Detection</h1>

                <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                />

                <button onClick={uploadVideo}>

                    {loading ? "Analyzing..." : "Upload Video"}

                </button>

                {analysis && (

                    <div className="result">

                        <h2>Analysis Result</h2>

                        <p>
                            <b>Frames Processed:</b>{" "}
                            {analysis.frames_processed}
                        </p>

                        <p>
                            <b>Pose Frames:</b>{" "}
                            {analysis.pose_detected_frames}
                        </p>

                        <p>
                            <b>Average Knee Angle:</b>{" "}
                            {analysis.average_knee_angle}°
                        </p>

                        <p>
                            <b>Risk:</b>{" "}
                            {analysis.injury_risk}
                        </p>

                    </div>

                )}

            </div>

        </div>

    );

}