import React, { useState, useMemo, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { Form } from "react-bootstrap";
import "./DisptachBulkEmailModal.css";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Heading from "../../components/UI/Heading";
import CustomTable from "../../components/Table/CustomTable";
import { apiUrls } from "../../utils/apiUrls";
import FilterInput from "../../components/Filter/FilterInput";
import { number } from "../../utils/helpers";

function DispatchBulkEmailModal({ data, onHide, componentName = "" }) {
  const propsData = data?.data;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const {
    AllowLabReport_Manual_W,
    AllowReceipt_Manual_W,
    AllowLabReport_Manual_SMS,
    AllowReceipt_Manual_SMS,
    AllowLabReport_Manual_E,
    AllowReceipt_Manual_E,
  } = useLocalStorage("userData", "get");

  const [bulkSendType, setBulksendType] = useState("email");
  const [errors, setErrors] = useState({
    emailId: false,
    cc: false,
    bcc: false,
  });
  const allowedDocumentType = {
    email: [
      {
        label: "Lab Report",
        value: "LabReport",
        allow: AllowLabReport_Manual_E,
      },
      {
        label: "Receipt",
        value: "PatientReceipt",
        allow: AllowReceipt_Manual_E,
      },
    ],
    whatsApp: [
      {
        label: "Lab Report",
        value: "LabReport",
        allow: AllowLabReport_Manual_W,
      },
      {
        label: "Receipt",
        value: "PatientReceipt",
        allow: AllowReceipt_Manual_W,
      },
    ],
    sms: [
      {
        label: "Lab Report",
        value: "LabReport",
        allow: AllowLabReport_Manual_SMS,
      },
      {
        label: "Receipt",
        value: "PatientReceipt",
        allow: AllowReceipt_Manual_SMS,
      },
    ],
  };

  const finalDocumentType = allowedDocumentType?.[bulkSendType]?.filter(
    (item) => item?.allow == 1,
  );

  const [emailData, setEmailData] = useState({
    emailId: "",
    cc: "",
    bcc: "",
    mobile: "",
    smsMobile: "",
  });
  const [filterText, setFilterText] = useState("");
  const [tableLogData, setTableLogData] = useState([]);
  const [masterTableLogData, setMasterTableLogData] = useState([]);
  const [formData, setFormData] = useState({
    toWhome: "Patient",
    documentType: finalDocumentType?.[0]?.value,
  });

  // Patient, Doctor, or RateType.

  const toWhomeList = [
    { label: "Patient", value: "Patient" },
    { label: "Doctor", value: "Doctor" },
    { label: "Rate Type", value: "RateType" },
    { label: "Second Referal Doctor", value: "Second Referal Doctor" },
  ];

  const [load, setLoad] = useState(false);
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const [payloadData, setPayloadData] = useState({
    mobile: "",
    email: "",
    allData: [],
  });

  const handleChangeSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setFilterText(e.target.value);

    if (!value) {
      setTableLogData(masterTableLogData);
      return;
    }

    const searchableKeys = [
      "toWhome",
    ];

    const filtered = masterTableLogData?.filter((row) =>
      searchableKeys.some((key) =>
        String(row[key] || "")
          .toLowerCase()
          .includes(value),
      ),
    );

    setTableLogData(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const formattedValue =
    name === "mobile" ? value.replace(/\D/g, "") : value;
    setEmailData((prev) => ({ ...prev, [name]: formattedValue }));
    setErrors((prev) => ({ ...prev, [name]: !validateEmail(value) }));
  };

  const validateEmail = (email) => emailRegex.test(email) || email === "";

  const handleSearchSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value?.value }));
  };

  const hasApprovedTest = useMemo(() => {
    if (
      propsData?.IsApproved == 1 ||
      propsData?.Approved == 1 ||
      propsData?.isApprove == 1 ||
      propsData?.IsApprove == 1 ||
      propsData?.Status == 5 ||
      propsData?.Status == 6
    ) {
      return true;
    }

    if (
      propsData?._pli?.IsApproved == 1 ||
      propsData?._pli?.Approved == 1 ||
      propsData?._pli?.isApprove == 1 ||
      propsData?._pli?.IsApprove == 1 ||
      propsData?._pli?.Status == 5 ||
      propsData?._pli?.Status == 6
    ) {
      return true;
    }

    let pliList = [];
    if (Array.isArray(propsData?.PliDataList)) {
      pliList = propsData.PliDataList;
    } else if (typeof propsData?.PliDataList === "string" && propsData.PliDataList.trim()) {
      try {
        pliList = JSON.parse(propsData.PliDataList);
      } catch {
        pliList = [];
      }
    }

    if (Array.isArray(pliList) && pliList.length > 0) {
      return pliList.some(
        (item) =>
          item?.IsApproved == 1 ||
          item?.Approved == 1 ||
          item?.approved == 1 ||
          item?.isApprove == 1 ||
          item?.IsApprove == 1 ||
          item?.Status == 5 ||
          item?.Status == 6
      );
    }

    return false;
  }, [propsData]);

  const validateBulkSend = (bulkSendType, emailData) => {
  if (formData?.documentType === "LabReport" && !hasApprovedTest) {
    toast.error(t("Cannot send unapproved report. Test result is not approved yet."));
    return false;
  }
  if (bulkSendType === "email") {
    if (!emailData?.emailId || emailData.emailId.trim() === "") {
      // Email ID is empty
      toast.error("Email ID is required for email send");
      console.warn("Email ID is required for email send");
      return false; // validation failed
    }
  } else if (bulkSendType === "whatsApp" || bulkSendType === "sms") {
    if (!emailData?.mobile || emailData.mobile.trim() === "") {
      // Mobile number is empty
      toast.error("Mobile number is required for WhatsApp/SMS send");
      console.warn("Mobile number is required for WhatsApp/SMS send");
      return false; // validation failed
    }
  }
  return true; // validation passed
};

  const handleReset = () => {

    setFormData({
      toWhome: "Patient",
      documentType: finalDocumentType?.[0]?.value,
    })

    setEmailData({
      emailId: "",
      cc: "",
      bcc: "",
      mobile: "",
      smsMobile: "",
    })
    setBulksendType("email");
  }

// Usage example


  const handleSendEmail = () => {
    if (formData?.documentType === "LabReport" && !hasApprovedTest) {
      toast.error(t("Cannot send unapproved report. Test result is not approved yet."));
      return;
    }

    if (!validateBulkSend(bulkSendType, emailData)) {    
      return; // stop execution if validation fails
    }
   
    const emailErrors = {
      serviceType: bulkSendType,
      transactionType: formData?.documentType,
      messageTo: formData?.toWhome,
      ledgertransactionIDHash: propsData?.LedgertransactionIDHash,
      toEmail: !validateEmail(emailData.emailId),
      ccEmail: !validateEmail(emailData.cc),
      bccEmail: !validateEmail(emailData.bcc),
    };

    if ((!emailData?.mobile && bulkSendType == "SMS") || bulkSendType == "")
      setErrors(emailErrors);

    if (Object.values(emailErrors).includes(true)) return;

    setLoad(true);
    axiosInstance
      .post(apiUrls?.InsertDataSMSWhatsappEMail, {
        serviceType: bulkSendType,
        transactionType: formData?.documentType,
        messageTo: formData?.toWhome,
        ledgertransactionIDHash: propsData?.LedgertransactionIDHash,
        mobileNo: emailData?.mobile,
        toEmail: emailData?.emailId,
        ccEmail: emailData?.cc,
        bccEmail: emailData?.bcc,
      })
      .then((res) => {
        setLoad(false);
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleReset();
          getQueueList(propsData?.LedgertransactionIDHash);
        } else {
          toast.error(res?.data?.message || t("Failed to send"));
        }
      })
      .catch((err) => {
        setLoad(false);
        toast.error(err?.response?.data?.message || t("Error occurred"));
      });
  };

  // Table setup
  const logColumns = [
    { header: "S.No", field: "SrNo", width: "5%" },
    { header: "Service Type", field: "ServiceType", width: "15%" },
    { header: "To Whome", field: "toWhome", width: "15%" },
    { header: "Document Type", field: "TransactionType", width: "15%" },
    { header: "Request Date", field: "DtEntry", width: "15%" },
    { header: "Request By", field: "CreatedByName", width: "15%" },
    { header: "Sent Date", field: "DtSent", width: "15%" },
    { header: "Mobile/Email", field: "mobOrEmail", width: "20%" },
    // { header: "Status", field: "status", width: "10%" },
  ];

  // Assign row colors dynamically
  const getRowColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sent":
        return "#d4edda"; // light green
      case "failure":
        return "#f8d7da"; // light red
      case "requested":
        return "#fff3cd"; // light yellow
      default:
        return "white";
    }
  };

  // const logDataWithColor = [...tableLogData]?.map((item) => ({
  //   ...item,
  //   rowColor: getRowColor(item.status),
  // }));

  // Filtering logic
  // const filteredData = useMemo(() => {
  //   if (!filterText.trim()) return logDataWithColor;
  //   const search = filterText.toLowerCase();
  //   return logDataWithColor.filter((row) =>
  //     Object.values(row).some((val) =>
  //       String(val).toLowerCase().includes(search),
  //     ),
  //   );
  // }, [filterText, logDataWithColor]);

  const getQueueList = async (idHash) => {
    await axiosInstance
      .get(
        `${apiUrls?.GetSMSWhatsappEmailQueueList}?ledgerTransactionIDHash=${idHash}`,
      )
      .then((res) => {
        console.log("Queue data", res?.data?.data?.data);
        let data = res?.data?.data?.data?.map((tData, idx) => ({
              SrNo: idx + 1,
              ...tData,
              toWhome: tData?.MessageTo || "-",
              DtSent: tData?.DtEntry || "-",
              mobOrEmail: tData?.MobileNo || tData?.ToEmail,
            }))
        setTableLogData(data);
        setMasterTableLogData(data);
      })
      .catch((err) => console.log(err))
      .finally(() => console.log("---"));
  };
  const getEMailWhatsAppCredentials = async (idHash) => {
    await axiosInstance
      .get(
        `${apiUrls?.GetSMSWhatsappEmailCredentials}?ledgerTransactionIDHash=${idHash}`,
      )
      .then((res) => {
        console.log(res);
        setPayloadData((prev) => ({ ...prev, allData: res?.data?.data?.data }));
      })
      .catch((err) => console.log(err))
      .finally(() => console.log("---"));
  };

  useEffect(() => {
    if (propsData?.LedgertransactionIDHash) {
      getQueueList(propsData?.LedgertransactionIDHash);
      getEMailWhatsAppCredentials(propsData?.LedgertransactionIDHash);
    }
  }, [propsData?.LedgertransactionIDHash]);

  useEffect(() => {
    if (!payloadData?.allData?.length) return;

    const contact = payloadData.allData[0];
    const { toWhome } = formData;

    if (bulkSendType === "email") {
      if (toWhome === "Patient") {
        // Patient
        setEmailData((prev) => ({
          ...prev,
          emailId: contact?.PatientEmail || "",
          cc: contact?.RateType_CCEmail || "",
          bcc: "",
        }));
      } else if (toWhome === "Doctor") {
        // Doctor
        setEmailData((prev) => ({
          ...prev,
          emailId: contact?.DoctorEmail || "",
          cc: contact?.RateType_CCEmail || "",
          bcc: "",
        }));
      } else if (toWhome === "RateType") {
        // Rate Type
        setEmailData((prev) => ({
          ...prev,
          emailId: contact?.RateType_ToEmail || "",
          cc: contact?.RateType_CCEmail || "",
          bcc: "",
        }));
      }
    }

    if (bulkSendType === "whatsApp") {
      if (toWhome === "Patient") {
        setEmailData((prev) => ({
          ...prev,
          mobile: contact?.PatientMobile || "",
        }));
      } else if (toWhome === "Doctor") {
        setEmailData((prev) => ({
          ...prev,
          mobile: contact?.DoctorMobile || "",
        }));
      } else if (toWhome === "RateType") {
        setEmailData((prev) => ({
          ...prev,
          mobile: contact?.RateTypeMobile_W || "",
        }));
      }
    }

    if (bulkSendType === "sms") {
      if (toWhome === "Patient") {
        setEmailData((prev) => ({
          ...prev,
          mobile: contact?.PatientMobile || "",
        }));
      } else if (toWhome === "Doctor") {
        setEmailData((prev) => ({
          ...prev,
          mobile: contact?.DoctorMobile || "",
        }));
      } else if (toWhome === "RateType") {
        setEmailData((prev) => ({
          ...prev,
          mobile: contact?.RateTypeMobile_SMS || "",
        }));
      }
    }
  }, [bulkSendType, formData?.toWhome, payloadData?.allData]);

  useEffect(() => {
    if (finalDocumentType?.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documentType: finalDocumentType[0]?.value,
      }));
    }
  }, [bulkSendType]);
  console.log("modal data",data);
  console.log("bulkSendType",bulkSendType);
  console.log("allowedDocumentType",allowedDocumentType);
  console.log("finalDocumentType",finalDocumentType);
  console.log("formData",formData);

  return (
    <Dialog
      header={
        <span className="text-capitalize">
          PatientName: &nbsp;{propsData?.FirstName || propsData?.PatientName}, &nbsp; VisitNo: {propsData?.LedgerTransactionNo || propsData?.VisitNo}
        </span>
      }
      onHide={onHide}
      top={"100px"}
      visible={data?.modal}
      className={theme}
      style={{ width: isMobile ? "80vw" : "60vw" }}
    >
      <div className="px-2">
        {!hasApprovedTest && formData?.documentType === "LabReport" && (
          <div
            className="alert alert-warning py-2 px-3 mb-2 text-danger d-flex align-items-center"
            role="alert"
            style={{ fontSize: "13px" }}
          >
            <i className="fa fa-exclamation-triangle mr-2"></i>
            <span>
              {t(
                "Notice: Result is tested but not approved. Unapproved report cannot be dispatched."
              )}
            </span>
          </div>
        )}
        {/* Service Type */}
        <div
          style={{ gap: "6px" }}
          className="radio_check d-flex align-items-center justify-content-start w-100 mt-1 mb-3"
        >
          <p className="mb-0 fw-bold" style={{color : "black"}}>Service Type :</p>
          {["email", "whatsApp", "sms"].map((type) => (
            <Form.Check
              key={type}
              type="radio"
              id={type}
              label={type.charAt(0).toUpperCase() + type.slice(1)}
              name="disBulkEmail"
              checked={bulkSendType === type}
              onChange={() => setBulksendType(type)}
              className="d-flex align-items-center cursor-pointer"
            />
          ))}
        </div>

        {/* Select Fields */}
        <div className="row">
          <div className="col-sm-4 col-8">
            <ReactSelect
              dynamicOptions={toWhomeList}
              name="toWhome"
              lable={t("To Whome")}
              id="toWhome"
              removeIsClearable={true}
              placeholderName={t("To Whome")}
              value={formData?.toWhome}
              isShowBorder={true}
              onChange={handleSearchSelectChange}
            />
          </div>
          {finalDocumentType?.length > 0 && (
            <div className="col-sm-4 col-8">
              <ReactSelect
                dynamicOptions={finalDocumentType}
                name="documentType"
                id="documentType"
                isShowBorder={true}
                removeIsClearable={true}
                lable={t("DocumentType")}
                placeholderName={t("DocumentType")}
                value={formData?.documentType}
                onChange={handleSearchSelectChange}
              />
            </div>
           )} 
        </div>

        <hr className="my-2" />

        {/* Email / WhatsApp / SMS Fields */}
        {bulkSendType === "email" && (
          <div>
            {["emailId", "cc", "bcc"].map((field) => (
              <div className="row" key={field}>
                <label className="col-sm-2 text-capitalize">{t(field)} :</label>
                <div className="col-sm-9 col-md-6 col-12">
                  <Input
                    placeholder={field.toUpperCase()}
                    name={field}
                    value={emailData[field]}
                    type="email"
                    onChange={handleInputChange}
                  />
                  {errors[field] && emailData[field] && (
                    <span className="error-message">
                      {t(`Enter a valid ${field.toUpperCase()}`)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {["sms", "whatsApp"].includes(bulkSendType) && (
          <div className="row">
            <label className="col-sm-2">{t("Mobile No.")} :</label>
            <div className="col-sm-9 col-md-6 col-12">
              <Input
                placeholder="Enter Mobile No."
                name="mobile"
                value={emailData.mobile}
                type="text"
                onChange={handleInputChange}
                onInput={(e) => number(e, 10)}
              />
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="box-footer mt-2">
          <div className="row">
            <div className="col-sm-3">
              {load ? (
                <Loading />
              ) : (
                <button
                  className={`btn btn-block btn-success btn-sm text-capitalize rounded ${
                    !hasApprovedTest && formData?.documentType === "LabReport"
                      ? "opacity-75"
                      : ""
                  }`}
                  onClick={handleSendEmail}
                  title={
                    !hasApprovedTest && formData?.documentType === "LabReport"
                      ? t("Cannot send unapproved report")
                      : ""
                  }
                >
                  {t(`Send ${bulkSendType}`)}
                </button>
              )}
            </div>

            <div className="col-sm-2">
              <button
                className="btn btn-block btn-danger btn-sm rounded"
                onClick={onHide}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="mt-3">
        <Heading
          title={"Log"}
          secondTitle={
            // <Input
            //   placeholder="Filter logs..."
            //   value={filterText}
            //   onChange={(e) => setFilterText(e.target.value)}
            // />
            <FilterInput
                value={filterText}
                onChange={handleChangeSearch}
                placeholder="Filter Table"
                inputClass="transparent-background"
            />
          }
        />
        <div
          style={{ maxHeight: "200px", overflowY: "auto" }}
          className="dataoverFlow"
        >
          <CustomTable
            columns={logColumns}
            data={tableLogData}
          />
        </div>
      </div>
    </Dialog>
  );
}

export default DispatchBulkEmailModal;
