import React, { useEffect } from 'react'
import Accordion from '../../components/UI/Accordion'
import { useState } from 'react'
import ReactSelect from '../../components/formComponent/ReactSelect'
import { useTranslation } from 'react-i18next'
import { CustomButton, SearchButton } from '../../components/UI/CustomButton'
import { axiosInstance } from '../../utils/axiosInstance'
import MultiSelectComp from '../../components/formComponent/MultiSelectComp'
import Input from '../../components/formComponent/Input'
import Tables from '../../components/UI/customTable'
import NoRecordFound from '../../components/formComponent/NoRecordFound'
import { exportToExcel } from '../../utils/helpers'


const RateListReport = () => {
    const [Department, setDepartment] = useState([]);
    const [RateCentres, setRateCentres] = useState([]);
    const [tableData, setTableData] = useState([
        {
            testCode: "TC001",
            testName: "Blood Sugar",
            rateType1: "R1-100",
            rateType2: "R2-150",
            rateType3: "R3-200",
        },
        {
            testCode: "TC002",
            testName: "Cholesterol",
            rateType1: "R1-120",
            rateType2: "R2-170",
            rateType3: "R3-220",
        },
        {
            testCode: "TC003",
            testName: "Hemoglobin",
            rateType1: "R1-90",
            rateType2: "R2-140",
            rateType3: "R3-180",
        }
    ]);
    const { t } = useTranslation();

    const [payload, setPayload] = useState({
        DepartmentID: 0,
        RateTypeId: [],
        RateType: ""
    })

    const getDepartment = () => {
        axiosInstance
            .get(`Department/getDepartment`)
            .then((res) => {
                let data = res.data.message;
                let Department = data.map((ele) => {
                    return {
                        value: ele.DepartmentID,
                        label: ele.Department,
                    };
                });
                Department.unshift({ label: "All Department", value: 0 });
                setDepartment(Department);
            })
            .catch((err) => console.log(err));
    };
    const getRateCenters = () => {
        axiosInstance
            .get("centre/getRateList")
            .then((res) => {
                let data = res.data.message;

                let CentreDataValue = data.map((ele) => {
                    return {
                        value: ele.CentreID,
                        label: ele.Centre,
                    };
                });
                CentreDataValue.unshift({ label: "All", value: 0 });
                // setPayload({
                //     ...payload,
                //     DepartmentID: 0,
                //     CentreID: CentreDataValue[0]?.value,
                //     // BillingCategory: findRoutine(Billing),
                // });
                setRateCentres(CentreDataValue);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    useEffect(() => {
        getDepartment()
        getRateCenters()
    }, [])

    const handleReactSelect = (name, e) => {
        setPayload(prev => ({
            ...prev, [name]: e?.value
        }))
    }

    const handleMultiSelectChange = (name, value) => {
        setPayload((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });
    }

    const handleSearch = () => {
        console.log("Payload", payload)
    }

    return (
        <>
            <Accordion title={"Rate List Report"} defaultValue={true}>
                <div className="row px-2 mt-2 mb-1">
                    <div className="col-sm-2 col-md-2">
                        <Input
                            className="select-input-box form-control input-sm"
                            type="text"
                            name="RateType"
                            id="Ratetype"
                            lable={"Ratetype"}
                            value={payload.RateType}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="col-sm-2 col-md-2">
                        <ReactSelect
                            dynamicOptions={Department}
                            id="DepartmentID"
                            placeholderName={t("Department")}
                            name="DepartmentID"
                            value={payload?.DepartmentID}
                            onChange={handleReactSelect}
                            searchable={true}
                            removeIsClearable={true}
                        />
                    </div>
                    <div className="col-sm-2 col-md-2">
                        <MultiSelectComp
                            label="All RateType"
                            options={[...RateCentres]}
                            value={payload?.RateTypeId}
                            name="RateTypeId"
                            id="RateTypeId"
                            onChange={handleMultiSelectChange}
                            lable={t("Select RateType")}
                        />
                    </div>
                    <div className="col-sm-1 d-flex">
                        <div style={{ marginRight: "10px" }}>
                            <SearchButton
                                onClick={handleSearch}
                                text={t("Search")}
                                style={{ width: "80px", display: "inline-block" }}
                            />
                        </div>

                        <div>
                            <CustomButton
                                onClick={() => exportToExcel(tableData, "MembershipCard")}
                                text={t("Excel")}
                                icon={"excel"}
                                style={{ width: "80px", display: "inline-block" }}
                            />
                        </div>
                    </div>
                    <div className="col-sm-1 ">

                    </div>
                </div>
            </Accordion>
            <Accordion title={t("Search Data")} defaultValue={true}>
                {tableData.length > 0 ? (
                    <div className="row p-2">
                        <div className="col-12">
                            <Tables
                                style={{
                                    maxHeight: "400px",
                                    overflowY: "auto",
                                }}>
                                <thead className="cf">
                                    <tr>
                                        <th>{t("S.No")}</th>
                                        <th>{t("TestCode")}</th>
                                        <th>{t("Test Name")}</th>
                                        <th>{t("RateType1_CodeOnly")}</th>
                                        <th>{t("RateType1_CodeOnly")}</th>
                                        <th>{t("RateType3_CodeOnly")}</th>
                                        {/* <th>{t("Action")}</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData && tableData.map((data, index) => (
                                        <tr key={index}>
                                            <td data-title={t("S.No")}>{index + 1}</td>
                                            <td data-title={t("TestCode")}>{data.testCode}</td>
                                            <td data-title={t("Test Name")}>{data.testName}</td>
                                            <td data-title={t("RateType1_CodeOnly")}>{data.rateType1}</td>
                                            <td data-title={t("RateType2_CodeOnly")}>{data.rateType2}</td>
                                            <td data-title={t("RateType3_CodeOnly")}>{data.rateType3}</td>
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
        </>
    )
}
export default RateListReport