import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { toast } from "react-toastify";
import { FaSearch } from "react-icons/fa";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Tables from "../../../components/UI/customTable";
import { CustomButton } from "../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

const getValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "") ?? "";

const ServicePOClosedDetailsModal = ({ show, handleClose, state, refresh }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    invoiceNumber: getValue(state?.invoiceNo, state?.InvoiceNo),
    invoiceDate: new Date(),
    department: "",
    coa: "",
    document: null,
  });

  useEffect(() => {
    setTableData([
      {
        poCloseNumber: getValue(
          state?.poCloseNumber,
          state?.POCloseNumber,
          state?.purchaseOrderNo,
          state?.PurchaseOrderNo
        ),
        date: getValue(state?.closeDate, state?.CloseDate, state?.createdDate),
        amount: getValue(state?.grossTotal, state?.GrossTotal, state?.netTotal, state?.NetTotal),
        remarks: getValue(state?.remarks, state?.Remarks),
        entryBy: getValue(state?.entryBy, state?.EntryBy, state?.createdBy, state?.CreatedBy),
        invoiceNo: getValue(state?.invoiceNo, state?.InvoiceNo),
        vatAmount: getValue(state?.vatAmount, state?.VATAmount, state?.taxAmount, state?.TaxAmount),
        newClosedAmount: getValue(
          state?.newClosedAmount,
          state?.NewClosedAmount,
          state?.netTotal,
          state?.NetTotal
        ),
        documentUrl: getValue(state?.documentUrl, state?.DocumentUrl, state?.filePath, state?.FilePath),
      },
    ]);
  }, [state]);

  const departmentOptions = [
    { label: "Transport", value: "Transport" },
    { label: "Store", value: "Store" },
  ];

  const coaOptions = [];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      [name]: option?.value ?? "",
    }));
  };

  const handleDateChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleViewDocument = (row) => {
    if (!row?.documentUrl) {
      toast.info("No document found");
      return;
    }

    window.open(row.documentUrl, "_blank", "noopener,noreferrer");
  };

  const handleUpdateInvoice = () => {
    if (!formData?.invoiceNumber) {
      toast.error("Please enter invoice number");
      return;
    }

    toast.info("Update Invoice API is pending");
    console.log("Service PO update invoice payload", {
      poNumber: state?.purchaseOrderNo,
      invoiceNumber: formData?.invoiceNumber,
    });
  };

  const handleUpdateDetails = () => {
    toast.info("Update Details API is pending");
    console.log("Service PO update details payload", {
      poNumber: state?.purchaseOrderNo,
      invoiceNumber: formData?.invoiceNumber,
      invoiceDate: moment(formData?.invoiceDate).format("YYYY-MM-DD"),
      department: formData?.department,
      coa: formData?.coa,
      document: formData?.document,
    });
    refresh?.();
  };

  return (
    <Dialog
      header={
        <span>
          {t("Service PO Closed Details")}{" "}
          <span className="text-primary">
            ({t("PO Number")} : {state?.purchaseOrderNo || state?.PurchaseOrderNo || "-"})
          </span>
        </span>
      }
      visible={show}
      onHide={handleClose}
      className={theme}
      style={{ width: isMobile ? "95vw" : "61vw" }}
      modal
    >
      <div className="card mt-2">
        <div className="row">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("S/No.")}</th>
                  <th>{t("PO Close Number")}</th>
                  <th>{t("Date")}</th>
                  <th>{t("Amount")}</th>
                  <th>{t("Remarks")}</th>
                  <th>{t("Entry By")}</th>
                  <th>{t("Invoice No.")}</th>
                  <th>{t("VAT Amount")}</th>
                  <th>{t("New Closed Amt.")}</th>
                  <th>{t("Select")}</th>
                  <th>{t("View Document")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={`${row?.poCloseNumber || "service-po-close"}-${index}`}>
                    <td data-title={t("S/No.")}>{index + 1}</td>
                    <td data-title={t("PO Close Number")}>{row?.poCloseNumber || "-"}</td>
                    <td data-title={t("Date")}>
                      {row?.date && !String(row?.date).startsWith("0001")
                        ? moment(row?.date).format("DD-MMM-YYYY hh:mm A")
                        : "-"}
                    </td>
                    <td data-title={t("Amount")}>{row?.amount || 0}</td>
                    <td data-title={t("Remarks")}>{row?.remarks || "-"}</td>
                    <td data-title={t("Entry By")}>{row?.entryBy || "-"}</td>
                    <td data-title={t("Invoice No.")}>{row?.invoiceNo || "-"}</td>
                    <td data-title={t("VAT Amount")}>{row?.vatAmount || 0}</td>
                    <td data-title={t("New Closed Amt.")}>{row?.newClosedAmount || 0}</td>
                    <td data-title={t("Select")}>
                      <input
                        type="checkbox"
                        checked={selectedIndex === index}
                        onChange={() => setSelectedIndex(selectedIndex === index ? -1 : index)}
                      />
                    </td>
                    <td data-title={t("View Document")}>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0"
                        title={t("View Document")}
                        onClick={() => handleViewDocument(row)}
                      >
                        <FaSearch />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>

      <div className="row px-2 pt-2 align-items-center">
        <div className="col-xl-5 col-md-6 col-12 mb-1">
          <label className="mb-0">
            {t("Invoice Number")} :
          </label>
          <Input
            type="text"
            lable=""
            id="invoiceNumber"
            name="invoiceNumber"
            value={formData?.invoiceNumber}
            onChange={handleInputChange}
            className="form-control-sm"
            respclass=""
          />
        </div>
        <div className="col-xl-4 col-md-6 col-12 mb-1">
          <label className="mb-0">
            {t("Invoice Date")} :
          </label>
          <DatePicker
            name="invoiceDate"
            id="invoiceDate"
            value={formData?.invoiceDate}
            onChange={handleDateChange}
            placeholder=""
            className="custom-calendar"
          />
        </div>
        <div className="col-xl-3 col-md-12 col-12 d-flex justify-content-xl-start justify-content-end mb-1">
          <CustomButton
            text={"Update Invoice No."}
            onClick={handleUpdateInvoice}
            variant="info"
          />
        </div>
      </div>

      <div className="row px-2 align-items-center">
        <div className="col-xl-5 col-md-6 col-12 mb-1">
          <label className="mb-0">
            {t("Department")} :
          </label>
          <ReactSelect
            name="department"
            id="department"
            removeIsClearable={true}
            dynamicOptions={departmentOptions}
            placeholderName="Transport"
            value={formData?.department}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-xl-4 col-md-6 col-12 mb-1">
          <label className="mb-0">
            {t("COA")} :
          </label>
          <ReactSelect
            name="coa"
            id="coa"
            removeIsClearable={true}
            dynamicOptions={coaOptions}
            placeholderName="COA"
            value={formData?.coa}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-xl-3 col-md-12 col-12 d-flex justify-content-xl-start justify-content-end mb-1">
          <CustomButton
            text={"Update Details"}
            onClick={handleUpdateDetails}
            variant="info"
          />
        </div>
      </div>

      <div className="row px-2 pb-1 align-items-center">
        <div className="col-xl-8 col-md-8 col-12 mb-1">
          <label className="mb-0">
            {t("Document")} :
          </label>
          <input
            type="file"
            name="document"
            className="form-control form-control-sm"
            onChange={handleInputChange}
          />
        </div>
        <div className="col-xl-4 col-md-4 col-12 d-flex justify-content-xl-start justify-content-end mb-1">
          <CustomButton
            text={"Close"}
            onClick={handleClose}
            variant="info"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ServicePOClosedDetailsModal;
