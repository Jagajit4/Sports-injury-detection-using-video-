import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    function logout() {
        localStorage.removeItem("token");
        navigate("/login");
    }

    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 30px",
                background: "#0f172a",
                color: "white",
            }}
        >
            <h2>Sports Injury Detection</h2>

            <div style={{ display: "flex", gap: "20px" }}>
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                    Home
                </Link>

                {token && (
                    <Link
                        to="/dashboard"
                        style={{ color: "white", textDecoration: "none" }}
                    >
                        Dashboard
                    </Link>
                )}

                {!token ? (
                    <>
                        <Link
                            to="/login"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            style={{ color: "white", textDecoration: "none" }}
                        >
                            Register
                        </Link>
                    </>
                ) : (
                    <button onClick={logout}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}