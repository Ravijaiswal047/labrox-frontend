import React, { useEffect, useState } from "react";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import CustomTable from "../../../components/Table/CustomTable";
import DatePicker from "../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import FileUpload from "../../ManageQuery/FileUpload";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiEndpoints";
import { useDispatch } from "react-redux";
import { clearFiles } from "../../../store/reducers/fileUploadSlice/fileUploadSlice";
import { number } from "../../../utils/helpers";
import { toast } from "react-toastify";
import moment from "moment";

const typeNameMap = { "1": "User", "2": "FieldBoy", "3": "Bank" };

const CashTransfer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const initialState = {
    TransferTo: "1",
    UserID: "",
    UserName: "",
    fieldBoyMobileNo: "",
    TransferAmt: "",
    ShortDepositeReason: "",
    documents: [],
    FromDate: new Date(),
    ToDate: new Date(),
  };

  const [payload, setPayload] = useState(initialState);
  const [summary, setSummary] = useState({});
  const [userList, setUserList] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);

  const TransferToOptions = [
    { label: "User", value: "1" },
    { label: "Field Boy", value: "2" },
    { label: "Bank", value: "3" },
  ];

  // ─── API: GET /CashTransfer/SearchData ────────────────────────────────────
  const fetchSummary = async () => {
    try {
      const res = await axiosInstance.get(apiUrls?.CashTransferSearchData);
      setSummary(res?.data?.message || {});
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  // ─── API: POST /CashTransfer/BindSearchType ───────────────────────────────
  const fetchUserList = async (searchType) => {
    try {
      const res = await axiosInstance.post(apiUrls?.BindSearchType, {
        searchType: Number(searchType),
      });
      const list = Array.isArray(res?.data?.message)
        ? res.data.message.map((u) => ({ label: u?.Name, value: u?.ID, Mobile: u?.Mobile }))
        : [];
      setUserList(list);
    } catch (err) {
      console.error("Error fetching user list:", err);
    }
  };

  // ─── API: POST /CashTransfer/SaveCashDeposit ──────────────────────────────
  const handleSave = async () => {
    if (!payload.UserID) { toast.error("User is Required"); return; }
    if (!payload.TransferAmt) { toast.error("Transfer Amt. is Required"); return; }

    const reqBody = {
      employee_ID_To: Number(payload.UserID),
      employeeName_To: String(payload.UserName || ""),
      typeID: Number(payload.TransferTo),
      typeName: typeNameMap[payload.TransferTo] || "User",
      depositAmount: Number(payload.TransferAmt),
      shortDepositRejectReason: String(payload.ShortDepositeReason || ""),
      fieldBoyMobileNo: String(payload.fieldBoyMobileNo || ""),
      document: payload.documents || [],
    };

    try {
      const res = await axiosInstance.post(apiUrls?.SaveCashDeposit, reqBody);
      if (res?.data?.success === false) {
        toast.error(res?.data?.message || "Something went wrong");
        return;
      }
      toast.success(res?.data?.message || "Saved successfully");
      setPayload(initialState);
      dispatch(clearFiles());
      fetchSummary();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    }
  };

  // ─── API: POST /CashTransfer/ExportCashDeposit ────────────────────────────
  const handleSearch = async (type = 0) => {
    const reqBody = {
      fromDate: moment(payload.FromDate).format("DD-MMM-YYYY"),
      toDate: moment(payload.ToDate).format("DD-MMM-YYYY"),
      type,
    };
    try {
      const res = await axiosInstance.post(
        apiUrls?.ExportCashDeposit,
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
        link.download = "CashTransfer_Report.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });

  const handleFileResponse = async (files) => {
    if (files) {
      const fileArray = Array.isArray(files) ? files : [files];
      const documentData = await Promise.all(
        fileArray.map(async (file) => ({
          fileName: file.name,
          fileBase64: await fileToBase64(file),
        }))
      );
      setPayload((prev) => ({ ...prev, documents: documentData }));
    } else {
      setPayload((prev) => ({ ...prev, documents: [] }));
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchUserList("1");
  }, []);

  // ─── Table ────────────────────────────────────────────────────────────────

  const historyColumns = [
    { header: "S.No.", field: "srNo", width: "3%" },
    { header: "Transfer By", field: "TransferBy" },
    { header: "Transfer To", field: "TransferTo" },
    { header: "Amount", field: "Amount" },
    { header: "Transfer Date Time", field: "TransferDateTime" },
    { header: "TypeName", field: "TypeName" },
    { header: "IsReceive", field: "IsReceive" },
    { header: "IsReject", field: "IsReject" },
    { header: "RejectReason", field: "RejectReason" },
  ];

  const formattedHistory = historyList.map((item, index) => ({
    srNo: index + 1,
    TransferBy: item?.TransferBy,
    TransferTo: item?.TransferTo,
    Amount: item?.Amount,
    TransferDateTime: item?.TransferDateTime,
    TypeName: item?.TypeName,
    IsReceive: item?.IsReceive,
    IsReject: item?.IsReject,
    RejectReason: item?.RejectReason,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="card">
        <Heading name={"Cash Transfer"} isBreadcrumb={true} />

        <div className="row p-2 align-items-center">
          {/* Transfer To — radio */}
          <div className="col-xl-4 col-sm-6 d-flex align-items-center gap-2 mb-2">
            <span className="fw-semibold small text-nowrap">Transfer To :</span>
            {TransferToOptions.map((opt) => (
              <div key={opt.value} className="form-check form-check-inline mb-0">
                <input
                  className="form-check-input"
                  type="radio"
                  name="ctTransferTo"
                  id={`ctTransferTo_${opt.value}`}
                  checked={payload.TransferTo === opt.value}
                  onChange={() => {
                    setPayload((prev) => ({ ...prev, TransferTo: opt.value, UserID: "", UserName: "" }));
                    fetchUserList(opt.value);
                  }}
                />
                <label className="form-check-label" htmlFor={`ctTransferTo_${opt.value}`}>
                  {opt.label}
                </label>
              </div>
            ))}
          </div>

          {/* User dropdown — populated by BindSearchType */}
          <ReactSelect
            name="UserID"
            id="UserID"
            removeIsClearable={true}
            dynamicOptions={userList}
            placeholderName="User"
            value={payload.UserID}
            className="required-fields"
            onChange={(_name, option) =>
              setPayload((prev) => ({
                ...prev,
                UserID: option?.value ?? "",
                UserName: option?.label ?? "",
                fieldBoyMobileNo: option?.Mobile ?? "",
              }))
            }
            respclass={"col-xl-2 col-sm-4 col-md-4"}
          />
        </div>

        {/* Info Panel — GET /CashTransfer/SearchData */}
        <div className="px-2 pb-2">
          <div className="border rounded" style={{ overflow: "hidden" }}>
            {/* Summary Row — always visible, clickable */}
            <div
              className="d-flex align-items-center flex-wrap gap-4 px-3 py-2"
              style={{ cursor: "pointer", background: "#f0f4ff", borderBottom: showSummaryDetails ? "1px solid #dee2e6" : "none" }}
              onClick={() => setShowSummaryDetails((prev) => !prev)}
            >
              <div className="d-flex flex-column align-items-center px-3 py-1 rounded"
                style={{ background: "#e8f0fe", minWidth: 130 }}>
                <span className="text-muted" style={{ fontSize: "11px" }}>Total Cash Balance</span>
                <span className="fw-bold text-primary fs-6">{summary?.totalCashBalance ?? 0}</span>
              </div>

              <div className="d-flex flex-column align-items-center px-3 py-1 rounded"
                style={{ background: "#fde8e8", minWidth: 160 }}>
                <span className="text-muted" style={{ fontSize: "11px" }}>Pending for Receive</span>
                <span className="fw-bold text-danger fs-6">{summary?.totalCashAmountPendingForReceive ?? 0}</span>
              </div>

              <div className="d-flex flex-column align-items-center px-3 py-1 rounded"
                style={{ background: "#e6f9ed", minWidth: 140 }}>
                <span className="text-muted" style={{ fontSize: "11px" }}>Last Day Collection</span>
                <span className="fw-bold text-success fs-6">{summary?.lastDayCollection ?? 0}</span>
              </div>

              <span className="ms-auto text-muted small pe-1">
                {showSummaryDetails ? "▲ Hide details" : "▼ More details"}
              </span>
            </div>

            {/* Detail Row — toggled */}
            {showSummaryDetails && (
              <div className="px-3 py-2" style={{ background: "#fafafa" }}>
                <div className="row g-2">
                  <div className="col-sm-4 d-flex flex-column">
                    <span className="text-muted" style={{ fontSize: "11px" }}>Last Transfer To</span>
                    <span className="fw-semibold small">{summary?.lastTransferTo || "-"}</span>
                  </div>
                  <div className="col-sm-4 d-flex flex-column">
                    <span className="text-muted" style={{ fontSize: "11px" }}>Last Transfer Amt.</span>
                    <span className="fw-semibold small">{summary?.lastTransferAmt ?? 0}</span>
                  </div>
                  <div className="col-sm-4 d-flex flex-column">
                    <span className="text-muted" style={{ fontSize: "11px" }}>Last Transfer Date Time</span>
                    <span className="fw-semibold small">{summary?.lastTransferDateTime || "-"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Inputs + Upload + Buttons */}
        <div className="row p-2 align-items-end">
          <Input
            type="number"
            placeholder=" "
            lable={t("Cash Transfer Amt.")}
            id="TransferAmt"
            name="TransferAmt"
            value={payload.TransferAmt}
            onChange={(e) => setPayload((prev) => ({ ...prev, TransferAmt: e.target.value }))}
            className="required-fields"
            respclass={"col-xl-2 col-sm-4 col-md-4"}
          />
          <Input
            type="text"
            placeholder=" "
            lable={t("Short Deposite Reason")}
            id="ShortDepositeReason"
            name="ShortDepositeReason"
            value={payload.ShortDepositeReason}
            onChange={(e) => setPayload((prev) => ({ ...prev, ShortDepositeReason: e.target.value }))}
            respclass={"col-xl-2 col-sm-4 col-md-4"}
          />
          {payload.TransferTo === "2" && (
            <Input
              type="text"
              placeholder=" "
              lable={t("Mobile No.")}
              id="fieldBoyMobileNo"
              name="fieldBoyMobileNo"
              value={payload.fieldBoyMobileNo}
              onChange={(e) => setPayload((prev) => ({ ...prev, fieldBoyMobileNo: e.target.value }))}
              onInput={(e) => number(e, 10)}
              respclass={"col-xl-2 col-sm-4 col-md-4"}
            />
          )}
          <div className="col-xl-3 col-sm-6">
            <FileUpload
              placeholder="Upload Receipt"
              allowedTypes={[".doc", ".docx", ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".xls", ".xlsx"]}
              onFileSelect={handleFileResponse}
              respclass={"col-12"}
            />
          </div>
          <div className="col-auto d-flex gap-2">
            <Button className="rounded py-0" onClick={handleSave}>Save</Button>
            {/* <Button
              className="rounded py-0 bg-danger border-0"
              onClick={() => { setPayload(initialState); dispatch(clearFiles()); }}
            >
              Clear
            </Button> */}
          </div>
        </div>
      </div>

      {/* Transfer History — POST /CashTransfer/ExportCashDeposit */}
      <div className="card mt-2">
        <Heading name={"Transfer History"} isBreadcrumb={true} />
        <div className="row p-2 align-items-end">
          <DatePicker
            name="FromDate"
            id="CTFromDate"
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
            id="CTToDate"
            value={payload.ToDate}
            onChange={(date, name) => setPayload((prev) => ({ ...prev, [name]: date }))}
            maxDate={new Date()}
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-4"}
          />
          <div className="col-sm-6 d-flex gap-2 flex-wrap mb-2">
            <Button className="rounded py-0 " onClick={() => handleSearch(0)}>Search</Button>
            {/* <Button
              className={`rounded py-0 ${historyList.length > 0 ? "" : "disButton"}`}
              disabled={historyList.length === 0}
              onClick={() => handleSearch(1)}
            >
              ExportToExcel
            </Button> */}
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
    </>
  );
};

export default CashTransfer;
