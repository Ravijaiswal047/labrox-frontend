import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { getTrimmedData, number } from "../../utils/helpers";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import { DocotorReferal } from "../../utils/Schema";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Form from "react-bootstrap/Form";
import { CustomButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import "./CreateDoctorMaster.css";

const DEFAULT_VALUES = {
  Title: "Dr.(Mr)",
  Name: "",
  ClinicName: "",
  Email: "",
  Address: "",
  Phone: "",
  Mobile: "",
  Notification: "",
  Specialization: "",
  Degree: "",
  Zone: "",
  Locality: "",
  isActive: 1,
  SecondReferDoctor: 0,
  ProEmployee: "",
  allowlogin: "0",
  username: "",
  password: "",
  DocIsRefer: "0",
  // Sharing = "1" (Yes) or "0" (No) — default Yes (Doctor Master Allow Sharing)
  Sharing: "1",
  // IsReferral = selected DoctorReferalID from sharing dropdown
  IsReferral: "",
  RequiredAttachment: [],
  AllowRecieptSms: 0,
  AllowRecieptWhatsApp: 0,
  AllowRecieptMail: 0,
};

const CreateDoctorMaster = () => {
  const userData = useLocalStorage("userData", "get");
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [doc, setDoc] = useState([]);


  const [Title, setTitle] = useState([]);
  const [Specialization, setSpecialization] = useState([]);
  const [Degree, setDegree] = useState([]);
  const [proEmplyee, setProEmployee] = useState([]);
  const [referDoctor, setReferDoctor] = useState([]);
  const [load, setLoad] = useState(false);

  const {
    values,
    errors,
    handleBlur,
    touched,
    handleSubmit,
    setFieldValue,
    setValues,
  } = useFormik({
    initialValues: DEFAULT_VALUES,
    enableReinitialize: false,
    validationSchema: DocotorReferal,

    onSubmit: (vals) => {
      console.log("=== SUBMIT VALUES ===", vals);
      setLoad(true);

      // ── Sharing logic ────────────────────────────────────────────────────
      // Sharing = "1" (Yes) → send selected doctor ID in both fields
      // Sharing = "0" or "" (No / not selected) → send 0 for both fields
      const isSharingYes = vals.Sharing === "1";
      const referDoctorShareID = isSharingYes ? Number(vals.IsReferral) || 0 : 0;
      const isReferal = isSharingYes ? Number(vals.IsReferral) || 0 : 0;

      const finalPayload = {
        DoctorReferalID: state?.id ?? 0,
        Title: vals.Title,
        Name: vals.Name,
        ClinicName: vals.ClinicName,
        Email: vals.Email,
        Address: vals.Address,
        Phone: vals.Phone,
        Mobile: vals.Mobile,
        Specialization: vals.Specialization,
        Degree: vals.Degree,
        Zone: vals.Zone,
        Locality: vals.Locality,
        Notification: vals.Notification,
        IsActive: Number(vals.isActive) || 0,
        SecondReferDoctor: Number(vals.SecondReferDoctor) || 0,
        ProEmployee: vals.ProEmployee !== "" ? Number(vals.ProEmployee) || 0 : 0,
        ProEmployeeID: vals.ProEmployee !== "" ? Number(vals.ProEmployee) || 0 : 0,
        DocIsRefer: Number(vals.DocIsRefer) || 0,
        // Sharing fields
        ReferMasterShare: isSharingYes ? 1 : 0,  // 1 = Yes, 0 = No
        IsReferal: isReferal,              // selected doctor ID or 0
        ReferDoctorShareID: referDoctorShareID,     // selected doctor ID or 0
        // Login fields
        AllowLogin: String(vals.allowlogin),
        Username: vals.username ?? "",
        Password: vals.password ?? "",
        // Schema defaults
        IsVisible: 0,
        IsLock: 0,
        DoctorGroupID: 0,
        IsDoctorMerge: 0,
        RequiredAttachment: vals.RequiredAttachment || [],
        AllowRecieptSms: vals.AllowRecieptSms,
        AllowRecieptWhatsApp: vals.AllowRecieptWhatsApp,
        AllowRecieptMail: vals.AllowRecieptMail,
      };

      console.log("=== FINAL PAYLOAD ===", finalPayload);

      axiosInstance
        .post(
          state?.url1 ? state?.url1 : "DoctorReferal/SaveDoctorReferal",
          getTrimmedData(finalPayload)
        )
        .then((res) => {
          setLoad(false);
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            navigate("/DoctorReferal");
          } else {
            toast.error(res?.data?.message || "Something went wrong");
          }
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message ?? "error occured");
          setLoad(false);
        });
    },
  });

  // ── Generic field change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? (checked ? 1 : 0) : value;

    // When Sharing switched to Yes → load doctor list if not loaded yet
    if (name === "Sharing" && newValue === "1" && referDoctor.length === 0) {
      getDoctorLists();
    }

    // When Sharing switched to No → clear selected sharing doctor
    if (name === "Sharing" && newValue !== "1") {
      setFieldValue("IsReferral", "");
    }

    setFieldValue(name, newValue);
  };

  // ── Toggle switch ─────────────────────────────────────────────────────────
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    const newValue =
      name === "allowlogin" ? (checked ? "1" : "0") : checked ? 1 : 0;
    setFieldValue(name, newValue);
  };

  // ── DocIsRefer ReactSelect ────────────────────────────────────────────────
  const handleTypeChange = (name, option) => {
    setFieldValue(name, option?.value ?? "");
  };

  // ── Sharing Doctor ReactSelect ────────────────────────────────────────────
  const handleSharingDoctorChange = (name, option) => {
    console.log("=== SHARING DOCTOR CHANGE ===", { name, option });

    // Defensive: handle both (name, option) and (option) calling conventions
    if (typeof name === "object" && name !== null) {
      // Called as onChange(option) — name is actually the option object
      const selectedValue = name?.value ?? "";
      console.log("Single-arg call, value:", selectedValue);
      setFieldValue("IsReferral", selectedValue);
    } else {
      // Called as onChange(name, option)
      const selectedValue = option?.value ?? "";
      console.log("Two-arg call, value:", selectedValue);
      setFieldValue(name, selectedValue);
    }
  };

  const handleMultiSelectChange = (name, value) => {
    setFieldValue(name, value);
  };

  // ── API: sharing doctor list ──────────────────────────────────────────────
  const getDoctorLists = () => {
    axiosInstance
      .get("DoctorReferal/SharingDoctorList")
      .then((res) => {
        const data = res?.data?.message || [];
        const formatted = data.map((item) => ({
          label: `${item?.Title} ${item?.Name}`,
          value: String(item?.DoctorReferalID),
        }));
        console.log("Sharing doctor list loaded:", formatted);
        setReferDoctor(formatted);
      })
      .catch((err) => console.log(err));
  };

  // ── API: dropdown data ────────────────────────────────────────────────────
  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        const data = res.data.message;
        const mapped = data.map((ele) => ({
          value: ele.FieldDisplay,
          label: ele.FieldDisplay,
        }));
        if (name === "Title") setTitle(mapped);
        if (name === "Specialization") setSpecialization(mapped);
        if (name === "Degree") setDegree(mapped);
      })
      .catch((err) => console.log(err));
  };

  // ── API: pro employees ────────────────────────────────────────────────────
  const getProEmployee = () => {
    axiosInstance
      .get("Employee/ProEmployee")
      .then((res) => {
        const data = res?.data?.message || [];
        const mapped = data.map((ele) => ({
          value: ele?.EmployeeID,
          label: ele?.EmployeeName,
        }));
        setProEmployee(mapped);
      })
      .catch((err) => console.log(err));
  };

  const getRequiredAttachment = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "RequiredAttachment",
      })
      .then((res) => {
        let data = res.data.message;
        let RequiredAttachment = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        setDoc(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };

  // ── API: fetch existing doctor (edit mode) ────────────────────────────────
  const fetchDoctor = () => {
    axiosInstance
      .post(state?.url, { DoctorReferalID: state?.id })
      .then((res) => {
        const data = res?.data?.message?.[0];
        if (!data) return;

        // Map API response fields back to form field names
        const mapped = {
          Title: data.Title ?? "Dr.(Mr)",
          Name: data.Name ?? "",
          ClinicName: data.ClinicName ?? "",
          Email: data.Email ?? "",
          Address: data.Address ?? "",
          Phone: data.Phone ?? "",
          Mobile: data.Mobile ?? "",
          Specialization: data.Specialization ?? "",
          Degree: data.Degree ?? "",
          Zone: data.Zone ?? "",
          Locality: data.Locality ?? "",
          Notification: data.Notification ?? data.NotificationName ?? "",
          isActive: data.IsActive ?? 1,
          SecondReferDoctor: data.SecondReferDoctor ?? 0,
          // ProEmployeeID → ProEmployee (form field)
          ProEmployee:
            data.ProEmployeeID != null
              ? Number(data.ProEmployeeID)
              : data.ProEmployee != null
                ? Number(data.ProEmployee)
                : "",
          // AllowLogin → allowlogin (form field)
          allowlogin: data.AllowLogin != null ? String(data.AllowLogin) : "0",
          username: data.Username ?? "",
          password: data.Password ?? "",
          DocIsRefer: data.DocIsRefer ?? data.docIsRefer ?? 0,
          // ReferMasterShare → Sharing ("1" = Yes, "0" = No)
          Sharing: String(
            data.ReferMasterShare ?? data.referMasterShare ?? 1
          ),
          // ReferDoctorShareID / IsReferal → IsReferral (selected doctor ID)
          IsReferral:
            data.ReferDoctorShareID || data.referDoctorShareID
              ? String(data.ReferDoctorShareID ?? data.referDoctorShareID)
              : data.IsReferal || data.isReferal
                ? String(data.IsReferal ?? data.isReferal)
                : "",
          RequiredAttachment: data.RequiredAttachment
            ? (data.RequiredAttachment).split(",").map(Number)
            : [],
          AllowRecieptSms: data.AllowRecieptSms ?? 0,
          AllowRecieptWhatsApp: data.AllowRecieptWhatsApp ?? 0,
          AllowRecieptMail: data.AllowRecieptMail ?? 0,
        };

        console.log("Fetched & mapped doctor data:", mapped);
        setValues(mapped);

        // Pre-load sharing doctor list if Sharing = Yes
        if (String(data?.ReferMasterShare ?? data?.referMasterShare) === "1") {
          getDoctorLists();
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? "error occured");
      });
  };

  useEffect(() => {
    getDropDownData("Title");
    getDropDownData("Specialization");
    getDropDownData("Degree");
    getProEmployee();
    controllerDynamic();
    getRequiredAttachment()
  }, []);

  useEffect(() => {
    if (state) {
      fetchDoctor();
    }

  }, []);

  const PAGE_ID = "22";



  const controllerDynamic = async () => {
    const { controllersData, controllerTabbingOrder } =
      await getSearchController(PAGE_ID);
    setTabbingOrder(controllerTabbingOrder);
    setControllerDynamicList(controllersData);
  };
  const showAlways = (controlId) => {
    const showAlwaysList = [
      // "Centre Type",
    ];
    return showAlwaysList.includes(controlId);
  };

  const isHideController = (cntrId = "") => {
    if (showAlways(cntrId)) return true;
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId,
    );
    if (isPresent?.ControlDisplayID) {
      return !!controllerDynamicList?.find(
        (x) => x?.ControlDisplayID === cntrId,
      )?.IsShow;
    }
    return true;
  };

  const SharingOptions = [
    { label: "Select", value: "" },
    { label: "Yes", value: "1" },
    { label: "No", value: "0" },
  ];

  const docIsReferalOption = [
    { label: "No", value: 0 },
    { label: "Yes", value: 1 },
  ];

  return (
    <>
      <Accordion
        name={t("Create New Doctor")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        {/* ── Row 1 ── */}
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <SelectBox
              options={Title}
              name="Title"
              selectedValue={values.Title}
              onChange={(e) => setFieldValue("Title", e.target.value)}
              id="Title"
              lable="Title"
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              className="required-fields"
              placeholder=" "
              lable="Doctor Name"
              id="DoctorName"
              name="Name"
              max={75}
              value={values.Name}
              onChange={handleChange}
            />
            {errors.Name && touched.Name && (
              <div className="error-message">{errors.Name}</div>
            )}
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="ClinicName"
              id="ClinicName"
              name="ClinicName"
              max={75}
              value={values.ClinicName}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="email"
              placeholder=" "
              lable="Email"
              id="Email"
              name="Email"
              max={50}
              value={values.Email}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              placeholder=" "
              lable="Phone"
              id="Phone"
              name="Phone"
              maxLength={13}
              minLength={5}
              onInput={(e) => number(e, 13)}
              value={values.Phone}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              className="required-fields"
              type="text"
              placeholder=" "
              lable="Mobile"
              id="Mobile"
              name="Mobile"
              maxLength={10}
              minLength={5}
              value={values.Mobile}
              onBlur={handleBlur}
              onChange={handleChange}
            />
            {errors.Mobile && touched.Mobile && (
              <div className="error-message">{errors.Mobile}</div>
            )}
          </div>
        </div>

        {/* ── Row 2 ── */}
        <div className="row pt-1 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              lable="Specialization"
              name="Specialization"
              options={[
                { label: "Select Specialization", value: "" },
                ...Specialization,
              ]}
              selectedValue={values.Specialization}
              id="Specialization"
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              options={[{ label: "Select Degree", value: "" }, ...Degree]}
              id="Degree"
              lable="Degree"
              name="Degree"
              selectedValue={values.Degree}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              max={200}
              placeholder=" "
              lable="Address"
              id="Address"
              name="Address"
              value={values.Address}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              max={200}
              placeholder=" "
              lable="Zone"
              id="Zone"
              name="Zone"
              value={values.Zone}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              max={200}
              placeholder=" "
              lable="Locality"
              id="Locality"
              name="Locality"
              value={values.Locality}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <Input
              type="text"
              max={75}
              placeholder=" "
              lable="Remarks"
              id="Notification"
              name="Notification"
              value={values.Notification}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              options={[{ label: "Select", value: "" }, ...proEmplyee]}
              name="ProEmployee"
              selectedValue={values.ProEmployee}
              onChange={handleChange}
              id="ProEmployee"
              lable="ProEmployee"
            />
          </div>

          {/* Sharing Yes/No */}
          <div className="col-sm-2">
            <SelectBox
              options={SharingOptions}
              name="Sharing"
              selectedValue={values.Sharing}
              onChange={handleChange}
              id="Sharing"
              lable="Sharing"
            />
          </div>

          {/* Sharing Doctor dropdown — visible only when Sharing = Yes */}
          {values.Sharing === "1" && (
            <div className="col-sm-2">
              <ReactSelect
                searchable={true}
                className="required-fields"
                dynamicOptions={
                  state?.id
                    ? referDoctor
                    : [{ label: "Self Sharing", value: "-1" }, ...referDoctor]
                }
                name="IsReferral"
                placeholderName="Select Sharing Doctor"
                value={values.IsReferral}
                onChange={handleSharingDoctorChange}
                id="IsReferral"
                lable={t("Sharing Doctor")}
              />
              {errors.IsReferral && touched.IsReferral && (
                <div className="error-message">{errors.IsReferral}</div>
              )}
            </div>
          )}

          {controllerDynamicList
            ?.sort((a, b) => a.DisplayOrder - b.DisplayOrder)
            .map((item) => {
              if (
                item?.ControlDisplayID === "RequiredAttachment" &&
                isHideController("RequiredAttachment")
              ) {
                return (
                  <div className="col-sm-2 mb-1">
                    <MultiSelectComp
                      options={doc}
                      label="RequiredAttachment"
                      id="RequiredAttachment"
                      value={values?.RequiredAttachment}
                      name="RequiredAttachment"
                      onChange={handleMultiSelectChange}
                    />
                    {item?.IsMandatory === 1 &&
                      moreErrors?.[item.ControlDisplayID] && (
                        <div className="error-message">
                          {moreErrors[item.ControlDisplayID]}
                        </div>
                      )}
                  </div>
                );
              }
            })}
        </div>

        {/* ── Row 3 ── */}
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-auto mt-2">
            <Form.Check
              type="switch"
              id="isActive"
              name="isActive"
              checked={values.isActive === 1}
              onChange={handleToggleChange}
              label={t("Active")}
            />
          </div>

          <div className="col-sm-auto mt-2 ml-3">
            <Form.Check
              type="switch"
              id="SecondReferDoctor"
              name="SecondReferDoctor"
              checked={values.SecondReferDoctor === 1}
              onChange={handleToggleChange}
              label={t("Second Refer Doctor")}
            />
          </div>

          <div className="col-sm-auto mt-2 ml-3">
            <Form.Check
              type="switch"
              id="AllowRecieptSms"
              name="AllowRecieptSms"
              checked={values.AllowRecieptSms === 1}
              onChange={handleToggleChange}
              label={t("IsLabReportSMS")}
            />
          </div>

          <div className="col-sm-auto mt-2 ml-3">
            <Form.Check
              type="switch"
              id="AllowRecieptWhatsApp"
              name="AllowRecieptWhatsApp"
              checked={values.AllowRecieptWhatsApp === 1}
              onChange={handleToggleChange}
              label={t("IsLabReportWhatsapp")}
            />
          </div>

          <div className="col-sm-auto mt-2 ml-3">
            <Form.Check
              type="switch"
              id="AllowRecieptMail"
              name="AllowRecieptMail"
              checked={values.AllowRecieptMail === 1}
              onChange={handleToggleChange}
              label={t("IsLabReportEmail")}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={docIsReferalOption}
              onChange={handleTypeChange}
              placeholderName="Select DoctorIsRefer"
              name="DocIsRefer"
              id="DocIsRefer"
              value={values.DocIsRefer}
            />
          </div>

          <div className="col-sm-auto mt-2">
            <Form.Check
              type="switch"
              id="allowlogin"
              name="allowlogin"
              checked={values.allowlogin === "1"}
              onChange={handleToggleChange}
              label={t("IsLogin")}
            />
          </div>

          {values.allowlogin === "1" && (
            <>
              <div className="col-sm-2">
                <Input
                  type="text"
                  className="required-fields"
                  placeholder=" "
                  lable={t("Username")}
                  id="Username"
                  name="username"
                  max={75}
                  value={values.username || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="col-sm-2">
                <Input
                  type="password"
                  className="required-fields"
                  placeholder=" "
                  lable={t("Password")}
                  id="password"
                  name="password"
                  max={75}
                  value={values.password || ""}
                  onChange={handleChange}
                />
              </div>
            </>
          )}

          <div className="col-sm-auto d-flex align-items-center mb-2" style={{ gap: "8px" }}>
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                text={state?.url1 ? t("Update") : t("Save")}
                icon={state?.url1 ? t("edit") : t("save")}
                onClick={handleSubmit}
              />
            )}
            <Link to="/DoctorReferal">
              <CustomButton text={t("Back to List")} icon="back" />
            </Link>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default CreateDoctorMaster;