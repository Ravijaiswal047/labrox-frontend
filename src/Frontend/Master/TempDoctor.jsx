import React, { useEffect, useRef, useState } from 'react'
import Accordion from '../../components/UI/Accordion'
import { useTranslation } from 'react-i18next';
import MultiSelectComp from '../../components/formComponent/MultiSelectComp';
import { axiosInstance } from '../../utils/axiosInstance';
import DatePicker from '../../components/formComponent/DatePicker';
import ReactSelect from '../../components/formComponent/ReactSelect';
import { CustomButton } from '../../components/UI/CustomButton';
import Tables from '../../components/UI/customTable';
import { Dialog } from 'primereact/dialog';
import Input from '../../components/formComponent/Input';
import { SelectBox } from '../../components/formComponent/SelectBox';
import Loading from '../../components/loader/Loading';
import { toast } from 'react-toastify';
import Form from "react-bootstrap/Form";
import moment from 'moment';
import Pagination from '../../Pagination/Pagination';
import { autocompleteOnBlur, getTrimmedData, number } from '../../utils/helpers';
import { useLocalStorage } from '../../utils/hooks/useLocalStorage';
import ColorCodingSearch from '../../components/ModalComponent/ColorCodingSearch';
import { Tooltip as ReactTooltip } from "react-tooltip";

const TempDoctor = () => {
    const { t } = useTranslation();
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    const [centre, setCentre] = useState([])
    const [tableData, setTableData] = useState([]);
    const [summaryData, setSummaryData] = useState({});
    const [loading, setLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editDoctorData, setEditDoctorData] = useState({});
    const [titleOptions, setTitleOptions] = useState([]);
    const [specializationOptions, setSpecializationOptions] = useState([]);
    const [degreeOptions, setDegreeOptions] = useState([]);
    const [proEmployeeOptions, setProEmployeeOptions] = useState([]);
    const [referDoctorOptions, setReferDoctorOptions] = useState([]);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [patientData, setPatientData] = useState([]);
    const [patientLoading, setPatientLoading] = useState(false);
    const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
    const [prescriptionUrls, setPrescriptionUrls] = useState([]);
    const [currentPrescriptionIndex, setCurrentPrescriptionIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [mergeDoctorName, setMergeDoctorName] = useState("");
    const [mergeDoctorID, setMergeDoctorID] = useState(0);
    const [mergeDoctorSuggestion, setMergeDoctorSuggestion] = useState([]);
    const [mergeDoctorDropFalse, setMergeDoctorDropFalse] = useState(true);
    const [mergeDoctorIndexMatch, setMergeDoctorIndexMatch] = useState(0);
    const [mergeDoctorDropPos, setMergeDoctorDropPos] = useState({ top: 0, left: 0, width: 0 });
    const mergeDoctorContainerRef = useRef(null);
    
    const [payload, setPayload] = useState({
        CentreId: [],
        FromDate: new Date(),
        ToDate: new Date(),
        Status: 2
    })

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("Centre/getAccessCentres");
            const data = res.data.message;
            const CentreDataValue = data.map((ele) => {
                return {
                    value: ele.CentreID,
                    label: ele.Centre,
                };
            });
            setCentre(CentreDataValue);
        } catch (error) {
            console.log("Error while fetching centres");
        }
    };

    const getDropDownData = (name) => {
        axiosInstance
            .post("Global/getGlobalData", { Type: name })
            .then((res) => {
                const data = res.data.message;
                const mapped = data.map((ele) => ({
                    value: ele.FieldDisplay,
                    label: ele.FieldDisplay,
                }));
                if (name === "Title") setTitleOptions(mapped);
                if (name === "Specialization") setSpecializationOptions(mapped);
                if (name === "Degree") setDegreeOptions(mapped);
            })
            .catch((err) => console.log(err));
    };

    const getProEmployee = () => {
        axiosInstance
            .get("Employee/ProEmployee")
            .then((res) => {
                const data = res?.data?.message || [];
                const mapped = data.map((ele) => ({
                    value: ele?.EmployeeID,
                    label: ele?.EmployeeName,
                }));
                setProEmployeeOptions(mapped);
            })
            .catch((err) => console.log(err));
    };

    const getDoctorLists = () => {
        axiosInstance
            .get("DoctorReferal/SharingDoctorList")
            .then((res) => {
                const data = res?.data?.message || [];
                const formatted = data.map((item) => ({
                    label: `${item?.Title} ${item?.Name}`,
                    value: String(item?.DoctorReferalID),
                }));
                setReferDoctorOptions(formatted);
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        getAccessCentres();
        getDropDownData("Title");
        getDropDownData("Specialization");
        getDropDownData("Degree");
        getProEmployee();
        getDoctorLists();
    }, []);

    useEffect(() => {
        if (mergeDoctorName.length >= 1) {
            axiosInstance
                .post("DoctorReferal/getDoctorData", { DoctorName: mergeDoctorName })
                .then((res) => {
                    if (res.data.success && Array.isArray(res?.data?.message)) {
                        setMergeDoctorSuggestion(res.data.message);
                    } else {
                        setMergeDoctorSuggestion([]);
                    }
                })
                .catch(() => setMergeDoctorSuggestion([]));
        } else {
            setMergeDoctorSuggestion([]);
        }
    }, [mergeDoctorName]);

    const handleMergeDoctorSelect = (doctor) => {
        setMergeDoctorName(doctor.Name);
        setMergeDoctorID(doctor.DoctorReferalID);
        setMergeDoctorSuggestion([]);
        setMergeDoctorDropFalse(false);
    };

    const handleMergeDoctorKeyDown = (e) => {
        switch (e.which) {
            case 38:
                if (mergeDoctorSuggestion.length > 0) {
                    setMergeDoctorIndexMatch((prev) =>
                        prev !== 0 ? prev - 1 : mergeDoctorSuggestion.length - 1
                    );
                    setTimeout(() => {
                        document.querySelector(".mergeMatchIndex")?.scrollIntoView({ block: "nearest" });
                    }, 0);
                }
                break;
            case 40:
                if (mergeDoctorSuggestion.length > 0) {
                    setMergeDoctorIndexMatch((prev) =>
                        prev === mergeDoctorSuggestion.length - 1 ? 0 : prev + 1
                    );
                }
                break;
            case 13:
                if (mergeDoctorSuggestion.length > 0 && mergeDoctorSuggestion[mergeDoctorIndexMatch]) {
                    handleMergeDoctorSelect(mergeDoctorSuggestion[mergeDoctorIndexMatch]);
                }
                setMergeDoctorIndexMatch(0);
                break;
            default:
                break;
        }
    };

    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSelectChange = (name, option) => {
        setPayload((prev) => ({
            ...prev,
            [name]: option?.value
        }))
    };

    const handleDateChange = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchSearchData = async (flag = false) => {
        setLoading(true);
        try {
            const res = await axiosInstance.post("DoctorReferal/SearchTempDoctorsAsync", {
                CentreId: payload.CentreId,
                FromDate: moment(payload.FromDate).format("DD-MMM-YYYY"),
                ToDate: moment(payload.ToDate).format("DD-MMM-YYYY"),
                Status: payload.Status,
                IsActive: 1,
                PageNo: flag ? 1 : currentPage,
                PageSize: pageSize
            });
            if (res.data.success) {
                setTableData(res.data.message);
                setSummaryData(res.data.data || {});
                if (flag) setCurrentPage(1);
            } else {
                setTableData([]);
                setSummaryData({});
                toast.error(res.data.message || "No records found");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching data");
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchSearchData();
    }, [currentPage, pageSize]);

    const handleEdit = (data) => {
        setEditDoctorData({
            ...data,
            isActive: data.isActive ?? 1,
            SecondReferDoctor: data.SecondReferDoctor ?? 0,
            DocIsRefer: data.DocIsRefer ?? 0,
            allowlogin: data.AllowLogin ?? "0",
            Sharing: data.ReferMasterShare !== undefined ? String(data.ReferMasterShare) : "",
            IsReferral: data.ReferDoctorShareID ? String(data.ReferDoctorShareID) : data.IsReferal ? String(data.IsReferal) : "",
            mergeWithOtherDoctor: 0,
        });
        setMergeDoctorName("");
        setMergeDoctorID(0);
        setMergeDoctorSuggestion([]);
        setMergeDoctorDropFalse(true);
        setShowEditModal(true);
    };

    const handleModalInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditDoctorData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const handleModalSelectChange = (name, option) => {
        setEditDoctorData((prev) => ({
            ...prev,
            [name]: option?.value
        }));
    };

    const handleModalToggleChange = (e) => {
        const { name, checked } = e.target;
        setEditDoctorData((prev) => ({
            ...prev,
            [name]: name === "allowlogin" ? (checked ? "1" : "0") : (checked ? 1 : 0)
        }));
    };

    const handleUpdate = async (isApproved = null) => {
        setLoading(true);
        const isSharingYes = editDoctorData.Sharing === "1";
        const referDoctorShareID = isSharingYes ? Number(editDoctorData.IsReferral) || 0 : 0;
        const isReferal = isSharingYes ? Number(editDoctorData.IsReferral) || 0 : 0;

        const finalPayload = {
            DoctorReferalID: editDoctorData.DoctorReferalID || 0,
            Title: editDoctorData.Title,
            Name: editDoctorData.Name,
            ClinicName: editDoctorData.ClinicName,
            Email: editDoctorData.Email,
            Address: editDoctorData.Address,
            Phone: editDoctorData.Phone,
            Mobile: editDoctorData.Mobile,
            Specialization: editDoctorData.Specialization,
            Degree: editDoctorData.Degree,
            Zone: editDoctorData.Zone,
            Locality: editDoctorData.Locality,
            IsActive: Number(editDoctorData.isActive) || 0,
            SecondReferDoctor: Number(editDoctorData.SecondReferDoctor) || 0,
            ProEmployee: editDoctorData.ProEmployee !== "" ? Number(editDoctorData.ProEmployee) || 0 : 0,
            ProEmployeeID: editDoctorData.ProEmployee !== "" ? Number(editDoctorData.ProEmployee) || 0 : 0,
            DocIsRefer: Number(editDoctorData.DocIsRefer) || 0,
            ReferMasterShare: isSharingYes ? 1 : 0,
            IsReferal: isReferal,
            ReferDoctorShareID: referDoctorShareID,
            AllowLogin: String(editDoctorData.allowlogin),
            Username: editDoctorData.username ?? "",
            Password: editDoctorData.password ?? "",
            IsVisible: 0,
            IsLock: 0,
            DoctorGroupID: 0,
            IsDoctorMerge: editDoctorData.mergeWithOtherDoctor === 1 ? 1 : 0,
            MergeDoctorID: editDoctorData.mergeWithOtherDoctor === 1 ? mergeDoctorID : 0,
            IsApproved: isApproved !== null ? isApproved : editDoctorData.IsApproved
        };

        try {
            const res = await axiosInstance.post("DoctorReferal/UpdateTempDoctorReferalAsync", getTrimmedData(finalPayload));
            if (res.data.success) {
                toast.success(res.data.message);
                fetchSearchData();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating doctor");
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientDetails = async (doctorID) => {
        setPatientLoading(true);
        try {
            const res = await axiosInstance.post("DoctorReferal/GetPatientDetailByDoctorID", {
                doctorID: doctorID
            });
            if (res.data.success) {
                setPatientData(res.data.message);
                setShowPatientModal(true);
                setPatientLoading(false);
            } else {
                setPatientData([]);
                setShowPatientModal(false);
                setPatientLoading(false);
                toast.error(res.data.message || "No patient found");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching patient details");
        } finally {
            setPatientLoading(false);
        }
    };

    const fetchPrescriptionDetails = async (doctorID) => {
        try {
            const res = await axiosInstance.post("DoctorReferal/GetPrecriptionDetailByDoctorID", {
                doctorID: doctorID
            });
            if (res.data.success && res.data.message.length > 0) {
                setPrescriptionUrls(res.data.message);
                setCurrentPrescriptionIndex(0);
                setShowPrescriptionModal(true);
            } else {
                toast.error(res.data.message || "No prescription found");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching prescription details");
        }
    };

    const handleNextPrescription = () => {
        if (currentPrescriptionIndex < prescriptionUrls.length - 1) {
            setCurrentPrescriptionIndex((prev) => prev + 1);
        }
    };

    const handlePrevPrescription = () => {
        if (currentPrescriptionIndex > 0) {
            setCurrentPrescriptionIndex((prev) => prev - 1);
        }
    };



    const colorCodingData = [
        { id: 4, color: "transparent", labelKey: `Total (${summaryData?.totalDoctorCount})` },
        { id: 1, color: "#94ff94ff", labelKey: `Approved (${summaryData?.approvedCount})` },
        { id: 2, color: "#ff9494ff", labelKey: `Rejected (${summaryData?.rejectCount})` },
        { id: 3, color: "#ffffff", labelKey: `Pending (${summaryData?.pendingCount})` },
    ];

    const filteredTableData = tableData.filter(item =>
        item.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.Email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (name, option) => {
        setPageSize(option.value);
        setCurrentPage(1);
    };

    return (
        <>
            <Accordion
                name={t("Temp Doctor")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row col-12 pt-2 pl-2 pr-2">
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <MultiSelectComp
                            label="All Centre"
                            options={centre}
                            value={payload?.CentreId}
                            name="CentreId"
                            id="CentreId"
                            onChange={handleMultiSelectChange}
                            lable={t("Select Centre")}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="FromDate"
                            id="FromDate"
                            lable={t("FromDate")}
                            value={payload.FromDate}
                            onChange={handleDateChange}
                           className="custom-calendar"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <DatePicker
                            name="ToDate"
                            id="ToDate"
                            lable={t("ToDate")}
                            value={payload.ToDate}
                            onChange={handleDateChange}
                            className="custom-calendar"
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <ReactSelect
                            dynamicOptions={[
                                { value: 2, label: "All" },
                                { value: 0, label: "Pending" },
                                { value: 1, label: "Approved" },
                                { value: -1, label: "Rejected" },
                            ]}
                            onChange={handleSelectChange}
                            placeholderName="Select Status"
                            name="Status"
                            id="Status"
                            value={payload?.Status}
                        />
                    </div>
                    <div className="col-12 col-sm-6 col-md-2 my-1">
                        <CustomButton
                            text={t("Search")}
                            onClick={() => fetchSearchData(true)}
                        />
                    </div>
                </div>
            </Accordion>
            <Accordion
                name={t("Search Data")}
                notOpen={true}
                defaultValue={true}
                linkTo={"#"}
                linkTitle={
                    <div
                        className="d-none d-md-flex align-items-center justify-content-between"
                        id="pr_id_11"
                        style={{
                            gap: "5px"
                        }}
                    >
                        {colorCodingData.map(({ color, labelKey, id }) => (
                            <ColorCodingSearch
                                key={id}
                                color={color}
                                label={t(labelKey)}
                            />
                        ))}
                        <div className="mt-2">
                            <Input
                                className=""
                                type="text"
                                name="search"
                                id="search"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                }
            >
                <div className="pt-2 pl-2 pr-2">
                    {loading ? (
                        <Loading />
                    ) : filteredTableData.length > 0 ? (
                    <Tables>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Name</th>
                                    <th>Mobile</th>
                                    <th>Email</th>
                                    <th>Specialization</th>
                                    <th>Status</th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-center">
                                            {t("Created Info")}
                                            <i
                                            className="fa fa-info-circle ml-1 text-info"
                                            data-tooltip-id="created-info-tooltip"
                                            data-tooltip-html={`${t("1. Centre Name")}<br/>${t("2. Created By")}<br/>${t("3. Created Date")}`}
                                            style={{ cursor: "pointer" }}
                                            ></i>
                                            <ReactTooltip id="created-info-tooltip" />
                                        </div>
                                    </th>
                                    <th>
                                        <div className="d-flex align-items-center justify-content-center">
                                            {t("Approved Info")}
                                            <i
                                            className="fa fa-info-circle ml-1 text-info"
                                            data-tooltip-id="approved-info-tooltip"
                                            data-tooltip-html={`${t("1. Approved By")}<br/>${t("2. Approved Date")}`}
                                            style={{ cursor: "pointer" }}
                                            ></i>
                                            <ReactTooltip id="approved-info-tooltip" />
                                        </div>
                                    </th>
                                    <th>Patients</th>
                                    <th>Prescription</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTableData.map((data, index) => (
                                    <tr
                                        key={index}
                                        style={{
                                            backgroundColor: data.IsApproved == 1 ?
                                                '#94ff94ff' :
                                                data.IsApproved == -1 ?
                                                    '#ff9494ff' :
                                                    'transparent'
                                        }}
                                    >
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td>{data?.Name}</td>
                                        <td>{data?.Mobile}</td>
                                        <td>{data?.Email}</td>
                                        <td>{data?.Specialization}</td>
                                        <td>
                                            {data?.IsApproved === 1 ? "Approved" : data?.IsApproved === -1 ? "Rejected" : "Pending"}
                                        </td>
                                        <td>
                                             <>
                                                {data?.CreatedByCentreName}
                                                <br />
                                                {data?.CreatedByName}
                                                <br />
                                                {data?.dtEntry?.split(" ").slice(0, 1).join(" ")}
                                                <br />
                                                {data?.dtEntry?.split(" ").slice(1).join(" ")}
                                            </>
                                        </td>
                                        <td>
                                             <>
                                                {data?.ApprovedName || "-"}
                                                <br />
                                                {data?.dtApproved?.split(" ").slice(0, 1).join(" ")}
                                                <br />
                                                {data?.dtApproved?.split(" ").slice(1).join(" ")}
                                            </>
                                        </td>
                                        
                                        <td className="text-center">
                                            <i
                                                className="bi bi-people-fill text-info cursor-pointer"
                                                onClick={() => fetchPatientDetails(data?.DoctorReferalID)}
                                                title="View Patients"
                                            ></i>
                                        </td>
                                        <td className="text-center">
                                            <i
                                                className="bi bi-file-earmark-pdf-fill text-danger cursor-pointer"
                                                onClick={() => fetchPrescriptionDetails(data.DoctorReferalID)}
                                                title="View Prescription"
                                            ></i>
                                        </td>
                                        <td>
                                            {data.IsApproved !== -1 && (
                                                <i
                                                    className="bi bi-pencil-square text-primary cursor-pointer"
                                                    onClick={() => handleEdit(data)}
                                                ></i>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    ) : (
                        <div className="text-center p-3">{t("No Data Found")}</div>
                    )}

                    {tableData.length > 0 && (
                        <div className="d-flex flex-wrap justify-content-end align-items-center gap-2 mt-4">
                            <div style={{ minWidth: "150px" }}>
                                <ReactSelect
                                    value={pageSize}
                                    dynamicOptions={[
                                        { label: "10", value: 10 },
                                        { label: "25", value: 25 },
                                        { label: "50", value: 50 },
                                        { label: "100", value: 100 },
                                    ]}
                                    name={"pageSize"}
                                    placeholderName={t("Page Size")}
                                    removeIsClearable={true}
                                    onChange={handlePageSizeChange}
                                />
                            </div>
                            <Pagination
                                className="pagination-bar"
                                currentPage={currentPage}
                                totalCount={summaryData?.totalDoctorCount}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </Accordion>

            <Dialog
                header={t("Edit Doctor Details")}
                visible={showEditModal}
                style={{ width: '80vw' }}
                onHide={() => setShowEditModal(false)}
                className={theme}
            >
                <div className="row p-2">
                    <div className="col-sm-2 mt-1">
                        <SelectBox
                            options={titleOptions}
                            name="Title"
                            selectedValue={editDoctorData.Title}
                            onChange={(e) => setEditDoctorData({ ...editDoctorData, Title: e.target.value })}
                            id="Title"
                            lable="Title"
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <Input
                            type="text"
                            lable="Doctor Name"
                            name="Name"
                            value={editDoctorData.Name}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <Input
                            type="text"
                            lable="Clinic Name"
                            name="ClinicName"
                            value={editDoctorData.ClinicName}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <Input
                            type="email"
                            lable="Email"
                            name="Email"
                            value={editDoctorData.Email}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <Input
                            type="text"
                            lable="Mobile"
                            name="Mobile"
                            value={editDoctorData.Mobile}
                            onInput={(e) => number(e, 13)}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <Input
                            type="text"
                            lable="Phone"
                            name="Phone"
                            value={editDoctorData.Phone}
                            onInput={(e) => number(e, 13)}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <SelectBox
                            lable="Specialization"
                            name="Specialization"
                            options={[{ label: "Select Specialization", value: "" }, ...specializationOptions]}
                            selectedValue={editDoctorData.Specialization}
                            onChange={(e) => setEditDoctorData({ ...editDoctorData, Specialization: e.target.value })}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <SelectBox
                            lable="Degree"
                            name="Degree"
                            options={[{ label: "Select Degree", value: "" }, ...degreeOptions]}
                            selectedValue={editDoctorData.Degree}
                            onChange={(e) => setEditDoctorData({ ...editDoctorData, Degree: e.target.value })}
                        />
                    </div>

                    <div className="col-sm-2 mt-1">
                        <Input
                            type="text"
                            lable="Address"
                            name="Address"
                            value={editDoctorData.Address}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <Input
                            type="text"
                            lable="Zone"
                            name="Zone"
                            value={editDoctorData.Zone}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <Input
                            type="text"
                            lable="Locality"
                            name="Locality"
                            value={editDoctorData.Locality}
                            onChange={handleModalInputChange}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <SelectBox
                            lable="Pro Employee"
                            name="ProEmployee"
                            options={[{ label: "Select Pro Employee", value: "" }, ...proEmployeeOptions]}
                            selectedValue={editDoctorData.ProEmployee}
                            onChange={(e) => setEditDoctorData({ ...editDoctorData, ProEmployee: e.target.value })}
                        />
                    </div>
                    <div className="col-sm-2 mt-1">
                        <SelectBox
                            lable="Sharing"
                            name="Sharing"
                            options={[{ label: "Select", value: "" }, { label: "Yes", value: "1" }, { label: "No", value: "0" }]}
                            selectedValue={editDoctorData.Sharing}
                            onChange={(e) => setEditDoctorData({ ...editDoctorData, Sharing: e.target.value })}
                        />
                    </div>
                    {editDoctorData.Sharing === "1" && (
                        <div className="col-sm-2 mt-1">
                            <ReactSelect
                                lable="Sharing Doctor"
                                name="IsReferral"
                                dynamicOptions={referDoctorOptions}
                                value={editDoctorData.IsReferral}
                                onChange={(name, option) => setEditDoctorData({ ...editDoctorData, IsReferral: option.value })}
                            />
                        </div>
                    )}
                    <div className="col-sm-auto mt-1">
                        <Form.Check
                            type="switch"
                            id="isActive"
                            name="isActive"
                            checked={editDoctorData.isActive === 1}
                            onChange={handleModalToggleChange}
                            label={t("Active")}
                        />
                    </div>
                    <div className="col-sm-auto mt-1">
                        <Form.Check
                            type="switch"
                            id="SecondReferDoctor"
                            name="SecondReferDoctor"
                            checked={editDoctorData.SecondReferDoctor === 1}
                            onChange={handleModalToggleChange}
                            label={t("Second Refer Doctor")}
                        />
                    </div>
                    <div className="col-sm-auto mt-1">
                        <Form.Check
                            type="switch"
                            id="allowlogin"
                            name="allowlogin"
                            checked={editDoctorData.allowlogin === "1"}
                            onChange={handleModalToggleChange}
                            label={t("Allow Login")}
                        />
                    </div>
                    <div className="col-sm-auto mt-1">
                        <Form.Check
                            type="switch"
                            id="mergeWithOtherDoctor"
                            name="mergeWithOtherDoctor"
                            checked={editDoctorData.mergeWithOtherDoctor === 1}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setEditDoctorData((prev) => ({ ...prev, mergeWithOtherDoctor: checked ? 1 : 0 }));
                                if (!checked) {
                                    setMergeDoctorName("");
                                    setMergeDoctorID(0);
                                    setMergeDoctorSuggestion([]);
                                }
                            }}
                            label={t("Merge With Other Doctor")}
                        />
                    </div>
                    {editDoctorData.mergeWithOtherDoctor === 1 && (
                        <div className="col-sm-2 mt-1" ref={mergeDoctorContainerRef} style={{ position: "relative" }}>
                            <Input
                                type="text"
                                lable="Select Doctor to Merge"
                                name="mergeDoctorName"
                                value={mergeDoctorName}
                                placeholder=" "
                                autoComplete="off"
                                onChange={(e) => {
                                    setMergeDoctorName(e.target.value);
                                    setMergeDoctorDropFalse(true);
                                    if (e.target.value === "") {
                                        setMergeDoctorID(0);
                                        setMergeDoctorSuggestion([]);
                                    }
                                    if (mergeDoctorContainerRef.current) {
                                        const rect = mergeDoctorContainerRef.current.getBoundingClientRect();
                                        setMergeDoctorDropPos({ top: rect.bottom, left: rect.left, width: rect.width });
                                    }
                                }}
                                onKeyDown={handleMergeDoctorKeyDown}
                                onBlur={() => {
                                    autocompleteOnBlur(setMergeDoctorSuggestion);
                                    setTimeout(() => {
                                        const matched = mergeDoctorSuggestion.filter(
                                            (ele) => ele?.Name === mergeDoctorName
                                        );
                                        if (matched.length === 0) {
                                            setMergeDoctorName("");
                                            setMergeDoctorID(0);
                                        }
                                    }, 500);
                                }}
                            />
                            {mergeDoctorDropFalse && mergeDoctorSuggestion.length > 0 && mergeDoctorName && (
                                <ul
                                    className="suggestion-data"
                                    style={{
                                        position: "fixed",
                                        top: mergeDoctorDropPos.top,
                                        left: mergeDoctorDropPos.left,
                                        width: mergeDoctorDropPos.width,
                                        zIndex: 99999,
                                    }}
                                >
                                    {mergeDoctorSuggestion.map((doctor, index) => (
                                        <li
                                            key={index}
                                            className={index === mergeDoctorIndexMatch ? "matchIndex mergeMatchIndex" : ""}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleMergeDoctorSelect(doctor);
                                            }}
                                        >
                                            {doctor.Name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {editDoctorData.allowlogin === "1" && (
                        <>
                            <div className="col-sm-3 mt-1">
                                <Input
                                    type="text"
                                    lable="Username"
                                    name="username"
                                    value={editDoctorData.username}
                                    onChange={handleModalInputChange}
                                />
                            </div>
                            <div className="col-sm-2 mt-1">
                                <Input
                                    type="password"
                                    lable="Password"
                                    name="password"
                                    value={editDoctorData.password}
                                    onChange={handleModalInputChange}
                                />
                            </div>
                        </>
                    )}
                </div>

                <div className="row p-2 d-flex justify-content-end">
                    {editDoctorData.IsApproved !== 1 && (
                        <>
                            <div className="col-auto">
                                <CustomButton
                                    text={t("Approve")}
                                    icon={"check"}
                                    className='bg-success'
                                    onClick={() => handleUpdate(1)}
                                />
                            </div>
                            <div className="col-auto">
                                <CustomButton
                                    text={t("Reject")}
                                    icon={"cancel"}
                                    className='bg-danger'
                                    onClick={() => handleUpdate(-1)}
                                />
                            </div>
                        </>
                    )}
                    <div className="col-auto">
                        <CustomButton
                            text={t("Update")}
                            icon={"edit"}
                            className='bg-primary'
                            onClick={() => handleUpdate(null)}
                        />
                    </div>
                </div>
            </Dialog>

            <Dialog
                header={t("Patient Details")}
                visible={showPatientModal}
                style={{ width: '70vw' }}
                onHide={() => setShowPatientModal(false)}
                className={theme}
            >
                <div className="p-2">
                    {patientLoading ? (
                        <Loading />
                    ) : patientData.length > 0 ? (
                        <Tables>
                            <thead>
                                <tr>
                                    <th>S.No</th>
                                    <th>Visit No</th>
                                    <th>Patient Name</th>
                                    <th>Age/Gender</th>
                                    <th>Visit Date</th>
                                    <th>Gross</th>
                                    <th>Disc</th>
                                    <th>Net</th>
                                    <th>Due</th>
                                    <th>Centre</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patientData.map((patient, idx) => (
                                    <tr key={idx}>
                                        <td>{idx + 1}</td>
                                        <td>{patient.VisitNo}</td>
                                        <td>{patient.PName}</td>
                                        <td>{`${patient.Age}/${patient.Gender}`}</td>
                                        <td>{patient.VisitDate}</td>
                                        <td>{patient.GrossAmount}</td>
                                        <td>{patient.DiscountOnTotal}</td>
                                        <td>{patient.NetAmount}</td>
                                        <td>{patient.DueAmount}</td>
                                        <td>{patient.CentreName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Tables>
                    ) : (
                        <div className="text-center p-3">{t("No Patients Found")}</div>
                    )}
                </div>
            </Dialog>

            <Dialog
                header={
                    <div className="d-flex justify-content-between align-items-center w-100 pr-5">
                        <span>{t("Prescription Preview")}</span>
                        {prescriptionUrls.length > 1 && (
                            <span className="badge badge-info ml-3">
                                {currentPrescriptionIndex + 1} / {prescriptionUrls.length}
                            </span>
                        )}
                    </div>
                }
                visible={showPrescriptionModal}
                style={{ width: isMobile ? "90vw" : "70vw" }}
                onHide={() => setShowPrescriptionModal(false)}
                className={theme}
                maximizable
            >
                <div className="position-relative" style={{ height: "98vh", display: "flex", alignItems: "center" }}>
                    {/* Left Arrow */}
                    {prescriptionUrls.length > 1 && (
                        <button
                            className="btn btn-dark position-absolute"
                            style={{ left: "10px", zIndex: 10, borderRadius: "50%", opacity: currentPrescriptionIndex === 0 ? 0.3 : 0.8 }}
                            onClick={handlePrevPrescription}
                            disabled={currentPrescriptionIndex === 0}
                        >
                            <i className="bi bi-chevron-left"></i>
                        </button>
                    )}

                    {/* Viewer */}
                    <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                        {prescriptionUrls[currentPrescriptionIndex]?.toLowerCase().includes(".pdf") ? (
                            <iframe
                                src={`${prescriptionUrls[currentPrescriptionIndex]}#toolbar=0`}
                                width="100%"
                                height="100%"
                                style={{ border: "none" }}
                                title="Prescription PDF"
                            />
                        ) : (
                            <img
                                src={prescriptionUrls[currentPrescriptionIndex]}
                                alt="Prescription"
                                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                            />
                        )}
                    </div>

                    {/* Right Arrow */}
                    {prescriptionUrls.length > 1 && (
                        <button
                            className="btn btn-dark position-absolute"
                            style={{ right: "10px", zIndex: 10, borderRadius: "50%", opacity: currentPrescriptionIndex === prescriptionUrls.length - 1 ? 0.3 : 0.8 }}
                            onClick={handleNextPrescription}
                            disabled={currentPrescriptionIndex === prescriptionUrls.length - 1}
                        >
                            <i className="bi bi-chevron-right"></i>
                        </button>
                    )}
                </div>
            </Dialog>
        </>
    )
}

export default TempDoctor