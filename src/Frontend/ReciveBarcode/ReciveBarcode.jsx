import React, { useState } from 'react'
import { axiosInstance } from '../../utils/axiosInstance';
import { useTranslation } from 'react-i18next';
import { AutoComplete } from "primereact/autocomplete";
import Accordion from '../../components/UI/Accordion';
import Input from '../../components/formComponent/Input';
import { Barcode } from 'lucide-react';
import { CustomButton } from '../../components/UI/CustomButton';
import Heading from '../../components/UI/Heading';
import Tables from '../../components/UI/customTable';
import moment from 'moment';
import { toast } from 'react-toastify';

const ReciveBarcode = () => {

    const { t } = useTranslation();
    const [stockSuggestions, setStockSuggestions] = useState([]);
    const [autoCompleteVal, setAutoCompleteVal] = useState("");
    const [tableData, setTableData] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [payload, setPayload] = useState({
        SINNo: "",
        FromDate: new Date(),
        ToDate: new Date(),
        FromTime: "00:00:00",
        ToTime: "23:59:59",
    });

    const handleSearch = async (SINNo) => {
        if (!payload?.SINNo && !SINNo) {
            toast.error("Please Enter SIN No");
            return;
        }
        try {
            const Data = {
                searchData: payload?.SINNo || SINNo,
                FromDate: moment(payload?.FromDate).format("YYYY-MM-DD") || "",
                FromTime: payload?.FromTime,
                ToDate: moment(payload?.ToDate).format("YYYY-MM-DD") || "",
                ToTime: payload?.ToTime,
            };
            const res = await axiosInstance.post(
                "SampleReceiveBarcode/SearchSampleReceive",
                Data
            )
            if (res?.data?.success && res?.data?.message?.length > 0) {
                setTableData(res.data.message);
                setPayload((prev) => ({ ...prev, SINNo: "" }));
            } else {
                setTableData([]);
                toast.error("No Record Found");
            }

        } catch (error) {
            console.error("API Error:", error);
        }
    };

    const handleSelectAll = (e) => {
        const checked = e.target.checked;
        setSelectAll(checked);

        const updatedData = tableData.map(item => ({
            ...item,
            isChecked: checked
        }));

        setTableData(updatedData);
    };
    const handleRowCheck = (index) => {
        const updatedData = [...tableData];
        updatedData[index].isChecked = !updatedData[index].isChecked;
        const allChecked = updatedData.every(item => item.isChecked);
        setSelectAll(allChecked);
        setTableData(updatedData);
    };

    const handleCheckboxChange = (index, field, checked) => {
        setTableData((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: checked } : row))
        );
    };



    const handleSave = async () => {
        const selectedRows = tableData.filter(item => item.isChecked);
        if (selectedRows.length === 0) {
            toast.error("Please Select At Least One");
            return;
        }
        try {
            const payloadData = selectedRows.map(item => ({
                TestId: item.testId.toString(),
                HistoCytoSampleDetail: item.histoCytoSampleDetail.toString(),
                HistoCytoPerformingDoctor: item.performingDoctor.toString(),
                ReportType: item.reportType.toString(),
                SampleTypeID: item.sampleTypeId.toString(),
                SampleTypeName: item.sampleTypeName.toString(),
                BarcodeNo: item.barcodeNo.toString(),
                SubCategoryId: item.subCategoryId.toString(),
                SomeDate: item.date.toString(),
                InvestigationId: item.investigationId.toString(),
                LedgerTransactionID: item.ledgerTransactionID.toString(),
                isVetCanine: Number(item.isVetCanine)
            }));
            const res = await axiosInstance.post("SampleReceiveBarcode/SaveSampleReceive", payloadData);
            if (res?.data?.success) {
                toast.success(res?.data?.message);
                setTableData([]);
            } else {
                toast.error(res?.data?.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("API Error");
        }
    };


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPayload((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
        }));
    };
    const handleAutoCompleteSelect = (e) => {
        console.log(e);
        const selected = e.value;
        setPayload((prev) => ({
            ...prev,
            EmployeeName: selected?.label || selected,
            EmployeeID: selected?.value || selected,
        }));
    };
    const handleAutoCompleteChange = (e) => {
        const val = typeof e.value === "object" ? e.value.label : e.value;
        setAutoCompleteVal(val);
        // searchEmployees(val);
        setPayload((prev) => ({ ...prev, EmployeeName: val }));
    };

    const searchEmployees = (query) => {
        axiosInstance
            // .get("InventryManageApprovalStore/Employeesearch", {
            //     params: { query: query || "" },
            // })
            .then((res) => {
                const response = res?.data?.message;
                setStockSuggestions(Array.isArray(response) ? response : []);
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message
                        ? err?.response?.data?.message
                        : "No Data Found"
                );
            });
    };

    const itemTemplate = (item) => (
        <div className="p-clearfix">
            <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
                {item?.label}
            </div>
        </div>
    );
    return (
        <div>
            <Accordion
                name={t("Sample Receive Barcode")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row px-2 pt-2">
                    {/* <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
                        <AutoComplete
                            style={{ width: "100%" }}
                            value={autoCompleteVal}
                            suggestions={stockSuggestions}
                            completeMethod={() => searchEmployees(autoCompleteVal)}
                            className="w-100 required-fields"
                            onSelect={handleAutoCompleteSelect}
                            id="empName"
                            onChange={handleAutoCompleteChange}
                            itemTemplate={itemTemplate}
                        />
                        <label htmlFor="empName" className="lable searchtest">
                            Search
                        </label>
                    </div> */}

                    <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
                        <Input
                            type="text"
                            placeholder=""
                            lable={t("SIN No")}
                            id="SINNo"
                            name="SINNo"
                            value={payload?.SINNo}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleSearch(e.target.value);
                                }
                            }}
                            onChange={handleChange}
                        />
                        {/* <label htmlFor="SINNo" className="lable searchtest">
                            {t("SIN No")}
                        </label> */}
                    </div>

                    <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
                        <CustomButton
                            text={t("Search")}
                            icon={"search"}
                            className="btn btn-primary"
                            onClick={() => handleSearch()}
                        />
                    </div>
                </div>
            </Accordion>
            <Heading
                title={t("Patient Details")}
                secondTitle={<span style={{ color: "red", fontWeight: "Bold" }}
                >
                    {t("Total Investigation(S):")} &nbsp;
                    <span style={{ color: "#111fe9d8", fontWeight: "bold" }}>{tableData.length || ""}</span>
                </span>
                }
            />
            <div className="row">
                <div className="col-sm-12">
                    {tableData?.length > 0 && (
                        <Tables>
                            <thead>
                                <tr>
                                    <th>{t("Sr No.")}</th>
                                    <th>{t("Date")}</th>
                                    <th>{t("SIN No")}</th>
                                    <th>{t("Visit No")}</th>
                                    <th>{t("UHID")}</th>
                                    <th>{t("Patient Name")}</th>
                                    <th>{t("Age/Sex")}</th>
                                    <th>{t("Sample Type")}</th>
                                    <th>{t("Vail Qty")}</th>
                                    <th>{t("Test Name")}</th>
                                    <th>{t("Status")}</th>
                                    {!["Rejected", "Received"].includes(tableData?.status) && (
                                        <th>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData?.map((row, index) => (
                                    <tr key={index} style={{ backgroundColor: row.rowColor }}>
                                        <td data-title="Sr No.">{index + 1}</td>
                                        <td data-title="Date">{row?.date}</td>
                                        <td data-title="SIN No">{row?.barcodeNo}</td>
                                        <td data-title="Visit No">{row?.ledgerTransactionNo}</td>
                                        <td data-title="UHID">{row?.patientId}</td>
                                        <td data-title="Patient Name">{row?.pName}</td>
                                        <td data-title="Age/Sex">
                                            {row?.gender}
                                        </td>
                                        <td data-title="Sample Type">
                                            {row?.sampleTypeName}
                                        </td>
                                        <td data-title="Vail Qty">{row?.sampleQty}</td>
                                        <td data-title="Test Name">{row?.itemName}</td>
                                        <td data-title="Status">{row?.status}</td>
                                        {!(row?.status === "Rejected" || row?.status === "Received") && (
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={row?.isChecked || false}
                                                    onChange={() => handleRowCheck(index)}
                                                />
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                            {tableData?.length > 0 && (
                                <CustomButton
                                    text={t("Save")}
                                    icon={"save"}
                                    style={{ float: "left", margin: "10px" }}
                                    onClick={() => handleSave()}
                                />

                            )}
                        </Tables>
                    )}
                </div>
            </div>
        </div>

    )
}

export default ReciveBarcode
