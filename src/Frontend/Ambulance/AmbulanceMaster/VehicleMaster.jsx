import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Heading from "../../../components/UI/Heading";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import { formatStandardDate, PreventSpecialCharacter, validateRequiredFields } from "../../../utils/helpers";
import { Form } from "react-bootstrap";
import Tables from "../../../components/UI/customTable";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../../components/Filter/FilterInput";
import './VehicleMaster.css';
import { colorCodingData } from "../../../utils/Constants";

const VehicleMaster = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState(null);
  const initialPayload = {
    VehicleNo: "",
    VehicleName: "",
    VehicleType: "",
    ModalType: "",
    LastReading: "",
    ModalNo: "",
    RCNo: "",
    LastInspectionDate: new Date(),
    InsuranceExpiryDate: new Date(),
    InsuranceNo: "",
    Average: "",
    isActive: 1,
  };

  const [payload, setPayload] = useState(initialPayload);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tableData, setTableData] = useState([]);
  const [masterTable, setMasterTable] = useState([]);

  const [dropdownlist, setDropdownlist] = useState({
    VehicleTypeList: [
      { label: "Normal", value: "Normal" },
      { label: "Ambulance", value: "Ambulance" },
    ],
    ModalTypeList: [
      { label: "Petrol", value: "Petrol" },
      { label: "Diesel", value: "Diesel" },
    ],
  });

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    if (name === "VehicleNo" || name === "RCNo" || name === "InsuranceNo") {
      setPayload((prev) => ({
        ...prev,
        [name]: ["VehicleNo", "RCNo", "InsuranceNo"].includes(name)
          ? PreventSpecialCharacter(value)
            ? value.toUpperCase()
            : payload[name]
          : value.toUpperCase(),
      }))
    }
    else if (name === "LastReading") {
      const onlyDigits = value.replace(/\D/g, "");
      setPayload((prev) => ({ ...prev, [name]: onlyDigits }));
    }
    else if (name === "Average") {
      const regex = /^\d+(\.\d{0,2})?$/;
      if (regex.test(value) || value === "") {
        setPayload((prev) => ({
          ...prev,
          [name]: value,
        }));
      } else {
        setPayload((prev) => ({
          ...prev,
          [name]: prev[name],
        }));
      }
    }
    else {
      setPayload((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      }));
    }

  };

  const handleReset = () => {
    setPayload(initialPayload);
    setErrors({});
    setIsEditMode(false);
  };

  const handleStatusFilter = (id) => {
    if (id === "all") {
      setStatusFilter(null);
      setTableData(masterTable);
      return;
    }

    const status = id === "8" ? 1 : 0;
    setStatusFilter(status);

    setTableData(
      masterTable.filter((item) => item.isActive === status)
    );
  };

  const handleEdit = (vehicle) => {
    setPayload((prev) => ({
      ...vehicle,
      LastInspectionDate: vehicle?.LastInspectionDate
        ? new Date(vehicle?.LastInspectionDate)
        : new Date(),

      InsuranceExpiryDate: vehicle?.InsuranceExpiryDate
        ? new Date(vehicle?.InsuranceExpiryDate)
        : new Date(),
    }));
    setIsEditMode(true);
  };


  const handleUpdate = async () => {
    const requiredFields = [
      "VehicleNo",
      "VehicleName",
      "VehicleType",
      "ModalType",
      "LastReading",
      "ModalNo",
      "RCNo",
      "InsuranceNo",
      "Average",
    ];

    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    const updatePayload = {
      id: payload?.id,
      vehileNo: payload?.VehicleNo,
      vehileName: payload?.VehicleName,
      modelType: payload?.ModalType,
      lastReading: Number(payload?.LastReading),
      modelNumber: payload?.ModalNo,
      rcNumber: payload?.RCNo,
      lastInspectionDate: formatStandardDate(
        payload?.LastInspectionDate,
        "YYYY-MM-DD"
      ),
      insuranceExpireDate: formatStandardDate(
        payload?.InsuranceExpiryDate,
        "YYYY-MM-DD"
      ),
      insuranceNo: payload?.InsuranceNo,
      averagePerLt: Number(payload?.Average),
      isActive: payload?.isActive,
      vehileType: payload?.VehicleType,
    };
    axiosInstance
      .post(apiUrls.UpdateVehicleAmbulance, updatePayload)
      .then((res) => {
        console.log("update res", res);
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleReset();
          setIsEditMode(false);
          getVehicleData(); 
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Error Occurred"
        );
      });
  };

  const handleReactChange = (name, e) => {
    setPayload(prev => ({
      ...prev,
      [name]: e?.value ?? "",
    }));
  };

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(e.target.value);

    if (!value) {
      setTableData(masterTable);
      return;
    }

    const searchableKeys = [
      "VehicleNo",
      "VehicleName",
      "VehicleType",
      "ModalType",
      "ModalNo",
      "RCNo",
      "InsuranceNo",
    ];

    const filtered = masterTable?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableData(filtered);
  };


  const mapVehicleApiToTable = (apiData = []) => {
    return apiData.map((item, index) => ({
      id: item.Id,
      VehicleNo: item?.VehileNo,
      VehicleName: item?.VehileName,
      VehicleType: item?.VehileType || "",
      ModalType: item?.ModelType,
      LastReading: item?.LastReading,
      ModalNo: item?.ModelNumber,
      RCNo: item?.RCNumber,
      LastInspectionDate: item?.LastInspectionDate,
      InsuranceNo: item?.InsuranceNo,
      InsuranceExpiryDate: item?.InsuranceExpireDate,
      Average: item?.AveragePerLt,
      isActive: item?.IsActive ? 1 : 0,
      CreatedBy: item?.CreatedByName,
      CreatedOn: item?.dtEntry,
      UpdatedBy: item?.UpdatedByName,
      UpdatedOn: item?.dtUpdate,
    }));
  };


  const handleSave = async () => {
    const requiredFields = [
      "VehicleNo",
      "VehicleName",
      "VehicleType",
      "ModalType",
      "LastReading",
      "ModalNo",
      "RCNo",
      "InsuranceNo",
      "Average",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const apiPayload = {
      vehileNo: payload.VehicleNo,
      vehileName: payload.VehicleName,
      modelType: payload.ModalType,
      lastReading: Number(payload.LastReading),
      modelNumber: payload.ModalNo,
      rcNumber: payload.RCNo,
      lastInspectionDate: formatStandardDate(payload.LastInspectionDate, "YYYY-MM-DD"),
      insuranceExpireDate: formatStandardDate(payload.InsuranceExpiryDate, "YYYY-MM-DD"),
      insuranceNo: payload.InsuranceNo,
      averagePerLt: Number(payload.Average),
      isActive: payload.isActive,
      vehileType: payload.VehicleType
    };
    axiosInstance
      .post(apiUrls.SaveVehicleAmbulance, apiPayload)
      .then((res) => {
        console.log("saveres", res);
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          getVehicleData();
          handleReset();
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
    // notify("Data Saved Successfully", "success");
  }

  const getVehicleData = async () => {
    axiosInstance
      .get(apiUrls.SearchVehicleAmbulance)
      .then((res) => {
        console.log("searchres", res);
        if (res?.data?.success) {
          const apiData = res?.data?.data || [];
          const mappedData = mapVehicleApiToTable(apiData);
          setMasterTable(mappedData);
          setTableData(mappedData);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {

      });
  }
  useEffect(() => {
    getVehicleData();
  }, []);
  // console.log("Payload", payload);
  console.log("errors", errors);
  console.log("masterTable", masterTable);
  console.log("tableData", tableData);
  return (
    <>
      <Accordion
        name={t("Vehicle Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Vehicle No")}
              id="VehicleNo"
              name="VehicleNo"
              value={payload?.VehicleNo}
              onChange={handleChange}
              maxLength={10}
            />
            {payload?.VehicleNo === "" && (
              <span className="error-message">{errors?.VehicleNo}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Vehicle Name")}
              id="VehicleName"
              name="VehicleName"
              value={payload?.VehicleName}
              onChange={handleChange}

            />
            {payload?.VehicleName === "" && (
              <span className="error-message">{errors?.VehicleName}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="VehicleType"
              id="VehicleType"
              removeIsClearable={true}
              dynamicOptions={dropdownlist?.VehicleTypeList}
              placeholderName={t("Vehicle Type")}
              value={payload?.VehicleType}
              onChange={handleReactChange}

            />
            {payload?.VehicleType === "" && (
              <span className="error-message">{errors?.VehicleType}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="ModalType"
              id="ModalType"
              removeIsClearable={true}
              dynamicOptions={dropdownlist?.ModalTypeList}
              placeholderName={t("ModalType")}
              value={payload?.ModalType}
              onChange={handleReactChange}

            />
            {payload?.ModalType === "" && (
              <span className="error-message">{errors?.ModalType}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Last Reading")}
              id="LastReading"
              name="LastReading"
              value={payload?.LastReading}
              onChange={handleChange}

            />
            {payload?.LastReading === "" && (
              <span className="error-message">{errors?.LastReading}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Modal No")}
              id="ModalNo"
              name="ModalNo"
              value={payload?.ModalNo}
              onChange={handleChange}

            />
            {payload?.ModalNo === "" && (
              <span className="error-message">{errors?.ModalNo}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("RC No")}
              id="RCNo"
              name="RCNo"
              value={payload?.RCNo}
              onChange={handleChange}
              maxLength={15}
            />
            {payload?.RCNo === "" && (
              <span className="error-message">{errors?.RCNo}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <DatePicker
              name="LastInspectionDate"
              id="LastInspectionDate"
              value={payload?.LastInspectionDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("Last Inspection Date")}
              className="custom-calendar"
            />
            {payload?.LastInspectionDate === "" && (
              <span className="error-message">{errors?.LastInspectionDate}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <DatePicker
              name="InsuranceExpiryDate"
              id="InsuranceExpiryDate"
              value={payload?.InsuranceExpiryDate}
              onChange={dateSelect}
              minDate={new Date()}
              placeholder=""
              lable={t("Insurance Expiry Date")}
              className="custom-calendar"
            />
            {payload?.InsuranceExpiryDate === "" && (
              <span className="error-message">{errors?.InsuranceExpiryDate}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Insurance No")}
              id="InsuranceNo"
              name="InsuranceNo"
              value={payload?.InsuranceNo}
              onChange={handleChange}
              maxLength={20}
            />
            {payload?.InsuranceNo === "" && (
              <span className="error-message">{errors?.InsuranceNo}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Average Per Litre")}
              id="Average"
              name="Average"
              value={payload?.Average}
              onChange={handleChange}

            />
            {payload?.Average === "" && (
              <span className="error-message">{errors?.Average}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-2 mt-1 d-flex col-md-6 col-12">
            <Form.Check
              type="switch"
              id="isActive1"
              name="isActive"
              label={t("Active")}
              onChange={handleChange}
              checked={payload?.isActive}
            />
            {/* <Button
              className="rounded py-0 ml-2"
              onClick={handleSave}
            >
              Save
            </Button> */}

            <Button
              className="rounded py-0 ml-2"
              onClick={isEditMode ? handleUpdate : handleSave}
            >
              {isEditMode ? "Update" : "Save"}
            </Button>
            <Button
              className="rounded py-0 ml-2"
              onClick={handleReset}
            >
              Reset
            </Button>
          </div>

        </div>

      </Accordion>
      <Heading
        title={t("Vehicle Records")}
        secondTitle={
          <>
            <div className="col-sm-12 d-flex justify-content-end gap-custom p-0">
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  onClick={() => handleStatusFilter(id)}
                  cursor="pointer"
                />
              ))}
              <FilterInput
                value={searchTerm}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                inputClass="transparent-background"
              />
            </div>
          </>
        }
      />
      <div className="row p-2 ">
        <div className="col-12">
          <Tables>
            <thead className="cf">
              <tr>
                <th>{t("Sr. No")}</th>
                <th>{t("Vehicle No")}</th>
                <th>{t("Type")}</th>
                <th>{t("Vehicle Name")}</th>
                <th>{t("Last Reading")}</th>
                <th>{t("Modal No")}</th>
                <th>{t("RC No")}</th>
                <th>{t("Last Inspection Date")}</th>
                <th>{t("Insurance No")}</th>
                <th>{t("Insurance Expiry Date")}</th>
                <th>{t("Avg/Lt")}</th>
                <th>{t("Model")}</th>
                {/* <th>{t("IsActive")}</th> */}
                <th>{t("Created By")}</th>
                <th>{t("Created On")}</th>
                <th>{t("Updated By")}</th>
                <th>{t("Updated On")}</th>
                <th>{t("Edit")}</th>
              </tr>
            </thead>

            <tbody>
              {tableData?.length > 0 ? (
                tableData?.map((item, i) => {
                  const rowColor = item?.isActive === 1 ? '#75f975' : '#ffe58f';

                  return (
                    <tr
                      key={i}
                      className={`vehicle-row ${item?.isActive === 1 ? 'active' : 'deactive'}`}

                      style={{ backgroundColor: rowColor, backgroundImage: 'none', color: 'white' }}
                    >
                      <td data-title={t("Sr. No")}>{i + 1}</td>
                      <td data-title={t("Vehicle No")}>{item?.VehicleNo}</td>
                      <td data-title={t("Type")}>{item?.VehicleType}</td>
                      <td data-title={t("Vehicle Name")}>{item?.VehicleName}</td>
                      <td data-title={t("Last Reading")}>{item?.LastReading}</td>
                      <td data-title={t("Modal No")}>{item?.ModalNo}</td>
                      <td data-title={t("RC No")}>{item?.RCNo}</td>
                      <td data-title={t("Last Inspection Date")}>{item?.LastInspectionDate}</td>
                      <td data-title={t("Insurance No")}>{item?.InsuranceNo}</td>
                      <td data-title={t("Insurance Expiry Date")}>{item?.InsuranceExpiryDate}</td>
                      <td data-title={t("Avg/Lt")}>{item?.Average}</td>
                      <td data-title={t("Model")}>{item?.ModalType}</td>
                      <td data-title={t("Created By")}>{item?.CreatedBy}</td>
                      <td data-title={t("Created On")}>{item?.CreatedOn}</td>
                      <td data-title={t("Updated By")}>{item?.UpdatedBy}</td>
                      <td data-title={t("Updated On")}>{item?.UpdatedOn}</td>
                      <td data-title={t("Edit")}>
                        <Link to="#">
                          <FaEdit color="black" onClick={() => handleEdit(item)} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="17" style={{ textAlign: "center", padding: "10px" }}>
                    {t("No Records Found")}
                  </td>
                </tr>
              )}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default VehicleMaster;
