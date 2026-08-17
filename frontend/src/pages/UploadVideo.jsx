import VideoUpload from "../components/VideoUpload";
import "../styles/upload.css";

export default function UploadVideo() {
    return (
        <main className="upload-page">
            <section className="upload-container">

                <div className="upload-header">
                    <span className="upload-label">
                        ATHLETE PORTAL
                    </span>

                    <h1>
                        Upload Training Video
                    </h1>

                    <p>
                        Upload a movement video to evaluate your
                        biomechanics and identify potential injury risks.
                    </p>
                </div>

                <VideoUpload />

            </section>
        </main>
    );
}