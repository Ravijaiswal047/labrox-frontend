import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import CustomTable from "../../../components/Table/CustomTable";
import DatePicker from "../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiEndpoints";
import { toast } from "react-toastify";
import moment from "moment";

const CashReceive = () => {
  const { t } = useTranslation();

  const initialState = {
    ReceiveCashFrom: "1",
    FromDate: new Date(),
    ToDate: new Date(),
  };

  const [payload, setPayload] = useState(initialState);
  const [pendingList, setPendingList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [rejectModal, setRejectModal] = useState({ item: null, reason: "" });
  const dialogRef = useRef(null);

  const ReceiveCashFromOptions = [
    { label: "User", value: "1" },
    { label: "Field Boy", value: "2" },
    { label: "Bank", value: "3" },
  ];

  // ─── API: POST /CashReceive/SearchData ────────────────────────────────────
  const fetchPending = async (typeID) => {
    try {
      const res = await axiosInstance.post(apiUrls?.CashReceiveSearchData, {
        typeID: Number(typeID || payload.ReceiveCashFrom),
      });
      if (res?.data?.success === false) {
        setPendingList([]);
      } else {
        setPendingList(Array.isArray(res?.data?.message) ? res.data.message : []);
      }
    } catch (err) {
      console.error("Error fetching pending list:", err);
    }
  };

  // ─── API: POST /CashReceive/SaveCashReceive ───────────────────────────────
  const handleReceive = async (item) => {
    try {
      const res = await axiosInstance.post(apiUrls?.SaveCashReceive, {
        id: Number(item?.ID),
        empId: Number(item?.EmpIDTo) || 0,
        empName: String(item?.NameTo || ""),
        typeName: String(item?.TypeName || ""),
        typeID: Number(item?.TypeID) || 0,
        amount: Number(item?.Amount) || 0,
        noteType: String(item?.NoteType || ""),
      });
      if (res?.data?.success === false) {
        toast.error(res?.data?.message || "Something went wrong");
        return;
      }
      toast.success(res?.data?.message || "Cash received successfully");
      fetchPending(payload.ReceiveCashFrom);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // ─── Reject dialog open/close ─────────────────────────────────────────────
  const openRejectModal = (item) => {
    setRejectModal({ item, reason: "" });
    dialogRef.current?.showModal();
  };

  const closeRejectModal = () => {
    dialogRef.current?.close();
    setRejectModal({ item: null, reason: "" });
  };

  // ─── API: POST /CashReceive/RejectCashReceive ─────────────────────────────
  const handleReject = async (item) => {
    openRejectModal(item);
  };

  const confirmReject = async () => {
    if (!rejectModal.reason.trim()) {
      toast.error("Please enter a reject reason");
      return;
    }
    try {
      const res = await axiosInstance.post(apiUrls?.RejectCashReceive, {
        id: Number(rejectModal.item?.ID),
        rejectReason: rejectModal.reason.trim(),
      });
      if (res?.data?.success === false) {
        toast.error(res?.data?.message || "Something went wrong");
        return;
      }
      toast.success(res?.data?.message || "Rejected successfully");
      closeRejectModal();
      fetchPending(payload.ReceiveCashFrom);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // ─── API: POST /CashReceive/GetDocumentDetail ─────────────────────────────
  const handleViewDocument = async (item) => {
    if (!item?.ID) return;
    try {
      const res = await axiosInstance.post(apiUrls?.GetDocumentDetail, {
        fileID: String(item?.ID),
      });
      console.log("Document detail:", res?.data);
    } catch (err) {
      console.error("Error fetching document:", err);
    }
  };

  // ─── API: POST /CashReceive/ExportCashReceive ─────────────────────────────
  const handleSearch = async (type = 0) => {
    const reqBody = {
      fromDate: moment(payload.FromDate).format("DD-MMM-YYYY"),
      toDate: moment(payload.ToDate).format("DD-MMM-YYYY"),
      type,
    };
    try {
      const res = await axiosInstance.post(
        apiUrls?.ExportCashReceive,
        reqBody,
        type === 1 ? { responseType: "blob" } : {}
      );
      if (type === 0) {
        setHistoryList(Array.isArray(res?.data?.message) ? res.data.message : []);
      } else {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "CashReceive_Report.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  useEffect(() => {
    fetchPending("1");
  }, []);

  // ─── Tables ───────────────────────────────────────────────────────────────

  const pendingColumns = [
    { header: "S.No.", field: "srNo", width: "3%" },
    { header: "Type", field: "Type" },
    { header: "Deposit By", field: "DepositBy" },
    { header: "Deposit Date Time", field: "DepositDateTime" },
    { header: "Amount", field: "Amount" },
    { header: "Receipt", field: "Receipt" },
    { header: "ShortDeposit Reason", field: "ShortDepositReason" },
  ];

  const renderReceiptCell = (item) => {
    if (item?.IsReceive === 1) {
      return (
        <div>
          <span
            className="badge"
            style={{ background: "#198754", fontSize: "11px", padding: "4px 8px" }}
          >
            Received
          </span>
          <div style={{ fontSize: "11px", color: "#555", marginTop: "2px" }}>
            <span>By : </span><span className="fw-semibold">{item?.ReceivedBy || "-"}</span>
          </div>
          <div style={{ fontSize: "11px", color: "#555" }}>{item?.ReceivedDate || "-"}</div>
        </div>
      );
    }
    if (item?.IsCancel === 1) {
      return (
        <div>
          <span
            className="badge"
            style={{ background: "#dc3545", fontSize: "11px", padding: "4px 8px" }}
          >
            Rejected
          </span>
          {item?.RejectReason && (
            <div style={{ fontSize: "11px", color: "#dc3545", marginTop: "2px" }}>
              {item.RejectReason}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="d-flex gap-1 flex-wrap align-items-center">
        <Button
          className="rounded py-0"
          style={{ fontSize: "12px" }}
          onClick={() => handleReceive(item)}
        >
          Receive
        </Button>
        <Button
          className="rounded py-0 bg-danger border-0 ml-2"
          style={{ fontSize: "12px" }}
          onClick={() => handleReject(item)}
        >
          Reject
        </Button>
        {item?.IsFileUpload === 1 && (
          <Button
            className="rounded py-0 bg-secondary border-0"
            style={{ fontSize: "12px" }}
            onClick={() => handleViewDocument(item)}
          >
            View
          </Button>
        )}
      </div>
    );
  };

  const formattedPending = pendingList.map((item, index) => ({
    srNo: index + 1,
    Type: item?.TypeName,
    DepositBy: item?.Name,
    DepositDateTime: item?.CreatedDate,
    Amount: item?.Amount,
    Receipt: renderReceiptCell(item),
    ShortDepositReason: item?.NoteType,
  }));

  const historyColumns = [
    { header: "S.No.", field: "srNo", width: "3%" },
    { header: "Receive By", field: "ReceiveBy" },
    { header: "Transfer By", field: "TransferBy" },
    { header: "Amount", field: "Amount" },
    { header: "Transfer Date Time", field: "TransferDateTime" },
    { header: "TypeName", field: "TypeName" },
  ];

  const formattedHistory = historyList.map((item, index) => ({
    srNo: index + 1,
    ReceiveBy: item?.ReceiveBy,
    TransferBy: item?.TransferBy,
    Amount: item?.Amount,
    TransferDateTime: item?.TransferDateTime,
    TypeName: item?.TypeName,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="card">
        <Heading name={"Cash Receive"} isBreadcrumb={true} />
        <div className="row p-2 align-items-center">
          <div className="col-xl-6 col-sm-8 d-flex align-items-center gap-2 mb-2">
            <span className="fw-semibold small text-nowrap">Receive Cash From :</span>
            {ReceiveCashFromOptions.map((opt) => (
              <div key={opt.value} className="form-check form-check-inline mb-0">
                <input
                  className="form-check-input"
                  type="radio"
                  name="crReceiveCashFrom"
                  id={`crReceiveCashFrom_${opt.value}`}
                  checked={payload.ReceiveCashFrom === opt.value}
                  onChange={() => {
                    setPayload((prev) => ({ ...prev, ReceiveCashFrom: opt.value }));
                    fetchPending(opt.value);
                  }}
                />
                <label className="form-check-label" htmlFor={`crReceiveCashFrom_${opt.value}`}>
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending List — POST /CashReceive/SearchData */}
      <div className="card mt-2">
        <div className="row">
          <div className="col-sm-12">
            <CustomTable columns={pendingColumns} data={formattedPending} />
          </div>
        </div>
      </div>

      {/* Cash Receive History — POST /CashReceive/ExportCashReceive */}
      <div className="card mt-2">
        <Heading name={"Cash Receive History"} isBreadcrumb={true} />
        <div className="row p-2 align-items-end">
          <DatePicker
            name="FromDate"
            id="CRFromDate"
            value={payload.FromDate}
            onChange={(date, name) => setPayload((prev) => ({ ...prev, [name]: date }))}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-4"}
          />
          <DatePicker
            name="ToDate"
            id="CRToDate"
            value={payload.ToDate}
            onChange={(date, name) => setPayload((prev) => ({ ...prev, [name]: date }))}
            maxDate={new Date()}
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-4"}
          />
          <div className="col-sm-6 d-flex gap-2 flex-wrap mb-2">
            <Button className="rounded py-0" onClick={() => handleSearch(0)}>Search</Button>
            <Button
              className={`rounded py-0 ${historyList.length > 0 ? "" : "disButton"} ml-2`}
              disabled={historyList.length === 0}
              onClick={() => handleSearch(1)}
            >
              ExportToExcel
            </Button>
          </div>
        </div>
      </div>

      <div className="card mt-2">
        <div className="row">
          <div className="col-sm-12">
            <CustomTable columns={historyColumns} data={formattedHistory} />
          </div>
        </div>
      </div>

      {/* Reject Reason — native <dialog> */}
      <dialog
        ref={dialogRef}
        style={{ border: "none", borderRadius: "8px", padding: 0, minWidth: "400px", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}
      >
        <div className="modal-header px-3 py-2" style={{ background: "#f8d7da", borderRadius: "8px 8px 0 0" }}>
          <h6 className="modal-title fw-bold text-danger mb-0">Reject Cash Transfer</h6>
          <button type="button" className="btn-close" onClick={closeRejectModal} />
        </div>

        <div className="modal-body px-3 py-3">
          <div className="d-flex gap-4 mb-3">
            <div>
              <div className="text-muted" style={{ fontSize: "11px" }}>Deposit By</div>
              <div className="fw-semibold small">{rejectModal.item?.Name || "-"}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "11px" }}>Amount</div>
              <div className="fw-semibold small text-danger">{rejectModal.item?.Amount ?? 0}</div>
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: "11px" }}>Date</div>
              <div className="fw-semibold small">{rejectModal.item?.CreatedDate || "-"}</div>
            </div>
          </div>

          <label className="form-label fw-semibold small">
            Reject Reason <span className="text-danger">*</span>
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Enter reason for rejection..."
            value={rejectModal.reason}
            onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
          />
        </div>

        <div className="modal-footer px-3 py-2 gap-2">
          <Button
            className="rounded py-1 bg-secondary border-0"
            style={{ fontSize: "13px" }}
            onClick={closeRejectModal}
          >
            Cancel
          </Button>
          <Button
            className="rounded py-1 bg-danger border-0"
            style={{ fontSize: "13px" }}
            onClick={confirmReject}
          >
            Confirm Reject
          </Button>
        </div>
      </dialog>
    </>
  );
};

export default CashReceive;
