import React, { useState, useMemo } from "react";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import PatientDetailModal from "../utils/PatientDetailModal";
import CustomDateModal from "../utils/CustomDateModal";
import SpinnerLoad from "../../components/loader/SpinnerLoad";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import { CheckDevice, parseAwsKeys, parseRemarks } from "../../utils/helpers";
import { toast } from "react-toastify";
import { FaEye, FaPlus } from "react-icons/fa";
import CustomModal from "../utils/CustomModal";
import SampleRemark from "../utils/SampleRemark";
import AddRemark from "../utils/AddRemark";
import { RemarkTooltip } from "../utils/RemarkTooltip";
import { Tooltip as ReactTooltip } from "react-tooltip";
import Urgent from ".././Images/urgent.gif";
import PdfPreviewModal from "../utils/PdfPreviewModal";
import moment from "moment";
import { Modal, Form } from "react-bootstrap";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

function REAllergyTable({
  redata,
  GetResultEntryCulture,
  setShowUD,
  TableData = [],
  SampleStatus,
  getAllergyData,
  setEntryShow,
  filterData = [],
  onPreview,
  showColumnModal,
  setShowColumnModal,
  columnConfig,
  getFilterResultOption,
}) {
  const { EmployeeID } = useLocalStorage("userData", "get") || {};
  const [loading, setLoading] = useState(false);
  const [Index, setIndex] = useState(-1);
  const [showPH, setShowPH] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedLedgerTransactionNo, setSelectedLedgerTransactionNo] =
    useState(null);
  const [selectedTestID, setSelectedTestID] = useState(null);
  const [TestID, setTestID] = useState("");
  const [datemodal, showDatemodal] = useState(false);
  const [modal, setModal] = useState(false);
  const [visitID, setVisitID] = useState();
  const [showRemark, setShowRemark] = useState(false);
  const [remarkData, setRemarkData] = useState({});
  const [printLoading, setPrintLoading] = useState({
    With: false,
    Without: false,
    index: -1,
  });
  const [showAddRemark, setShowAddRemark] = useState({
    modal: false,
    rowData: null,
  });
  const [previewConfig, setPreviewConfig] = useState({
        visible: false,
        url: null,
      });
  const { t } = useTranslation();

  const rawVisibleColumns = useMemo(() => {
    return filterData?.filter(
      (item) => item?.IsShow == 1 && item?.TypeId == 2,
    ) || [];
  }, [filterData]);

  const visibleColumns = useMemo(() => {
    if (!columnConfig || columnConfig.length === 0) {
      return rawVisibleColumns;
    }
    return rawVisibleColumns.filter((col) => {
      const colHeader = col.ControlDisplayName || col.ControlDisplayID;
      const configItem = columnConfig.find(
        (c) => c.header?.toLowerCase() === colHeader?.toLowerCase()
      );
      if (configItem) {
        return configItem.visible == 1 || configItem.visible === true;
      }
      return true;
    });
  }, [rawVisibleColumns, columnConfig]);

  const useControllers = visibleColumns?.length > 0;

  const allTableFields = useMemo(() => {
    return rawVisibleColumns.map(
      (c) => c.ControlDisplayName || c.ControlDisplayID
    );
  }, [rawVisibleColumns]);

  const configList = useMemo(() => {
    return allTableFields.map((field) => {
      const configItem = columnConfig?.find(
        (c) => c.header?.toLowerCase() === field?.toLowerCase()
      );
      return {
        header: field,
        visible: configItem ? (configItem.visible == 1 || configItem.visible === true) : true,
      };
    });
  }, [allTableFields, columnConfig]);

  const handleColumnToggle = (columnName, index) => {
    const updatedColumn = configList.map((ele, i) =>
      i === index ? { ...ele, visible: !ele.visible } : ele
    );

    axiosInstance
      .post("Lab/SaveFilterTableReprintData", {
        SaveData: updatedColumn,
        saveData: updatedColumn,
        PageName: "ResultEntryAllergy",
        pageName: "ResultEntryAllergy",
        EmployeeId: EmployeeID?.toString() || "",
        employeeId: EmployeeID?.toString() || "",
        EmployeeID: EmployeeID?.toString() || "",
      })
      .then(() => {
        if (typeof getFilterResultOption === "function") {
          getFilterResultOption();
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to update column configuration");
      });
  };


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

  const getdata = (data, index) => {
    GetResultEntryCulture(
      {
        LedgerTransactionId: data?.LedgertransactionId,
        TestID: data?.TestID,
        DepartmentId: data?.DepartmentId,
        VisitNo: data?.LedgerTransactionNo,
        BarcodeNo: data?.BarcodeNo,
        ReportNumber: "1",
        LedgertransactionIDHash: data?.LedgertransactionIDHash,
      },
      index,
      setLoading,
      "1",
    );
    getAllergyData();
    setIndex(index);
  };

  const handleReport = (data, loader, index, PHead) => {
    if (printLoading.index === -1) {
      setPrintLoading({ [loader]: true, index: index });
      axiosReport
        .post(`commonReports/GetLabReport`, {
          TestIDHash: [data?.TestIdHash],
          PHead: PHead,
          PrintColour: "1",
          IsDownload: CheckDevice(),
        })
        .then((res) => {
          if (res?.data?.success) {
            if (onPreview) {
              onPreview(res?.data?.url);
            } else {
              window.open(res?.data?.url, "_blank");
            }
          } else {
            toast.error(res?.data?.message);
          }
          setPrintLoading({ [loader]: false, index: -1 });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : err?.data?.message,
          );
          setPrintLoading({ [loader]: false, index: -1 });
        });
    } else {
      toast.warn("Please wait Generating Report");
    }
  };

  const renderHeader = (column, idx) => {
    const colId = column?.ControlDisplayID;
    if (colId === "View Doc.") {
      return (
        <th key={idx} className="text-center">
          <i className="fa fa-file"></i>
        </th>
      );
    }
    if (colId === "Customize Date") {
      return (
        <th
          key={idx}
          data-toggle="tooltip"
          data-placement="top"
          title="Customize Date"
        >
          <i
            className="fa fa-calendar text-centre"
            style={{ margin: "2px 8px" }}
          ></i>
        </th>
      );
    }
    return (
      <th key={idx}>
        {t(column?.ControlDisplayName || column?.ControlDisplayID)}
      </th>
    );
  };

  const renderCell = (column, data, index) => {
    const colId = column?.ControlDisplayID;

    if (colId === "S.No") {
      return (
        <td key={colId} data-title={t("S.No")}>
          <div style={{ display: "flex", gap: "4px" }}>
            <span>{index + 1}&nbsp;</span>
            <i
              className="fa fa-search"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setModal(true);
                setVisitID(data?.VisitNo || data?.LedgerTransactionNo);
              }}
            />
            {data?.IsPatientDocAvail > 0 && (
              <div>
                <i
                  className="fa bi-file-earmark-pdf text-primary cursor-pointer"
                  style={{ fontSize: "16px" }}
                  onClick={() => handleOpenPreview(data?.awsKeys)}
                  title="View Attachments"
                />
              </div>
            )}
            
            {data?.Urgent === "Y" && (
              <div>
                <img
                  src={Urgent}
                  className="sizeicon"
                  title="Urgent"
                ></img>
              </div>
            )}
            {data?.IsVip === 1 && (
              <div>
                <i
                  className="bi bi-shield-fill-check mr-1 vip-font-size"
                  style={{ color: "#FFC107", display: "inline", width: "5%" }}
                  title="VIP Patient"
                />
              </div>

            )}
          </div>
        </td>
      );
    }

    if (colId === "Reg. Date") {
      return (
        <td key={colId} data-title={t("Reg. Date")}>
          {data?.DATE}&nbsp;
        </td>
      );
    }

    if (colId === "TAT Status") {
      let text = "";
      let textColor = "white";

      if (data?.TATDelay == 1) {

        text = "Outside TAT";
        textColor = "white";
      } else if (data?.TATIntimate == 1) {

        text = "Near TAT";
        textColor = "black";
      } else {

        text = "Within TAT";
        textColor = "white";
      }
      return (
        <td key={colId} data-title={t("TAT Status")}
          style={{
            backgroundColor:
              data?.TATDelay == 1
                ? "red"
                : data?.TATIntimate == 1
                  ? "yellow"
                  : "green"

          }}

        >
          <span
            style={{
              color: textColor,
              fontWeight: "bold",
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "3px",
              display: "inline-block",
            }}
          >
            {text}
          </span>
        </td>
      );
    }

    if (colId === "Visit No.") {
      return (
        <td
          key={colId}
          data-title={t("Visit No")}
          onClick={() => getdata(data, index)}
          style={{ cursor: "pointer" }}
        >
          <div className="text-primary">
            {loading && index === Index ? (
              <Loading />
            ) : (
              data?.LedgerTransactionNo
            )}
            &nbsp;
          </div>
        </td>
      );
    }

    if (colId === "Barcode No") {
      return (
        <td key={colId} data-title={t("Barcode No")}>
          {data?.BarcodeNo}&nbsp;
        </td>
      );
    }

    if (colId === "UHID") {
      return (
        <td key={colId} data-title={t("UHID")}>
          {data?.PatientCode}&nbsp;
        </td>
      );
    }

    if (colId === "Patient Name") {
      return (
        <td key={colId} data-title={t("Patient Name")}>
          {data?.PName}&nbsp;
        </td>
      );
    }

    if (colId === "Age/Gender") {
      return (
        <td key={colId} data-title={t("Age/Gender")}>
          {data?.Age_Gender}&nbsp;
        </td>
      );
    }

    if (colId === "Test") {
      return (
        <td key={colId} data-title={t("Test")} className="result-entry-test">
          <p
            className={`round Status-${data?.Status}`}
            onClick={() => getdata(data, index)}
            style={{ cursor: "pointer" }}
          >
            {data?.Test}
          </p>
          &nbsp;
        </td>
      );
    }

    if (colId === "Status") {
      return (
        <td key={colId} data-title={t("Status")}>
          {data?.SampleStatus}&nbsp;
        </td>
      );
    }

    if (colId === "Print") {
      return (
        <td key={colId} data-title={t("Print")}>
          {(data?.Status == "5") && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                padding: "5px",
              }}
            >
              {printLoading.Without && printLoading.index === index ? (
                <SpinnerLoad />
              ) : (
                <i
                  className="fa fa-print iconStyle"
                  style={{ cursor: "pointer", textAlign: "center" }}
                  onClick={() => handleReport(data, "Without", index, 0)}
                  title="Print without header"
                ></i>
              )}
              <br />
              {printLoading.With && printLoading.index === index ? (
                <SpinnerLoad />
              ) : (
                <i
                  className="fa fa-print iconStyle"
                  style={{
                    color: "red",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onClick={() => handleReport(data, "With", index, 1)}
                  title="Print with header"
                ></i>
              )}
            </div>
          )}
          &nbsp;
        </td>
      );
    }

    if (colId === "Doctor") {
      return (
        <td key={colId} data-title={t("Doctor")}>
          {data?.Doctor}&nbsp;
        </td>
      );
    }

    if (colId === "Centre") {
      return (
        <td key={colId} data-title={t("Centre")}>
          {data?.Centre}&nbsp;
        </td>
      );
    }

    if (colId === "Remarks") {
      return (
        <td key={colId} data-title={t("Remarks")}>
          <div
            data-tooltip-id={`remark-tooltip-${index}`}
            onClick={() =>
              setShowAddRemark({ modal: true, rowData: { ...data } })
            }
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px",
            }}
          >
            <div
              style={{
                backgroundColor: "green",
                borderRadius: "50%",
                width: "18px",
                height: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              <FaPlus color="white" size={8} />
            </div>
            {data.LabRemarkCount > 0 && (
              <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                ({data.LabRemarkCount})
              </span>
            )}
          </div>
          {Array.isArray(parseRemarks(data?.RemarksList)) &&
            parseRemarks(data?.RemarksList)?.length > 0 && (
              <ReactTooltip
                id={`remark-tooltip-${index}`}
                positionStrategy="fixed"
                place="top"
                style={{ zIndex: 9999 }}
                clickable
                content={
                  <RemarkTooltip remarks={parseRemarks(data?.RemarksList)} />
                }
              />
            )}
        </td>
      );
    }

    if (colId === "Detail") {
      return (
        <td key={colId} data-title={t("Detail")}>
          <FaEye
            style={{
              marginLeft: "10px",
              fontSize: "18px",
              cursor: "pointer",
              color: "#007bff",
            }}
            onClick={() => {
              setShowPatientModal(true);
              setSelectedLedgerTransactionNo(data?.LedgerTransactionNo);
              setSelectedTestID(data?.TestID || 0);
            }}
          />
          &nbsp;
        </td>
      );
    }

    if (colId === "View Doc.") {
      return (
        <td key={colId} data-title={t("View Doc.")}>
          <div
            className="text-info d-flex align-items-center"
            style={{ cursor: "pointer", gap: "2px" }}
            onClick={() =>
              setShowUD({ modal: true, data: data?.PatientGuid, index: index, LedgertransactionIDHash: data?.LedgertransactionIDHash })
            }
          >
            <i
              className="fa fa-file iconStyle"
              style={{ color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "" }}
            ></i>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "600",
                color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "",
              }}
            >
              ({data?.UploadDocumentCount})
            </span>
          </div>
          &nbsp;
        </td>
      );
    }

    if (colId === "Customize Date") {
      return (
        <td
          key={colId}
          data-title={t("Customize Date")}
          data-toggle="tooltip"
          data-placement="top"
          title="Customize Date"
        >
          <div
            className="text-info text-centre"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setTestID(data.TestID.toString());
              showDatemodal(true);
            }}
          >
            <i className="fa fa-edit"></i>
          </div>
          &nbsp;
        </td>
      );
    }
    if(colId === "LastRemark"){
      // console.log("dataxx",data?.RemarksList);
      if (!parseRemarks(data?.RemarksList) || parseRemarks(data.RemarksList.length) === 0) {
        return "";
      }

      const RemarksList = parseRemarks(data?.RemarksList);
      console.log("remarkList",RemarksList);

      const sortedRemarks = [...RemarksList].sort((a, b) => {
        const dateDiff =
          moment(b.RemarkDate, "DD-MMM-YYYY hh:mm A") -
          moment(a.RemarkDate, "DD-MMM-YYYY hh:mm A");

        if (dateDiff !== 0) return dateDiff;

        // fallback for same timestamp
        return RemarksList.indexOf(b) - RemarksList.indexOf(a);
      });

      return (
      <td key={colId} data-title={t("LastRemark")}>
        <div
          style={{
            maxWidth: "200px",
          }}
        >
          <ul style={{ paddingLeft: "2px", margin: 0, listStyleType: "none" }}>
            {sortedRemarks.map((item, index) => {
              const remarkText = item?.LabRemarks || "";

              return (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "4px",
                    fontWeight: index === 0 ? "bold" : "normal",
                    marginBottom: "4px",
                    cursor: "pointer",
                  }}
                >
                  <span>•</span>
                  <span
                    className="remark-item"
                    data-tooltip-id="remark-tooltip"
                    data-tooltip-content={remarkText}>{remarkText}</span>
                </li>
              );
            })}
          </ul>
          <ReactTooltip
            id={`remark-tooltip`}
            positionStrategy="fixed"
            style={{
              backgroundColor: "#2d3748",
              color: "#fff",
              fontSize: "12px",
              borderRadius: "4px",
              padding: "6px 10px",
              maxWidth: "250px",   // ✅ FIXED WIDTH     
              whiteSpace: "normal", // ✅ allow wrapping
              wordBreak: "break-word",// ✅ break long words
              zIndex: 9999
            }}
          />
        </div>
      </td>
      );
    }

    const fieldValue = data[column?.ApiFieldName] ?? data[colId] ?? "";
    return (
      <td key={colId} data-title={t(column?.ControlDisplayName || colId)}>
        {fieldValue}&nbsp;
      </td>
    );
  };

  // Static fallback (no controllers)
  const renderStaticTable = () => (
    <Tables>
      <>
        <thead className="cf">
          <tr>
            <th>{t("S.No")}</th>
            <th>{t("Reg. Date")}</th>
            <th>{t("Visit No.")}</th>
            <th>{t("Barcode No")}</th>
            <th>{t("UHID")}</th>
            <th>{t("Patient Name")}</th>
            <th>{t("Age/Gender")}</th>
            <th>{t("Test")}</th>
            <th>{t("Status")}</th>
            <th>{t("Print")}</th>
            <th>{t("Doctor")}</th>
            <th>{t("Centre")}</th>
            <th>{t("Remarks")}</th>
            <th>{t("Detail")}</th>
            <th className="text-center">
              <i className="fa fa-file"></i>
            </th>
            <th
              data-toggle="tooltip"
              data-placement="top"
              title="Customize Date"
            >
              <i
                className="fa fa-calendar text-centre"
                style={{ margin: "2px 8px" }}
              ></i>
            </th>
          </tr>
        </thead>
        <tbody>
          {redata.map((data, index) => (
            <tr key={index}>
              <td data-title={t("S.No")}>
                <div
                  style={{ display: "flex", justifyContent: "space-around" }}
                >
                  <span>{index + 1}&nbsp;</span>
                  <i
                    className="fa fa-search"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setModal(true);
                      setVisitID(data?.VisitNo || data?.LedgerTransactionNo);
                    }}
                  />
                </div>
              </td>
              <td data-title={t("Reg. Date")}>{data?.DATE}&nbsp;</td>
              <td
                data-title={t("Visit No")}
                onClick={() => getdata(data, index)}
                style={{ cursor: "pointer" }}
              >
                <div className="text-primary">
                  {loading && index === Index ? (
                    <Loading />
                  ) : (
                    data?.LedgerTransactionNo
                  )}
                  &nbsp;
                </div>
              </td>
              <td data-title={t("Barcode No")}>{data?.BarcodeNo}&nbsp;</td>
              <td data-title={t("UHID")}>{data?.PatientCode}&nbsp;</td>
              <td data-title={t("Patient Name")}>{data?.PName}&nbsp;</td>
              <td data-title={t("Age/Gender")}>{data?.Age_Gender}&nbsp;</td>
              <td data-title={t("Test")} className="result-entry-test">
                <p
                  className={`round Status-${data?.Status}`}
                  onClick={() => getdata(data, index)}
                  style={{ cursor: "pointer" }}
                >
                  {data?.Test}
                </p>
                &nbsp;
              </td>
              <td data-title={t("Status")}>{data?.SampleStatus}&nbsp;</td>
              <td data-title={t("Print")}>
                {(data?.Status == "5") && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      padding: "5px",
                    }}
                  >
                    {printLoading.Without && printLoading.index === index ? (
                      <SpinnerLoad />
                    ) : (
                      <i
                        className="fa fa-print iconStyle"
                        style={{ cursor: "pointer", textAlign: "center" }}
                        onClick={() => handleReport(data, "Without", index, 0)}
                        title="Print without header"
                      ></i>
                    )}
                    <br />
                    {printLoading.With && printLoading.index === index ? (
                      <SpinnerLoad />
                    ) : (
                      <i
                        className="fa fa-print iconStyle"
                        style={{
                          color: "red",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                        onClick={() => handleReport(data, "With", index, 1)}
                        title="Print with header"
                      ></i>
                    )}
                  </div>
                )}
                &nbsp;
              </td>
              <td data-title={t("Doctor")}>{data?.Doctor}&nbsp;</td>
              <td data-title={t("Centre")}>{data?.Centre}&nbsp;</td>
              <td data-title={t("Remarks")}>
                <div
                  data-tooltip-id={`remark-tooltip-${index}`}
                  onClick={() =>
                    setShowAddRemark({ modal: true, rowData: { ...data } })
                  }
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "green",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    }}
                  >
                    <FaPlus color="white" size={8} />
                  </div>
                  {data.LabRemarkCount > 0 && (
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                      ({data.LabRemarkCount})
                    </span>
                  )}
                </div>
                {Array.isArray(parseRemarks(data?.RemarksList)) &&
                  parseRemarks(data?.RemarksList)?.length > 0 && (
                    <ReactTooltip
                      id={`remark-tooltip-${index}`}
                      place="top"
                      style={{ zIndex: 9999 }}
                      clickable
                      content={
                        <RemarkTooltip
                          remarks={parseRemarks(data?.RemarksList)}
                        />
                      }
                    />
                  )}
              </td>
              <td data-title={t("Detail")}>
                <FaEye
                  style={{
                    marginLeft: "10px",
                    fontSize: "18px",
                    cursor: "pointer",
                    color: "#007bff",
                  }}
                  onClick={() => {
                    setShowPatientModal(true);
                    setSelectedLedgerTransactionNo(data?.LedgerTransactionNo);
                    setSelectedTestID(data?.TestID || 0);
                  }}
                />
                &nbsp;
              </td>
              <td data-title={t("View Doc.")}>
                <div
                  className="text-info d-flex align-items-center"
                  style={{ cursor: "pointer", gap: "2px" }}
                  onClick={() =>
                    setShowUD({
                      modal: true,
                      data: data?.PatientGuid,
                      index: index,
                      LedgertransactionIDHash: data?.LedgertransactionIDHash,
                    })
                  }
                >
                  <i
                    className="fa fa-file iconStyle"
                    style={{
                      color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "",
                    }}
                  ></i>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: "600",
                      color: data?.UploadDocumentCount > 0 ? "#4ea30c" : "",
                    }}
                  >
                    ({data?.UploadDocumentCount})
                  </span>
                </div>
                &nbsp;
              </td>
              <td
                data-title={t("Customize Date")}
                data-toggle="tooltip"
                data-placement="top"
                title="Customize Date"
              >
                <div
                  className="text-info text-centre"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setTestID(data.TestID.toString());
                    showDatemodal(true);
                  }}
                >
                  <i className="fa fa-edit"></i>
                </div>
                &nbsp;
              </td>
            </tr>
          ))}
        </tbody>
      </>
    </Tables>
  );

  // ✅ Dynamic table
  const renderDynamicTable = () => (
    <Tables>
      <>
        <thead className="cf">
          <tr>
            {visibleColumns.map((column, idx) => renderHeader(column, idx))}
          </tr>
        </thead>
        <tbody>
          {redata.map((data, index) => (
            <tr key={index}>
              {visibleColumns.map((column) => renderCell(column, data, index))}
            </tr>
          ))}
        </tbody>
      </>
    </Tables>
  );

  return (
    <>
      {showAddRemark?.modal && (
        <AddRemark
          show={showAddRemark.modal}
          handleShow={() => {
            setShowAddRemark({ modal: false, rowData: null });
            TableData(SampleStatus);
          }}
          rowData={showAddRemark.rowData}
          bindTestFromRow={false}
          defaultTestFromRow={true}
          filterTestID={showAddRemark.rowData?.TestID}
          visitKey="LedgerTransactionNo"
          testIDsKey="TestID"
          testNamesKey="Test"
          ledgerTransactionIDKey="LedgertransactionId"
        />
      )}

      <PatientDetailModal
        showPH={showPatientModal}
        setShowPH={setShowPatientModal}
        ResultData={[
          {
            LedgerTransactionNo: selectedLedgerTransactionNo,
            TestID: selectedTestID,
          },
        ]}
        Index={0}
      />

      <PdfPreviewModal
        visible={previewConfig.visible}
        url={previewConfig.url}
        onClose={handleClosePreview}
      />

      {datemodal && (
        <CustomDateModal
          show={datemodal}
          data={TestID}
          onHide={() => showDatemodal(false)}
        />
      )}

      {/* Column Settings Modal */}
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
            {configList.map((item, idx) => (
              <div className="col-sm-6 mb-2" key={idx}>
                <Form.Check
                  type="switch"
                  id={`col-toggle-${idx}`}
                  label={t(item.header)}
                  checked={!!item.visible}
                  onChange={() => handleColumnToggle(item.header, idx)}
                  className="m-0"
                />
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      {modal && (
        <CustomModal
          show={modal}
          visitID={visitID}
          onHide={() => setModal(false)}
        />
      )}

      <div className="p-2">
        {redata.length > 0 ? (
          useControllers ? (
            renderDynamicTable()
          ) : (
            renderStaticTable()
          )
        ) : (
          <NoRecordFound />
        )}
      </div>
    </>
  );
}

export default REAllergyTable;
