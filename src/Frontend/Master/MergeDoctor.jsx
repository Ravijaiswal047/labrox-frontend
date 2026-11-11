import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import { isChecked } from "../util/Commonservices";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import Pagination from "../../Pagination/Pagination";
import ReactSelect from "../../components/formComponent/ReactSelect";
import * as XLSX from "xlsx";
import {
  CustomButton,
  SaveButton,
  SearchButton,
  CancelButton,
} from "../../components/UI/CustomButton";
import Accordion from "../../components/UI/Accordion";
import CustomTabs from "../../components/UI/CustomTabs";
import Modal from "../../components/formComponent/Modal";

const PAGE_SIZE_OPTIONS = [
  { label: "25", value: 25 },
  { label: "50", value: 50 },
  { label: "100", value: 100 },
  { label: "150", value: 150 },
];

const LOG_SORT_KEYS = [
  "MergeDate",
  "MergeByName",
  "MergeDoctorName",
  "DoctorName",
];

const MergeDoctor = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("mergeDoctor");
  const [showConfirm, setShowConfirm] = useState(false);

  const [payload, setPayload] = useState({
    formDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    pro: "",
    DoctorGroupId: "",
    firstDoctor: "",
    secondDoctor: "",
    thirdDoctor: "",
  });

  const [tableData, setTableData] = useState([]);
  const [logTableData, setLogTableData] = useState([]);
  const [logSearched, setLogSearched] = useState(false);
  const [Center, setCenter] = useState([]);
  const [Pro, setPro] = useState([]);
  const [mergeDoctorOptions, setMergeDoctorOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [logSearchTerm, setLogSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logPage, setLogPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [logPageSize, setLogPageSize] = useState(50);
  const [logSort, setLogSort] = useState({ key: "MergeDate", dir: "desc" });

  const handleDate = (value, name) => {
    setPayload({ ...payload, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSelect = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const syncMergeOptions = (rows) => {
    const selectedOptions = rows
      .filter((ele) => ele.isChecked === "1")
      .map((ele) => ({
        label: `${ele.DoctorName || "NA"} # ${ele.ProEmployee || "NA"} # ${ele.ContactNo || "NA"}`,
        value: ele.DoctorID,
      }));
    setMergeDoctorOptions(selectedOptions);
    if (
      payload.DoctorGroupId &&
      !selectedOptions.some((opt) => String(opt.value) === String(payload.DoctorGroupId))
    ) {
      setPayload((prev) => ({ ...prev, DoctorGroupId: "" }));
    }
  };

  const handleCheck = (e, index) => {
    const { name, checked } = e.target;
    let updatedData = [];

    if (index >= 0) {
      updatedData = [...tableData];
      updatedData[index] = {
        ...updatedData[index],
        [name]: checked ? "1" : "0",
      };
    } else {
      const visibleIds = new Set(filteredData.map((row) => row.DoctorID));
      updatedData = tableData.map((ele) =>
        visibleIds.has(ele.DoctorID)
          ? { ...ele, [name]: checked ? "1" : "0" }
          : ele
      );
    }

    setTableData(updatedData);
    syncMergeOptions(updatedData);
  };

  const fetchCenter = () => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        const data = res.data.message;
        const value = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
          DefaultCentreId: ele.DefaultCentreId,
        }));
        setCenter(value);
      })
      .catch(() => {
        toast.error("Something went wrong");
      });
  };

  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        const data = res?.data?.message;
        const proData = data?.map((ele) => ({
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
        }));
        setPro(proData);
      })
      .catch(() => {});
  };

  const handleSearch = () => {
    const hasName =
      payload?.firstDoctor?.trim() ||
      payload?.secondDoctor?.trim() ||
      payload?.thirdDoctor?.trim();
    if (!hasName && !payload?.CentreID && !payload?.pro) {
      toast.error("Please enter a doctor name or select Centre / Pro Employee.");
      return;
    }

    setLoad(true);
    setSearchTerm("");
    setCurrentPage(1);
    setMergeDoctorOptions([]);
    setPayload((prev) => ({ ...prev, DoctorGroupId: "" }));

    axiosInstance
      .post("DoctorReferal/getTempDoctorData", {
        CentreID: String(payload?.CentreID || ""),
        ProEmployeeId: payload?.pro,
        FirstDoctor: payload?.firstDoctor?.trim() || "",
        SecondDoctor: payload?.secondDoctor?.trim() || "",
        ThirdDoctor: payload?.thirdDoctor?.trim() || "",
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          if (!data?.length) {
            toast.error("No data Found");
            setTableData([]);
            return;
          }
          setTableData(data.map((ele) => ({ ...ele, isChecked: "0" })));
        } else {
          setTableData([]);
          toast.error(res?.data?.message || "No data Found");
        }
      })
      .catch((err) => {
        setTableData([]);
        toast.error(err?.response?.data?.message || "Error Occur");
      })
      .finally(() => setLoad(false));
  };

  const getCheckedDoctors = () =>
    tableData.filter((ele) => ele?.isChecked === "1");

  const validateMerge = () => {
    const checkedDoctors = getCheckedDoctors();

    if (checkedDoctors.length === 0) {
      toast.error("No doctor selected");
      return null;
    }

    if (!payload.DoctorGroupId) {
      toast.error("Please select a main doctor to merge into");
      return null;
    }

    const targetId = Number(payload.DoctorGroupId);
    const sourceDoctors = checkedDoctors.filter(
      (ele) => Number(ele.DoctorID) !== targetId
    );

    if (sourceDoctors.length === 0) {
      toast.error("Cannot merge a doctor with itself. Select at least one duplicate doctor.");
      return null;
    }

    const targetDoctor = checkedDoctors.find(
      (ele) => Number(ele.DoctorID) === targetId
    );

    return { checkedDoctors, sourceDoctors, targetDoctor, targetId };
  };

  const openConfirm = () => {
    const result = validateMerge();
    if (!result) return;
    setShowConfirm(true);
  };

  const handleSave = () => {
    const result = validateMerge();
    if (!result) return;

    setSaving(true);
    axiosInstance
      .post("DoctorReferal/MergeDoctorReferal", {
        MergeDoctorID: result.targetId,
        DoctorIDs: result.checkedDoctors.map((ele) => Number(ele.DoctorID)),
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Doctors merged successfully.");
          setTableData([]);
          setMergeDoctorOptions([]);
          setSearchTerm("");
          setCurrentPage(1);
          setPayload((prev) => ({ ...prev, DoctorGroupId: "" }));
          setShowConfirm(false);
        } else {
          toast.error(res?.data?.message || "Merge failed.");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Merge failed.");
      })
      .finally(() => setSaving(false));
  };

  const handleLogSearch = async () => {
    if (!payload?.formDate || !payload?.ToDate) {
      toast.warn("Please select From Date and To Date.");
      return;
    }
    setLoad(true);
    setLogSearchTerm("");
    setLogPage(1);
    try {
      const res = await axiosInstance.post(
        "DoctorReferal/GetDoctorReferalMergeLog",
        {
          fromDate: moment(payload.formDate).format("YYYY-MM-DD"),
          toDate: moment(payload.ToDate).format("YYYY-MM-DD"),
          CentreId: Number(payload?.CentreID) || 0,
        }
      );
      setLogSearched(true);
      if (res?.data?.success && Array.isArray(res?.data?.message)) {
        setLogTableData(res.data.message);
        if (!res.data.message.length) {
          toast.error("No data found.");
        }
      } else {
        toast.error(res?.data?.message || "No data found.");
        setLogTableData([]);
      }
    } catch (error) {
      setLogSearched(true);
      toast.error(error?.response?.data?.message || "Error Occurred");
      setLogTableData([]);
    } finally {
      setLoad(false);
    }
  };

  const handleExcelDownload = () => {
    if (!logTableData.length) {
      toast.warn("No data to export. Please search first.");
      return;
    }
    const exportData = logTableData.map(
      ({ Address, Degree, ...rest }) => rest
    );
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Merge Doctor Log");
    XLSX.writeFile(workbook, "MergeDoctorLogReport.xlsx");
    toast.success("Excel downloaded successfully");
  };

  const handleTabSelect = (tab) => {
    if (!tab || tab === activeTab) return;
    setActiveTab(tab);
    setSearchTerm("");
    setLogSearchTerm("");
    setCurrentPage(1);
    setLogPage(1);
  };

  useEffect(() => {
    fetchCenter();
    getProEmployee();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const term = searchTerm.toLowerCase();
    return tableData.filter((row) =>
      ["DoctorName", "ProEmployee", "CentreName", "ContactNo", "Email", "ClinicName"].some(
        (key) => String(row[key] || "").toLowerCase().includes(term)
      )
    );
  }, [tableData, searchTerm]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const filteredLogData = useMemo(() => {
    let rows = [...logTableData];
    if (logSearchTerm.trim()) {
      const term = logSearchTerm.toLowerCase();
      rows = rows.filter((row) =>
        ["MergeDoctorName", "DoctorName", "MergeByName", "Mobile", "Email", "ClinicName"].some(
          (key) => String(row[key] || "").toLowerCase().includes(term)
        )
      );
    }
    rows.sort((a, b) => {
      const key = logSort.key;
      const va = a?.[key] || "";
      const vb = b?.[key] || "";
      if (key === "MergeDate") {
        const da = moment(va, ["DD-MMM-YYYY hh:mm A", "DD-MMM-YYYY hh:mm a"], true);
        const db = moment(vb, ["DD-MMM-YYYY hh:mm A", "DD-MMM-YYYY hh:mm a"], true);
        if (da.isValid() && db.isValid()) {
          return logSort.dir === "asc" ? da.valueOf() - db.valueOf() : db.valueOf() - da.valueOf();
        }
      }
      return logSort.dir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return rows;
  }, [logTableData, logSearchTerm, logSort]);

  const paginatedLogData = useMemo(() => {
    const start = (logPage - 1) * logPageSize;
    return filteredLogData.slice(start, start + logPageSize);
  }, [filteredLogData, logPage, logPageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, pageSize]);

  useEffect(() => {
    setLogPage(1);
  }, [logSearchTerm, logPageSize, logSort]);

  const toggleLogSort = (key) => {
    if (!LOG_SORT_KEYS.includes(key)) return;
    setLogSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "MergeDate" ? "desc" : "asc" }
    );
  };

  const sortMark = (key) => {
    if (logSort.key !== key) return "";
    return logSort.dir === "asc" ? " ▲" : " ▼";
  };

  const confirmDetails = useMemo(() => {
    const checked = getCheckedDoctors();
    const targetId = Number(payload.DoctorGroupId);
    return {
      target: checked.find((ele) => Number(ele.DoctorID) === targetId),
      sources: checked.filter((ele) => Number(ele.DoctorID) !== targetId),
    };
  }, [tableData, payload.DoctorGroupId]);

  const renderMergeTab = () => (
    <>
      <div className="row pt-2 pl-2 pr-2 mb-2">
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <SelectBox
            lable="Centre"
            id="CentreID"
            name="CentreID"
            onChange={handleSelect}
            selectedValue={payload?.CentreID}
            options={[{ label: "Select Centre", value: "" }, ...Center]}
          />
        </div>
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <Input
            type="text"
            placeholder=" "
            lable="Doctor 1"
            id="firstDoctor"
            name="firstDoctor"
            value={payload?.firstDoctor}
            onChange={handleChange}
          />
        </div>
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <Input
            type="text"
            placeholder=" "
            lable="Doctor 2"
            id="secondDoctor"
            name="secondDoctor"
            value={payload?.secondDoctor}
            onChange={handleChange}
          />
        </div>
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <Input
            type="text"
            placeholder=" "
            lable="Doctor 3"
            id="thirdDoctor"
            name="thirdDoctor"
            value={payload?.thirdDoctor}
            onChange={handleChange}
          />
        </div>
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <SelectBox
            lable="Pro Employee"
            id="pro"
            name="pro"
            onChange={handleSelect}
            selectedValue={payload?.pro}
            options={[{ label: "Select Pro", value: "" }, ...Pro]}
          />
        </div>
        <div className="col-sm-2 col-md-2 col-6 mb-2 d-flex align-items-center">
          {load ? <Loading /> : <SearchButton text={t("Search")} onClick={handleSearch} />}
        </div>
      </div>

      {tableData?.length > 0 && (
        <Accordion
          title={t("Search Data")}
          defaultValue={true}
          seconTitle={
            <div className="ml-auto d-flex align-items-center px-2 mt-1">
              <Input
                type="text"
                name="searchMerge"
                id="searchMerge"
                placeholder={t("Search by name, centre, contact...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          }
        >
          <div className="row">
            <div className="col-12">
              <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
                <thead style={{ position: "sticky", top: 0 }}>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Doctor Name")}</th>
                    <th>{t("Specialization")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Contact No.")}</th>
                    <th>{t("Email")}</th>
                    <th>{t("Clinic Name")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Created Date")}</th>
                    <th>
                      <input
                        type="checkbox"
                        name="isChecked"
                        onChange={(e) => handleCheck(e, -1)}
                        checked={
                          filteredData.length > 0
                            ? !isChecked("isChecked", filteredData, "1").includes(false)
                            : false
                        }
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((ele, index) => {
                      const serialNo = (currentPage - 1) * pageSize + index + 1;
                      const originalIndex = tableData.findIndex(
                        (row) => row.DoctorID === ele.DoctorID
                      );
                      return (
                        <tr key={ele.DoctorID || index}>
                          <td>{serialNo}</td>
                          <td>{ele?.DoctorName || ""}</td>
                          <td>{ele?.Specialization || ""}</td>
                          <td>{ele?.Department || ""}</td>
                          <td>{ele?.ContactNo || ""}</td>
                          <td>{ele?.Email || ""}</td>
                          <td>{ele?.ClinicName || ""}</td>
                          <td>{ele?.CreatedByName || ""}</td>
                          <td>{ele?.CreatedDate || ""}</td>
                          <td>
                            <input
                              type="checkbox"
                              name="isChecked"
                              checked={ele?.isChecked === "1"}
                              onChange={(e) => handleCheck(e, originalIndex)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-2">
                        {t("No Record Found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Tables>

              <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-2">
                {filteredData.length > 25 && (
                  <>
                    <div style={{ minWidth: "150px" }}>
                      <ReactSelect
                        value={pageSize}
                        dynamicOptions={PAGE_SIZE_OPTIONS}
                        name="pageSize"
                        label={t("Page Size")}
                        removeIsClearable={true}
                        onChange={(_name, value) => {
                          setPageSize(value?.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                    <Pagination
                      className="pagination-bar"
                      currentPage={currentPage}
                      totalCount={filteredData.length}
                      pageSize={pageSize}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </>
                )}
              </div>

              <div className="row mt-2 mb-2">
                <div className="col-sm-3 col-md-4 col-12 mb-2">
                  <SelectBox
                    lable="Merge Into (Main Doctor)"
                    id="DoctorGroupId"
                    name="DoctorGroupId"
                    onChange={handleSelect}
                    selectedValue={payload?.DoctorGroupId}
                    options={[
                      { label: "Select Doctor", value: "" },
                      ...mergeDoctorOptions,
                    ]}
                  />
                </div>
                <div className="col-sm-2 col-md-2 col-6 mb-2">
                  <SaveButton
                    text={t("Save")}
                    onClick={openConfirm}
                    disabled={saving}
                    loading={saving}
                  />
                </div>
              </div>
            </div>
          </div>
        </Accordion>
      )}
    </>
  );

  const renderLogTab = () => (
    <>
      <div className="row pt-2 pl-2 pr-2 mb-2">
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <DatePicker
            className="custom-calendar"
            maxDate={new Date()}
            value={payload?.formDate}
            name="formDate"
            id="formDate"
            lable={t("From Date")}
            onChange={handleDate}
          />
        </div>
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <DatePicker
            className="custom-calendar"
            maxDate={new Date()}
            value={payload?.ToDate}
            minDate={payload?.formDate}
            name="ToDate"
            id="ToDate"
            lable={t("To Date")}
            onChange={handleDate}
          />
        </div>
        <div className="col-sm-2 col-md-2 col-6 mb-2">
          <SelectBox
            lable="Centre"
            id="CentreIDLog"
            name="CentreID"
            onChange={handleSelect}
            selectedValue={payload?.CentreID}
            options={[{ label: "Select Centre", value: "" }, ...Center]}
          />
        </div>
        <div className="col-sm-6 col-md-6 col-12 mb-2 d-flex align-items-center flex-wrap">
          {load ? (
            <Loading />
          ) : (
            <>
              <SearchButton text={t("Search")} onClick={handleLogSearch} />
              <CustomButton
                text="Refresh"
                icon="refresh"
                className="ml-2 btn rounded"
                onClick={handleLogSearch}
              />
              <CustomButton
                text="Download"
                icon="excel"
                className="ml-2 btn rounded"
                onClick={handleExcelDownload}
              />
            </>
          )}
        </div>
      </div>

      {logSearched && (
        <Accordion
          title={t("Merge Doctor Log")}
          defaultValue={true}
          seconTitle={
            <div className="ml-auto d-flex align-items-center px-2 mt-1">
              <Input
                type="text"
                name="searchLog"
                id="searchLog"
                placeholder={t("Search source, target, user...")}
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
              />
            </div>
          }
        >
          <div className="card-body">
            <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
              <thead style={{ position: "sticky", top: 0 }}>
                <tr>
                  <th>{t("S.No")}</th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleLogSort("MergeDate")}
                  >
                    {t("Merge Date")}
                    {sortMark("MergeDate")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleLogSort("MergeByName")}
                  >
                    {t("Merged By")}
                    {sortMark("MergeByName")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleLogSort("MergeDoctorName")}
                  >
                    {t("Merge Doctor")}
                    {sortMark("MergeDoctorName")}
                  </th>
                  <th
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleLogSort("DoctorName")}
                  >
                    {t("Doctor Name")}
                    {sortMark("DoctorName")}
                  </th>
                  <th>{t("Mobile")}</th>
                  <th>{t("Email")}</th>
                  <th>{t("Specialization")}</th>
                  <th>{t("Clinic Name")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogData.length > 0 ? (
                  paginatedLogData.map((row, index) => (
                    <tr key={`${row?.DoctorID || "log"}-${index}`}>
                      <td>{(logPage - 1) * logPageSize + index + 1}</td>
                      <td>{row?.MergeDate || ""}</td>
                      <td>{row?.MergeByName || ""}</td>
                      <td>{row?.MergeDoctorName || ""}</td>
                      <td>{row?.DoctorName || ""}</td>
                      <td>{row?.Mobile || ""}</td>
                      <td>{row?.Email || ""}</td>
                      <td>{row?.Specialization || ""}</td>
                      <td>{row?.ClinicName || ""}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-2">
                      {t("No Record Found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>

            <div className="d-flex flex-wrap justify-content-end align-items-end gap-2 mt-2">
              {filteredLogData.length > 25 && (
                <>
                  <div style={{ minWidth: "150px" }}>
                    <ReactSelect
                      value={logPageSize}
                      dynamicOptions={PAGE_SIZE_OPTIONS}
                      name="logPageSize"
                      label={t("Page Size")}
                      removeIsClearable={true}
                      onChange={(_name, value) => {
                        setLogPageSize(value?.value);
                        setLogPage(1);
                      }}
                    />
                  </div>
                  <Pagination
                    className="pagination-bar"
                    currentPage={logPage}
                    totalCount={filteredLogData.length}
                    pageSize={logPageSize}
                    onPageChange={(page) => setLogPage(page)}
                  />
                </>
              )}
            </div>
          </div>
        </Accordion>
      )}
    </>
  );

  const tabs = [
    { id: "mergeDoctor", label: t("Merge Doctor"), content: renderMergeTab() },
    { id: "log", label: t("Log"), content: renderLogTab() },
  ];

  return (
    <>
      <Accordion
        name={t("Merge Doctor")}
        defaultValue={true}
        isBreadcrumb={true}
        notOpen={true}
      >
        <CustomTabs
          tabs={tabs}
          activeTab={activeTab}
          onSelect={handleTabSelect}
        />
      </Accordion>

      <Modal
        visible={showConfirm}
        setVisible={setShowConfirm}
        Header={t("Confirm Merge Doctor")}
        modalWidth="40vw"
        buttons={
          <>
            <CancelButton
              text={t("Cancel")}
              onClick={() => setShowConfirm(false)}
              disabled={saving}
            />
            <SaveButton
              text={t("Yes, Merge")}
              onClick={handleSave}
              disabled={saving}
              loading={saving}
            />
          </>
        }
      >
        <p className="mb-2">
          {t("Are you sure you want to merge the selected duplicate doctor(s) into")}{" "}
          <strong>{confirmDetails.target?.DoctorName || t("the main doctor")}</strong>?
        </p>
        {confirmDetails.sources.length > 0 && (
          <ul className="mb-2 pl-3">
            {confirmDetails.sources.map((doc) => (
              <li key={doc.DoctorID}>
                {doc.DoctorName || "NA"}
                {doc.ContactNo ? ` (${doc.ContactNo})` : ""}
              </li>
            ))}
          </ul>
        )}
        <p className="text-danger mb-0" style={{ fontSize: 12 }}>
          {t("This will move all registrations and related records to the main doctor. Duplicate doctors will no longer be usable.")}
        </p>
      </Modal>
    </>
  );
};

export default MergeDoctor;
