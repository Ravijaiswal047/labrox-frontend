import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Dialog } from "primereact/dialog";
import { axiosInstance } from "../../utils/axiosInstance";
import { notify } from "../../utils/utils";
import { ExportToExcel } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ExcelPreviewHandler from "../utils/ExcelImport/ExcelPreviewHandler";
import { useDispatch, useSelector } from "react-redux";
import {
  setImportExcelData,
  setLoading,
} from "../../store/reducers/loadingSlice/loadingSlice";

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const downloadOptList = [
  { label: "InvestigationWise", value: "InvestigationWise" },
  { label: "RateTypeWise",      value: "RateTypeWise"      },
];

const ScheduleRateListImportModal = ({ RateCentres = [], ItemList = [] }) => {
  const theme    = useLocalStorage("theme", "get");
  const dispatch = useDispatch();
  const { importExcelData } = useSelector((s) => s?.loadingSlice);

  const [open, setOpen] = useState(false);

  const initPayload = { downlaodOption: downloadOptList[0].value, rateList: "", Investigation: "" };
  const [payload,    setPayload]    = useState(initPayload);
  const [tableData,  setTableData]  = useState([]);
  const [tableLoad,  setTableLoad]  = useState(false);
  const [headerRate, setHeaderRate] = useState("");

  // reset on close
  const handleClose = () => {
    setOpen(false);
    setPayload(initPayload);
    setTableData([]);
    setHeaderRate("");
  };

  // ── Fetch rate list ─────────────────────────────────────────────────────────
  const fetchRateList = (typeName, typeID) => {
    if (!typeID) return;
    setTableLoad(true);
    setTableData([]);
    setHeaderRate("");
    axiosInstance
      .post("ScheduleRateList/GetRateListWithType", { typeName, typeID })
      .then((res) => {
        const data = res?.data?.message;
        if (Array.isArray(data) && data.length > 0) {
          setTableData(data.map((r) => ({ ...r, isActive: "0" })));
        } else {
          notify("No records found for selected type", "warn");
        }
      })
      .catch((err) => notify(err?.response?.data?.message || "Failed to load", "error"))
      .finally(() => setTableLoad(false));
  };

  const handleOptionChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value, rateList: "", Investigation: "" }));
    setTableData([]);
    setHeaderRate("");
  };

  const handleSecondaryChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
    fetchRateList(payload?.downlaodOption, e?.value);
  };

  // ── Download Template ───────────────────────────────────────────────────────
  const handleDownload = () => {
    const typeID = payload?.downlaodOption === "RateTypeWise" ? payload?.rateList : payload?.Investigation;
    if (!payload?.downlaodOption) { notify("Select Download Option", "warn"); return; }
    if (!typeID) { notify("Select " + (payload?.downlaodOption === "RateTypeWise" ? "Rate Type" : "Investigation"), "warn"); return; }

    dispatch(setLoading(true));
    axiosInstance
      .post("ScheduleRateList/GetRateListWithType", { typeName: payload?.downlaodOption, typeID })
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          const list    = payload?.downlaodOption === "RateTypeWise" ? RateCentres : ItemList;
          const found   = list.find((x) => String(x.value) === String(typeID));
          let fileName  = (found?.label || "RateList").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
          ExportToExcel(res?.data?.message, `${fileName}.xlsx`, ["FromDate", "ToDate"]);
          notify("Downloaded successfully", "success");
        } else {
          notify("No data to download", "warn");
        }
      })
      .catch((err) => notify(err?.response?.data?.message || "Download failed", "error"))
      .finally(() => dispatch(setLoading(false)));
  };

  // ── Table helpers ───────────────────────────────────────────────────────────
  const handleSelectAll = (e) =>
    setTableData((prev) => prev.map((r) => ({ ...r, isActive: e.target.checked ? "1" : "0" })));

  const handleRowCheck = (row) =>
    setTableData((prev) => prev.map((r) => (r === row ? { ...r, isActive: r.isActive === "1" ? "0" : "1" } : r)));

  const handleRateChange = (e, row) =>
    setTableData((prev) => prev.map((r) => (r === row ? { ...r, Rate: e.target.value } : r)));

  const handleHeaderRate = (e) => {
    const val = e.target.value;
    setHeaderRate(val);
    setTableData((prev) => prev.map((r) => (r.isActive === "1" ? { ...r, Rate: val } : r)));
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const selected = tableData.filter((r) => r.isActive === "1");

    if (selected.length > 0) {
      const invalid = selected.filter(
        (r) => r.Rate === "" || Number(r.Rate) < Number(r.BaseRate) || Number(r.Rate) > Number(r.MaxRate)
      );
      if (invalid.length) {
        setTableData((prev) =>
          prev.map((r) => ({ ...r, isInvalid: selected.includes(r) && invalid.includes(r) }))
        );
        notify("Rate must be within Base Rate and Max Rate range", "error");
        return;
      }

      const typeID = payload?.downlaodOption === "RateTypeWise" ? payload?.rateList : payload?.Investigation;
      dispatch(setLoading(true));
      try {
        const res = await axiosInstance.post("ScheduleRateList/SaveRateList", {
          obj: { typeName: payload?.downlaodOption, typeID },
          data: selected.map((r) => ({
            rateTypeID:   r?.CentreID ?? 0,
            rateTypeCode: r?.TestCode ?? "",
            rateTypeName: r?.Centre ?? "",
            testID:       r?.InvestigationID ?? 0,
            testCode:     r?.TestCode ?? "",
            testName:     r?.TestName ?? "",
            rate:         Number(r?.Rate ?? 0),
          })),
        });
        notify(res?.data?.message || "Saved successfully", "success");
        fetchRateList(payload?.downlaodOption, typeID);
      } catch (err) {
        notify(err?.response?.data?.message || "Save failed", "error");
      } finally {
        dispatch(setLoading(false));
      }
      return;
    }

    // fallback: Excel import data
    if (!importExcelData?.length) { notify("Select rows from the list or import an Excel file", "warn"); return; }
    const excelTypeID = payload?.downlaodOption === "RateTypeWise" ? payload?.rateList : payload?.Investigation;
    dispatch(setLoading(true));
    try {
      const res = await axiosInstance.post("ScheduleRateList/SaveRateList", {
        obj: { typeName: payload?.downlaodOption, typeID: excelTypeID },
        data: importExcelData.map((r) => ({
          ...r,
          FromDate: r.FromDate ? formatDate(r.FromDate) : "",
          ToDate:   r.ToDate   ? formatDate(r.ToDate)   : "",
        })),
      });
      notify(res?.data?.message || "Saved successfully", "success");
      dispatch(setImportExcelData([]));
      setPayload(initPayload);
    } catch (err) {
      notify(err?.response?.data?.message || "Save failed", "error");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const allChecked  = tableData.length > 0 && tableData.every((r) => r.isActive === "1");
  const anySelected = tableData.some((r) => r.isActive === "1");

  return (
    <>
      {/* Trigger button — same style as ImportExcelToUpload */}
      <div className="d-flex justify-content-end">
        <Button onClick={() => setOpen(true)} className="mx-2 rounded px-4">
          <i className="bi bi-file-earmark-excel-fill mb-0 mr-2" style={{ color: "white" }}></i>
          Import File
        </Button>
      </div>

      <Dialog
        header="Import Excel to Upload"
        visible={open}
        onHide={handleClose}
        className={`${theme}`}
        style={{ width: "80vw" }}
        breakpoints={{ "98%": "79vw" }}
      >
        {/* ── Filter row ── */}
        <div className="row mt-2 align-items-end">
          <div className="col-sm-3">
            <ReactSelect
              dynamicOptions={downloadOptList}
              isShowBorder={true}
              name="downlaodOption"
              lable="Download Option"
              id="downlaodOption"
              removeIsClearable={false}
              placeholderName="Download Option"
              value={payload?.downlaodOption}
              onChange={handleOptionChange}
              className="required-fields"
            />
          </div>

          {payload?.downlaodOption !== "RateTypeWise" && (
            <div className="col-sm-3">
              <ReactSelect
                dynamicOptions={ItemList}
                id="Investigation"
                placeholderName="Investigation"
                name="Investigation"
                value={payload?.Investigation}
                onChange={handleSecondaryChange}
                searchable={true}
                removeIsClearable={true}
              />
            </div>
          )}

          {payload?.downlaodOption === "RateTypeWise" && (
            <div className="col-sm-3">
              <ReactSelect
                dynamicOptions={RateCentres}
                id="RateTypeImport"
                placeholderName="Rate Type"
                name="rateList"
                value={payload?.rateList}
                onChange={handleSecondaryChange}
                searchable={true}
                removeIsClearable={true}
              />
            </div>
          )}

          <div className="d-flex align-items-center mb-2" style={{ gap: "4px" }}>
            <Button onClick={handleDownload} className="rounded">
              Download Template
            </Button>
          </div>

          <div className="d-flex justify-content-end mb-2 align-items-center grow mx-2" style={{ gap: "4px" }}>
            <ExcelPreviewHandler />
          </div>
        </div>

        {/* ── Date format note ── */}
        <div className="d-flex align-items-start mb-2" style={{ gap: "6px", fontSize: "12px", color: "#6c757d" }}>
          <i className="bi bi-info-circle mt-1"></i>
          <span>
            <b>Note:</b> Enter <b>FromDate</b> / <b>ToDate</b> in <b>YYYY-MM-DD</b> format (e.g. 2026-07-07).
            Excel adds a trailing <b>*</b> to date cells by default — this is normal, leave it as is; it will be ignored during import.
          </span>
        </div>

        {/* ── Rate List Table ── */}
        {/* {tableLoad ? (
          <div className="d-flex justify-content-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status" />
          </div>
        ) : tableData.length > 0 ? (
          <div className="mt-3">
            <Tables style={{ maxHeight: "340px", overflowY: "auto" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                <tr>
                  <th>#</th>
                  <th>Centre</th>
                  <th>Test Name</th>
                  <th>Code</th>
                  <th>Base Rate</th>
                  <th>Max Rate</th>
                  <th>
                    <div>Rate</div>
                    <Input
                      type="number"
                      value={headerRate}
                      placeholder="0.00"
                      onChange={handleHeaderRate}
                      disabled={!anySelected}
                    />
                  </th>
                  <th>Billing Category</th>
                  <th>
                    <input type="checkbox" checked={allChecked} onChange={handleSelectAll} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => (
                  <tr key={i}>
                    <td data-title="#">{i + 1}</td>
                    <td data-title="Centre">{row?.Centre}&nbsp;</td>
                    <td data-title="Test Name">{row?.TestName}&nbsp;</td>
                    <td data-title="Code">{row?.TestCode}&nbsp;</td>
                    <td data-title="Base Rate">{row?.BaseRate}&nbsp;</td>
                    <td data-title="Max Rate">{row?.MaxRate}&nbsp;</td>
                    <td data-title="Rate">
                      {row.isActive === "1" ? (
                        <Input
                          type="number"
                          name="Rate"
                          value={parseInt(row?.Rate) || ""}
                          onChange={(e) => handleRateChange(e, row)}
                          className={row?.isInvalid ? "required-fields" : ""}
                        />
                      ) : (
                        <>{Number(row?.Rate ?? 0).toFixed(2)}</>
                      )}
                    </td>
                    <td data-title="Billing Category">{row?.BillingCategory}&nbsp;</td>
                    <td data-title="Select">
                      <input type="checkbox" checked={row.isActive === "1"} onChange={() => handleRowCheck(row)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>

          </div>
        ) : null} */}

        {/* ── Save ── */}
        <div className="d-flex border-top py-2 mt-2 justify-content-center align-items-center" style={{ gap: "4px" }}>
          <Button onClick={handleSave} className="rounded px-4">
            Save
          </Button>
        </div>
      </Dialog>
    </>
  );
};

export default ScheduleRateListImportModal;
