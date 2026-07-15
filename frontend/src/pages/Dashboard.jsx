import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    useEffect(() => {

        async function getUser() {

            try {

                const token = localStorage.getItem("token");

                const response = await api.get("/auth/me", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                setEmail(response.data.email);

            } catch (error) {

                localStorage.removeItem("token");

                navigate("/login");

            }

        }

        getUser();

    }, []);

    function logout() {

        localStorage.removeItem("token");

        navigate("/login");

    }

    return (

        <div className="form-container">

            <h1>Sports Injury Detection Dashboard</h1>

            <h3>Welcome</h3>

            <p><strong>{email}</strong></p>

            <hr />

            <h3>Authentication Status</h3>

            <p>✅ JWT Authentication Working</p>

            <hr />

            <h3>Upcoming Modules</h3>

            <ul style={{ textAlign: "left" }}>
                <li>Video Upload</li>
                <li>Pose Estimation</li>
                <li>Movement Analysis</li>
                <li>Injury Risk Prediction</li>
                <li>Report Generation</li>
            </ul>

            <button onClick={logout}>
                Logout
            </button>

        </div>

    );

}