import React, { useState, useEffect } from "react";
import Heading from "../../../components/UI/Heading";
// import {ReactSelect} from "../../../components/formComponent/ReactSelect";
import {
  filterByTypes,
  handleReactSelectDropDownOptions,
  notify,
} from "../../utils/Utils";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePickerHis";
import {
  bindVoucherBillingScreenControls,
  FinanceSavePettyCashPosting,
  FinanceSearchPettyCashVoucher,
  FinanceSearchPostingPettyCashEntry,
  FinanceUpdatePettyCashVoucherStatus,
  GetCOACurrentClosingBalance,
} from "../../../NetworkServices/Pettycash";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import Tables from "../../../components/UI/customTable";
import CustomSelect from "../../../components/formComponent/CustomSelect";
import PettyCashPostingModal from "./PettyCashPostingModal";
import moment from "moment";
import { Tooltip } from "primereact/tooltip";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { FinanceVoucherPrint } from "../../../NetworkServices/finance.js";
import { RedirectURL } from "../../../NetworkServices/PDFURL";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../components/UI/customTable/HisTable";
function PettyCashPosting() {
  const [t] = useTranslation();
  const [tableData, setTableData] = useState([]);
  console.log("tableData", tableData);
  const [SearchTableData, setSearchTableData] = useState([]);
  const [modalData, setModalData] = useState({ visible: false });
  const [totalPostingAmount, setTotalPostingAmount] = useState(0);
  const [list, setList] = useState([]);

  const [values, setValues] = useState({
    postingDate: new Date(),
    finalRemark: "",
    SearchToDate: new Date(),
    SearchfromDate: new Date(),
    cashChart: "",
    currency: "",
    fromDate: new Date(),
    toDate: new Date(),
    branchCenter: { label: "All", value: "0" },
  });
  console.log("values", values);

  const [dropDownState, setDropDownState] = useState({
    PaymentMode: [],
  });

  const handleAllCheck = (e) => {
    setTableData(
      tableData?.map((val) => ({
        ...val,
        isChecked: e.target.checked,
      }))
    );
  };

  console.log("modalData", modalData, list, tableData);

  const THEAD = [
    {
      name: (
        <>
          <input
            onChange={(e) => handleAllCheck(e)}
            type="checkbox"
            checked={tableData?.every((val) => val?.isChecked === true)}
          />
        </>
      ),
      width: "1%",
    },
    { name: "S.No.", width: "1%" },
    { name: "Entry No." },
    { name: "Entry Date", width: "2%" },
    { name: "Branch Center" },
    { name: "Document No.", width: "3%" },
    { name: "Expense Type" },
    { name: "Appr. Amt.", width: "2%" },
    { name: "Expense A/C" },
    { name: "Remark" },
    { name: "Cost Center", width: "3%" },
  ];
  const SEARCHTHEAD = [
    { name: "S.No.", width: "1%" },
    { name: "Voucher No." },
    { name: "Voucher Date" },
    { name: "Branch Center" },
    { name: "Amount" },
    { name: "Petty Cash A/C" },
    { name: "Entry Date" },
    { name: "Entry By" },
    { name: "Verify Status" },
    { name: "Auth. Status" },
    { name: "Action" },
  ];
  const [PettyCash, setPettyCash] = useState([]);
  const { VITE_DATE_FORMAT } = import.meta.env;

  const handleSelect = (name, value) => {
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlebindVoucherBillingScreenControls = async (data) => {
    try {
      const response = await bindVoucherBillingScreenControls(data);
      if (response.success) {
        const pettyCash = filterByTypes(
          response?.data,
          [12],
          ["TypeID"],
          "TextField",
          "ValueField"
        );
        const country = filterByTypes(
          response?.data,
          [4],
          ["TypeID"],
          "TextField",
          "ValueField"
        );
        const paymentMode = filterByTypes(
          response?.data,
          [10],
          ["TypeID"],
          "TextField",
          "ValueField"
        );

        const expenseType = filterByTypes(
          response?.data,
          [13],
          ["TypeID"],
          "TextField",
          "ValueField"
        );

        setDropDownState((val) => ({
          ...val,
          PaymentMode: paymentMode,
          expenseType: expenseType,
        }));

        if (country?.length > 0) {
          setValues((val) => ({
            ...val,
            Currency: { value: country[0]["value"] },
          }));
        }
        setPettyCash(pettyCash);
        setList(response?.data);
      } else {
        console.error(
          "API returned success as false or invalid response:",
          response
        );
        setPettyCash([]);
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      setPettyCash([]);
    }
  };

  const handleCloseModal = (ele, data) => {
    if (data?.RemAmt === 0) {
      setModalData((val) => ({ ...val, visible: false }));
    } else {
      notify(
        "Cost Centre Bifurcation Total should be equal to Cost Centre Amount",
        "error"
      );
    }
  };

  const handleCOACurrentClosingBalance = async (coaId) => {
    try {
      const response = await GetCOACurrentClosingBalance(values?.center?.value);
      if (response.success) {
        setValues((val) => ({
          ...val,
          ClosingBalance: response?.data[0]?.ClosingBal,
        }));
      } else {
        console.error(
          "API returned success as false or invalid response:",
          response
        );
        setValues((val) => ({
          ...val,
          ClosingBalance: 0,
        }));
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      setPettyCash([]);
    }
  };

  useEffect(() => {
    handlebindVoucherBillingScreenControls(1);
  }, []);

  useEffect(() => {
    if (values?.center?.value) {
      handleCOACurrentClosingBalance();
    }
  }, [values?.center?.value]);

  const handleCustomInput = (index, name, value) => {
    const data = [...tableData];
    data[index][name] = value;
    setTableData(data);
  };

  const handleOpenCostCentre = (data, index) => {
    setModalData({
      visible: true,
      width: "60vw",
      label: t("Cost Centre"),
      handleCloseModal: handleCloseModal,
      buttonName: "Save",
      CallAPI: () => {},
      modalData: {},
      footer: <></>,
      Component: (
        <PettyCashPostingModal
          setModalData={setModalData}
          inputs={{ ...data, index: index }}
          setOldBodyData={setTableData}
          tbody={tableData}
          list={list}
        />
      ),
    });
  };

  const handleSave = async () => {
    const filteredData = tableData?.filter((val) => val?.isChecked === true);
    // if (filteredData?.length === 0) {
    //   notify("Please select at least one row", "error");
    //   return;
    // }
    if (!values?.finalRemark) {
      notify("Please Enter Final Remark", "error");
      return;
    }
    else if(!values?.postingDate){
      notify("Please Select Posting Date", "error");
      return
    }
    
    if (filteredData?.some((val) => val?.Remarks === "" || !val?.expenseAc)) {
      notify("All Selected Rows Should Have Remarks & Expense A/C", "error");
      return;
    }
    let finEntryDetail = [];
    let ccList = [];
    // if (filteredData?.length === 0) {
    finEntryDetail.push({
      PDCDate: "00001-01-01",
      OldVoucherNo: "",
      COAID: values?.center?.value,
      AccountName: values?.center?.label,
      AmountBase: totalPostingAmount,
      AmountSpecific: totalPostingAmount,
      BalType: "Cr",
      DocumentDate: moment(values?.postingDate).format("DD-MMM-YYYY"),
      DocumentNo: "",
      Remarks: values?.finalRemark,
      AdjustmentBaseAmount: 0,
      AdjustmentSpecificAmount: 0,
      IsPDC: 0,
      RefNo: "",
      RefDate: "0001-01-01",
      PaymentModeID: 1,
      PaymentMode: "Cash",
      BankCode: "",
      BranchCode: "",
      ReceiptMode: "O",
      BillNo: "",
      BillDate: moment(values?.postingDate).format("DD-MMM-YYYY"),
      CurrencyCode: values?.Currency?.value,
      TransCurrFactor: 1,
      ActualCurrFactor: 1,
      DepartmentCode: "",
      PCEntryID: 0,
      PCEntryNo: "",
      PCEntryDate: "0001-01-01",
      RequestAmount: 0,
    });
    // }
    
    filteredData?.map((val) => {
      finEntryDetail.push({
        coaid: val?.COAID,
        accountName: val?.AccountName,
        amountBase: val?.ApprovedAmount * val?.TransCurrFactor, //
        AmountSpecific: val?.ApprovedAmount, //
        BalType: "Dr", //
        documentDate: val?.DocumentDate,
        documentNo: val?.DocumentNo,
        remarks: val?.Remarks,
        adjustmentBaseAmount: 0,
        adjustmentSpecificAmount: 0,
        vatAmt: 0,
        isPDC: 0,
        refNo: "",
        refDate: "0001-01-01",
        paymentModeID: "1",
        paymentMode: "Cash",
        bankCode: "",
        branchCode: "",
        receiptMode: "0",
        billNo: val?.PCEntryNo,
        billDate: val?.PCEntryDate,
        pdcDate: "",
        entryDetailID: 0,
        isCheckBounce: 0,
        oldVoucherNo: "",
        isBankCharges: 0,
        pendingVatAmt: 0,
        adjustTaxAmount: 0,
        branchCentreID: val?.BranchCentreID,
        departmentCode: val?.DepartmentCode,
        currencyCode: val?.CurrencyCode,
        transCurrFactor: val?.TransCurrFactor,
        actualCurrFactor: val?.ActualCurrFactor,
        pcEntryID: val?.PCEntryID,
        pcEntryNo: val?.PCEntryNo,
        pcEntryDate: val?.PCEntryDate,
        pettyCashCOAID: val?.COAID,
        expenseTypeCode: val?.ExpenseTypeCode,
        requestAmount: val?.RequestAmount,
      });
      if (val?.ccList?.length > 0) {
        val?.ccList?.map((item) => {
          ccList.push({
            mainSNo: 0,
            departmentCode: item?.dept?.value,
            costCentreCode: item?.costCenter?.value,
            departmentName: item?.dept?.label,
            reqAreaName: "",
            costCentreName: item?.costCenter?.label,
            amount: item?.amount,
            autoSRNo: 0,
          });
        });
      }
    });
    const ip = useLocalStorage("ip", "get");
    const pageUrl = window.location.pathnameth;
    const payload = {
      voucherType: "CP",
      voucherDate: moment(new Date()).format("DD-MM-YYYY"),
      entryType: 1,
      ipAddress: ip,
      macAddress: ip,
      pageURL: pageUrl,
      finEntryDetail: finEntryDetail,
      finEntryCCDetail: ccList,
    };

    const response = await FinanceSavePettyCashPosting(payload);
    if (response?.success) {
      setTableData([]);
      setValues({
        finalRemark: "",
        SearchToDate: new Date(),
        SearchfromDate: new Date(),
        center: { label: "All", value: "0" },
        cashChart: "",
        currency: "",
        fromDate: new Date(),
        toDate: new Date(),
      });
      notify(response?.message, "success");
      handleSearchData();
    } else {
      notify(response?.message, "error");
    }
  };

  const handlePrint = async (value, index) => {
    const payload = {
      voucherNo: value?.VoucherNo,
    };

    const response = await FinanceVoucherPrint(payload);
    if (response?.success) {
      RedirectURL(response?.data?.pdfUrl);
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  const handleSearch = async () => {
    if (!values?.center?.value) {
      notify("Please Select Petty Cash A/C", "error");
      return 0;
    } else if (!values?.fromDate) {
      notify("Please Select From Date", "error");
      return 0;
    } else if (!values?.toDate) {
      notify("Please Select To Date", "error");
      return 0;
    }
    const payload = {
      coaID: values?.center?.value,
      entryNo: values?.entryNo || "",
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY") || new Date(),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY") || new Date(),
    };

    const response = await FinanceSearchPostingPettyCashEntry(payload);
    if (response?.success) {
      setTableData(
        response?.data?.map((val) => ({ ...val, isChecked: false, ccList: [] }))
      );
    } else {
      notify(response?.message, "error");
      setTableData([]);
    }
  };

  const handleCheck = (e, index) => {
    const data = [...tableData];
    data[index]["isChecked"] = e.target.checked;
    setTableData(data);
  };

  useEffect(() => {
    const filteredTableData = tableData?.filter(
      (val) => val?.isChecked === true
    );
    setTotalPostingAmount(
      filteredTableData?.reduce((a, b) => a + b?.ApprovedAmount, 0)
    );
  }, [tableData]);

  const handleSearchData = async () => {
    if (!values?.SearchToDate) {
      notify("Please Select To Date", "error");
      return 0;
    } else if (!values?.SearchfromDate) {
      notify("Please Select From Date", "error");
      return 0;
    }

    const payload = {
      voucherNo: values?.SearchEntryNo || "",
      fromDate:
        moment(values?.SearchfromDate).format("DD-MMM-YYYY") || new Date(),
      toDate: moment(values?.SearchToDate).format("DD-MMM-YYYY") || new Date(),
    };

    const response = await FinanceSearchPettyCashVoucher(payload);
    if (response?.success) {
      setSearchTableData(response?.data);
    } else {
      notify(response?.message, "error");
      setTableData([]);
    }
  };

  const handleUpdateRequestStatus = async (
    entryType,
    entryStatus,
    VoucherNo,
    AuditRemark
  ) => {
    const payload = {
      entryType: entryType,
      entryStatus: entryStatus,
      voucherNo: VoucherNo,
      auditRemark: AuditRemark,
    };

    const response = await FinanceUpdatePettyCashVoucherStatus(payload);
    if (response?.success) {
      notify(response?.message, "success");
      handleSearchData();
    } else {
      notify(response?.message, "error");
    }
  };

  return (
    <>
      <div className="mt-2 spatient_registration_card card">
        <Heading
          name={t("Petty Cash Posting")}
          isBreadcrumb={true}
        />

        <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
          <ReactSelect
            placeholderName={t("Petty Cash A/C")}
            className={"required-fields"}
            id={"center"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            dynamicOptions={[
              ...handleReactSelectDropDownOptions(
                PettyCash,
                "TextField",
                "ValueField"
              ),
            ]}
            onChange={handleSelect}
            value={`${values?.center?.value}`}
            name={"center"}
          />

          <div className="col-xl-2 col-md-4 col-sm-4 col-12">
            <LabeledInput
              name="currency"
              id="currency"
              label={t("Currency")}
              value={values?.Currency?.value}
            />
          </div>

          <Input
            disabled={true}
            type="text"
            className="form-control"
            id="cashinhand"
            placeholder=" "
            name="cashinhand"
            value={values?.ClosingBalance || 0}
            onChange={handleChange}
            lable={t("Cash In Hand")}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />

          <DatePicker
            id="fromDate"
            className="custom-calendar"
            name="fromDate"
            lable={t("From Date")}
            value={values?.fromDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />

          <DatePicker
            id="toDate"
            className="custom-calendar"
            name="toDate"
            lable={t("To Date")}
            value={values?.toDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />

          <Input
            type="number"
            className="form-control"
            id="entryNo"
            placeholder=" "
            name="entryNo"
            value={values?.entryNo || ""}
            onChange={handleChange}
            lable={t("Entry No")}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />

          <div className="col-sm-2 col-xl-1">
            <button
              className="btn btn-sm btn-primary"
              type="button"
              onClick={handleSearch}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </div>

      {tableData?.length > 0 && (
        <>
          <HisTable
            thead={THEAD}
            tbody={tableData?.map((val, index) => ({
              checkbox: (
                <input
                  type="checkbox"
                  checked={val?.isChecked}
                  onChange={(e) => handleCheck(e, index)}
                />
              ),
              Sno: index + 1,
              "Entry No": val?.PCEntryNo,
              "Entry Date": val?.EntryDate,
              "Branch Center": val?.BranchCentre,
              "Doc No.": val?.DocumentNo,
              "Expense Type": val?.ExpenseType,
              "App. Amt.": val?.ApprovedAmount,
              "Expense Amt": (
                <CustomSelect
                  placeHolder={t("Expense A/C")}
                  className={"required-fields"}
                  name="expenseAc"
                  onChange={(name, e) => {
                    handleCustomInput(index, "expenseAc", e);
                  }}
                  isDisable={val?.isChecked === true ? false : true}
                  isRemoveSearchable={true}
                  value={val?.expenseAc?.value}
                  option={handleReactSelectDropDownOptions(
                    dropDownState?.expenseType,
                    "TextField",
                    "ValueField"
                  )}
                />
              ),
              Remarks: (
                <Input
                  type="text"
                  className="table-input"
                  name="Remarks"
                  disabled={val?.isChecked === true ? false : true}
                  value={val?.Remarks ? val?.Remarks : ""}
                  removeFormGroupClass={true}
                  onChange={(e) =>
                    handleCustomInput(index, "Remarks", e.target?.value)
                  }
                  respclass="mt-1 w-100"
                />
              ),
              "C.C": (
                <>
                  {val?.isChecked && (
                    <button
                      className="btn btn-sm btn-primary px-2 table-btn w-100"
                      onClick={() => {
                        handleOpenCostCentre(val, index);
                      }}
                    >
                      {t("cc")}
                    </button>
                  )}
                </>
              ),
            }))}
          />
          <div className="card">
            <div className="row p-2">
              <div className="col-xl-2 col-md-4 col-sm-6 col-12 mb-2">
                <LabeledInput
                  label={t("Total Posting Amount")}
                  value={totalPostingAmount}
                />
              </div>
              <DatePicker
                className="custom-calendar"
                respclass="col-xl-2 col-md-4 col-sm-6 col-12"
                id="postingDate"
                name="postingDate"
                value={
                  values?.postingDate
                    ? moment(values?.postingDate).toDate()
                    : new Date()
                }
                maxDate={new Date()}
                handleChange={handleChange}
                lable={t("Posting Date")}
                placeholder={VITE_DATE_FORMAT}
              />
              <Input
                type="text"
                className="form-control required-fields"
                id="finalRemark"
                placeholder=" "
                name="finalRemark"
                value={values?.finalRemark || ""}
                onChange={handleChange}
                lable={t("Final Remark")}
                respclass="col-xl-2 col-md-4 col-sm-6 col-12"
              />
              <button className="btn btn-success" onClick={handleSave}>
                {t("Save")}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="card">
        <Heading title={"Previous Voucher's List"} isBreadcrumb={false} />
        <div className="row p-2">
          <Input
            type="text"
            className="form-control"
            id="entryNo"
            placeholder=" "
            name="entryNo"
            value={values?.SearchEntryNo}
            onChange={handleChange}
            lable={t("Entry No.")}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />
          <DatePicker
            id="SearchfromDate"
            className="custom-calendar"
            name="SearchfromDate"
            lable={t("From Date")}
            value={values?.SearchfromDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />

          <DatePicker
            id="SearchToDate"
            className="custom-calendar"
            name="SearchToDate"
            lable={t("To Date")}
            value={values?.SearchToDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          />
          <button className="btn btn-sm btn-primary" onClick={handleSearchData}>
            {t("Search")}
          </button>
        </div>
        <HisTable
          thead={SEARCHTHEAD}
          tbody={SearchTableData?.map((val, index) => ({
            Sno: index + 1,
            VouNo: val?.VoucherNo,
            "Vou Date": val?.VoucherDate,
            "Branch Center": val?.BranchCentre,
            Amt: val?.VoucherAmount,
            "PettyCashA/C": val?.PettyCashAccount,
            EntryDate: val?.EntryDate,
            EntryBy: val?.EntryBy,
            VerifyStatus: val?.IsVerify,
            AuthStatus: val?.IsAuth,
            Action: (
              <div>
                {/* Verify */}
                {val.IsVerifyEdit === 1 ? (
                  val.IsVerify === "No" ? (
                    <>
                      <Tooltip
                        target={`#check${index}`}
                        position="top"
                        content={t("Verify")}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        id={`check${index}`}
                        className="fa fa-check"
                        style={{ color: "green", marginLeft: "12px" }}
                        onClick={() =>
                          handleUpdateRequestStatus(2, "No", val?.VoucherNo, "")
                        }
                      ></span>
                    </>
                  ) : (
                    <>
                      <Tooltip
                        target={`#unBan${index}`}
                        position="top"
                        content={t("Un-Verify")}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        className="fa fa-ban"
                        style={{ color: "red", marginLeft: "12px" }}
                        id={`unBan${index}`}
                        onClick={() =>
                          handleUpdateRequestStatus(
                            2,
                            "Yes",
                            val?.VoucherNo,
                            ""
                          )
                        }
                      ></span>
                    </>
                  )
                ) : null}

                {/* Auth */}
                {val.IsAuthEdit === 1 ? (
                  val.IsAuth === "No" ? (
                    <>
                      <Tooltip
                        target={`#auth${index}`}
                        position="top"
                        content={t("Authorize")}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        style={{ color: "green" }}
                        id={`auth${index}`}
                        className="fa fa-lock ml-2"
                        onClick={() =>
                          handleUpdateRequestStatus(3, "No", val?.VoucherNo, "")
                        }
                      ></span>
                    </>
                  ) : (
                    <>
                      <Tooltip
                        target={`#unauth${index}`}
                        position="top"
                        content={t("Un-Authorize")}
                        event="hover"
                        className="ToolTipCustom"
                      />
                      <span
                        style={{ color: "red", marginLeft: "12px" }}
                        className="fa fa-lock-open"
                        id={`unauth${index}`}
                        onClick={() =>
                          handleUpdateRequestStatus(
                            3,
                            "Yes",
                            val?.VoucherNo,
                            ""
                          )
                        }
                      ></span>
                    </>
                  )
                ) : null}

                {/* Print */}
                <>
                  <Tooltip
                    target={`#print${index}`}
                    position="top"
                    content={t("Print")}
                    event="hover"
                    className="ToolTipCustom"
                  />
                  <span
                    id={`print${index}`}
                    className="fa fa-print ml-2"
                    onClick={() => {
                      handlePrint(val, index);
                    }}
                  ></span>
                </>
              </div>
            ),
          }))}
        />
        {modalData?.visible && (
          <FinanceModal
            visible={modalData?.visible}
            setVisible={(ele, data) => {
              modalData?.handleCloseModal(ele, data);
            }}
            modalData={modalData?.modalData}
            modalWidth={modalData?.width}
            Header={modalData?.label}
            buttonType="button"
            buttonName={modalData?.buttonName}
            footer={modalData?.footer}
            handleAPI={modalData?.CallAPI}
          >
            {modalData?.Component}
          </FinanceModal>
        )}
      </div>
    </>
  );
}

export default PettyCashPosting;
