import { useEffect, useState } from "react";

import {
    FaUserTie,
    FaHeartbeat,
    FaUserFriends,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaPaperPlane,
    FaSyncAlt
} from "react-icons/fa";

import api from "../services/api";
import "../styles/support-team.css";

export default function SupportTeam() {

    const [coaches, setCoaches] = useState([]);
    const [physios, setPhysios] = useState([]);

    const [requests, setRequests] = useState([]);

    const [connections, setConnections] = useState({
        coach: null,
        physiotherapist: null
    });

    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(null);
    const [cancelling, setCancelling] = useState(null);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // =========================================================
    // LOAD SUPPORT TEAM
    // =========================================================

    useEffect(() => {

        loadSupportTeam();

    }, []);


    async function loadSupportTeam() {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {

                setError(
                    "Please login to manage your support team."
                );

                setLoading(false);

                return;

            }


            const headers = {

                Authorization:
                    `Bearer ${token}`

            };


            const [
                coachesResponse,
                physiosResponse,
                requestsResponse,
                connectionsResponse
            ] = await Promise.all([

                api.get(
                    "/connections/coaches",
                    { headers }
                ),

                api.get(
                    "/connections/physios",
                    { headers }
                ),

                api.get(
                    "/connections/my-requests",
                    { headers }
                ),

                api.get(
                    "/connections/my-connections",
                    { headers }
                )

            ]);


            // =================================================
            // AVAILABLE COACHES
            // =================================================

            setCoaches(

                Array.isArray(
                    coachesResponse.data
                )
                    ? coachesResponse.data
                    : []

            );


            // =================================================
            // AVAILABLE PHYSIOTHERAPISTS
            // =================================================

            setPhysios(

                Array.isArray(
                    physiosResponse.data
                )
                    ? physiosResponse.data
                    : []

            );


            // =================================================
            // CURRENT CONNECTIONS
            // =================================================

            const connectionData =
                connectionsResponse.data || {};


            setConnections({

                coach:
                    connectionData.coach || null,

                physiotherapist:
                    connectionData.physiotherapist || null

            });


            // =================================================
            // REQUESTS
            // =================================================

            const allRequests =

                Array.isArray(
                    requestsResponse.data
                )
                    ? requestsResponse.data
                    : [];


            /*
             * Only pending requests should be displayed.
             *
             * Accepted requests are represented by
             * /my-connections instead.
             */

            setRequests(

                allRequests.filter(

                    request =>

                        String(
                            request.status || ""
                        ).toLowerCase() === "pending"

                )

            );

        }

        catch (err) {

            console.error(
                "Support team loading error:",
                err
            );


            if (
                err.response?.status === 401
            ) {

                setError(
                    "Your session has expired. Please login again."
                );

            }

            else {

                setError(

                    err.response?.data?.detail ||
                    "Unable to load support team information."

                );

            }

        }

        finally {

            setLoading(false);

        }

    }


    // =========================================================
    // REQUEST CONNECTION
    // =========================================================

    async function requestConnection(
        professionalId
    ) {

        try {

            setRequesting(professionalId);

            setMessage("");
            setError("");


            const token =
                localStorage.getItem("token");


            await api.post(

                `/connections/request/${professionalId}`,

                {},

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            setMessage(
                "Connection request sent successfully."
            );


            await loadSupportTeam();

        }

        catch (err) {

            console.error(
                "Connection request error:",
                err
            );


            setError(

                err.response?.data?.detail ||
                "Unable to send connection request."

            );

        }

        finally {

            setRequesting(null);

        }

    }


    // =========================================================
    // CANCEL REQUEST
    // =========================================================

    async function cancelRequest(
        requestId
    ) {

        try {

            setCancelling(requestId);

            setMessage("");
            setError("");


            const token =
                localStorage.getItem("token");


            await api.delete(

                `/connections/cancel/${requestId}`,

                {

                    headers: {

                        Authorization:
                            `Bearer ${token}`

                    }

                }

            );


            setMessage(
                "Connection request cancelled."
            );


            await loadSupportTeam();

        }

        catch (err) {

            console.error(
                "Cancel request error:",
                err
            );


            setError(

                err.response?.data?.detail ||
                "Unable to cancel request."

            );

        }

        finally {

            setCancelling(null);

        }

    }


    // =========================================================
    // GET PROFESSIONAL ID
    // =========================================================

    function getProfessionalId(
        professional
    ) {

        return (

            professional?.id ??
            professional?.user_id ??
            professional?.professional_id

        );

    }


    // =========================================================
    // CHECK CONNECTION
    //
    // IMPORTANT:
    //
    // Connection has priority over request status.
    //
    // If coach is connected, ALWAYS show Connected.
    // =========================================================

    function isConnected(
        professionalId,
        type
    ) {

        if (
            professionalId == null
        ) {

            return false;

        }


        if (type === "coach") {

            const connectedCoach =
                connections.coach;


            if (!connectedCoach) {

                return false;

            }


            const connectedId =
                getProfessionalId(
                    connectedCoach
                );


            return (

                Number(connectedId) ===
                Number(professionalId)

            );

        }


        if (type === "physio") {

            const connectedPhysio =
                connections.physiotherapist;


            if (!connectedPhysio) {

                return false;

            }


            const connectedId =
                getProfessionalId(
                    connectedPhysio
                );


            return (

                Number(connectedId) ===
                Number(professionalId)

            );

        }


        return false;

    }


    // =========================================================
    // CHECK PENDING REQUEST
    // =========================================================

    function isPending(
        professionalId
    ) {

        if (
            professionalId == null
        ) {

            return false;

        }


        return requests.some(

            request => {

                const requestProfessionalId =

                    request.professional_id ??
                    request.receiver_id ??
                    request.to_user_id ??
                    request.professional?.id;


                return (

                    Number(
                        requestProfessionalId
                    ) ===
                    Number(
                        professionalId
                    )

                );

            }

        );

    }


    // =========================================================
    // PROFESSIONAL CARD
    // =========================================================

    function ProfessionalCard({
        professional,
        type
    }) {

        const professionalId =
            getProfessionalId(
                professional
            );


        /*
         * IMPORTANT:
         *
         * Connected is checked FIRST.
         *
         * Therefore an accepted coach will never
         * incorrectly display Pending.
         */

        const connected =
            isConnected(
                professionalId,
                type
            );


        const pending =
            isPending(
                professionalId
            );


        return (

            <div className="professional-card">


                {/* ICON */}

                <div className="professional-icon">

                    {type === "coach"

                        ? <FaUserTie />

                        : <FaHeartbeat />

                    }

                </div>


                {/* INFORMATION */}

                <div className="professional-info">

                    <h3>

                        {
                            professional.username ||
                            professional.name ||
                            "Professional"
                        }

                    </h3>


                    <p className="professional-email">

                        {
                            professional.email ||
                            "Email unavailable"
                        }

                    </p>


                    {professional.sport && (

                        <p>

                            <strong>
                                Sport:
                            </strong>{" "}

                            {professional.sport}

                        </p>

                    )}


                    {professional.experience != null && (

                        <p>

                            <strong>
                                Experience:
                            </strong>{" "}

                            {professional.experience} years

                        </p>

                    )}

                </div>


                {/* ACTION */}

                <div className="professional-action">


                    {/* CONNECTED */}

                    {connected ? (

                        <span className="status connected">

                            <FaCheckCircle />

                            Connected

                        </span>

                    )


                    /* PENDING */

                    : pending ? (

                        <button
                            className="request-button pending"
                            disabled
                        >

                            <FaClock />

                            Pending

                        </button>

                    )


                    /* REQUEST */

                    : (

                        <button
                            className="request-button"
                            onClick={() =>
                                requestConnection(
                                    professionalId
                                )
                            }
                            disabled={
                                requesting ===
                                professionalId
                            }
                        >

                            <FaPaperPlane />

                            {
                                requesting ===
                                professionalId

                                    ? "Sending..."

                                    : "Request"

                            }

                        </button>

                    )}

                </div>

            </div>

        );

    }


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="support-page">

                <div className="support-loading">

                    <FaSyncAlt />

                    <h2>
                        Loading Support Team...
                    </h2>

                    <p>
                        Finding your coaches,
                        physiotherapists and
                        connection requests.
                    </p>

                </div>

            </div>

        );

    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div className="support-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <section className="support-header">

                <div>

                    <p className="support-label">
                        ATHLETE SUPPORT
                    </p>

                    <h1>
                        My Support Team
                    </h1>

                    <p>
                        Connect with coaches and
                        physiotherapists who can help
                        monitor your performance,
                        movement and recovery.
                    </p>

                </div>


                <div className="support-header-icon">

                    <FaUserFriends />

                </div>

            </section>


            {/* =================================================
                SUCCESS MESSAGE
            ================================================= */}

            {message && (

                <div className="support-message success">

                    <FaCheckCircle />

                    <span>
                        {message}
                    </span>

                </div>

            )}


            {/* =================================================
                ERROR MESSAGE
            ================================================= */}

            {error && (

                <div className="support-message error">

                    <FaTimesCircle />

                    <span>
                        {error}
                    </span>

                </div>

            )}


            {/* =================================================
                MY CONNECTIONS
            ================================================= */}

            <section className="support-section">

                <div className="support-section-heading">

                    <div>

                        <p className="support-label">
                            YOUR TEAM
                        </p>

                        <h2>
                            My Connections
                        </h2>

                    </div>

                </div>


                {
                    !connections.coach &&
                    !connections.physiotherapist

                        ? (

                            <div className="empty-support">

                                <FaUserFriends />

                                <h3>
                                    No connections yet
                                </h3>

                                <p>
                                    Send a request to a
                                    coach or physiotherapist
                                    below.
                                </p>

                            </div>

                        )

                        : (

                            <div className="connection-list">


                                {/* =========================
                                    CONNECTED COACH
                                ========================= */}

                                {connections.coach && (

                                    <div className="connection-card">

                                        <FaCheckCircle />

                                        <div>

                                            <strong>

                                                {
                                                    connections
                                                        .coach
                                                        .username ||
                                                    connections
                                                        .coach
                                                        .name ||
                                                    "Coach"
                                                }

                                            </strong>

                                            <span>
                                                Coach
                                            </span>

                                            <small>

                                                {
                                                    connections
                                                        .coach
                                                        .email ||
                                                    "Email unavailable"
                                                }

                                            </small>

                                        </div>

                                    </div>

                                )}


                                {/* =========================
                                    CONNECTED PHYSIO
                                ========================= */}

                                {
                                    connections
                                        .physiotherapist && (

                                        <div className="connection-card">

                                            <FaCheckCircle />

                                            <div>

                                                <strong>

                                                    {
                                                        connections
                                                            .physiotherapist
                                                            .username ||
                                                        connections
                                                            .physiotherapist
                                                            .name ||
                                                        "Physiotherapist"
                                                    }

                                                </strong>

                                                <span>
                                                    Physiotherapist
                                                </span>

                                                <small>

                                                    {
                                                        connections
                                                            .physiotherapist
                                                            .email ||
                                                        "Email unavailable"
                                                    }

                                                </small>

                                            </div>

                                        </div>

                                    )
                                }

                            </div>

                        )

                }

            </section>


            {/* =================================================
                PENDING REQUESTS
            ================================================= */}

            <section className="support-section">

                <div className="support-section-heading">

                    <div>

                        <p className="support-label">
                            REQUESTS
                        </p>

                        <h2>
                            Pending Requests
                        </h2>

                    </div>

                    <span className="count-badge">

                        {requests.length}

                    </span>

                </div>


                {requests.length === 0 ? (

                    <div className="simple-empty">

                        No pending connection requests.

                    </div>

                ) : (

                    <div className="pending-list">

                        {requests.map(
                            (request, index) => (

                                <div
                                    className="pending-card"
                                    key={
                                        request.id ||
                                        index
                                    }
                                >

                                    <div>

                                        <FaClock />

                                        <div>

                                            <strong>

                                                {
                                                    request.professional_name ||
                                                    request.username ||
                                                    request.receiver_name ||
                                                    "Professional"
                                                }

                                            </strong>

                                            <span>

                                                {
                                                    request.professional_role ||
                                                    request.role ||
                                                    "Professional"
                                                }

                                            </span>

                                            <small>
                                                Request pending
                                            </small>

                                        </div>

                                    </div>


                                    {request.id && (

                                        <button
                                            className="cancel-button"
                                            disabled={
                                                cancelling ===
                                                request.id
                                            }
                                            onClick={() =>
                                                cancelRequest(
                                                    request.id
                                                )
                                            }
                                        >

                                            {
                                                cancelling ===
                                                request.id

                                                    ? "Cancelling..."

                                                    : "Cancel"
                                            }

                                        </button>

                                    )}

                                </div>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                AVAILABLE COACHES
            ================================================= */}

            <section className="support-section">

                <div className="support-section-heading">

                    <div>

                        <p className="support-label">
                            PERFORMANCE
                        </p>

                        <h2>
                            Available Coaches
                        </h2>

                        <p>
                            Find a coach to help monitor
                            your training and performance.
                        </p>

                    </div>

                </div>


                {coaches.length === 0 ? (

                    <div className="simple-empty">

                        No coaches are currently available.

                    </div>

                ) : (

                    <div className="professional-grid">

                        {coaches.map(
                            coach => (

                                <ProfessionalCard
                                    key={
                                        coach.id ||
                                        coach.user_id
                                    }
                                    professional={coach}
                                    type="coach"
                                />

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =================================================
                AVAILABLE PHYSIOTHERAPISTS
            ================================================= */}

            <section className="support-section">

                <div className="support-section-heading">

                    <div>

                        <p className="support-label">
                            REHABILITATION
                        </p>

                        <h2>
                            Available Physiotherapists
                        </h2>

                        <p>
                            Connect with a physiotherapist
                            for injury prevention and
                            recovery monitoring.
                        </p>

                    </div>

                </div>


                {physios.length === 0 ? (

                    <div className="simple-empty">

                        No physiotherapists are currently
                        available.

                    </div>

                ) : (

                    <div className="professional-grid">

                        {physios.map(
                            physio => (

                                <ProfessionalCard
                                    key={
                                        physio.id ||
                                        physio.user_id
                                    }
                                    professional={physio}
                                    type="physio"
                                />

                            )
                        )}

                    </div>

                )}

            </section>


        </div>

    );

}