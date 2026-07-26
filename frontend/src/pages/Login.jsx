import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin(e) {

        e.preventDefault();

        try {

            const response = await api.post("/auth/login", {
                email,
                password,
            });

            // Save JWT
            localStorage.setItem(
                "token",
                response.data.access_token
            );

            alert("Login Successful!");

            navigate("/dashboard");

        } catch (error) {

            alert("Invalid email or password");

        }

    }

    return (

        <div className="form-container">

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>

    );

}