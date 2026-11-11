import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Accordion from "../../components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { getAccessCentresReports } from "../../utils/NetworkApi/commonApi";
import { apiUrls } from "../../utils/apiUrls";
import { axiosInstance } from "../../utils/axiosInstance";
import { CustomButton } from "../../components/UI/CustomButton";

const BulkRegistrationNew = () => {
    const [t] = useTranslation();
    const [activeData, setActiveData] = useState([])
    const [currentData, setCurrentData] = useState([])
    const [dropDownApis, setDropDownApis] = useState({
        Center: [],
        RateType: [],

    });
    const [payload, setPayload] = useState({
        Center: "",
        RateType: "",
    });

    // Bulk patient data state
    const [bulkPatientData, setBulkPatientData] = useState([
        {
            patientName: "Rahul Sharma",
            age: 34,
            gender: "Male",
            mobileNumber: "9876543210",
            emailId: "rahul.sharma@example.com",
            testCodes: ["T101", "T102", "P205"]
        },
        {
            patientName: "Priya Singh",
            age: 28,
            gender: "Female",
            mobileNumber: "9123456789",
            emailId: "priya.s@example.com",
            testCodes: ["T501"]
        },
        {
            patientName: "Amit Verma",
            age: 45,
            gender: "Male",
            mobileNumber: "9988776655",
            emailId: "amit.verma@example.com",
            testCodes: ["T301", "T302"]
        },
        {
            patientName: "Sneha Patel",
            age: 31,
            gender: "Female",
            mobileNumber: "9871234567",
            emailId: "sneha.patel@example.com",
            testCodes: ["P101", "P102", "T401"]
        },
        {
            patientName: "Vikram Rao",
            age: 52,
            gender: "Male",
            mobileNumber: "9012345678",
            emailId: "vikram.rao@example.com",
            testCodes: ["T201"]
        },
        {
            patientName: "Anita Desai",
            age: 39,
            gender: "Female",
            mobileNumber: "9345678901",
            emailId: "anita.desai@example.com",
            testCodes: ["T601", "T602"]
        },
        {
            patientName: "Rajesh Kumar",
            age: 41,
            gender: "Male",
            mobileNumber: "9567890123",
            emailId: "rajesh.kumar@example.com",
            testCodes: ["P301", "T701", "T702"]
        },
        {
            patientName: "Kavita Mehta",
            age: 26,
            gender: "Female",
            mobileNumber: "9234567890",
            emailId: "kavita.mehta@example.com",
            testCodes: ["T801"]
        },
        {
            patientName: "Suresh Reddy",
            age: 48,
            gender: "Male",
            mobileNumber: "9678901234",
            emailId: "suresh.reddy@example.com",
            testCodes: ["T901", "T902", "P401"]
        },
        {
            patientName: "Deepa Nair",
            age: 33,
            gender: "Female",
            mobileNumber: "9456789012",
            emailId: "deepa.nair@example.com",
            testCodes: ["T1001", "T1002"]
        }
    ]);
    const handleSelectChange = (name, value) => {
        if (name === "Center") {
            getRateType(value?.value)
        }
        setPayload((prev) => ({
            ...prev,
            [name]: value?.value,
        }));
    };

    useEffect(() => {
        getAccessCentresReports((data) => {
            setDropDownApis((prev) => ({
                ...prev,
                Center: data,

            }));
        });

    }, []);
    //rate type api 
    const getRateType = async (centerid) => {
        await axiosInstance
            .post(apiUrls.BindRateTypeWorkOrder, {
                centreID: Number(centerid) || 0,
                rateTypeID: 0,
                AllowEstimate: 0,
                CentreType: "",
                AllowHomeCollection: 0,
                AllowMembershipCard: 0
            })
            .then((response) => {
                const data = response?.data?.message || [];
                const val = data.map((ele) => ({
                    value: ele?.RateTypeID,
                    label: ele?.RateTypeName,
                }));
                setDropDownApis((prev) => ({
                    ...prev,
                    RateType: val,
                }));
            });
    };
    return (
        <>
            <div className="card">
                <Heading
                    title={t("Bulk Registration")}
                    defaultValue={true}

                />
                <div className="row px-2 py-2">


                    <div className="col-sm-2">
                        <ReactSelect
                            name="Center"
                            id="Center"
                            removeIsClearable={true}
                            placeholderName={t("Center")}
                            dynamicOptions={dropDownApis?.Center?.map((ele) => ({
                                label: ele.label,
                                value: ele.value,
                            }))}
                            value={payload?.Center}
                            onChange={handleSelectChange}
                        />
                    </div>
                    <div className="col-sm-2">
                        <ReactSelect
                            name="RateType"
                            id="RateType"
                            placeholderName={t("RateType")}
                            removeIsClearable={true}
                            dynamicOptions={dropDownApis?.RateType?.map((ele) => ({
                                label: ele.label,
                                value: ele.value,
                            }))}
                            value={payload?.RateType}
                            onChange={handleSelectChange}
                        />
                    </div>

                    <CustomButton
                        text={"Download"}
                        icon={"excel"}
                        className="ml-2"
                    // onClick={handleUpdate}
                    />
                    <>
                        {/* <input
                            type="file"
                            accept=".xlsx, .xls"
                        //   ref={fileInputRef}
                        //   style={{ display: "none" }}
                        //   onChange={handleFileUpload}
                        /> */}

                        <CustomButton
                            text={"Import"}
                            icon={"download"}
                            className="ml-2 btn rounded"
                            // onClick={() => fileInputRef.current.click()}
                        />
                    </>

                    {/* <div className="col-sm-2 d-flex align-items-end pb-2">
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={selectedRadio === "SalesManager" ? handleSearch : handleSearch1}
                                >
                                    {t("Search")}
                                </button>
                            </div> */}
                </div>
            </div>

            {/* TABLE */}
            <div className="mt-2">
                <Accordion title={t("Bulk Items")} defaultValue={true}>
                    {bulkPatientData.length > 0 ? (
                        <div className="row px-1">
                            <div className="col-12">
                                <Tables className="table table-bordered table-hover">
                                    <thead className="cf">
                                        <tr>
                                            <th>{t("S.No")}</th>
                                            <th>{t("Patient Name")}</th>
                                            <th>{t("Age")}</th>
                                            <th>{t("Gender")}</th>
                                            <th>{t("Mobile Number")}</th>
                                            <th>{t("Email ID")}</th>
                                            <th>{t("Test Codes")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkPatientData.map((data, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{data?.patientName}</td>
                                                <td>{data?.age}</td>
                                                <td>{data?.gender}</td>
                                                <td>{data?.mobileNumber}</td>
                                                <td>{data?.emailId}</td>
                                                <td>{data?.testCodes?.join(", ")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Tables>
                                <div className="d-flex justify-content-end mt-3 mb-2 px-2">
                                    <CustomButton
                                        text={"Save"}
                                        icon={"save"}
                                        className="ml-2 btn rounded"
                                        // onClick={() => fileInputRef.current.click()}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <NoRecordFound />
                    )}
                </Accordion>
            </div>

        </>
    )
}

export default BulkRegistrationNew