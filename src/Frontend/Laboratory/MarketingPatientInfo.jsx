import React, { useEffect, useState } from 'react'
import Accordion from '../../components/UI/Accordion';
import ReactSelect from '../../components/formComponent/ReactSelect';
import { useTranslation } from 'react-i18next';
import { getAccessCentres } from '../../utils/NetworkApi/commonApi';
import { axiosInstance } from '../../utils/axiosInstance';
import Input from "../../components/formComponent/Input";
import { number } from '../../utils/helpers';
import Form from "react-bootstrap/Form";
import { CustomButton } from '../../components/UI/CustomButton';
import NoRecordFound from '../../components/formComponent/NoRecordFound';
import Heading from '../../components/UI/Heading';
import Tables from '../../components/UI/customTable';
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { toast } from 'react-toastify';
import { height } from '@mui/system';
import DatePicker from '../../components/formComponent/DatePicker';
import moment from 'moment';
import Pagination from '../../Pagination/Pagination';
import MarketingMsgModal from './MarketingMsgModal';

const MarketingPatientInfo = () => {
    const { t } = useTranslation();
    const [CentreData, setCentreData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [CountyData, setCountyData] = useState([]);
    const [SubCountyData, setSubCountyData] = useState([]);
    const [Gender, setGender] = useState([]);
    const [SampleTypeData, setSampleTypeData] = useState([]);
    const [activeData, setActiveData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [message, setMessage] = useState("");
    const [show, setShow] = useState(false);
    const [payload, setPayload] = useState({
        CentreID: [],
        County: [],
        SubCounty: [],
        Village: "",
        Gender: "",
        Age: "",
        SampleType: [],
        Specifictest: "",
        Diagnosis: "",
        // MobileNo: "",
        MobileConsent: "",
        fromDate: new Date(),
        toDate: new Date(),
    });

    const SpecificTestData = [
        { label: "Positive", value: "Positive" },
        { label: "Negative", value: "Negative" },
        { label: "Both", value: "Both", },
    ];

    const MobileConsentData = [
        { label: "Yes", value: "1" },
        { label: "No", value: "0" },
    ];

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (name, option) => {
        setPageSize(option.value);
        setCurrentPage(1);
    };

    const handleShow = () => setShow(true);

    const handleSearchSelectChange = (label, value) => {
        setPayload({
            ...payload,
            [label]: value?.value,
        });
    };

    const handleSelectMultiChange = (select, name) => {

        if (name === "CentreID") {
            const val = select?.map((ele) => ele?.value);
            if (val.length > 0) {
                setPayload({ ...payload, [name]: val });
            } else {
                setPayload({ ...payload, CentreID: "" });
            }
        }
        if (name === "SampleType") {
            const val = select?.map((ele) => ele?.value);
            if (val.length > 0) {
                setPayload({ ...payload, [name]: val });
            } else {
                setPayload({ ...payload, SampleType: "" });
            }
        }
        if (name === "County") {
            console.log(select);
            const val = select.map((ele) => {
                return ele?.value;
            });
            console.log(val);
            setPayload({ ...payload, [name]: val, SubCounty: "" });
            if (val.length > 0) {
                fetchCities(val);
            } else {
                setPayload({ ...payload, County: "", SubCounty: "" });
                setSubCountyData([]);
            }
        } else if (name === "SubCounty") {
            const val = select?.map((ele) => ele?.value);
            if (val.length > 0) {
                setPayload({ ...payload, [name]: val });
            } else {
                setPayload({ ...payload, SubCounty: "" });
            }
        }
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({ ...prev, [name]: value }));
    };
    const handleInputChange = (e) => {
        const { name, value, checked, type } = e.target;
        setPayload((payload) => ({
            ...payload,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };
    const fetchStates = () => {
        axiosInstance
            .post("CommonHC/GetStateData", {
                BusinessZoneID: 0,
            })
            .then((res) => {
                let data = res.data.message;
                let value = data.map((ele) => {
                    return {
                        value: ele.ID,
                        label: ele.State,
                        id: ele.ID,
                    };
                });
                console.log(data);
                setCountyData(value);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : "Error Occured",
                );
            });
    };

    const fetchCities = (id) => {
        const postdata = {
            StateId: Array.isArray(id) ? id : [Number(id)],
        };
        axiosInstance
            .post("CommonHC/GetCityData", postdata)
            .then((res) => {
                let data = res.data.message;
                let value = data.map((ele) => {
                    return {
                        value: ele.ID,
                        label: ele.City,
                    };
                });
                setSubCountyData(value);
            })
            .catch((err) => {
                setLoading(false);
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : "Error Occured",
                );
            });
    };

    const getDropDownData = (name) => {
        axiosInstance
            .post("Global/getGlobalData", { Type: name })
            .then((res) => {
                let data = res.data.message;
                let value = data.map((ele) => {
                    return {
                        value: ele.FieldDisplay,
                        label: ele.FieldDisplay,
                    };
                });

                switch (name) {
                    case "Gender":
                        const extractedGenders = value
                            ?.filter((option) => option?.value != "Other")
                            .map((option) => {
                                return {
                                    value: option?.value,
                                    label: option?.label,
                                };
                            });

                        setGender(extractedGenders);
                        break;
                }
            })
            .catch((err) => console.log(err));
    };


    const getSampleType = () => {
        axiosInstance
            .get("SampleType/getSampleTypeByInvestigation")
            .then((res) => {
                let data = res.data.message;

                let SampleType = data.map((ele) => {
                    return {
                        value: ele.id,
                        label: ele.SampleName,
                    };
                });
                return setSampleTypeData(SampleType);

            })
            .catch((err) => console.log(err));
    };



    const handleSearch = () => {
        const data = {
            centre: payload.CentreID && payload.CentreID.length > 0 ? payload.CentreID : [],
            county: payload.County && payload.County.length > 0 ? payload.County : [],
            subCounty: payload.SubCounty?.length > 0
                ? payload.SubCounty.map(item => Number(item.split("#")[0]))
                : [],
            village: payload.Village,
            gender: payload.Gender,
            age: payload.Age,
            sampleType: payload.SampleType && payload.SampleType.length > 0 ? payload.SampleType : [],
            // specificTest: payload.Specifictest,
            // diagnosis: payload.Diagnosis,
            fromDate: moment(payload.fromDate).format("YYYY-MM-DD"),
            toDate: moment(payload.toDate).format("YYYY-MM-DD"),
            IsConcent: payload.MobileConsent,

        };
        axiosInstance
            .post("Accounts/SearchMarketpatientdetails", data)
            .then((res) => {
                setActiveData(res.data.response);
                if (flag) setCurrentPage(1);
                toast.success(res.data.response);
            })
            .catch((err) => {
                toast.error(err?.response?.data?.response);
            });
    };
    useEffect(() => {
        getDropDownData("Gender");
        getAccessCentres(setCentreData);
        getSampleType();
        fetchStates();
    }, []);

    const handleallCheck = (e) => {
        const checked = e.target.checked;

        const updatedData = activeData.map((item) => ({
            ...item,
            checked: item?.mobile ? checked : false,
        }));

        setActiveData(updatedData);
    };

    const handleCheck = (e, rowData) => {
        const checked = e.target.checked;

        const updatedData = activeData.map((item) =>
            item?.ledgerTransactionID === rowData?.ledgerTransactionID
                ? { ...item, checked: checked }
                : item
        );

        setActiveData(updatedData);
    };


    const handleSend = async (msg) => {
        if (activeData.filter(item => item.checked).length === 0) {
            toast.error("Please Select At Least One Record To Send SMS.");
            return;
        }
        const selectedIds = activeData
            .filter((item) => item.checked)
            .map((item) => item.ledgerTransactionID);
        try {

            const res = await axiosInstance.post("Accounts/InsertSms", {
                ledgerTransactionID: selectedIds.map(Number),
                Message: msg,
            });
            toast.success(res.data.message);
            console.log(res.data);
            handleSearch();

        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div>
            {show && (
                <MarketingMsgModal
                    show={show}
                    onHandleShow={handleShow}
                    onhide={() => { setShow(false) }}
                    onSuccess={(msg) => {
                        handleSend(msg);
                        setShow(false);
                    }}
                />
            )}
            <Accordion
                name={t("Marketing Patient Information")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2 mb-2">
                    <div className="col-sm-2">
                        <SelectBoxWithCheckbox
                            options={CentreData}
                            name="CentreID"
                            lable={t("Centre")}
                            id="CentreID"
                            removeIsClearable={true}
                            //placeholderName={t("Centre")}
                            value={payload?.CentreID}
                            onChange={handleSelectMultiChange}
                            //className="required-fields"
                        />
                    </div>
                    <div className="col-sm-2">
                        <SelectBoxWithCheckbox
                            name="County"
                            onChange={handleSelectMultiChange}
                            options={CountyData}
                            placeholder=" "
                            lable="Select County"
                            //className="required-fields"
                            id="County"
                            value={payload?.County}
                        />
                    </div>
                    <div className="col-sm-2">
                        <SelectBoxWithCheckbox
                            name="SubCounty"
                            onChange={handleSelectMultiChange}
                            options={SubCountyData}
                            placeholder=" "
                            lable="Select SubCounty"
                            //className="required-fields"
                            id="SubCounty"
                            value={payload?.SubCounty}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            type="text"
                            id="Village"
                            name="Village"
                            value={payload?.Village}
                            lable="Village"
                            placeholder=""
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            id="Age"
                            type="number"
                            name="Age"
                            maxLength={3}
                            lable="Age"
                            value={payload.Age}
                            onInput={(e) => number(e, 3)}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-md-2 col-sm-3 col-12">
                        <DatePicker
                            className="custom-calendar"
                            name="fromDate"
                            id="fromDate"
                            placeholder="From Date"
                            lable={t("From Date")}
                            type="date"
                            value={payload.fromDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="col-md-2 col-sm-3 col-12">
                        <DatePicker
                            className="custom-calendar"
                            name="toDate"
                            id="toDate"
                            placeholder="To Date"
                            lable={t("To Date")}
                            type="date"
                            value={payload.toDate}
                            onChange={dateSelect}
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select Gender", value: "" }, ...Gender]}
                            name="Gender"
                            lable="Gender"
                            id="Gender"
                            //className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("Gender")}
                            value={payload?.Gender}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <SelectBoxWithCheckbox
                            options={SampleTypeData}
                            name="SampleType"
                            lable="Sample Type"
                            id="SampleType"
                            //className="required-fields"
                            removeIsClearable={true}
                            //placeholderName={t("Sample Type")}
                            value={payload?.SampleType}
                            onChange={handleSelectMultiChange}
                        />
                    </div>
                    {/* <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select Specific Test", value: "" }, ...SpecificTestData]}
                            name="Specifictest"
                            lable="Specific Test"
                            id="SpecificTest"
                            className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("Specific Test")}
                            value={payload?.Specifictest}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <Input
                            id="Diagnosis"
                            type="text"
                            name="Diagnosis"
                            maxLength={20}
                            lable="Diagnosis"
                            value={payload.Diagnosis}
                            onChange={handleInputChange}
                        />
                    </div> */}
                    <div className="col-sm-2">
                        <ReactSelect
                            dynamicOptions={[{ label: "Select Mobile Consent", value: "" }, ...MobileConsentData]}
                            name="MobileConsent"
                            lable="Mobile Consent"
                            id="MobileConsent"
                            //className="required-fields"
                            removeIsClearable={true}
                            placeholderName={t("Mobile Consent")}
                            value={payload?.MobileConsent}
                            onChange={handleSearchSelectChange}
                        />
                    </div>
                    <div className="col-sm-1 justify-content-end">
                        <CustomButton
                            text={t("Search")}
                            icon="Search"
                            className="btn btn-block btn-success btn-sm "
                            onClick={handleSearch}
                        />
                    </div>
                    {activeData.length > 0 && (
                        <div className="col-sm-1 justify-content-end">
                            <CustomButton
                                text={t("Send")}
                                icon="send"
                                className="btn btn-block btn-success btn-sm "
                                onClick={handleShow}
                            />
                        </div>
                    )}
                </div>
            </Accordion>
            <div className="mt-2">
                <Accordion title={t("Search Results")} defaultValue={true}>
                    {activeData.length > 0 ? (
                        <div className="row px-1">
                            <div className="col-12">
                                <Tables
                                    style={{
                                        maxHeight: "400px",
                                        overflowY: "auto",
                                    }}
                                >
                                    <thead className="cf">
                                        <tr>
                                            <th>{t("S.No")}</th>
                                            <th>{t("Centre")}</th>
                                            <th>{t("PatientName")}</th>
                                            <th>{t("UHID")}</th>
                                            <th>{t("Registration Date")}</th>
                                            <th>{t("Age")}</th>
                                            <th>{t("Gender")}</th>
                                            <th>{t("Mobile")}</th>
                                            {/* <th>{t("country")}</th> */}
                                            <th>{t("county")}</th>
                                            <th>{t("subCounty")}</th>
                                            <th>{t("Mobile consent")}</th>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        activeData.every((item) => item.checked)
                                                    }
                                                    name="selectAll"
                                                    id="selectAll"
                                                    onChange={handleallCheck}
                                                />
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeData
                                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                                            .map((data, index) => (
                                                <tr key={index} style={{ backgroundColor: data.rowColor }}>
                                                    <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                                    <td>{data?.centre}</td>
                                                    <td>{data?.patientName}</td>
                                                    <td>{data?.uhid}</td>
                                                    <td>{data?.registrationDate}</td>
                                                    <td>{data?.age}</td>
                                                    <td>{data?.gender}</td>
                                                    <td>{data?.mobile}</td>
                                                    <td>{data?.conty}</td>
                                                    <td>{data?.subCounty}</td>
                                                    <td>{data?.mobileConsent === 1 ? "Yes" : "No"}</td>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={data?.checked || false}
                                                            disabled={!data?.mobile}
                                                            onChange={(e) => handleCheck(e, data)}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </Tables>
                            </div>
                        </div>
                    ) : (
                        <NoRecordFound />
                    )}
                    {activeData.length > 25 && (
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
                                currentPage={currentPage} Z
                                totalCount={activeData.length}
                                pageSize={pageSize}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </Accordion>
            </div>
        </div>
    )
}

export default MarketingPatientInfo
