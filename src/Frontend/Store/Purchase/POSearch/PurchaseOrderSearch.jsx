import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePicker";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { getBindCentreType, getBindCountry, getBindstate, getPOBindstate, GetPOZoneData, GetZoneData } from "../../../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import ShowItemDetailsPOModal from "./ShowItemDetailsPOModal";
import { PoStatusList } from "../../../../utils/Constants";
import POQuantityEditModal from "./POQuantityEditModal";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { Link } from "react-router-dom";
import PoCLoseModal from "./PoCLoseModal";
import PoRejectModal from "./PoRejectModal";
import PoEmailModal from "./PoEmailModal";
import { parseAwsKeys } from "../../../../utils/helpers";
import PdfPreviewModal from "../../../utils/PdfPreviewModal";
import Loading from "../../../../components/loader/Loading";
import TableFilterDot from "../../../../components/TableFilter/TableFilterDot";
import { Modal, Form } from "react-bootstrap";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const PO_SEARCH_COLUMNS = [
  { header: "S.No.", visible: 1 },
  { header: "View Item", visible: 1 },
  { header: "PO No.", visible: 1 },
  { header: "Location", visible: 1 },
  { header: "Vendor", visible: 1 },
  { header: "Po Type", visible: 1 },
  { header: "Status", visible: 1 },
  { header: "Raised Date", visible: 1 },
  { header: "Gross", visible: 1 },
  { header: "Dis", visible: 1 },
  { header: "Tax", visible: 1 },
  { header: "Net", visible: 1 },
  { header: "Total", visible: 1 },
  { header: "Action Type", visible: 1 },
  { header: "Next Action", visible: 1 },
  { header: "Qty Edit", visible: 1 },
  { header: "PO Close", visible: 1 },
  { header: "PO Reject", visible: 1 },
  { header: "Print", visible: 1 },
  { header: "Pdf Preview", visible: 1 },
  { header: "Mail", visible: 1 },
];

const AMOUNT_HEADERS = ["Gross", "Dis", "Tax", "Net", "Total"];

const getPOStatusColor = (val) => {
  const map = {
    1: "#FFFFFF",
    2: "#90EE90",
    3: "#3399FF",
    4: "#f5b738",
    5: "#CC99FF",
    6: "#00FFFF",
    7: "#B0C4DE",
    8: "#44A3AA",
    9: "#FFC0CB",
  };
  return map[Number(val)] || "#ebebebbf";
};

const toAmt = (value) => {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
};

const getPoAmounts = (row) => {
  const gross = toAmt(row?.Gross ?? row?.GrossTotal);
  const dis = toAmt(row?.Dis ?? row?.DiscountOnTotal);
  const tax = toAmt(row?.Tax ?? row?.TaxAmount);
  const net = Number((gross - dis).toFixed(2));
  return {
    gross,
    dis,
    tax,
    net,
    total: Number((net + tax).toFixed(2)),
  };
};

const formatAmt = (value) => toAmt(value).toFixed(2);

const matchesPoStatus = (row, status) => {
  const selected = Number(status || 0);
  if (!selected) return true;
  if (selected === 8) return Number(row?.IsMail) === 1 || Number(row?.isMail) === 1;
  if (selected === 9) return Number(row?.IsMail) === -1 || Number(row?.isMail) === -1;
  return Number(row?.POStatus) === selected;
};


const PurchaseOrderSearch = () => {
  const { t } = useTranslation();
  const [showItem, setShowItem] = useState({
    modal: false,
    data: "",
    index: -1
  });
  const [showQtyEdit, setShowQtyEdit] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [showClose, setShowClose] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [rejectModal, setRejectModal] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [emailModal, setEmailModal] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });
  const [printLoadingId, setPrintLoadingId] = useState(null);

  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);

    if (!parsedKeys) return;

    setPreviewConfig({
      visible: true,
      url: parsedKeys,
    });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  const [approvalRights, setApprovalRights] = useState({})
  const [allTableData, setAllTableData] = useState([]);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columnConfig, setColumnConfig] = useState(PO_SEARCH_COLUMNS);
  const EmployeeID = useLocalStorage("userData", "get")?.EmployeeID;

  const initialState = {
    FromDate: new Date(),
    ToDate: new Date(),
    VendorId: [],
    LocationId: [],
    CentreType: [],
    BusinessZoneId: [],
    StateId: [],
    PONo: "",
    OrderType: "",
    ActionType: "",
    MakerName: "",
    IndentNo: "",
    poStatus: 0,
  };

  const [locationsearch, setLocationsearch] = useState([]);
  const [payload, setPayload] = useState(initialState);
  const [supplierList, setSupplierList] = useState([]);
  const [makerList, setMakerList] = useState([]);
  const [dropDownApis, setDropDownApis] = useState({
    centretypebind: [],
    BusinessZoneId: [],
    statebind: [],
  });

  const [tableData, setTableData] = useState([]);

  const handlePayloadMultiSelectNumbers = (data) => {
    console.log("Data received:", data);
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item?.code));
  };

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };

  const getBindlocationsearch = () => {
    const requstBody = {
      zoneId: String(""),
      cityId: String(""),
      stateID: String(""),
      typeId: String(""),
      centreid: String("")
    };
    axiosInstance
      .post("VendorQuotation/Bindlocationsearch", {
        ...requstBody,
      })
      .then((res) => {
        const response = res?.data?.message;
        setLocationsearch(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        setLocationsearch([])
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleSelectMultiChange = (name, select) => {
    if (name === "CentreType") {
      setPayload((prev) => ({ ...prev, [name]: select }));
    }
    if (name === "BusinessZoneId") {
      setPayload((prev) => ({
        ...prev,
        BusinessZoneId: select,
        StateId: [],
        CityId: []
      }));

      getPOBindstate(
        handlePayloadMultiSelectNumbers(select),
        (data) => {
          setDropDownApis((prev) => ({
            ...prev,
            statebind: data,
            citybind: []
          }));
        }
      );
    }
    if (name === "StateId") {
      setPayload((prev) => ({
        ...prev,
        StateId: select,
        CityId: []
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: select,
      }))
    }
  };

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const getSupplier = () => {
    axiosInstance
      .get("DirectPO/bindSupplier")
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message;
          setSupplierList(Array.isArray(response) ? response : []);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };



  const getMaker = () => {
    axiosInstance
      .get("POSearch/GetPOApprovalMakers")
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message;
          setMakerList(Array.isArray(response) ? response : []);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const GetPOApprovalRights = () => {
    axiosInstance
      .get("POSearch/GetPOApprovalRights")
      .then((res) => {
        if (res?.data?.success) {
          const response = res?.data?.data;
          setApprovalRights(response);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  useEffect(() => {
    getSupplier();
    getMaker();
    getBindlocationsearch();
    GetPOApprovalRights();
  }, [])

  useEffect(() => {
    getBindCentreType((data) => {
      setDropDownApis((prev) => ({ ...prev, centretypebind: data }));
    });

    GetPOZoneData((data) => {
      setDropDownApis((prev) => ({ ...prev, BusinessZoneId: data }));
    });
  }, []);

  const applyStatusFilter = (rows, status) =>
    (Array.isArray(rows) ? rows : []).filter((row) => matchesPoStatus(row, status));

  const handleSearchData = (status = 0, refetch = true) => {
    const nextStatus = status ?? 0;
    setPayload((prev) => ({ ...prev, poStatus: nextStatus }));

    if (!refetch) {
      setTableData(applyStatusFilter(allTableData, nextStatus));
      return;
    }

    const payloadData = {
      centreType: handlePayloadMultiSelectNumbers(payload?.CentreType) || [0],
      zoneID: handlePayloadMultiSelectNumbers(payload?.BusinessZoneId) || [0],
      stateID: handlePayloadMultiSelectNumbers(payload?.StateId) || [0],
      fromDate: payload?.FromDate,
      toDate: payload?.ToDate,
      vendorID: handlePayloadMultiSelectNumbers(payload?.VendorId) || [0],
      poNo: payload?.PONo,
      POType: payload?.OrderType || "",
      ddlaction: payload?.ActionType || "",
      location: handlePayloadMultiSelectNumbers(payload?.LocationId) || [0],
      indentNo: payload?.IndentNo,
      maker: String(payload?.MakerName),
      poStatus: 0,
    };
    axiosInstance
      .post("/POSearch/SearchPO", payloadData)
      .then((res) => {
        if (res?.data?.success) {
          const response = Array.isArray(res?.data?.message) ? res.data.message : [];
          setAllTableData(response);
          setTableData(applyStatusFilter(response, nextStatus));
        }
        else {
          setAllTableData([]);
          setTableData([]);
          toast.error(res?.data?.message ? res?.data?.message : "NO data found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  }

  const getFilterResultOption = () => {
    axiosInstance
      .post("Lab/getFilterTableReprintData", {
        PageName: "POSearch",
        EmployeeId: EmployeeID?.toString(),
      })
      .then((res) => {
        const data = res?.data?.message;
        if (Array.isArray(data) && data.length > 0) {
          const merged = PO_SEARCH_COLUMNS.map((col) => {
            const saved = data.find((item) => item?.header === col.header);
            return saved ? { ...col, visible: saved.visible } : col;
          });
          setColumnConfig(merged);
        } else {
          setColumnConfig(PO_SEARCH_COLUMNS);
        }
      })
      .catch(() => setColumnConfig(PO_SEARCH_COLUMNS));
  };

  const handleColumnToggle = (column, index) => {
    const updatedColumn = columnConfig.map((ele, i) =>
      i === index ? { ...ele, visible: ele.visible == 1 || ele.visible === true ? 0 : 1 } : ele
    );
    axiosInstance
      .post("Lab/SaveFilterTableReprintData", {
        SaveData: updatedColumn,
        saveData: updatedColumn,
        PageName: "POSearch",
        pageName: "POSearch",
        EmployeeId: EmployeeID?.toString() || "",
        employeeId: EmployeeID?.toString() || "",
        EmployeeID: EmployeeID?.toString() || "",
      })
      .then(() => getFilterResultOption())
      .catch(() => toast.error(t("Failed to update column configuration")));
  };

  const isColumnVisible = (header) => {
    const col = columnConfig.find((c) => c.header === header);
    return !col || col.visible == 1 || col.visible === true;
  };

  const visibleColumns = useMemo(
    () => columnConfig.filter((col) => col.visible == 1 || col.visible === true),
    [columnConfig]
  );

  const amountTotals = useMemo(() => {
    return tableData.reduce(
      (acc, row) => {
        const amt = getPoAmounts(row);
        acc.gross += amt.gross;
        acc.dis += amt.dis;
        acc.tax += amt.tax;
        acc.net += amt.net;
        acc.total += amt.total;
        return acc;
      },
      { gross: 0, dis: 0, tax: 0, net: 0, total: 0 }
    );
  }, [tableData]);

  const statusCount = (key) => {
    if (key === "" || key == null || Number(key) === 0) return allTableData.length;
    return allTableData.filter((row) => matchesPoStatus(row, key)).length;
  };

  useEffect(() => {
    getFilterResultOption();
  }, []);

  const printReport = (id, purchaseOrderNo) => {
    if (printLoadingId) return;

    setPrintLoadingId(id);
    axiosReport
      .post(
        `/StoreReports/PoReportpdf`,
        {},
        {
          params: {
            purchaseOrderId: Number(id),
          },
          responseType: "blob",
        }
      )
      .then((res) => {
        const blobUrl = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" })
        );

        const safePoNo = String(purchaseOrderNo || "PO_Report")
          .replace(/[\\/:*?"<>|]/g, "_")
          .trim();

        const link = document.createElement("a");
        link.href = blobUrl;
        link.setAttribute("download", `${safePoNo}.pdf`);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error(err);

        if (err?.response?.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function () {
            try {
              const error = JSON.parse(reader.result);
              toast.error(error?.message || "Failed to download PDF");
            } catch {
              toast.error("Failed to download PDF");
            }
          };
          reader.readAsText(err.response.data);
        } else {
          toast.error(err?.response?.data?.message || "Failed to download PDF");
        }
      })
      .finally(() => {
        setPrintLoadingId(null);
      });
  };
  return (
    <>
      {printLoadingId && <Loading />}
      {emailModal?.modal &&
        <PoEmailModal
          show={emailModal?.modal}
          handleClose={() =>
            setEmailModal({ modal: false, data: "", index: -1 })
          }
          state={emailModal?.data}

        />
      }

      {rejectModal?.modal &&
        <PoRejectModal
          show={rejectModal?.modal}
          handleClose={() =>
            setRejectModal({ modal: false, data: "", index: -1 })
          }
          state={rejectModal?.data}
        />

      }
      {showItem?.modal &&
        <ShowItemDetailsPOModal
          show={showItem?.modal}
          handleClose={() =>
            setShowItem({ modal: false, data: "", index: -1 })
          }
          state={showItem?.data}
        />
      }
      {showQtyEdit?.modal &&
        <POQuantityEditModal
          show={showQtyEdit?.modal}
          handleClose={() =>
            setShowQtyEdit({ modal: false, data: "", index: -1 })
          }
          state={showQtyEdit?.data}
        />
      }
      {showClose?.modal &&
        <PoCLoseModal
          show={showClose?.modal}
          handleClose={() => {
            setShowClose({ modal: false, data: "", index: -1 });
            handleSearchData(payload?.poStatus || 0, true);
          }}
          state={showClose?.data}
        />
      }
      <div className="card">
        <Heading name={"Purchase Order Search"} isBreadcrumb={true} />
        <div className="row p-2">
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("TO Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Vendor"
            name="VendorId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={supplierList}
            labelKey="supplierName"
            valueKey="supplierID"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            lable="PO No."
            id="PONo"
            name="PONo"
            value={payload.PONo}
            onChange={handleChange}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
          <ReactSelect
            name="OrderType"
            id="OrderType"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Regular", value: "1" },
              { label: "Urgent", value: "2" },
            ]}
            placeholderName="Order Type"
            value={payload?.OrderType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="ActionType"
            id="ActionType"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Prepared", value: "Maker" },
              { label: "Validate", value: "Checker" },
              { label: "Approved", value: "Approval" },
            ]}
            placeholderName="Action Type"
            value={payload?.ActionType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="MakerName"
            id="MakerName"
            removeIsClearable={true}
            dynamicOptions={makerList?.map((ele) => ({
              label: ele?.NAME,
              value: ele?.EmployeeID,
            }))}
            placeholderName="Maker Name"
            value={payload?.MakerName}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            lable="Indent No."
            id="IndentNo"
            name="IndentNo"
            value={payload.IndentNo}
            onChange={handleChange}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Location Filter"} isBreadcrumb={true} />
        <div className="row p-2">
          <MultiSelctItems
            placeholderName="Centre Type"
            name="CentreType"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.centretypebind}
            labelKey="type"
            valueKey="id"
            handleChange={handleSelectMultiChange}

            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <MultiSelctItems
            placeholderName="BusinessZone"
            name="BusinessZoneId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.BusinessZoneId}
            labelKey="BusinessZoneName"
            valueKey="BusinessZoneID"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="State"
            name="StateId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.statebind}
            labelKey="stateName"
            valueKey="id"
            handleChange={handleSelectMultiChange}

            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Location"
            name="LocationId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={locationsearch}
            labelKey="name"
            valueKey="id"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <div className="col-sm-2">
            <CustomButton
              text={"Search"}
              onClick={() => handleSearchData(0, true)}
            />
          </div>
        </div>
        <TableFilterDot
          slide={true}
          items={PoStatusList}
          getColor={getPOStatusColor}
          onSelect={(val) => handleSearchData(val, allTableData.length === 0)}
          statusCount={statusCount}
          selectedValue={payload?.poStatus}
          countBelow={true}
          label="Color Code :"
          bgColor="#e9e2e1"
          className="mt-2 mb-2 px-2 py-1 bg-white"
        />
      </div>
      <div className="card mt-2">
        <Heading
          name={"Search Results"}
          isBreadcrumb={true}
          linkTo="#"
          linkTitle={
            <i
              className="fa fa-cog"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowColumnModal(true);
              }}
              title="Settings"
              style={{ fontSize: "16px", cursor: "pointer" }}
            />
          }
        />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                {tableData?.length > 0 && (
                  <tr style={{ backgroundColor: "#eef6ff" }}>
                    {visibleColumns.map((col) => (
                      <th
                        key={`total-${col.header}`}
                        style={{
                          color: AMOUNT_HEADERS.includes(col.header) ? "#0f766e" : "#334155",
                          fontWeight: 700,
                          textAlign: AMOUNT_HEADERS.includes(col.header) ? "right" : "left",
                        }}
                      >
                        {AMOUNT_HEADERS.includes(col.header)
                          ? formatAmt(amountTotals[col.header.toLowerCase()])
                          : col.header === "S.No."
                            ? t("Total")
                            : ""}
                      </th>
                    ))}
                  </tr>
                )}
                <tr>
                  {isColumnVisible("S.No.") && <th>{t("S.No.")}</th>}
                  {isColumnVisible("View Item") && <th>{t("View Item")}</th>}
                  {isColumnVisible("PO No.") && <th>{t("PO No.")}</th>}
                  {isColumnVisible("Location") && <th>{t("Location")}</th>}
                  {isColumnVisible("Vendor") && <th>{t("Vendor")}</th>}
                  {isColumnVisible("Po Type") && <th>{t("Po Type")}</th>}
                  {isColumnVisible("Status") && <th>{t("Status")}</th>}
                  {isColumnVisible("Raised Date") && <th>{t("Raised Date")}</th>}
                  {isColumnVisible("Gross") && <th>{t("Gross")}</th>}
                  {isColumnVisible("Dis") && <th>{t("Dis")}</th>}
                  {isColumnVisible("Tax") && <th>{t("Tax")}</th>}
                  {isColumnVisible("Net") && <th>{t("Net")}</th>}
                  {isColumnVisible("Total") && <th>{t("Total")}</th>}
                  {isColumnVisible("Action Type") && <th>{t("Action Type")}</th>}
                  {isColumnVisible("Next Action") && <th>{t("Next Action")}</th>}
                  {isColumnVisible("Qty Edit") && <th>{t("Qty Edit")}</th>}
                  {isColumnVisible("PO Close") && <th>{t("PO Close")}</th>}
                  {isColumnVisible("PO Reject") && <th>{t("PO Reject")}</th>}
                  {isColumnVisible("Print") && <th>{t("Print")}</th>}
                  {isColumnVisible("Pdf Preview") && <th>{t("Pdf Preview")}</th>}
                  {isColumnVisible("Mail") && <th>{t("Mail")}</th>}
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => {
                  const amt = getPoAmounts(row);
                  return (
                  <tr key={index} style={{ backgroundColor: row?.RowColor || "white" }}>
                    {isColumnVisible("S.No.") && <td data-title={t("S.No.")}>{index + 1}</td>}
                    {isColumnVisible("View Item") && (
                    <td data-title={t("View Item")} onClick={() => {
                      setShowItem({
                        modal: true,
                        data: row,
                        index: index,
                      })
                    }}>
                      <span>View</span>
                    </td>
                    )}
                    {isColumnVisible("PO No.") && <td data-title={t("PO No.")}>{row.PurchaseOrderNo}</td>}
                    {isColumnVisible("Location") && <td data-title={t("Location")}>{row.Location}</td>}
                    {isColumnVisible("Vendor") && <td data-title={t("Vendor")}>{row.SupplierName}</td>}
                    {isColumnVisible("Po Type") && <td data-title={t("Po Type")}>{row.POType}</td>}
                    {isColumnVisible("Status") && <td data-title={t("Status")}>{row.POStatusType}</td>}
                    {isColumnVisible("Raised Date") && <td data-title={t("Raised Date")}>{row.RaisedDate}</td>}
                    {isColumnVisible("Gross") && <td data-title={t("Gross")} style={{ textAlign: "right" }}>{formatAmt(amt.gross)}</td>}
                    {isColumnVisible("Dis") && <td data-title={t("Dis")} style={{ textAlign: "right" }}>{formatAmt(amt.dis)}</td>}
                    {isColumnVisible("Tax") && <td data-title={t("Tax")} style={{ textAlign: "right" }}>{formatAmt(amt.tax)}</td>}
                    {isColumnVisible("Net") && <td data-title={t("Net")} style={{ textAlign: "right" }}>{formatAmt(amt.net)}</td>}
                    {isColumnVisible("Total") && <td data-title={t("Total")} style={{ textAlign: "right" }}>{formatAmt(amt.total)}</td>}
                    {isColumnVisible("Action Type") && <td data-title={t("Action Type")}>{row.ActionType === "Maker" ? "Prepared" : row.ActionType === "Checker" ? "Validated" : "Approved"}</td>}
                    {isColumnVisible("Next Action") && (
                    <td data-title={t("Next Action")}>
                      {row?.POStatus !== "3" ? (
                        row?.ActionType === "Maker" ? (
                          <Link
                            to="/DirectPO"
                            state={{
                              type: "Checker",
                              id: row?.PurchaseOrderID,
                              No: row?.PurchaseOrderNo,
                              subject: row?.SUBJECT,
                              button: "Update",
                              status: row?.POStatus,
                              url1: `/DirectPO/GetPOData?Poid=${row?.PurchaseOrderID}`,
                              url2: "Employee/UpdateEmployee",
                            }}
                            style={{ textDecoration: "none" }}
                          >
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: "aqua", fontWeight: "bold" }}
                              title="Pending For Check"
                            >
                              Validate
                            </button>
                          </Link>
                        ) : row?.ActionType === "Checker" ? (
                          Number(row?.NetTotal) > Number(approvalRights?.limitperpo) ? (
                            <span
                              title="Pending For Approve"
                              style={{
                                backgroundColor: "red",
                                color: "white",
                                fontWeight: "bold",
                                padding: "4px 8px",
                              }}
                            >
                              Limit Exceed
                            </span>
                          ) : (
                            <Link
                              to="/DirectPO"
                              state={{
                                type: "Checker",
                                id: row?.PurchaseOrderID,
                                No: row?.PurchaseOrderNo,
                                subject: row?.SUBJECT,
                                button: "Update",
                                status: row?.POStatus,
                                url1: `/DirectPO/GetPOData?Poid=${row?.PurchaseOrderID}`,
                                url2: "Employee/UpdateEmployee",
                              }}
                              style={{ textDecoration: "none" }}
                            >
                              <button
                                className="btn btn-sm"
                                style={{ backgroundColor: "palegreen", fontWeight: "bold" }}
                                title="Pending For Approve"
                              >
                                Approval
                              </button>
                            </Link>
                          )
                        ) : null
                      ) : (
                        <span title="Reject Reason">{row?.RejectReason}</span>
                      )}
                    </td>
                    )}

                    {isColumnVisible("Qty Edit") && (
                    <td data-title={t("Qty Edit")} onClick={() => {
                      setShowQtyEdit({
                        modal: true,
                        data: row,
                        index: index,
                      })
                    }}>
                      <Link>
                        {t("Edit")}
                      </Link>

                    </td>
                    )}
                    {isColumnVisible("PO Close") && (
                    <td data-title={t("PO Close")} onClick={() => {
                      setShowClose({
                        modal: true,
                        data: row,
                        index: index,
                      })
                    }}>
                      <i
                        className="bi bi-x-circle-fill text-danger"
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        title="Close PO"
                      ></i>
                    </td>
                    )}
                    {isColumnVisible("PO Reject") && (
                    <td data-title={t("PO Reject")}
                    >
                      <i
                        className="bi bi-x-circle-fill text-danger"
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        title="PO Reject"
                      ></i>
                    </td>
                    )}
                    {isColumnVisible("Print") && (
                    <td data-title={t("Print")}>
                      {row?.POStatusType === "Approved" ? (
                        printLoadingId === row.PurchaseOrderID ? (
                          <i
                            className="fa fa-spinner fa-spin text-primary"
                            title="Downloading..."
                            style={{ fontSize: "16px" }}
                          />
                        ) : (
                          <span
                            onClick={() =>
                              printReport(row.PurchaseOrderID, row.PurchaseOrderNo)
                            }
                            style={{
                              cursor: printLoadingId ? "not-allowed" : "pointer",
                              opacity: printLoadingId ? 0.5 : 1,
                            }}
                            title="Download PO"
                          >
                            🖨️
                          </span>
                        )
                      ) : null}
                    </td>
                    )}
                    {isColumnVisible("Pdf Preview") && (
                    <td data-title={t("Pdf Preview")}>
                      <div className="text-center">
                        {row?.PurchaseOrderIDHash ? (
                          <i
                            className="fa fa-paperclip text-primary cursor-pointer"
                            style={{ fontSize: "14px" }}
                            onClick={() => handleOpenPreview(row?.PurchaseOrderIDHash)}
                            title="View Attachments"
                          />
                        ) : ""}
                      </div>
                    </td>
                    )}
                    {isColumnVisible("Mail") && (
                    <td data-title={t("Mail")}
                    >
                      <span>✉️</span>
                    </td>
                    )}

                  </tr>
                  );
                })}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
      <Modal
        show={showColumnModal}
        onHide={() => setShowColumnModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("Show/Hide Table Columns")}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <div className="row">
            {columnConfig.map((col, idx) => (
              <div className="col-sm-6 mb-2" key={col.header}>
                <Form.Check
                  type="switch"
                  id={`po-col-toggle-${idx}`}
                  label={t(col.header)}
                  checked={col.visible == 1 || col.visible === true}
                  onChange={() => handleColumnToggle(col, idx)}
                  className="m-0"
                />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>
      {previewConfig.visible && (
        <PdfPreviewModal
          visible={previewConfig.visible}
          url={previewConfig.url}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};


export default PurchaseOrderSearch;
