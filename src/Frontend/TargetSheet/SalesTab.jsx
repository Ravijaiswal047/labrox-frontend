import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import { useTranslation } from "react-i18next";
import { CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

const SalesTab = () => {
    const [t] = useTranslation();
    const [salesManagers, setSalesManagers] = useState([]);
    const [loading, setLoading] = useState({
        search: false,
        save: false
    })

    const [searchData, setSearchData] = useState({
        financialYear: "",
        salesManagerIDs: [],
    })
    const [tableData, setTableData] = useState([])
    const [fyList, setFyList] = useState([]);
    const [selectAll, setSelectAll] = useState(false);

    console.log("Table data", tableData)

    useEffect(() => {
        const fetchSalesManagers = async () => {
            try {
                const res = await axiosInstance.get("Employee/ProEmployee");
                const data = res.data.message;
                const mapped = data.map((ele) => ({
                    value: ele.EmployeeID,
                    label: ele.EmployeeName,
                }))
                setSalesManagers(mapped)
            } catch (error) {
                console.error("Failed to load sales managers", err);
            }
        }

        const GetFinancialYear = (name) => {
            const generateFYFallback = () => {
                const today = new Date();
                const currentYear = today.getFullYear();
                const month = today.getMonth();
                const fyStart = month >= 3 ? currentYear : currentYear - 1;
                return [
                    {
                        label: `${fyStart - 1}-${fyStart}`,
                        value: `${fyStart - 1}-${fyStart}`,
                    },
                    {
                        label: `${fyStart}-${fyStart + 1}`,
                        value: `${fyStart}-${fyStart + 1}`,
                    },
                    {
                        label: `${fyStart + 1}-${fyStart + 2}`,
                        value: `${fyStart + 1}-${fyStart + 2}`,
                    },
                ];
            };

            axiosInstance
                .post("Global/GetGlobalData", {
                    Type: name,
                })
                .then((res) => {
                    let data = res.data.message;
                    if (Array.isArray(data) && data.length > 0) {
                        let SampleContainer = data.map((ele) => {
                            return {
                                value: ele.FieldDisplay,
                                label: ele.FieldDisplay,
                            };
                        });
                        setFyList(SampleContainer);
                    } else {
                        setFyList(generateFYFallback());
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setFyList(generateFYFallback());
                });
        };

        fetchSalesManagers()
        GetFinancialYear("FinancialYear");
    }, [])

    const handleMultiSelectChange = (name, value) => {
        setSearchData({ ...searchData, [name]: value });
    };
    const handleSelectChange = (name, value) => {
        setSearchData({ ...searchData, [name]: (value?.value)?.toString() || "" });
    };



    const monthKeys = [
        "apr_TargetAmount", "may_TargetAmount", "jun_TargetAmount",
        "jul_TargetAmount", "aug_TargetAmount", "sep_TargetAmount",
        "oct_TargetAmount", "nov_TargetAmount", "dec_TargetAmount",
        "jan_TargetAmount", "feb_TargetAmount", "mar_TargetAmount"
    ];
    const monthNames = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

    const handleSearch = async () => {
        if (searchData.salesManagerIDs.length === 0) {
            toast.error("Sales managers are required!")
            return;
        }
        if (!searchData.financialYear || searchData.financialYear === "") {
            toast.error("Financial Year is required!")
            return;
        }
        setLoading({ search: true });
        try {
            const res = await axiosInstance.post("TargetSheet/GetSalesManagerTarget", searchData)
            const data = res?.data;

            if (data?.success && Array.isArray(data?.data)) {
                setTableData(data?.data || [])
            } else {
                setTableData([])
            }
        } catch (error) {
            console.log("Error while searching data")
        } finally {
            setLoading({ search: false })
        }
    }

    const handleSelectAll = () => {
        const newValue = !selectAll;
        setSelectAll(newValue);
        const updated = tableData.map((row) => ({
            ...row,
            checked: newValue,
        }));
        setTableData(updated);
    };

    const handleRowCheck = (index) => {
        const updated = [...tableData];
        updated[index].checked = !updated[index].checked;
        setTableData(updated);
        setSelectAll(updated.every(item => item.checked));
    };

    const handleInputChange = (index, field, value) => {
        const updated = [...tableData];
        updated[index][field] = value === "" ? "" : Number(value);
        setTableData(updated);
    };

    const handleBulkMonthUpdate = (key, value) => {
        const numericValue = Number(value) || 0;
        setTableData((prevData) =>
            prevData.map((row) => ({
                ...row,
                [key]: numericValue,
            }))
        );
    };

    const handleSave = async () => {
        const selectedRows = tableData.filter(item => item.checked);
        if (selectedRows.length === 0) {
            toast.error("Please select at least one row to save");
            return;
        }

        const finalPayload = selectedRows.map((row) => ({
            salesManagerID: row.salesManagerID,
            fy: String(searchData.financialYear),
            apr_TargetAmount: Number(row.apr_TargetAmount || 0),
            may_TargetAmount: Number(row.may_TargetAmount || 0),
            jun_TargetAmount: Number(row.jun_TargetAmount || 0),
            jul_TargetAmount: Number(row.jul_TargetAmount || 0),
            aug_TargetAmount: Number(row.aug_TargetAmount || 0),
            sep_TargetAmount: Number(row.sep_TargetAmount || 0),
            oct_TargetAmount: Number(row.oct_TargetAmount || 0),
            nov_TargetAmount: Number(row.nov_TargetAmount || 0),
            dec_TargetAmount: Number(row.dec_TargetAmount || 0),
            jan_TargetAmount: Number(row.jan_TargetAmount || 0),
            feb_TargetAmount: Number(row.feb_TargetAmount || 0),
            mar_TargetAmount: Number(row.mar_TargetAmount || 0),
        }));

        setLoading({ ...loading, save: true });
        try {
            const res = await axiosInstance.post("TargetSheet/SaveSalesManagerTarget", finalPayload);
            if (res.data.success) {
                toast.success("Targets saved successfully!");
            }
        } catch (error) {
            toast.error("Failed to save data");
        } finally {
            setLoading({ ...loading, save: false });
        }
    };

    const calculateTotal = (row) => {
        return monthKeys.reduce((acc, key) => acc + (Number(row[key]) || 0), 0);
    };

    // each month column total 
    const getColumnTotal = (key) => {
        return tableData.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
    }
    const grandTotal = monthKeys.reduce((acc, key) => acc + getColumnTotal(key), 0)

    const handleExport = () => {

        if (searchData.salesManagerIDs.length === 0) {
            toast.error("Sales managers are required!")
            return;
        }
        if (!searchData.financialYear || searchData.financialYear === "") {
            toast.error("Financial Year is required!")
            return;
        }
            axiosInstance
            .post("TargetSheet/GetSalesManagerTargetForExcel",searchData, { responseType: 'blob' })
                .then((res) => {

                    const url = window.URL.createObjectURL(
                        new Blob([res.data], {
                            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                        })
                    );

                    // Create temporary link
                    const link = document.createElement("a");
                    link.href = url;

                    // File name
                    link.setAttribute("download", "SalesManagerTarget.xlsx");

                    // Trigger download
                    document.body.appendChild(link);
                    link.click();

                    // Cleanup
                    link.remove();
                    window.URL.revokeObjectURL(url);
                    
                })
                .catch((err) => {
                    toast.error("Failed to export data");
                    console.log("Export error", err);               
                })
                .finally(() => {                    
                });
        };

    return (
        <div className="salesTab">
            <Heading title={"Sales"} />
            <div className="card px-2 py-2 h-100">
                <div className="row mb-2 mt-1">
                    <div className="col-sm-3 col-md-2">
                        <MultiSelectComp
                            label="Sales Managers"
                            options={salesManagers}
                            value={searchData?.salesManagerIDs}
                            name="salesManagerIDs"
                            id="salesManagerIDs"
                            onChange={handleMultiSelectChange}
                        />
                    </div>
                    <div className="col-sm-3 col-md-2">
                        <ReactSelect
                            dynamicOptions={fyList}
                            name="financialYear"
                            isShowBorder={true}
                            lable={t("Finacial Year")}
                            id="financialYear"
                            removeIsClearable={false}
                            placeholderName={t("Finacial Year")}
                            value={searchData?.financialYear}
                            onChange={handleSelectChange}
                            className="required-fields"
                        />
                    </div>
                    {/* <div className="col-sm-3 col-md-2"> */}
                        <SearchButton
                            text={"Search"}
                            className="mr-2"
                            onClick={handleSearch}
                        />
                        <SaveButton
                            text={"Save"}
                            className="mr-2"
                            onClick={handleSave}
                        />
                         
                    {/* </div> */}
                    <CustomButton text="Excel Export" className="mr-2" onClick={handleExport} icon="excel"/>
                </div>
            </div>

            {tableData?.length > 0 ? (
                <div className="card px-2 py-2" style={{ overflowX: "auto" }}>
                    <Tables className="table-sm">
                        <thead>
                            <tr>
                                <th style={{ minWidth: "30px" }}>{t("S.No")}</th>
                                <th style={{ minWidth: "150px" }}>{t("Sales Manager")}</th>
                                {monthNames.map((m, i) => (
                                    <th key={m} style={{ minWidth: "80px" }}>
                                        <div className="text-center" style={{ fontSize: "12px" }}>{m}</div>
                                        <input
                                            type="number"
                                            placeholder="Fill All"
                                            className="form-control form-control-xs mt-1"
                                            style={{
                                                fontSize: "10px",
                                                padding: "2px",
                                                border: "1px dashed #007bff",
                                                background: "#f0f7ff",
                                                textAlign: "start"
                                            }}
                                            onFocus={(e) => e.target.select()}
                                            onChange={(e) => handleBulkMonthUpdate(monthKeys[i], e.target.value)}
                                        />
                                    </th>
                                ))}
                                <th style={{ minWidth: "80px" }}>{t("Total")}</th>
                                <th>
                                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData?.map((row, index) => (
                                <tr key={index}>
                                    <td data-title={"S.No"}>{index + 1}</td>
                                    <td data-title={"Sales Manager"}>{row?.salesManagerName || row?.salesManagerID}</td>
                                    {monthKeys?.map((key, i) => (
                                        <td key={key} data-title={monthNames[i]}>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm text-start"
                                                style={{ textAlign: 'left', padding: "2px 4px", fontSize: "13px" }}
                                                value={row[key]}
                                                onFocus={(e) => e.target.select()}
                                                onChange={(e) => handleInputChange(index, key, e.target.value)}
                                            />
                                        </td>
                                    ))}

                                    <td className="fw-bold text-end" data-title={"Total"}>{calculateTotal(row).toLocaleString()}</td>
                                    <td className="text-center" data-title={"Select"}>
                                        <input
                                            type="checkbox"
                                            checked={row?.checked || false}
                                            onChange={() => handleRowCheck(index)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot style={{ backgroundColor: "#f8f9fa" }}>
                            <tr className="fw-bold">
                                <td></td>
                                <td>{t("Grand Total")}</td>
                                {monthKeys.map((key) => (
                                    <td key={`total-${key}`} style={{ fontWeight: 500 }} className="text-start">
                                        {getColumnTotal(key).toLocaleString()}
                                    </td>
                                ))}
                                <td className="text-end" style={{ fontWeight: 700, color: "#007bff" }}>
                                    {grandTotal.toLocaleString()}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </Tables>
                </div>
            ) : (
                <NoRecordFound />
            )}
        </div>
    )
}
export default SalesTab;