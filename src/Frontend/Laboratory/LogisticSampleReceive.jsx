import { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPrint, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { SRAFormatDate } from "../../utils/helpers";
import LogisticSampleViewModal from "../utils/LogisticSampleViewModal";
import { toast } from "react-toastify";
import { CancelButton, SearchButton } from "../../components/UI/CustomButton";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const LogisticSampleReceive = () => {
  const [loading, setLoading] = useState(false);
  const [allCentre, setAllCentre] = useState([]);
  const [fieldBoyOptions, setFieldBoyOptions] = useState([]);
  const [payload, setPayload] = useState({
    FromCentre: "",
    BatchNo: "",
    RouteNo: "",
    FieldBoy: "",
    FromDate: new Date(),
    ToDate: new Date(),
    Type: "All",
  });
  const [logisticReceiveData, setLogisticReceiveData] = useState([]);
  const [showLogisticSampleViewModal, setShowLogisticSampleViewModal] =
    useState(false);

  const [batchDetail, setBatchDetail] = useState([]);
  const [removedBatchDetail, setRemovedBatchDetail] = useState([]);
  const [viewBatchNo, setViewBatchNo] = useState("");
  const [removedAlert, setRemovedAlert] = useState({
    open: false,
    batchNo: "",
    count: 0,
    samples: [],
  });
  const [printLoading, setPrintLoading] = useState(null);

  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  // fetch centres
  useEffect(() => {
    const fetchCentre = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.post("SRA/BindSampleTransferCentre", {
          AllCentre: "1",
        });

        const data = res?.data?.message || [];
        const mapped = data.map((r) => ({
          label: r.Centre,
          value: String(r.CentreID),
        }));

        setAllCentre(mapped);
      } catch (err) {
        console.error("Failed to load centers", err);
        setAllCentre([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCentre();
  }, []);

  // fetch field Boy
  useEffect(() => {
    const fetchFieldBoys = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get("FieldBoyMaster/BindFieldBoy");

        const data = res?.data?.message || [];

        const mapped = data.map((r) => ({
          label: r.NAME,
          value: String(r.FieldBoyID),
        }));

        setFieldBoyOptions(mapped);
      } catch (err) {
        console.error("Failed to load centers", err);
        setFieldBoyOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFieldBoys();
  }, []);

  const handleSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value?.value });
  };

  const handleDateSelect = (value, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    const payloadData = {
      FromCentreID: payload.FromCentre || "",
      BatchNo: payload.BatchNo || "",
      RouteNo: payload.RouteNo || "",
      FieldBoyID: payload.FieldBoy || "",
      FromDate: payload.FromDate,
      ToDate: payload.ToDate,
      Type: payload.Type || "All",
    };

    setLoading(true);
    try {
      const res = await axiosInstance.post(
        "SRA/RecievePageBatchSearch",
        payloadData,
      );
      const ok = res?.data?.success ?? res?.data?.Success;
      const message = res?.data?.message ?? res?.data?.Message ?? [];

      if (Array.isArray(message) && message.length > 0) {
        setLogisticReceiveData(message);
      } else if (ok && Array.isArray(message)) {
        setLogisticReceiveData([]);
        toast.error("No records found.");
      } else {
        setLogisticReceiveData([]);
        toast.error(
          typeof message === "string" && message.trim()
            ? message
            : "No records found.",
        );
      }
    } catch (err) {
      console.error("Search failed", err);
      setLogisticReceiveData([]);
      toast.error(err?.response?.data?.message || "Search failed.");
    } finally {
      setLoading(false);
    }
  };

  const typeOptions = [
    { label: "All", value: "All" },
    { label: "Accepted", value: "Accepted" },
    { label: "Not Accepted", value: "NAccepted" },
  ];

  const viewDispatchDetail = async (batchNo) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/fill-by-dispatch", {
        dispatchCode: batchNo,
      });
      const message = res.data?.message ?? res.data?.Message ?? [];
      if (Array.isArray(message)) {
        setBatchDetail(message);
        setRemovedBatchDetail([]);
      } else if (message && typeof message === "object") {
        setBatchDetail(message.Active ?? message.active ?? message.Items ?? message.items ?? []);
        setRemovedBatchDetail(message.Removed ?? message.removed ?? []);
      } else {
        setBatchDetail([]);
        setRemovedBatchDetail([]);
        toast.error(typeof message === "string" ? message : "No records found.");
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceive = async (batchNo) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/UpdateBatchStatusRecieve", {
        BatchNo: batchNo,
      });
      const data = res.data;
      if (data?.success) {
        const payloadMsg = data?.message;
        const removedCount =
          payloadMsg?.RemovedCount ??
          payloadMsg?.removedCount ??
          (Array.isArray(payloadMsg?.RemovedSamples)
            ? payloadMsg.RemovedSamples.length
            : 0);
        const removedSamples =
          payloadMsg?.RemovedSamples ?? payloadMsg?.removedSamples ?? [];

        toast.success(
          payloadMsg?.Message ||
            (typeof payloadMsg === "string" ? payloadMsg : "Batched Received"),
        );

        if (removedCount > 0) {
          setRemovedAlert({
            open: true,
            batchNo: batchNo || "",
            count: removedCount,
            samples: Array.isArray(removedSamples) ? removedSamples : [],
          });
        }

        handleSearch();
      } else {
        toast.error(
          typeof data?.message === "string"
            ? data.message
            : data?.message?.Message || "Batch status received failed",
        );
      }
    } catch (err) {
      console.error("Batch status received failed", err);
    } finally {
      setLoading(false);
    }
  };

   const printReport = async (dispatchCode) => {
    setPrintLoading(dispatchCode);
    try {
      const res = await axiosReport.post("commonReports/DispatchSampleReport",
        {
          dispatchCode: dispatchCode,
        },
        { responseType: "blob" }
      );
      if (res?.status === 200) {
        const file = new Blob([res.data], { type: "application/pdf" });
        const fileURL = window.URL.createObjectURL(file);
        window.open(fileURL, "_blank");
      } else {
        toast.error(res?.data?.message || "Failed to print report");
      }
    } catch (error) {
      console.error("Failed to print report", error);
    } finally {
      setPrintLoading(null)
    }
  }

  return (
    <>
      <Accordion
        name={t("Logistic Sample Receive")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 px-2 py-2">
          <div className="col-12">
            <div className="row gap-3 justify-content-start d-flex align-items-center">

              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={allCentre}
                  name="FromCentre"
                  lable={t("From Centre")}
                  id="FromCentre"
                  removeIsClearable={true}
                  placeholderName={t("From Centre")}
                  value={payload.FromCentre}
                  onChange={handleSelectChange}
                  isDisabled={loading || allCentre.length === 0}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-2 my-1">
                <Input
                  id="BatchNo"
                  className="select-input-box form-control form-control-sm"
                  type="text"
                  name="BatchNo"
                  maxLength={20}
                  lable="Batch Number"
                  value={payload.BatchNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <Input
                  id="RouteNo"
                  className="select-input-box form-control form-control-sm"
                  type="text"
                  name="RouteNo"
                  maxLength={20}
                  lable="Route No"
                  value={payload.RouteNo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={fieldBoyOptions}
                  name="FieldBoy"
                  lable={t("Field Boy")}
                  id="FieldBoy"
                  removeIsClearable={true}
                  placeholderName={t("Field Boy")}
                  value={payload.FieldBoy}
                  onChange={handleSelectChange}
                  isDisabled={loading || fieldBoyOptions.length === 0}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="FromDate"
                  placeholder=" "
                  id="FromDate"
                  lable="From Date"
                  value={payload.FromDate ? new Date(payload.FromDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <DatePicker
                  className="custom-calendar"
                  name="ToDate"
                  placeholder=" "
                  id="ToDate"
                  lable="To Date"
                  value={payload.ToDate ? new Date(payload.ToDate) : null}
                  onChange={handleDateSelect}
                />
              </div>
              <div className="col-12 col-sm-6 col-md-2 my-1">
                <ReactSelect
                  dynamicOptions={typeOptions}
                  name="Type"
                  lable={t("Type")}
                  id="Type"
                  removeIsClearable={true}
                  placeholderName={t("Type")}
                  value={payload.Type}
                  onChange={handleSelectChange}
                  isDisabled={loading || typeOptions.length === 0}
                />
              </div>

              <div className="col-12 col-sm-6 col-md-1 d-flex">
                {loading ? (
                  <Loading />
                ) : (
                  <SearchButton
                  text={"Search"}
                  className="text-white"
                  onClick={handleSearch}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      <Accordion defaultValue={true} title={t("")}>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div className="table-responsive" style={{ width: "100%" }}>
                {logisticReceiveData.length > 0 ? (
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">{t("#")}</th>
                        <th scope="col">{t("From Centre")}</th>
                        <th scope="col">{t("Batch No.")}</th>
                        <th scope="col">{t("Vials Qty.")}</th>
                        <th scope="col">{t("Field Boy")}</th>
                        <th scope="col">{t("Courier Detail")}</th>
                        <th scope="col">{t("Docker No.")}</th>
                        <th scope="col">{t("Status")}</th>
                        <th scope="col">{t("Send Date")}</th>
                        <th scope="col">{t("View")}</th>
                        <th scope="col">{t("Action")}</th>
                        <th scope="col">{t("Print")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {logisticReceiveData.map((row, idx) => {
                        const statusColor =
                          row.Status === "Transferred"
                            ? "text-success"
                            : row.Status === "Recieved"
                              ? "text-warning"
                              : "text-primary";

                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td data-title={t("From Centre")}>
                              {t(row.FromCentre)}
                            </td>
                            <td data-title={t("Batch No.")}>
                              {t(row.dispatchcode)}
                            </td>
                            <td data-title={t("Vials Qty.")}>
                              {t(row.Quantity)}
                            </td>
                            <td data-title={t("Field Boy")}>
                              {t(row.PickUpFieldBoy)}
                            </td>
                            <td data-title={t("Courier Detail")}>
                              {t(row.CourierDetail)}
                            </td>
                            <td data-title={t("Docker No.")}>
                              {t(row.CourierDocketNo)}
                            </td>
                            <td
                              data-title={t("Status")}
                              className={statusColor}
                            >
                              {t(row.Status)}
                            </td>
                            <td data-title={t("Send Date")}>
                              {t(row.SendDate)}
                            </td>
                            <td data-title={t("View")}>
                              <FontAwesomeIcon
                                icon={faSearch}
                                className="text-info cursor-pointer"
                                onClick={() => {
                                  setViewBatchNo(row.dispatchcode);
                                  viewDispatchDetail(row.dispatchcode);
                                  setShowLogisticSampleViewModal(true);
                                }}
                              />
                            </td>
                            <td data-title={t("Action")}>
                              {row.Status === "Transferred" ? (
                                <span
                                  className="text-link text-primary"
                                  style={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleReceive(row.dispatchcode)
                                  }
                                >
                                  {t("Receive")}
                                </span>
                              ) : (
                                <span>{""}</span>
                              )}
                            </td>
                            <td>
                          <button
                            className="text-white"
                            onClick={() => printReport(row.dispatchcode)}
                            disabled={printLoading === row.dispatchcode}
                          >
                            {printLoading === row.dispatchcode ? (
                              <FontAwesomeIcon icon={faSpinner} spin />
                            ) : (
                              <FontAwesomeIcon icon={faPrint} />
                            )}
                          </button>
                        </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>

      <LogisticSampleViewModal
        show={showLogisticSampleViewModal}
        handleClose={() => {
          setShowLogisticSampleViewModal(false);
          setRemovedBatchDetail([]);
          setViewBatchNo("");
        }}
        rows={batchDetail}
        removedRows={removedBatchDetail}
        batchNo={viewBatchNo}
      />

      <Dialog
        header={
          removedAlert.batchNo
            ? `${t("Remove Test Info")} - ${t("Batch No")}: ${removedAlert.batchNo}`
            : t("Remove Test Info")
        }
        visible={removedAlert.open}
        onHide={() =>
          setRemovedAlert({ open: false, batchNo: "", count: 0, samples: [] })
        }
        className={theme || ""}
        style={{ width: isMobile ? "95vw" : "480px" }}
        closable
      >
        <p>
          {removedAlert.count}{" "}
          {t("sample(s) were removed from this batch before receive.")}
        </p>
        {removedAlert.samples.length > 0 && (
          <div>
            {removedAlert.samples.map((r, idx) => (
              <div key={idx} className="mb-2">
                <div>
                  <strong>{r.BarcodeNo || "-"}</strong>{" "}
                  {r.InvestigationName || r.Test || r.SampleTypeName || ""}
                </div>
                <div className="text-muted" style={{ fontSize: "12px" }}>
                  {t("Removed By")}: {r.RemovedByName || r.removedByName || "-"}
                  {" · "}
                  {t("Reason")}:{" "}
                  {r.RemoveReason || r.removeReason || r.Remarks || "-"}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3">
          <CancelButton
            text={t("Close")}
            onClick={() =>
              setRemovedAlert({ open: false, batchNo: "", count: 0, samples: [] })
            }
          />
        </div>
      </Dialog>
    </>
  );
};

export default LogisticSampleReceive;
