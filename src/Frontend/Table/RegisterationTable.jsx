import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import { number } from "../../utils/helpers";
import { useLocation } from "react-router-dom";
import CloseButton from "../../components/formComponent/CloseButton";
import { useTranslation } from "react-i18next";
import TestNameModal from "../utils/TestNameModal";
import DOSModal from "../utils/DOSModal";
import PackageOutSourceLabModal from "../utils/PackageOutSourceLabModal";
import OutSourceLabSelect, {
  buildOutSourceLabOptions,
} from "../utils/OutSourceLabSelect";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { validateRowDiscount } from "../../utils/validations/index.js";

function RegisterationTable({
  data,
  slotOpen,
  setSlotOpen,
  handleSelectSlot,
  tableData,
  LTData,
  handleFilter,
  coupon,
  index,
  BarcodeLogic = "",
  handleDiscount,
  handleRateChange,
  handleQuantityChange,
  enableQuantitySelection = false,
  handlePLOChange,
  handleUrgent,
  handleRateTypePaymode,
  Edit,
  member,
  state,
  setTableData,
  selectedRateType,
  setSelectAllUrgent = () => {},
  isMobileView = false,
  allowOutsourceLab = false,
  outSourceLabOptions = [],
  processPLOData = () => {},
  isEditPatientDetails = false,
}) {
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [dos, setDos] = useState(false);
  const [showPackageOutSource, setShowPackageOutSource] = useState(false);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showRequiredFieldsModal, setShowRequiredFieldsModal] = useState(false);

  // Parse RequiredFeildList JSON string into an array of names
  const parsedRequiredFields = (() => {
    try {
      const parsed = JSON.parse(data?.RequiredFeildList);
      return Array.isArray(parsed) ? parsed.map(f => f.RequiredFeildName) : [];
    } catch {
      return [];
    }
  })();

  // Parse RequiredAttachment JSON string into an array
  const parsedAttachments = (() => {
    try {
      const parsed = JSON.parse(data?.RequiredAttachment);
      return Array.isArray(parsed) ? parsed : data?.RequiredAttachment ? [data.RequiredAttachment] : [];
    } catch {
      return data?.RequiredAttachment ? [data.RequiredAttachment] : [];
    }
  })();
  const location = useLocation();
  const [mouseHover, setMouseHover] = useState({
    index: -1,
    data: "",
  });
    const ValidateMRPValidationAtWorkOrder = useLocalStorage("userData", "get")?.ValidateMRPValidationAtWorkOrder;

    console.log("validate mrp", ValidateMRPValidationAtWorkOrder)
const mrpErrorShown = useRef(false);
//   useEffect(() => {
//   if (state?.HideAmount == 1) return;

//   const mrp = Number(data?.SetMRP);
//   const rate = Number(data?.Rate);

//   if (ValidateMRPValidationAtWorkOrder === 1 && mrp == 0 && !mrpErrorShown.current) {

//     toast.error("MRP not configured, please contact Account");
//     mrpErrorShown.current = true;
//   } else if (
//     ValidateMRPValidationAtWorkOrder == 1 && 
//     mrp > 0 && 
//     mrp < rate && 
//     !mrpErrorShown.current) {
//     toast.error("MRP not configured correctly, please contact Account");
//     mrpErrorShown.current = true;
//   }
// }, [data?.SetMRP, data?.Rate, state?.HideAmount]);

useEffect(() => {
  if (state?.HideAmount === 1) return;

  const mrp = Number(data?.SetMRP);
  const rate = Number(data?.Rate);

  if (mrpErrorShown.current) return;

  // ✅ Always validate mrp === 0
  // if (mrp === 0) {
  //   toast.error("MRP not configured, please contact Account");
  //   mrpErrorShown.current = true;
  // }

  // ✅ Validate mrp < rate only if flag = 1
  else if (
    ValidateMRPValidationAtWorkOrder === 1 &&
    mrp < rate
  ) {
    toast.error("MRP not configured correctly, please contact Account");
    mrpErrorShown.current = true;
  }

}, [data?.SetMRP, data?.Rate, state?.HideAmount, ValidateMRPValidationAtWorkOrder]);


  const { t } = useTranslation();
  const handleClose = () => {
    setShow(false);
  };

  const handleClose2 = () => {
    setShow2(false);
  };
  const hideRate = useLocalStorage("userData", "get")?.HideRate;

  const handleMainClose = () => {};
  const handleChangeDelieveryDate = (e, index, datas) => {
    console.log(datas);
    const data = [...tableData];
    if (e.target.checked) {
      data[index]["deleiveryDate"] = datas?.UrgentdeleiveryDate;
      data[index]["IsUrgent"] = 1;
      setTableData(data);
    } else {
      data[index]["deleiveryDate"] = datas?.DeliveryDate;
      data[index]["IsUrgent"] = 0;
      setTableData(data);
    }
  };

  console.log("dataxxx",data);


  return (
    <>
      {/* SlotBookModal is mounted once at the PatientRegistration.jsx level,
          not here — this component renders once per table row, and slotOpen
          is shared parent state, so mounting it here too meant every
          radiology row rendered its own instance simultaneously: N rows =
          N duplicate GetMacRadiologyAppointment/SaveMacRadiologyAppointment
          calls (harmless while booking needed a manual click, but the new
          auto-book-on-add flow made each of those duplicates actually book
          its own appointment). The gear icon below only needs to set
          slotOpen — it doesn't need to render the modal itself. */}

      <td data-title={t("S.No")}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {index + 1}&nbsp;
        </div>
      </td>
      {!isMobileView && (
        <td data-title={t("Slot")} className="text-center">
          {data?.Radiology == 1 ? (
            <i
              class="fa fa-gear fa-spin pointer text-success"
              onClick={() => {
                setSlotOpen({
                  data: data,
                  show: true,
                });
              }}
            />
           ) : (
            " - "
          )}
        </td>
      )}

      {isMobileView && (
        <td
          data-title={t("Item")}
          style={{ wordWrap: "break-word", whiteSpace: "normal" }}
        >
          {data?.TestName}
          {parsedAttachments.length > 0 && (
            <>
              <br />
              <small
                className={data?.AttachmentList === "Registration" ? "text-danger" : "text-primary"}
                style={{ fontWeight: "bold", cursor: "pointer", textDecoration: "underline dotted" }}
                title="Click to view all required attachments"
                onClick={() => setShowAttachmentModal(true)}
              >
                {parsedAttachments[0]}
                {parsedAttachments.length > 1 && (
                  <span style={{ marginLeft: "3px" }}>+{parsedAttachments.length - 1} more</span>
                )}
              </small>
            </>
          )}
          {parsedRequiredFields.length > 0 && (
            <>
              <br />
              <small
                className="text-danger"
                style={{ fontWeight: "bold", cursor: "pointer", textDecoration: "underline dotted" }}
                title="Click to view all required fields"
                onClick={() => setShowRequiredFieldsModal(true)}
              >
                {parsedRequiredFields[0]}
                {parsedRequiredFields.length > 1 && (
                  <span style={{ marginLeft: "3px" }}>+{parsedRequiredFields.length - 1} more</span>
                )}
              </small>
            </>
          )}
        </td>
      )}
      {!isMobileView && <td data-title={t("TestCode")}>{data.TestCode}</td>}
      {!isMobileView && (
      <td
        data-title={t("TestName")}
        style={{
          wordWrap: "break-word",
          whiteSpace: "normal",
        }}
      >
        <div
          onMouseEnter={() => {
            if (data?.SampleRemarks != "") {
              setMouseHover({
                index: index,
                data: data?.SampleRemarks,
              });
            }
          }}
          onMouseLeave={() => {
            if (data?.SampleRemarks != "") {
              setMouseHover({
                index: -1,
                data: "",
              });
            }
          }}
        >
          {mouseHover?.index === index && data?.SampleRemarks && (
            <div className="sampleremarktest">
              <span>{mouseHover?.data}</span>
            </div>
          )}
          {data?.TestName}
          <div style={{ color: data?.IsFasting === 1 && "red", fontWeight: "bold" }}>
            {data?.IsFasting=== 1 && "FastingReq"}
          </div>
        </div>
        {parsedAttachments.length > 0 && (
          <small
            className={data?.AttachmentList === "Registration" ? "text-danger" : "text-primary"}
            style={{ fontWeight: "bold", cursor: "pointer", textDecoration: "underline dotted" }}
            title="Click to view all required attachments"
            onClick={() => setShowAttachmentModal(true)}
          >
            {parsedAttachments[0]}
            {parsedAttachments.length > 1 && (
              <span style={{ marginLeft: "3px" }}>+{parsedAttachments.length - 1} more</span>
            )}
          </small>
        )}
        <br/>
        {parsedRequiredFields.length > 0 && (
          <small
            className="text-danger"
            style={{ fontWeight: "bold", cursor: "pointer", textDecoration: "underline dotted", marginLeft: parsedAttachments.length > 0 ? "0px" : "0px" }}
            title="Click to view all required fields"
            onClick={() => setShowRequiredFieldsModal(true)}
          >
            {parsedRequiredFields[0]}
            {parsedRequiredFields.length > 1 && (
              <span style={{ marginLeft: "3px" }}>+{parsedRequiredFields.length - 1} more</span>
            )}
          </small>
        )}
      </td>
      )}

      {/* Required Attachments Modal – rendered via portal to stay outside the <table> */}
      {showAttachmentModal && ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowAttachmentModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "24px 28px",
              minWidth: "280px",
              maxWidth: "420px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: data?.AttachmentList === "Registration" ? "#dc3545" : "#0d6efd" }}>
                Required Attachments
              </h6>
              <span
                style={{ cursor: "pointer", fontSize: "20px", lineHeight: 1, color: "#888" }}
                onClick={() => setShowAttachmentModal(false)}
              >
                &times;
              </span>
            </div>
            <ul style={{ paddingLeft: "18px", margin: 0 }}>
              {parsedAttachments.map((att, i) => (
                <li key={i} style={{ marginBottom: "6px", fontSize: "14px" }}>{att}</li>
              ))}
            </ul>
          </div>
        </div>,
        document.body
      )}

      {/* Required Fields Modal – rendered via portal to stay outside the <table> */}
      {showRequiredFieldsModal && ReactDOM.createPortal(
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowRequiredFieldsModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "10px",
              padding: "24px 28px",
              minWidth: "280px",
              maxWidth: "420px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h6 style={{ margin: 0, fontWeight: 700, color: "#dc3545" }}>
                Required Fields
              </h6>
              <span
                style={{ cursor: "pointer", fontSize: "20px", lineHeight: 1, color: "#888" }}
                onClick={() => setShowRequiredFieldsModal(false)}
              >
                &times;
              </span>
            </div>
            <ul style={{ paddingLeft: "18px", margin: 0 }}>
              {parsedRequiredFields.map((field, i) => (
                <li key={i} style={{ marginBottom: "6px", fontSize: "14px" }}>{field}</li>
              ))}
            </ul>
          </div>
        </div>,
        document.body
      )}
      {!isMobileView && (
        <td data-title={t("View")} onClick={() => setShow2(true)}>
          <i
            className={`fa fa-search ${
              data?.SampleRemarks != "" ? "requiredlabel" : ""
            }`}
          />
        </td>
      )}
      {!isMobileView && (
        <td onClick={() => setDos(true)} data-title={t("DOS")}>
          <i className="fa fa-home" />
        </td>
      )}
      <td data-title={t("MRP")}>
  {/* {state?.HideAmount == 1 ? (
    ""
  ) : ( */}
    <>
      {Number(data?.SetMRP) === 0 ? (
        <span
          style={{
            color: "red",
            fontSize: "11px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {Number(data?.SetMRP).toFixed(2)}
        </span>
      ) : Number(data?.SetMRP) < Number(data?.Rate) ? (
        <span
          style={{
            color: "orange",
            fontSize: "11px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {Number(data?.SetMRP).toFixed(2) }
        </span>
      ) : (
        Number(data?.SetMRP).toFixed(2)
      )}
    </>
  {/* )} */}
</td>
{console.log("data?.SetMRP",data?.SetMRP)}
      <td data-title={t("Rate")}>
        {state?.HideAmount == 1 || hideRate === 1 ? (
          ""
        ) : Number(data?.IsEditableOtherTestRate) === 1 ? (
          <input
            style={{ width: "60px" }}
            type="number"
            onInput={(e) => number(e, 20)}
            min={0}
            value={data?.Rate}
            onChange={(e) => handleRateChange(e.target.value, index)}
          />
        ) : (
          data?.Rate
        )}
      </td>
      {/* Screens that opt in render a matching Qty header; the others
          (e.g. ResearchRegistration) must keep their existing columns. */}
      {enableQuantitySelection && (
        <td data-title={t("Quantity")}>
          {Number(data?.Allowquantity) === 1 ? (
            <select
              value={Number(data?.Quantity) || 1}
              onChange={(e) => handleQuantityChange(e.target.value, index)}
              style={{ width: "52px" }}
              aria-label={t("Quantity")}
            >
              {[1, 2, 3, 4, 5, 6].map((quantity) => (
                <option key={quantity} value={quantity}>{quantity}</option>
              ))}
            </select>
          ) : (
            1
          )}
        </td>
      )}
      {!isMobileView && selectedRateType?.PayMode !== "Credit" && BarcodeLogic != 4 && <td data-title={t("Discount")}>
        {state?.HideAmount != 1 ? (
          <input
            className="discount-input-resp"
            style={{ width: "50px" }}
            type="number"
            min={0}
            step="any"
            value={data?.Discount}
            onChange={(e) => {
              if (coupon?.field == true) {
                toast.error("Remove Coupon First");
                return;
              }
              const discountCheck = validateRowDiscount(e.target.value, data?.Rate);
              if (!discountCheck.isValid) {
                toast.error(t(discountCheck.message));
                return;
              }
              handleDiscount(e.target.value, index);
            }}
            disabled={member ||
              LTData?.DiscountApprovedBy != "" ||
              isEditPatientDetails ||
              location.pathname === "/EditPatientDetails"
            }
          />
        ) : (
          ""
        )}
      </td>}
      {!isMobileView && selectedRateType?.PayMode === "Credit" && BarcodeLogic != 4 && <td data-title={t("NetAmount")}>
        {state?.HideAmount == 1 || hideRate === 1 ? (
          ""
        ) : (
          <input
            className="currency"
            value={Number(data?.NetAmount).toFixed(2)}
            disabled
            style={{ width: "50px" }}
          />
        )}
      </td>}
      {!isMobileView && <td data-title={t("DeliveryDate")}>{data.deliveryDate}</td>}
     {/* {
        selectedRateType?.PayMode === "Credit" && 
        BarcodeLogic != 4 &&  */}
      {[2,4].includes(selectedRateType?.SampleCollectionType) && (
       <td data-title={t("SC")}>
        <input
          //  className={`${[1, 2, 3, 5]?.includes(BarcodeLogic)  ? "d-block" : "d-none"}`}
          type="checkbox"
          name="Status"
          value={data?.Status}
          // disabled={data?.isDisable}
          // disabled={selectedRateType?.SampleCollectionType === 4}
          checked={data?.Status === 2 ? true : false}
          onChange={(e) => handlePLOChange(e, index)}
        />
      </td>
      )}
      {/* } */}
      <td data-title={t("IsUrgent")}>
        <input
          type="checkbox"
          name={"IsUrgent"}
          checked={data?.AttachmentList === "Registration" || !!data?.IsUrgent}
          // disabled={data?.isDisable}
          // onChange={(e) => {
          //   handleChangeDelieveryDate(e, index, data);
          // }}
          onChange={(e) => {
            handleChangeDelieveryDate(e, index, data);

            // Check if all urgent are now checked or unchecked
            const allChecked = tableData?.every(
              (item, idx) => idx === index ? e.target.checked : item.IsUrgent === 1
            );
            setSelectAllUrgent(allChecked);
          }}
        />
      </td>
      <td>
        {location.pathname === "/EditPatientDetails" ? (
          data?.isPrimary && (
            <CloseButton handleClick={() => handleFilter(data)} />
          )
        ) : (
          <CloseButton handleClick={() => handleFilter(data)} />
        )}
      </td>
      {allowOutsourceLab && (
        <td data-title={t("Outsource Lab")} style={{ minWidth: "200px", maxWidth: "250px", verticalAlign: "middle" }}>
          {(() => {
            const isPackage =
              data?.DataType === "Package" || Number(data?.IsPackage) === 1;
            const isOutsource =
              Number(data?.isOutSource) === 1 ||
              Number(data?.isLabOutSource) === 1;
            const packageTests = data?.packageOutSourceLabs || [];

            if (isPackage && packageTests.length > 0) {
              const selectedCount = packageTests.filter(
                (item) =>
                  Number(item?.isOutSource) === 1 && item?.LabOutsrcID,
              ).length;
              const totalCount = packageTests.filter(
                (item) => Number(item?.isOutSource) === 1,
              ).length;
              return (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  style={{ fontSize: "11px", whiteSpace: "nowrap" }}
                  onClick={() => setShowPackageOutSource(true)}
                >
                  {t("Select Lab")}
                  {totalCount > 0 ? ` (${selectedCount}/${totalCount})` : ""}
                </button>
              );
            }

            if (isOutsource) {
              const labOptions = buildOutSourceLabOptions(
                outSourceLabOptions,
                data?.InvestigationID || data?.InvestigationId,
              );
              return (
                <OutSourceLabSelect
                  options={labOptions}
                  value={data?.LabOutsrcID || ""}
                  placeholder={t("Select Lab")}
                  onChange={(selected) => {
                    const updated = [...tableData];
                    updated[index] = {
                      ...updated[index],
                      LabOutsrcID: selected?.value || "",
                      LabOutsrcName: selected?.labName || "",
                    };
                    setTableData(updated);
                    processPLOData(updated);
                  }}
                />
              );
            }

            return "-";
          })()}
        </td>
      )}
      {show2 && (
        <TestNameModal
          show={show2}
          onHandleShow={handleClose2}
          id={data?.InvestigationID}
        />
      )}
      {dos && (
        <DOSModal
          show={dos}
          LTData={LTData}
          onHandleShow={() => setDos(false)}
          id={data?.InvestigationID}
        />
      )}
      {showPackageOutSource && (
        <PackageOutSourceLabModal
          show={showPackageOutSource}
          packageName={data?.TestName}
          tests={data?.packageOutSourceLabs || []}
          outSourceLabOptions={outSourceLabOptions}
          onHide={() => setShowPackageOutSource(false)}
          onSave={(updatedTests) => {
            const updated = [...tableData];
            updated[index] = {
              ...updated[index],
              packageOutSourceLabs: updatedTests,
            };
            setTableData(updated);
            processPLOData(updated);
          }}
        />
      )}
    </>
  );
}

export default RegisterationTable;
