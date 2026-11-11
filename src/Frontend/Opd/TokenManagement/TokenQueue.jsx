import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import Heading from "../../../components/UI/Heading";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Marquee from "../../../components/UI/Marque";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";

const TokenQueue = () => {
    const { t } = useTranslation();
    const [load, setLoad] = useState(false);
    const [tokens, setToken] = useState([]);
    const [upcomingToken, setUpcomingToken] = useState([]);
    const location = useLocation();
    const doctorId = location.state?.doctorId;

    // current tokens
    useEffect(() => {
        if (!doctorId) return;

        const fetchPatients = async () => {
            try {
                setLoad(true);

                const res = await axiosInstance.get(
                    `OPDConsultant/BindCurrentPatient?doctorId=${doctorId}`
                );

                const data = Array.isArray(res?.data?.message)
                    ? res.data.message
                    : [];

                const mappedData = data.map((item) => ({
                    typeId: item.type_id,
                    patientName: item.PName,
                    appointmentNo: item.AppNo,
                    isAbsent: item.IsAbsent === 1,
                    isCurrent: item.IsCurrent === "1",
                    roomNo: item.RoomNo,
                    doctorName: item.DoctorName
                }));

                setToken(mappedData);

            } catch (error) {
                toast.error("Failed to load patients");
            } finally {
                setLoad(false);
            }
        };

        fetchPatients();
    }, [doctorId]);

    // upcoming tokens
    useEffect(() => {
        if (!doctorId) return;

        const fetchPatients = async () => {
            try {
                setLoad(true);

                const res = await axiosInstance.get(
                    `OPDConsultant/BindDoctorData?doctorId=${doctorId}`
                );

                const data = Array.isArray(res?.data?.message)
                    ? res.data.message
                    : [];

                const mappedData = data.map((item) => ({
                    typeId: item.type_id,
                    patientName: item.PName,
                    appointmentNo: item.AppNo,
                    isAbsent: item.IsAbsent === 1,
                    isCurrent: item.IsCurrent === "1",
                    roomNo: item.RoomNo,
                    doctorName: item.DoctorName
                }));

                setUpcomingToken(mappedData);

            } catch (error) {
                toast.error("Failed to load patients");
            } finally {
                setLoad(false);
            }
        };

        fetchPatients();
    }, [doctorId]);

    const Data = [
        { color: "#3CB371", labelKey: "Current Patient", },

    ];
    const DataUpcoming = [
        { color: "#FAFA33", labelKey: "Absent Patient", },
        { color: "#1976d2", labelKey: "Queued Patient", },
    ];

    return (
        <>
            <div className="row p-2">
                <div className="col-lg-7">
                    <div
                        className="card border-0 shadow-lg"
                    >
                        <Heading
                            title={t("Current Patients")}
                            secondTitle={
                                <>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="ms-2 mr-5" style={{ color: "Red", fontWeight: "bold" }}>
                                            {`Total ${tokens.length} patients`}
                                        </span>
                                        {Data?.map(({ color, labelKey }) => (
                                            <ColorCodingSearch
                                                key={labelKey}
                                                color={color}
                                                label={t(labelKey)}
                                                cursor="pointer"
                                            />
                                        ))}
                                    </div>
                                </>
                            }
                        />

                        <div className="card-body p-0" style={{ maxHeight: "413px", overflowY: "auto" }}
                        >
                            {load ? (
                                <div className="p-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="placeholder-glow mb-3">
                                            <div
                                                className="placeholder"
                                                style={{ height: "100px", borderRadius: "8px" }}
                                            ></div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    {tokens.length === 0 ? (
                                        <div className=" text-center">
                                            <NoRecordFound />
                                        </div>
                                    ) : (
                                        tokens.map((item, index) => (
                                            <div className="border-bottom p-3" key={index}>
                                                <div className="d-flex align-items-center gap-3" >
                                                    <div
                                                        style={{
                                                            width: "36px",
                                                            height: "36px",
                                                            borderRadius: "50%",
                                                            background: item.isCurrent ? "#3CB371" : "#FAFA33",
                                                            color: item.isCurrent ? "#fff" : "#e65100",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "bold",
                                                        }}
                                                        className="mr-3">
                                                        {item.appointmentNo}
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        <p className="mb-1 fw-semibold">{item.patientName}</p>
                                                        <small className="text-muted">
                                                            {item.doctorName} • Room {item.roomNo || "-"}
                                                        </small>

                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div className="card border-0 shadow-lg">
                        <Heading
                            title={t("Waiting Queue")}
                            secondTitle={
                                <>
                                    <div className="d-flex align-items-center gap-2 flex-wrap">
                                        <span className="ms-2 mr-5" style={{ color: "Red", fontWeight: "bold" }}>
                                            {`Total ${upcomingToken.length} patients`}
                                        </span>
                                        {DataUpcoming?.map(({ color, labelKey }) => (
                                            <ColorCodingSearch
                                                key={labelKey}
                                                color={color}
                                                label={t(labelKey)}
                                                cursor="pointer"
                                            />
                                        ))}
                                    </div>
                                </>
                            }
                        />
                        <div>
                            {upcomingToken.length === 0 ? (
                                <NoRecordFound />
                            ) : (
                                <Marquee height={415}>
                                    {upcomingToken.map((item, index) => (
                                        <div className="border-bottom p-3" key={index}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "50%",
                                                        background: item.isAbsent ? "#FAFA33" : "#1976d2",
                                                        color: item.isAbsent ? "#e65100" : "#fff",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.75rem",
                                                        fontWeight: "bold",
                                                    }}
                                                    className="mr-3">
                                                    {item.appointmentNo}
                                                </div>

                                                <div style={{ flex: 1 }}>
                                                    <p className="mb-1 fw-semibold">{item.patientName}</p>
                                                    <small className="text-muted">
                                                        {item.doctorName} • Room {item.roomNo || "-"}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Marquee>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </>
    );
};

export default TokenQueue;
