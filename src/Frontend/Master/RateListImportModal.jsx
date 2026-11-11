import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Modal from "../../components/formComponent/Modal";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const RateListImportModal = ({ visible, setVisible, RateCentres = [] }) => {
  const [loading,   setLoading]   = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [tableData, setTableData] = useState([]);
  const [headerRate, setHeaderRate] = useState("");
  const [fromDate,  setFromDate]  = useState(new Date());
  const [toDate,    setToDate]    = useState(new Date());
  const [selectedType, setSelectedType] = useState({ label: "", value: 0 });

  useEffect(() => {
    if (!visible) {
      setTableData([]);
      setHeaderRate("");
      setSelectedType({ label: "", value: 0 });
    }
  }, [visible]);

  const fetchRateList = (typeName, typeID) => {
    if (!typeID) return;
    setLoading(true);
    setTableData([]);
    axiosInstance
      .post("ScheduleRateList/GetRateListWithType", { typeName, typeID })
      .then((res) => {
        const data = res?.data?.message;
        if (Array.isArray(data) && data.length > 0) {
          setTableData(data.map((ele) => ({ ...ele, isActive: "0" })));
        } else {
          toast.error("No records found for selected type");
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to load rate list"))
      .finally(() => setLoading(false));
  };

  const handleTypeChange = (_, e) => {
    setSelectedType({ label: e?.label ?? "", value: e?.value ?? 0 });
    setHeaderRate("");
    fetchRateList(e?.label ?? "", e?.value ?? 0);
  };

  const handleCheckbox = (row) => {
    setTableData((prev) =>
      prev.map((r) =>
        r === row ? { ...r, isActive: r.isActive === "1" ? "0" : "1" } : r
      )
    );
  };

  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setTableData((prev) => prev.map((r) => ({ ...r, isActive: checked ? "1" : "0" })));
  };

  const handleRateChange = (e, row) => {
    const val = e.target.value;
    setTableData((prev) => prev.map((r) => (r === row ? { ...r, Rate: val } : r)));
  };

  const handleHeaderRateChange = (e) => {
    const val = e.target.value;
    setHeaderRate(val);
    setTableData((prev) =>
      prev.map((r) => (r.isActive === "1" ? { ...r, Rate: val } : r))
    );
  };

  const validateRates = (selected) => {
    const invalid = selected.filter(
      (r) => r.Rate === "" || Number(r.Rate) < Number(r.BaseRate) || Number(r.Rate) > Number(r.MaxRate)
    );
    return invalid;
  };

  const handleSave = () => {
    const selected = tableData.filter((r) => r.isActive === "1");
    if (!selected.length) { toast.error("Please select at least one item"); return; }

    const invalid = validateRates(selected);
    if (invalid.length) {
      setTableData((prev) =>
        prev.map((r) => ({
          ...r,
          isInvalid: selected.some((s) => s === r) && invalid.some((i) => i === r),
        }))
      );
      toast.error("Rate must be within Base Rate and Max Rate range");
      return;
    }

    setSaving(true);
    axiosInstance
      .post("ScheduleRateList/SaveRateList", {
        data: selected.map((r) => ({
          rateTypeID:   r?.CentreID ?? 0,
          rateTypeCode: r?.TestCode ?? "",
          rateTypeName: r?.Centre ?? "",
          testID:       r?.InvestigationID ?? 0,
          testCode:     r?.TestCode ?? "",
          testName:     r?.TestName ?? "",
          rate:         Number(r?.Rate ?? 0),
          fromDate:     formatDate(fromDate),
          toDate:       formatDate(toDate),
        })),
      })
      .then((res) => {
        toast.success(res?.data?.message || "Saved successfully");
        fetchRateList(selectedType.label, selectedType.value);
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Save failed"))
      .finally(() => setSaving(false));
  };

  const allChecked = tableData.length > 0 && tableData.every((r) => r.isActive === "1");
  const anySelected = tableData.some((r) => r.isActive === "1");

  return (
    <Modal
      visible={visible}
      setVisible={setVisible}
      Header="Rate List by Type"
      modalWidth="90vw"
    >
      {/* ── Filter row ── */}
      <div className="row px-2 py-2 align-items-end" style={{ gap: "0" }}>
        <div className="col-sm-3 col-md-3">
          <ReactSelect
            dynamicOptions={RateCentres}
            id="RateTypeModal"
            placeholderName="Select Rate Type"
            name="RateTypeModal"
            value={selectedType.value}
            onChange={handleTypeChange}
            searchable={true}
            removeIsClearable={true}
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="row p-2">
        <div className="col-12">
          {loading ? (
            <Loading />
          ) : tableData.length > 0 ? (
            <>
              <Tables style={{ maxHeight: "380px", overflowY: "auto" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  <tr>
                    <th>#</th>
                    <th>Centre Name</th>
                    <th>Test Name</th>
                    <th>Item Code</th>
                    <th>Base Rate</th>
                    <th>Max Rate</th>
                    <th>
                      <div>Rate</div>
                      <Input
                        type="number"
                        value={headerRate}
                        placeholder="0.00"
                        onChange={handleHeaderRateChange}
                        disabled={!anySelected}
                      />
                    </th>
                    <th>Billing Category</th>
                    <th>
                      <input
                        type="checkbox"
                        checked={allChecked}
                        onChange={handleSelectAll}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, i) => (
                    <tr key={i}>
                      <td data-title="#">{i + 1}</td>
                      <td data-title="Centre Name">{row?.Centre}&nbsp;</td>
                      <td data-title="Test Name">{row?.TestName}&nbsp;</td>
                      <td data-title="Item Code">{row?.TestCode}&nbsp;</td>
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
                        <input
                          type="checkbox"
                          checked={row.isActive === "1"}
                          onChange={() => handleCheckbox(row)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>

              {/* ── Save section ── */}
              <div className="d-flex align-items-end mt-2" style={{ gap: "8px" }}>
                <div className="col-sm-2">
                  <DatePicker
                    name="fromDate"
                    id="rlFromDate"
                    value={fromDate}
                    onChange={(val) => setFromDate(val)}
                    placeholder=" "
                    lable="From Date"
                  />
                </div>
                <div className="col-sm-2">
                  <DatePicker
                    name="toDate"
                    id="rlToDate"
                    value={toDate}
                    onChange={(val) => setToDate(val)}
                    placeholder=" "
                    lable="To Date"
                    minDate={new Date(fromDate)}
                  />
                </div>
                <div className="mb-2">
                  {saving ? (
                    <Loading />
                  ) : (
                    <button
                      className="btn btn-success btn-sm btn-block"
                      onClick={handleSave}
                      disabled={!anySelected}
                    >
                      Save Selected
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <NoRecordFound />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RateListImportModal;
