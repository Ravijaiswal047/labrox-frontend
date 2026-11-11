import React, { useEffect, useState } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import moment from "moment";
import Heading from "../../components/UI/Heading";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { axiosInstance } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { GiConfirmed } from "react-icons/gi";
import { MdCancel } from "react-icons/md";
import { SlCalender } from "react-icons/sl";
import { RiEdit2Line } from "react-icons/ri";
import ReasonModal from "./ReasonModal";
import Pagination from "../../Pagination/Pagination";
import { adaptSlotsToUI, resolveSlotStatus } from "./utils";
import RescheduleModal from "./RescheduleModal";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const OpdConfirmation = () => {
    const { t } = useTranslation();
    const [load, setLoad] = useState(false);
    const [TableData, setTableData] = useState([]);
    const [SpecializationList, setSpecializationList] = useState([]);
    const [DoctorList, setDoctorList] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [show, setShow] = useState(false);
    const [show1, setShow1] = useState(false);


    console.log(show1)

    const [slotGroups, setSlotGroups] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    const indexOfLastRecord = currentPage * pageSize;
    const indexOfFirstRecord = indexOfLastRecord - pageSize;

    const currentTableData = TableData.slice(
        indexOfFirstRecord,
        indexOfLastRecord
    );

    const [formData, setFormData] = useState({
        Pname: "",
        appointmentNo: "",
        doctorDepartmentID: "",
        doctorID: "",
        fromDate: new Date(),
        isConform: "",
        status: "All",
        toDate: new Date(),
        visitType: "All",
    });

    const colorCodingData = [
        { color: "#3CB371", labelKey: "Confirmed", id: "Confirmed" },
        { color: "#F89406", labelKey: "Rescheduled", id: "Rescheduled" },
        { color: "#0000FF", labelKey: "Pending", id: "Pending" },
        {
            color: "#A0A0A0",
            labelKey: "Appointment Time Expired",
            id: "Appointment Time Expired",
        },
        { color: "#FFB6C1", labelKey: "Canceled", id: "Canceled" },
        { color: "#87CEEB", labelKey: "Unregistered", id: "Unregistered" },
    ];

    const ModalCodingData = [
        { color: "#3CB371", labelKey: "Avilable", },
        { color: "#FEE188", labelKey: "Booked", },
        { color: "#9585BF", labelKey: "Confirmed", },
        {
            color: "#D6487E",
            labelKey: "Selected",

        },
        { color: "#A0A0A0", labelKey: "Expired", },
        { color: "#3A87AD", labelKey: "Mobile", },
    ];

    const StatusList = [
        {
            label: "All",
            value: "All",
        },
        {
            label: "Confirmed",
            value: "Confirmed",
        },
        {
            label: "Rescheduled",
            value: "Rescheduled",
        },
        {
            label: "Pending",
            value: "Pending",
        },
        {
            label: "Appointment Time Expired",
            value: "Appointment Time Expired",
        },
        {
            label: "Canceled",
            value: "Canceled",
        },
        {
            label: "Unregistered",
            value: "Unregistered",
        },
    ];

    const VisitList = [
        {
            label: "All",
            value: "All",
        },
        {
            label: "New Patient",
            value: "New Patient",
        },
        {
            label: "Old Patient",
            value: "Old Patient",
        },
    ];

    const dateSelect = (value, name) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleReactChange = (name, e) => {
        setFormData((prev) => ({
            ...prev,
            [name]: e?.value,
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleReport = () => {
        try {
        } catch (error) { }
    };

    const handleSearch = async (Status) => {
        const payload = {
            Pname: formData.Pname,
            appointmentNo: formData.appointmentNo,
            doctorDepartmentID: formData.doctorDepartmentID,
            fromDate: moment(formData.fromDate).format("DDD-MM-YYYY"),
            toDate: moment(formData.toDate).format("DDD-MM-YYYY"),
            doctorID: formData.doctorID,
            status: Status,
            visitType: formData.visitType,
            isConform: formData.isConform,
        };

        try {
            setLoad(true);
            const res = await axiosInstance.post(
                "OPDConsultant/Appointment/Search",
                payload,
            );
            console.log(res);
            setTableData(res?.data?.success ? res.data.message : []);
            setLoad(false);
        } catch (error) {
            console.log(error);
            setTableData([]);
            setLoad(false);
        }
    };

    // const handleConfirm = () => { }

    const handleConfirm = async (row) => {
        const payload = {
            appointmentID: String(row.App_ID),
            status: "confirm",
            remark: "",
            PatientID: row.PatientID,
            PName: row.NAME,
            DoctorName: row.DoctorName,
            ContactNo: row.ContactNo,
            AppDate: row.AppDate,
        }
        try {
            setLoad(true);
            const res = await axiosInstance.post(
                "OPDConsultant/Appointment/UpdateStatus",
                payload,
            );
            if (res?.data?.success) {
                toast.success(res?.data?.message);
                handleSearch()
                setLoad(false);
            }
            setLoad(false);
        } catch (error) {
            console.log(error);
            setLoad(false);
        }


    }

    const handlePDF = () => { }

    useEffect(() => { handleSearch() }, [show])

    const fetchSlots = async (row) => {
        const res = await axiosInstance.post(
            "OPDConsultant/Appointment/SlotsConsecutivePlain",
            {
                doctorID: row.DoctorID,
                AppointmentDate: moment(row.AppDate).format("DD-MM-YYYY"),
                AppointmentType: "2",
                AppSlot: "5",
                IsManualSlot: "1",
                CentreID: String(row.CentreID),
            }
        );

        if (res?.data?.success) {
            return adaptSlotsToUI(res.data.message);
        }
        return [];
    };


    const handleReschedule = async (row) => {
        console.log("here")
        setSelectedRow(row);
        const slots = await fetchSlots(row);
        setSlotGroups(slots);
        setShow1(true);
    };


    const getSpecializationList = () => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                const data = res?.data?.message;
                console.log({ data })
                const States = data?.map((ele) => {
                    return {
                        value: ele?.DepartmentID,
                        label: ele?.Department,
                    };
                });
                setSpecializationList(States);
            })
            .catch((err) => {
                toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
            });
    };

    const GetDoctorList = (id = null) => {
        const url = id
            ? `OPDConsultant/GetDoctorListByDepID?depid=${id}`
            : `OPDConsultant/GetDoctorListByDepID`;

        axiosInstance
            .get(url)
            .then((res) => {
                if (!res?.data?.success) {
                    setDoctorList([]);
                    return;
                }

                const data = Array.isArray(res.data.message)
                    ? res.data.message
                    : [];

                const doctors = data.map((ele) => ({
                    value: ele?.DoctorID,
                    label: ele?.DoctorName,
                }));

                setDoctorList(doctors);
            })
            .catch(() => {
                setDoctorList([]);
            });
    };



    useEffect(() => {
        getSpecializationList();
        GetDoctorList();
    }, []);

    useEffect(() => {
        if (formData?.doctorDepartmentID) {
            setFormData((prev) => ({
                ...prev,
                doctorID: "",
            }));

            GetDoctorList(formData.doctorDepartmentID);
        } else {
            GetDoctorList();
        }
    }, [formData?.doctorDepartmentID]);


    const getRowStyle = (row) => {
        if (row.IsReschedule === 1) {
            return { backgroundColor: "#f89406" };
        }
        if (row.IsConform === 1) {
            return { backgroundColor: "#3CB371" };
        }
        if (row.IsCancel === 1) {
            return { backgroundColor: "LightPink" };
        }
        if (row.isExpired === 1) {
            return { backgroundColor: "#a0a0a0" };
        }
        return {};
    };



    return (
        <>

            {show1 &&
                <RescheduleModal
                    show={show1}
                    onHide={() => setShow1(false)}
                    slotGroups={slotGroups}
                    appointmentRow={selectedRow}
                    secondTitle={ModalCodingData?.map(({ color, labelKey, id }) => (
                        <ColorCodingSearch
                            key={id}
                            color={color}
                            label={t(labelKey)}
                            onClick={() => handleSearch(id)}
                            cursor="pointer"
                        />
                    ))}
                />

            }


            {show && (
                <ReasonModal
                    show={show}
                    onHide={() => setShow(false)}
                    data={selectedRow}
                />
            )}

            <Accordion
                name={`${t("Appointment Confirmation")}  `}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 mt-2 mb-1">
                    <div className="col-sm-2">
                        <DatePicker
                            name="fromDate"
                            value={formData?.fromDate}
                            className="custom-calendar"
                            placeholder=" "
                            id="fromDate"
                            lable="FromDate"
                            onChange={dateSelect}
                        />
                    </div>
                    <div className="col-sm-2">
                        <DatePicker
                            name="toDate"
                            value={formData?.toDate}
                            className="custom-calendar"
                            placeholder=" "
                            id="toDate"
                            lable="ToDate"
                            onChange={dateSelect}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            className="required-fields"
                            type="text"
                            name="Pname"
                            id="Pname"
                            lable={t("Patient Name")}
                            placeholder=""
                            onChange={handleChange}
                            value={formData?.Pname}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            className="required-fields"
                            type="text"
                            name="appointmentNo"
                            id="appointmentNo"
                            lable={t("Appointment No.")}
                            placeholder=""
                            onChange={handleChange}
                            value={formData?.appointmentNo}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={SpecializationList}
                            name="doctorDepartmentID"
                            lable={t("Specialization")}
                            id="doctorDepartmentID"
                            placeholderName={t("Specialization")}
                            value={formData?.doctorDepartmentID}
                            onChange={handleReactChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={DoctorList}
                            name="doctorID"
                            lable={t("Doctor Name")}
                            id="doctorID"
                            placeholderName={t("Doctor Name")}
                            value={formData?.doctorID}
                            onChange={handleReactChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={StatusList}
                            name="status"
                            lable={t("Status")}
                            id="status"
                            placeholderName={t("Status")}
                            value={formData?.status}
                            onChange={handleReactChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={VisitList}
                            name="visitType"
                            lable={t("Patient Type")}
                            id="visitType"
                            placeholderName={t("Patient Type")}
                            value={formData?.visitType}
                            onChange={handleReactChange}
                        />
                    </div>
                    <div className="col-sm-1 mb-2">
                        {load ? (
                            <Loading />
                        ) : (
                            <button
                                className="btn btn-success btn-sm btn-block"
                                onClick={() => handleSearch(formData?.status)}
                            >
                                {t("Search")}
                            </button>
                        )}
                    </div>
                    <div className="col-sm-1 mb-2">
                        <div>
                            <button
                                className="btn btn-success btn-sm btn-block"
                                onClick={handleReport}
                            >
                                {t("Report")}
                            </button>
                        </div>
                    </div>
                </div>
                <Heading
                    title={"Opd Appointment List"}
                    secondTitle={colorCodingData?.map(({ color, labelKey, id }) => (
                        <ColorCodingSearch
                            key={id}
                            color={color}
                            label={t(labelKey)}
                            onClick={() => handleSearch(id)}
                            cursor="pointer"
                        />
                    ))}
                />
                <div className="row px-2  mb-2">
                    <div className="col-12">
                        <Tables removeScrollOverFlow={true}>
                            <thead>
                                <tr>
                                    <th style={{ width: "3%" }}>{t("S.no")}</th>
                                    <th>{t("App. No.")}</th>
                                    <th>{t("Patient Name")}</th>
                                    <th>{t("UHID")}</th>
                                    <th>{t("Age")}</th>
                                    <th>{t("ContactNo")}</th>
                                    <th>{t("Relative")}</th>
                                    <th>{t("Doctor Name")}</th>
                                    <th>{t("Patient Type")}</th>
                                    <th>{t("Purpose of Visit")}</th>
                                    <th>{t("App. Time")}</th>
                                    <th>{t("App. Date")}</th>
                                    <th style={{ width: "8%" }}>{t("Action")}</th>
                                    <th style={{ width: "3%" }}>{t("Print")}</th>
                                </tr>
                            </thead>
                            <tbody
                            // style={{
                            //     maxHeight: "100px",
                            //     overflowY: "auto",
                            // }}
                            >
                                {TableData?.length > 0 ? (
                                    currentTableData.map((row, index) => (
                                        <tr style={getRowStyle(row)}><td data-title={t("S.no")}>{index + 1}</td>
                                            <td data-title={t("App. No.")}>{row.AppNo}</td>
                                            <td data-title={t("Patient Name")}>{row.NAME}</td>
                                            <td data-title={t("UHID")}>{row.PatientID}</td>
                                            <td data-title={t("Age")}>{row.Age}</td>
                                            <td data-title={t("ContactNo")}>{row.ContactNo}</td>
                                            <td data-title={t("Relative")}>{row.Relative}</td>
                                            <td data-title={t("Doctor Name")}>{row.DoctorName}</td>
                                            <td data-title={t("Patient Type")}>{row.VisitType}</td>
                                            <td data-title={t("Purpose of Visit")}>{row.PurposeOfVisit}</td>
                                            <td data-title={t("App. Time")}>{row.AppTime}</td>
                                            <td data-title={t("App. Date")}>{row.AppDate}</td>
                                            <td

                                                data-title={t("Action")}
                                                style={{ display: "flex", gap: "10px", width: "8%" }}
                                            >
                                                {/* Confirm */}
                                                <span
                                                    title="Confirm"
                                                    onClick={
                                                        row.IsConform === 1 || row.IsCancel === 1
                                                            ? undefined
                                                            : () => {
                                                                handleConfirm(row);
                                                                handleSearch();
                                                            }
                                                    }

                                                    style={{
                                                        opacity: row.IsConform === 1 || row.IsCancel === 1 ? 0.4 : 1,
                                                        cursor:
                                                            row.IsConform === 1 || row.IsCancel === 1
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                >
                                                    <GiConfirmed color="green" size={16} />
                                                </span>

                                                {/* Reschedule */}
                                                <span
                                                    title="Reschedule"
                                                    onClick={
                                                        row.IsConform === 1 || row.IsCancel === 1
                                                            ? undefined
                                                            : () => handleReschedule(row)
                                                    }
                                                    style={{
                                                        opacity: row.IsConform === 1 || row.IsCancel === 1 ? 0.4 : 1,
                                                        cursor:
                                                            row.IsConform === 1 || row.IsCancel === 1
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                >
                                                    <SlCalender color="blue" size={16} />
                                                </span>

                                                {/* Edit / Payment */}
                                                <span
                                                    title="Edit / Payment"
                                                    onClick={row.IsConform === 1 ? () => handlePDF() : undefined}
                                                    style={{
                                                        opacity: row.IsConform === 1 ? 1 : 0.4,
                                                        cursor: row.IsConform === 1 ? "pointer" : "not-allowed",
                                                    }}
                                                >
                                                    <Link to={"/OpdAppointmentSearch"} state={{ appointmentData: row }}>
                                                        <RiEdit2Line color="black" size={16} />
                                                    </Link>
                                                </span>

                                                {/* Cancel */}
                                                <span
                                                    title="Cancel"
                                                    onClick={
                                                        row.IsCancel === 1 || row.IsConform === 1
                                                            ? undefined
                                                            : () => {
                                                                setShow(true);
                                                                setSelectedRow(row);
                                                            }
                                                    }
                                                    style={{
                                                        opacity: row.IsCancel === 1 || row.IsConform === 1 ? 0.4 : 1,
                                                        cursor:
                                                            row.IsCancel === 1 || row.IsConform === 1
                                                                ? "not-allowed"
                                                                : "pointer",
                                                    }}
                                                >
                                                    <MdCancel color="red" size={16} />
                                                </span>
                                            </td>




                                            <td data-title={t("Print")}>
                                                <span onClick={() => handlePDF()}>
                                                    <i

                                                        className="fa fa-print iconStyle px-2 fontSizeIcon ahddh_black"
                                                        style={{
                                                            cursor: "pointer",
                                                            textAlign: "center",
                                                        }}
                                                        title="Print"
                                                    ></i>
                                                </span></td>
                                        </tr>

                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={20} className="text-center">
                                            <NoRecordFound />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Tables>
                        {/* {TableData.length > 0 && ( */}
                        <Pagination
                            className="pagination-bar"
                            currentPage={currentPage}
                            totalCount={TableData.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            siblingCount={1}
                        />
                        {/* )} */}

                    </div>
                </div>
            </Accordion>
        </>
    );
};

export default OpdConfirmation;
