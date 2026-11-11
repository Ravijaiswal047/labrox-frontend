import React, { useEffect, useRef, useState } from "react";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";

import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import Accordion from "@app/components/UI/Accordion";
// import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import CustomTable from "../../../components/Table/CustomTable";
import "../PettyCash.css";
import { axiosInstance } from "../../../utils/axiosInstance";
import { TbFileTypeXls } from "react-icons/tb";
import FileUpload from "../../ManageQuery/FileUpload";
import Tooltip from "../../../components/formComponent/Tooltip";
import FilterInput from "../../../components/Filter/FilterInput";
import excelicon from "../../Images/excelicon.png";
import { ExportToExcel } from "../../../utils/helpers";
import { ViewMenu } from "../../../components/SvgIcons";
import SeeMore from "../../SampleStorage/frameMenu/SeeMore";

import PettyCashLedgerReport from "../pettyCashLedger/PettyCashLedgerReport.jsx";
import ExpenseTypeMaster from "../expenseTypeMaster/ExpenseTypeMaster.jsx";
import CenterExpensesEntry from "../centerExpensesEntry/CenterExpensesEntry.jsx";
import { useNavigate } from "react-router-dom";
import PettyCashDashboard from "../pettyCashDashboard/PettyCashDashboard.jsx";
import { apiUrls } from "../../../utils/apiEndpoints.js";
import PettyCashAcceptance from "../pettyCashAcceptance/PettyCashAcceptance.jsx";
import { notify } from "../../../utils/utils.js";
import moment from "moment";
import Modal from "../../../components/ModalComponent/Modal.jsx";
import fileIcon from "../../../assets/image/fileIcon.png";
import TableFilterDot from "../../Components/TableFilterDot.jsx";
import { useDispatch } from "react-redux";
import { clearFiles } from "../../../store/reducers/fileUploadSlice/fileUploadSlice.js";

const PettyCashTransfer = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [centredata, setcentredata] = useState([]);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [balancedata, setbalancedata] = useState({});
  const [showpopup, setshowpopup] = useState(false);

  const handlebalacedata = async (cId = "") => {
    try {
      const res = await axiosInstance.get(
        `${apiUrls.getbalance}?CentreID=${cId || searchData?.centreID}`
      );
      notify("Balance fetched successfully", "success");
      setbalancedata(res?.data?.message || {});
      console.log(res);
    } catch (err) {
      console.log(err);
      notify(err?.response?.data?.message || "Something went wrong", "error");
    }
  };

  const seeMoreData = [
    {
      name: "Petty Cash Dashboard",
      component: <PettyCashDashboard setShowMore={setShowMore} />,
      url: "/dashboard#pettycash",
    },
    {
      name: "Petty Cash Transfer",
      component: <PettyCashTransfer setShowMore={setShowMore} />,
      url: "/pettycash/petty-cash-transfer",
    },
    {
      name: "Petty Cash Acceptance",
      component: <PettyCashAcceptance setShowMore={setShowMore} />,
      url: "/pettycashacceptance",
    },
    {
      name: "Petty Cash Ledger Report",
      component: <PettyCashLedgerReport setShowMore={setShowMore} />,
      url: "/pettycashledger/petty-cash-ledger-report",
    },
    {
      name: "Expense Type Master",
      component: <ExpenseTypeMaster setShowMore={setShowMore} />,
      url: "/pettycashledger/expense-type-master",
    },
    {
      name: " Centre Expense",
      component: <CenterExpensesEntry setShowMore={setShowMore} />,
      url: "/centerexpenseentry/center-expense-entry",
    },
  ];
  const handleFilterInputChange = (e) => {
    let value = "";
    if (typeof e === "string") {
      value = e.toLowerCase();
    } else {
      value = e.target.value.toLowerCase();
    }
    setFilterInputValue(value);

    // Filter rows based on search term matching any field
    const filtered = tableData.filter((row) =>
      Object.keys(row).some((key) =>
        String(row[key]).toLowerCase().includes(value)
      )
    );

    setFilterTableData(filtered);
  };

  const filterOnClick = (type) => {
    if (type === "all") {
      setFilterTableData(tableData);
      return;
    }
    setFilterTableData(
      tableData?.filter((data) => {
        // Normalize status to lowercase for comparison
        return String(data?.StatusText)?.toLowerCase() === type.toLowerCase();
      })
    );
  };

  // useEffect(() => {
  //     setFilterTableData(tableData);
  // }, []);
  const fetchAllCenter = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        const data = res?.data?.message || [];
        const val = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
          CentreCode: ele?.CentreCode,
        }));
        setcentredata([{label:'All', value:''}, ...val]);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  useEffect(() => {
    fetchAllCenter();
  }, []);

  const [formData, setFormData] = useState({
    centreName: "",
    paymentMode: "",
    // chequeDate: new Date(),
    transactionDate: new Date(),
    amount: "",
    TransactionID: "",
    receiptFile: "",
    remarks: "",
    adjustment: false,
  });
  const [searchData, setsearchData] = useState({
    centreID: "",
    fromDate: new Date(),
    toDate: new Date(),
    status: -1,
    transactionType: "IssueSearch",
    //    transactionType: "ExpenseSearch",
    dateType: "TransactionDate",
    DateType: "dtEntry",
  });
  console.log("datasdf", formData.centre);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Limit amount max value
    if (name === "amount" && parseInt(value) > 10000000) {
      return;
    }
    // if (name === "adjustment" && checked) {
    //     notify("You checked the adjustment. Do you want to continue?", 'warn')
    // }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleselectChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
    if (name === "centreName") {
      handlebalacedata(e?.value);
    }
  };
  const handleselectsearchChange = (name, e) => {
    setsearchData((prev) => ({ ...prev, [name]: e?.value }));
    if (name === "centreID") {
      handlebalacedata(e?.value);
    }
  };
  const datesearchSelect = (value, name) => {
    setsearchData({ ...searchData, [name]: value });
  };
  const dateSelect = (value, name) => {
    setFormData({ ...formData, [name]: value });
  };
  // const handleFileResponse = (file) => {
  //     if (file) {
  //         console.log("Uploaded File:", file);

  //         // Assuming `file` is a File object and you want to convert it to Base64
  //         const reader = new FileReader();
  //         reader.onloadend = () => {
  //             const base64String = reader.result;
  //             setFormData((prev) => ({
  //                 ...prev,
  //                 receiptFile: base64String,
  //             }));
  //         };
  //         reader.readAsDataURL(file); // this reads it as base64
  //     } else {
  //         console.log("File cleared");
  //         setFormData((prev) => ({
  //             ...prev,
  //             receiptFile: "",
  //         }));
  //     }
  // };
  const handleFileResponse = (file) => {
    if (file) {
      console.log("Uploaded File:", file);
      setFormData((prev) => ({ ...prev, receiptFile: file }));
      // Here you can send file to server with FormData
      // Example:
      // const formData = new FormData();
      // formData.append("file", file);
      // fetch("/upload", { method: "POST", body: formData });
    } else {
      console.log("File cleared");
    }
  };

  const tableHeaders = [
    { header: "S.No.", field: "sNo", width: "5%" },
    { header: "Centre Name", field: "centreName" },
    { header: "Centre Code", field: "centreCode" },
    { header: "Amount", field: "amount" },
    { header: "Tnx Date", field: "TransactionDate" },
    { header: "Entry Date", field: "date" },
    { header: " Transfer By", field: "createdByName" },
    { header: "Payment Mode", field: "paymentMode" },
    { header: "Transaction ID", field: "TransactionID" },
    { header: "Remark", field: "remark" },
    { header: "Action", field: "action" },
    { header: "Attachment", field: "attachment" },
  ];

  const paymentModeList = [
    { value: "Cash", label: "Cash" },
    { value: "Online", label: "Online" },
    { value: "Credit Card", label: "Credit Card" },
    { value: "Cheque", label: "Cheque" },
    { value: "NEFT", label: "NEFT" },
  ];
  const statusList = [
    { value: 0, label: "Pending" },
    { value: 1, label: "Approved" },
    { value: 2, label: "Rejected" },
    { value: -1, label: "All" },
  ];
  const dateTypeList = [
    { value: "dtEntry", label: "Entry Date" },
    { value: "TransactionDate", label: "Transaction Date" },
    { value: "dtApproved", label: "Accept Date" },
    { value: "dtCancel", label: "Reject Date" },
  ];
  const centreData = centredata?.filter(
    (data) => data?.value == formData.centreName
  );
  const [tableData, setTableData] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.adjustment) {
      setshowpopup(true);
    } else {
      await submitPettyCashData();
    }
  };
  const submitPettyCashData = async () => {
    if (!formData?.centreName) {
      notify("Centre is required.", "error");
      return;
    }
    if (!formData?.paymentMode) {
      notify("Payment mode is required.", "error");
      return;
    }
    if (!formData?.amount) {
      notify("Amount is required.", "error");
      return;
    }
    if (!(formData?.amount >= 0)) {
      notify("Amount cannot be negative.", "error");
      return;
    }
    if (!formData?.remarks) {
      notify("Remarks is required.", "error");
      return;
    }
    let formDataObj = new FormData();
    formDataObj.append("centreID", formData?.centreName);
    formDataObj.append("centreCode", centreData?.[0]?.CentreCode);
    formDataObj.append("centreName", centreData?.[0]?.label);
    formDataObj.append("amount", formData?.amount);
    // formDataObj.append("chequeDate", new Date().toISOString());
    formDataObj.append(
      "transactionDate",
      moment(formData?.transactionDate).format("YYYY/MM/DDTHH:mm:ss")
    );
    formDataObj.append("type", "issue");
    formDataObj.append("receiptFile", formData.receiptFile);
    formDataObj.append("paymentMode", formData?.paymentMode);
    formDataObj.append("bankName", "");
    formDataObj.append("TransactionID", formData?.TransactionID);
    formDataObj.append("remarks", formData?.remarks);
    formDataObj.append("adjustment", formData?.adjustment ? "1" : "0");

    try {
      const res = await axiosInstance.post(
        apiUrls.SavePettyCashTransfer,
        formDataObj
      );
      if (res.data.success) {
        notify(res?.data?.message, "success");
        setFormData({
          centreName: "",
          paymentMode: "",
          // chequeDate: new Date(),
          transactionDate: new Date(),
          amount: "",
          TransactionID: "",
          receiptFile: null,
          adjustment: false,
          remarks: "",
        });
        setshowpopup(false);
        dispatch(clearFiles());
        handlesearch();
      }
    } catch (err) {
      console.log(err);
      notify(err?.data?.message, "error");
    }
  };

  const handlesearch = async (e) => {
    e?.preventDefault();
    const fromDateStr = moment(searchData?.fromDate)?.format("YYYY-MM-DD"); //20-09-2025
    console.log("fromDateStr", fromDateStr);
    const toDateStr = moment(searchData?.toDate).format("YYYY-MM-DD");
    let requestdata = {
      centreIDs: String(searchData?.centreID),
      fromDate: `${fromDateStr?.split("T")[0]}T00:00:00`,
      toDate: `${toDateStr?.split("T")[0]}T23:59:59`,
      status: searchData?.status,
      transactionType: "IssueSearch",
      dateType: "TransactionDate",
      DateType: searchData?.DateType,
    };

    await axiosInstance
      .post(apiUrls.SearchPettyCash, requestdata)
      .then((res) => {
        if (Array.isArray(res?.data?.message)) {
          setTableData(res?.data?.message);
          setFilterTableData(res?.data?.message);
        } else {
          setTableData([]);
          setFilterTableData([]);
          notify(res?.data?.message, "error");
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
        setTableData([]);
      });
  };

  const statusCount = (sType) => {
    return tableData?.filter((items) => items?.StatusText === sType)?.length;
  };

  const filterTableDataToExport = (data, tableHeaders) => {
  const fields = tableHeaders.map(h => h.field); // extract allowed fields
  return data.map((item, index) => {
    const row = {};
    fields.forEach(field => {
      if (field === "sNo") {
        row[field] = index + 1; // auto-generate serial no
      } else {
        row[field] = item[field] ?? null; // pick only existing fields
      }
    });
    return row;
  });
};

const filteredDataxx = filterTableDataToExport(tableData, tableHeaders);
console.log('centredat:::',centredata);



  useEffect(() => {
    if (searchData?.centreID) {
      handlebalacedata();
    }
  }, []);
  console.log(tableData);
  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  return (
    <>
      {showpopup && (
        <Modal
          Header={"Adjustment Confirmation"}
          visible={showpopup}
          setVisible={setshowpopup}
          modalWidth={"30%"}
        >
          <div className="text-center">
            <p className="fw-bold" style={{ fontWeight: "600" }}>
              You checked the adjustment. Do you want to continue?
            </p>
            <div className="d-flex justify-content-center gap-3 mt-3">
              <div className="mr-3">
                <button
                  className="btn btn-sm btn-success px-4"
                  onClick={async () => {
                    await submitPettyCashData();
                  }}
                >
                  Yes
                </button>
              </div>

              <button
                className="btn btn-sm btn-danger px-4"
                onClick={() => setshowpopup(false)}
              >
                No
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showMore && (
        <SeeMore
          seeMore={seeMoreData}
          handleChangeComponent={(item) => {
            setShowMore(false);
            navigate(item?.url);
          }}
          setShowMore={setShowMore}
        />
      )}
      <div className="card">
        <Heading
          name="Petty Cash Transfer"
          isBreadcrumb={true}
          secondTitle={
            <>
              <p className="mb-2 fw-bold" style={{ fontWeight: "700" }}>
                Total Balance :{" "}
                <span className="mr-2">{balancedata?.Total ?? "0"}</span>
              </p>
              <p className="mb-2 fw-bold" style={{ fontWeight: "700" }}>
                Pending Balance : <span>{balancedata?.Pending ?? "0"}</span>
              </p>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <form onSubmit={handleSubmit}>
          <div className="row p-2 d-flex align-items-center">
            <ReactSelect
              name="centreName"
              id="centreName"
              removeIsClearable={true}
              dynamicOptions={centredata}
              isShowBorder={true}
              placeholderName="Centre"
              value={formData?.centreName}
              onChange={handleselectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <ReactSelect
              name="paymentMode"
              id="paymentMode"
              removeIsClearable={true}
              isShowBorder={true}
              dynamicOptions={paymentModeList}
              placeholderName="Payment Mode"
              value={formData?.paymentMode}
              onChange={handleselectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            {formData?.paymentMode === "Online" && (
              <Input
                type="text"
                placeholder=" "
                lable={t("Transaction ID")}
                id="TransactionID"
                name="TransactionID"
                value={formData?.TransactionID}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
            )}
            {/* <DatePicker
                            className="custom-calendar"
                            name="chequeDate"
                            value={formData?.transactionDate}
                            placeholder=" "
                            id="Date"
                            lable="Date"
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                            onChange={dateSelect}

                        /> */}
            <Input
              type="number"
              placeholder=" "
              lable={t("Amount")}
              id="amount"
              name="amount"
              value={formData?.amount}
              onChange={handleChange}
              max={10000000}
              // className={"required-fields"}
              // inputRef={trayNameRef}
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />
            <Input
              type="text"
              placeholder=" "
              lable={t("Remarks")}
              id="Remarks"
              name="remarks"
              value={formData?.remarks}
              onChange={handleChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />
            <div className="col-xl-2 col-sm-4 col-md-6 col-12  d-flex align-items-center gap-1">
              <FileUpload
                placeholder="Upload Attachment"
                allowedTypes={[".pdf"]}
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                onFileSelect={handleFileResponse}
              />
            </div>
          </div>

          <div className="row row p-2 d-flex align-items-center">
            <div className="col-sm-2">
              <input
                name="adjustment"
                type="checkbox"
                checked={formData?.adjustment}
                onChange={handleChange}
              />
              <label className="ml-2" htmlFor="ApplicableForAll">
                {t("Adjustment")}
              </label>
            </div>

            <div className="col-sm-2 d-flex align-items-center gap-5">
              <div className="w-100">
                <button
                  className="btn btn-sm btn block btn-success px-5"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>

        <Accordion
          name={t("Petty Cash Search")}
          defaultValue={true}
          isBreadcrumb={true}
          secondTitle={<i class="fa fa-file-pdf-o" aria-hidden="true"></i>}
        >
          <form onSubmit={handlesearch}>
            <div className="row p-2 d-flex align-items-center">
              <ReactSelect
                name="centreID"
                id="centreID"
                removeIsClearable={true}
                dynamicOptions={centredata}
                isShowBorder={true}
                placeholderName="Centre"
                value={searchData?.centreID}
                onChange={handleselectsearchChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              />
              <ReactSelect
                name="DateType"
                id="dateType"
                removeIsClearable={true}
                dynamicOptions={dateTypeList}
                isShowBorder={true}
                placeholderName="DateType"
                value={searchData?.DateType}
                onChange={handleselectsearchChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              />
              <DatePicker
                className="custom-calendar"
                name="fromDate"
                value={searchData?.fromDate}
                onChange={datesearchSelect}
                placeholder=" "
                id="fromDate"
                lable="FromDate"
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              />
              <DatePicker
                className="custom-calendar"
                name="toDate"
                value={searchData?.toDate}
                onChange={datesearchSelect}
                placeholder=" "
                id="toDate"
                lable="ToDate"
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              />
              <ReactSelect
                name="status"
                id="status"
                removeIsClearable={true}
                dynamicOptions={statusList}
                isShowBorder={true}
                placeholderName="Status"
                value={searchData?.status}
                onChange={handleselectsearchChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              />

              <div className="col-sm-2 d-flex align-items-center gap-5">
                <div className="w-100">
                  <button
                    type="submit"
                    className="btn btn-sm btn block btn-success px-5"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </form>

          <div
            style={{ gap: "4px" }}
            className="d-flex align-items-end  flex-grow-1 justify-content-end my-2 px-2"
          >
            <div style={{ gap: "4px" }} className="excel_exp d-flex">
              <div>
                {/* <Tooltip position="top" target=".excel-icon" /> */}
                {tableData?.length > 0 && <img
                  onClick={() => ExportToExcel(tableData)}
                  src={excelicon}
                  alt="Export to Excel"
                  className="excel-icon"
                  data-pr-tooltip="Export Active Data"
                  style={{ width: "26px", height: "26px", cursor: "pointer" }}
                />}
              </div>
            </div>
            <FilterInput
              value={filterInputValue}
              onChange={handleFilterInputChange}
              placeholder="Filter Table"
            />
          </div>
          <Heading
            title={t("Expanses Details")}
            secondTitle={
              <>
                <div
                  style={{ gap: "4px" }}
                  className="d-flex justify-content-end pt-1 px-2"
                >
                  <TableFilterDot
                    onClick={() => filterOnClick("Pending")}
                    color={"#FFFFFF"}
                    title={`Pending ${statusCount("Pending")}`}
                    bgColor={"#ebebebbf"}
                  />
                  <TableFilterDot
                    onClick={() => filterOnClick("Approved")}
                    color={"#90EE90"}
                    title={`Approved ${statusCount("Approved")}`}
                    bgColor={"#ebebebbf"}
                  />
                  <TableFilterDot
                    onClick={() => filterOnClick("Rejected")}
                    color={"#FFB6C1"}
                    title={`Rejected ${statusCount("Rejected")}`}
                    bgColor={"#ebebebbf"}
                  />
                  <TableFilterDot
                    onClick={() => filterOnClick("all")}
                    color={"#FFFFFF"}
                    title={"Show All"}
                    bgColor={"#ebebebbf"}
                  />
                </div>
              </>
            }
          />
          <div className="mt-1 table_ticket">
            <CustomTable
              columns={tableHeaders}
              data={filterTableData.map((item, index) => ({
                rowColor: item.ColorCode,
                sNo: index + 1,
                centreName: item?.Centre || "-",
                centreCode: item?.CentreCode || "-",
                amount: item?.Amount || "-",
                date: item?.TransactionDate || "-",
                createdByName: item?.CreatedByname || "-",
                paymentMode: item?.PaymentMode || "-",
                TransactionDate: item?.TransactionDate || "-",
                TransactionID:
                  item?.TransactionID != null ? item.TransactionID : "-",
                remark: (
                  <span
                    title={item?.Remarks || ""}
                    style={{ cursor: "default" }}
                  >
                    {truncateText(item?.Remarks, 30)}
                  </span>
                ),
                action: item?.StatusText || "-",
                attachment: (
                  <div className="d-flex align-items-center">
                    <img width={16} height={16} src={fileIcon} alt="fileIcon" />
                    <span className="mx-1">({item?.FileCount || 0})</span>
                  </div>
                ),
              }))}
            />
          </div>
        </Accordion>
      </div>
    </>
  );
};

export default PettyCashTransfer;
