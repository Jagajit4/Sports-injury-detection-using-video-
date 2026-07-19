import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/profile.css";

export default function Profile() {

    const [user, setUser] = useState({});

    useEffect(() => {

        getUser();

    }, []);

    async function getUser() {

        const token = localStorage.getItem("token");

        try {

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

    return (

        <div className="profile-page">

            <div className="profile-card">

                <div className="profile-header">

                    <div className="profile-avatar">

                        {user.username?.charAt(0).toUpperCase()}

                    </div>

                    <div>

                        <h1>{user.username}</h1>

                        <p>{user.email}</p>

                    </div>

                </div>

                <div className="profile-details">

                    <div className="detail">

                        <span>Sport</span>

                        <strong>Athlete</strong>

                    </div>

                    <div className="detail">

                        <span>Age</span>

                        <strong>20 Years</strong>

                    </div>

                    <div className="detail">

                        <span>Height</span>

                        <strong>175 cm</strong>

                    </div>

                    <div className="detail">

                        <span>Weight</span>

                        <strong>70 kg</strong>

                    </div>

                </div>

                <button className="edit-btn">

                    Edit Profile

                </button>

            </div>

        </div>

    );

}