import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import moment from "moment";

import Tables from "../../components/UI/customTable";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import {
  CancelButton,
  CustomButton,
  SearchButton,
} from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import "./PendingBarcodeModal.css";

const defaultFromDate = () =>
  moment().subtract(7, "days").startOf("day").toDate();
const defaultToDate = () => moment().endOf("day").toDate();

const PendingBarcodeModal = ({
  show,
  handleClose,
  centerId,
  batchNo,
  transferToOptions = [],
  allCenter = "0",
  onCenterChange,
  onAllCenterChange,
  fetchPendingBatches,
  onAddedToBatch,
}) => {
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  // key = `${barcodeno}||${TestID}` so each test under a barcode can be ticked/unticked independently
  const [selected, setSelected] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedCentre, setSelectedCentre] = useState("");
  const [dateFilter, setDateFilter] = useState({
    fromDate: defaultFromDate(),
    toDate: defaultToDate(),
  });

  const [t] = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const rowsArray = Array.isArray(rows) ? rows : [];
  const centreOptions = Array.isArray(transferToOptions)
    ? transferToOptions
    : [];

  const rowKey = (row, idx) => {
    const testId = row?.TestID ?? row?.testID ?? row?.testid ?? "";
    const barcode = row?.barcodeno ?? row?.BarcodeNo ?? "";
    return testId ? `${barcode}||${testId}` : `${barcode}||${idx}`;
  };

  const getCentreLabel = (row) =>
    row?.CentreName ||
    row?.BookingCentre ||
    row?.centreName ||
    row?.bookingCentre ||
    t("Unknown Centre");

  const groupedRows = useMemo(() => {
    const map = new Map();
    rowsArray.forEach((row, idx) => {
      const centre = getCentreLabel(row);
      if (!map.has(centre)) map.set(centre, []);
      map.get(centre).push({ row, idx });
    });
    return Array.from(map.entries());
  }, [rowsArray, t]);

  const resolveDefaultCentre = () => {
    const mainCentre =
      centerId != null && centerId !== "" ? String(centerId) : "";
    if (
      mainCentre &&
      centreOptions.some((opt) => String(opt.value) === mainCentre)
    ) {
      return mainCentre;
    }
    return centreOptions.length > 0 ? String(centreOptions[0].value) : "";
  };

  const fetchPendingList = async ({
    fromDate = dateFilter.fromDate,
    toDate = dateFilter.toDate,
    toCentreID = selectedCentre || centerId,
    allCentreFlag = allCenter,
  } = {}) => {
    setListLoading(true);
    setSelected(new Set());
    setSelectAll(false);
    try {
      const isAll = String(allCentreFlag) === "1";
      const res = await axiosInstance.post("SRA/GetTransferPendingList", {
        fromDate: moment(fromDate).format("YYYY-MM-DD"),
        toDate: moment(toDate).format("YYYY-MM-DD"),
        toCentreID: isAll ? null : Number(toCentreID || 0) || null,
        allCentre: isAll ? "1" : "0",
      });
      const data = res?.data?.message;
      setRows(Array.isArray(data) ? data : []);
      if (!res?.data?.success && !Array.isArray(data)) {
        toast.info(res?.data?.message || "No pending barcodes.");
      }
    } catch (err) {
      console.error("Failed to fetch pending barcodes", err);
      setRows([]);
      toast.error(
        err?.response?.data?.message || "Failed to fetch pending barcodes",
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setSelected(new Set());
      setSelectAll(false);
      setRows([]);
      return;
    }
    const from = defaultFromDate();
    const to = defaultToDate();
    const defaultCentre = resolveDefaultCentre();
    setDateFilter({ fromDate: from, toDate: to });
    setSelectedCentre(defaultCentre);
    fetchPendingList({
      fromDate: from,
      toDate: to,
      toCentreID: defaultCentre,
      allCentreFlag: allCenter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    if (!show || centreOptions.length === 0) return;
    const defaultCentre = resolveDefaultCentre();
    if (
      !selectedCentre ||
      !centreOptions.some((o) => String(o.value) === String(selectedCentre))
    ) {
      setSelectedCentre(defaultCentre);
    }
  }, [show, transferToOptions, centerId]);

  useEffect(() => {
    if (selectAll && rowsArray.length) {
      setSelected(new Set(rowsArray.map((r, i) => rowKey(r, i))));
    }
  }, [rows, selectAll]);

  const handleDateSelect = (...args) => {
    const date = args[0];
    const fieldName = args[1];
    setDateFilter((prev) => ({
      ...prev,
      [fieldName]: date ? new Date(date) : null,
    }));
  };

  const handleCentreChange = (name, option) => {
    const value = option?.value != null ? String(option.value) : "";
    setSelectedCentre(value);
    if (onCenterChange) {
      onCenterChange(name, option);
    }
  };

  const handleAllCentreChange = (e) => {
    if (onAllCenterChange) {
      onAllCenterChange(e);
    }
  };

  const handleSearch = () => {
    if (!dateFilter.fromDate || !dateFilter.toDate) {
      return toast.error(t("Please select From Date and To Date"));
    }
    if (
      moment(dateFilter.fromDate).isAfter(moment(dateFilter.toDate), "day")
    ) {
      return toast.error(t("From Date cannot be greater than To Date"));
    }
    fetchPendingList({
      fromDate: dateFilter.fromDate,
      toDate: dateFilter.toDate,
      toCentreID: selectedCentre || centerId,
      allCentreFlag: allCenter,
    });
  };

  const toggleSelect = (key) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(key)) s.delete(key);
      else s.add(key);
      setSelectAll(rowsArray.length > 0 && s.size === rowsArray.length);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelected(new Set(rowsArray.map((r, i) => rowKey(r, i))));
      setSelectAll(true);
    }
  };

  const handleAddToBatch = async () => {
    const toCentre = selectedCentre || centerId;
    if (!batchNo) {
      return toast.error("Batch number is required.");
    }
    if (!toCentre && toCentre !== 0) {
      return toast.error("Center is required.");
    }

    if (selected.size === 0) {
      return toast.error("Please select at least one test to add.");
    }

    const byBarcode = {};
    rowsArray.forEach((row, idx) => {
      const key = rowKey(row, idx);
      if (!selected.has(key)) return;
      const barcode = String(row?.barcodeno ?? row?.BarcodeNo ?? "");
      const testId = String(row?.TestID ?? row?.testID ?? row?.testid ?? "");
      if (!barcode) return;
      if (!byBarcode[barcode]) byBarcode[barcode] = [];
      if (testId) byBarcode[barcode].push(testId);
    });

    const payload = Object.entries(byBarcode).map(([barcode, testIds]) => ({
      batchNo: String(batchNo),
      barcodeNo: String(barcode),
      toCentreID: Number(toCentre),
      ...(testIds.length > 0 ? { testIds } : {}),
    }));

    if (payload.length === 0) {
      return toast.error("Please select at least one test to add.");
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post("SRA/SampleSearchBatch", payload);
      if (res.data.success) {
        toast.success(res.data.message);
        handleClose();
        if (fetchPendingBatches) {
          fetchPendingBatches();
        }
        if (onAddedToBatch) {
          onAddedToBatch(batchNo);
        }
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      console.error("Add to batch failed", err);
      toast.error(err?.response?.data?.message || "Add to batch failed");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div
      className="d-flex justify-content-end align-items-center"
      style={{ gap: "16px" }}
    >
      <CancelButton text={t("Cancel")} onClick={handleClose} disabled={loading} />
      <CustomButton
        text={loading ? t("Adding..") : t("Add to batch")}
        onClick={handleAddToBatch}
        disabled={loading || selected.size === 0}
        variant="danger"
      />
    </div>
  );

  let serialNo = 0;

  return (
    <Dialog
      visible={show}
      onHide={handleClose}
      header={t("Pending Barcode List")}
      className={theme}
      style={{ width: isMobile ? "95vw" : "80vw" }}
      contentStyle={{ minHeight: isMobile ? "62vh" : "70vh" }}
      footer={footer}
    >
      <div className="row pt-2 px-2 pb-2 align-items-end">
        <div className="col-sm-3 mb-1">
          <ReactSelect
            dynamicOptions={centreOptions}
            name="center"
            lable={t("Transfer To")}
            id="pendingCenter"
            removeIsClearable={true}
            placeholderName={t("Transfer To")}
            value={selectedCentre}
            onChange={handleCentreChange}
            isDisabled={centreOptions.length === 0 || String(allCenter) === "1"}
          />
        </div>
        <div
          className="col-sm-auto mb-1 d-flex align-items-center"
          style={{ height: "38px", gap: "8px" }}
        >
          <input
            id="pendingAllCentres"
            type="checkbox"
            name="pendingAllCentres"
            className="form-check-input m-0"
            style={{ width: "16px", height: "16px", cursor: "pointer" }}
            checked={String(allCenter) === "1"}
            onChange={handleAllCentreChange}
          />
          <label
            htmlFor="pendingAllCentres"
            className="mb-0 text-nowrap"
            style={{ fontSize: "12px", lineHeight: 1, cursor: "pointer" }}
          >
            {t("All Centre")}
          </label>
        </div>
        <div className="col-sm-2 mb-1">
          <DatePicker
            className="custom-calendar"
            name="fromDate"
            placeholder=" "
            id="pendingFromDate"
            lable={t("From Date")}
            value={dateFilter.fromDate}
            onChange={handleDateSelect}
          />
        </div>
        <div className="col-sm-2 mb-1">
          <DatePicker
            className="custom-calendar"
            name="toDate"
            placeholder=" "
            id="pendingToDate"
            lable={t("To Date")}
            value={dateFilter.toDate}
            onChange={handleDateSelect}
          />
        </div>
        <div className="col-sm-auto mb-1">
          <SearchButton
            text={t("Search")}
            onClick={handleSearch}
            loading={listLoading}
            disabled={listLoading}
          />
        </div>
      </div>

      <div className="row gx-3 gy-3 px-2">
        <div className="card w-100">
          <div className="card-body p-2">
            <div
              className="table-responsive pending-barcode-table-wrap"
              style={{
                minHeight: "280px",
                maxHeight: "52vh",
                overflowY: "auto",
              }}
            >
              <Tables
                className="table table-sm mb-0 p-2"
                style={{
                  whiteSpace: "normal",
                  maxHeight: "52vh",
                }}
                removeScrollOverFlow={true}
              >
                <thead>
                  <tr>
                    <th scope="col" className="col-sno">
                      {t("S.No.")}
                    </th>
                    <th scope="col" className="col-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectAll}
                        onChange={toggleSelectAll}
                        disabled={listLoading || rowsArray.length === 0}
                        title={selectAll ? t("Deselect All") : t("Select All")}
                      />
                    </th>
                    <th scope="col">{t("Barcode")}</th>
                    <th scope="col">{t("Patient Name")}</th>
                    <th scope="col">{t("Test")}</th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-3">
                        {t("Loading...")}
                      </td>
                    </tr>
                  ) : rowsArray.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-3">
                        {t("No pending barcodes.")}
                      </td>
                    </tr>
                  ) : (
                    groupedRows.map(([centreName, items]) => (
                      <React.Fragment key={`centre-${centreName}`}>
                        <tr className="centre-group-row">
                          <td colSpan={5}>
                            {t("Centre")}: {centreName}
                            <span className="centre-group-meta">
                              ({items.length} {t("sample(s)")})
                            </span>
                          </td>
                        </tr>
                        {items.map(({ row, idx }) => {
                          const key = rowKey(row, idx);
                          const isChecked = selected.has(key);
                          serialNo += 1;
                          return (
                            <tr
                              key={key}
                              onClick={() => toggleSelect(key)}
                              style={{
                                cursor: "pointer",
                                background: isChecked ? "#e8f1ff" : undefined,
                              }}
                            >
                              <td data-title={t("S.No.")} className="col-sno">
                                {serialNo}
                              </td>
                              <td
                                data-title={t("Select")}
                                className="col-check"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={isChecked}
                                  onChange={() => toggleSelect(key)}
                                />
                              </td>
                              <td data-title={t("Barcode")}>
                                {row.barcodeno}
                              </td>
                              <td data-title={t("Patient Name")}>
                                {row.pname}
                              </td>
                              <td data-title={t("Test")}>
                                {row.TestCode || row.testCode
                                  ? `${row.TestCode || row.testCode} - ${row.TestName || row.testName || ""}`
                                  : row.TestName || row.testName || ""}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </Tables>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PendingBarcodeModal;
