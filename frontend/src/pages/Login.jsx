import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginType, setLoginType] = useState("User");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleLogin(e) {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

            const role = response.data.role;

            /*
             * ADMIN LOGIN
             *
             * Admin accounts are not created through
             * public registration. An existing Admin
             * account can login here.
             */

            if (
                loginType === "Admin" &&
                role !== "Admin"
            ) {

                setError(
                    "This account does not have Admin privileges."
                );

                return;
            }

            /*
             * NORMAL USER LOGIN
             *
             * Prevent an Admin account from accidentally
             * entering through the normal user option.
             */

            if (
                loginType === "User" &&
                role === "Admin"
            ) {

                setError(
                    "Please select Admin Login to access the Admin Dashboard."
                );

                return;
            }

            /*
             * Store authenticated session
             */

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "role",
                role
            );

            localStorage.setItem(
                "username",
                response.data.username || ""
            );

            /*
             * ROLE-BASED NAVIGATION
             */

            switch (role) {

                case "Athlete":

                    navigate("/dashboard");

                    break;


                case "Coach":

                    navigate("/coach");

                    break;


                case "Physiotherapist":

                    navigate("/physio");

                    break;


                case "Admin":

                    navigate("/admin");

                    break;


                default:

                    localStorage.removeItem("token");
                    localStorage.removeItem("role");
                    localStorage.removeItem("username");

                    setError(
                        "This account has an unsupported role."
                    );

                    break;
            }

        }

        catch (err) {

            console.error(
                "Login error:",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Invalid email or password."
            );

        }

        finally {

            setLoading(false);

        }

    }


    return (

        <div className="form-container">

            <h2>
                Login
            </h2>


            <p
                style={{
                    marginBottom: "18px",
                    color: "#666",
                    textAlign: "center"
                }}
            >
                Select the account type you want to access.
            </p>


            {/* LOGIN TYPE */}

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px"
                }}
            >

                <button
                    type="button"
                    onClick={() => {
                        setLoginType("User");
                        setError("");
                    }}
                    style={{
                        flex: 1,
                        opacity:
                            loginType === "User"
                                ? 1
                                : 0.65
                    }}
                >
                    User Login
                </button>


                <button
                    type="button"
                    onClick={() => {
                        setLoginType("Admin");
                        setError("");
                    }}
                    style={{
                        flex: 1,
                        opacity:
                            loginType === "Admin"
                                ? 1
                                : 0.65
                    }}
                >
                    Admin Login
                </button>

            </div>


            {/* ACCOUNT INFORMATION */}

            <div
                style={{
                    background:
                        loginType === "Admin"
                            ? "#f3f4f6"
                            : "#f8fafc",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "18px",
                    textAlign: "center"
                }}
            >

                {loginType === "Admin" ? (

                    <p style={{ margin: 0 }}>
                        <strong>Administrator Access</strong>
                        <br />
                        Use the credentials provided for the
                        platform administrator account.
                    </p>

                ) : (

                    <p style={{ margin: 0 }}>
                        Login as an Athlete, Coach or
                        Physiotherapist.
                    </p>

                )}

            </div>


            {/* ERROR */}

            {error && (

                <div
                    className="support-message error"
                    style={{
                        marginBottom: "15px"
                    }}
                >
                    {error}
                </div>

            )}


            {/* LOGIN FORM */}

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    required
                />


                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    required
                />


                <button
                    type="submit"
                    disabled={loading}
                >

                    {loading
                        ? "Logging in..."
                        : loginType === "Admin"
                            ? "Login as Admin"
                            : "Login"}

                </button>

            </form>


            {/* REGISTRATION */}

            {loginType === "User" && (

                <p
                    style={{
                        marginTop: "20px",
                        textAlign: "center"
                    }}
                >

                    Don't have an account?

                    <Link to="/register">
                        {" "}Register
                    </Link>

                </p>

            )}


            {loginType === "Admin" && (

                <p
                    style={{
                        marginTop: "20px",
                        textAlign: "center",
                        color: "#666"
                    }}
                >
                    Admin accounts cannot be created
                    through public registration.
                </p>

            )}

        </div>

    );

}