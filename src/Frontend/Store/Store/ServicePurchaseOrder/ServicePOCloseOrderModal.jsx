import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../../utils/axiosInstance";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Tables from "../../../components/UI/customTable";
import { CustomButton } from "../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import moment from "moment";

const getPoNumber = (state) =>
  state?.purchaseOrderNo || state?.PurchaseOrderNo || "";

const getPoCloseNumber = (state) =>
  state?.poCloseNumber || state?.POCloseNumber || state?.poCloseNo || "";

const encodePoNumber = (poNumber) =>
  encodeURIComponent(poNumber).replace(/%2F/gi, "/");

const toNumber = (value) => Number(value) || 0;

const createInitialFormData = (state) => ({
  invoiceNumber: state?.invoiceNo || state?.InvoiceNo || "",
  invoiceDate: new Date(),
  deliveryNo: "",
  deliveryDate: new Date(),
  coa: "",
  remarks: "",
});

const mapPoDetail = (item) => ({
  purchaseOrderDetailID:
    item?.purchaseOrderDetailID || item?.poDetailId || item?.poDetailID,
  itemID: item?.itemID || item?.itemId,
  itemName: item?.itemName || "-",
  remarks: item?.remarks || "-",
  orderQty: item?.orderedQty ?? 0,
  approvedQty: item?.approvedQty ?? 0,
  preClosedQty: item?.recievedQty ?? 0,
  pendingQty: item?.pendingQty ?? 0,
  netAmount: item?.netAmount ?? 0,
  itemAmount: item?.itemAmount ?? 0,
  closedQty: "",
  actualClosedAmt: "",
  newClosedAmt: "",
  rejectedQty: item?.rejectedQty ?? item?.rejectQty ?? 0,
  isSelected: false,
});

const mapCoaOption = (item) => ({
  label:
    item?.label ||
    item?.ledgerName ||
    item?.accountName ||
    item?.name ||
    item?.text ||
    "",
  value:
    item?.value ??
    item?.ledgerNumber ??
    item?.ledgerNo ??
    item?.accountID ??
    item?.accountId ??
    item?.id ??
    "",
});

const styles = {
  dialog: {
    maxWidth: "1280px",
  },
  formLabel: {
    minWidth: "120px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#2f3a45",
  },
  actionButton: {
    minWidth: "112px",
    height: "28px",
    padding: "3px 10px",
    fontSize: "12px",
    lineHeight: "18px",
    borderRadius: "3px",
  },
};

const ServicePOCloseOrderModal = ({ show, handleClose, state, refresh }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const [tableData, setTableData] = useState([]);
  const [coaOptions, setCoaOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => createInitialFormData(state));

  const bindPoDetails = async () => {
    const poNumber = getPoNumber(state);

    if (!poNumber) {
      setTableData([]);
      return;
    }

    try {
      const res = await axiosInstance.post(
        `ServicePO/BindPoDetails?poNumber=${encodePoNumber(poNumber)}`
      );
      const response = res?.data?.message || [];

      if (res?.data?.success && Array.isArray(response) && response.length > 0) {
        setTableData(response.map(mapPoDetail));
        return;
      }

      setTableData([]);
      toast.error("No PO details found");
    } catch (err) {
      setTableData([]);
      toast.error(err?.response?.data?.message || "Error Occured");
    }
  };

  const bindCoaOptions = async () => {
    try {
      const res = await axiosInstance.get("ServicePO/BindChatapAccount");
      const response = res?.data?.message || [];

      setCoaOptions(
        Array.isArray(response) ? response.map(mapCoaOption) : []
      );
    } catch (err) {
      setCoaOptions([]);
      toast.error(err?.response?.data?.message || "COA API Error");
    }
  };

  useEffect(() => {
    setFormData(createInitialFormData(state));
    bindPoDetails();
    bindCoaOptions();
  }, [state]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

 const handleItemChange = (index, name, value) => {
  const currentRow = tableData[index];

  if (name === "closedQty") {
    // allow user to clear input
    if (value === "") {
      setTableData((prev) =>
        prev.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [name]: value,
              }
            : item
        )
      );
      return;
    }

    const enteredValue = Number(value);
    const approvedQty = Number(currentRow?.approvedQty || 0);

    if (enteredValue < 0) {
      toast.error("Closed Qty cannot be less than 0");
      return;
    }

    if (enteredValue > approvedQty) {
      toast.error("Closed Qty cannot be greater than Approved Qty");
      return;
    }
  }

  setTableData((prev) =>
    prev.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item;
      }

      const updatedItem = { ...item, [name]: value };

      if (name === "closedQty") {
        updatedItem.newClosedAmt =
          value === ""
            ? ""
            : Number(item?.itemAmount || 0) * Number(value || 0);
      }

      return updatedItem;
    })
  );
};

  const handleRowSelect = (index, checked) => {
    setTableData((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, isSelected: checked } : item
      )
    );
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

  const renderTableNumberInput = (row, index, name, className = "", disabled = false) => (
    <div className="service-po-table-input">
      <Input
        type="number"
        value={row?.[name]}
        lable=""
        respclass=""
        disabled={disabled}
        removeFormGroupClass={true}
        className={`form-control-sm service-po-plain-input ${className}`.trim()}
        onChange={(e) => handleItemChange(index, name, e.target.value)}
      />
    </div>
  );

  const buildClosePayload = () => {
    const poNumber = getPoNumber(state);

    return {
      againstPO: "PO",
      servicePODetails: tableData
        .filter((row) => row?.isSelected && toNumber(row?.closedQty) > 0)
        .map((row) => ({
          poNumber,
          poDetailId: toNumber(row?.purchaseOrderDetailID || state?.poDetailId),
          itemId: String(row?.itemID || ""),
          amount: toNumber(
            row?.newClosedAmt || row?.actualClosedAmt || row?.itemAmount
          ),
          closedQty: toNumber(row?.closedQty),
          rejectedQty: toNumber(row?.rejectedQty),
          invoiceNumber: formData?.invoiceNumber?.trim() || "",
          invoiceDate: moment(formData?.invoiceDate).format("YYYY-MM-DD"),
          remarks: formData?.remarks?.trim() || "",
        })),
    };
  };

  const handleCloseOrder = async () => {
    if (isSubmitting) {
      return;
    }
    // if(closedQty === ""){
    //   toast.error("Please enter closed quantity");
    //   return;
    // }
    if (!formData?.invoiceNumber?.trim()) {
    toast.error("Please enter invoice number");
    return;
  }
  if (!formData?.coa?.trim()) {
  toast.error("Please select Chatap account");
  return;
}

    const closePayload = buildClosePayload();
    const hasSelectedRows = tableData.some((row) => row?.isSelected);

    console.log("Close Order Payload:", closePayload);

    if (!hasSelectedRows) {
      toast.error("Please select at least one row");
      return;
    }

    if (closePayload.servicePODetails.length === 0) {
      toast.error("Please enter closed quantity");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await axiosInstance.post(
        "ServicePO/ServiceOrderClose",
        closePayload
      );

      console.log("Close Order Response:", res?.data);

      if (res?.data?.success) {
        toast.success(res?.data?.message || "Service PO closed successfully");
        refresh?.();
        handleClose();
        return;
      }

      toast.error(res?.data?.message || "Unable to close Service PO");
    } catch (err) {
      console.log("Close Order Error:", err);
      toast.error(err?.response?.data?.message || "Error Occured");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      header={
        <span>
          {t("PO Number")} :{" "}
          <span className="text-primary">{getPoNumber(state) || "-"}</span>
        </span>
      }
      visible={show}
      onHide={handleClose}
      className={theme}
      style={{ width: isMobile ? "96vw" : "82vw", ...styles.dialog }}
      modal
    >
      <div className="card mt-2">
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("S/No.")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Remarks")}</th>
                  <th>{t("Order Qty")}</th>
                  <th>{t("Approved Qty")}</th>
                  <th>{t("Pending Qty")}</th>
                  <th>{t("Net Amount")}</th>
                  <th>{t("Item Amount")}</th>
                  <th>{t("Closed Qty")}</th>
                  <th>{t("Actual Closed Amt")}</th>
                  <th>{t("New Closed Amt")}</th>
                  <th>{t("Select")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr
                    key={`${row?.itemID || row?.purchaseOrderDetailID || "service-po-item"}-${index}`}
                  >
                    <td data-title={t("S/No.")}>{index + 1}</td>
                    <td data-title={t("Item Name")}>{row?.itemName || "-"}</td>
                    <td data-title={t("Remarks")}>{row?.remarks || "-"}</td>
                    <td data-title={t("Order Qty")} className="text-center">
                      {row?.orderQty || 0}
                    </td>
                    <td data-title={t("Pre Closed Qty")} className="text-center">
                      {row?.approvedQty  || 0}
                    </td>
                    <td data-title={t("Pending Qty")} className="text-center">
                      {row?.pendingQty || 0}
                    </td>
                    <td data-title={t("Net Amount")} className="text-center">
                      {row?.netAmount || 0}
                    </td>
                    <td data-title={t("Item Amount")} className="text-center">
                      {row?.itemAmount || 0}
                    </td>
                    <td data-title={t("Closed Qty")}className="text-center">
                      {renderTableNumberInput(
                        row,
                        index,
                        "closedQty",
                        "service-po-amount-input"
                      )}
                    </td>
                    <td data-title={t("Actual Closed Amt")} className="text-center">
                      {row?.netAmount || 0}
                    </td>
                    <td data-title={t("New Closed Amt")}>
                      {renderTableNumberInput(row, index, "newClosedAmt", "", true)}
                    </td>
                    <td data-title={t("Select")} className="text-center">
                      <input
                        type="checkbox"
                        checked={row?.isSelected || false}
                        onChange={(e) =>
                          handleRowSelect(index, e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan={13} className="text-center">
                      {t("No Data Found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>

      <div className="row px-1 pt-2 align-items-center">
        <div className="col-xl-5 col-md-6 col-12 service-po-field">
          <label className="mb-0" style={styles.formLabel}>
            {t("Invoice Number")} :
          </label>
          <div className="service-po-control service-po-input-wrap">
            <Input
              type="text"
              lable=""
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData?.invoiceNumber}
              onChange={handleFormChange}
              className="required-fields"
              respclass=""
            />
          </div>
        </div>
        <div className="col-xl-4 col-md-6 col-12 service-po-field">
          <label className="mb-0" style={styles.formLabel}>
            {t("Invoice Date")} :
          </label>
          <div className="service-po-control">
            <DatePicker
              name="invoiceDate"
              id="invoiceDate"
              value={formData?.invoiceDate}
              onChange={handleDateChange}
              placeholder=""
              className="custom-calendar"
            />
          </div>
        </div>
      </div>

      <div className="row px-1 align-items-center">
        <div className="col-xl-5 col-md-6 col-12 service-po-field">
          <label className="mb-0" style={styles.formLabel}>
            {t("Delivery No.")} :
          </label>
          <div className="service-po-control service-po-input-wrap">
            <Input
              type="text"
              lable=""
              id="deliveryNo"
              name="deliveryNo"
              value={formData?.deliveryNo}
              onChange={handleFormChange}
              className="form-control-sm"
              respclass=""
            />
          </div>
        </div>
        <div className="col-xl-4 col-md-6 col-12 service-po-field">
          <label className="mb-0" style={styles.formLabel}>
            {t("Deliver Date")} :
          </label>
          <div className="service-po-control">
            <DatePicker
              name="deliveryDate"
              id="deliveryDate"
              value={formData?.deliveryDate}
              onChange={handleDateChange}
              placeholder=""
              className="custom-calendar"
            />
          </div>
        </div>
        <div className="col-xl-3 col-md-6 col-12 service-po-field">
          <label className="mb-0" style={styles.formLabel}>
            {t("COA")} :
          </label>
          <div className="service-po-control">
            <ReactSelect
              name="coa"
              id="coa"
              removeIsClearable={true}
              dynamicOptions={coaOptions}
              placeholderName="Select"
              value={formData?.coa}
              onChange={handleSelectChange}
              className="required-fields"
            />
          </div>
        </div>
      </div>

      <div className="row px-1 align-items-start">
        <div className="col-12 service-po-field">
          <label className="mb-0" style={styles.formLabel}>
            {t("Remarks")} :
          </label>
          <textarea
            id="remarks"
            name="remarks"
            className="form-control"
            value={formData?.remarks}
            onChange={handleFormChange}
          />
        </div>
      </div>

      <div className="row px-1 pt-2">
        <div className="col-12 d-flex justify-content-end">
          <CustomButton
            text={isSubmitting ? "Closing..." : "Close Order"}
            onClick={handleCloseOrder}
            variant="info"
            style={styles.actionButton}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </Dialog>
  );
};

export default ServicePOCloseOrderModal;
