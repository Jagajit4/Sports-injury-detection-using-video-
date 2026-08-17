import { useEffect, useRef, useState } from "react";

import {
    FaCloudUploadAlt,
    FaPlayCircle,
    FaCheckCircle,
    FaTimesCircle,
    FaFileVideo,
    FaTrash,
    FaExclamationTriangle,
    FaHeartbeat
} from "react-icons/fa";

import { ClipLoader } from "react-spinners";

import api from "../services/api";
import "../styles/upload.css";


export default function VideoUpload({ onUploadSuccess }) {

    const inputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [videoURL, setVideoURL] = useState("");

    const [analysis, setAnalysis] = useState(null);

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // =========================================================
    // CLEAN VIDEO URL WHEN COMPONENT UNMOUNTS
    // =========================================================

    useEffect(() => {

        return () => {

            if (videoURL) {
                URL.revokeObjectURL(videoURL);
            }

        };

    }, [videoURL]);


    // =========================================================
    // CHOOSE FILE
    // =========================================================

    function chooseFile() {

        inputRef.current?.click();

    }


    // =========================================================
    // FILE CHANGE
    // =========================================================

    function handleFileChange(event) {

        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setMessage("");
        setError("");
        setAnalysis(null);


        // -----------------------------------------------------
        // VIDEO VALIDATION
        // -----------------------------------------------------

        if (!file.type.startsWith("video/")) {

            setError(
                "Please select a valid video file."
            );

            event.target.value = "";

            return;
        }


        // -----------------------------------------------------
        // OPTIONAL SIZE VALIDATION
        // Backend currently allows the supported extensions.
        // 200 MB is kept as a frontend safety limit.
        // -----------------------------------------------------

        const maxSize =
            200 * 1024 * 1024;

        if (file.size > maxSize) {

            setError(
                "Video size must be 200 MB or less."
            );

            event.target.value = "";

            return;
        }


        // -----------------------------------------------------
        // REVOKE OLD URL
        // -----------------------------------------------------

        if (videoURL) {
            URL.revokeObjectURL(videoURL);
        }


        setSelectedFile(file);

        const url =
            URL.createObjectURL(file);

        setVideoURL(url);

    }


    // =========================================================
    // REMOVE VIDEO
    // =========================================================

    function removeVideo() {

        if (videoURL) {
            URL.revokeObjectURL(videoURL);
        }

        setSelectedFile(null);
        setVideoURL("");
        setAnalysis(null);

        setMessage("");
        setError("");


        if (inputRef.current) {
            inputRef.current.value = "";
        }

    }


    // =========================================================
    // EXTRACT ANALYSIS FROM BACKEND RESPONSE
    // =========================================================

    function extractAnalysis(result) {

        /*
         * Current backend response:
         *
         * {
         *   message: "...",
         *   video: {
         *      ...
         *      analysis: {
         *          ...
         *      }
         *   }
         * }
         *
         * This also supports older response formats.
         */

        if (result?.analysis) {
            return result.analysis;
        }

        if (result?.video?.analysis) {
            return result.video.analysis;
        }

        if (result?.video) {
            return result.video;
        }

        return result || {};

    }


    // =========================================================
    // ANALYZE VIDEO
    // =========================================================

    async function analyzeVideo() {

        if (!selectedFile) {

            setError(
                "Please select a training video first."
            );

            return;
        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            setError(
                "Your session has expired. Please login again."
            );

            return;
        }


        setLoading(true);

        setMessage("");
        setError("");
        setAnalysis(null);


        const formData =
            new FormData();

        formData.append(
            "file",
            selectedFile
        );


        try {

            const response =
                await api.post(
                    "/video/upload",
                    formData,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            const result =
                response.data;


            const analysisResult =
                extractAnalysis(result);


            setAnalysis(
                analysisResult
            );


            setMessage(
                "Video uploaded and analysed successfully."
            );


            if (onUploadSuccess) {

                onUploadSuccess(
                    analysisResult
                );

            }

        }

        catch (err) {

            console.error(
                "Video upload error:",
                err
            );


            if (
                err.response?.status === 401
            ) {

                setError(
                    "Your session has expired. Please login again."
                );

            }

            else {

                setError(
                    err.response?.data?.detail ||
                    "Unable to analyse the video. Please try again."
                );

            }

        }

        finally {

            setLoading(false);

        }

    }


    // =========================================================
    // FORMAT ANGLE
    // =========================================================

    function formatAngle(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "Not available";
        }

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return "Not available";
        }

        return `${number.toFixed(1)}°`;

    }


    // =========================================================
    // ANGLE CARD
    // =========================================================

    function AngleCard({
        title,
        value
    }) {

        return (
            <div className="analysis-result-card angle-card">

                <span>
                    {title}
                </span>

                <strong>
                    {formatAngle(value)}
                </strong>

            </div>
        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="video-upload">


            {/* =================================================
                UPLOAD AREA
            ================================================= */}

            {!selectedFile && (

                <div
                    className="upload-dropzone"
                    onClick={chooseFile}
                >

                    <div className="upload-icon-wrapper">

                        <FaCloudUploadAlt
                            className="upload-icon"
                        />

                    </div>


                    <h2>
                        Upload Your Movement Video
                    </h2>


                    <p>
                        Select a clear training video showing
                        your full-body movement.
                    </p>


                    <span className="upload-hint">
                        MP4, AVI, MOV, MKV or WEBM
                        <span className="hint-separator">
                            •
                        </span>
                        Maximum 200 MB
                    </span>


                    <button
                        type="button"
                        className="upload-select-button"
                        onClick={(event) => {

                            event.stopPropagation();

                            chooseFile();

                        }}
                    >

                        <FaCloudUploadAlt />

                        <span>
                            Choose Video
                        </span>

                    </button>


                    <input
                        ref={inputRef}
                        type="file"
                        accept="video/mp4,video/avi,video/quicktime,video/x-matroska,video/webm"
                        onChange={handleFileChange}
                        hidden
                    />

                </div>

            )}


            {/* =================================================
                SELECTED VIDEO
            ================================================= */}

            {selectedFile && (

                <div className="selected-video-section">


                    {/* FILE HEADER */}

                    <div className="selected-video-header">

                        <div className="selected-file">

                            <div className="selected-file-icon">

                                <FaFileVideo />

                            </div>


                            <div className="selected-file-details">

                                <strong>
                                    {selectedFile.name}
                                </strong>

                                <span>
                                    {(selectedFile.size / (
                                        1024 * 1024
                                    )).toFixed(2)} MB
                                </span>

                            </div>

                        </div>


                        <button
                            type="button"
                            className="remove-video-button"
                            onClick={removeVideo}
                            disabled={loading}
                            title="Remove video"
                        >

                            <FaTrash />

                        </button>

                    </div>


                    {/* VIDEO PREVIEW */}

                    {videoURL && (

                        <div className="video-preview">

                            <video
                                src={videoURL}
                                controls
                                preload="metadata"
                            />

                        </div>

                    )}


                    {/* ANALYZE BUTTON */}

                    <button
                        type="button"
                        className="analyze-button"
                        onClick={analyzeVideo}
                        disabled={loading}
                    >

                        {loading ? (

                            <>

                                <ClipLoader
                                    size={20}
                                    color="#ffffff"
                                />

                                <span>
                                    Analysing Video...
                                </span>

                            </>

                        ) : (

                            <>

                                <FaPlayCircle />

                                <span>
                                    Analyse Video
                                </span>

                            </>

                        )}

                    </button>

                </div>

            )}


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {message && (

                <div className="upload-message success">

                    <FaCheckCircle />

                    <span>
                        {message}
                    </span>

                </div>

            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div className="upload-message error">

                    <FaTimesCircle />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                ANALYSIS RESULT
            ================================================= */}

            {analysis && (

                <div className="analysis-result">


                    {/* ANALYSIS HEADER */}

                    <div className="analysis-result-header">

                        <div className="analysis-result-icon">

                            <FaHeartbeat />

                        </div>


                        <div>

                            <span className="analysis-label">
                                AI BIOMECHANICAL ASSESSMENT
                            </span>

                            <h3>
                                Movement Analysis
                            </h3>

                            <p>
                                Key movement and posture measurements
                                detected from your uploaded video.
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        OVERVIEW
                    ================================================= */}

                    <div className="analysis-overview">


                        <div className="overview-card">

                            <span>
                                Movement Quality
                            </span>

                            <strong>
                                {
                                    analysis.movement_quality ||
                                    "Not available"
                                }
                            </strong>

                        </div>


                        <div className="overview-card">

                            <span>
                                Injury Risk
                            </span>

                            <strong
                                className={
                                    String(
                                        analysis.injury_risk || ""
                                    ).toLowerCase()
                                }
                            >
                                {
                                    analysis.injury_risk ||
                                    "Not available"
                                }
                            </strong>

                        </div>


                        <div className="overview-card">

                            <span>
                                Posture Symmetry
                            </span>

                            <strong>
                                {
                                    analysis.posture_symmetry != null
                                        ? `${Number(
                                            analysis.posture_symmetry
                                        ).toFixed(1)}%`
                                        : "Not available"
                                }
                            </strong>

                        </div>

                    </div>


                    {/* =================================================
                        BIOMECHANICAL ANGLES
                    ================================================= */}

                    <div className="analysis-subsection">

                        <div className="analysis-subsection-header">

                            <div>

                                <span className="analysis-label">
                                    JOINT MEASUREMENTS
                                </span>

                                <h4>
                                    Biomechanical Angles
                                </h4>

                            </div>

                        </div>


                        <div className="analysis-result-grid">


                            {/* KNEES */}

                            <AngleCard
                                title="Left Knee"
                                value={
                                    analysis.left_knee_angle
                                }
                            />

                            <AngleCard
                                title="Right Knee"
                                value={
                                    analysis.right_knee_angle
                                }
                            />


                            {/* HIPS */}

                            <AngleCard
                                title="Left Hip"
                                value={
                                    analysis.left_hip_angle
                                }
                            />

                            <AngleCard
                                title="Right Hip"
                                value={
                                    analysis.right_hip_angle
                                }
                            />


                            {/* SHOULDERS */}

                            <AngleCard
                                title="Left Shoulder"
                                value={
                                    analysis.left_shoulder_angle
                                }
                            />

                            <AngleCard
                                title="Right Shoulder"
                                value={
                                    analysis.right_shoulder_angle
                                }
                            />


                            {/* ELBOWS */}

                            <AngleCard
                                title="Left Elbow"
                                value={
                                    analysis.left_elbow_angle
                                }
                            />

                            <AngleCard
                                title="Right Elbow"
                                value={
                                    analysis.right_elbow_angle
                                }
                            />

                        </div>

                    </div>


                    {/* =================================================
                        MOVEMENT ANOMALIES
                    ================================================= */}

                    {analysis.movement_anomalies &&
                        Array.isArray(
                            analysis.movement_anomalies
                        ) &&
                        analysis.movement_anomalies.length > 0 && (

                            <div className="anomalies-result">

                                <div className="anomalies-header">

                                    <FaExclamationTriangle />

                                    <div>

                                        <span className="analysis-label">
                                            MOVEMENT FINDINGS
                                        </span>

                                        <h4>
                                            Detected Observations
                                        </h4>

                                    </div>

                                </div>


                                <ul>

                                    {analysis.movement_anomalies.map(
                                        (anomaly, index) => (

                                            <li key={index}>
                                                {typeof anomaly === "string"
                                                    ? anomaly
                                                    : JSON.stringify(anomaly)}
                                            </li>

                                        )
                                    )}

                                </ul>

                            </div>

                        )}


                    {/* =================================================
                        RECOMMENDATION
                    ================================================= */}

                    {analysis.recommendation && (

                        <div className="recommendation-result">

                            <div className="recommendation-icon">

                                <FaCheckCircle />

                            </div>


                            <div>

                                <span className="analysis-label">
                                    NEXT STEP
                                </span>

                                <h4>
                                    Recommendation
                                </h4>

                                <p>
                                    {analysis.recommendation}
                                </p>

                            </div>

                        </div>

                    )}

                </div>

            )}

        </div>

    );

}