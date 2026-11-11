import React, { useEffect, useState } from "react";
import { t } from "i18next";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import CustomTable from "../../../components/Table/CustomTable";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";

const IssueModal = ({ rowData, handleChangeModel, handleToggle }) => {
  const { t } = useTranslation();
  const [formData, setformData] = useState({
    slotNumber: "",
    IssueTo: "",
    issueByName: "",
    dtIssue: "",
    status: 0,
    rowColor: "",
    uniID: 0,
    ledgerTransactionNo: "",
    SinNo: "",
    pName: "",
    pInfo: "",
    patientID: "",
    bookingCentre: "",
    storageCentre: "",
    sampleTypeName: "",
    DeviceName: "",
    RackNumber: "",
    TrayCode: "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;

    setformData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setformData((prev) => ({ ...prev, [name]: value?.value }));
  };
 
  const handleSave = async () => {
    const reqBody = {
      barcodeNo: String(formData?.SinNo||""),
      uniID: formData?.uniID || 0,
      issueTo: String(formData?.IssueTo||""),
      issuePurpose: String(formData?.IssueReason||""),
      invoiceNo: String(formData?.InvoiceNo||""),
      centreID: 0,
      roleID: 0,
      ipAddress: "",
    };

    try {
      const res = await axiosInstance.post("SampleStorage/saveIssue", reqBody);
      const { message, data, success } = res?.data || {};

      if (success) {
        // Clean and normalize rows before setting
        toast.success(message)
        handleToggle()
      } 
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong!");
    }
  };
  
  useEffect(() => {
    if (rowData) {
      setformData({
        slotNumber: rowData?.SlotNumber || "",
        issueTo: rowData?.IssueTo || "",
        issueByName: rowData?.IssueByName || "",
        dtIssue: rowData?.dtIssue || "",
        status: rowData?.STATUS ?? 0,
        rowColor: rowData?.RowColor || "",
        uniID: rowData?.UniID || 0,
        ledgerTransactionNo: rowData?.LedgerTransactionNo || "",
        SinNo: rowData?.SinNo || "",
        pName: rowData?.PName || "",
        pInfo: rowData?.PInfo || "",
        patientID: rowData?.PatientID || "",
        bookingCentre: rowData?.BookingCentre || "",
        storageCentre: rowData?.StorageCentre || "",
        sampleTypeName: rowData?.SampleTypeName || "",
        DeviceName: rowData?.DeviceName || "",
        RackNumber: rowData?.RackNumber || "",
        TrayCode: rowData?.TrayCode || "",
      });
    }
  }, [rowData]);

  console.log("formData", formData);
  return (
    <>
      <div className="card">
        <div className="row p-2 d-flex align-items-center">
          <Input
            type="text"
            placeholder=" "
            lable={t("Sample Type")}
            id="SampleTypeName"
            name="SampleTypeName"
            value={formData?.sampleTypeName || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
            disabled={true}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("SIN No")}
            id="SinNo"
            name="SinNo"
            value={formData?.SinNo || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
            disabled={true}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Device")}
            id="DeviceName"
            name="DeviceName"
            value={formData?.DeviceName || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
            disabled={true}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Rack Number")}
            id="RackNumber"
            name="RackNumber"
            value={formData?.RackNumber || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
            disabled={true}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Tray")}
            id="TrayCode"
            name="TrayCode"
            value={formData?.TrayCode || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
            disabled={true}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Issue To")}
            id="IssueTo"
            name="IssueTo"
            value={formData?.IssueTo || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Issue Reason")}
            id="IssueReason"
            name="IssueReason"
            value={formData?.IssueReason || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Invoice No")}
            id="InvoiceNo"
            name="InvoiceNo"
            value={formData?.InvoiceNo || ""}
            onChange={handleChange}
            respclass="col-md-4 col-12"
          />

          {/* Optional Status Dropdown */}
          {/* <ReactSelect
        name="Status"
        id="Status"
        removeIsClearable={true}
        dynamicOptions={statusdata}
        isShowBorder={true}
        placeholderName="Status"
        value={formData?.Status || ""}
        onChange={(option) => handleSelectChange("Status", option?.value)}
        respclass="col-md-4 col-12"
      /> */}
        </div>

        <div className="row p-2">
          <div className="col-12 d-flex justify-content-center">
            <button
              className="btn btn-sm btn-success px-5"
              onClick={handleSave}
            >
              {t("Issue")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default IssueModal;
