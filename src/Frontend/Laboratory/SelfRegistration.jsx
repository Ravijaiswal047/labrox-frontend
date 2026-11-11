import React, { useState, useEffect } from "react";
import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { CustomButton, SaveButton, CancelButton } from "../../components/UI/CustomButton";
import { axiosInstance } from "../../utils/axiosInstance";
import { notify } from "../../utils/utils";
import { useTranslation } from "react-i18next";
import { getSearchController } from "../../utils/NetworkApi/commonApi";
import { loadCaptchaEnginge, LoadCanvasTemplate, validateCaptcha } from "react-simple-captcha";
import "./PatientRegistration.css";

const PAGE_ID = 1076;

const getGlobal = async (type) => {
  const res = await axiosInstance.post("Global/getGlobalData", { Type: type });
  return res?.data?.message?.map((e) => ({ label: e.FieldDisplay, value: e.FieldDisplay })) || [];
};

const defaultTitles  = [{ label: "Mr.", value: "Mr." }, { label: "Mrs.", value: "Mrs." }, { label: "Ms.", value: "Ms." }, { label: "Dr.", value: "Dr." }];
const defaultGenders = [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }];

const initialForm = {
  Title: "Mr.", FirstName: "", MiddleName: "", LastName: "",
  Gender: "Male", AgeYear: "", AgeMonth: "", AgeDays: "", DOB: "",
  Email: "", HouseNo: "", City: "", State: "", PinCode: "",
  MaritalStatus: "", DistrictName: "", CountryName: "India", Religion: "",
  EmergencyContact: "", RelationOf: "", RelationName: "", RelationMobileNo: "",
};

const SelfRegistration = () => {
  const { t } = useTranslation();

  const [stage, setStage]       = useState("search");
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(0);
  const [mobile, setMobile]     = useState("");
  const [otp, setOtp]           = useState("");
  const [existingPatients, setExistingPatients] = useState([]);
  const [titles, setTitles]     = useState(defaultTitles);
  const [genders, setGenders]   = useState(defaultGenders);
  const [maritalOptions, setMaritalOptions] = useState([]);
  const [religionOptions, setReligionOptions] = useState([]);
  const [form, setForm]         = useState(initialForm);
  
  const [controllerDynamicList, setControllerDynamicList] = useState([]);
  const [tabbingOrder, setTabbingOrder] = useState([]);
  const [moreErrors, setMoreErrors] = useState({});
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    fetchDynamics();
  }, []);

  const fetchDynamics = async () => {
    try {
      const { controllersData, controllerTabbingOrder } = await getSearchController(PAGE_ID);
      console.log("Dynamics for Page 1076:", controllersData);
      setControllerDynamicList(controllersData);
      setTabbingOrder(controllerTabbingOrder);
    } catch (err) {
      console.error("Error fetching dynamics:", err);
    }
  };

  const getTabIndex = (id) => {
    const field = tabbingOrder?.find((item) => item.ControlDisplayID === id);
    return field ? field.TabOrder : -1;
  };

  const showAlways = (controlId) => {
    const showAlwaysList = ["mobile", "otp"]; // stages handled outside mapping
    return showAlwaysList.includes(controlId);
  };

  const isHideController = (cntrId = "") => {
    if (showAlways(cntrId)) return true;
    if (!controllerDynamicList?.length) return true;
    const isPresent = controllerDynamicList?.find(
      (x) => x?.ControlDisplayID === cntrId
    );
    if (isPresent) {
      return isPresent?.IsShow === 1;
    }
    return true;
  };

  const getFieldClassName = (controlId, value) => {
    const field = controllerDynamicList?.find(x => x.ControlDisplayID === controlId);
    const isMandatoryField = field?.IsMandatory === 1;
    const hasError = moreErrors?.[controlId];
    let className = "required-fields";
    if (hasError) className += " error border-danger";
    if (isMandatoryField && (!value || (typeof value === "string" && !value.trim()))) {
      className += " mandatory_field";
    }
    return className;
  };

  useEffect(() => {
    if (timer <= 0) return;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  useEffect(() => {
    if (stage !== "form") return;
    getGlobal("Title").then((d) => { const f = d.filter((x) => x.value); if (f.length) setTitles(f); });
    getGlobal("Gender").then((d) => { const f = d.filter((x) => x.value && x.value !== "Both"); if (f.length) setGenders(f); });
    getGlobal("MaritalStatus").then((d) => setMaritalOptions(d));
    getGlobal("Religion").then((d) => setReligionOptions(d));
    loadCaptchaEnginge(6);
  }, [stage]);

  const fc = (e) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };

    if (name === "DOB") {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate <= today) {
        let years = today.getFullYear() - birthDate.getFullYear();
        let months = today.getMonth() - birthDate.getMonth();
        let days = today.getDate() - birthDate.getDate();
        if (days < 0) {
          months--;
          days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
        }
        if (months < 0) {
          years--;
          months += 12;
        }
        newForm.AgeYear = years;
        newForm.AgeMonth = months;
        newForm.AgeDays = days;
      }
    }

    if (["AgeYear", "AgeMonth", "AgeDays"].includes(name)) {
      const today = new Date();
      const years = parseInt(newForm.AgeYear) || 0;
      const months = parseInt(newForm.AgeMonth) || 0;
      const days = parseInt(newForm.AgeDays) || 0;
      const dob = new Date(today.getFullYear() - years, today.getMonth() - months, today.getDate() - days);
      newForm.DOB = dob.toISOString().split("T")[0];
    }

    setForm(newForm);
  };
  const selectChange = (name) => (e) => setForm((p) => ({ ...p, [name]: e.target.value }));

  const handleSearch = async () => {
    if (mobile.length !== 10) { notify("Enter a valid 10-digit mobile number", "error"); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`PreRegistration/GetPreRegistrationByMobile?mobileNo=${mobile}`);
      const patients = res?.data?.data || []; // Fixed: Using .data instead of .message
      if (patients.length > 0) {
        setExistingPatients(patients);
        setStage("select");
      } else {
        setStage("form");
      }
    } catch (err) { 
      setStage("form");
    } finally { setLoading(false); }
  };

  const sendOtp = async () => {
    setLoading(true);
    try {
      await axiosInstance.post("CommonController/PaymentSendOTP", { mobileNo: mobile, type: "SmsPaymentApi" });
      notify("OTP sent successfully", "success");
      setStage("otp");
      setTimer(30);
    } catch (err) { notify("Failed to send OTP", "error"); } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { notify("Enter a valid 6-digit OTP", "error"); return; }
    setLoading(true);
    try {
      await axiosInstance.post("CommonController/PaymentverifyOTP", { mobileNo: mobile, otp, pageName: "PaymentOTP" });
      notify("OTP verified", "success");
      setStage("form");
    } catch (err) { notify("Invalid OTP", "error"); } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    const errors = {};
    controllerDynamicList.forEach((item) => {
      if (item.IsMandatory === 1 && item.IsShow === 1) {
        const val = form[item.ControlDisplayID];
        if (!val && item.ControlDisplayID !== "Mobile") { // Mobile is handled separately
          errors[item.ControlDisplayID] = true;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setMoreErrors(errors);
      notify("Please fill all mandatory fields", "error");
      return;
    }

    if (!validateCaptcha(captchaInput)) {
      notify("Invalid Captcha. Please try again.", "error");
      setCaptchaInput("");
      loadCaptchaEnginge(6);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        requestId: "",
        mobileNo: mobile,
        title: form.Title,
        firstName: form.FirstName.trim(),
        lastName: form.LastName.trim(),
        dob: form.DOB || "",
        gender: form.Gender,
        emailId: form.Email,
        emergency: form.EmergencyContact,
        address: form.HouseNo,
        patientId: 0,
        relationOfId: 0,
        relationOfName: form.RelationOf,
        relationName: form.RelationName,
        entryBy: "Self",
        maritalStatus: form.MaritalStatus,
        relationPhone: form.RelationMobileNo,
        cityName: form.City,
        cityId: 0,
        districtId: 0,
        districtName: form.DistrictName,
        countryId: 0,
        countryName: form.CountryName,
        stateId: 0,
        pinCode: Number(form.PinCode) || 0,
        isSame: true,
        stateName: form.State,
        religion: form.Religion,
        permanentAddress: form.HouseNo
      };

      const res = await axiosInstance.post("PreRegistration/CreatePreRegistration", payload);
      if (res?.data?.success) {
        notify("Registration successful!", "success");
        setStage("done");
      } else {
        notify(res?.data?.message || "Registration failed", "error");
      }
    } catch (err) {
      notify("Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setStage("search"); setMobile(""); setOtp(""); setForm(initialForm); setExistingPatients([]); setMoreErrors({}); setCaptchaInput(""); };

  return (
    <div className="self-reg-container" style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <style>{`
        .reg-card { background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); overflow: hidden; margin-bottom: 20px; width: 100%; max-width: 1000px; height: fit-content; }
        .reg-header { background: white; padding: 20px; border-bottom: 1px solid #eee; display: flex; align-items: center; justify-content: center; gap: 10px; }
        .reg-header h3 { margin: 0; color: #2c3e50; font-size: 22px; font-weight: 600; }
        .section-title { font-size: 16px; font-weight: 600; color: #3498db; margin: 10px 0 5px 0; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; }
        .search-card { width: 100%; max-width: 650px; padding: 25px 35px; background: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin: 30px 0; }
        .form-section { padding: 0 25px 25px 25px; }
        
        /* Custom Search Elements to avoid project style interference */
        .custom-search-row { display: flex; gap: 12px; align-items: center; width: 100%; }
        .custom-input-box { width: 55% !important; flex: 0 0 55% !important; height: 40px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0 15px; font-size: 16px; color: #475569; outline: none; transition: border-color 0.2s; }
        .custom-input-box:focus { border-color: #3b82f6; }
        .custom-proceed-btn { width: 45% !important; flex: 0 0 45% !important; height: 40px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background 0.2s; white-space: nowrap; overflow: hidden; line-height: 1; }
        .custom-proceed-btn i { display: flex; align-items: center; height: 100%; margin-top: 2px; }
        .custom-proceed-btn:hover { background: #1d4ed8; }
        .custom-proceed-btn:disabled { background: #94a3b8; cursor: not-allowed; }
        .otp-input-container { width: 100%; margin-top: 20px; }

        @media (max-width: 600px) {
          .custom-search-row { flex-direction: column; gap: 10px; }
          .custom-input-box { width: 100% !important; height: 37px !important; flex: none !important; }
          .custom-proceed-btn { width: 100% !important; height: 37px !important; flex: none !important; justify-content: center !important; }
          .search-card { padding: 15px 20px; margin: 15px 0; max-width: 95%; }
        }
      `}</style>

      {/* Search Card always visible at top */}
      <div className="search-card">
        <div className="custom-search-row">
          <input 
            type="text"
            className="custom-input-box"
            placeholder={t("REGISTER MOBILE NO")}
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            disabled={stage !== "search"}
            onKeyDown={(e) => e.key === "Enter" && stage === "search" && handleSearch()}
          />
          
          {(stage === "search" || stage === "select" || stage === "form" || stage === "done") && (
            <button 
              className="custom-proceed-btn"
              onClick={stage === "search" ? handleSearch : handleReset}
              disabled={loading || (stage === "search" && mobile.length !== 10)}
            >
              {stage === "search" ? (
                <><i className="bi bi-person-fill mt-3"></i> {t("Proceed")}</>
              ) : (
                <><i className="bi bi-pencil-square mt-3"></i> {t("Change")}</>
              )}
            </button>
          )}
        </div>

        {stage === "otp" && (
          <div className="otp-flow-container mt-3">
            <input 
              type="text"
              className="custom-input-box w-100 mb-3"
              placeholder={t("ENTER OTP")}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
            />
            <button 
              className="custom-proceed-btn w-100"
              onClick={verifyOtp}
              disabled={loading || otp.length !== 6}
            >
              <i className="bi bi-check-lg"></i> {t("Verify")}
            </button>
          </div>
        )}
      </div>

      {stage === "select" && (
        <div className="reg-card container" style={{ maxWidth: "850px", padding: "30px" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="m-0">Registered patients for <b>{mobile}</b></h4>
            <CustomButton text="+ Register New" onClick={() => setStage("form")} className="px-4 py-2 proceed-btn" />
          </div>
          
          <div className="table-responsive" style={{ background: "#fcfcfc", borderRadius: "10px", border: "1px solid #eee" }}>
            <table className="table table-hover mb-0">
              <thead style={{ background: "#f4f7f6" }}>
                <tr>
                  <th className="p-3">S.No</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Mobile No</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {existingPatients.map((p, idx) => (
                  <tr key={idx} style={{ cursor: "pointer" }} onClick={() => { 
                    setForm(prev => ({ 
                      ...prev, 
                      FirstName: p.firstName || p.FirstName || "", 
                      LastName: p.lastName || p.LastName || "",
                      Gender: p.gender || p.Gender || "Male",
                      Title: p.title || p.Title || "Mr.",
                      DOB: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
                      Email: p.emailId || p.Email || ""
                    }));
                    setStage("form"); 
                  }}>
                    <td className="p-3">{idx + 1}</td>
                    <td className="p-3"><b>{p.firstName || p.FirstName} {p.lastName || p.LastName}</b></td>
                    <td className="p-3">{p.mobileNo || p.Mobile || mobile}</td>
                    <td className="p-3">{p.gender || p.Gender}</td>
                    <td className="p-3 text-center">
                      <button className="btn btn-sm btn-outline-primary rounded-pill px-3">Select</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(stage === "form" || stage === "done") && (
        <div className="reg-card container" style={{ maxWidth: "1000px" }}>
          {stage === "form" ? (
            <>
              <div className="reg-header">
                <i className="bi bi-person-lines-fill text-primary mt-3" style={{ fontSize: "24px" }}></i>
                <h3>Registration Form</h3>
              </div>

              <div className="form-section">
                <div className="section-title">
                  <i className="bi bi-person mt-3"></i> Personal Information
                </div>
                <div className="row">
                  {["Title", "FirstName", "MiddleName", "LastName", "DOB", "AgeYear", "AgeMonth", "AgeDays", "Gender", "State", "City", "HouseNo"]
                    .map((id) => {
                      const item = controllerDynamicList?.find(x => x.ControlDisplayID === id) || { ControlDisplayID: id, IsShow: 1, IsMandatory: 0, ControlDisplayName: id };
                      if (!isHideController(id)) return null;
                      
                      let col = "col-sm-4";
                      if (id === "Title") col = "col-sm-2";
                      if (id === "FirstName" || id === "MiddleName") col = "col-sm-3";
                      if (id === "LastName") col = "col-sm-4";
                      if (["AgeYear", "AgeMonth", "AgeDays"].includes(id)) col = "col-sm-2";
                      if (id === "DOB" || id === "Gender") col = "col-sm-3";
                      if (id === "HouseNo") col = "col-sm-4";

                      if (["Title", "Gender", "MaritalStatus", "Religion"].includes(id)) return (
                        <div className={`${col} col-12 mb-3`} key={id}>
                          <SelectBox 
                            id={id}
                            lable={t(item.ControlDisplayName || id)} 
                            options={id === "Gender" ? genders : id === "Title" ? titles : id === "MaritalStatus" ? maritalOptions : religionOptions} 
                            selectedValue={form[id]} 
                            onChange={selectChange(id)} 
                            className={getFieldClassName(id, form[id])} 
                          />
                        </div>
                      );

                      return (
                        <div className={`${col} col-12 mb-3`} key={id}>
                          <Input 
                            id={id}
                            name={id} 
                            type={id === "DOB" ? "date" : "text"} 
                            lable={t(id === "HouseNo" ? "ADDRESS" : item.ControlDisplayName || id)} 
                            value={form[id]} 
                            onChange={fc} 
                            className={getFieldClassName(id, form[id])} 
                          />
                        </div>
                      );
                  })}
                </div>

                <div className="section-title">
                  <i className="bi bi-telephone mt-3"></i> Contact Information
                </div>
                <div className="row">
                  <div className="col-sm-6 mb-3">
                    <Input id="Email" name="Email" lable={t("EMAIL")} value={form.Email} onChange={fc} className={getFieldClassName("Email", form.Email)} />
                  </div>
                  <div className="col-sm-6 mb-3">
                    <Input id="Mobile" name="Mobile" lable={t("MOBILE NO")} value={mobile} disabled={true} className={getFieldClassName("Mobile", mobile)} />
                  </div>
                </div>

                <div className="row justify-content-center mt-3">
                  <div className="col-sm-6">
                    <div className="captcha-wrapper p-3 rounded shadow-sm border bg-light d-flex flex-column align-items-center gap-2">
                      <div className="d-flex align-items-center gap-3 bg-white p-2 rounded border w-100 justify-content-center position-relative">
                        <LoadCanvasTemplate />
                        <button 
                          type="button"
                          className="btn btn-sm btn-link text-primary p-0 position-absolute" 
                          style={{ right: '10px' }}
                          onClick={() => {
                            loadCaptchaEnginge(6);
                            setCaptchaInput("");
                          }}
                          title="Refresh Captcha"
                        >
                          <i className="bi bi-arrow-clockwise fs-5"></i>
                        </button>
                      </div>
                      <input 
                        type="text"
                        className="form-control text-center fw-bold"
                        placeholder={t("Enter Captcha Above")}
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value)}
                        style={{ letterSpacing: '2px', fontSize: '18px', height: '45px' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 d-flex justify-content-center gap-3">
                  <SaveButton text="Submit Registration" onClick={handleSubmit} className=" py-3" disabled={loading} />
                  <CancelButton text="Reset Form" onClick={handleReset} className=" py-3 ml-2" />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "64px" }}></i>
              </div>
              <h2 className="text-success mb-3">Registration Successful!</h2>
              <p className="text-muted mb-4">Your details have been pre-registered. Please show your mobile number at the counter.</p>
              <CustomButton text="Register Another" onClick={handleReset} className="proceed-btn px-5 mx-auto" />
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "20px", padding: "10px", color: "#94a3b8", fontSize: "13px", textAlign: "center", width: "100%", borderTop: "1px solid #e2e8f0" }}>
        Powered by <span style={{ fontWeight: "600", color: "#475569" }}>LabRox Technologies</span>
      </div>
    </div>
  );
};

export default SelfRegistration;
