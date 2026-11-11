import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import { useEffect, useState } from "react";
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

const RadiologyCaseAssignment = () => {
  const [formData, setFormData] = useState({
    SelectTypes: "",
    ItemValue: "",
    StatusID: "1",
    FromDate: new Date(),
    ToDate: new Date(),
    CentreId: "",
    RateTypeID: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [centreData, setCentreData] = useState([]);
  const [RateTypes, setRateTypes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(null);

  const [payload, setPayload] = useState({
    testID: [],
    status: null,
  });

  const [t] = useTranslation();

  const SampleStatusOptions = [
    {
      label: "Case Assigned",
      color: "#ff47acff",
      value: "24",
    },
  ];

  const getSampleStatusInfo = (statusId) => {
    const idString = String(statusId);
    const option = SampleStatusOptions.find(
      (option) => option.value === idString
    );
    return {
      label: option ? option.label : `-`,
      color: option ? option.color : "",
    };
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

  const fetchRadiologyDoctors = async () => {
    try {
      const res = await axiosInstance.get("Radiology/GetRadiologyDoctor");
      const data = res?.data;
      console.log("Data", data);
      const list = data?.message.map((item) => ({
        label: item?.EmployeeName,
        value: item?.EmployeeID,
      }));
      setDoctors(list);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getAccessCentres();
    fetchRadiologyDoctors();
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
    if (selectedStatusFilter === statusValue) {
      setSelectedStatusFilter(null);
      setFormData((prev) => ({ ...prev, StatusID: 0 }));
    } else {
      setSelectedStatusFilter(statusValue);
      setFormData((prev) => ({
        ...prev,
        StatusID: statusValue,
      }));
    }
  };

  const handleSearch = async (useFilterStatus = false) => {
    try {
      const requestBody = {
        businessUnitIds: formData.CentreId ? [String(formData?.CentreId)] : [],
        rateTypeIDs: formData.RateTypeID ? [String(formData.RateTypeID)] : [],
        fromDate: moment(formData?.FromDate).format("YYYY-MM-DD"),
        toDate: moment(formData?.ToDate).format("YYYY-MM-DD"),
        statusID: useFilterStatus ? Number(formData.StatusID) : 1,
        selectTypes: formData.SelectTypes,
        itemValue: formData.ItemValue,
      };

      const res = await axiosInstance.post(
        "Radiology/GetPatientPrepration",
        requestBody
      );

      if (res?.data?.success) {
        setTableData(res?.data?.message || []);
        setLoading(false);
      } else {
        setTableData([]);
        toast.warn(res?.data?.message || "No records found.");
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
    if (selectedStatusFilter !== null) {
      handleSearch(true);
    }
  }, [formData.StatusID]);

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

  const handleTableSelectChange = (name, value, rowData) => {
    console.log(name, value, rowData);

    const uniqueId = rowData.TestID;

    setTableData((prevData) => {
      const rowIndexToUpdate = prevData.findIndex(
        (item) => item.TestID === uniqueId
      );
      if (rowIndexToUpdate === -1) {
        console.error("Could not find row with TestIDHash:", uniqueId);
        return prevData;
      }
      const newData = [...prevData];
      newData[rowIndexToUpdate] = {
        ...newData[rowIndexToUpdate],
        docId: value?.value,
        docName: value?.label,
      };

      console.log("New Data", newData);
      return newData;
    });
  };

  const handleAssigned = async () => {
    const selectedRows = tableData.filter((item) => item.IsSelected);
    if (selectedRows.length === 0) {
      toast.warn(t("Please select at least one investigation to proceed."));
      return;
    }
    const finalPayload = selectedRows.map((item) => ({
      testIDHash: String(item.TestHashID || item.TestIDHash),
      doctorId: String(item.docId || ""),
      doctorName: item.docName || "",
    }));
    
    try {
      const res = await axiosInstance.post(
        "Radiology/CaseAssignment",
        finalPayload
      );
      const data = res?.data;
      if (data?.success) {
        toast.success("Status updated!");
      }
    } catch (error) {
      console.log("Error while updating status", error);
    }
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
                    onClick={() => handleSearch(false)}
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
            {SampleStatusOptions?.map((status) => {
              const count = tableData?.filter(
                (item) => String(item.Status) === String(status.value)
              ).length;

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
                    <th>{t("Doctor")}</th>
                    <th>{t("Select")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((data, index) => (
                    <tr key={data?.VisitNo}>
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
                          const statusInfo = getSampleStatusInfo(data?.Status);

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
                      <td data-title={"Doctor"} style={{ minWidth: "140px" }}>
                        <ReactSelect
                          dynamicOptions={doctors}
                          name="docId"
                          lable={t("Doctor")}
                          id={`docId-${index}`}
                          removeIsClearable={true}
                          placeholderName={t("Doctor")}
                          value={data?.docId}
                          onChange={(name, value) =>
                            handleTableSelectChange(name, value, data)
                          }
                        />
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
              <div className="mt-3 d-flex" style={{ gap: "4px" }}>
                <CustomButton
                  text={"Assigned"}
                  className="btn-primary"
                  onClick={handleAssigned}
                />
              </div>
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

export default RadiologyCaseAssignment;
