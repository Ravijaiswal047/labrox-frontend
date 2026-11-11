import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import SettlementPatient from "../Laboratory/Settlement";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useSelector } from "react-redux";
import EditPatientDetails from "../Laboratory/EditPatientDetails";
import EditPatientInfo from "../Laboratory/EditPatientInfo";
import SingleBulkPanelChange from "../Laboratory/SingleBulkPanelChange";
import DiscountAfterBill from "../Administrator/DiscountAfterBill";
import RefundAfterBill from "../Administrator/RefundAfterBill";
import "./MasterTable.css";
import B2BDiscount from "../Invoicing/B2BDiscount/B2BDiscount";
import CustomDateModal from "../utils/CustomDateModal";
import EditCustomizeDate from "./EditCustomizeDate";
import ChangePaymentMode from "../Administrator/ChangePaymentMode";
import ChangeBarCode from "../Administrator/ChangeBarCode";
import TransactionLog from "../Administrator/TransactionLog";
import ChangeCentre from "../Administrator/ChangeCentre";

const SeeMoreIconInTable = ({
  receiptData = [],
  index,
  getReceipt,
  getReceiptFullyPaid,
  setModal,
  setVisitID,
  setShowEmail,
  show3,
  show2,
  DesignationName,
  refreshData = () => {},
}) => {
  const [show, setShow] = useState(false);
  const theme = useLocalStorage("theme", "get");
  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = useMemo(
    () => (accessRightStr ? accessRightStr.split(",").filter(Boolean) : []),
    [accessRightStr]
  );

  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const allowChangeBarcode = Number(userData?.AllowChangeBarcode);
  const allowReceiptEdit = Number(userData?.AllowReceiptEdit);
  const allowEditInfo = Number(userData?.AllowEditInfo);
  const allowB2BDiscount = Number(userData?.AllowB2BDiscount);

  console.log("allowReceiptEdit",allowReceiptEdit, allowEditInfo,allowChangeBarcode);


  const actionsHasAccessRight = useMemo(() => {
    const actions = [
      {
        key: 14,
        name: `Settlement`,
        icon: "fa fa-envelope",
        functionality: () => handleOpenModalsByType("settlement"),
      },
      {
        key: 23,
        name: `Change Payment Mode`,
        icon: "fa fa-dollar-sign",
        functionality: () => handleOpenModalsByType("ChangePaymentMode"),
      },
      {
        key: 10,
        name: `Change Rate Type`,
        icon: "fa fa-envelope",
        functionality: () => handleOpenModalsByType("ChangeRateType"),
      },
      {
        key: 11,
        name: `DiscountAfterBill`,
        icon: "fa fa-book",
        functionality: () => handleOpenModalsByType("DiscountAfterBill"),
      },
      {
        key: 20,
        name: `ChangeCustomizeData`,
        icon: "fa fa-book",
        functionality: () => handleOpenModalsByType("ChangeCustomizeData"),
      },
      {
        key: 13,
        name: `Refund After Bill`,
        icon: "fa fa-book",
        functionality: () => handleOpenModalsByType("refundafterbill"),
      },
      ...(accessRight.includes("14") || Number(userData?.AllowB2BDiscount) === 1
        ? [
          {
            key: 14,
            name: "B2B Discount",
            icon: "fa fa-envelope",
            functionality: () => handleOpenModalsByType("B2BDiscount"),
          },
        ]
        : []),
      ...(accessRight.includes("29") || Number(userData?.AllowChangeBarcode) == 1
        ? [
          {
            key: 29,
            name: `Change Bar Code`,
            icon: "fa fa-barcode",
            functionality: () => handleOpenModalsByType("ChangeBarCode"),
          },
        ]
        : []),
      ...(accessRight.includes("9") || Number(userData?.AllowReceiptEdit) == 1
        ? [
          {
            key: 9,
            name: "EditPatientDetails",
            icon: "fas fa-edit",
            functionality: () => handleOpenModalsByType("editPatient"),
          },
        ]
        : []),
      ...(accessRight.includes("8") || Number(userData?.AllowEditInfo) === 1
        ? [
          {
            key: 8,
            name: "EditPatientInfo",
            icon: "fas fa-info-circle",
            functionality: () =>
              handleOpenModalsByType("editPatientInfo", true),
          },
        ] : []),
      ...(Number(receiptData?.MannualReceipt) === 1
        ? [
          {
            key: -1,
            name: "Cash Receipt",
            icon: "fas fa-file-invoice-dollar",
            functionality: () =>
              getReceipt(receiptData?.LedgertransactionIDHash, index),
          },
          {
            key: -1,
            name: "Print with Header",
            icon: "fas fa-file-invoice",
            functionality: () =>
              getReceipt(receiptData?.LedgertransactionIDHash, index, 1),
          },
        ]
        : []),
      ...(Number(receiptData?.MannualMRPReceipt) === 1
        ? [
          {
            key: -1,
            name: "FullyPaid Receipt",
            icon: "fas fa-file-invoice-dollar",
            functionality: () =>
              getReceiptFullyPaid(
                receiptData?.LedgertransactionIDHash,
                index
              ),
          },
        ]
        : []),
      {
        key: -1,
        name: "View Details",
        icon: "fa fa-search",
        functionality: () => {
          setModal(true);
          setVisitID(receiptData?.LedgerTransactionNo);
        },
      },
      {
        key: -1,
        name: "Send Email",
        icon: "fas fa-envelope",
        functionality: () => {
          setShowEmail({
            modal: true,
            patientData: receiptData,
          });
        },
      },
      {
        key: -1,
        name: "Upload Document",
        icon: "fas fa-cloud-upload-alt",
        functionality: () => {
          show2({
            modal: true,
            data: receiptData?.PatientGuid,
            index: index,
          });
        },
      },
      {
        key: -1,
        name: "Medical History",
        icon: "fas fa-notes-medical",
        functionality: () => {
          show3({
            modal: true,
            data: receiptData?.PatientGuid,
            index: index,
          });
        },
      },
      {
        key: -1,
        name: `Transaction Log`,
        icon: "fa-regular fa-font-awesome",
        functionality: () => handleOpenModalsByType("TransactionLog"),
      },
      {
        key: 33,
        name: `Change Test Center`,
        icon: "fas fa-edit fa-font-awesome",
        functionality: () => handleOpenModalsByType("ChangeCenter"),
      },
    ];

    return actions.filter((item) => {
      if (item?.key === -1) return true;

      if (item?.key === 8) {
        return (
          accessRight.includes("8") || Number(userData?.AllowEditInfo) === 1
        );
      }
      if (item?.key === 9) {
        return (
          accessRight.includes("9") || Number(userData?.AllowReceiptEdit) === 1
        );
      }
      if (item?.key === 29) {
        return (
          accessRight.includes("29") || Number(userData?.AllowChangeBarcode) === 1
        );
      }
      if (item?.key === 14 ) {
        return (
          accessRight.includes("14") || Number(userData?.AllowB2BDiscount) === 1
        );
      }

      return accessRight.includes(item?.key?.toString());
    });
  }, [
    receiptData,
    index,
    getReceipt,
    getReceiptFullyPaid,
    setModal,
    setVisitID,
    setShowEmail,
    show3,
    show2,
    DesignationName,
    accessRight,
    allowChangeBarcode,
    // allowReceiptEdit,
    allowEditInfo,
    allowB2BDiscount,
  ]);


  const [filterData, setFilterData] = useState([]);
  const [menuPos, setMenuPos] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);

  // Name as it currently stands inside the Edit Patient Info modal. receiptData is
  // the row the search returned, so on its own the header showed the pre-edit name
  // the whole time the user was changing it. Null until the editor reports a value,
  // and cleared on close so the next row starts from its own data.
  const [liveHeader, setLiveHeader] = useState(null);
  const headerPatient = liveHeader || receiptData;

  const onHideModal = () => {
    setShowSettlementModal(false);
    setModalIndex(null);
    setLiveHeader(null);
  };

  const popupComponentArr = {
    settlement: (
      <SettlementPatient
        visitNo={receiptData?.LedgerTransactionNo}
        onSuccess={onHideModal}
      />
    ),
    editPatient: <EditPatientDetails onHideModal={onHideModal} />,
    editPatientInfo: (
      <EditPatientInfo
        onHideModal={onHideModal}
        onSaved={refreshData}
        onPatientChange={setLiveHeader}
      />
    ),
    ChangeRateType: <SingleBulkPanelChange />,
    DiscountAfterBill: <DiscountAfterBill />,
    refundafterbill: <RefundAfterBill />,
    B2BDiscount: <B2BDiscount />,
    ChangeCustomizeData: <EditCustomizeDate />,
    ChangePaymentMode: <ChangePaymentMode />,
    ChangeBarCode: <ChangeBarCode />,
    TransactionLog: <TransactionLog onHideModal={onHideModal} ledgerTransactionNo={receiptData?.LedgerTransactionNo} patientData={receiptData} />,
    ChangeCenter: <ChangeCentre />
  };

  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  const handleOpenModalsByType = (key) => {
    // A single "close now" event isn't enough here: this dropdown closing
    // (setShow(false)) reflows the row underneath it back into the cursor's
    // path, which re-fires that row's own onMouseEnter/onMouseMove (the
    // "Individual Tests" hover tooltip) - possibly more than once, and the
    // Dialog below (modal=true, a real full-viewport blocking overlay) only
    // actually mounts after the setTimeout below, not instantly. So instead
    // of a one-shot close, this SUPPRESSES that tooltip from opening at all
    // (not just closes whatever's open right now) until onHideModal turns it
    // back on - closing the door instead of chasing it shut repeatedly.
    window.dispatchEvent(
      new CustomEvent("app:hoverTooltipSuppress", { detail: { suppress: true } }),
    );
    setShow(false);
    setMenuPos(null);
    setModalIndex(key);

    setTimeout(() => {
      setShowSettlementModal(true);
    }, 50);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cardRef.current &&
        !cardRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShow(false);
        setMenuPos(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const computeMenuPosition = () => {
    if (!buttonRef.current) return null;
    const rect = buttonRef.current.getBoundingClientRect();
    const padding = 8;
    const gap = 6;
    const menuWidth = 280;
    const minReadableHeight = 220;
    const spaceBelow = window.innerHeight - rect.bottom - padding;

    let left = rect.left;
    if (left + menuWidth > window.innerWidth - padding) {
      left = Math.max(padding, window.innerWidth - menuWidth - padding);
    }
    left = Math.max(padding, left);

    // Keep the list on screen and readable. Prefer opening below the
    // button; if there is not enough room, dock it in the viewport so
    // the user can scroll the items instead of the list flying upward.
    if (spaceBelow >= minReadableHeight) {
      return {
        top: rect.bottom + gap,
        left,
        width: menuWidth,
        maxHeight: spaceBelow - gap,
      };
    }

    const maxHeight = Math.min(window.innerHeight - padding * 2, 420);
    return {
      top: Math.max(padding, window.innerHeight - maxHeight - padding),
      left,
      width: menuWidth,
      maxHeight,
    };
  };

  const handleToggleCard = () => {
    if (show) {
      setShow(false);
      setMenuPos(null);
      return;
    }
    setMenuPos(computeMenuPosition());
    setShow(true);
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    const filterResponse = actionsHasAccessRight.filter((page) =>
      page?.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilterData(filterResponse);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (filterData.length > 0) {
        filterData[0].functionality();
      }
    }
  };

  useEffect(() => {
    if (show) {
      inputRef.current?.focus();
      const reposition = () => setMenuPos(computeMenuPosition());
      window.addEventListener("resize", reposition);
      window.addEventListener("scroll", reposition, true);
      return () => {
        window.removeEventListener("resize", reposition);
        window.removeEventListener("scroll", reposition, true);
      };
    }
    setFilterData(actionsHasAccessRight);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    return undefined;
  }, [show, actionsHasAccessRight]);

  const renderCard = () => {
    if (!show || !menuPos) return null;

    return ReactDOM.createPortal(
      <div
        ref={cardRef}
        className="children-data rr-action-menu"
        style={{
          position: "fixed",
          backgroundColor: "white",
          borderRadius: "6px",
          zIndex: 9999,
          left: menuPos.left,
          top: menuPos.top,
          width: menuPos.width,
          maxHeight: menuPos.maxHeight,
          overflow: "auto",
          border: "1px solid #cbd5e1",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
        }}
      >
        <div
          style={{ position: "sticky", top: 0, backgroundColor: "white" }}
          className="p-1"
        >
          <input
            type="text"
            placeholder="Search..."
            ref={inputRef}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            className="form-control"
          />
        </div>

        <div
          className="p-1"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "4px",
          }}
        >
          {filterData.map((action, actionIndex) => (
            <div
              key={actionIndex}
              style={{
                color: "black",
                padding: "1px",
                cursor: "pointer",
                margin: "1px",
              }}
              onClick={action?.functionality}
            >
              <i className={`${action.icon} nav-icon mr-2`} />
              {action.name === "Settlement" ? action.name : t(action.name)}
            </div>
          ))}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <>
      <div ref={buttonRef}>
        <div
          className="header"
          style={{ cursor: "pointer" }}
          onClick={handleToggleCard}
        >
          <span className="header" style={{ cursor: "pointer" }}>
            {/* Icon */}
            <svg
              width={17}
              height={17}
              viewBox="0 0 64 64"
              fill={"black"}
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="12"
                y="8"
                width="40"
                height="48"
                rx="4"
                ry="4"
                fill="#fff"
                stroke="#000"
                strokeWidth="2"
              />
              <rect
                x="24"
                y="4"
                width="16"
                height="8"
                rx="2"
                ry="2"
                fill="#f2c744"
                stroke="#000"
                strokeWidth="2"
              />
              <circle cx="18" cy="22" r="3" fill="#ff5f5f" />
              <rect x="26" y="20" width="20" height="2" rx="1" fill="#000" />
              <circle cx="18" cy="32" r="3" fill="#ff995f" />
              <rect x="26" y="30" width="20" height="2" rx="1" fill="#000" />
              <circle cx="18" cy="42" r="3" fill="#ffcf5f" />
              <rect x="26" y="40" width="20" height="2" rx="1" fill="#000" />
            </svg>
          </span>
        </div>

        {renderCard()}
      </div>

      <Dialog
        header={
          modalIndex === "editPatientInfo" ? (
            <div
              className="d-flex align-items-center"
              style={{ gap: "10px", fontSize: "14px" }}
            >
              <span style={{ fontWeight: "bold" }}>
                {t("Edit Patient Info")}
              </span>
              <div
                className="d-flex"
                style={{ gap: "10px", fontWeight: "normal", color: "inherit" }}
              >
                <span>
                  | <b>{t("Visit No")}:</b> {receiptData?.LedgerTransactionNo}
                </span>
                <span>
                  | <b>{t("Name")}:</b>{" "}
                  {[
                    headerPatient?.Title,
                    headerPatient?.FirstName,
                    headerPatient?.MiddleName,
                    headerPatient?.LastName,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </span>
                <span>
                  | <b>{t("Age")}:</b> {receiptData?.Age}
                </span>
                <span>
                  | <b>{t("Gender")}:</b> {receiptData?.Gender}
                </span>
              </div>
            </div>
          ) : modalIndex === "refundafterbill" ? (
            t("Refund After Bill")
          ) : (
            t(modalIndex)
          )
        }
        visible={showSettlementModal}
        onHide={onHideModal}
        focusOnShow={true}
        className={`${theme}`}
        style={
          modalIndex === "B2BDiscount"
            ? { width: "60vw" }
            : { width: "98vw" }
        }
      >
        {modalIndex && popupComponentArr[modalIndex]}
      </Dialog>
    </>
  );
};

export default SeeMoreIconInTable;
