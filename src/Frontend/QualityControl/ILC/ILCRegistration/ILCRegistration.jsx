import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import { ViewMenu } from "../../../../components/SvgIcons";
import ILCFrameMenu from "../ILCFrameMenu";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { CustomButton, SearchButton } from "../../../../components/UI/CustomButton";
import { apiUrls } from "../../../../utils/apiUrls";
import Input from "../../../../components/formComponent/Input";
import { months, years } from "../../../../utils/Constants";
import { validateRequiredFields } from "../../../../utils/helpers";
import CustomTable from "../../../../components/Table/CustomTable";
import './ILCRegistration.css';
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";

const ILCRegistration = () => {
    const { t } = useTranslation();
    const date = new Date();
    const [showMore, setShowMore] = useState(false);
    const [centreData, setCentreData] = useState([]);
    const [labOptions, setLabOptions] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [parameterTableData, setParameterTableData] = useState([]);
    const [parameterTestDetailData, setParameterTestDetailData] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeParameterRowId, setActiveParameterRowId] = useState(null);
    const [parameterMap, setParameterMap] = useState({});
    const [formData, setFormData] = useState({
        CentreName: "",
        CentreId: "",
        LabType: "",
        month: date.getMonth() + 1,
        year: date.getFullYear().toString(),
        VisitNo: "",
    });
    const colorCodingRegistered = [
        { color: "#ffe58f", id: "7", labelKey: "Not Registered" },
        { color: "#81ec61", id: "8", labelKey: "Registered" },
    ];

    const patientColumns = [
        {
            header: "Sr. No",
            field: "srNo",
            width: "70px",
        },
        {
            header: "Patient Name",
            field: "FirstName",
            maxWidth: "180px",
        },
        {
            header: "Age / Gender",
            field: "PDetail",
            maxWidth: "150px",
        },
        {
            header: "Visit ID",
            field: "LedgerTransactionNo",
            maxWidth: "160px",
        },
        {
            header: "Sin No",
            field: "barcodeno",
            maxWidth: "120px",
        },
        {
            header: "Test Name",
            field: "itemname",
            maxWidth: "220px",
        },
        {
            header: "Parameter",
            field: "parameter",
            width: "90px",
        },
        {
            header: "Select",
            field: "select",
            width: "80px",
        },
    ];

    const parameterColumns = [
        {
            header: "Sr.No",
            field: "srNo",
            width: "70px",
        },
        {
            header: "Test Type",
            field: "TestType",
            maxWidth: "150px",
        },
        {
            header: "Parameter Name",
            field: "TestName",
            maxWidth: "250px",
        },
        {
            header: "New Sin No",
            field: "newbarcode",
            maxWidth: "160px",
        },
    ];

    const parameterDetailColumns = [
        {
            header: "Sr. No",
            field: "srNo",
            width: "70px",
        },
        {
            header: "Parameter Name",
            field: "LabObservationName",
            maxWidth: "220px",
        },
        {
            header: "Result",
            field: "value",
            width: "90px",
        },
        {
            header: "Min Value",
            field: "minvalue",
            width: "90px",
        },
        {
            header: "Max Value",
            field: "maxvalue",
            width: "90px",
        },
        {
            header: "Unit",
            field: "readingformat",
            width: "90px",
        },
        {
            header: "Method",
            field: "method",
            maxWidth: "120px",
        },
        {
            header: "Select",
            field: "select",
            width: "80px",
        },
    ];

    const getAccessCentres = async () => {
        try {
            const res = await axiosInstance.get("CommonController/GetAccessProcessingLab");
            if (res?.data?.success && Array.isArray(res?.data?.message)) {
                setCentreData(
                    res?.data?.message?.map((c) => ({
                        value: c.centreid,
                        label: c.centre,
                    }))
                )
            }
        } catch (error) {
            toast.error("Failed to load centres");
        }
    };

    const getILCLab = async (CentreId) => {
        console.log("Centre", CentreId);

        axiosInstance
            .get(apiUrls?.BindILCRegisteration,
                {
                    params: {
                        ProcessingCentre: CentreId?.toString() || "", // or string value
                    },
                }
            )
            .then((res) => {
                console.log("Bind ILC", res);
                if (res?.data?.success) {
                    const val = res?.data?.message?.map((c) => ({
                        value: c.labid,
                        label: c.labname,
                    }))
                    setLabOptions(val);
                }
                else {
                    setLabOptions([]);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {

            });
    }


    const handleSearch = async () => {
        const requiredFields = [
            "CentreId",
            "LabType",
            "month",
            "year",
            "VisitNo"
        ];
        const errors = validateRequiredFields(formData, requiredFields);
        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }
        axiosInstance
            .post(apiUrls?.ILCGetPatientData,
                {
                    processingCentre: formData?.CentreId?.toString() || "",
                    searchValue: formData?.VisitNo?.toString() || "",
                    regisYearAndMonth: `${formData?.month}#${formData?.year}` || "",
                }
            )
            .then((res) => {
                console.log("patient res", res);
                if (res?.data?.success && Array.isArray(res?.data?.message)) {
                    setTableData(res?.data?.message || []);
                    toast?.success("Patient Data Fetched successfully");
                }
                else {
                    setTableData([]);
                    toast?.success(res?.data?.message || "No Data Found ");
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {

            });
    }

    const bindParameterList = async (lab = "", month = "", year = "") => {
        console.log("Entered");
        axiosInstance
            .post(apiUrls?.ILCGetParameterList,
                {
                    processingCentre: formData?.CentreId?.toString() || "",
                    ilcLab: lab?.toString() || formData?.LabType?.toString() || "",
                    regisYearAndMonth: `${formData?.month}#${formData?.year}` || "",
                }
            )
            .then((res) => {
                console.log("parameter res", res);
                if (res?.data?.success && Array.isArray(res?.data?.message)) {
                    setParameterTableData(res?.data?.message || []);
                    toast?.success(res?.data?.message || "Parameter Data Fetched successfully");
                }
                else {
                    setParameterTableData([]);
                    toast?.success(res?.data?.message || "No Data Found ");
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message
                        ? err?.data?.message
                        : "Error Occured",
                );
            })
            .finally(() => {

            });
    }

    const handleSelectChange = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value?.value,
        }));
        if (name === "CentreId") {
            getILCLab(value?.value);
            setFormData((prev) => ({ ...prev, LabType: "", CentreName: value?.label }));
        }
        if (name === "LabType") {
            bindParameterList(value?.value);
        }
        if (name === "month" || name === "year") {
            bindParameterList(formData?.LabType);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
        }));
    };

    const handleReset = () => {
        setFormData({
            CentreName: "",
            CentreId: "",
            LabType: "",
            month: date.getMonth() + 1,
            year: date.getFullYear().toString(),
            VisitNo: "",
        });
        setErrors({});
        setTableData([]);
        setParameterTableData([]);
        setParameterTestDetailData([]);
        setActiveParameterRowId(null);
        setParameterMap({});
    }

    const onTableRowCheck = (row) => {
        const checked = !row.isChecked;

        // 1️⃣ update main table checkbox
        setTableData(prev =>
            prev.map(r =>
                r.testid === row.testid
                    ? { ...r, isChecked: checked }
                    : r
            )
        );

        // 2️⃣ if plus is open → sync all parameters
        if (activeParameterRowId === row.testid && parameterMap[row.testid]) {
            setParameterMap(prev => ({
                ...prev,
                [row.testid]: prev[row.testid].map(p => ({
                    ...p,
                    isChecked: checked,
                })),
            }));

            // 3️⃣ update visible parameter table
            setParameterTestDetailData(prev =>
                prev.map(p => ({ ...p, isChecked: checked }))
            );
        }
    };

    const handleParameterRowSelect = (index, checked) => {
        setParameterTestDetailData(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], isChecked: checked };

            // 🔁 sync back to parameterMap
            setParameterMap(map => ({
                ...map,
                [activeParameterRowId]: updated,
            }));

            // 🔁 sync main table checkbox
            const anyChecked = updated.some(p => p.isChecked);

            setTableData(rows =>
                rows.map(r =>
                    r.testid === activeParameterRowId
                        ? { ...r, isChecked: anyChecked }
                        : r
                )
            );

            return updated;
        });
    };

    const handleAddParameter = async (row) => {
        setActiveParameterRowId((prev) => {
            // 🔽 COLLAPSE CASE
            if (prev === row.testid) {
                setParameterTestDetailData([]); // 👈 hide parameters
                return null;
            }

            return row.testid;
        });

        // ⛔ Stop further execution when collapsing
        if (activeParameterRowId === row.testid) return;

        // 🔽 EXPAND CASE
        if (!parameterMap[row.testid]) {
            const params = await fetchParameters(row.testid);

            const updatedParams = params?.map((p) => ({
                ...p,
                isChecked: row.isChecked ? true : false,
            }));

            setParameterMap((prev) => ({
                ...prev,
                [row.testid]: updatedParams,
            }));

            setParameterTestDetailData(updatedParams);
        } else {
            setParameterTestDetailData(parameterMap[row.testid]);
        }
    };

    const fetchParameters = async (testId) => {
        if (!testId) return [];

        try {
            const res = await axiosInstance.post(apiUrls?.ILCBindTestParameter, {
                testId: testId.toString(),
                regisYearAndMonth: `${formData?.month}#${formData?.year}`,
            });

            if (res?.data?.success && Array.isArray(res?.data?.message)) {
                return res.data.message;
            }

            return [];
        } catch (err) {
            toast.error(
                err?.data?.message ? err.data.message : "Error occurred"
            );
            return [];
        }
    };

    const parsePDetail = (pDetail = "") => {
        // Expected format: "22 Y 0 M 0 D/Male"
        const [agePart, genderPart] = pDetail.split("/");

        let years = 0,
            months = 0,
            days = 0;

        if (agePart) {
            const yearMatch = agePart?.match(/(\d+)\s*Y/);
            const monthMatch = agePart?.match(/(\d+)\s*M/);
            const dayMatch = agePart?.match(/(\d+)\s*D/);

            years = yearMatch ? Number(yearMatch[1]) : 0;
            months = monthMatch ? Number(monthMatch[1]) : 0;
            days = dayMatch ? Number(dayMatch[1]) : 0;
        }

        // Approx calculation (backend usually accepts this)
        const totalAgeInDays = years * 365 + months * 30 + days;

        return {
            age: agePart?.trim() || "",
            ageYear: String(years) || "",
            ageMonth: String(months) || "",
            ageDays: String(days) || "",
            totalAgeInDays: String(totalAgeInDays),
            gender: genderPart?.trim() || ""
        };
    };

    const buildRegisterPayload = () => {
        const selectedRows = tableData?.filter(r => r.isChecked);
        const ageInfo = parsePDetail(tableData[0]?.PDetail);

        return {
            patientData: {
                dob: "2026-02-28",
                age: ageInfo?.age || "",
                ageYear: ageInfo?.ageYear || "",
                ageDays: ageInfo?.ageDays || "",
                ageMonth: ageInfo?.ageMonth || "",
                rateID: "",
                totalAgeInDays: ageInfo.totalAgeInDays || "",
                title: "",
                firstName: tableData[0]?.FirstName || "",
                lastName: "",
                middleName: "",
                centreID: formData.CentreId || 0,
                mobile: "",
                pinCode: "",
                state: "",
                country: "",
                email: "",
                city: "",
                houseNo: "",
                streetName: "",
                locality: "",
                phone: "",
                gender: ageInfo.gender || "",
                isVIP: 0,
                isMask: 0,
                patientCode: "",
                pageName: "",
                barcodeNo: `4#${tableData[0]?.barcodeno || ""}`,
                proEmployee: "",
                rateTypeEmail: "",
                rateTypePhone: "",
                clientAddress: "",
                hideAmount: 0,
                mobileVip: "",
                firstNameVip: "",
                middleNameVip: "",
                lastNameVip: "",
                membershipCardID: "",
                familyMemberIsPrimary: "",
                patientID: String(tableData[0]?.PatientID || ""),
            },

            ltData: {
                typeOfTnx: "",
                netAmount: 0,
                grossAmount: 0,
                date: new Date().toISOString(),
                discountOnTotal: "",
                isCredit: "",
                pName: tableData[0]?.FirstName || "",
                age: ageInfo?.age || "",
                gender: ageInfo.gender || "",
                vip: 0,
                ledgerTransactionIDHash: "",
                ledgerTransactionID: "",
                iD_Passport: "",
                nationality: "",
                ledgerTransactionNo: tableData[0]?.LedgerTransactionNo || "",
                discountReason: "",
                discountApprovedBy: "",
                remarks: "",
                guid: "",
                referRate: "",
                centreName: formData?.CentreName || "",
                discountType: "",
                doctorID: "",
                doctorName: "",
                secondReferDoctor: "",
                doctorMobile: "",
                doctorEmail: "",
                referLabId: "",
                referLabName: "",
                referLab: 0,
                otherReferLab: "",
                cardNo: "",
                centreID: formData?.CentreId || 0,
                rateTypeId: "",
                adjustment: "",
                adjustmentDate: "",
                isDocumentUploaded: "",
                patientIDProof: "",
                patientIDProofNo: "",
                patientSource: "",
                patientType: "",
                visitType: "",
                hlmPatientType: "",
                hlmopdipdNo: "",
                reVisit: 0,
                hlmuhid: "",
                source: "",
                category: "",
                bedNo: "",
                isAllowPrint: 0,
                collectionBoyId: "",
                reportDeliveryMethodId: "",
                reportDeliveryMethodDetail: "",
                medicalHistoryCount: "",
                uploadDocumentCount: "",
                isMedicalHistory: "",
                registrationDate: new Date()?.toISOString(),
                srfId: "",
                icmrId: "",
                isConcern: 0,
                hideAmount: "",
                discountId: "",
                setMRP: 0,
                btb: "",
                proEmployee: "",
                orderId: "",
                coupanCode: "",
                coupanId: "",
                isCoupon: "",
                pNameVip: "",
                isCourier: "",
                isWhatsappRequired: "",
                pndt: "",
                noOfChildren: "",
                noOfSon: "",
                noOfDaughter: "",
                pregnancy: "",
                ageOfSon: "",
                ageOfDaughter: "",
                pndtDoctor: "",
                husband: "",
                isPndt: "",
                isPndtForm: "",
                hisBillNo: "",
                hmis_request_type: "",
                hmis_patCrNo: "",
                hmis_hospital_code: "",
                poct_facility_id: "",
                hmis_episode_code: "",
                hmis_episode_visitno: "",
                businessUnitID: 0,
                invoiceTo: 0,
                barcodeLogicID: 0,
                collectionBoyName: "",
                rateTypeName: "",
                nikshayID: "",
                mobile: "",
                email: "",
                trfNo: "",
                sampleCollectionDate: new Date()?.toISOString(),
            },

            plo: selectedRows?.map((row, index) => ({
                investigationDate: new Date()?.toISOString(),
                modalityId: "",
                updateModalityId: "",
                oldUpdateModalityId: "",
                oldModalityID: "",
                oldStartEndTimeSlot: "",
                oldBookingDate: "",
                shiftName: "",

                investigationSampleType: (parameterMap[row.testid] || [])
                    ?.filter(p => p.isChecked)
                    .map(p => ({
                        barcodeNo: `4#${row.barcodeno}` || "",
                        investigationId: String(p.investigation_id) || "",
                        sampleId: "",
                        sampleName: "",
                        testID: String(row.testid) || "",
                        testName: p.LabObservationName || "",
                        setBarcode: 0,
                    })),

                barcodeNo: `4#${row.barcodeno}` || "",
                endTime: "",
                startTime: "",
                startEndTimeSlot: "",
                isRadiology: "",
                isSampleCollected: "",
                isSampleRequired: "",
                status: 0,
                isUrgent: 0,
                sampleTypeID: 0,
                sampleTypeName: "",
                itemId: row.itemid,
                itemName: row.itemname,
                investigationID: row.itemid,
                investigationName: row.itemname,
                reportType: row.ReportType?.toString() || "",
                isPackage: 0,
                rate: "",
                amount: "",
                quantity: 0,
                pccDiscAmt: 0,
                pccDiscPer: 0,
                rateTypeId: "",
                discountAmt: "",
                discountApprovedBy: "",
                discountReason: "",
                isReporting: row?.isreporting?.toString() || "",
                ageInDays: ageInfo?.totalAgeInDays || "",
                gender: ageInfo.gender || "",
                centreID: formData?.CentreId || 0,
                sessionCentreID: "",
                testCentreID: 0,
                sampleBySelf: "",
                sampleCollectionBy: 0,
                deliveryDate: "",
                urgentDateTime: "",
                departmentID: row?.DepartmentId || 0,
                departmentName: "",
                isHistoryReq: 0,
                packageCode: "",
                packageName: "",
                testCode: "",
                isLabOutSource: 0,
                isCulture: 0,
                memberType: 0,
                isConcern: "",
                setMRP: "",
                isCovid: "",
                urgentdeleiveryDate: "",
                date: new Date().toISOString(),
                testIdHash: "",
                hmis_req_no: "",
                hmis_req_dno: "",
                hmis_lab_code: "",
                hmis_test_code: "",
                hmis_test_name: "",
                hmis_sample_code: "",
                hmis_sample_name: "",
                cdac_inv_status: 0,
                req_type: "",
                businessUnitID: 0,
                invoiceTo: 0,
                isCredit: 0,
                departmentPrintOrder: 0,
                investigationPrintOrder: 0,
                otherDiscountReason: "",
                testID: row?.testid,
                mapType: row?.MapType,
            })),

            regisYearAndMonth: `${formData?.year}#${formData?.month}` || "",
            centreID: formData?.LabType || "",
        };
    };

    const handleSaveRegistration = async () => {
        const ageInfo = parsePDetail(tableData[0]?.PDetail);

        const payload = [buildRegisterPayload()];

        axiosInstance
            .post(apiUrls?.ILCRegistration, payload)
            .then((res) => {
                console.log("ILC Registeration", res);

                if (res?.data?.success) {
                    toast.success(res?.data?.message);
                    handleReset();
                } else {
                    toast.error(res?.data?.message);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.data?.message ? err.data.message : "Error occurred"
                );
            });
    };

    useEffect(() => {
        getAccessCentres();
    }, []);

    console.log("formData", formData);
    console.log("tableData", tableData);
    console.log("parameterTestDetailData", parameterTestDetailData);
    console.log("parameterTableData", parameterTableData);
    console.log("parameterMap", parameterMap);

    return (
        <>
            {showMore && <ILCFrameMenu />}
            <div className="card">
                <Heading
                    name="ILC Registration"
                    isBreadcrumb={true}
                    secondTitle={
                        <label
                            className="cursor-pointer"
                            onClick={() => setShowMore((prev) => !prev)}
                        >
                            <ViewMenu />
                        </label>
                    }
                />
                <div className="row p-2">

                    <div className="col-xl-2 col-sm-3 col-md-2 col-12">
                        <ReactSelect
                            // respclass="col-xl-2 col-sm-3 col-md-2 col-12"
                            dynamicOptions={centreData}
                            name="CentreId"
                            id="CentreId"
                            value={formData.CentreId}
                            placeholderName="Select Center"
                            removeIsClearable={true}
                            onChange={handleSelectChange}
                        />
                        {formData?.CentreId === "" && (
                            <span className="error-message">{errors?.CentreId}</span>
                        )}
                    </div>

                    <div className="col-xl-2 col-sm-3 col-md-2 col-12">
                        <ReactSelect
                            // respclass="col-xl-2 col-sm-3 col-md-2 col-12"
                            dynamicOptions={labOptions}
                            name="LabType"
                            id="LabType"
                            value={formData.LabType}
                            placeholderName="Select ILC Lab "
                            removeIsClearable
                            onChange={handleSelectChange}
                        />
                        {formData?.LabType === "" && (
                            <span className="error-message">{errors?.LabType}</span>
                        )}
                    </div>

                    <div className="col-xl-2 col-sm-3 col-md-2 col-12">
                        <Input
                            type="text"
                            placeholder=" "
                            lable={t("Sin No/Visit No")}
                            id="VisitNo"
                            name="VisitNo"
                            value={formData?.VisitNo}
                            onChange={handleChange}
                        // className={"required-fields"}
                        />
                        {formData?.VisitNo === "" && (
                            <span className="error-message">{errors?.VisitNo}</span>
                        )}
                    </div>

                    <div className="col-sm-2 col-md-1 col-6">
                        <ReactSelect
                            dynamicOptions={months}
                            name="month"
                            id="month"
                            removeIsClearable={false}
                            placeholderName={t("Current Month")}
                            value={formData?.month}
                            onChange={handleSelectChange}
                            className="required-fields"
                        />
                    </div>
                    <div className="col-sm-2 col-md-1 col-6">
                        <ReactSelect
                            dynamicOptions={years}
                            name="year"
                            id="year"
                            removeIsClearable={false}
                            placeholderName={t("Current year")}
                            value={formData?.year}
                            onChange={handleSelectChange}
                            className="required-fields"
                        />
                    </div>
                    <SearchButton text="Search" className="mb-2 mx-2" onClick={handleSearch} />

                    {tableData?.length > 0 &&
                        <CustomButton text="Save" icon="save" className="mx-2 mb-2" onClick={handleSaveRegistration} />
                    }
                    <CustomButton text="Reset" onClick={handleReset} icon="refresh" className="mx-2 mb-2" />
                </div>

            </div>
            <div className="patient-tables-wrapper px-2">
                {/* LEFT TABLE – 60% */}
                <div className="patient-table-left">
                    <Heading title="Patient Details"
                        secondTitle={
                            <>
                                {colorCodingRegistered?.map(({ color, labelKey, id }) => (
                                    <ColorCodingSearch
                                        key={id}
                                        color={color}
                                        label={t(labelKey)}
                                        // onClick={() => handleStatusFilter(id)}
                                        cursor="pointer"
                                    />
                                ))}
                            </>
                        }
                    />
                    <CustomTable
                        loading={loading}
                        columns={patientColumns}
                        data={tableData?.map((row, i) => ({
                            srNo: i + 1,
                            ...row,
                            rowColor: row.savedid === "" ? "#ffe58f" : "#81ec61",
                            parameter: (
                                <i
                                    className={`fa ${activeParameterRowId === row.testid
                                        ? "fa-minus-circle"
                                        : "fa-plus-circle"
                                        }`}
                                    title={
                                        activeParameterRowId === row.testid
                                            ? "Hide Parameters"
                                            : "Add Parameter"
                                    }
                                    style={{
                                        cursor: "pointer",
                                        color:
                                            activeParameterRowId === row.testid ? "#dc3545" : "#198754",
                                        fontSize: "16px",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddParameter(row);
                                    }}
                                />
                            ),

                            select: (
                                <input
                                    type="checkbox"
                                    checked={row?.isChecked || false}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={() => onTableRowCheck(row)}
                                />
                            ),
                        }))}
                    />
                    {parameterTestDetailData?.length > 0 && (
                        <>
                            <Heading title="Parameter Details"
                            />

                            <CustomTable
                                columns={parameterDetailColumns}
                                data={parameterTestDetailData.map((row, i) => ({
                                    srNo: i + 1,
                                    ...row,
                                    rowColor: '#ee7bd1',
                                    select: row.mapid !== "" ? <input
                                        type="checkbox"
                                        checked={row?.isChecked || false}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) =>
                                            handleParameterRowSelect(i, e.target.checked)
                                        }
                                    /> : "",
                                }))}
                            />
                        </>
                    )}
                </div>

                {/* RIGHT TABLE – 40% */}
                <div className="patient-table-right">
                    <Heading title="Mapped Parameters"
                        secondTitle={
                            <>
                                {colorCodingRegistered?.map(({ color, labelKey, id }) => (
                                    <ColorCodingSearch
                                        key={id}
                                        color={color}
                                        label={t(labelKey)}
                                        cursor="pointer"
                                    />
                                ))}
                            </>


                        }
                    />
                    <CustomTable
                        loading={loading}
                        columns={parameterColumns}
                        data={parameterTableData?.map((row, index) => ({
                            srNo: index + 1,
                            rowColor: row.regisid === "" ? "#ffe58f" : "#81ec61",
                            ...row,
                        }))}
                    />
                </div>
            </div>
        </>
    );
};

export default ILCRegistration;
