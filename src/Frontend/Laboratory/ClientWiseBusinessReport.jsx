import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { downloadExcelBlob } from "../../utils/helpers";
import DatePicker from "../../components/formComponent/DatePicker";
import Loading from "../../components/loader/Loading";
import Accordion from "@app/components/UI/Accordion";
import { useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import {
    BindApprovalDoctorReports,
    BindEmployeeReports,
    BindProEmployee,
    getAccessCentresReports,
    getAccessDataRateReport,
    GetGlobalData,
    getPaymentModes,
    getVisitType,
} from "../../utils/NetworkApi/commonApi";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const summarybyall = [
    { label: "Summary", value: "Summary" },
    { label: "Summary2", value: "Summary2" },
    { label: "Summary with Ref Lab", value: "SummaryWithReferLab" },
    { label: "Detail", value: "Detail" },
    { label: "Detail With MRP", value: "Mrp" },
];

const summarybyPkl = [
    { label: "Summary", value: "Summary" },
    { label: "Detail", value: "Detail" },
];

const defaultFormData = {
    Centre: [],
    FromDate: new Date(),
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    ToDate: new Date(),
    DocumentType: 2,
    Test: [],
    User: [],
    RateType: "",
    MultipleRateType: [],
    Department: "",
    MultipleDepartment: [],
    VisitType: "",
    TestId: [],
    FromRange: "",
    ToRange: "",
    ObservationId: [],
    InvestigationId: [],
    PatientType: "",
    Doctor: [],
    DateType: "",
    Urgent: "",
    Status: "",
    PatientName: "",
    VisitNo: "",
    DiscountApprovalUser: [],
    Barcodeno: "",
    ChkisUrgent: 0,
    chkTATDelay: 0,
    SearchByDate: "",
    ProEmployee: "",
    LabNo: "",
    ProReportType: "Summary",
    Source: "",
    ReportType: "Summary",
    UHIDNo: "",
    OnlyDue: 0,
    Antibiotic: "",
    cultureTestid: "",
    SampleOriginArea: "",
    FeedBackType: "PatientPortal",
    CombineReportType: "All",
    PaymentMode: "",
    vendorIds: "",
    LocationIds: "",
    DateFilter: "0",
    GRNStatus: "All",
    AppType: "0",
    itemIds: "",
};

function ClientWiseBusinessReport(props) {
    const { secondTitle } = props;
    const { t } = useTranslation();
    const location = useLocation();
    const { id: paramId } = useParams();
    const id = props?.id || paramId;

    const [load, setLoad] = useState(true);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [CentreData, setCentreData] = useState([]);
    const [Department, setDepartment] = useState([]);
    const [VisitType, setVisitType] = useState([]);
    const [DoctorName, setDoctorAdmin] = useState([]);
    const [EmployeeName, setEmployeeName] = useState([]);
    const [rateType, setRateType] = useState([]);
    const [FieldShow, setFieldShow] = useState({});
    const [proEmployee, setProEmployee] = useState([]);
    const [PatientSource, setPatientSource] = useState([]);
    const [PaymentMode, setPaymentMode] = useState([]);
    const [getLocations, setGetLocations] = useState([]);
    const [Supplier, setSupplier] = useState([]);
    const [Items, setItems] = useState([]);
    const localData = useLocalStorage("userData", "get");
    const [formData, setFormData] = useState(defaultFormData);
    const handleReactSelectChange = (name, e) => {
        setFormData((prev) => ({ ...prev, [name]: e?.value }));
    };

    const dateSelect = (date, name) => {
        setFormData((prev) => ({ ...prev, [name]: date }));
    };

    const handleTime = (time, name) => {
        setFormData((prev) => ({ ...prev, [name]: time }));
    };

    const handleToggle = () => {
        setFormData((prev) => ({
            ...prev,
            OnlyDue: prev.OnlyDue === 1 ? 0 : 1,
        }));
    };

    const handleSelectMultiChange = (name, value) => {
        if (name === "Centre") {
            setFormData((prev) => ({
                ...prev,
                Centre: value,
                RateType: "",
                MultipleRateType: [],
            }));
            getAccessDataRateReport(setRateType, Array.isArray(value) ? value : []);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const getDepartmentReports = (state) => {
        axiosInstance
            .get("Department/getDepartment")
            .then((res) => {
                if (!Array.isArray(res.data.message)) { state([]); return; }
                const data = res.data.message.map((ele) => ({
                    value: ele.DepartmentID,
                    label: ele.Department,
                }));
                state(data);
            })
            .catch((err) => console.log(err));
    };

    const getGrnLocation = (setState) => {
        axiosInstance
            .get("DirectGRN/GetLocationWithpanel")
            .then((res) => {
                const data = res.data.message.map((ele) => ({
                    value: ele.LocationID,
                    label: ele.Location,
                }));
                setState(data);
            })
            .catch((err) => console.log(err));
    };

    const getSupplierApi = (setState) => {
        axiosInstance
            .get("VendorQuotation/bindsupplier")
            .then((res) => {
                const data = res?.data?.message.map((ele) => ({
                    value: Number(ele.id),
                    label: ele.name,
                }));
                setState(data);
            })
            .catch((err) => console.log(err));
    };

    const getSearchItem = (setState) => {
        axiosInstance
            .post("InventryManageApprovalStore/AllStoreItem")
            .then((res) => {
                const data = res.data.data.map((ele) => ({
                    value: ele.itemID,
                    label: ele.itemName,
                }));
                setState(data);
            })
            .catch((err) => console.log(err));
    };

    const bindApiResponseAccording = (data) => {
        const {
            Centre, MultipleCentre,
            Department, MultipleDepartment,
            User, MultipleUser, DiscountApprovalUser,
            Doctor, MultipleDoctor,
            RateType, MultipleRateType,
            ProEmployee, Source, VisitType, PatientType,
            PaymentMode, locationid, SupplierID, ItemID,
        } = data;

        if (Centre || MultipleCentre) getAccessCentresReports(setCentreData);
        if (Department || MultipleDepartment) getDepartmentReports(setDepartment);
        if (User || MultipleUser || DiscountApprovalUser) BindEmployeeReports(setEmployeeName);
        if (Doctor || MultipleDoctor) BindApprovalDoctorReports(setDoctorAdmin);
        if (RateType || MultipleRateType) setRateType([]);
        if (ProEmployee) BindProEmployee(setProEmployee);
        if (Source) getPaymentModes("Source", setPatientSource);
        if (VisitType || PatientType) getVisitType(setVisitType);
        if (PaymentMode) GetGlobalData(setPaymentMode, "PaymentMode");
        if (locationid) getGrnLocation(setGetLocations);
        if (SupplierID) getSupplierApi(setSupplier);
        if (ItemID) getSearchItem(setItems);
    };

    const getPatientInfoField = (id) => {
        setLoad(true);
        axiosReport
            .get(`commonReports/getFields/${id}`)
            .then((res) => {
                setLoad(false);
                console.log("FieldShow data:", res?.data?.message);
                bindApiResponseAccording(res?.data?.message);
                setFieldShow({ ...res?.data?.message });
            })
            .catch((err) => {
                setLoad(false);
                toast.error(err?.response?.data?.message || "Error Occured");
            });
    };

    useEffect(() => {
        if (CentreData?.length === 1) {
            const singleCentre = [CentreData[0].value];
            setFormData((prev) => ({ ...prev, Centre: singleCentre }));
            getAccessDataRateReport(setRateType, singleCentre);
        }
    }, [CentreData]);

    useEffect(() => {
        setFormData(defaultFormData);
        setRateType([]);
        getPatientInfoField(id);
    }, [location?.pathname, id]);

    const buildPayload = (docType) => ({
        ...formData,
        ToDate: moment(formData?.ToDate).format("DD-MMM-YYYY"),
        FromDate: moment(formData?.FromDate).format("DD-MMM-YYYY"),
        FromTime: formData.FromTime,
        ToTime: formData.ToTime,
        DocumentType: docType || Number(formData?.DocumentType),
        ReportType: String(formData.ReportType || ""),
        ledgertransactionid: "",
        Centre: formData?.Centre?.length > 0 ? formData.Centre : [],
        Test: !!Number(formData?.Test) ? [Number(formData?.Test)] : [],
        User: formData?.User?.length > 0 ? formData.User : [],
        RateType: (
            Array.isArray(formData?.MultipleRateType) && formData.MultipleRateType.length > 0
                ? formData.MultipleRateType
                : formData?.RateType ? [formData.RateType] : []
        ).flat().filter((item) => item !== ""),
        Department: (
            Array.isArray(formData?.MultipleDepartment) && formData.MultipleDepartment.length > 0
                ? formData.MultipleDepartment
                : formData?.Department ? [formData.Department] : []
        ).flat().filter((item) => item !== ""),
        TestId: formData?.TestId?.length > 0 ? formData.TestId : [],
        ObservationId: !!Number(formData?.ObservationId) ? [Number(formData?.ObservationId)] : [],
        InvestigationId: !!Number(formData?.InvestigationId) ? [Number(formData?.InvestigationId)] : [],
        Doctor: formData?.Doctor?.length > 0 ? formData.Doctor : [],
        DiscountApprovalUser: formData?.DiscountApprovalUser?.length > 0
            ? formData.DiscountApprovalUser : [],
        Antibiotic: formData?.Antibiotic || "",
        cultureTestid: formData?.cultureTestid || "",
        SampleOriginArea: formData?.SampleOriginArea || "",
        LocationIds: formData?.LocationIds ? [Number(formData?.LocationIds)] : [],
        AppType: formData?.AppType || "",
        DateFilter: formData?.DateFilter || "0",
        GRNStatus: formData?.GRNStatus || "All",
        vendorIds: formData?.vendorIds ? [Number(formData?.vendorIds)] : [],
        itemIds: formData?.itemIds ? [Number(formData?.itemIds)] : [],
    });

    const getPatientInfoReport = async () => {
        setLoadingSearch(true);
        try {
            const res = await axiosReport.post(
                "commonReports/ClientWiseBusinessReportHTMLPDF",
                buildPayload(1),
                { responseType: "blob" },
            );

            const contentType = res.headers?.["content-type"] || "";
            if (contentType.includes("application/json")) {
                const text = await res.data.text();
                const json = JSON.parse(text);
                toast.warning(json?.message || "No records found.");
                return;
            }

            if (!res.data || res.data.size === 0) {
                toast.warning("No data available to export.");
                return;
            }

            downloadExcelBlob(res.data, id || "ClientWiseBusinessReport");
            toast.success("Excel File Downloaded");
        } catch (err) {
            if (err?.response?.data instanceof Blob) {
                const text = await err.response.data.text();
                try {
                    const json = JSON.parse(text);
                    toast.error(json?.message || "Something went wrong while fetching the report");
                } catch {
                    toast.error("Something went wrong while fetching the report");
                }
                return;
            }
            toast.error(err?.response?.data?.message || err?.message || "Something went wrong while fetching the report");
        } finally {
            setLoadingSearch(false);
        }
    };

    const getClientWiseBussinessReport = async () => {
        setLoadingSearch(true);
        try {
            const res = await axiosReport.post(
                "commonReports/ClientWiseBusinessReportHTMLPDF",
                buildPayload(),
                { responseType: "text" },
            );

            if (!res?.data || res.data.trim() === "") {
                toast.info("No Record Found");
                setLoadingSearch(false);
                return;
            }

            const newWindow = window.open("", "_blank");
            if (newWindow) {
                newWindow.document.open();
                newWindow.document.write(res.data);
                newWindow.document.close();
            }
        } catch (error) {
            toast.error("Error opening Client Wise Business Report");
        } finally {
            setLoadingSearch(false);
        }
    };

    const pathNameTitle = (props?.id || location.pathname?.split("/")?.slice(-1)[0])
        ?.replace(/([a-z])([A-Z])/g, "$1 $2");

    return (
        <>
            {load ? (
                <Loading />
            ) : (
                <Accordion
                    name={`Get Reports For ${pathNameTitle}`}
                    defaultValue={true}
                    isBreadcrumb={true}
                    seconTitle={secondTitle}
                >
                    <div className="row px-2 mt-2 p-1">

                        {FieldShow?.MultipleCentre && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <MultiSelectComp
                                    label="All Centre"
                                    options={CentreData}
                                    value={formData?.Centre}
                                    name="Centre"
                                    onChange={handleSelectMultiChange}
                                    lable={t("Select Centre")}
                                />
                            </div>
                        )}

                        {FieldShow?.RateType && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <ReactSelect
                                    dynamicOptions={rateType}
                                    placeholderName="All Rate Type"
                                    value={formData?.RateType}
                                    name="RateType"
                                    label="Select RateType"
                                    onChange={handleReactSelectChange}
                                    className="required-fields"
                                    removeIsClearable={true}
                                />
                            </div>
                        )}

                        {FieldShow?.MultipleRateType && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <MultiSelectComp
                                    label="All RateType"
                                    options={rateType}
                                    value={formData?.MultipleRateType}
                                    name="MultipleRateType"
                                    onChange={handleSelectMultiChange}
                                    lable={t("Select RateType")}
                                />
                            </div>
                        )}

                        {FieldShow?.MultipleDepartment && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <MultiSelectComp
                                    label="All Department"
                                    options={Department}
                                    value={formData?.MultipleDepartment}
                                    name="MultipleDepartment"
                                    onChange={handleSelectMultiChange}
                                    lable={t("Select Department")}
                                />
                            </div>
                        )}

                        {FieldShow?.FromDate && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <DatePicker
                                    className="custom-calendar"
                                    name="FromDate"
                                    value={formData?.FromDate}
                                    onChange={dateSelect}
                                    onChangeTime={handleTime}
                                    secondName={FieldShow?.FromTime ? "FromTime" : undefined}
                                    maxDate={new Date()}
                                    lable={t("FromDate")}
                                />
                            </div>
                        )}

                        {FieldShow?.FromTime && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <CustomTimePicker
                                    value={formData?.FromTime}
                                    onChange={handleTime}
                                    id="FromTime"
                                    lable="FromTime"
                                    name="FromTime"
                                    placeholder="FromTime"
                                />
                            </div>
                        )}

                        {FieldShow?.ToDate && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <DatePicker
                                    className="custom-calendar"
                                    name="ToDate"
                                    value={formData?.ToDate}
                                    onChange={dateSelect}
                                    onChangeTime={handleTime}
                                    secondName={FieldShow?.ToTime ? "ToTime" : undefined}
                                    maxDate={new Date()}
                                    minDate={new Date(formData.FromDate)}
                                    lable={t("ToDate")}
                                />
                            </div>
                        )}

                        {FieldShow?.ToTime && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <CustomTimePicker
                                    value={formData?.ToTime}
                                    onChange={handleTime}
                                    id="ToTime"
                                    lable="ToTime"
                                    name="ToTime"
                                    placeholder="ToTime"
                                />
                            </div>
                        )}

                        {FieldShow?.MultipleDoctor && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <MultiSelectComp
                                    label={t("All Doctor")}
                                    options={[{ label: "Self", value: 1 }, ...DoctorName]}
                                    value={formData?.Doctor}
                                    name="Doctor"
                                    onChange={handleSelectMultiChange}
                                    lable={t("Select Doctor")}
                                />
                            </div>
                        )}

                        {FieldShow?.MultipleUser && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <MultiSelectComp
                                    label="All Employee"
                                    options={EmployeeName}
                                    value={formData?.User}
                                    name="User"
                                    onChange={handleSelectMultiChange}
                                    lable={t("Select Employee")}
                                />
                            </div>
                        )}

                        {FieldShow?.MultipleTest && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <MultiSelectComp
                                    label={t("All Test")}
                                    options={[]}
                                    value={formData?.Test}
                                    name="Test"
                                    onChange={handleSelectMultiChange}
                                    lable={t("Select Test")}
                                />
                            </div>
                        )}

                        {FieldShow?.DiscountApprovalUser && (
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <MultiSelectComp
                                    label={t("All DiscountApprovalUser")}
                                    options={EmployeeName}
                                    value={formData?.DiscountApprovalUser}
                                    name="DiscountApprovalUser"
                                    onChange={handleSelectMultiChange}
                                    lable={t("DiscountApprovalUser")}
                                />
                            </div>
                        )}

                        <div className="col-12 col-sm-6 col-md-2 my-1">
                            <ReactSelect
                                dynamicOptions={
                                    localData?.CompanyCode === "PKL" ? summarybyPkl : summarybyall
                                }
                                name="ReportType"
                                id="ReportType"
                                removeIsClearable={true}
                                placeholderName={t("ReportType")}
                                value={formData?.ReportType}
                                onChange={handleReactSelectChange}
                                className="required-fields"
                            />
                        </div>

                        <div className="col-sm-auto d-flex align-items-center">
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={formData.OnlyDue === 1}
                                    onChange={handleToggle}
                                />
                                <span className="slider"></span>
                            </label>
                            <strong className="ml-2 mb-2">{t("Due Amount")}</strong>
                        </div>

                        <div className="row px-2 mb-2">
                            <div className="col-sm-2">
                                {loadingSearch ? (
                                    <Loading />
                                ) : (
                                    <div className="col-12 col-sm-6 col-md-2 my-1 d-flex gap-2">
                                        <CustomButton
                                            text={"PDF"}
                                            icon={"pdf"}
                                            onClick={getClientWiseBussinessReport}
                                            className="mr-2"
                                        />
                                        <CustomButton
                                            text={"Excel"}
                                            icon={"excel"}
                                            onClick={getPatientInfoReport}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Accordion>
            )}
        </>
    );
}

export default ClientWiseBusinessReport;