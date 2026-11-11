import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SearchButton } from "../../components/UI/CustomButton";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import Input from "../../components/formComponent/Input";
import SpinnerLoad from "../../components/loader/SpinnerLoad";

const OutsourceDispatchReport = () => {
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const [controllerDynamicList, setControllerDynamicList] = useState([]);
    const [tabbingOrder, setTabbingOrder] = useState([]);
    const [errors, setErrors] = useState({});
    const [CentreData, setCentreData] = useState([]);
    const [tableData, setTableData] = useState([]);
    console.log("tableData", tableData);
    const [payload, setPayload] = useState({
        FromDate: new Date(),
        ToDate: new Date(),
        CentreID: "",
        DispatchCode: "",
    });
    const [FilterData, setFilterData] = useState([]);

    const [printLoading, setPrintLoading] = useState({
        loading: false,
        index: -1,
    });

    const [headWithApiFields, setHeadWithApiFields] = useState({
        "S.No": "S.No",
        "Dispatch Code": "DispatchCode",
        "Outsource Lab Name": "LabOutsrcName",
    });

    const dateSelect = (date, name) => {
        setPayload({
            ...payload,
            [name]: date,
        });
    };
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPayload({
            ...payload,
            [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        });
    };

    const handleSelectChange = (event) => {
        const { name, value, selectedIndex } = event?.target;
        setPayload({
            ...payload,
            [name]: value,
        });
    };

    const handleReactSelectChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value?.value?.toString() }));
    };

    const controllerDynamic = async () => {
        try {
            let pageID = 1083;
            const { controllersData, controllerTabbingOrder } =
                await getSearchController(pageID);

            setTabbingOrder(controllerTabbingOrder);
            setControllerDynamicList(controllersData);
            if (Array.isArray(controllersData)) {
                setFilterData(controllersData);

                const dynamicMappings = { ...headWithApiFields };
                controllersData.forEach((column) => {
                    if (!dynamicMappings[column.ControlDisplayID]) {
                        dynamicMappings[column.ControlDisplayID] =
                            column.ApiFieldName || column.ControlDisplayID;
                    }
                });
                setHeadWithApiFields(dynamicMappings);
            }
        } catch (error) {
            console.error("error in controllerDynamic:", error);
        }
    };
    const handleSearch = () => {
        setLoading(true);
        axiosInstance
            .post("OutSourceTestToOtherLab/getOutsourceDispatchReport", {
                ...payload,
                FromDate: moment(payload?.FromDate).format("DD/MMM/YYYY"),
                ToDate: moment(payload?.ToDate).format("DD/MMM/YYYY"),
            })
            .then((res) => {
                let data = res?.data?.message;
                if (res?.data?.success === true) {
                    setTableData(data);
                    setLoading(false);
                } else {
                    setTableData([]);
                    setLoading(false);
                }

            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : err?.data?.message,
                );
                setTableData([]);
                setLoading(false);
            });
    };

    // const getAccessCentres = () => {
    //     axiosInstance
    //         .get("Centre/getAccessCentres")
    //         .then((res) => {
    //             let data = res.data.message;
    //             let CentreDataValue = data.map((ele) => {
    //                 return {
    //                     value: ele.CentreID,
    //                     label: ele.Centre,
    //                 };
    //             });
    //             CentreDataValue.unshift({ label: "Select", value: "" });
    //             setCentreData(CentreDataValue);
    //         })
    //         .catch((err) => console.error(err));
    // };

    const getAccessCentres = () => {
        axiosInstance
            .get("OutSourceLabMaster/getOutSourceLabData")
            .then((res) => {
                let data = res.data.message;
                let OutSourceLabData = data.map((ele) => {
                    return {
                        value: ele.OutSourceLabID,
                        label: ele.LabName,
                    };
                });
                OutSourceLabData.unshift({ label: "Select", value: "" });
                setCentreData(OutSourceLabData);
            })
            .catch((err) => console.error(err));
    };
    const isHideController = (cntrId = "") => {
        if (!controllerDynamicList?.length) return true;
        const isPresent = controllerDynamicList?.find(
            (x) => x?.ControlDisplayID === cntrId,
        );
        if (isPresent?.ControlDisplayID) {
            return !!controllerDynamicList?.find(
                (x) => x?.ControlDisplayID === cntrId,
            )?.IsShow;
        }
        return true;
    };

    const getPrint = async (dispatchCode, index) => {
        try {
            setPrintLoading({
                loading: true,
                index,
            });

            const response = await axiosReport.post(
                "commonReports/OutsourceLabDispatchReport",
                {
                    dispatchCode: dispatchCode,
                },
                {
                    responseType: "blob",
                }
            );

            const pdfBlob = new Blob([response.data], {
                type: "application/pdf",
            });

            const pdfUrl = window.URL.createObjectURL(pdfBlob);

            window.open(pdfUrl, "_blank");

        } catch (err) {
            console.log(err);

            toast.error(
                err?.response?.data?.message || "Failed to generate report"
            );
        } finally {
            setPrintLoading({
                loading: false,
                index: -1,
            });
        }
    };

    useEffect(() => {
        getAccessCentres();
        controllerDynamic();
    }, []);

    return (
        <>
            <Accordion
                name={t("Outsource Dispatch Report")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 pl-2 pr-2">
                    {controllerDynamicList
                        ?.filter((item) => item?.TypeId === 1 && item?.IsShow === 1)
                        ?.map((item, index) => {

                            if (
                                item?.ControlDisplayID == "FromDate" &&
                                isHideController("FromDate")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <DatePicker
                                            name="FromDate"
                                            id="FromDate"
                                            lable="From Date"
                                            className="custom-calendar"
                                            placeholder=" "
                                            value={payload?.FromDate}
                                            onChange={dateSelect}
                                            maxDate={new Date()}
                                        />
                                        {errors?.FromDate && (
                                            <div className="error-message">{errors?.FromDate}</div>
                                        )}
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID == "ToDate" &&
                                isHideController("ToDate")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <DatePicker
                                            name="ToDate"
                                            id="ToDate"
                                            className="custom-calendar"
                                            lable="To Date"
                                            placeholder=" "
                                            value={payload?.ToDate}
                                            onChange={dateSelect}
                                            maxDate={new Date()}
                                            minDate={new Date(payload.FromDate)}
                                        />
                                        {errors?.ToDate && (
                                            <div className="error-message">{errors?.ToDate}</div>
                                        )}
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID == "CentreID" &&
                                isHideController("CentreID")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <ReactSelect
                                            name="CentreID"
                                            removeIsClearable={true}
                                            dynamicOptions={CentreData}
                                            placeholderName="OutSource Lab"
                                            value={payload?.CentreID}
                                            onChange={handleReactSelectChange}
                                        />
                                    </div>
                                );
                            }
                            if (
                                item?.ControlDisplayID == "DispatchCode" &&
                                isHideController("DispatchCode")
                            ) {
                                return (
                                    <div className="col-sm-2" key={index}>
                                        <Input
                                            type="text"
                                            placeholder=""
                                            className="form-control input-sm"
                                            name="DispatchCode"
                                            id="DispatchCode"
                                            value={payload?.DispatchCode}
                                            onChange={handleChange}
                                            lable={t("Dispatch Code")}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })}

                    <div className="col-sm-auto">
                        <SearchButton text={"Search"} onClick={() => handleSearch()} />
                    </div>
                </div>
            </Accordion>
            <Accordion
                title={t("Search Details")}
                defaultValue={true}
                notOpen={true}
            >
                {tableData?.length > 0 && (
                    <>
                        <div className="row p-2">
                            <div className="col-12">
                                <Tables paginate={true} style={{ maxHeight: "400px", overflowY: "auto" }}>                                    <thead>
                                    <tr>
                                        {FilterData?.filter(
                                            (item) => item.IsShow == 1 && item.TypeId == 2,
                                        )?.map((header, idx) => {
                                            if (header?.ControlDisplayID === "S.No") {
                                                return (
                                                    <th key={idx} className="px-2">
                                                        <span className="px-2">{t("S.No")}</span>
                                                    </th>
                                                );
                                            }
                                            if (header.ControlDisplayID === "Dispatch Code") {
                                                return (
                                                    <th key={idx} className="px-2">
                                                        {t("Dispatch Code")}
                                                    </th>
                                                );
                                            }
                                            if (header.ControlDisplayID === "Outsource Lab Name") {
                                                return (
                                                    <th key={idx} className="px-2">
                                                        {t("Outsource Lab Name")}
                                                    </th>
                                                );
                                            }

                                            if (header.ControlDisplayID === "Print") {
                                                return (
                                                    <th key={idx} className="px-2">
                                                        {t("Print")}
                                                    </th>
                                                );
                                            }
                                            return (
                                                <th key={idx} className="px-2">
                                                    <span className="px-2">
                                                        {t(header.ControlDisplayName)}
                                                    </span>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>

                                    <tbody>
                                        {tableData?.map((data, rowIndex) => {
                                            return (
                                                <tr key={rowIndex}>
                                                    {FilterData?.filter(
                                                        (item) => item.IsShow == 1 && item.TypeId == 2,
                                                    )?.map((column, colIndex) => {

                                                        // S.No
                                                        if (column.ControlDisplayID === "S.No") {
                                                            return (
                                                                <td key={colIndex}>
                                                                    {rowIndex + 1}
                                                                </td>
                                                            );
                                                        }

                                                        // Dispatch Code
                                                        if (column.ControlDisplayID === "Dispatch Code") {
                                                            return (
                                                                <td key={colIndex}>
                                                                    {data?.DispatchCode}
                                                                </td>
                                                            );
                                                        }

                                                        // Outsource Lab Name
                                                        if (column.ControlDisplayID === "Outsource Lab Name") {
                                                            return (
                                                                <td key={colIndex}>
                                                                    {data?.LabOutsrcName}
                                                                </td>
                                                            );
                                                        }

                                                        if (column.ControlDisplayID === "Print") {
                                                            return (
                                                                <td key={colIndex}>
                                                                    <>
                                                                        {printLoading.loading &&
                                                                            printLoading.index === rowIndex ? (
                                                                            <SpinnerLoad />
                                                                        ) : (
                                                                            <span
                                                                                style={{
                                                                                    cursor: "pointer",
                                                                                }}
                                                                                onClick={() =>
                                                                                    getPrint(data?.DispatchCode, rowIndex)
                                                                                }
                                                                            >
                                                                                <svg
                                                                                    width="15"
                                                                                    height="15"
                                                                                    viewBox="0 0 24 24"
                                                                                    fill="none"
                                                                                    stroke="currentColor"
                                                                                    strokeWidth="2"
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                >
                                                                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                                                    <rect
                                                                                        x="6"
                                                                                        y="14"
                                                                                        width="12"
                                                                                        height="8"
                                                                                    ></rect>
                                                                                </svg>
                                                                            </span>
                                                                        )}
                                                                    </>
                                                                </td>
                                                            );
                                                        }

                                                        // Dynamic columns fallback
                                                        return (
                                                            <td key={colIndex}>
                                                                {data?.[headWithApiFields[column.ControlDisplayID]] ?? ""}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Tables>


                            </div>
                        </div>
                    </>
                )}
            </Accordion>
        </>
    );
};

export default OutsourceDispatchReport;
