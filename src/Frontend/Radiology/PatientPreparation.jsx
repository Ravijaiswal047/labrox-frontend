import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import { useEffect, useRef, useState } from "react";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Loading from "../../components/loader/Loading";
import {
  CustomButton,
  SaveButton,
  SearchButton,
} from "../../components/UI/CustomButton";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { axiosInstance } from "../../utils/axiosInstance";
import TableFilterDot from "../../components/TableFilter/TableFilterDot";
import { SearchBy } from "../../utils/Constants";
import { shouldIncludeAIIMSID } from "../../utils/helpers";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { toast } from "react-toastify";
import moment from "moment";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";

const PatientPreparation = () => {
  const [formData, setFormData] = useState({
    SelectTypes: "",
    ItemValue: "",
    StatusID: "1",
    FromDate: new Date(),
    ToDate: new Date(),
    CentreId: "",
    RateTypeID: "",
    DepartmentID: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [centreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [statusCount, setStatusCount] = useState(null);
  // Default to "Scheduled" (registered, not yet prepared/in/out) so the
  // page opens with a status already selected and the table already
  // populated - ready for the checkbox + "next stage" action button flow
  // below - instead of landing empty until the user clicks something.
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("1");
  const isStatusFilterClicked = useRef(true);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [DepartmentData, setDepartmentData] = useState([]);

  const [payload, setPayload] = useState({
    testID: [],
    status: null,
  });

  const [t] = useTranslation();

  const SampleStatusOptions = [
    {
      label: "All",
      color: "#2196f3ff",
      value: "0",
    },
    {
      label: "Scheduled",
      color: "#757575ff",
      value: "1",
    },
    {
      label: "Patient Prepared",
      color: "#ff6161ff",
      value: "21",
    },
    {
      label: "ScanIn",
      color: "#43a047ff",
      value: "22",
    },
    {
      label: "ScanOut",
      color: "#00acc1ff",
      value: "23",
    },
  ];

  const getSampleStatusInfo = (statusId) => {
    const idString = String(statusId);
    const option = SampleStatusOptions.find(
      (option) => option.value === idString,
    );
    return {
      label: option ? option.label : statusId || `-`,
      color: option ? option.color : "",
    };
  };

  const getRowStatusValue = (item) => {
    if (item?.StatusID) return String(item.StatusID);
    if (item?.IsPatientOut) return "23";
    if (item?.IsPatientIn) return "22";
    if (item?.IsPatientPreparation) return "21";
    return "1";
  };

  const getRowColor = (item) => {
    const option = SampleStatusOptions.find(
      (o) => o.value === getRowStatusValue(item),
    );
    return option ? `${option.color.slice(0, 7)}26` : "";
  };

  const getScanTime = (scan) => {
    const raw = scan && typeof scan === "object" ? scan?.value : scan;
    return raw || "-";
  };

  const getAccessCentres = async () => {
    try {
      const res = await axiosInstance.get("Centre/getAccessCentres");
      const data = res.data.message;
      const CentreDataValue = data.map((ele) => {
        return {
          value: ele.CentreID,
          label: ele.Centre,
        };
      });
      let allValues = CentreDataValue.map((ele) => ele.value);
      setCentreData(CentreDataValue);
      fetchRateTypes(allValues);
    } catch (error) {
      console.log("Error while fetching centres");
    }
  };

  const fetchRateTypes = async (ids) => {
    try {
      const res = await axiosInstance.post("/Centre/GetRateType", {
        CentreId: ids,
      });
      const list = res?.data?.message.map((item) => ({
        label: item?.RateTypeName,
        value: item?.RateTypeID,
      }));
      setRateTypes(list);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAccessCentres();
    getDepartment();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value?.value });
  };
  const handleSelectMultiChange = (select, name) => {
    const val = select?.map((ele) => {
      return ele?.value;
    });
    if (name === "DepartmentID") {
      setSelectedDepartment(val);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };
  const handleKeyDown = (e) => {
    if (e?.key === "Enter") {
      //   TableData("1");
      console.log("Clicked hello");
    }
  };

  const handleBarcodeReceive = (e) => {
    const keypress = [9, 13];
    if (keypress.includes(e.which)) {
      console.log("Clicked hello");
    }
  };

  const handleFilterInputChange = (statusValue) => {
    isStatusFilterClicked.current = true;
    if (selectedStatusFilter === statusValue) {
      setSelectedStatusFilter(null);
      setFormData((prev) => ({ ...prev, StatusID: "1" }));
    } else {
      setSelectedStatusFilter(statusValue);
      setFormData((prev) => ({
        ...prev,
        StatusID: statusValue,
      }));
    }
  };

  const handleSearch = async () => {
    try {
      const requestBody = {
        businessUnitIds: formData.CentreId ? [String(formData?.CentreId)] : [],
        rateTypeIDs: formData.RateTypeID ? [String(formData.RateTypeID)] : [],
        DepartmentIDs: formData.DepartmentID?.length
          ? formData.DepartmentID.map(String)
          : [],
        fromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
        toDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
        statusID: Number(formData.StatusID),
        selectTypes: formData.SelectTypes,
        itemValue: formData.ItemValue,
      };

      const res = await axiosInstance.post(
        "Radiology/GetPatientPrepration",
        requestBody,
      );

      const msg = res?.data?.message;
      if (res?.data?.success && Array.isArray(msg?.data)) {
        const rows = requestBody.statusID
          ? msg.data.filter(
              (item) => getRowStatusValue(item) === String(requestBody.statusID)
            )
          : msg.data;
        setTableData(rows);
        setStatusCount(msg.statusCount || null);
        setLoading(false);
      } else {
        setTableData([]);
        setStatusCount(null);
        toast.warn(typeof msg === "string" ? msg : "No records found.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Estimate Error:", err);
      toast.warn("No records found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStatusFilterClicked.current) {
      handleSearch();
    }
  }, [formData.StatusID, selectedStatusFilter]);

  const getNextActionButtons = (currentStatusId) => {
    const currentIndex = SampleStatusOptions.findIndex(
      (status) => status.value === currentStatusId,
    );

    if (
      currentIndex <= 0 ||
      currentIndex === SampleStatusOptions.length - 1
    ) {
      return [];
    }

    return [SampleStatusOptions[currentIndex + 1]];
  };

  const currentActionButtons = getNextActionButtons(formData.StatusID);

  const handleCheckboxChange = (index, isChecked) => {
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        IsSelected: isChecked,
      };

      return newData;
    });
  };

  const handleActionClick = async (newStatusId) => {
    const selectedTestIDsHash = tableData
      .filter((item) => item.IsSelected)
      .map((item) => String(item.TestIDHash));

    if (selectedTestIDsHash.length === 0) {
      alert(t("Please select at least one investigation to proceed."));
      return;
    }

    const finalPayload = {
      TestIDHash: selectedTestIDsHash,
      Status: Number(newStatusId),
    };

    try {
      const res = await axiosInstance.post(
        "Radiology/PatientPreparation",
        finalPayload,
      );
      const data = res?.data;
      if (data?.success) {
        toast.success("Status updated!");
        // The rows just moved to the next stage - re-run the current
        // filter so the table (and the "next stage" action button, which
        // is derived from the filter) reflects that immediately instead
        // of still showing the old, now-stale status/checkboxes.
        handleSearch();
      } else {
        toast.error(data?.message || "Could not update status");
      }
    } catch (error) {
      console.log("Error while updating status", error);
      toast.error(error?.response?.data?.message || "Could not update status");
    }
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let DeptDataValue = data.map((ele) => {
          return {
            value: ele.DepartmentID,
            label: ele.Department,
          };
        });

        setDepartmentData(DeptDataValue);
      })
      .catch((err) => console.log(err));
  };

  return (
    <>
      <Accordion
        name={t("Patient Preparation")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 p-2">
          <div className="col-12">
            <div className="form-row align-items-center">
              <div
                className="col-12 col-sm-2 d-flex"
                style={{ display: "flex" }}
              >
                <div style={{ width: "50%" }}>
                  <SelectBox
                    options={[
                      ...SearchBy,
                      ...(shouldIncludeAIIMSID()
                        ? [{ label: "AIIMSID", value: "AIIMSID" }]
                        : []),
                    ]}
                    selectedValue={formData?.SelectTypes}
                    name="SelectTypes"
                    id="SelectTypes"
                    lable="SelectTypes"
                    onChange={handleChange}
                  />
                </div>
                <div style={{ width: "50%" }}>
                  {formData?.SelectTypes === "Mobile" ? (
                    <div style={{ width: "100%" }}>
                      <Input
                        className="select-input-box form-control input-sm"
                        type="number"
                        name="ItemValue"
                        max={10}
                        onKeyDown={handleKeyDown}
                        value={formData?.ItemValue}
                        onChange={handleChange}
                        onInput={(e) => number(e, 10)}
                      />
                      {errors?.ItemValue && (
                        <div className="error-message">{errors?.ItemValue}</div>
                      )}
                    </div>
                  ) : (
                    <div style={{ width: "100%" }}>
                      <Input
                        className="select-input-box form-control input-sm"
                        type="text"
                        name="ItemValue"
                        max={20}
                        onKeyDown={handleKeyDown}
                        value={formData?.ItemValue}
                        onChange={handleChange}
                      />
                      {errors?.ItemValue && (
                        <div className="error-message">{errors?.ItemValue}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="col-sm-2">
                <ReactSelect
                  dynamicOptions={centreData}
                  name="CentreId"
                  lable={t("Centre")}
                  id="CentreId"
                  removeIsClearable={true}
                  placeholderName={t("Centre")}
                  value={formData?.CentreId}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-sm-2">
                <SelectBoxWithCheckbox
                  name="DepartmentID"
                  onChange={handleSelectMultiChange}
                  // options={AddBlankData(
                  //   DepartmentData,
                  //   "All Department",
                  // )}
                  options={DepartmentData}
                  placeholder={t("Department")}
                  lable={t("Department")}
                  // className="required-fields"
                  id="Department"
                  value={formData?.DepartmentID}
                />
              </div>
              <div className="col-sm-2">
                <ReactSelect
                  dynamicOptions={RateTypes}
                  name="RateTypeID"
                  lable={t("RateType")}
                  id="RateTypeID"
                  removeIsClearable={true}
                  placeholderName={t("RateType")}
                  value={formData?.RateTypeID}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-sm-2">
                <ReactSelect
                  dynamicOptions={SampleStatusOptions}
                  name="StatusID"
                  lable={t("Centre")}
                  id="StatusID"
                  removeIsClearable={true}
                  placeholderName={t("DateType")}
                  value={formData?.StatusID}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-12 col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  name="FromDate"
                  value={formData?.FromDate}
                  placeholder=" "
                  id="FromDate"
                  lable="FromDate"
                  onChange={dateSelect}
                  maxDate={new Date(formData.ToDate)}
                />
              </div>
              <div className="col-12 col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  value={formData?.ToDate}
                  placeholder=" "
                  id="ToDate"
                  lable="ToDate"
                  onChange={dateSelect}
                  maxDate={new Date()}
                  minDate={new Date(formData.FromDate)}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  lable="BarcodeNo"
                  id="BarcodeNo"
                  name="BarcodeNo"
                  placeholder=""
                  onKeyDown={handleBarcodeReceive}
                  value={formData.BarcodeNo}
                  onChange={handleChange}
                />
              </div>

              {/* Search button */}
              <div className="col-12 col-sm-1">
                {loading ? (
                  <Loading />
                ) : (
                  <SearchButton
                    text={"Search"}
                    onClick={() => handleSearch()}
                  />
                )}
              </div>

              {/* <div className="col-12 col-sm-1">
                {loading ? (
                  <Loading />
                ) : (
                  <SaveButton
                    text={"Save"}
                    // onClick={() => setShowRejectModal(true)}
                  />
                )}
              </div> */}
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Patient Details")}
        defaultValue={true}
        linkTo="#"
        linkTitle={
          <div
            className="mt-2 mb-2 px-2 py-1 d-flex sampleStatusClass"
            style={{ gap: "5px" }}
          >
            <strong style={{ minWidth: "50px", color: "black" }}>
              Status:{" "}
            </strong>
            {SampleStatusOptions.map((status) => {
              const count =
                {
                  0: statusCount?.all,
                  1: statusCount?.scheduled,
                  21: statusCount?.patientPreparation,
                  22: statusCount?.scanIn,
                  23: statusCount?.scanOut,
                }[status.value] ?? 0;

              return (
                <TableFilterDot
                  key={status?.value}
                  color={`${status?.color}`}
                  title={`${status?.label}(${count})`}
                  onClick={() => handleFilterInputChange(status.value)}
                  bgColor={
                    selectedStatusFilter === status.value
                      ? status.color
                      : `#e9e2e1`
                  }
                  textColor={"#000000"}
                />
              );
            })}
          </div>
        }
      />
      <div className="row px-2 mt-2 mb-2">
        <div className="col-12">
          {loading ? (
            <Loading />
          ) : tableData.length > 0 ? (
            <>
              <Tables
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("Reg Date/Time")}</th>
                    <th>{t("VisitNo")}</th>
                    <th>{t("PName | Age | Gender")}</th>
                    <th>{t("Mobile No.")}</th>
                    <th>{t("RateType | Doctor")}</th>
                    <th>{t("Dept.")}</th>
                    <th>{t("Investigation")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Expected Scan Time")}</th>
                    <th>{t("ScanIn")}</th>
                    <th>{t("ScanOut")}</th>
                    <th>{t("Select")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((data, index) => (
                    <tr
                      key={data?.TestIDHash}
                      style={{ backgroundColor: getRowColor(data) }}
                    >
                      <td data-title={"S No."}>{index + 1}</td>
                      <td data-title={"Centre"}>{data?.BusinessUnit}</td>
                      <td data-title={"Reg Date/Time"}>{data?.RegDate}</td>
                      <td data-title={"VisitNo"}>
                        <span>{data?.VisitNo}</span> <br />
                      </td>
                      <td data-title={"PName | Age | Gender"}>
                        <span>{data?.PName}</span> <br />
                        <span>{data?.Age}</span> <br />
                        <span>{data?.Gender}</span> <br />
                      </td>
                      <td data-title={"Mobile No."}>{data?.Mobile}</td>
                      <td data-title={"RateType | Doctor"}>
                        <span>{data?.RateTypeName}</span> <br />
                        <span>{data?.DoctorName}</span> <br />
                      </td>
                      <td data-title={"Department"}>{data?.DepartmentName}</td>
                      <td data-title={"Investigation"}>{data?.ItemName}</td>
                      <td data-title={"Status"} style={{ minWidth: "100px" }}>
                        {(() => {
                          // StradusStatus reflects the Stradus system's own
                          // status (Scheduled/ScanIn/ScanOut) and never
                          // learns about "Patient Prepared" since that's a
                          // LIMS-side flag set before anything is sent to
                          // Stradus - use the same derivation as the filter
                          // and row color (getRowStatusValue) so this column
                          // agrees with which status bucket the row is
                          // actually showing under.
                          const statusInfo = getSampleStatusInfo(
                            getRowStatusValue(data),
                          );

                          return (
                            <div
                              style={{
                                color: statusInfo.color,
                                fontWeight: "bold",
                              }}
                            >
                              {statusInfo.label}
                            </div>
                          );
                        })()}
                      </td>
                      <td data-title={"Expected Scan Time"}>
                        {getScanTime(data?.ExpectedScanTime)}
                      </td>
                      <td data-title={"ScanIn"}>
                        {getScanTime(data?.ScanIn)}
                      </td>
                      <td data-title={"ScanOut"}>
                        {getScanTime(data?.ScanOut)}
                      </td>
                      <td data-title={t("Select")} className="px-2">
                        <input
                          type="checkbox"
                          className="me-2 mr-2"
                          checked={data?.IsSelected || false}
                          onChange={(e) =>
                            handleCheckboxChange(index, e.target.checked)
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
              {currentActionButtons.length > 0 && (
                <div className="mt-3 d-flex" style={{ gap: "4px" }}>
                  {currentActionButtons.map((action) => (
                    <CustomButton
                      key={action.value}
                      text={`Mark ${action.label}`}
                      className="btn-primary"
                      onClick={() => handleActionClick(action.value)}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <NoRecordFound />
          )}
        </div>
      </div>
      {/* </Accordion> */}
    </>
  );
};

export default PatientPreparation;
