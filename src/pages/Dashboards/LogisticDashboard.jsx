import { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { Bar } from "react-chartjs-2";

// summary cards
import {
    Clock,
    AlertCircle,
    History,
    UserCheck,
    TestTubes
} from "lucide-react";

const SummaryCards = ({ data, t }) => {
    const cards = [
        {
            label: t("Total Samples"),
            value: data?.totalSamples,
            color: "#ef4444", // Red
            icon: <TestTubes size={24} />
        },
        {
            label: t("Within One Hour"),
            value: data?.withinOneHour,
            color: "#22c55e", // Green
            icon: <Clock size={24} />
        },
        {
            label: t("Pending"),
            value: data?.pending,
            color: "#eab308", // Yellow
            icon: <History size={24} />
        },
        {
            label: t("Delays"),
            value: data?.delays,
            color: "#3b82f6", // Blue
            icon: <AlertCircle size={24} />
        },
        {
            label: t("Field Boys"),
            value: data?.fieldBoys,
            color: "#a855f7", // Purple
            icon: <UserCheck size={24} />
        },
    ];

    return (
        <div className="card-dashboard shadow-md px-4 pb-4">
            <h4 className="header-dashboard mb-4">{t("Logistic Dashboard")}</h4>
            <div className="row">
                {cards.map((card, idx) => (
                    <div className="col-md my-2" key={idx}>
                        <div
                            className="shadow-sm bg-white rounded h-100 transition-all hover:shadow-md"
                            style={{
                                borderLeft: `5px solid ${card.color}`,
                            }}
                        >
                            <div className="p-4 d-flex align-items-center justify-content-between">
                                <div>
                                    <h6 className="text-muted small text-uppercase mb-1" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                                        {card.label}
                                    </h6>
                                    <h3 className="m-0 font-weight-bold" style={{ color: '#334155' }}>
                                        {card.value || 0}
                                    </h3>
                                </div>

                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "45px",
                                        height: "45px",
                                        backgroundColor: `${card.color}15`,
                                        color: card.color
                                    }}
                                >
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ProcessingTimeChart = ({ data, t }) => {
    const chartData = {
        labels: data.map((item) => item.label),
        datasets: [{
            label: t("Count"),
            data: data.map((item) => item.count),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
        }],
    };

    return (
        <div className="card-dashboard mt-2 shadow-lg h-100 mb-10">
            <h5 className="header-dashboard m-0">{t("Processing Time Distribution")}</h5>
            <div style={{ height: "250px" }}>
                <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
        </div>
    );
};

const LabsDelayChart = ({ data, t }) => {
    const chartData = {
        labels: data.map((item) => item.labName),
        datasets: [{
            label: t("Delays"),
            data: data.map((item) => item.delayedCount),
            backgroundColor: "rgba(255, 99, 132, 0.6)",
        }],
    };

    return (
        <div className="card-dashboard mt-2 shadow-lg h-100 mb-10">
            <h5 className="header-dashboard m-0">{t("Top Labs with Delays")}</h5>
            <div style={{ height: "250px" }}>
                <Bar
                    data={chartData}
                    options={{
                        indexAxis: 'y', // Makes it horizontal
                        maintainAspectRatio: false
                    }}
                />
            </div>
        </div>
    );
};

const DataTable = ({ title, headers, data, dataKeys, t }) => (
    <div className="card-dashboard mt-4 shadow-lg h-100 mb-10">
        <h5 className="header-dashboard m-0">{t(title)}</h5>
        <div className="table-responsive">
            <table className="table table-sm table-hover mt-2"
            // style={{
            //     height: "250px",
            //     overflowY: "scroll",
            // }}
            >
                <thead className="bg-light">
                    <tr>
                        {headers.map((h, i) => <th key={i} className="">{t(h)}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data?.map((row, i) => (
                        <tr key={i}>
                            {dataKeys.map((key, j) => (
                                <td key={j} className="align-middle" style={{ minWidth: "80px" }}>
                                    {key === 'statusLevel' || key === 'performanceLevel' ? (
                                        <div className="d-flex align-items-center gap-2">
                                            <div
                                                className="rounded-pill bg-light overflow-hidden"
                                                style={{ width: "50px", height: "6px", backgroundColor: "#dfdfdfff" }}
                                            >
                                                <div
                                                    style={{
                                                        height: "100%",
                                                        width: row[key] === 'Low' ? '33%' : row[key] === 'Medium' ? '66%' : '100%',
                                                        backgroundColor: row[key] === 'Low' ? '#ef4444' : row[key] === 'Medium' ? '#eab308' : '#22c55e',
                                                        transition: 'width 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                            <span className="small text-muted" style={{ fontSize: "10px" }}>
                                                {row[key]}
                                            </span>
                                        </div>
                                    ) : (
                                        row[key]
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const LogisticDashboard = ({ filters, accessCentre }) => {
    const [t] = useTranslation();

    const [loading, setLoading] = useState(false);
    const [logisticData, setLogisticData] = useState([]);

    const logisticDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get("LogisticWeb/GetDashboardSummary");
            setLogisticData(response?.data?.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        logisticDashboardData();
    }, []);

    return (
        <div className="px-3 pb-3">
            <SummaryCards data={logisticData} t={t} />

            <div className="row g-4 mb-4">
                <div className="col-md-6 mt-4">
                    <ProcessingTimeChart data={logisticData?.processingTimeDistributionData || []} t={t} />
                </div>
                <div className="col-md-6 mt-4">
                    <LabsDelayChart data={logisticData?.fiveLabswithDelaysData || []} t={t} />
                </div>
                <div className="col-md-6 mt-4">
                    <DataTable
                        title="Pending Samples by Client"
                        headers={["Client Name", "Count", "Status"]}
                        data={logisticData?.pendingSamplesbyClientData}
                        dataKeys={["clientName", "pendingCount", "statusLevel"]}
                        t={t}
                    />
                </div>
                <div className="col-md-6 mt-4">
                    <DataTable
                        title="Field Boy Productivity"
                        headers={["Name", "Samples", "Performance"]}
                        data={logisticData?.fieldBoyProductivityData}
                        dataKeys={["fieldBoyName", "totalSamples", "performanceLevel"]}
                        t={t}
                    />
                </div>
            </div>
        </div>

    )
}

export default LogisticDashboard