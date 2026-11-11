import { useMemo } from "react";
import logoFallback from "@app/assets/image/ldpl_logo.png";
import "./PatientReport.css"
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import Clients from "../../Config/Clients";

const Header = () => {
    const navigate = useNavigate();

    const token = sessionStorage.getItem("token") || localStorage.getItem("token");

    // Dynamic Logo Logic from Clients Config
    const dynamicLogo = useMemo(() => {
        const hostWithPort = window.location.host;
        const envUrl = import.meta.env.VITE_APP_REACT_APP_BASE_URL?.split("//")?.[1];
        
        let clientKey = hostWithPort;
        if (hostWithPort?.includes("localhost")) {
            clientKey = envUrl;
        }

        const client = Clients[clientKey] || Clients["uat-v9.itdoseinfo.com:8088"];
        return client?.logo || logoFallback;
    }, []);

    const handleLogout = async () => {
        try {
            if (token) {
                await axiosInstance.get("PatientPortal/Logout", {
                    headers: {
                        Authorization: `Bearer ${token.replace(/"/g, '')}`,
                    }
                });
            }
        } catch (err) {
            console.log("Logout API error:", err);
        } finally {
            sessionStorage.clear();
            // We only clear patient-specific keys from localStorage if any were used
            localStorage.removeItem("User");
            localStorage.removeItem("data");
            localStorage.removeItem("token");
            navigate("/PatientPortalLogin");
        }
    }

    return (
        <header className="app-header">
            <div className="header-content">
                <div className="header-left">
                    <img
                        src={dynamicLogo}
                        alt="Logo"
                        onError={(e) => (e.target.src = logoFallback)}
                        style={{
                            maxWidth: "150px",
                            maxHeight: "50px",
                            height: "auto",
                        }}
                    />
                </div>
                <div className="header-right">
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        <span>Logout</span>
                        <i className="bi bi-box-arrow-right mb-0" style={{marginLeft: '8px'}} />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header;