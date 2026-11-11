import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "@app/utils/axiosInstance";
import { apiUrls } from "@app/utils/apiUrls";
import "./EquipmentScanPage.css";

const get = (obj, ...keys) => {
  if (!obj) return "";
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "") {
      return obj[k];
    }
  }
  return "";
};

const formatDatesInText = (str) => {
  if (!str) return "—";
  // Convert YYYY-MM-DD inside strings (e.g. "AMC till 2027-09-01") to "01 Sep 2027"
  return str.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, (_, y, m, d) => {
    const dt = new Date(`${y}-${m}-${d}T00:00:00`);
    if (isNaN(dt.getTime())) return `${d}-${m}-${y}`;
    return dt.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  });
};

export default function EquipmentScanPage() {
  const { hash } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hash) {
      setError("Invalid QR code.");
      setLoading(false);
      return;
    }
    axiosInstance
      .get(`${apiUrls.GetEquipmentByHash}?hash=${encodeURIComponent(hash)}`)
      .then((res) => {
        if (res?.data?.success) {
          setData(res.data.message);
        } else {
          setError(res?.data?.message || "Equipment not found.");
        }
      })
      .catch(() => setError("Unable to load equipment details."))
      .finally(() => setLoading(false));
  }, [hash]);

  if (loading) {
    return (
      <div className="scanphone-shell">
        <div className="scanphone">
          <div className="shead">Equipment Summary</div>
          <div className="scanphone-spinner" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="scanphone-shell">
        <div className="scanphone">
          <div className="shead">Equipment Summary</div>
          <div className="scanphone-error">
            <p>{error || "Equipment not found."}</p>
          </div>
        </div>
      </div>
    );
  }

  const code = get(data, "equipmentCode", "EquipmentCode", "code") || "—";
  const name = get(data, "equipmentName", "EquipmentName", "name") || "—";
  const serial = get(data, "serialNumber", "SerialNumber", "serial") || "—";
  const centre = get(data, "centreName", "CentreName", "centre") || "—";
  const status = get(data, "status", "Status") || "Active";
  const contract = formatDatesInText(
    get(data, "contract", "Contract", "contractInfo", "ContractInfo", "amc") || "No contract"
  );
  const calibration = formatDatesInText(
    get(data, "calibration", "Calibration", "calibrationInfo", "CalibrationInfo", "cal") || "Not scheduled"
  );
  const criticality = get(data, "criticality", "Criticality", "crit") || "Medium";

  const rows = [
    { label: "Code", value: code },
    { label: "Name", value: name },
    { label: "Serial No.", value: serial },
    { label: "Centre", value: centre },
    { label: "Status", value: status },
    { label: "Contract", value: contract },
    { label: "Calibration", value: calibration },
    { label: "Criticality", value: criticality },
  ];

  return (
    <div className="scanphone-shell">
      <div className="scanphone">
        <div className="shead">Equipment Summary</div>

        {rows.map((r, i) => (
          <div className="srow" key={i}>
            <span className="muted">{r.label}</span>
            <b>{r.value}</b>
          </div>
        ))}

        <div className="scanphone-act">
          <a
            href={`mailto:support@labrox.com?subject=Problem with Equipment ${code}&body=Equipment: ${name}%0ACode: ${code}%0ASerial: ${serial}%0ACentre: ${centre}%0A%0ADescribe the problem:%0A`}
            className="scanphone-btn"
          >
            Report a problem
          </a>
        </div>
      </div>

      {/* <div className="scanphone-branding">EQUIPTRACK · LIMS</div> */}
    </div>
  );
}
