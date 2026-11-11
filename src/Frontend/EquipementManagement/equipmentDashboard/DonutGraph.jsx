import React from 'react';
import ReactApexChart from 'react-apexcharts';

const DonutGraph = () => {
    const state = {
        series: [5, 1, 2], // Online (5), Offline (1), Maintenance (2)
        options: {
            chart: {
                type: 'donut',
                width: 280,
            },
            labels: ['Online', 'Offline', 'Maintenance'],
            colors: ['#64a414', '#EF4444', '#f0c46c'], // Green, Red, Yellow
            legend: {
                show: false, // Hide default legend
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                    },
                },
            },
            tooltip: {
                enabled: true,
                y: {
                    formatter: (val) => `${val}`,
                },
            },
        },
    };

    return (
        <div style={{ background: "#fff", padding: "16px", borderRadius: "8px" }}>
            <h3 style={{ margin: "0 0 4px 0" }}>Machine Status Overview</h3>
            <p style={{ margin: "0 0 12px 0", color: "#6b7280", fontSize: "14px" }}>
                Real-time operational status
            </p>
            <div className="d-flex justify-content-center align-items-center" >
                <ReactApexChart
                    options={state.options}
                    series={state.series}
                    type="donut"
                    width={280}
                />
            </div>

            <div style={{ marginTop: 10, fontSize: 14, color: '#374151' }}>
                <span style={{ marginRight: 24 }}>
                    <strong>Online (5)</strong>
                </span>
                <span style={{ marginRight: 24 }}>
                    <strong>Offline (1)</strong>
                </span>
                <span>
                    <strong>Maintenance (2)</strong>
                </span>
            </div>
        </div>
    );
};

export default DonutGraph;
