import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { getAccessCentres } from "../../utils/NetworkApi/commonApi";
import Accordion from "@app/components/UI/Accordion";
import moment from "moment";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Loading from "../../components/loader/Loading";
import { getAccurateAge } from "../../utils/Constants";
import { IndexHandle } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import Pagination from "../../Pagination/Pagination";
import SendSampleDataModal from "../../components/formComponent/SendSampleDataModal";

const SendSampleToLab = () => {
    const { t } = useTranslation();

    const [ToCenter, setToCenter] = useState([]);
    const [tableData, setTableData] = useState([]);

    const [load, setLoad] = useState({
        searchLoad: false,
    });

    const [payload, setPayload] = useState({
        ToCentre: "",
        FromDate: new Date(),
        ToDate: new Date(),
        FromTime: "00:00:00",
        ToTime: "23:59:59",
        DispatchCode: "",
    });

    console.log(payload, "fpaylaod")

    const [pageSize, setPageSize] = useState(50);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [showCancelModal, setShowCancelModal] = useState({
        modal: false,
        data: "",
        index: -1,
    });

    const handleSearchSelectChange = (name, value) => {
        setPayload((prev) => ({ ...prev, [name]: value?.value }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const dateSelect = (value, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTime = (time, name) => {
        setPayload((prev) => ({
            ...prev,
            [name]: time,
        }));
    };

    const handleSearch = () => {
        if (!payload?.ToCentre) {
            toast.error("Please Select ToCentre");
            return
        }
        try {
            axiosInstance
                .post("SendSampleToLab/SearchDataToSendSampleBydispatch", {
                    ToCentre: String(payload?.ToCentre),
                    FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
                    ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
                    ToTime: payload?.ToTime,
                    DispatchCode: payload?.DispatchCode,
                    FromTime: payload?.FromTime,
                })
                .then((res) => {
                    const data = res?.data?.message || [];
                    if (data?.length > 0) {
                        setTableData(data);
                        setTotalCount(res?.data?.data?.totalRecords || 0);
                    } else {
                        setTableData([]);
                        setTotalCount(0);
                        toast.error("No Data Found");
                    }
                    setLoad((prev) => ({
                        ...prev,
                        searchLoad: false,
                    }));
                })
                .catch((err) => {
                    console.log(err)
                    toast.error(
                        err?.response?.data?.message || "Error Occured"
                    );

                    setLoad((prev) => ({
                        ...prev,
                        searchLoad: false,
                    }));
                });
        } catch (error) {
            console.log(error)
        }
    };

    const handlePrint = async (dispatchCode) => {
        const printWindow = window.open("", "_blank");

        try {
            const response = await axiosReport.post(
                "commonReports/SendSampleDispatchReport",
                { DispatchCode: dispatchCode },
                {
                    responseType: "blob",
                    headers: { Accept: "application/pdf" },
                }
            );

            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            printWindow.location.href = fileURL;
        } catch (err) {
            printWindow.close();
            console.error(err);
            toast.error("Print failed");
        }
    };

    const handleCancelModalClose = () => {
        setShowCancelModal({
            modal: false,
            data: "",
            index: -1,
        });
    };

    const handleDelete = async (row) => {
        const dispatchCode = row?.DispatchCode;

        if (!dispatchCode) {
            toast.error("Dispatch Code not found");
            return;
        }

        try {
            const res = await axiosInstance.post(
                `SendSampleToLab/DeleteDispatchSample?dipatchCode=${dispatchCode}`
            );

            toast.success(res?.data?.message || "Dispatch sample cancelled successfully");
            setTableData(tableData?.filter((item) => item?.DispatchCode !== dispatchCode));
            handleCancelModalClose();
        } catch (err) {
            console.log(err);
            toast.error(err?.response?.data?.message || "Error Occured");
        }
    };

    // const handlePrint = async (dispatchCode) => {
    //     try {
    //         const response = await axiosReport.post(
    //             "commonReports/SendSampleDispatchReport",
    //             { DispatchCode: dispatchCode },
    //             {
    //                 responseType: "blob",
    //                 headers: { Accept: "application/pdf" },
    //             }
    //         );
    //         const file = new Blob([response.data], { type: "application/pdf" });
    //         const fileURL = URL.createObjectURL(file);
    //         printWindow.location.href = fileURL;
    //     }
    //     catch (err) {
    //         console.log(err);

    //         toast.error(
    //             err?.response?.data?.message
    //         );
    //     }
    // };

    useEffect(() => {
        getAccessCentres(setToCenter);
    }, []);

    return (
        <>
            <SendSampleDataModal
                visible={showCancelModal?.modal}
                row={showCancelModal?.data}
                onClose={handleCancelModalClose}
                onConfirm={handleDelete}
            />

            <Accordion
                name={t("Dispatch Send Sample To Lab")}
                isBreadcrumb={true}
                defaultValue={true}
            >
                <div className="row px-2 mt-2 align-items-end">

                    <div className="col-lg-2 col-md-3 col-sm-6 mb-2">
                        <ReactSelect
                            dynamicOptions={ToCenter}
                            name="ToCentre"
                            lable={t("ToCentre")}
                            id="ToCentre"
                            removeIsClearable={true}
                            placeholderName={t("Centre")}
                            value={payload?.ToCentre}
                            onChange={handleSearchSelectChange}
                            className="required-fields"
                        />
                    </div>   


                    
                    <div className="col-lg-2 col-md-3 col-sm-6 mb-2">
                        <DatePicker
                            className="custom-calendar"
                            name="FromDate"
                            value={payload?.FromDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="FromDate"
                            lable="FromDate"
                            maxDate={new Date(payload?.ToDate)}
                        />
                    </div>

                    <div className="col-lg-2 col-md-3 col-sm-6 mb-2">
                        <DatePicker
                            className="custom-calendar"
                            name="ToDate"
                            value={payload?.ToDate}
                            onChange={dateSelect}
                            placeholder=" "
                            id="ToDate"
                            lable="ToDate"
                            maxDate={new Date()}
                        />
                    </div>

                    <div className="col-lg-1 col-md-3 col-sm-6 mb-2">
                        <CustomTimePicker
                            name="FromTime"
                            placeholder="FromTime"
                            value={payload?.FromTime}
                            id="FromTime"
                            lable="FromTime"
                            onChange={handleTime}
                        />
                    </div>

                    <div className="col-lg-1 col-md-3 col-sm-6 mb-2">
                        <CustomTimePicker
                            name="ToTime"
                            placeholder="ToTime"
                            value={payload?.ToTime}
                            id="ToTime"
                            lable="ToTime"
                            onChange={handleTime}
                        />
                    </div>

                    <div className="col-lg-2 col-md-4 col-sm-6 mb-2">
                        <Input
                            lable="Dispatch Code"
                            id="DispatchCode"
                            name="DispatchCode"
                            placeholder=""
                            value={payload?.DispatchCode}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="col-lg-1 col-md-2 col-sm-6 mb-2">
                        {/* {load?.searchLoad ? (
                            <Loading />
                        ) : ( */}
                        <SearchButton
                            text={"Search"}
                            onClick={handleSearch}
                        />
                        {/* )} */}
                    </div>

                </div>
            </Accordion>
            <Accordion title={t("Search Data")} defaultValue={true}>
                {tableData?.length > 0 ? (
                    <div className="row px-1">
                        <div className="col-12">

                            <Tables>
                                <thead className="cf">
                                    <tr>
                                        <th style={{ width: "70px" }}>{t("S.No")}</th>
                                        <th>{t("Dispatch Code")}</th>
                                        <th>{t("Field Boy Name")}</th>
                                        <th>{t("Centre Name")}</th>
                                        <th>{t("Send Date")}</th>
                                        <th className="text-center" style={{ width: "100px" }}>
                                            {t("Print")}
                                        </th>
                                        <th className="text-center" style={{ width: "100px" }}>
                                            {t("Cancel")}
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {tableData?.map((data, index) => (
                                        <tr key={index}>

                                            <td data-title={t("S.No")}>
                                                {index + 1}
                                            </td>

                                            <td data-title={t("Dispatch Code")}>
                                                {data?.DispatchCode || "-"}
                                            </td>

                                            <td data-title={t("Field Boy Name")}>
                                                {data?.FieldBoyName || "-"}
                                            </td>

                                            <td data-title={t("Centre Name")}>
                                                {data?.CentreName || "-"}
                                            </td>

                                            <td data-title={t("Send Date")}>
                                                {data?.SendDate || "-"}
                                            </td>

                                            <td
                                                data-title={t("Print")}
                                                className="text-center align-middle"
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handlePrint(data?.DispatchCode)}
                                                    title="Print PDF"
                                                >
                                                    <i className="fa fa-print"></i>
                                                </button>
                                            </td>
                                            <td
                                                data-title={t("Cancel")}
                                                className="text-center align-middle"
                                            >
                                                <CustomButton
                                                    icon="cancel"
                                                    variant="danger"
                                                    onClick={() =>
                                                        setShowCancelModal({
                                                            modal: true,
                                                            data,
                                                            index,
                                                        })
                                                    }
                                                    title="cancel"
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
            </Accordion>

            <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 w-full">

                {totalCount > 25 && (
                    <>
                        <div style={{ minWidth: "150px" }}>
                            <ReactSelect
                                value={pageSize}
                                dynamicOptions={[
                                    { label: "25", value: 25 },
                                    { label: "50", value: 50 },
                                    { label: "100", value: 100 },
                                    { label: "150", value: 150 },
                                ]}
                                name={"pageSize"}
                                label={t("pageSize")}
                                removeIsClearable={true}
                            // onChange={(name, value) => {
                            //     setPageSize(value?.value);
                            //     setCurrentPage(1);
                            //     handleSearch(1, value?.value);
                            // }}
                            />
                        </div>

                        {totalCount > pageSize && (
                            <Pagination
                                className="pagination-bar"
                                currentPage={currentPage}
                                totalCount={totalCount}
                                pageSize={pageSize}
                            // onPageChange={(page) => {
                            //     setCurrentPage(page);
                            //     handleSearch(page, pageSize);
                            // }}
                            />
                        )}
                    </>
                )}

            </div>
        </>
    );
};

export default SendSampleToLab;
