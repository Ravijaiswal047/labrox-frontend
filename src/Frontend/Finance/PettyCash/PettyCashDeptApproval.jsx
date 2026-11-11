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
  BindBackendData,
  BindMainCenter,
  bindVoucherBillingScreenControls,
  GetCOACurrentClosingBalance,
  SavePCRequestApproval,
  SearchPendingPettyCashRequest,
} from "../../../NetworkServices/Pettycash";
import moment from "moment";
import Tables from "../../../components/UI/customTable";
import { FaSearch } from "react-icons/fa";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import FinanceModal from "../../../components/ModalComponent/FinanceModal";
import HisTable from "../../../components/UI/customTable/HisTable";

function PettyCashDeptApproval() {
  const [t] = useTranslation();
  const [coid, setCoid] = useState("0");
  const [centerName, setBindCenter] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showData, setShowData] = useState(false);
  const [BankCash, setBankCash] = useState([]);
  const [PaymentMode, setPaymentMode] = useState([]);
  const [CtrlId, setCtrlId] = useState([]);

  const [closingBalance, setClosingBalance] = useState([]);

  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("");
  const [PettyCash, setPettyCash] = useState([]);
  const [singleData, setSingleData] = useState([]);
  const [values, setValues] = useState({
    center: { value: "0", label: "ALL" },
    pettyCash: { value: "0", label: "ALL" },
    refDate: new Date(),
    cashChart: "",
    currency: "",
    requestNo: "",
    bankCash: "",
    requestId: "",
    requestDate: "",
    refNo: "",
    remark: "",
    paymentMode: "",
    approvalAmount: singleData?.RequestAmount || "",
  });

  console.log("values" , values)

  const [dropDownState, setDropDownState] = useState({
    PettyCashAc: [],
    BankDetail: [],
  });

  console.log("dropDownState", dropDownState);

  const handleSelect = (name, value) => {
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleChange = (e) => {
    if (e.target?.name === "remark") {
      setSingleData((val) => ({
        ...val,
        Remarks: e.target.value,
      }));
    } else if (e.target?.name === "refDate") {
      setSingleData((val) => ({
        ...val,
        refDate: e.target.value,
      }));
    } else if (e.target?.name === "approvalAmount") {
      setSingleData((val) => ({
        ...val,
        RequestAmount: e.target.value,
      }));
    }
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleBindMainCenter = async () => {
    try {
      const response = await BindMainCenter();
      if (response.success) {
        setBindCenter(response.data);
      } else {
        setBindCenter([]);
      }
    } catch (error) {
      setBindCenter([]);
    }
  };

  const handleSearchPendingPettyCashRequest = async () => {
    const payload = {
      coaID: values?.pettyCash?.value,
      requestNo: values?.requestNo,
      fromDate: moment(values?.fromDate).format("DD-MMM-YYYY"),
      toDate: moment(values?.toDate).format("DD-MMM-YYYY"),
    };
    try {
      const apiResp = await SearchPendingPettyCashRequest(payload);
      if (apiResp.success) {
        console.log("the api response is", apiResp);
        setTableData(apiResp?.data);
        
      } else {
        notify("No records found", "error");
        setSingleData([]);
        setShowData(false)
        setTableData([]);
      }
    } catch (error) {
      console.error("Error while fetching data:", error);
      notify("An error occurred while fetching data", "error");
      setTableData([]);
    }
  };

  const HandleViewData = (val, ind) => {
    const ViewData = tableData[ind];
    setShowData(true);
    setSingleData(ViewData);
    setSelectedCurrencyCode(ViewData?.CurrencyCode);
    // setCtrlId(ViewData?.BranchCentreID);
  };

  // console.log("the bankCash api ",values?.bankCash?.value);
  const tableHeadData = [
    { width: "10%", name: t("SNo") },
    { width: "10%", name: t("Request No") },
    { width: "10%", name: t("Request Date") },
    { width: "15%", name: t("Branch Centre") },
    { width: "15%", name: t("Petty Cash A/C") },

    { width: "15%", name: t("Department") },
    { width: "15%", name: t("Entry By") },
    { width: "15%", name: t("Auth By") },
    { width: "15%", name: t("Auth Date") },
    { width: "5%", name: t("View") },
  ];

  const handleGetCOACurrentClosingBalance = async () => {
    try {
      const response = await GetCOACurrentClosingBalance(
        values?.bankCash?.value
      );
      setClosingBalance(response?.data[0]?.ClosingBal);
      return response?.data[0]?.ClosingBal;
    } catch (error) {
      console.error("Error fetching department data:", error);
    }
  };

  const handlebindVoucherBillingScreenControls = async (data) => {
    try {
      const response = await bindVoucherBillingScreenControls(data);
      if (response.success) {
        const PettyCashData = response?.data?.filter(
          (val) => val?.TypeID === 12
        );

        const paymentData = response?.data?.filter((val) => val?.TypeID === 10);
        setDropDownState((val) => ({
          ...val,
          PettyCashAc: PettyCashData,
        }));
        setPettyCash(response.data);

        const bankCashData = response?.data?.filter((i, ind) => {
          return (
            i.TypeID == 5 &&
            i.ReqAreaCode == selectedCurrencyCode &&
            (i.DeptCode.substring(0, 7) == "1002003" ||
              i.DeptCode.substring(0, 7) == "1002004")
          );
        });

        const BankData = response?.data?.filter((val) => val?.TypeID === 5);
        const ActualBanks = BankData.filter(
          (val) => val?.DeptCode === "10" || val?.DeptCode === "9"
        );
        setDropDownState((val) => ({
          ...val,
          BankDetail: ActualBanks,
          PaymentData: paymentData,
        }));
        setBankCash(bankCashData);
        // setPaymentMode(PaymentCash);
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

  // SavePCRequestApproval

  const handleSavePCRequestApproval = async () => {
    if (!singleData?.RequestAmount) {
      notify("Please enter approval amount", "error");
      return;
    } else if (!values?.paymentMode?.value) {
      notify("Please select payment mode", "error");
      return;
    } else if (!values?.bankCash?.value) {
      notify("Please select bank cash", "error");
      return;
    } else if (!values?.refNo) {
      notify("Please enter reference number", "error");
      return;
    } else if (!values?.refDate) {
      notify("Please select reference date", "error");
      return;
    }
    const closingBalance = await handleGetCOACurrentClosingBalance();
    if (closingBalance < singleData?.RequestAmount) {
      notify(
        "You can not Approve selected Petty Cash Request. You do not have sufficient Balance in your Account.",
        "error"
      );
      return;
    }
    const payload = {
      requestID: Number(singleData?.RequestID),
      requestNo: String(singleData?.RequestNo),
      requestDate: singleData?.RequestDate,
      deptCode: String(singleData?.DepartmentCode),
      pcCOAID: singleData?.PCCOAID,
      bankCashCOAID: values?.bankCash?.value,
      specificAmount: singleData?.RequestAmount,
      currencyCode: String(singleData?.CurrencyCode),
      transCurrFactor: String(singleData?.TransCurrFactor),
      actualCurrFactor: String(singleData?.ActualCurrFactor),
      remarks: singleData?.Remarks,
      refNo: values?.refNo,
      refDate: moment(singleData?.refDate).format("DD-MM-YYYY"),
      paymentModeID: Number(values?.paymentMode?.value),
      paymentMode: values?.paymentMode?.label,
      branchcentreid: singleData?.BranchCentreID.toString(),
    };
    
    try {
      const apiResp = await SavePCRequestApproval(payload);
      if (!apiResp.success) {
        notify(apiResp?.message, "error");
      } else {
        setModalData({
          visible: true,
          width: "20vw",
          label: t("Alert !"),
          buttonName: t(""),
          CallAPI: "",
          modalData: "",
          // footer: (<></>),
          Component: (
            <>
              <h1
                style={{
                  textAlign: "center",
                  fontSize: "14px !important",
                  fontWeight: "600",
                }}
              >
                {t("Petty Cash Request Approved Successfully")}
              </h1>
              <h1
                style={{
                  fontSize: "16px !important",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Approval No. :{" "}
                <span style={{ color: "red" }}>{apiResp?.data}</span>
              </h1>
            </>
          ),
        });
        setSingleData({});
        setShowData(false);
        handleSearchPendingPettyCashRequest();
        setValues({});
        notify(apiResp?.message, "success");
      }
    } catch (error) {
      notify("An error occurred while fetching data", "error");
    }
  };

  useEffect(() => {
    handlebindVoucherBillingScreenControls("1");
  }, [showData]);

  useEffect(() => {
    if (values?.bankCash?.value) {
      handleGetCOACurrentClosingBalance();
    }
  }, [values?.bankCash?.value]);

  const [modalData, setModalData] = useState({ visible: false });

  const { VITE_DATE_FORMAT } = import.meta.env;
  return (
    <>
      {modalData?.visible && (
        <FinanceModal
          visible={modalData?.visible}
          setVisible={() => {
            setModalData({ visible: false });
          }}
          modalData={modalData?.modalData}
          modalWidth={modalData?.width}
          Header={modalData?.label}
          buttonType="button"
          buttonName={modalData?.buttonName}
          footer={<></>}
          handleAPI={modalData?.CallAPI}
        >
          {modalData?.Component}
        </FinanceModal>
      )}
      <div className="m-2 spatient_registration_card card">
        <Heading
          name={t("Department Approval")}
          isBreadcrumb={true}
        />

        <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
          <ReactSelect
            placeholderName={t("Petty Cash A/C")}
            id={"pettyCash"}
            searchable={true}
            removeIsClearable={true}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            dynamicOptions={[
              { label: "All", value: "0" },
              ...handleReactSelectDropDownOptions(
                dropDownState?.PettyCashAc,
                "TextField",
                "ValueField"
              ),
            ]}
            onChange={handleSelect}
            value={`${values?.pettyCash?.value}`}
            name={"pettyCash"}
          />
          <Input
            type="text"
            className="form-control"
            id="requestNo"
            placeholder=" "
            name="requestNo"
            value={values?.requestNo || ""}
            onChange={handleChange}
            lable={t("Request No.")}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
          />
          <DatePicker
            id="fromDate"
            name="fromDate"
            className="custom-calendar"
            lable={t("fromdate")}
            value={values?.fromDate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            maxDate={values?.todate}
          />
          <DatePicker
            id="todate"
            name="todate"
            className="custom-calendar"
            lable={t("todate")}
            value={values?.todate || new Date()}
            handleChange={handleChange}
            respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            maxDate={values?.fromdate}
          />
          <div className="col-sm-2 col-xl-1">
            <button
              className="btn btn-lg btn-success"
              type="button"
              onClick={handleSearchPendingPettyCashRequest}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </div>

      {tableData.length > 0 && (
        <div className="card">
          <HisTable
            thead={tableHeadData}
            tbody={tableData.map((val, index) => ({
              sno: index + 1,
              RequestNo: val.RequestNo,
              RequestDate: val.RequestDate,
              BranchCentre: val.BranchCentre,
              PettyCash: val.BranchCentre,
              Department: val?.DepartmentName,
              EntryBy: val?.EntryBy,
              AuthBy: val?.AuthBy,
              AuthDate: val?.AuthDate,
              View: <FaSearch onClick={() => HandleViewData("_", index)} />,
            }))}
          />
        </div>
      )}

      {showData ? (
        <div className="card">
          <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12"> */}
            <LabeledInput
              label={t("Request No.")}
              value={singleData?.RequestNo}
              name="requestId"
              id="requestId"
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
            />
            {/* </div> */}

            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"> */}
            <LabeledInput
              label={t("Request Date")}
              value={singleData?.RequestDate}
              name="requestDate"
              id="requestDate"
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
            />
            {/* </div> */}

            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"> */}
            <LabeledInput
              label={t("Department")}
              value={singleData?.DepartmentName}
              name="department"
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
            />
            {/* </div> */}

            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"> */}
            <LabeledInput
              label={t("Petty Cash A/C")}
              value={singleData?.AccountName}
              name="accountName"
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
              id="accountName"
            />
            {/* </div> */}

            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"> */}
            <LabeledInput
              label={t("Currency")}
              value={singleData?.CurrencyCode}
              name="currencyCode"
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
              id="currencyCode"
            />
            {/* </div> */}

            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"> */}
            <LabeledInput
              label={t("Branch Centre")}
              value={singleData?.BranchCentre}
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
            />
            {/* </div> */}
            {/* 
            <div className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2">
              <LabeledInput
                label={t("Approval Amount")}
                value={singleData?.RequestAmount}
                name="requestAmount"
              />
            </div> */}

            <Input
              type="text"
              className="form-control required-fields"
              id="approvalAmount"
              placeholder=""
              name="approvalAmount"
              value={singleData?.RequestAmount}
              onChange={handleChange}
              lable={t("Approval Amount")}
              respclass="col-xl-2 col-md-4 col-sm-4 col-12 mt-2"
            />

            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Bank/Cash A/C")}
              id={"bankCash"}
              searchable={true}
              removeIsClearable={true}
              respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12 mt-2"
              // dynamicOptions={[BankCash]}
              dynamicOptions={handleReactSelectDropDownOptions(
                dropDownState?.BankDetail,
                "TextField",
                "ValueField"
              )}
              onChange={handleSelect}
              value={`${values?.bankCash?.value}`}
              name={"bankCash"}
            />

            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2 "> */}
            <LabeledInput
              label={t("Currency / C.F.")}
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
              value={`${singleData?.CurrencyCode} / ${singleData?.TransCurrFactor}`}
            />
            {/* </div> */}

            {/* <div className="col-xl-2 col-md-4 col-sm-4 col-12 mt-2"> */}
            <LabeledInput
              label={t("Available Balance")}
              value={closingBalance}
              className="col-xl-2 col-md-4 col-sm-4 col-12  mt-2"
            />
            {/* </div> */}

            <Input
              type="text"
              className="form-control required-fields"
              id="refNo"
              placeholder=" "
              name="refNo"
              value={values?.refNo || ""}
              onChange={handleChange}
              lable={t("Ref No")}
              respclass="col-xl-2 col-md-4 col-sm-4 col-12 mt-2"
            />

            <DatePicker
              id="refDate"
              name="refDate"
              className="custom-calendar"
              lable={t("Reference Date")}
              value={singleData?.refDate || new Date()}
              handleChange={handleChange}
              respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
            />

            <Input
              type="text"
              className="form-control"
              id="remark"
              placeholder=" "
              name="remark"
              value={singleData?.Remarks || ""}
              onChange={handleChange}
              lable={t("Remark")}
              respclass="col-xl-2 col-md-4 col-sm-4 col-12 mt-2"
            />

            <ReactSelect
              placeholderName={t("Payment Mode")}
              id={"paymentMode"}
              searchable={true}
              removeIsClearable={true}
              respclass="col-xl-2 col-md-4 col-sm-4 col-sm-4 col-12"
              dynamicOptions={handleReactSelectDropDownOptions(
                dropDownState?.PaymentData,
                "TextField",
                "ValueField"
              )}
              className={"required-fields"}
              onChange={handleSelect}
              value={`${values?.paymentMode?.value}`}
              name={"paymentMode"}
            />

            <div className="col-sm-2 col-xl-1">
              <button
                className="btn btn-lg btn-success"
                type="button"
                onClick={handleSavePCRequestApproval}
              >
                {t("Save")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
}

export default PettyCashDeptApproval;
