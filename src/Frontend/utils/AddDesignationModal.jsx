import React, { useEffect, useRef, useState } from "react";
import { Dialog } from "primereact/dialog";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice";

const AddDesignationModal = ({
  show,
  onHandleClose,
  title,
  id,
  empCount,
  sequence,
}) => {
  ////console.log(id, title, sequence, "modal");
  const { t } = useTranslation();
  const [designationName, setDesignationName] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [priority, setPriority] = useState("");
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const [reportingToList, setReportingToList] = useState([]);
  const [reportingNameList, setReportingNameList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [tagLocationList, setTagLocationList] = useState([]);
  const [employeeSuggestions, setEmployeeSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const debounceRef = useRef(null);
  const searchInputRef = useRef(null);

  const [payload, setPayload] = useState({
    searchEmployee: "",
    reportingTo: "",
    reportingToName: "",
    reportingName: "",
    reportingNameLabel: "",
    employeeID: "",
  });

  console.log(payload?.reportingName);
  const handleReactSelect = (label, value) => {
    if (label === "reportingTo" && value?.value) {
      setPayload({
        ...payload,
        [label]: value?.value,
        reportingToName: value?.label,
      });
      getReporterName(value?.value);
    } else if (label === "reportingName") {
      setPayload({
        ...payload,
        [label]: value?.value,
        reportingNameLabel: value?.label,
      });
    }
  };

  const getReporterName = async (designationID) => {
    setReportingNameList([]);
    setLoading(true);

    axiosInstance
      .post(
        `SalesHierarchy/GetEmployeeDesignationsHierarchy?DesignationID=${designationID}`,
      )
      .then((res) => {
        if (res?.status === 200) {
          ////console.log("Reporting Name res", res);
          const data = res?.data?.message || [];
          const formattedData = data.map((item) => ({
            label: item.Name,
            value: item.EmployeeID,
          }));
          setReportingNameList(formattedData);
          toast.success(res?.data?.message || "Data fetched successfully");
        } else {
          toast.error("Unexpected response from server");
        }
      })
      .catch((err) => {
        console.error("Get Designation Data Error:", err);
        toast.error(
          err?.response?.data?.message ||
            "Something went wrong while fetching data",
        );
      })
      .finally(() => {
        if (setLoading) setLoading(false);
      });
  };

  const getReporterTo = async (sequence) => {
    setReportingToList([]);
    setLoading(true);

    try {
      const res = await axiosInstance.post(
        `SalesHierarchy/GetBindDesignationsSales?sequence=${sequence}`,
      );

      if (res?.status === 200) {
        ////console.log("Reporting to res", res);
        const data = res?.data?.message || [];

        const formattedData = data.map((item) => ({
          label: item.DesignationName,
          value: item.DesignationID,
        }));

        setReportingToList(formattedData);
      } else {
        console.error("Get Designation Data Error");
      }
    } catch (err) {
      console.error("Get Designation Data Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (!employeeSuggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % employeeSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev <= 0 ? employeeSuggestions.length - 1 : prev - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && highlightIndex < employeeSuggestions.length) {
        handleSelectSuggestion(employeeSuggestions[highlightIndex]);
        setHighlightIndex(-1);
      }
    } else if (e.key === "Escape") {
      setEmployeeSuggestions([]);
      setHighlightIndex(-1);
    }
  };

  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setPayload((prev) => ({ ...prev, searchEmployee: searchValue }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (!searchValue) {
        setEmployeeSuggestions([]);
        return;
      }
      axiosInstance
        .post("SalesHierarchy/SearchEmployee", {
          query: searchValue,
        })
        .then((res) => {
          ////console.log("response", res);
          if (res?.status === 200) {
            ////console.log("Reporting Name res", res);
            if (res?.data?.success && res?.data?.data) {
              setEmployeeSuggestions(res.data.data);
            } else {
              toast.error(res?.data?.message);
            }
          } else {
            toast.error("Unexpected response from server");
          }
        })
        .catch((err) => {
          console.error("Get Designation Data Error:", err);
          toast.error(
            err?.response?.data?.message ||
              "Something went wrong while fetching data",
          );
        })
        .finally(() => {
          if (setLoading) setLoading(false);
        });
    }, 500);
  };

  const handleSelectSuggestion = (emp) => {
    ////console.log("emp", emp);
    setPayload((prev) => ({
      ...prev,
      searchEmployee: emp.label,
      employeeID: emp.EmployeeID, // store the selected EmployeeID if needed
    }));
    setEmployeeSuggestions([]);
    setHighlightIndex(-1);
  };

  const handleModalClose = () => {
    // Reset search input and suggestions
    setPayload({
      searchEmployee: "",
      employeeID: "",
      reportingTo: "",
      reportingToName: "",
      reportingName: "",
    });
    setEmployeeSuggestions([]);
    setHighlightIndex(-1);

    // Call parent close handler
    onHandleClose();
  };

  const handleSave = () => {
    setLoading(true);

    const apiPayload = {
      empID: payload?.employeeID?.toString(),
      designationID: id.toString(),
      priority: sequence,
      salesDesignationName: payload?.reportingNameLabel,
      ReportingDesignationID: payload?.reportingTo?.toString(),
      reportingEmployeeId: payload?.reportingName?.toString(),
    };

    axiosInstance
      .post("SalesHierarchy/SaveEmployeeDesignationSales", apiPayload)
      .then((res) => {
        if (res?.status === 200) {
          ////console.log("Save res", res);
          toast.success(res?.data?.message || "Data Saved successfully");
          handleModalClose();
        } else {
          toast.error("Unexpected response from server");
        }
      })
      .catch((err) => {
        console.error("Save Error:", err);
        toast.error(
          err?.response?.data?.message ||
            "Something went wrong while saving data",
        );
      })
      .finally(() => {
        if (setLoading) setLoading(false);
      });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setEmployeeSuggestions([]);
        setHighlightIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (id) {
      getReporterTo(sequence);
    }
  }, [id]);

  //console.log("payload", payload);

  return (
    <Dialog
      header={
        <div className="flex flex-col">
          <span className="font-semibold text-lg">Designation: </span>
          <span className="font-semibold text-lg">{title}</span>
        </div>
      }
      visible={show}
      onHide={onHandleClose}
      style={{ width: isMobile ? "80vw" : "40vw", overflow: "visible" }}
      contentStyle={{ overflow: "visible" }}
      className={theme}
    >
      <div>
        <div className="row px-2 mt-2 mb-1" style={{ height: "80px" }}>
          <div
            className="col-sm-6 col-md-6 col-lg-6"
            style={{ position: "relative" }}
            ref={searchInputRef}
          >
            <div style={{ position: "relative", width: "100%" }}>
              <Input
                type="text"
                name="searchEmployee"
                lable={t("SearchEmployee")}
                value={payload.searchEmployee || ""}
                placeholder=" "
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
              />
            </div>

            {employeeSuggestions.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "100%",
                  backgroundColor: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  maxHeight: "200px", // Increased height for better visibility
                  overflowY: "auto",
                  zIndex: 99999,
                  marginTop: "2px",
                }}
              >
                {employeeSuggestions.map((emp, index) => (
                  <div
                    key={emp.EmployeeID}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      backgroundColor:
                        index === highlightIndex ? "#bfdbfe" : "transparent",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "14px",
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={() => handleSelectSuggestion(emp)}
                    onMouseEnter={() => setHighlightIndex(index)}
                  >
                    {emp.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {sequence !== null && (
            <>
              <div className="col-sm-6 col-md-6 col-lg-6">
                <ReactSelect
                  dynamicOptions={[
                    { label: "Select", value: "" },
                    ...reportingToList,
                  ]}
                  name="reportingTo"
                  lable={t("Reporting To")}
                  id="ReportingTo"
                  removeIsClearable={true}
                  placeholderName={t("Reporting To")}
                  value={payload?.reportingTo}
                  onChange={handleReactSelect}
                />
              </div>

              <div className="col-sm-6 col-md-6 col-lg-6">
                <ReactSelect
                  dynamicOptions={[
                    { label: "Select", value: "" },
                    ...reportingNameList,
                  ]}
                  name="reportingName"
                  lable={t("Reporting Name")}
                  id="ReportingName"
                  removeIsClearable={true}
                  placeholderName={t("Reporting Name")}
                  value={payload?.reportingName}
                  onChange={handleReactSelect}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="mt-3 d-flex justify-content-end">
        <button
          className="btn btn-success btn-sm me-2 mr-2"
          onClick={handleSave}
        >
          {t("Save")}
        </button>
        <button className="btn btn-danger btn-sm" onClick={handleModalClose}>
          {t("Close")}
        </button>
      </div>
    </Dialog>
  );
};

export default AddDesignationModal;
