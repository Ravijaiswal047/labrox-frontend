import React, { useEffect, useState } from "react";
import ExcelPreviewHandler from "./ExcelPreviewHandler";
import { Button } from "react-bootstrap";
// import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { notify } from "../../../utils/utils";
import { ExportToExcel } from "../../../utils/helpers";
import {
    setImportExcelData,
    setLoading,
} from "../../../store/reducers/loadingSlice/loadingSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { CustomButton } from "../../../components/UI/CustomButton";

const ExcelImportForDoctorShare = ({ RateData = [], DoctorData = [] }) => {
    const dispatch = useDispatch();
    const { importExcelData } = useSelector((data) => data?.loadingSlice);
    console.log("importExcelData", importExcelData);
    const [resetKey, setResetKey] = useState(0);

    const [t] = useTranslation();
    const initPayload = {
        doctorId: "",
        rateid: "",
    };
    const [payload, setPayload] = useState(initPayload);

    const handleReactChange = (name, e) => {
        setPayload((prev) => ({ ...prev, [name]: e?.value }));
    };
    
    const formatDataForExcel = (data) => {
        return data.map((item) => {
            const newItem = {};

            Object.keys(item).forEach((key) => {
                // 👉 Header capital
                const newKey = key.charAt(0).toUpperCase() + key.slice(1);

                let value = item[key];

                // 👉 Agar number hai to string bana do
                if (typeof value === "number") {
                    value = value.toString();
                }

                newItem[newKey] = value;
            });

            return newItem;
        });
    };
    const getDownloadExcelData = async () => {
        if (!payload?.doctorId) {
            notify("Kindly Select Doctor", "error");
            return;
        }
        if (!payload?.rateid) {
            notify("Kindly Select RateType", "error");
            return;
        }

        const downloadPayload = {
            doctorId: String(payload?.doctorId),
            rateid: String(payload?.rateid)
        };

        dispatch(setLoading(true));

        await axiosInstance
            .post("DoctorShare/GetSharedetail", downloadPayload)
            .then((res) => {
                if (Array.isArray(res?.data?.message)) {

                    const data = res.data.message;
                    const first = data[0];

                    // ✅ Build meaningful filename
                    let fileName = `${first?.doctorName}_${first?.rateTypeName}_${first?.panelCode}`;

                    // 👉 Replace spaces with dash
                    fileName = fileName.replace(/\s+/g, "-");

                    // 👉 Remove special characters
                    fileName = fileName.replace(/[^a-zA-Z0-9-]/g, "");

                    // 👉 Remove multiple dashes
                    fileName = fileName.replace(/-+/g, "-");

                    // 👉 Trim dash from start/end
                    fileName = fileName.replace(/^-+|-+$/g, "");

                    // 👉 Add extension
                    fileName = `${fileName}.xlsx`;

                    const formattedData = formatDataForExcel(data);
                    ExportToExcel(formattedData, fileName);

                    notify("Download successfully.", "success");
                    return;
                }

                notify(res?.data?.message, "error");
            })
            .catch((err) => console.log(err))
            .finally(() => {
                dispatch(setLoading(false));
            });
    };

    // const saveImported = async () => {
    //     if (importExcelData?.length === 0) {
    //         notify("Kindly import excel data", "warn");
    //         return;
    //     }
    //     dispatch(setLoading(true));
    //     try {
    //         const cleanedData = importExcelData.map((item) => {
    //             const newItem = { ...item };
    //             delete newItem.doctorID;
    //             delete newItem.rateTypeID;
    //             return newItem;
    //         });
    //         const res = await axiosInstance.post(
    //             "DoctorShare/SaveDoctorShareList",
    //             {
    //                 DoctorID: importExcelData?.[0]?.doctorID,
    //                 RateTypeID: importExcelData?.[0]?.rateTypeID,
    //                 Data: cleanedData
    //             }
    //         );
    //         notify(res?.data?.message || "Excel uploaded successfully", "success");
    //         setResetKey(prev => prev + 1);
    //         dispatch(setImportExcelData([]));
    //         setPayload(initPayload);
    //     } catch (err) {
    //         console.log("err", err);
    //         notify(err?.response?.data?.message || "Upload failed", "error");
    //     } finally {
    //         dispatch(setLoading(false));
    //     }
    // };

    const saveImported = async () => {
        if (importExcelData?.length === 0) {
            notify("Kindly import excel data", "warn");
            return;
        }
        dispatch(setLoading(true));
        try {
            // const cleanedData = importExcelData.map((item) => {
            //     const newItem = { ...item };
            //     delete newItem.doctorID;
            //     delete newItem.rateTypeID;
            //     return newItem;
            // });
            const res = await axiosInstance.post(
                "DoctorShare/SaveDoctorShareList",
                {
                    // DoctorID: importExcelData?.[0]?.doctorID,
                    // RateTypeID: importExcelData?.[0]?.rateTypeID,
                    Data: importExcelData
                }
            );

            const apiResponse = res?.data?.result;
            if (apiResponse?.success) {
                notify(apiResponse?.message);
                setResetKey(prev => prev + 1);
                dispatch(setImportExcelData([]));
                setPayload(initPayload);
            } else {
                notify(apiResponse?.message);
            }

        } catch (err) {
            console.log("err", err);
            notify(err?.response?.data?.message || "Upload failed", "error");
        } finally {
            dispatch(setLoading(false));
        }
    };
    return (
        <>
            <div className="importInHouseDoctorModal_main row mt-2">
                <div className="col-sm-3">
                    <ReactSelect
                        // dynamicOptions={[{ label: "SelectRateType", value: "" }, ...RateData]}
                        dynamicOptions={RateData}
                        name="rateid"
                        lable={t("Rate Type")}
                        id="rateid"
                        removeIsClearable={true}
                        placeholderName={t("Select Rate Type")}
                        value={payload?.rateid}
                        onChange={handleReactChange}
                    />
                </div>
                <div className="col-sm-3">
                    <ReactSelect
                        dynamicOptions={DoctorData}
                        name="doctorId"
                        lable={t("Doctor")}
                        id="doctorId"
                        removeIsClearable={true}
                        placeholderName={t("Doctor")}
                        value={payload?.doctorId}
                        onChange={handleReactChange}

                    />
                </div>
                <div style={{ gap: "4px" }} className="d-flex align-items-center">
                    <CustomButton
                        text={t("Download Template")}
                        icon={"download"}
                        onClick={getDownloadExcelData}
                    />
                </div>
                <div
                    style={{ gap: "4px" }}
                    className="d-flex justify-content-end align-items-center flex-grow-1 mx-2"
                >
                    {/* <ExcelPreviewHandler /> */}
                    <ExcelPreviewHandler key={resetKey} />
                </div>
            </div>
            <div>
                {/* table  */}
            </div>

            <div
                style={{ gap: "4px" }}
                className="d-flex border-top py-2 mt-2 justify-content-center align-items-center"
            >
                <CustomButton
                    text={t("Save")}
                    icon={"save"}
                    onClick={saveImported}
                />

            </div>
        </>
    );
};

export default ExcelImportForDoctorShare;
