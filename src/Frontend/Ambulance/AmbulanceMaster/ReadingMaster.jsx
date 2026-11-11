import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Heading from "../../../components/UI/Heading";
import { Button } from "react-bootstrap";
import { toast } from "react-toastify";
// import QCFrameMenu from "../QCFrameMenu";
import { apiUrls } from "../../../utils/apiUrls";
import { axiosInstance } from "../../../utils/axiosInstance";
import { notify } from "../../../utils/utils";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../store/reducers/loadingSlice/loadingSlice";
import { formatStandardDate, validateRequiredFields } from "../../../utils/helpers";
import { Form } from "react-bootstrap";
import RadioInput from "../../../components/formComponent/RadioInput";
import Tables from "../../../components/UI/customTable";
import { Link } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { CustomButton } from "../../../components/UI/CustomButton";
import FilterInput from "../../../components/Filter/FilterInput";

const ReadingMaster = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});

  const initialPayload = {
    Vehicle: "",
    ReadingType: "1",
    RateKm: "",
    FromRange: "",
    ToRange: "",
    Amount: ""
  };

  const [payload, setPayload] = useState(initialPayload);
  const [readingTableData, setReadingTableData] = useState([]);
  const [addedTableData, setAddedTableData] = useState([]);
  const [searchReadingTerm, setSearchReadingTerm] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState("");

  const readingTypeMap = {
    "1": "KM Basis",
    "2": "Range Basis",
    "3": "Both",
  };

  const [dropdownlist, setDropdownlist] = useState({
    VehicleList: [],
  });

  const dummyReadingData = [
    {
      VRM_ID: 1,
      VehicleID: "Vehicle 1",
      VehicleName: "Vehicle 1",
      VehicleNo: "VEH001",
      ReadingType: "KM Basis",
      ReadingTypeID: 1,
      RatePerKM: "150.00",
      RangeFrom: "-",
      RangeTo: "-",
      RangeAmount: "-"
    },
    {
      VRM_ID: 2,
      VehicleID: "Vehicle 2",
      VehicleName: "Vehicle 2",
      VehicleNo: "VEH002",
      ReadingType: "Range Basis",
      ReadingTypeID: 2,
      RatePerKM: "-",
      RangeFrom: "0",
      RangeTo: "100",
      RangeAmount: "500"
    }
  ];

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e?.target;
    if (name === "RateKm" || name === "FromRange" || name === "ToRange" || name === "Amount") {
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
      return;
    }

    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const handleEdit = (item) => {
  // Convert API RangeType to radio value
  const reverseReadingTypeMap = {
    "KM Basis": "1",
    "Range Basis": "2",
    "Both": "3",
  };

  setPayload({
    Vehicle: item.VehicleId || "",
    ReadingType: reverseReadingTypeMap[item.RangeType] || "1",
    RateKm: item.RatePerKM?.toString() || "",
    FromRange: item.FromRange?.toString() || "",
    ToRange: item.ToRange?.toString() || "",
    Amount: item.Amount?.toString() || "",
  });

  setEditId(item.ID);     // important for update API
  setIsEditMode(true);
};

  // const handleReset = () => {
  //   setPayload(initialPayload);
  //   setErrors({});
  // };

  const handleReset = () => {
  setPayload(initialPayload);
  setErrors({});
  setIsEditMode(false);
  setEditId("");
};

  const handleReactChange = (name, e) => {
    // handleReset();
    // setAddedTableData([]);
    setPayload(prev => ({
      ...prev,
      [name]: e?.value ?? "",
    }));

    if (name === "Vehicle") {
      // const filtered = dummyReadingData.filter(
      //   item => item?.VehicleID === e?.value
      // );
      getReadingVehicleData(e?.value);

      // setReadingTableData(filtered);
    }
  };

  const handleReadingTypeChange = (value) => {
    console.log("value", value);
    setPayload((prev) => ({
      ...prev,
      ReadingType: value,
    }));
  };

  const handleSave = async () => {
    const requiredFields = [
      "Vehicle",
    ];
    if (payload.ReadingType === "1") {
      requiredFields.push("RateKm");
    }

    // ReadingType = 2 (Range Basis)
    if (payload.ReadingType === "2") {
      requiredFields.push("FromRange", "ToRange", "Amount");
    }

    // ReadingType = 3 (Both)
    if (payload.ReadingType === "3") {
      requiredFields.push("RateKm", "FromRange", "ToRange", "Amount");
    }
    const errors = validateRequiredFields(payload, requiredFields);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    const apiPayload = {
      // vehicleName: payload?.Vehicle || "",
      ratePerKM: Number(payload?.RateKm) || 0,
      fromRange: Number(payload?.FromRange) || 0,
      toRange: Number(payload?.ToRange) || 0,
      amount: Number(payload?.Amount) || 0,
      rangeType: readingTypeMap[payload.ReadingType] || "",
      vehicleId: payload?.Vehicle || 0,
    };
    axiosInstance
      .post(apiUrls.SaveAmbulanceReading, apiPayload)
      .then((res) => {
        console.log("saveres", res);
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          getReadingVehicleData();
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

  }

  const handleUpdate = async () => {
  const requiredFields = ["Vehicle"];

  if (payload.ReadingType === "1") {
    requiredFields.push("RateKm");
  }

  if (payload.ReadingType === "2") {
    requiredFields.push("FromRange", "ToRange", "Amount");
  }

  if (payload.ReadingType === "3") {
    requiredFields.push("RateKm", "FromRange", "ToRange", "Amount");
  }

  const errors = validateRequiredFields(payload, requiredFields);
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }

  const apiPayload = {
    id: editId,                              // 🔴 REQUIRED
    vehicleId: Number(payload.Vehicle) || 0,
    ratePerKM: Number(payload.RateKm) || 0,
    fromRange: Number(payload.FromRange) || 0,
    toRange: Number(payload.ToRange) || 0,
    amount: Number(payload.Amount) || 0,
    rangeType: readingTypeMap[payload.ReadingType],
    isActive: 1
  };

  axiosInstance
    .post(apiUrls.UpdateAmbulanceReading, apiPayload)
    .then((res) => {
      if (res?.data?.success) {
        toast.success(res?.data?.message || "Updated successfully");
        handleReset();
        setIsEditMode(false);
        setEditId("");
        getReadingVehicleData(payload.Vehicle);
      }
    })
    .catch((err) => {
      toast.error(
        err?.response?.data?.message || "Error occurred while updating"
      );
    });
};

  const handleChangeSearch = (e) => {
    const value = e?.target?.value.toLowerCase();
    setSearchReadingTerm(e?.target?.value);

    // if (!value) {
    //   setTableData(masterTable);
    //   return;
    // }

    // const searchableKeys = [
    //   "VehicleNo",
    //   "VehicleName",
    //   "VehicleType",
    //   "ModalType",
    //   "ModalNo",
    //   "RCNo",
    //   "InsuranceNo",
    // ];

    // const filtered = masterTable?.filter((row) =>
    //   searchableKeys.some((key) =>
    //     String(row[key] || "")
    //       .toLowerCase()
    //       .includes(value),
    //   ),
    // );

    // setTableData(filtered);
  };

  const getReadingVehicleData = async (vehicleId) => {
    axiosInstance
      .post(apiUrls.SearchAmbulanceReading,
        {
          vehicleName: vehicleId?.toString() || "",
        }
      )
      .then((res) => {
        console.log("searchvehicleres", res);
        if (res?.data?.success) {
          const apiData = res?.data?.data || [];

          setReadingTableData(
            Array.isArray(apiData) ? apiData : [apiData]
          );
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

  const getVehicleOptions = async () => {
    axiosInstance
      .get(apiUrls.SearchAmbulanceVehicle)
      .then((res) => {
        console.log("searchres", res);
        if (res?.data?.success) {
          const apiData = res?.data?.data || [];
          let mappedData = apiData?.map((ele) => {
            return {
              value: ele.Id,
              label: ele.VehileName,
            };
          });
          setDropdownlist((prev) => ({ ...prev, VehicleList: mappedData }));
          // const mappedData = mapVehicleApiToTable(apiData);
          // setMasterTable(mappedData);
          // setTableData(mappedData);
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
    getReadingVehicleData();
    getVehicleOptions();
  }, []);
  console.log(" reading payload", payload);
  console.log("errors", errors);
  return (
    <>
      <Accordion
        name={t("Reading Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="Vehicle"
              id="Vehicle"
              removeIsClearable={true}
              dynamicOptions={dropdownlist?.VehicleList}
              placeholderName={t("Vehicle ")}
              value={payload?.Vehicle}
              onChange={handleReactChange}
              isDisabled={isEditMode}
            />
            {payload?.Vehicle === "" && (
              <span className="error-message">{errors?.Vehicle}</span>
            )}
          </div>
          <div className="col-xl-1 col-sm-2 col-md-6 col-12">Reading Type: </div>
          <div className="col-xl-3 col-sm-4 col-md-6 col-12 d-flex gap-custom ">
            <RadioInput
              type="radio"
              label="KM Basis"
              name="mode"
              checked={payload.ReadingType === "1"}
              onChange={() => handleReadingTypeChange("1")}

            />
            <RadioInput
              type="radio"
              label="Range Basis"
              name="mode"
              checked={payload.ReadingType === "2"}
              onChange={() => handleReadingTypeChange("2")}

            />
            <RadioInput
              type="radio"
              label="Both"
              name="mode"
              checked={payload.ReadingType === "3"}
              onChange={() => handleReadingTypeChange("3")}

            />
          </div>

          {(payload.ReadingType === "1" || payload.ReadingType === "3") && (
            <>
              <div className="col-xl-1 col-sm-2 col-md-6 col-12">
                <Input
                  type="text"
                  lable={t("Rate/Km")}
                  id="RateKm"
                  name="RateKm"
                  value={payload?.RateKm}
                  onChange={handleChange}
                />
                {payload?.RateKm === "" && (
                  <span className="error-message">{errors?.RateKm}</span>
                )}
              </div>
            </>
          )}
          {(payload.ReadingType === "2" || payload.ReadingType === "3") && (
            <>
              <div className="col-xl-1 col-sm-2 col-md-6 col-12">
                <Input
                  type="text"
                  lable={t("From Range")}
                  id="FromRange"
                  name="FromRange"
                  value={payload?.FromRange}
                  onChange={handleChange}
                />
                {payload?.FromRange === "" && (
                  <span className="error-message">{errors?.FromRange}</span>
                )}
              </div>

              <div className="col-xl-1 col-sm-2 col-md-6 col-12">
                <Input
                  type="text"
                  lable={t("To Range")}
                  id="ToRange"
                  name="ToRange"
                  value={payload?.ToRange}
                  onChange={handleChange}
                />
                {payload?.ToRange === "" && (
                  <span className="error-message">{errors?.ToRange}</span>
                )}
              </div>

              <div className="col-xl-2 col-sm-2 col-md-6 col-12">
                <Input
                  type="text"
                  lable={t("Amount")}
                  id="Amount"
                  name="Amount"
                  value={payload?.Amount}
                  onChange={handleChange}
                />
                {payload?.Amount === "" && (
                  <span className="error-message">{errors?.Amount}</span>
                )}
              </div>
            </>
          )}
          {([1, 2, 3]?.includes(Number(payload?.ReadingType))) && (
            <>
              {/* <CustomButton text="Save" icon="save" onClick={handleSave} className="mr-2"/> */}
                
              <CustomButton
                text={isEditMode ? "Update" : "Save"}
                icon={isEditMode ? "edit" : "save"}
                onClick={isEditMode ? handleUpdate : handleSave}
                className="mr-2"
              />
              <CustomButton text='reset' icon='refresh' onClick={handleReset} className="ml-2"/>
            </>

          )}
        </div>

        <Heading title={t("Readings")}
          secondTitle={
            <>
              <FilterInput
                value={searchReadingTerm}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                inputClass="transparent-background"
              />
            </>
          }
        />

        <div className="row p-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr. No")}</th>
                  <th>{t("Vehicle Name")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("From Range")}</th>
                  <th>{t("To Range")}</th>
                  <th>{t("Reading Type")}</th>
                  <th>{t("Edit")}</th>
                </tr>
              </thead>

              <tbody>
                {readingTableData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No data found
                    </td>
                  </tr>
                ) : (
                  readingTableData.map((item, index) => (
                    <tr key={item.ID}>
                      <td>{index + 1}</td>
                      <td>{item.VehicleName}</td>

                      <td>
                        {item.RangeType === "KM Basis"
                          ? item.RatePerKM
                          : item.Amount}
                      </td>

                      <td>
                        {item.RangeType !== "KM Basis"
                          ? item.FromRange
                          : "-"}
                      </td>

                      <td>
                        {item.RangeType !== "KM Basis"
                          ? item.ToRange
                          : "-"}
                      </td>

                      <td>{item.RangeType}</td>

                      <td>
                        <FaEdit
                          style={{ cursor: "pointer" }}
                          onClick={() => handleEdit(item)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ReadingMaster;
