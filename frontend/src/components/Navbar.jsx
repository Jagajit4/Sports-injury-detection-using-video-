import { Link, useNavigate } from "react-router-dom";
import {
    FaUserCircle,
    FaSignOutAlt,
    FaTachometerAlt,
    FaVideo
} from "react-icons/fa";

export default function Navbar() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    function logout() {

        localStorage.removeItem("token");

        navigate("/login");

    }

    return (

        <nav className="navbar">

            <h2 className="logo">
                Sports Injury Detection
            </h2>

            {

                token &&

                <div className="nav-links">

                    <Link to="/dashboard">
                        <FaTachometerAlt />
                        Dashboard
                    </Link>

                    <Link to="/upload">
                        <FaVideo />
                        Upload Video
                    </Link>

                    <Link to="/profile">
                        <FaUserCircle />
                        Profile
                    </Link>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        <FaSignOutAlt />
                        Logout
                    </button>

                </div>

            }

        </nav>

    );

}