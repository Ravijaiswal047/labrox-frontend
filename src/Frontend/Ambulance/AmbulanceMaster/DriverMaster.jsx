import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { PlusIcon, ViewMenu } from "../../../components/SvgIcons";
import Heading from "../../../components/UI/Heading";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
// import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { notify } from "../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import { formatStandardDate, PreventSpecialCharacter, validateRequiredFields } from "../../../utils/helpers";
import { Form } from "react-bootstrap";
import Tables from "../../../components/UI/customTable";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import FilterInput from "../../../components/Filter/FilterInput";
import { colorCodingData } from "../../../utils/Constants";

const DriverMaster = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [searchTermDriver, setSearchTermDriver] = useState("");
  const [masterTableData, setMasterTableData] = useState([]);
  const initialPayload = {
    driverName: "",
    licenseNumber: "",
    licenseType: "",
    licenseExpiryDate: new Date(),
    nextOfKin: "",
    contactNumber: "",
    address: "",
    remarks: "",
    isActive: 1,
  };

  const [payload, setPayload] = useState(initialPayload);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState(null);
  const [data, setData] = useState([]);

  const licenseOptions = [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
    { value: "E", label: "E" },
    { value: "F", label: "F" },
  ];

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleChangeSearch = (e) => {
    const value = e?.target?.value?.toLowerCase();
    setSearchTermDriver(e?.target?.value);

    if (!value) {
      setData(masterTableData);
      return;
    }

    const searchableKeys = [
      "driverName",
      "licenseNumber",
      "licenseType",
      "contactNumber",
      "nextOfKin",
    ];

    const filtered = masterTableData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setData(filtered);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;

    if (name === "driverName") {
      const onlyAlphabets = value.replace(/[^a-zA-Z\s]/g, "");
      setPayload((prev) => ({
        ...prev,
        [name]: onlyAlphabets,
      }));
      return;
    }

    if (name === "licenseNumber") {
      setPayload((prev) => ({
        ...prev,
        [name]: ["licenseNumber"].includes(name)
          ? PreventSpecialCharacter(value)
            ? value.toUpperCase()
            : payload[name]
          : value.toUpperCase(),
      }))
      return;
    }

    if (name === "nextOfKin" || name === "contactNumber") {
      const onlyDigits = value.replace(/\D/g, "");
      setPayload((prev) => ({
        ...prev,
        [name]: onlyDigits,
      }));
      return;
    }

    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  const handleReset = () => {
    setPayload(initialPayload);
    setErrors({});
    setIsEditing(false); 
    getDriverData();
  };

  const handleReactChange = (name, e) => {
    // console.log("name",name,e.value);
    setPayload(prev => ({
      ...prev,
      [name]: e?.value ?? "",
    }));
  };

  const handleStatusFilter = (id) => {
    if (id === "all") {
      setStatusFilter(null);
      setData(masterTableData);
      return;
    }

    const status = id === "8" ? 1 : 0;
    setStatusFilter(status);

    setData(
      masterTableData?.filter((item) => item.isActive === status)
    );
  };

  const handleEdit = (item) => {
    // Map API data to your form payload
    const mappedPayload = {
      id: item.ID,
      driverName: item.DriverName || "",
      licenseNumber: item.LicenseNumber || "",
      licenseType: item.LicenseType || "",
      licenseExpiryDate: item.LicenseExpiryDate
        ? new Date(item.LicenseExpiryDate) // convert to Date if using DatePicker
        : new Date(),
      nextOfKin: item.NextOfKin || "",
      contactNumber: item.ContactNumber || "",
      address: item.Address || "",
      remarks: item.Remarks || "",
      isActive: item.IsActive || 0,
    };

    setPayload(mappedPayload);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const requiredFields = [
      "driverName",
      "licenseNumber",
      "licenseType",
      "licenseExpiryDate",
      "nextOfKin",
      "contactNumber",
      "address",
    ];
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const apiPayload = {
      driverName: payload?.driverName,
      licenseNumber: payload?.licenseNumber,
      licenseType: payload?.licenseType,
      licenseExpiryDate: formatStandardDate(payload?.licenseExpiryDate, "YYYY-MM-DD"),
      nextOfKin: payload?.nextOfKin,
      contactNumber: payload?.contactNumber,
      address: payload?.address,
      remarks: payload?.remarks,
      isActive: payload?.isActive,
    };

    axiosInstance
      .post(apiUrls.SaveAmbulanceDriver, apiPayload)
      .then((res) => {
        console.log("save res", res);
        if (res?.data?.success) {
          notify(res?.data?.message || "Data Saved Successfully", "success");
          setPayload(initialPayload);
          setErrors({});
        }
      })
      .catch((err) => {
        notify(
          err?.response?.data?.message || "Error Occurred",
          "error"
        );
      });
  }

  const getDriverData = async () => {
    axiosInstance
      .get(apiUrls.GetAmbulanceDrivers)
      .then((res) => {
        console.log("searchres", res);
        if (res?.data?.success) {
          const apiData = res?.data?.data || [];
          const mappedData = apiData.map(item => ({
            ...item,
            licenseExpiryDate: item.LicenseExpiryDate,
            driverName: item.DriverName,
            licenseNumber: item.LicenseNumber,
            licenseType: item.LicenseType,
            nextOfKin: item.NextOfKin,
            contactNumber: item.ContactNumber,
            address: item.Address,
            isActive: item.IsActive,
            remarks: item.Remarks,
          }));

          setData(mappedData);
          setMasterTableData(mappedData);
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

  const handleUpdate = () => {
    // if (!payload.id) {
    //   notify("No driver selected for update", "error");
    //   return;
    // }

    // const requiredFields = [
    //   "driverName",
    //   "licenseNumber",
    //   "licenseType",
    //   "licenseExpiryDate",
    //   "nextOfKin",
    //   "contactNumber",
    //   "address",
    // ];
    // const validationErrors = validateRequiredFields(payload, requiredFields);
    // if (Object.keys(validationErrors).length > 0) {
    //   setErrors(validationErrors);
    //   return;
    // }

    const apiPayload = {
      id: payload?.id,
      driverName: payload?.driverName,
      licenseNumber: payload?.licenseNumber,
      licenseType: payload?.licenseType,
      licenseExpiryDate: payload?.licenseExpiryDate
        ? new Date(payload?.licenseExpiryDate).toISOString()
        : null, // convert to ISO string
      nextOfKin: payload?.nextOfKin,
      contactNumber: payload?.contactNumber,
      address: payload?.address,
      remarks: payload?.remarks,
      isActive: payload?.isActive,
    };
    axiosInstance
      .post(apiUrls.UpdateDriver, apiPayload)
      .then((res) => {
        console.log("update res", res);
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleReset();
          setIsEditing(false);
          getDriverData(); // refresh table
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Error Occurred"
        );
      });
  };

  useEffect(() => {
    getDriverData();
  }, []);

  console.log("Payload", payload);
  console.log("errors", errors);
  console.log("status",statusFilter);
  return (
    <>
      <Accordion
        name={t("Driver Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Driver Name")}
              id="driverName"
              name="driverName"
              value={payload?.driverName}
              onChange={handleChange}
            />
            {payload?.driverName === "" && (
              <span className="error-message">{errors?.driverName}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("License Number")}
              id="licenseNumber"
              name="licenseNumber"
              value={payload?.licenseNumber}
              onChange={handleChange}
              maxLength={20}
            />
            {payload?.licenseNumber === "" && (
              <span className="error-message">{errors?.licenseNumber}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="licenseType"
              id="licenseType"
              removeIsClearable={true}
              dynamicOptions={licenseOptions}
              placeholderName={t("License Type")}
              value={payload?.licenseType}
              onChange={handleReactChange}
            />
            {payload?.licenseType === "" && (
              <span className="error-message">{errors?.licenseType}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <DatePicker
              name="licenseExpiryDate"
              id="licenseExpiryDate"
              value={payload?.licenseExpiryDate}
              onChange={date => dateSelect(date, "licenseExpiryDate")}
              // maxDate={new Date()}
              placeholder=""
              lable={t("License Expiry Date")}
              className="custom-calendar"
            />
            {payload?.licenseExpiryDate === "" && (
              <span className="error-message">{errors?.licenseExpiryDate}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Next of Kin")}
              id="nextOfKin"
              name="nextOfKin"
              value={payload?.nextOfKin}
              onChange={handleChange}
              maxLength={10}
            />
            {payload?.nextOfKin === "" && (
              <span className="error-message">{errors?.nextOfKin}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Contact Number")}
              id="contactNumber"
              name="contactNumber"
              value={payload?.contactNumber}
              onChange={handleChange}
              maxLength={10}
            />
            {payload?.contactNumber === "" && (
              <span className="error-message">{errors?.contactNumber}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Address")}
              id="address"
              name="address"
              value={payload?.address}
              onChange={handleChange}
            />
            {payload?.address === "" && (
              <span className="error-message">{errors?.address}</span>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=""
              lable={t("Remarks")}
              id="remarks"
              name="remarks"
              value={payload?.remarks}
              onChange={handleChange}
            />
            {payload?.remarks === "" && (
              <span className="error-message">{errors?.remarks}</span>
            )}
          </div>

          <div className="col-xs-1 col-sm-1 mt-1">
            <Form.Check
              type="switch"
              id="isActive"
              name="isActive"
              label={t("Active")}
              onChange={handleChange}
              checked={payload?.isActive}
            />
          </div>
          <div className="col-xs-2 col-sm-2 col-md-2 d-flex">
            {/* <Button
              className="rounded py-0 "
              onClick={handleSave}
            >
              Save
            </Button> */}
            <div className="col-xs-2 col-sm-2 col-md-2 d-flex">
              <Button className="rounded py-0" onClick={isEditing ? handleUpdate : handleSave}>
                {isEditing ? t("Update") : t("Save")}
              </Button>
              <Button className="rounded py-0 ml-2" onClick={handleReset}>
                {t("Reset")}
              </Button>
            </div>

          </div>

        </div>

        {/* <Heading name={t("Vehicle Record")} isBreadcrumb={true} /> */}
      </Accordion>
      <Accordion
        title={t("Driver Records")}
        defaultValue={true}
        seconTitle={
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
              value={searchTermDriver}
              onChange={handleChangeSearch}
              placeholder="Filter Table"
              inputClass="transparent-background"
            />
            </div>

          </>
        }
      >
        <div className="row p-2 ">
          <div className="col-12">
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("Sr. No")}</th>
                  <th>{t("Driver Name")}</th>
                  <th>{t("License Number")}</th>
                  <th>{t("License Type")}</th>
                  <th>{t("License Expiry Date")}</th>
                  <th>{t("Next of Kin")}</th>
                  <th>{t("Contact Number")}</th>
                  <th>{t("Address")}</th>
                  <th>{t("Remarks")}</th>
                  {/* <th>{t("Is Active")}</th> */}
                  <th>{t("Edit")}</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const rowColor = item.isActive === 1 ? '#75f975' : '#ffe58f';

                  return (
                    <tr key={i}
                      className={item.isActive === 1 ? 'active' : 'deactive'}
                      style={{ backgroundColor: rowColor, backgroundImage: 'none' }}
                    >
                      <td data-title={t("Sr. No")}>{i + 1}</td>
                      <td data-title={t("Driver Name")}>{item.driverName}</td>
                      <td data-title={t("License Number")}>{item.licenseNumber}</td>
                      <td data-title={t("License Type")}>{item.licenseType}</td>
                      <td data-title={t("License Expiry Date")}>{item.licenseExpiryDate}</td>
                      <td data-title={t("Next of Kin")}>{item.nextOfKin}</td>
                      <td data-title={t("Contact Number")}>{item.contactNumber}</td>
                      <td data-title={t("Address")}>{item.address}</td>
                      <td data-title={t("Remarks")}>{item.remarks}</td>
                      {/* <td data-title={t("Is Active")}>
                      {item.isActive === 1 ? t("Active") : t("Inactive")}
                    </td> */}
                      <td data-title={t("Edit")}>
                        <Link to="#"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit color="black" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DriverMaster;
