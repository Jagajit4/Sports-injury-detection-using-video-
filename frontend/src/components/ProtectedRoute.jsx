import { Navigate } from "react-router-dom";


export default function ProtectedRoute({
    children,
    allowedRoles
}) {

    const token =
        localStorage.getItem("token");

    const role =
        localStorage.getItem("role");


    // ------------------------------------------------------------
    // NOT LOGGED IN
    // ------------------------------------------------------------

    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }


    // ------------------------------------------------------------
    // ROLE PROTECTION
    // ------------------------------------------------------------

    if (
        allowedRoles &&
        !allowedRoles.includes(role)
    ) {

        switch (role) {

            case "Admin":

                return (
                    <Navigate
                        to="/admin"
                        replace
                    />
                );


            case "Coach":

                return (
                    <Navigate
                        to="/coach"
                        replace
                    />
                );


            case "Physiotherapist":

                return (
                    <Navigate
                        to="/physio"
                        replace
                    />
                );


            case "Athlete":

                return (
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                );


            default:

                localStorage.removeItem("token");
                localStorage.removeItem("role");

                return (
                    <Navigate
                        to="/login"
                        replace
                    />
                );

        }

    }


    return children;

}