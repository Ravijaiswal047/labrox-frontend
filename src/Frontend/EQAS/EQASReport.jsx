import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import EqasMenuList from "./EqasMenuList";
import CustomTable from "../../components/Table/CustomTable";
import Input from "../../components/formComponent/Input";
import { ViewMenu } from "../../components/SvgIcons";
import { CiCirclePlus } from "react-icons/ci";
import './Eqas.css'
import Modal from "../../components/ModalComponent/Modal";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { setCheckListData, setOpenCheckListModal, setTypeModalData, setTypeModalOpen } from "../../store/reducers/eqasSlice/eqasSlice";
import EqasCheckListPopup from "./EqasCheckListPopup.jsx";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch.jsx";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice.js";
import { getAllCentreService, getEqasPrograms } from "../../utils/NetworkApi/commonApi.js";
import { notify } from "../../utils/utils.js";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance.jsx";
import { apiUrls } from "../../utils/apiUrls.js";
import { months, years } from "../../utils/Constants.jsx";
import { CustomButton } from "../../components/UI/CustomButton.jsx";
import { validateRequiredFields } from "../../utils/helpers.js";

const EqasReport = () => {
    const [t] = useTranslation();
    const dispatch = useDispatch()
    const [showMenu, setShowMenu] = useState(false);
    const [errors, setErrors] = useState({});
    const date = new Date();

    const [dropdownlist, setDropdownlist] = useState({
        centreList: [],
        eqasPrograms: [],
        paramList: [],
    });
    const [payload, setPayload] = useState({
        centre: "",
        centreName: "",
        EqasProgram: "",
        month: date.getMonth() + 1,
        year: date.getFullYear().toString(),
        Parameter: "",
        tomonth: date.getMonth() + 1,
        toyear: date.getFullYear().toString(),
    });

    const [data, setData] = useState();

    // Search dropdown options
    const processingLabs = [
        { label: "AP-Andhra Labs-Guntur", value: "119" },
        { label: "AP-East & West Godavari", value: "21" },
        { label: "AP-Guntur", value: "24" },
        { label: "AP-HLM-MIMS-Vizianagaram", value: "40" },
        { label: "AP-HLM-Srikara-VJWD", value: "91" },
    ];

    // Update handler for search filters
    const handleSearchChange = (name, e) => {
        let value = e?.value;
        setPayload((prev) => ({ ...prev, [name]: value }));
        if (name === 'centre') {
            getEqasPrograms(e?.value, (data) => {
                setDropdownlist((prev) => ({
                    ...prev,
                    eqasPrograms: data,
                }));
            });
        }
        if (name === 'EqasProgram') {
            BindParams(e?.value)
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPayload((prev) =>
        ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const getAllCentre = async () => {
        dispatch(setLoading(true));

        try {
            const centreList = await getAllCentreService();

            if (centreList.length > 0) {
                setDropdownlist((prev) => ({
                    ...prev,
                    centreList,
                }));

                setPayload((prev) => ({
                    ...prev,
                    centre: centreList[0].value,
                    centreName: centreList[0].label,
                }));
                getEqasPrograms(centreList?.[0]?.value, (data) => {
                    setDropdownlist((prev) => ({
                        ...prev,
                        eqasPrograms: data,
                    }));
                });
            }
        } catch (err) {
            notify(err?.response?.data?.message || "Something went wrong", "error");
        } finally {
            dispatch(setLoading(false));
        }
    };

    const BindParams = async (eqasProgram = 0) => {
        dispatch(setLoading(true));
        const apiPayload = {
            programId: eqasProgram || payload?.EqasProgram || 0
        }
        await axiosInstance
            .post(apiUrls.BindProgramParam, apiPayload)
            .then((res) => {
                console.log("res", res?.data);
                if (res?.data?.success) {
                    const paramList = res?.data?.data?.map((item) => ({
                        ...item,
                        label: item?.InvestigationName,
                        value: item?.InvestigationID,
                    }));
                    setDropdownlist((prev) => ({ ...prev, paramList }))
                }
            })
            .catch((err) => {
                notify(err?.data?.message, "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    const handleReset = () => {
        setPayload({
            centre: "",
            centreName: "",
            EqasProgram: "",
            month: date.getMonth() + 1,
            year: date.getFullYear().toString(),
            Parameter: "",
            tomonth: date.getMonth() + 1,
            toyear: date.getFullYear().toString(),
        })
        setErrors({});
    }

    const getReport = async () => {
        const requiredFields = [
            "centre",
            "EqasProgram",

        ];
        const errors = validateRequiredFields(payload, requiredFields);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }
        const investigationIdString = dropdownlist?.paramList
            .map(item => item.InvestigationID)
            .join(",");
        dispatch(setLoading(true));
        const apiPayload = {
            pCentre: payload?.centre?.toString() || "",
            pid: payload?.EqasProgram?.toString() || "",
            cMonth: payload?.month?.toString() || "",
            cYear: payload?.year?.toString() || "",
            investigationID: payload?.Parameter?.toString() || investigationIdString || "",
            toMonth: payload?.tomonth?.toString() || "",
            toYear: payload?.toyear?.toString() || "",
        }
        await axiosReport
            .post("commonReports/EQASSummaryPdf", apiPayload,
                {
                    responseType: "blob", // 🔥 REQUIRED
                }
            )
            .then((res) => {
                console.log("resxxx", res);
                const pdfBlob = new Blob([res.data], { type: "application/pdf" });
                pdfBlob.text().then((text) => {
                    if (text.includes("No Data") || text.includes("No Report")) {
                        notify("No report found", "warning");
                        return;
                    }
                })
                const pdfUrl = URL.createObjectURL(pdfBlob);

                window.open(pdfUrl, "_blank");

            })
            .catch((err) => {
                notify(err?.data?.message || "No Report Found", "error");
            })
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    useEffect(() => {
        getAllCentre();
    }, []);

    console.log("payload", payload);
    console.log("paramList", dropdownlist?.paramList);

    return (
        <>
            {showMenu && <EqasMenuList />}

            <Heading
                title={"EQAS Report"}
                secondTitle={
                    <label onClick={() => setShowMenu((prev) => !prev)}>
                        <ViewMenu />
                    </label>
                }
            />

            <div className="main_resurlt_entry card py-2 px-2">
                {/* Search Filters */}
                <div className="row mb-3">
                    <div className="col-sm-3 col-md-2 col-12">
                        <ReactSelect
                            dynamicOptions={dropdownlist?.centreList}
                            name="centre"
                            id="centre"
                            removeIsClearable={false}
                            placeholderName={t("Centre")}
                            value={payload?.centre}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                        {payload?.centre === "" && (
                            <span className="error-message">{errors?.centre}</span>
                        )}
                    </div>
                    <div className="col-sm-3 col-md-2 col-12">
                        <ReactSelect
                            dynamicOptions={dropdownlist?.eqasPrograms}
                            name="EqasProgram"
                            id="EqasProgram"
                            removeIsClearable={false}
                            placeholderName={t("EQAS Program")}
                            value={payload?.EqasProgram}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                        {payload?.EqasProgram === "" && (
                            <span className="error-message">{errors?.EqasProgram}</span>
                        )}
                    </div>
                    <div className="col-sm-3 col-md-2 col-12">
                        <ReactSelect
                            dynamicOptions={dropdownlist?.paramList}
                            name="Parameter"
                            id="Parameter"
                            removeIsClearable={false}
                            placeholderName={t("Parameter")}
                            value={payload?.Parameter}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                    </div>
                    <div className="col-sm-3 col-md-1 col-12 ">


                        <ReactSelect
                            dynamicOptions={months}
                            name="month"
                            id="month"
                            removeIsClearable={false}
                            placeholderName={t("From Month")}
                            value={payload?.month}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                    </div>

                    <div className="col-sm-3 col-md-1 col-12 ">
                        <ReactSelect
                            dynamicOptions={years}
                            name="year"
                            id="year"
                            removeIsClearable={false}
                            placeholderName={t("From year")}
                            value={payload?.year}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                    </div>


                    {/* To Month / Year */}
                    <div className="col-sm-3 col-md-1 col-12 ">
                        <ReactSelect
                            dynamicOptions={months}
                            name="tomonth"
                            id="tomonth"
                            removeIsClearable={false}
                            placeholderName={t("To Month")}
                            value={payload?.tomonth}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                    </div>

                    <div className="col-sm-3 col-md-1 col-12 ">
                        <ReactSelect
                            dynamicOptions={years}
                            name="toyear"
                            id="toyear"
                            removeIsClearable={false}
                            placeholderName={t("To year")}
                            value={payload?.toyear}
                            onChange={handleSearchChange}
                            className="required-fields"
                        />
                    </div>

                    {/* <div className="col-sm-3 col-md-2"> */}
                        {/* <Button className="px-4 mr-2 ml-2">Get Report</Button> */}
                        <CustomButton text="Report" icon="pdf" onClick={getReport} className="mx-2"/>
                        <CustomButton text="Reset" icon="refresh" onClick={handleReset} className="mx-2" />
                    {/* </div> */}
                </div>

            </div>
        </>
    );
};

export default EqasReport;


