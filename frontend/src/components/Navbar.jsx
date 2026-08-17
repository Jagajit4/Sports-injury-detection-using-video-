import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");

    function handleLogout() {

        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("username");

        navigate("/login");
    }

    function getDashboardPath() {

        switch (role) {

            case "Athlete":
                return "/dashboard";

            case "Coach":
                return "/coach";

            case "Physiotherapist":
                return "/physio";

            case "Admin":
                return "/admin";

            default:
                return "/";
        }
    }

    return (

        <nav
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "15px 30px",
                backgroundColor: "#ffffff",
                borderBottom: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                position: "sticky",
                top: 0,
                zIndex: 1000
            }}
        >

            {/* =====================================================
                BRAND
            ====================================================== */}

            <Link
                to="/"
                style={{
                    textDecoration: "none",
                    fontSize: "21px",
                    fontWeight: "700",
                    color: "#1f2937"
                }}
            >
                Sports Injury Detection
            </Link>


            {/* =====================================================
                NAVIGATION
            ====================================================== */}

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px"
                }}
            >

                {/* HOME */}

                <Link
                    to="/"
                    style={{
                        textDecoration: "none",
                        color: "#374151",
                        fontWeight: "500"
                    }}
                >
                    Home
                </Link>


                {/* LOGGED-IN USER NAVIGATION */}

                {token && role && (

                    <>

                        <Link
                            to={getDashboardPath()}
                            style={{
                                textDecoration: "none",
                                color: "#374151",
                                fontWeight: "500"
                            }}
                        >
                            Dashboard
                        </Link>


                        <Link
                            to="/profile"
                            style={{
                                textDecoration: "none",
                                color: "#374151",
                                fontWeight: "500"
                            }}
                        >
                            Profile
                        </Link>


                        {/* ATHLETE ONLY */}

                        {role === "Athlete" && (

                            <>

                                <Link
                                    to="/upload"
                                    style={{
                                        textDecoration: "none",
                                        color: "#374151",
                                        fontWeight: "500"
                                    }}
                                >
                                    Upload Video
                                </Link>


                                <Link
                                    to="/support-team"
                                    style={{
                                        textDecoration: "none",
                                        color: "#374151",
                                        fontWeight: "500"
                                    }}
                                >
                                    Support Team
                                </Link>

                            </>

                        )}


                        {/* USER INFORMATION */}

                        <span
                            style={{
                                color: "#6b7280",
                                fontSize: "14px"
                            }}
                        >
                            {username || role}
                        </span>


                        {/* LOGOUT */}

                        <button
                            type="button"
                            onClick={handleLogout}
                            style={{
                                padding: "8px 14px",
                                border: "none",
                                borderRadius: "6px",
                                backgroundColor: "#dc2626",
                                color: "#ffffff",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Logout
                        </button>

                    </>

                )}


                {/* NOT LOGGED IN */}

                {!token && (

                    <>

                        <Link
                            to="/login"
                            style={{
                                textDecoration: "none",
                                color: "#374151",
                                fontWeight: "500"
                            }}
                        >
                            Login
                        </Link>


                        <Link
                            to="/register"
                            style={{
                                textDecoration: "none",
                                color: "#ffffff",
                                backgroundColor: "#2563eb",
                                padding: "8px 14px",
                                borderRadius: "6px",
                                fontWeight: "600"
                            }}
                        >
                            Register
                        </Link>

                    </>

                )}

            </div>

        </nav>

    );

}