import React, { useEffect, useRef, useState } from "react";

// import { CustomButton, SaveButton } from "../components/UI/CustomButton";

// import Loading from "../components/loader/Loading";
import { useTranslation } from "react-i18next";

import { toast } from "react-toastify";
// import Accordion from "../components/UI/Accordion";

// import Tables from "../components/UI/customTable";

// import ColorCodingSearch from "../components/ModalComponent/ColorCodingSearch";

// import { exportToExcel, ExportToExcel } from "../utils/helpers"
// import { Dialog } from "primereact/dialog";
// import { useLocalStorage } from "../utils/hooks/useLocalStorage";
// import MultiSelectComp from '../components/formComponent/MultiSelectComp'
// import NoRecordFound from "../components/formComponent/NoRecordFound";

import * as XLSX from "xlsx";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Heading from "../../../components/UI/Heading";
import { CustomButton } from "../../../components/UI/CustomButton";
import { getAccessCentresReports } from "../../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../utils/axiosInstance";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import Accordion from "../../../components/UI/Accordion";
import Tables from "../../../components/UI/customTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import MultiSelectCompforStore from "../../../components/formComponent/MultiSelectCompforStore";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { ExportToExcel } from "../../../utils/helpers";
import Pagination from "../../../Pagination/Pagination";
const CreateShareMaster = () => {
    const { t } = useTranslation();
    const [dropDownApis, setDropDownApis] = useState({
        Center: [],
        Department: [],
        FromCenter: [],
        ToCenter: [],
        CenterName: []

    });
    console.log("dropDownApis", dropDownApis);

    const [payload, setPayload] = useState({
        Center: "",
        Department: "",
        DepartmentName: "",
        FromCenter: "",
        ToCenter: "",
        CenterName: ""

    });
    console.log("payload", payload);
    const [activeData, setActiveData] = useState([]);
    const [currentData, setCurrentData] = useState([]);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [showExcelModal, setShowExcelModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [excelData, setExcelData] = useState([]);
    const [allKeys, setAllKeys] = useState([]); 
    
    // Pagination for Excel Import Modal
    const [excelCurrentPage, setExcelCurrentPage] = useState(1);
    const rowsPerPage = 50;
    
    const theme = useLocalStorage("theme", "get");
    const isMobile = window.innerWidth <= 768;
    
    // Calculate pagination for excel data
    const excelIndexOfLastRow = excelCurrentPage * rowsPerPage;
    const excelIndexOfFirstRow = excelIndexOfLastRow - rowsPerPage;
    const excelCurrentData = excelData.slice(excelIndexOfFirstRow, excelIndexOfLastRow);
    const excelTotalPages = Math.ceil(excelData.length / rowsPerPage);
    
    useEffect(() => {
        setExcelCurrentPage(1);
    }, [excelData]);
    
    const handleSelectChange = (name, value) => {
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
                FromCenter: data,
                ToCenter: data,
                CenterName: data
            }));
        });

    }, []);
    const handleSelectMultiChange = (name, value) => {
        // setFormData({ ...formData, [name]: value });
        setPayload({ ...payload, [name]: value });
    };

    const fetchDepartment = () => {
        axiosInstance
            .get("TestCentreMappingController/BindDepartment")
            .then((res) => {
                const data = res?.data?.message;
                const val = data?.map((ele) => {
                    return {
                        label: ele?.department,
                        value: ele?.departmentid,
                    };
                });
                setDropDownApis((prev) => ({ ...prev, Department: val }));
            }
            )
            .catch((err) => console.log(err));
    };
    useEffect(() => {
        fetchDepartment();
    }, []);
    //search

    // SEARCH
    const handleSearch = () => {
        const finalPayload = {
            centreID: payload?.Center,
            departmentID: payload?.Department || 0,
        };

        axiosInstance
            .post("CentreTypeShare/GetCentreTypeShare", finalPayload)
            .then((res) => {
                const data = Array.isArray(res?.data?.data)
                    ? res?.data?.data
                    : Array.isArray(res?.data?.message)
                        ? res?.data?.message
                        : [];

                setActiveData(data);
                setCurrentData(data);

                if (data.length === 0) {
                    toast.error("No Data Found");
                }
            })
            .catch((err) => {
                console.log(err);

                setActiveData([]);
                setCurrentData([]);

                toast.error("No Data Found");
            });
    };
    const downloadExcel = (centreID) => {
        if (!centreID) {
            toast.error("Please select Center first");
            return;
        }
        axiosInstance
              .post("CentreTypeShare/GetCentreShareDownloadTemplete", { centreID })
              .then((res) => {
                if (res?.data?.message?.length > 0) {
                  ExportToExcel(res?.data?.message, "CentreShareMaster.xls");
                } else {
                  toast?.error("Data not Found");
                }
              })
              .catch((err) => {
                console.error(err?.response?.data?.message || "Error Occurred");
              });
    }
    //excel import (file upload)
  const fileInputRef = useRef(null);
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }); // fill empty cells with ""

      // Get all unique keys across all rows
      const allKeys = Array.from(
        new Set(
          jsonData.flatMap((row) => Object.keys(row))
        )
      );

        setAllKeys(allKeys);
      setExcelData(jsonData);
        

      toast.success("Excel imported successfully");
    };

    reader.readAsArrayBuffer(file);
    
    // Reset file input
    e.target.value = null;
  };

  const handleSave = () => {
    if (!payload?.CenterName) {
      toast.error("Please select Center first");
      return;
    }

    if (excelData.length === 0) {
      toast.error("Please import Excel data first");
      return;
    }

    setLoading(true);

    const importPayload = {
      CentreID: payload?.CenterName,
      request: excelData
    };

    console.log("Saving payload:", importPayload);

    axiosInstance
      .post("CentreTypeShare/ImportCentreTypeShare", importPayload)
      .then((res) => {
        toast.success("Data saved successfully");
        setShowExcelModal(false);
        setExcelData([]);
        setAllKeys([]);
        setPayload({ ...payload, CenterName: "" });
        handleSearch(); // Refresh the main table
      })
      .catch((err) => {
        console.error("Save Error:", err?.response?.data);
        toast.error(err?.response?.data?.errors?.request?.[0] || "Save failed");
      })
      .finally(() => {
        setLoading(false);
      });
  };
    return (
        <>
            <div>
                <div className="card">
                    <Heading name={t("Create Share Master")} isBreadcrumb={true} />
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
                                name="Department"
                                id="Department"
                                removeIsClearable={true}
                                placeholderName={t("Department")}
                                dynamicOptions={dropDownApis?.Department?.map((ele) => ({
                                    label: ele.label,
                                    value: ele.value,
                                }))}
                                value={payload?.Department}
                                onChange={handleSelectChange}
                            />
                        </div>
                        <CustomButton text="Search" icon="search"
                            onClick={handleSearch}
                            className="mx-2 rounded-15" />

                        <CustomButton text="Import Excel"
                            icon="excel"
                            className="mx-2 rounded-15"
                            onClick={() => setShowExcelModal(true)} />

                        <CustomButton text="Transfer Data"
                            icon="transfer"
                            className="mx-2 rounded-15"
                            onClick={() => setShowTransferModal(true)} />
                    </div>


                </div>

                {/* TABLE */}
                <div className="mt-2">
                    <Accordion title={t("Share Master Data")} defaultValue={true}>
                        {activeData.length > 0 ? (
                            <div className="row px-1">
                                <div className="col-12">
                                    <Tables style={{
                                        height: "300px",
                                        minHeight: "300px",
                                        overflowY: "scroll"
                                    }}
                                    >
                                        <thead className="cf">
                                            <tr>
                                                <th>{t("S.No")}</th>
                                                <th>{t("Test Code")}</th>
                                                <th>{t("Test Name")}</th>
                                                <th>{t("Share Amt")}</th>
                                                <th>{t("Share Per")}</th>
                                                    <th>
                                                {t("Action")}
                                                <input
                                                    type="checkbox"
                                                    style={{ marginLeft: "6px", cursor: "pointer" }}
                                                    // FIX: only checked when all items exist AND all are isActive:true
                                                    checked={
                                                        ""
                                                    }
                                                    onChange={""}
                                                />
                                            </th>


                                            </tr>
                                        </thead>

                                        <tbody>
                                            {currentData.map((data, index) => (
                                                <tr key={index}>
                                                    <td>{ index + 1}</td>
                                                    <td>{data?.TestCode}</td>
                                                    <td>{data?.TestName}</td>
                                                    <td>{data?.ShareAmount}</td>
                                                    <td>{data?.SharePer}</td>
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                name={String(index)}
                                                                checked={""}
                                                                onChange={""}
                                                            />
                                                        </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </Tables>
                                 
                                    {/* PAGINATION */}
                                    {/* <div className="d-flex justify-content-end align-items-center mt-2">
                                <Pagination
                                  className="pagination-bar"
                                  currentPage={currentPage}
                                  totalCount={activeData.length}
                                  pageSize={rowsPerPage}
                                  onPageChange={(page) => setCurrentPage(page)}
                                />
                              </div> */}

                                </div>
                            </div>
                        ) : (
                            <NoRecordFound />
                        )}
                    </Accordion>
                </div>

                {/* {dialog 1} */}
                <Dialog
                    header="Transfer:-Create Share Master"
                    visible={showTransferModal}
                    className={theme}
                    style={{ width: isMobile ? "90vw" : "50vw" }}
                    onHide={() => {
                        setShowTransferModal(false);

                        setPayload({ ...payload, DepartmentName: [], FromCenter: "", ToCenter: "" });
                    }}
                    modal
                >
                    <div className="container-fluid">

                        {/* First Row - From & To (Full Width split) */}
                        <div className="row mb-4 mt-2">
                            <div className="col-sm-6">
                                <ReactSelect
                                    dynamicOptions={dropDownApis?.FromCenter?.map((ele) => ({
                                        label: ele.label,
                                        value: ele.value,
                                    }))}
                                    value={payload.FromCenter}
                                    name="FromCenter"
                                    removeIsClearable={true}
                                    onChange={handleSelectChange}
                                    placeholderName={t("From Center")}
                                />
                            </div>

                            <div className="col-sm-6">
                                <ReactSelect
                                    dynamicOptions={dropDownApis?.ToCenter?.map((ele) => ({
                                        label: ele.label,
                                        value: ele.value,
                                    }))}
                                    value={payload.ToCenter}
                                    name="ToCenter"
                                    removeIsClearable={true}
                                    onChange={handleSelectChange}
                                    placeholderName={t("To Center")}
                                />
                            </div>
                        </div>

                        {/* Second Row - Department full width */}
                        <div className="row mb-10">
                            <div className="col-sm-6">
                                <MultiSelectComp
                                    label={t("Department")}
                                    value={payload.DepartmentName}
                                    id="DepartmentName"
                                    name="DepartmentName"

                                    options={dropDownApis?.Department?.map((ele) => ({
                                        label: ele.label,
                                        value: ele.value,
                                    }))}

                                    onChange={handleSelectMultiChange}
                                />
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="col-12 mt-3 d-flex justify-content-center">
                            <div style={{ textAlign: "left" }}>
                                <CustomButton text="Transfer"

                                />
                            </div>
                        </div>

                    </div>
                </Dialog>

                {/* dialog2 */}
                <Dialog
                    header="Excel Upload -Create Share Master"
                    visible={showExcelModal}
                    className={theme}
                    style={{ width: isMobile ? "90vw" : "50vw" }}
                    onHide={() => {
                        setShowExcelModal(false);

                        setPayload({ ...payload, CenterName: "" });
                    }}
                    modal
                >
                    <div className="container-fluid">

                        {/* First Row - From & To (Full Width split) */}
                        <div className="row mb-4 mt-2">


                            <div className="col-sm-6">
                                <ReactSelect
                                    dynamicOptions={dropDownApis?.CenterName?.map((ele) => ({
                                        label: ele.label,
                                        value: ele.value,
                                    }))}
                                    value={payload?.CenterName}
                                    name="CenterName"
                                    removeIsClearable={true}
                                    onChange={handleSelectChange}
                                    placeholderName={t("To Center")}
                                />
                            </div>
                            <CustomButton
                                className=" mx-2"
                                text="export"
                                icon="excel"
                             onClick={downloadExcel.bind(this, payload?.CenterName)}
                            />
                            {/* <CustomButton
                                className=" mx-2"
                                text="Import"
                                icon="excel"
                            //  onClick={handleImport}
                            /> */}
                            <>
                                        <input
                                          type="file"
                                          accept=".xlsx, .xls"
                                          ref={fileInputRef}
                                          style={{ display: "none" }}
                                          onChange={handleFileUpload}
                                        />
                            
                                        <CustomButton
                                          text={"Import"}
                                          icon={"excel"}
                                          className="ml-2 btn rounded"
                                          onClick={() => fileInputRef.current.click()}
                                        />
                                          <CustomButton
                                          text={"Save"}
                                          icon={"save"}
                                          className="ml-2 btn rounded"
                                          onClick={handleSave}
                                          disabled={loading || excelData.length === 0}
                                        />
                                      </>
                        </div>
                        {/* TABLE */}
                <div className="mt-2">
                    <Accordion title={t("Share Master Data")} defaultValue={true}>
                        {excelData.length > 0 ? (
                            <div className="row px-1">
                                <div className="col-12">
                                    <Tables style={{
                                        height: "300px",
                                        minHeight: "300px",
                                        overflowY: "scroll"
                                    }}
                                    >
                                        <thead className="cf">
                                            <tr>
                                                <th>{t("S.No")}</th>
                                                {allKeys.map((key, idx) => (
                                                    <th key={idx}>{key}</th>
                                                ))}
                                                    <th>
                                                {t("Action")}
                                                <input
                                                    type="checkbox"
                                                    style={{ marginLeft: "6px", cursor: "pointer" }}
                                                    checked={""}
                                                    onChange={""}
                                                />
                                            </th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {excelCurrentData.map((data, index) => (
                                                <tr key={index}>
                                                    <td>{ index + 1 + (excelCurrentPage - 1) * rowsPerPage}</td>
                                                    {allKeys.map((key, idx) => (
                                                        <td key={idx}>{data[key] || "-"}</td>
                                                    ))}
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                name={String(index)}
                                                                checked={""}
                                                                onChange={""}
                                                            />
                                                        </td>

                                                </tr>
                                            ))}
                                        </tbody>
                                    </Tables>
                                 
                                    {/* PAGINATION */}
                                    <div className="d-flex justify-content-end align-items-center mt-2">
                                <Pagination
                                  className="pagination-bar"
                                  currentPage={excelCurrentPage}
                                  totalCount={excelData.length}
                                  pageSize={rowsPerPage}
                                  onPageChange={(page) => setExcelCurrentPage(page)}
                                />
                              </div>

                                </div>
                            </div>
                        ) : (
                            <NoRecordFound />
                        )}
                    </Accordion>
                </div>
                    </div>
                </Dialog>
            </div>
        </>
    )
}

export default CreateShareMaster