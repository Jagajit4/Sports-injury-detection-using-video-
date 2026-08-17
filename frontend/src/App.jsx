import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UploadVideo from "./pages/UploadVideo";

import CoachDashboard from "./pages/CoachDashboard";
import PhysioDashboard from "./pages/PhysioDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import SupportTeam from "./pages/SupportTeam";

import NotFound from "./pages/NotFound";


function App() {

    return (

        <>

            <Navbar />


            <Routes>

                {/* ==================================================
                    PUBLIC ROUTES
                ================================================== */}

                <Route
                    path="/"
                    element={<Landing />}
                />


                <Route
                    path="/register"
                    element={<Register />}
                />


                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* ==================================================
                    ATHLETE
                ================================================== */}

                <Route
                    path="/dashboard"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Athlete"]}
                        >

                            <Dashboard />

                        </ProtectedRoute>

                    }
                />


                <Route
                    path="/profile"
                    element={

                        <ProtectedRoute
                            allowedRoles={[
                                "Athlete",
                                "Coach",
                                "Physiotherapist",
                                "Admin"
                            ]}
                        >

                            <Profile />

                        </ProtectedRoute>

                    }
                />


                <Route
                    path="/upload"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Athlete"]}
                        >

                            <UploadVideo />

                        </ProtectedRoute>

                    }
                />


                <Route
                    path="/support-team"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Athlete"]}
                        >

                            <SupportTeam />

                        </ProtectedRoute>

                    }
                />


                {/* ==================================================
                    COACH
                ================================================== */}

                <Route
                    path="/coach"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Coach"]}
                        >

                            <CoachDashboard />

                        </ProtectedRoute>

                    }
                />


                {/* ==================================================
                    PHYSIOTHERAPIST
                ================================================== */}

                <Route
                    path="/physio"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Physiotherapist"]}
                        >

                            <PhysioDashboard />

                        </ProtectedRoute>

                    }
                />


                {/* ==================================================
                    ADMIN
                ================================================== */}

                <Route
                    path="/admin"
                    element={

                        <ProtectedRoute
                            allowedRoles={["Admin"]}
                        >

                            <AdminDashboard />

                        </ProtectedRoute>

                    }
                />


                {/* ==================================================
                    404
                ================================================== */}

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>

        </>

    );

}


export default App;