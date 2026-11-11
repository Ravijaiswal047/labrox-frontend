import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import Input from "../../../../components/formComponent/Input";
import VoucherDetailModal from "./VoucherDetailModal";
import {
  FinanceUpdateStatusBulk,
  FinanceVoucherPrint,
  PrintDownloadVoucher,
  SearchVoucher,
  UpdateVoucherPostingReview,
} from "../../../../NetworkServices/finance.js";
import { notify } from "../../../../utils/utils";
import { Tooltip } from "primereact/tooltip";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import ReviewAtModal from "./ReviewAtModal";
import CustomTooltip from "../../../../components/formComponent/CustomTooltip";
import { RedirectURL } from "../../../../NetworkServices/PDFURL";
import { downloadBase64File } from "../../../../utils/constant";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../../components/UI/customTable/HisTable";

const ViewVoucher = ({ data, values, setReload, handleSearch }) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [t] = useTranslation();

  const [modalData, setModalData] = useState({
    visible: false,
    component: null,
    size: null,
    Header: null,
    setVisible: false,
    prescription: null,
  });

  useEffect(() => {
    const upDatedData = data?.map((val) => {
      val["isEligible"] = true;
      val["isChecked"] = false;
      val["EligibleTitle"] = "";
      if (values?.type?.value === "1") {
        if (val?.IsVerify === 1 && val?.IsAuth === 0) {
          val["isChecked"] = true;
        } else if (val?.CanVerify === 1) {
          val["isChecked"] = false;
        } else {
          val["isEligible"] = false;
          val["EligibleTitle"] =
            `You are not eligible to Accountant Approval . for Voucher More than Limit  ${val?.VerifyLimit}  in Local Currency.`;
        }
      } else if (values?.type?.value === "2") {
        if (val?.IsAudit === 1 && Number(val.IsAudit) === 0) {
          val["isChecked"] = true;
        } else if (val?.IsAuth !== 1 && val?.CanAuth === 1) {
          val["isChecked"] = false;
        } else if (val?.IsAuth != 1 && val?.CanAuth != 1) {
          val["isEligible"] = false;
          val["EligibleTitle"] =
            `You are not eligible to MD/ED Approval . for Voucher More than Limit ${val?.AuthLimit} in Local Currency`;
        }
      } else if (values?.type?.value === "4") {
        if (val.IsAuthReviewed === 1 && Number(val.IsAuth) === 0) {
          val["isChecked"] = true;
        } else if (val.CanAuthReview == 1) {
          val["isChecked"] = false;
        } else {
          val["isEligible"] = false;
          val["EligibleTitle"] =
            `You are not eligible to DF- Finance Director Approval . for Voucher More than Limit ${val?.AuthReviewLimit} in Local Currency.`;
        }
      } else if (values?.type?.value === "5") {
        val["isChecked"] = false;
      }
      return val;
    });
    setTableData(upDatedData);
  }, [data]);
  const handleCustomInput = (index, name, value) => {
    const updatedBodyData = [...tableData];
    updatedBodyData[index][name] = value;

    setTableData(updatedBodyData);
  };
  const handleReview = async () => {
    setReload(true);
    const payload = {
      updatBulkData: selectedRows?.map((val, ind) => ({
        voucherNo: String(val?.VoucherNo),
        remark: String(val?.narration || ""),
        type: 1,
        status: 0,
        // type:Number (values?.type?.value),
        // status: Number(values?.status?.value)
      })),
      reviewType: "0",
    };
    try {
      const response = await UpdateVoucherPostingReview(payload);
      if (response?.success) {
        setReload(false);
        notify(response?.message, "success");
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleReviewAPI = async (data) => {
    const payload = tableData
      ?.filter((val) => val?.isChecked)
      ?.map((val) => {
        return {
          voucherNo: String(val?.VoucherNo || ""),
          remark: String(val?.InputNarrationValue || ""),
          type: data?.Status == 3 ? 0 : Number(values?.type?.value),
          status: data?.Status == 3 ? 1 : data?.Status,
        };
      });
    const finalPayload = {
      updatBulkData: payload,
      reviewType: data?.ReviewAt?.value,
    };
    // debugger
    let apiResp = await UpdateVoucherPostingReview(finalPayload);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      handleSearch(false);
      setModalData({ visible: false });
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const handleVerify = async (Status) => {
    // setReload(true);
    if (!tableData?.find((val) => val?.isChecked === true)) {
      notify("Please select at least one voucher", "error");
      return;
    }
    if (Status === 2 && values?.type?.value === "2") {
      setModalData({
        visible: true,
        size: "20vw",
        label: "Review At",
        modalData: {
          ReviewAt: { value: "1", label: "Verify User" },
          Status: Status,
        },
        // footer: <></>,
        handleAPI: handleReviewAPI,
        Component: <ReviewAtModal setModalData={setModalData} />,
      });
      return;
    }
    const payload = tableData
      ?.filter((val) => val?.isChecked)
      ?.map((val) => {
        return {
          voucherNo: String(val?.VoucherNo || ""),
          remark: String(val?.InputNarrationValue || ""),
          type: Status == 3 ? 0 : Number(values?.type?.value),
          status: Status == 3 ? 1 : Status,
        };
      });
    try {
      const response = await FinanceUpdateStatusBulk(payload);
      if (response?.success) {
        notify(response?.message, "success");
        handleSearch(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleAuthorize = async () => {
    setReload(true);
    const payload = selectedRows?.map((val) => {
      return {
        voucherNo: String(val?.VoucherNo || ""), // Fix bitwise OR issue
        remark: String(val?.narration || ""),
        type: 2,
        status: 1,
        // type:Number (values?.type?.value),
        //     status: Number(values?.status?.value)
      };
    });

    try {
      const response = await FinanceUpdateStatusBulk(payload);
      if (response?.success) {
        setReload(false);
        notify(response?.message, "success");
        setSelectedRows([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleUnVerify = async () => {
    setReload(true);
    const payload = selectedRows?.map((val) => {
      return {
        voucherNo: String(val?.VoucherNo || ""), // Fix bitwise OR issue
        remark: String(val?.narration || ""),
        // type:Number (values?.type?.value),
        //     status: Number(values?.status?.value)
        type: 1,
        status: 0,
      };
    });

    try {
      const response = await FinanceUpdateStatusBulk(payload);
      if (response?.success) {
        setReload(false);
        notify(response?.message, "success");
        setSelectedRows([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCancel = async () => {
    // done
    setReload(true);
    const payload = selectedRows?.map((val, ind) => ({
      voucherNo: String(val?.VoucherNo),
      remark: String(val?.narration),
      type: 0,
      status: 1,
    }));

    try {
      const response = await FinanceUpdateStatusBulk(payload);
      if (response?.success) {
        setReload(false);
        notify(response?.message, "success");
        setSelectedRows([]);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // Handle individual row selection
  const handleRowSelect = (val, index, isChecked) => {
    const updatedSelectedRows = [...tableData];
    updatedSelectedRows[index].isChecked = isChecked;
    setTableData(updatedSelectedRows);
  };

  // Handle "Select All" functionality
  const handleSelectAll = (e) => {
    // {handleDisabledCheckbox(val)?false:val?.isChecked}
   let updatedSelectedRows = JSON.parse(JSON.stringify(tableData)).map((val, index) => {
      if (handleDisabledCheckbox(val)) {
        val.isChecked = false;
      } else {
        val.isChecked = e.target.checked;
      }
      return val;
    });
    // updatedSelectedRows
    // debugger
    setTableData(updatedSelectedRows);
  };
console.log("Asdasdadasd",tableData)
  const selectAllRef = useRef(null);
  const areAllSelected =
    selectedRows.length === tableData.length && tableData.length > 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedRows.length > 0 && selectedRows.length < tableData.length;
    }
  }, [selectedRows, tableData.length]);

  const isMobile = window.innerWidth <= 800;
  console.log("TypeType", values?.type?.value);
  const thead = [
    { name: t("S.No."), width: "1%" },
    {
      name: isMobile ? (
        t("check")
      ) : (
        <input
          type="checkbox"
          className="table-checkbox"
          style={{ marginRight: "20px" }}
          ref={selectAllRef}
          disabled={values?.type?.value === "5" ? true : false}
          // checked={areAllSelected}
          onChange={handleSelectAll}
        />
      ),
      width: "1%",
    },
    { name: t("Max Approval Level"), width: "5%" },
    { name: t("Voucher No."), width: "5%" },
    { name: t("Voucher Date"), width: "5%" },
    { name: t("Invoice No."), width: "4%" },
    { name: t("Currency"), width: "10%" },
    { name: t("Prepaired By"), width: "2%" },
    { name: t("Amount"), width: "4%" },
    { name: t("Status"), width: "2%" },
    // { name: t("Review Verify Narration"), width: "2%" },
    { name: t("Narration"), width: "10%" },
    { name: t("Action"), width: "10%" },
    // { name: t("Details"), width: "2%" },
    // { name: t("Print"), width: "2%" },
    // { name: t("View Document"), width: "2%" },
  ];

  if (data?.length > 0) {
    thead.splice(10, 0, { name: data[0]?.LabelNarrationHeader, width: "2%" });
  }

  const handleView = async (VoucherNo) => {
    try {
      // const response = await SearchVoucher(2, VoucherNo);
      let payalod = {
        filterType: 2,
        voucherNo: VoucherNo ? VoucherNo : "",
        fromDate: "",
        toDate: "",
      };

      let response = await SearchVoucher(payalod);

      if (response?.success && response?.data) {
        console.log("Response Data:", response.data);
        setModalData({
          visible: true,
          size: "80vw",
          Heading: "60vh",
          label: "Supplier Advance",
          footer: <></>,
          Component: <VoucherDetailModal details={response.data} />,
          handleAPI: () => {},
        });
      }
    } catch (error) {
      console.error("Error fetching voucher details:", error);
    }
  };

  const getRowClass = (val) => {
    // if (val?.AppStatus === "True") {
    return val?.ParticularStatusColor;
    // }
  };
  const handlePrint = async (voucherNo) => {
    const payload = {
      voucherNo: voucherNo,
    };

    const response = await FinanceVoucherPrint(payload);
    if (response?.success) {
      RedirectURL(response?.data?.pdfUrl);
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };
  const handleAttach = async (VoucherNo) => {
    try {
      if (!VoucherNo) {
        notify("Voucher No is required", "error");
        return;
      }

      const response = await PrintDownloadVoucher(VoucherNo);

      if (response?.success) {
        downloadBase64File(response?.data?.base64, response?.data?.fileName);
        notify("Files downloaded successfully", "success");
      } else {
        notify(response?.message || "Failed to Download Voucher", "error");
      }
    } catch (error) {
      notify(error?.message || "Network error", "error");
    }
  };
  const handleDisabledCheckbox = (val) => {
    if (val?.IsFinalize === 1) {
      return true;
    } else if (values?.type?.value === "5") {
      return true;
    }
  };

  return (
    <>
      {modalData?.visible && (
        <FinanceModal
          visible={modalData.visible}
          Header={modalData?.label}
          modalWidth={modalData?.size}
          setVisible={() => setModalData({ ...modalData, visible: false })}
          footer={modalData?.footer}
          handleAPI={modalData?.handleAPI}
          modalData={modalData?.modalData}
        >
          {modalData?.Component}
        </FinanceModal>
      )}

      <HisTable
        style={{ maxHeight: "45vh" }}
        thead={thead}
        scrollView={"scrollView"}
        tbody={JSON.parse(JSON.stringify(tableData))?.map((val, index) => ({
          id: 1 + index,
          checkbox: val?.isEligible ? (
            <input
              type="checkbox"
              className="table-checkbox"
              style={{ marginRight: "20px" }}
              disabled={handleDisabledCheckbox(val)}
              checked={handleDisabledCheckbox(val) ? false : val?.isChecked}
              onChange={(e) => handleRowSelect(val, index, e?.target?.checked)}
            />
          ) : (
            <>
              <Tooltip
                target={`#NotEligible${index}`}
                position="top"
                content={val?.EligibleTitle}
                event="hover"
                className="ToolTipCustom"
              />
              <strong style={{ color: "red" }} id={`NotEligible${index}`}>
                Not Eligible
              </strong>
            </>
          ),
          MaxApprovalLevel: val?.MaxApprovalLevel,
          voucherNo: val?.VoucherNo,
          voucherDate: val?.VoucherDate,
          invoiceNo: val?.BillNo,
          currencyName: val?.CurrencyCode,
          preparedBy: val?.EntryBy,
          amount: val?.AmountWithoutFormating,
          status: val?.ParticularStatus,
          dynamicsFiels: val?.LabelNarrationValue,

          narration: (
            <div style={{ width: "150px" }}>
              <Input
                type="text"
                className="table-input"
                name="InputNarrationValue" // Unique name
                value={val?.InputNarrationValue} // Default empty string agar value na ho
                removeFormGroupClass={true}
                respclass="mt-1"
                onChange={(e) =>
                  handleCustomInput(
                    index,
                    "InputNarrationValue",
                    e.target.value,
                  )
                }
              />
            </div>
          ),

          Action: (
            <>
              <CustomTooltip
                id={`eye${index}`}
                content={"View Voucher"}
                icon={
                  <i
                    className="fa fa-eye pr-2"
                    aria-hidden="true"
                    id={`eye${index}`}
                    onClick={() => handleView(val?.VoucherNo)}
                  ></i>
                }
              />

              <Tooltip
                target={`#print${index}`}
                position="top"
                content={t("Print Voucher")}
                event="hover"
                className="ToolTipCustom"
              />
              <i
                className="fa fa-print px-2"
                aria-hidden="true"
                id={`print${index}`}
                onClick={() => handlePrint(val?.VoucherNo)}
              ></i>
              <CustomTooltip
                id={`paperclip${index}`}
                content="Download Attachment"
                icon={
                  <i
                    className={`fa fa-paperclip px-2 ${!val?.FileNamePath && "text-muted"} `}
                    id={`paperclip${index}`}
                    aria-hidden="true"
                    onClick={() => {
                      val?.FileNamePath && handleAttach(val?.VoucherNo);
                    }}
                  ></i>
                }
              />
              {/* <Tooltip
                target={`#file${index}`}
                position="top"
                content={t("View Document")}
                event="hover"
                className="ToolTipCustom"
              />
              <i
                className="fa fa-file pl-2"
                aria-hidden="true"
                id={`file${index}`}
              ></i> */}
            </>
          ),
          colorcode: getRowClass(val),
        }))}
      />

      <div className={"col-12 mt-2 mb-2 text-right"}>
        {values.type?.value === "1" && (
          <>
            {values?.status?.value === "1" ? (
              <button
                className="btn btn-primary btn-sm px-4 ml-1"
                onClick={() => {
                  handleVerify(0);
                }}
              >
                {t("UnApproved Accountant Approval")}
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm px-4 ml-1"
                onClick={() => {
                  handleVerify(1);
                }}
              >
                {t("Accountant Approval Done")}
              </button>
            )}
          </>
        )}
        {values.type?.value === "2" && (
          <>
            {values?.status?.value === "0" && (
              <button
                className="btn btn-primary btn-sm px-4 ml-1"
                onClick={() => {
                  handleVerify(1);
                }}
              >
                {t("ED Approval Done")}
              </button>
            )}
          </>
        )}
        {values.type?.value === "3" && (
          <>
            <button className="btn btn-primary btn-sm px-4 ml-1">
              {t("Review Verify")}
            </button>
            <button className="btn btn-primary btn-sm px-4 ml-1">
              {t("Review Un-Verify")}
            </button>
          </>
        )}
        {values.type?.value === "4" && (
          <>
            {values?.status?.value === "1" ? (
              <button
                className="btn btn-primary btn-sm px-4 ml-1"
                onClick={() => {
                  handleVerify(0);
                }}
              >
                {t("UnApproved DF- Finance Director Approval")}
              </button>
            ) : (
              <button
                className="btn btn-primary btn-sm px-4 ml-1"
                onClick={() => {
                  handleVerify(1);
                }}
              >
                {t("DF- Finance Director Approval Done")}
              </button>
            )}
          </>
        )}

        {values.status?.value === "0" && values.type?.value !== "5" && (
          <>
            <button
              className="btn btn-primary btn-sm px-4 ml-1"
              onClick={() => {
                handleVerify(2);
              }}
            >
              {t("Review")}
            </button>
            <button
              className="btn btn-primary btn-sm px-4 ml-1"
              onClick={() => {
                handleVerify(3);
              }}
            >
              {t("Cancel")}
            </button>
          </>
        )}
      </div>

      {/* {values.type?.value === "2" && values?.status?.value === "1" ? (
        ""
      ) : (
        <div >
          {values.type?.value === 2 && values?.status?.value === "0" ? (
            <button
              className="btn btn-primary btn-sm px-4 ml-1"
              onClick={handleAuthorize}
            >
              {t("Authorize")}
            </button>
          ) : values.type?.value === 1 && values?.status?.value === "0" ? (
            <button
              className="btn btn-primary btn-sm px-4 ml-1"
              onClick={handleVerify}
            >
              {t("Verify")}
            </button>
          ) : values.type?.value === 1 && values?.status?.value === "1" ? (
            <button
              className="btn btn-primary btn-sm px-4 ml-1"
              onClick={handleUnVerify}
            >
              {t("Un Verify")}
            </button>
          ) : null}

          <button
            className="btn btn-primary btn-sm px-4 ml-1"
            onClick={handleReview}
          >
            {t("Review")}
          </button>
          <button
            className="btn btn-primary btn-sm px-4 ml-1"
            onClick={handleCancel}
          >
            {t("Voucher Cancel")}
          </button>
        </div>
      )} */}
    </>
  );
};

export default ViewVoucher;
