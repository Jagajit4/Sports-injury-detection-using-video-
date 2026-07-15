import { useState } from "react";
import api from "../services/api";

export default function Register() {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleRegister(e) {

        e.preventDefault();

        try {

            await api.post("/auth/register", {
                username,
                email,
                password,
            });

            alert("Registration Successful!");

        } catch (error) {
    console.log("Registration Error:", error);

    if (error.response) {
        console.log("Response:", error.response);
        alert(JSON.stringify(error.response.data));
    } else {
        console.log("Message:", error.message);
        alert(error.message);
    }
}

    }

    return (

        <div className="form-container">

            <h2>Create Account</h2>

            <form onSubmit={handleRegister}>

                <input
                    type="text"
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input
                    type="email"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button type="submit">
                    Register
                </button>

            </form>

        </div>

    );

}