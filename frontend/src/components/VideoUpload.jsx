import { useRef, useState } from "react";
import api from "../services/api";
import { FaCloudUploadAlt, FaCheckCircle } from "react-icons/fa";

export default function VideoUpload() {

    const inputRef = useRef();

    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState("");

    function chooseFile() {
        inputRef.current.click();
    }

    async function uploadVideo(file) {

        if (!file) return;

        const formData = new FormData();

        formData.append("file", file);

        const token = localStorage.getItem("token");

        try {

            await api.post(
                "/video/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setMessage("Video uploaded successfully.");

        }

        catch (err) {

            console.log(err);

            setMessage("Upload failed.");

        }

    }

    return (

        <div className="video-upload">

            <input
                type="file"
                accept="video/*"
                ref={inputRef}
                style={{ display: "none" }}
                onChange={(e) => {

                    const file = e.target.files[0];

                    setSelectedFile(file);

                    uploadVideo(file);

                }}
            />

            <div
                className="upload-box"
                onClick={chooseFile}
            >

                <FaCloudUploadAlt
                    size={60}
                    color="#2563eb"
                />

                <h3>

                    Upload Training Video

                </h3>

                <p>

                    MP4 • AVI • MOV

                </p>

            </div>

            {

                selectedFile &&

                <div className="upload-status">

                    <FaCheckCircle
                        color="green"
                    />

                    <span>

                        {message}

                    </span>

                    <br /><br />

                    <strong>

                        {selectedFile.name}

                    </strong>

                </div>

            }

        </div>

    );

}