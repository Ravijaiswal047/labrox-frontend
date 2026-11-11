import React, { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import Accordion from "../../components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { SearchButton, CustomButton } from "../../components/UI/CustomButton";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Loading from "../../components/loader/Loading";
import { bindCentresForRadiology, getBlockSlotReport } from "./api";

const BlockSlotReport = () => {
  const [centres, setCentres] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreId: "",
  });

  useEffect(() => {
    loadCentres();
  }, []);

  const loadCentres = async () => {
    try {
      const res = await bindCentresForRadiology();
      const data = (res?.data?.message || []).map((c) => ({
        value: c.CentreId ?? c.CentreID,
        label: c.Centre ?? c.CentreName,
      }));
      setCentres([{ value: "", label: "All Centres" }, ...data]);
    } catch {
      toast.error("Failed to load centres.");
    }
  };

  const handleSelect = (name, option) => {
    setForm((prev) => ({ ...prev, [name]: option?.value || "" }));
  };

  const dateSelect = (value, name) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setTableData([]);
    try {
      const res = await getBlockSlotReport({
        FromDate: moment(form.FromDate).format("DD/MMM/YYYY"),
        ToDate: moment(form.ToDate).format("DD/MMM/YYYY"),
        CentreId: form.CentreId || 0,
      });
      const data = res?.data?.message || [];
      if (data.length === 0) toast.info("No blocked slots found.");
      setTableData(data);
    } catch {
      toast.error("Failed to fetch report.");
    } finally {
      setLoading(false);
    }
  };

  const handleExcel = () => {
    if (tableData.length === 0) { toast.warn("No data to export."); return; }
    const headers = ["Centre Name", "Machine Name", "Slot Date", "Slot Time", "Created By", "Entry Date", "Reason"];
    const rows = tableData.map((r) => [r.CentreName, r.MachineName, r.SlotDate, r.SlotTime, r.CreatedBy, r.EntryDate, r.Reason]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BlockSlotReport_${moment().format("DDMMYYYY")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Accordion title="Block Slot Report" defaultValue={true}>
      {/* Criteria */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3">
          <DatePicker
            name="FromDate" id="BSR_FromDate" lable="From Date"
            value={form.FromDate} onChange={dateSelect}
          />
        </div>
        <div className="col-md-3">
          <DatePicker
            name="ToDate" id="BSR_ToDate" lable="To Date"
            value={form.ToDate} onChange={dateSelect}
          />
        </div>
        <div className="col-md-3">
          <ReactSelect
            id="BSR_Centre"
            name="CentreId"
            placeholderName="Centre"
            dynamicOptions={centres}
            value={form.CentreId}
            removeIsClearable
            onChange={handleSelect}
          />
        </div>
        <div className="col-md-3 d-flex gap-2">
          <SearchButton onClick={handleSearch} label="Report" />
          <CustomButton label="Excel" icon="excel" onClick={handleExcel} variant="success" />
        </div>
      </div>

      {/* Title */}
      {tableData.length > 0 && (
        <div
          className="text-center mb-2"
          style={{
            fontWeight: "600", fontSize: "15px", color: "#1e3a5f",
            borderBottom: "2px solid #e2e8f0", paddingBottom: "6px",
          }}
        >
          Block Slot Report &nbsp;|&nbsp; Period From:{" "}
          {moment(form.FromDate).format("DD-MMM-YYYY")} To:{" "}
          {moment(form.ToDate).format("DD-MMM-YYYY")}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <Loading />
      ) : tableData.length > 0 ? (
        <Tables>
          <thead>
            <tr>
              <th>#</th>
              <th>Centre Name</th>
              <th>Machine Name</th>
              <th>Slot Date</th>
              <th>Slot Time</th>
              <th>Created By</th>
              <th>Entry Date</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{row.CentreName}</td>
                <td>{row.MachineName}</td>
                <td>{row.SlotDate}</td>
                <td>{row.SlotTime}</td>
                <td>{row.CreatedBy}</td>
                <td>{row.EntryDate}</td>
                <td>
                  <span
                    className="badge"
                    style={{
                      background: "#fef3c7", color: "#92400e",
                      fontWeight: "500", fontSize: "11px",
                      padding: "3px 8px", borderRadius: "4px",
                    }}
                  >
                    {row.Reason || "Doctor Not Available"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>
      ) : (
        !loading && <NoRecordFound />
      )}
    </Accordion>
  );
};

export default BlockSlotReport;
