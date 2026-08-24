import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        role: "Athlete"
    });

    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [error, setError] = useState("");

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

        setError("");
    }

    async function handleRegister(e) {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await api.post("/auth/register", form);

            setRegistered(true);
        } catch (error) {
            console.error("Registration error:", error);

            if (error.response) {
                setError(
                    error.response.data?.detail ||
                    "Registration failed."
                );
            } else {
                setError(
                    "Unable to connect to server."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-container">

            <h2>Create Account</h2>

            {registered ? (
                <>
                    <h3 style={{ color: "green" }}>
                        Registration Successful
                    </h3>

                    <p>
                        Your account has been created successfully.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                    >
                        Go to Login
                    </button>
                </>
            ) : (
                <form onSubmit={handleRegister}>

                    {error && (
                        <div
                            style={{
                                color: "#b91c1c",
                                backgroundColor: "#fee2e2",
                                padding: "10px",
                                borderRadius: "6px",
                                marginBottom: "15px"
                            }}
                        >
                            {error}
                        </div>
                    )}

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        minLength={6}
                        required
                    />

                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="Athlete">
                            Athlete
                        </option>

                        <option value="Coach">
                            Coach
                        </option>

                        <option value="Physiotherapist">
                            Physiotherapist
                        </option>
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Registering..."
                            : "Register"}
                    </button>

                    <p
                        style={{
                            marginTop: "20px",
                            textAlign: "center"
                        }}
                    >
                        Already have an account?

                        <Link to="/login">
                            {" "}Login
                        </Link>
                    </p>

                </form>
            )}

        </div>
    );
}