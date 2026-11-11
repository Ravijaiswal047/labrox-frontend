import React, { useEffect, useMemo, useState, useRef } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import { isChecked } from "../util/Commonservices";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import Pagination from "../../Pagination/Pagination";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Modal from "../../components/formComponent/Modal";
import { Button } from "react-bootstrap";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import TransferTestCentreMappingModal from "./TransferTestCentreMappingModal"
import * as XLSX from "xlsx";

const TestCentreMapping = () => {
  const [loading, setLoading] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [FetchDepartment, setFetchDepartment] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [FetchCentre, setFetchCentre] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [logData, setLogData] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [payload, setPayload] = useState({
    BookingCentreId: 0,
    DepartmentId: 0,
    TestName: "",
  });
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [openTemplate, setOpenTemplate] = useState(false);
  const [templateFormData, setTemplateFormData] = useState({
    BookingCentreId: "",
  });
  const [templateData, setTemplateData] = useState([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const fileInputRef = useRef(null);

  const handleChangeSelect = (e, index) => {
    const { name, value } = e.target;
    if (index >= 0) {
      const data = [...tableData];
      data[index][name] = value;
      setTableData(data);
    } else {
      const val = tableData?.map((ele) => {
        return {
          ...ele,
          [name]: value,
        };
      });
      setTableData(val);
    }
  };
  const handleCollection = (e, index) => {
    const { name, checked } = e.target;
    const datas = [...tableData];
    datas[index][name] = checked ? "1" : "0";
    setTableData(datas);
  };
  const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value?.value });
    setTableData([]);
  };

  const fetchCenter = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            label: ele?.Centre,
            value: String(ele?.CentreID),
          };
        });
        // val.unshift({ label: "Booking Centre", value: "" });
        setPayload(prev=>({...prev, BookingCentreId: val?.[0]?.value}))
        setFetchCentre(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
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
        val.unshift({ label: "Department", value: "" });
        setFetchDepartment(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  const filteredTableData = tableData
    .map((item, index) => ({ ...item, originalIndex: index }))
    .filter((item) =>
      `${item?.TestName || ""}`
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );

  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredTableData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredTableData]);

  const SearchApi = () => {
    if (payload?.BookingCentreId) {
      if (!payload?.DepartmentId && !payload?.TestName) {
        toast.warn("Department or Test One of them is Required");
        return;
      }
      setLoad(true);
      setTableData([]);

      const finalPayload = {
        BookingCentreID:Number(payload?.BookingCentreId),
        DepartmentID:Number(payload?.DepartmentId),
        TestName:payload?.TestName,
      }
      axiosInstance
        .post("TestCentreMappingController/getTestCentre", finalPayload)
        .then((res) => {
          if (Array.isArray(res?.data?.message)) {
            setTableData(res?.data?.message);
            setCurrentPage(1);
          } else {
            toast.error("No Record Found");
            setTableData([]);
          }
          setLoad(false);
        })
        .catch((err) => {
          setTableData([]);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong"
          );
          setLoad(false);
        });
    } else {
      setTableData([]);
      toast.error("Please Select Centre & Department");
    }
  };

  const getLog = (row) => {
    setLogLoading(true);
    axiosInstance
      .post("TestCentreMappingController/GetTestCentreMappingLog", {
        BookingCentreId: payload?.BookingCentreId,
        InvestigationId: row?.InvestigationID,
      })
      .then((res) => {
        if(res.data.success && Array.isArray(res?.data?.message)){
          setLogData(res?.data?.message || []);
          setShowLog(true);
        }else{
          setLogData([]);
          toast.error(res?.data?.message);
          setShowLog(false);
        }
        setLogLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong"
        );
        setLogLoading(false);
      });
  };

  const handleCheckbox = (e) => {
    const { checked } = e.target;
    // Update only the filtered items
    const data = [...tableData];
    filteredTableData.forEach((ele) => {
      data[ele.originalIndex].isActive = checked ? "1" : "0";
    });

    setTableData(data);
  };
  const handleSave = () => {
    const checkedData = tableData.filter((ele) => ele?.isActive == "1");

    if (checkedData?.length > 0) {
      setLoading(true);
      const data = checkedData.map((ele) => {
        return {
          BookingCentreId: Number(payload?.BookingCentreId),
          InvestigationId: Number(ele?.InvestigationID),
          DepartmentId: Number(payload?.DepartmentId),
          TestCentreId1: Number(ele?.Test_Centre),
          TestCentreId2: Number(ele?.Test_Centre2),
          TestCentreId3: Number(ele?.Test_Centre3),
        };
      });
      axiosInstance
        .post("TestCentreMappingController/SaveTestCentreMapping", data)
        .then((res) => {
          toast.success(res?.data?.message);
          setLoading(false);
          SearchApi();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong"
          );
          setLoading(false);
        });
    } else {
      toast.error("Please Choose One Row");
    }
  };

  useEffect(() => {
    fetchCenter();
    fetchDepartment();
  }, []);

  const fetchTemplateData =async (bookingCentreId) => {
    try {
      const res = await axiosInstance.get(`TestCentreMappingController/DownloadTestCentreMappingTemplate?bookingCentreId=${bookingCentreId}`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${bookingCentreId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.log("Error while downloading template", error)
    }
  }

  const handleTableSelectChange = (name, options) => {
    setTemplateFormData((prev) => ({
      ...prev,
      [name]: options?.value,
    }));
    // fetchTemplateData(options?.value)
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target.result;
        const workbook = XLSX.read(new Uint8Array(data), { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (jsonData.length === 0) {
          toast.error("The uploaded file is empty.");
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        setTemplateData(jsonData);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        toast.error("Error reading file.");
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleImportSave = () => {
    if (templateData.length === 0) return;
    setLoading(true);
    axiosInstance
      .post("TestCentreMappingController/ImportTestCentreMapping", templateData)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Imported successfully.");
          setOpenTemplate(false);
          setTemplateData([]);
        } else {
          toast.error(res?.data?.message || "Import failed.");
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Something went wrong during import."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  console.log("logdata", logData)
  return (
    <>
      <Accordion
        name={t("Test Mapping")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2 col-md-2">
            <ReactSelect
              dynamicOptions={FetchCentre}
              name="BookingCentreId"
              label={t("Centre")}
              placeholderName={t("Centre")}
              id="BookingCentreId"
              value={payload?.BookingCentreId}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <ReactSelect
              dynamicOptions={FetchDepartment}
              name="DepartmentId"
              label={t("Department")}
              placeholderName={t("Department")}
              id="DepartmentId"
              value={payload?.DepartmentId}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              id="Test Name"
              lable="Test Name"
              placeholder=" "
              type="text"
              value={payload?.TestName}
              name="TestName"
              onChange={(e) => {
                setPayload({ ...payload, TestName: e.target.value });
              }}
            />
          </div>
          <div className="col-sm-auto">
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                type="search"
                icon={"search"}
                text={t("Search")}
                onClick={SearchApi}
              />
            )}
          </div>
          <div className="col-sm-auto">
            <CustomButton
              onClick={() => setOpenTemplate(true)}
              text={t("Export / Import")}
              icon={"excel"}
            />
          </div>
          <div className="col-sm-auto">
            <CustomButton
              onClick={() => setShowTransferModal(true)}
              text={t("Transfer")}
              icon={"send"}
            />
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div className=" d-flex" style={{ gap: "5px" }}>
            <div>
              <Input
                type="text"
                placeholder="Search Investigation..."
                value={searchText}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setSearchText(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        }
      >
        {filteredTableData.length > 0 ? (
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
  <thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "white" }}>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Investigation")}</th>
                    <th>
                      <SelectBox
                        options={[{ label: "Select", value: "" }, ...FetchCentre]}
                        onChange={(e) => {
                          handleChangeSelect(e);
                        }}
                        name="Test_Centre"
                      ></SelectBox>
                    </th>
                    <th>
                      <SelectBox
                        options={[{ label: "Select", value: "" }, ...FetchCentre]}
                        onChange={(e) => {
                          handleChangeSelect(e);
                        }}
                        name="Test_Centre2"
                      ></SelectBox>
                    </th>
                    <th>
                      <SelectBox
                        options={[{ label: "Select", value: "" }, ...FetchCentre]}
                        onChange={(e) => {
                          handleChangeSelect(e);
                        }}
                        name="Test_Centre3"
                      ></SelectBox>
                    </th>

                    <th>
                      <input
                        type="checkbox"
                        checked={
                          filteredTableData.length > 0
                            ? isChecked("isActive", filteredTableData, "1").includes(
                                false
                              )
                              ? false
                              : true
                            : false
                        }
                        onChange={handleCheckbox}
                      />
                    </th>
                    <th>Log</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((data, i) => (
                    <tr key={i}>
                      <td data-title={t("S.No")}>{(currentPage - 1) * pageSize + i + 1}&nbsp;</td>
                      <td data-title={t("Investigation")}>
                        {data?.TestName}&nbsp;
                      </td>
                      <td data-title={t("Test_Centre")}>
                        <SelectBox
                          options={[
                            { label: "--Select--", value: "" },
                            ...FetchCentre,
                          ]}
                          selectedValue={data?.Test_Centre}
                          name="Test_Centre"
                          onChange={(e) => handleChangeSelect(e, data.originalIndex)}
                        ></SelectBox>
                      </td>
                      <td data-title={t("Test_Centre2")}>
                        <SelectBox
                          options={[
                            { label: "--Select--", value: "" },
                            ...FetchCentre,
                          ]}
                          selectedValue={data?.Test_Centre2}
                          name="Test_Centre2"
                          onChange={(e) => handleChangeSelect(e, data.originalIndex)}
                        ></SelectBox>
                      </td>
                      <td data-title={t("Test_Centre3")}>
                        <SelectBox
                          options={[
                            { label: "--Select--", value: "" },
                            ...FetchCentre,
                          ]}
                          selectedValue={data?.Test_Centre3}
                          name="Test_Centre3"
                          onChange={(e) => handleChangeSelect(e, data.originalIndex)}
                        ></SelectBox>
                      </td>
                      <td data-title={t("Status")}>
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={data?.isActive === "1" ? true : false}
                          onChange={(e) => handleCollection(e, data.originalIndex)}
                        />
                      </td>
                      <td data-title={t("Log")}>
                        <i
                          className="fa fa-search text-primary"
                          style={{ cursor: "pointer" }}
                          onClick={() => getLog(data)}
                        ></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
               </Tables>
              {filteredTableData.length > 0 && (
                <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
                  <div style={{ minWidth: "150px" }}>
                    <ReactSelect
                      value={pageSize}
                      dynamicOptions={[
                        { label: "25", value: 25 },
                        { label: "50", value: 50 },
                        { label: "100", value: 100 },
                        { label: "150", value: 150 },
                        { label: "250", value: 250 },
                      ]}
                      name={"pageSize"}
                      label={t("pageSize")}
                      removeIsClearable={true}
                      onChange={(name, value) => {
                        setPageSize(value?.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  <Pagination
                    className="pagination-bar"
                    currentPage={currentPage}
                    totalCount={filteredTableData.length}
                    pageSize={pageSize}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                    }}
                  />
                </div>
              )}
              <div className="row pt-2 pl-2 pr-2">
                <div className="col-sm-2">
                  {loading ? (
                    <Loading />
                  ) : (
                    <SaveButton
                    text={t("Save")}
                      onClick={handleSave}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>

      {showLog && (
        <Modal
          visible={showLog}
          setVisible={setShowLog}
          Header={t("Test Centre Mapping Log")}
          modalWidth="90vw"
        >
          <div className="row p-2">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Investigation")}</th>
                    <th>{t("Billing Centre")}</th>
                    <th>{t("Old TC 1")}</th>
                    <th>{t("New TC 1")}</th>
                    <th>{t("Old TC 2")}</th>
                    <th>{t("New TC 2")}</th>
                    <th>{t("Old TC 3")}</th>
                    <th>{t("New TC 3")}</th>
                    <th>{t("Old Entry Date")}</th>
                    <th>{t("Old Entry By")}</th>
                    <th>{t("New Entry Date")}</th>
                    <th>{t("New Entry By")}</th>
                  </tr>
                </thead>
                <tbody>
                  {logData.length > 0 ? (
                    logData.map((log, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{log?.Investigation}</td>
                        <td>{log?.BookingCentre}</td>
                        <td>{log?.OldCentre1}</td>
                        <td>{log?.NewCentre1}</td>
                        <td>{log?.OldCentre2}</td>
                        <td>{log?.NewCentre2}</td>
                        <td>{log?.OldCentre3}</td>
                        <td>{log?.NewCentre3}</td>
                        <td>{log?.OldDtEntry || "-"}</td>
                        <td>{log?.OldCreatedByName || "-"}</td>
                        <td>{log?.NewDtEntry || "-"}</td>
                        <td>{log?.NewCreatedByName || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center">
                        {t("No Log Found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Tables>
            </div>
          </div>
        </Modal>
      )}

      <Dialog
        header={`Import Excel to Upload`}
        visible={openTemplate}
        onHide={() => {
          setOpenTemplate(false);
          setTemplateData([]);
        }}
        className={theme}
        style={{ width: isMobile ? "90vw" : "60vw" }}
        breakpoints={{ "98%": "59vw" }}
      >
        <div className="row col-12 pt-2 pl-2 pr-2 mb-2">
          <div className="col-3">
            <ReactSelect
              label={t("Booking Centre")}
              placeholderName={t("Booking Centre")}
              name="BookingCentreId"
              value={templateFormData?.BookingCentreId}
              onChange={handleTableSelectChange}
              dynamicOptions={FetchCentre}
              removeIsClearable={true}
            />
          </div>
          <div className="col-auto">
            <CustomButton
              text={t("Download Template")}
              icon={"download"}
              onClick={() => fetchTemplateData(templateFormData?.BookingCentreId)}
            />
          </div>
          <div className="col-auto">
            <CustomButton
              text={t("Upload Template")}
              icon={"excel"}
              onClick={handleUploadClick}
            />
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>

        </div>
        {templateData.length > 0 && (
          <div className="row p-2">
            <div className="col-12" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <Tables>
                <thead>
                  <tr>
                    {Object.keys(templateData[0]).map((key, index) => (
                      <th key={index}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {templateData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.keys(row).map((key, colIndex) => (
                        <td data-title={key} key={colIndex}>{row[key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
            <div className="col-12 mt-2 d-flex justify-content-end">
              {loading ? (
                <Loading />
              ) : (
                <SaveButton
                  text={t("Save Data")}
                  onClick={handleImportSave}
                />
              )}
            </div>
          </div>
        )}
      </Dialog>

      <TransferTestCentreMappingModal
        show={showTransferModal}
        handleClose={() => setShowTransferModal(false)}
        CentreData={FetchCentre}
        DepartmentData={FetchDepartment}
        FromCentreId={payload?.BookingCentreId}
      />
    </>
  );
};

export default TestCentreMapping;
