import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FieldMasterValidation } from "../../utils/Schema";
import Heading from "../../components/UI/Heading";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import { CustomButton, SaveButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { Fieldboy, PlaceholderImage } from "../../assets/index.js"
import { guidNumber } from "../../utils/generateGuid.js";
import CameraModal from "../utils/CameraModal.jsx";

const CreateFieldBoyMaster = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;

  console.log("state", state);

  const { t } = useTranslation();
  const [centre, setCentre] = useState([]);
  const [businessZoneOptions, setBusinessZoneOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([])
  const [cityOptions, setCityOptions] = useState([])
  const [PatientGuid, SetPatientGuid] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fieldBoyImg, setFieldBoyImg] = useState({
    show: false,
    img: PlaceholderImage,
  });
  const [formData, setFormData] = useState({
    FieldBoyID: 0,
    Name: "",
    Age: "",
    Mobile: "",
    Gender: "",
    CentreId: 0,
    BusinessZoneId: 0,
    BusinessZone: "",
    isActive: "1",
    HomeCollection: "0",
    Address: "",
    CityID: 0,
    City: "",
    StateID: 0,
    State: "",
    Pincode: "",
    DeviceId: "",
    UserName: "",
    Password: "",
    ImageGuid: ""
  });
  const [load, setLoad] = useState(false);

  const GenderOptons = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

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
      setCentre(CentreDataValue);
    } catch (error) {
      console.log("Error while fetching centres");
    }
  };

  const GetBusinessZone = () => {
    axiosInstance
      .get("CommonController/GetBusinessZone")
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.BusinessZoneID,
          label: item.BusinessZoneName,
        }));
        setBusinessZoneOptions(options);
      })
      .catch((err) => {
        console.error("API Error:", err);
      });
  };

  const GetStateWiseData = (businessZoneId) => {
    return axiosInstance
      .post(`CommonController/GetStateWiseData?BusinessZoneID=${businessZoneId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.State
        }));
        setStateOptions(options);
      })
      .catch((err) => {
        console.error("API Error:", err);
      });
  };

  const GetCityData = (stateId) => {
    return axiosInstance
      .post(`CommonController/GetStateWiseCityData?StateID=${stateId}`)
      .then((res) => {
        const data = res?.data?.data || [];
        const options = data.map((item) => ({
          value: item.ID,
          label: item.City
        }));
        setCityOptions(options);
      })
      .catch((err) => {
        console.log("City API Error:", err);
      });
  };


  useEffect(() => {
    getAccessCentres();
    GetBusinessZone();
  }, []);

  const handleUpload = (url) => {
    const cityName = cityOptions.find((item) => item.value === formData.CityID)?.label;
    const stateName = stateOptions.find((item) => item.value === formData.StateID)?.label;
    const businessZoneName = businessZoneOptions.find((item) => item.value === formData.BusinessZoneId)?.label;

    const finalPayload = {
      ...formData,
      ImageGuid: PatientGuid,
      isActive: formData.isActive ? 1 : 0,
      City: cityName,
      State: stateName,
      BusinessZone: businessZoneName,
    };
    setLoad(true);
    axiosInstance
      .post(url, finalPayload)
      .then((res) => {
        setLoad(false);
        if (res?.data?.success) {
          toast.success(res?.data?.message)
          setFormData({
            FieldBoyID: 0,
            Name: "",
            Age: "",
            Mobile: "",
            Gender: "",
            CentreId: "",
            BusinessZoneId: "",
            BusinessZone: "",
            isActive: "1",
            HomeCollection: "0",
            Address: "",
            CityID: "",
            City: "",
            StateID: "",
            State: "",
            Pincode: "",
            DeviceId: "",
            UserName: "",
            Password: "",
            ImageGuid: ""
          });
          SetPatientGuid("");
          setFieldBoyImg({ show: false, img: PlaceholderImage });
          navigate("/FieldBoyMaster");
        }
        else { toast.error(res?.data?.message) };
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went Wrong",
        );
      });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "Mobile") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 10) return;
      setFormData({ ...formData, [name]: numericValue });
      return;
    }
    if (name === "Age") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 3) return;
      setFormData({ ...formData, [name]: numericValue });
      return;
    }
    if (name === "Pincode") {
      const numericValue = value.replace(/\D/g, "");
      if (numericValue.length > 6) return;
      setFormData({ ...formData, [name]: numericValue });
      return;
    }

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleReactSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value?.value
    }))

    if (name === "BusinessZoneId") {
      GetStateWiseData(String(value?.value))
    }
    if (name === "StateID") {
      GetCityData(value?.value)
    }
  }

  const handleToggle = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field] == 1 ? 0 : 1,
    }));
  };

  const { errors, handleBlur, touched, handleSubmit } = useFormik({
    initialValues: formData,
    validationSchema: FieldMasterValidation,
    enableReinitialize: true,
    onSubmit: () => {
      handleUpload(
        state?.url
          ? "FieldBoyMaster/UpdateFieldBoy"
          : "FieldBoyMaster/InsertFieldBoy",
      );
    },
  });

  const handleEditData = () => {
    axiosInstance
      .post(state?.url, { FieldBoyID: state?.data })
      .then(async (res) => {
        const data = res?.data?.message[0];

        if (data?.BusinessZoneId) {
          await GetStateWiseData(data?.BusinessZoneId)
        }
        if (data?.StateId) {
          await GetCityData(data?.StateId)
        }

        setFormData({
          FieldBoyID: data?.FieldBoyID,
          Name: data?.Name,
          Age: data?.Age,
          Mobile: data?.Mobile,
          Gender: data?.Gender,
          BusinessZoneId: data?.BusinessZoneId,
          BusinessZone: data?.BusinessZone,
          isActive: data?.IsActive,
          HomeCollection: data?.HomeCollection,
          Address: data?.Address,
          CentreId: data?.CentreID,
          CityID: data?.CityId,
          City: data?.City,
          StateID: data?.StateId,
          State: data?.State,
          Pincode: data?.Pincode,
          DeviceId: data?.DeviceID,
          UserName: data?.Username,
          Password: data?.Password,
          ImageGuid: data?.ImageGuid
        });
        setFieldBoyImg({
          show: false,
          img: data?.ImagePath
            ? data?.ImagePath
            : PlaceholderImage,
        });
        if (data?.ImageGuid) {
          SetPatientGuid(data.ImageGuid);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  useEffect(() => {
    if (state) {
      handleEditData();
    }
  }, []);

  console.log("formdata", formData)
  return (
    <>
      <Accordion
        name={t("Field Boy Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="d-flex justify-content-center align-items-start">

          <div className="row col-10 pt-2 pl-2 pr-2">
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={centre}
                name="CentreId"
                lable={t("Centre")}
                id="CentreId"
                removeIsClearable={true}
                placeholderName={t("Centre")}
                value={formData.CentreId}
                onChange={handleReactSelectChange}
              />
            </div>
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={businessZoneOptions}
                name="BusinessZoneId"
                lable={t("Business Zone")}
                id="BusinessZoneId"
                removeIsClearable={true}
                placeholderName={t("Business Zone")}
                value={formData.BusinessZoneId}
                onChange={handleReactSelectChange}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="text"
                name="Name"
                className="required-fields"
                lable={t("Field Boy Name")}
                placeholder=" "
                maxLength={50}
                onChange={handleChange}
                value={formData?.Name}
              />
              <span className="error-message">{errors?.Name}</span>
            </div>
            <div className="col-sm-2">
              <Input
                type="number"
                name="Age"
                lable={t("Age (Years)")}
                className="required-fields"
                placeholder=" "
                maxLength={3}
                onChange={handleChange}
                value={formData?.Age}
              />
              <span className="error-message">{errors?.Age}</span>
            </div>
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={GenderOptons}
                name="Gender"
                lable={t("Gender")}
                id="Gender"
                removeIsClearable={true}
                placeholderName={t("Select Gender")}
                value={formData.Gender}
                onChange={handleReactSelectChange}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="number"
                className="required-fields"
                name="Mobile"
                lable={t("Mobile")}
                placeholder=" "
                maxLength={10}
                onChange={handleChange}
                value={formData?.Mobile}
              />
              <span className="error-message">{errors?.Mobile}</span>
            </div>
            <div className="col-sm-2">
              <Input
                type="text"
                name="Address"
                lable={t("Address")}
                placeholder=" "
                maxLength={50}
                onChange={handleChange}
                value={formData?.Address}
              />
            </div>
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={stateOptions}
                name="StateID"
                lable={t("State")}
                id="State"
                removeIsClearable={true}
                placeholderName={t("State")}
                value={formData.StateID}
                onChange={handleReactSelectChange}
                disabled={stateOptions.length === 0}
              />
            </div>
            <div className="col-sm-2">
              <ReactSelect
                dynamicOptions={cityOptions}
                name="CityID"
                lable={t("City")}
                id="City"
                removeIsClearable={true}
                placeholderName={t("City")}
                value={formData.CityID}
                onChange={handleReactSelectChange}
                disabled={cityOptions.length === 0}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="tel"
                name="Pincode"
                lable={t("PinCode")}
                placeholder=" "
                maxLength={6}
                onChange={handleChange}
                value={formData?.Pincode}
              />
            </div>

            <div className="col-sm-2">
              <Input
                type="number"
                name="DeviceId"
                lable={t("DeviceId")}
                placeholder=" "
                maxLength={6}
                onChange={handleChange}
                value={formData?.DeviceId}
              />
            </div>
            <div className="col-sm-2">
              <Input
                type="text"
                name="UserName"
                lable={t("UserName")}
                placeholder=" "
                onChange={handleChange}
                value={formData?.UserName}
                disabled={state?.url ? true : false}
              />
            </div>
            <div className="col-sm-2">
              <div style={{ position: "relative" }}>
                <Input
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  lable={t("Password")}
                  placeholder=" "
                  maxLength={6}
                  onChange={handleChange}
                  value={formData?.Password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0px",
                    top: "2px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6c757d",
                    zIndex: 10
                  }}
                >
                  <i className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}></i>
                </button>
              </div>
            </div>
            {/* <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                type="checkbox"
                name="isActive"
                label={t("Active")}
                checked={formData?.isActive == "1"}
                onChange={handleChange}
              />
            </div>
            <label className="col-sm-10">{t("Active")}</label>
          </div> */}

            <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
              gap: "5px"
            }}>
              <label class="switch mb-0">
                <input
                  type="checkbox"
                  checked={formData.isActive == "1"}
                  onChange={() => handleToggle("isActive")}
                />
                <span class="slider"></span>
              </label>
              <strong>
                <span>{t("IsActive")}</span>
              </strong>
            </div>

            <div className="col-sm-1">
              {load ? (
                <Loading />
              ) : (
                <CustomButton
                  text={state?.url ? t("Update") : t("Save")}
                  icon={state?.url ? t("edit") : t("save")}
                  onClick={handleSubmit}
                />
              )}
            </div>

            <div className="col-sm-auto">
              <Link to="/FieldBoyMaster">
                <CustomButton
                  text={t("Back to List")}
                  icon={"back"}
                />
              </Link>
            </div>
          </div>
          <div className="col-2 d-flex justify-content-center align-items-center">
            <div
              style={{
                cursor: "pointer",
                overflow: "hidden"
              }}
            >
              <img
                height={78}
                src={fieldBoyImg.img}
                style={{
                  width: "100%",
                  borderRadius: "10px",
                  border: "1px solid #797979ff"
                }}
                alt={formData?.Name || "Not found"}
                onError={(e) => {
                  e.target.src = PlaceholderImage;
                }}
                onClick={() => {
                  if (!PatientGuid) {
                    SetPatientGuid(guidNumber());
                  }
                  setFieldBoyImg(prev => ({ ...prev, show: true }));
                }}
              />
            </div>
          </div>
        </div>
      </Accordion>

      {fieldBoyImg.show && (
        <CameraModal
          visible={fieldBoyImg.show}
          guid={PatientGuid}
          pageName={"CreateFieldBoyMaster"}
          defaultImage={fieldBoyImg.img}
          handleClose={(guidNo, newUrl) => {
            if (guidNo) SetPatientGuid(guidNo);

            setFieldBoyImg({
              show: false,
              img: newUrl ? newUrl : PlaceholderImage,
            });
          }}
        />
      )}
    </>
  );
};

export default CreateFieldBoyMaster;
