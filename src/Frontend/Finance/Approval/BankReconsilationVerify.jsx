import React, { useEffect, useState, useRef } from "react";
import Heading from "../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import { PurchaGetBindAllCenter } from "../../../NetworkServices/Purchase.js";
import {
  BindReconciliationBank,
  BindReconciliationVerifyDetails,
  SearchReconcileDetails,
  UpdateReconciliationVerifyAPI,
} from "../../../NetworkServices/finance.js";
import moment from "moment";
import Tables from "../../../components/UI/customTable";
import Input from "../../../components/formComponent/Input";
import CustomDateRangePicker from "../../../components/commonComponents/DateRangePicker";
import CustomTooltip from "../../../components/formComponent/CustomTooltip";
import { handleReactSelectDropDownOptions,notify } from "../../utils/Utils";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../components/UI/customTable/HisTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage.js";
import { BindMainCenter } from "../../../NetworkServices/Pettycash.js";
const BankReconsilationVerify = () => {
  const { t } = useTranslation();
  const handleReactChange = (name, e, key) => {
    if (name === "status") {
      handleSearch(e.value);
    }
    setPayload((val) => ({ ...val, [name]: e }));
  };
  const handleDateRangeChange = (e) => {
    const { startDate, endDate } = e.target.value;
    setPayload((val) => ({
      ...val,
      brvFromDate: startDate,
      brvToDate: endDate,
    }));
  };
  const handleChange = (e) => {
    setPayload((val) => ({ ...val, [e.target.name]: e.target.value }));
  };
  const [dropDownState, setDropDownState] = useState({
    GetBindAllCenter: [],
    BindBank: [],
    BindStatus: [
      { label: "Pending", value: "0" },
      { label: "Verify", value: "1" },
      { label: "Authorized", value: "2" },
    ],
  });
const userData = useLocalStorage("userData", "get");
  const [payload, setPayload] = useState({
    userType: { label: "Entry By", value: "1" },
    brvFromDate: new Date(),
    brvToDate: "",
    allCenter: {value: userData?.MainCentreID},
    status: { label: "", value: "" },
    bank: { label: "", value: "" },
  });

  const [bindMapping, setBindMapping] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectItem, setSelectItem] = useState([]);
  const [modalState, setModalState] = useState({
    show: false,
    name: null,
    component: null,
    size: null,
    footer: null,
  });

  const getPurchaGetBindAllCenterAPI = async () => {
    try {
      const GetBindAllCenter = await BindMainCenter();
      setDropDownState((val) => ({
        ...val,
        GetBindAllCenter: handleReactSelectDropDownOptions(
          GetBindAllCenter?.data,
          "CentreName",
          "CentreID"
        ),
      }));
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  };
  const getBindReconciliationBankApi = async () => {
    try {
      const GetBindBank = await BindReconciliationBank();

      setDropDownState((val) => ({
        ...val,
        BindBank: handleReactSelectDropDownOptions(
          GetBindBank?.data,
          "TextField",
          "ValueField"
        ),
      }));
    } catch (err) {
      console.log(err, "somthing get wronge");
    }
  };
  useEffect(() => {
    getPurchaGetBindAllCenterAPI();
    getBindReconciliationBankApi();
  }, []);
  const selectAllRef = useRef(null);
  const areAllSelected =
    selectedRows.length === bindMapping.length && bindMapping.length > 0;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.inderterminate =
        selectedRows.length > 0 && selectedRows.length < bindMapping.length;
    }
  }, [selectedRows, bindMapping.length]);

  const updateSelectItem = (selectedIndices) => {
    const selectedValue = selectedIndices
      .map((index) => bindMapping[index]?.val)
      .filter(Boolean); // Ensure PurchaseRequestNo exists
    setSelectItem(selectedValue);
  };
  const handleRowSelect = (index) => {
    setSelectedRows((prevSelectedRows) => {
      let updatedSelectedRows;

      if (prevSelectedRows.includes(index)) {
        updatedSelectedRows = prevSelectedRows.filter((i) => i !== index); // Remove
      } else {
        updatedSelectedRows = [...prevSelectedRows, index]; // Add
      }
      return updatedSelectedRows;
    });
  };
  useEffect(() => {
    updateSelectItem(selectedRows);
  }, [selectedRows, bindMapping]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIndices = bindMapping.map((_, index) => index);
      setSelectedRows(allIndices);
    } else {
      setSelectedRows([]);
    }
  };
  const isMobile = window.innerWidth <= 800;
  const thead = [
    { name: t("S.No."), width: "1%" },
    { name: t("Cheque No."), width: "5%" },
    { name: t("Cheque Date."), width: "5%" },
    { name: t("Cheque Amount."), width: "5%" },
    { name: t("Cheque Status."), width: "5%" },
    { name: t("Voucher No."), width: "5%" },
    { name: t("Voucher Date."), width: "5%" },
    { name: t("Remarks."), width: "5%" },
    {
      name: isMobile ? (
        t("check")
      ) : (
        <input
          type="checkbox"
          className="table-checkbox"
          style={{ marginRight: "20px" }}
          ref={selectAllRef}
          checked={areAllSelected}
          onChange={handleSelectAll}
        />
      ),
      width: "1%",
    },
    { name: t("Details."), width: "5%" },
  ];
  const handleSearch = async (status, isShowtost = true) => {
    debugger
    let data = {
      FromDate: moment(payload.brvFromDate).format("DD-MMM-YYYY") || "",
      ToDate: payload.brvFromDate
        ? moment(payload.brvToDate ?? payload.brvFromDate).format("DD-MMM-YYYY")
        : "",
      BankCoaID: payload?.bank?.value?.toString() || "",
      Status: status || "",
      CentreID: payload?.allCenter?.value?.toString() || "",
    };
    if (!data.Status || !data.CentreID) {
      notify("Please fill in required fields", "error");
      return;
    }
    try {
      const apiRes = await BindReconciliationVerifyDetails(data);
      if (apiRes?.success) {
        setBindMapping(
          apiRes?.data?.map((newItem) => {
            return {
              ...newItem,
              remarks: "",
            };
          })
        );
        setSelectedRows([]);
      } else {
        if (isShowtost) {
          notify(apiRes?.message, "error");
        }
        setBindMapping([]);
      }
    } catch (error) {
      notify("An error occurred while fetching data", "error");
    }
    console.log(data);
  };

  const handleModalState = (show, name, component, size, footer) => {
    setModalState({
      show: show,
      name: name,
      component: component,
      size: size,
      footer: footer,
    });
  };
  const handleTableDetails = async (ele, i) => {
    try {
      let payload = ele.EntryDetailID;
      const apiResmodel = await SearchReconcileDetails(payload);
      if (apiResmodel.success) {
        handleModalState(
          true,
          "Details",
          <>
            <div className="row ">
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput label={t("Reconsiled By")} value={""} />
              </div>
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Reconsiled Date")}
                  value={apiResmodel?.data[0].Reconciliationdate}
                />
              </div>
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Reconsiled Remarks")}
                  value={apiResmodel?.data[0].ReconciliationRemark}
                />
              </div>
            </div>
            <div className="row ">
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Verified By")}
                  value={apiResmodel?.data[0].ReonciliationVerifiedby}
                />
              </div>

              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Verified Date")}
                  value={apiResmodel?.data[0].ReonciliationVerifiedDateTime}
                />
              </div>
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Verified Remarks")}
                  value={apiResmodel?.data[0].ReonciliationVerifiedRemarks}
                />
              </div>
            </div>
            <div className="row ">
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Auth By")}
                  value={apiResmodel?.data[0].ReonciliationAuthby}
                />
              </div>
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Auth Date")}
                  value={apiResmodel?.data[0].ReonciliationAuthDateTime}
                />
              </div>
              <div className="p-2 col-md-4 col-sm-6">
                <LabeledInput
                  label={t("Auth Remarks")}
                  value={apiResmodel?.data[0].ReonciliationAuthRemarks}
                />
              </div>
            </div>
          </>,
          "80vw",
          <></>
        );
      }
    } catch (error) {
      console.log(error, "Something went wrong");
    }
  };
  const handleInputChange = (e, index) => {
    // console.log(e.target.value);
    const newData = [...bindMapping];
    newData[index].remarks = e.target.value;
    setBindMapping(newData);
  };

  const handleSave = async (ActionType, TransacionType) => {
    const selectedData = bindMapping?.filter((_, index) =>
      selectedRows.includes(index)
    );
    if (selectedData?.length === 0) {
      notify("Please Select atleast one item", "warn");
      return;
    }
    // debugger
    // return
    const payloadData = selectedData?.map((item) => ({
      Remark: item?.remarks,
      ChequeEntryID: String(item?.chequeentryId || ""),
      EntryDetailsID: String(item?.EntryDetailID || ""),
      TransacionType: TransacionType,
      ActionType: ActionType,
    }));
    // debugger
    // return
    const apiResp = await UpdateReconciliationVerifyAPI(payloadData);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      handleSearch(payload?.status?.value, false);
    }
  };
  return (
    <div className="mt-2 card">
      <Heading name={t("Bank Reconsilation Verify")} isBreadcrumb={true} />

      <div className="row pt-2 px-2">
        <ReactSelect
          placeholderName={t("Centre")}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          id={"allCenter"}
          name={"allCenter"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.GetBindAllCenter.map((item) => ({
            label: item?.Centre,
            value: item?.MainCentreID,
          }))}
          value={payload?.allCenter?.value}
          className={`required-fields`}
        />
        <CustomDateRangePicker
          name="dateRange"
          id="dateRange"
          labelKey="dateRange"
          label={t("Select Date Range")}
          startDate={payload.brvFromDate || null}
          endDate={payload.brvToDate || null}
          onChange={handleDateRangeChange}
          respClass="col-xl-2 col-md-4 col-sm-4 col-12"
        />
        <ReactSelect
          placeholderName={t("Status")}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          id={"status"}
          name={"status"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.BindStatus}
          value={payload?.status?.value}
          required={`required-fields`}
        />
        <ReactSelect
          placeholderName={t("Bank Name")}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          className="required-fields"
          id={"bank"}
          name={"bank"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={[
            { value: "0", label: "Select" },
            ...handleReactSelectDropDownOptions(
              dropDownState?.BindBank,
              "label",
              "value"
            ),
          ]}
          value={payload?.bank?.value}
        />

        {/* <div className="col-xl-1 col-sm-6 col-md-4 col-12 mb-2 d-flex flex-wrap">
          <LabeledInput
            className={"w-100 my-sm-0 my-1"}
            label={t("Currency")}
            value={"INR"}
          />
        </div> */}

        <div className="col-sm-1 col-2 mt-1">
          <button
            className="btn btn-sm btn-primary ml-sm-2 ml-0"
            type="button"
            onClick={() => {
              handleSearch(payload?.status?.value);
            }}
          >
            {t("Search")}
          </button>
        </div>
      </div>
      {bindMapping?.length > 0 && (
        // <div className="">
        <div className="card">
          <HisTable
            style={{ maxHeight: "45vh" }}
            thead={thead}
            tbody={bindMapping?.map((item, index) => ({
              "S.No.": item?.PaymentModeID,
              "Check No.": item?.ChequeNo,
              "Cheque Date.": item?.ChequeDate,
              "Cheque Amount.": item?.SpecificAmount,
              "Cheque Status.": item?.cheque_status,
              "Voucher No.": item?.VoucherNo,
              "Voucher Date": item?.VoucherDate,
              Remarks: (
                <Input
                  type="text"
                  className="table-input"
                  removeFormGroupClass={true}
                  name="remarks"
                  respclass=""
                  value={item.remarks}
                  onChange={(e) => handleInputChange(e, index)}
                />
              ),
              checkbox: (
                <input
                  type="checkbox"
                  className="table-checkbox"
                  style={{ marginRight: "20px" }}
                  checked={selectedRows.includes(index)}
                  onChange={() => handleRowSelect(index)}
                />
              ),
              details: (
                <CustomTooltip
                  id={`tooltip-${index}`}
                  content="View Details"
                  icon={
                    <i
                      className="fa fa-eye"
                      aria-hidden="true"
                      id={`tooltip-${index}`}
                      onClick={() => handleTableDetails(item, index)}
                    ></i>
                  }
                />
              ),
            }))}
          />
          <div className="d-flex justify-content-end m-1">
            {payload?.status?.value !== "2" && (
              <button
                className="btn btn-sm btn-primary ml-sm-2 mr-0 px-3"
                type="button"
                onClick={() => {
                  handleSave(
                    "Verify",
                    payload?.status?.value === "0" ? "1" : "0"
                  );
                }}
              >
                {payload?.status?.value === "0" ? t("Verify") : t("Unverify")}
              </button>
            )}
            {payload?.status?.value !== "0" && (
              <button
                className="btn btn-sm btn-primary ml-sm-2 mr-0 px-3"
                type="button"
                // onClick={handleSave}
                onClick={() => {
                  handleSave(
                    "Authorise",
                    payload?.status?.value === "1" ? "1" : "0"
                  );
                }}
              >
                {payload?.status?.value === "1"
                  ? t("Authorise")
                  : t("UnAuthorise")}
              </button>
            )}
          </div>
        </div>
        // </div>
      )}

      <FinanceModal
        Header={modalState?.name}
        modalWidth={modalState?.size}
        visible={modalState?.show}
        setVisible={() => {
          handleModalState(false, null, null, null, <></>);
        }}
        footer={modalState?.footer}
      >
        {modalState?.component}
      </FinanceModal>
    </div>
  );
};

export default BankReconsilationVerify;
