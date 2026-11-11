import React, { useEffect, useState } from "react";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../../components/formComponent/Input";
import DatePicker from "../../../components/formComponent/DatePicker";
import { useNavigate } from "react-router-dom";
import PettyCashDashboard from "../pettyCashDashboard/PettyCashDashboard";
import PettyCashTransfer from "../pettyCashTransfer/PettyCashTransfer";
import PettyCashLedgerReport from "../pettyCashLedger/PettyCashLedgerReport";
import ExpenseTypeMaster from "../expenseTypeMaster/ExpenseTypeMaster";
import SeeMore from "../../SampleStorage/frameMenu/SeeMore";
import Heading from "../../../components/UI/Heading";
import { ViewMenu } from "../../../components/SvgIcons";
import FileUpload from "../../ManageQuery/FileUpload";
import { axiosInstance } from "../../../utils/axiosInstance";
import moment from "moment";
import { apiUrls } from "../../../utils/apiEndpoints";
import { notify } from "../../../utils/utils";
import CustomTable from "../../../components/Table/CustomTable";
import Modal from "../../../components/ModalComponent/Modal";
import { clearFiles } from "../../../store/reducers/fileUploadSlice/fileUploadSlice";
import TableFilterDot from "../../Components/TableFilterDot";
import accept from "../../Images/accept.png";
import reject from "../../Images/reject.png";
import fileIcon from "../../../assets/image/fileIcon.png";
import FilterInput from "../../../components/Filter/FilterInput";
import excelicon from "../../Images/excelicon.png";
import { useDispatch } from "react-redux";

const CenterExpensesEntry = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const [centredata, setcentredata] = useState([]);
  const [expensetype, setExpenseType] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [showpopup, setshowpopup] = useState(false);
  const [filterInputValue, setFilterInputValue] = useState("");
  const [filterTableData, setFilterTableData] = useState([]);

  const handleFilterInputChange = (e) => {
    const value = e.target.value;
    setFilterInputValue(value);
    setFilterTableData(
      tableData?.filter((data) => {
        const searchTerm = value.toLowerCase();
        return (data?.AcceptBy || data?.AcceptBy || "")
          .toLowerCase()
          .includes(searchTerm);
      })
    );
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
        setcentredata(val);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const fetchExpenceType = () => {
    axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "PettyCash_Expence",
        params: [],
      })
      .then((res) => {
        const data = res?.data?.data || [];
        console.log(res);
        const val = data.map((ele) => ({
          value: ele.id,
          label: ele.typename,
        }));
        setExpenseType(val);
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const fetchExpenceEntry = () => {
    axiosInstance
      .post("CommonController/Fetchprocedure", {
        typeName: "pettycash_search_table",
        params: [],
      })
      .then((res) => {
        const data = res?.data?.data || [];
        console.log("Fetched table data: ", data);
        setTableData(data); // ✅ Use raw data here
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchAllCenter();
    fetchExpenceType();
    fetchExpenceEntry();
  }, []);

  const [payload, setPayload] = useState({
    centreName: "",
    amount: "",
    paymentDate: new Date(),
    paymentMode: "",
    expType: "",
    invoiceNo: "",
    invoiceDate: new Date(),

    filename: "",
    adjustment: false,
    remarks: "",
    cardNo: "",
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // if (name === "adjustment" && checked) {
    //     notify("You checked the adjustment. Do you want to continue?", 'warn')
    // }
    if (name === "amount" && parseInt(value) > 10000000) {
      return;
    }
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  const handleselectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const dateSelect = (value, name) => {
    setPayload({ ...payload, [name]: value });
  };
  // const handleFileResponse = (file) => {
  //     if (file) {
  //         console.log("Uploaded File:", file);
  //         // Here you can send file to server with FormData
  //         // Example:
  //         // const formData = new FormData();
  //         // formData.append("file", file);
  //         // fetch("/upload", { method: "POST", body: formData });
  //     } else {
  //         console.log("File cleared");
  //     }
  // };
  const handleFileResponse = (file) => {
    if (file) {
      console.log("Uploaded File:", file);

      // Assuming `file` is a File object and you want to convert it to Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setPayload((prev) => ({
          ...prev,
          filename: base64String,
        }));
      };
      reader.readAsDataURL(file); // this reads it as base64
    } else {
      console.log("File cleared");
      setPayload((prev) => ({
        ...prev,
        filename: "",
      }));
    }
  };

  const paymentModeList = [
    { value: "Online", label: "Online" },
    { value: "Cash", label: "Cash" },
  ];
  const centreData = centredata?.filter(
    (data) => data?.value == payload.centreName
  );
  const ExpenceTypeData = expensetype?.filter(
    (data) => data?.value == payload.expType
  );
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (payload.adjustment) {
      setshowpopup(true);
    } else {
      await submitExpenseEntryData();
    }
  };
  const submitExpenseEntryData = async () => {
    const requestData = {
      centreID: payload?.centreName,
      centreCode: centreData?.[0]?.CentreCode,
      centreName: centreData?.[0]?.label,
      amount: payload?.amount,
      chequeDate: new Date().toISOString(),
      transactionDate: payload?.paymentDate,
      type: "Expense",
      paymentMode: payload?.paymentMode,
      bankName: "",
      cardNo: payload?.cardNo,
      remarks: payload?.remarks,
      adjustment: payload?.adjustment ? "1" : "0",
      filename: payload?.filename,
      challanType: payload?.challanType,
      narration: payload?.narration,
      expType: ExpenceTypeData?.[0].label,
      expTypeID: ExpenceTypeData?.[0].value,
      invoiceNo: payload?.invoiceNo,
      invoiceDate: payload?.invoiceDate,
    };

    await axiosInstance
      .post(apiUrls.CentreExpenseEntry, requestData)
      .then((res) => {
        if (res?.data?.success === true) {
          notify(res?.data?.message, "success");
          setPayload({
            centreName: "",
            amount: "",
            paymentMode: "",
            paymentDate: new Date(),
            expType: "",
            invoiceNo: "",
            invoiceDate: new Date(),
            filename: null,
            adjustment: false,
            remarks: "",
            cardNo: "",
          });
          // handlesearch();
          console.log(res);
          setshowpopup(false);
          dispatch(clearFiles());
          fetchExpenceEntry();
        } else {
          notify(res?.data?.message, "error");
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
  };
  const tableHeaders = [
    { header: "S.No.", field: "sNo", width: "5%" },
    { header: "Centre Name", field: "centreName" },
    { header: "Amount", field: "amount" },
    { header: "Payment Date", field: "paymentDate" },
    { header: "Payment Mode", field: "paymentMode" },
    { header: "Expense Type", field: "expenseType" },
    { header: "Invoice No", field: "invoiceNo" },
    { header: "Invoice Date", field: "invoiseDate" },
    { header: "Remarks", field: "remarks" },
    { header: "Attachment", field: "attachment" },
    { header: "Action", field: "action" },
  ];
  const [updatestatus, setupdarestatus] = useState({
    transactionType: "",
    id: "",
    remarks: "",
  });
  const handleupdate = async (type, id) => {
    const requestdata = {
      transactionType: type,
      id: id,
      remarks: updatestatus.remarks || "",
    };

    await axiosInstance
      .post(apiUrls.updatepettycash, requestdata)
      .then((res) => {
        // if (Array.isArray(res?.data?.message)) {
        //   setupdarestatus(res?.data?.message);
        //   fetchExpenceEntry();
        //   setFilterTableData(res?.data?.message);
        // } else {
        //   notify(res?.data?.message, "error");
        //   // setTableData([]);
        // }
        if (res?.data?.message) {
          notify(res?.data?.message, "success")
          fetchExpenceEntry();
           setupdarestatus(res?.data?.message);
           setFilterTableData(res?.data?.message);
        } else {
          notify(res?.data?.message, "error");
        }
      })
      .catch((err) => {
        console.log(err);
        notify(err?.data?.message, "error");
      });
  };
  const statusCount = (sType) => {
    return tableData?.filter((items) => items?.StatusText === sType)?.length;
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
                    await submitExpenseEntryData();
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
          name={"Center Expenses Details"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <Accordion defaultValue={true} title={t("Expense Entry")} />
        <form onSubmit={handleSubmit}>
          <div className="row p-2 d-flex align-items-center">
            <ReactSelect
              name="centreName"
              id="centreName"
              removeIsClearable={true}
              isShowBorder={true}
              dynamicOptions={centredata}
              placeholderName="Center"
              value={payload?.centreName}
              onChange={handleselectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <Input
              type="text"
              placeholder=" "
              lable={t("Amount")}
              id="amount"
              name="amount"
              value={payload?.amount}
              onChange={handleChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />

            <DatePicker
              className="custom-calendar"
              name="paymentDate"
              placeholder=" "
              id="paymentDate"
              lable="PaymentDate"
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              onChange={dateSelect}
              value={payload?.paymentDate}
            />
            <ReactSelect
              name="paymentMode"
              id="paymentMode"
              removeIsClearable={true}
              isShowBorder={true}
              dynamicOptions={paymentModeList}
              placeholderName="PaymentMode"
              value={payload?.paymentMode}
              onChange={handleselectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            {payload?.paymentMode === "Online" && (
              <Input
                type="text"
                placeholder=" "
                lable={t("TransactionID")}
                id="cardNo"
                name="cardNo"
                value={payload?.cardNo}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
            )}
            <ReactSelect
              name="expType"
              id="expType"
              removeIsClearable={true}
              isShowBorder={true}
              dynamicOptions={expensetype}
              placeholderName="ExpenseType"
              value={payload?.expType}
              onChange={handleselectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <Input
              type="text"
              placeholder=" "
              lable={t("Invoice No")}
              id="invoiceNo"
              name="invoiceNo"
              value={payload?.invoiceNo}
              onChange={handleChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />
            <DatePicker
              className="custom-calendar"
              name="invoiceDate"
              value={payload?.invoiceDate}
              placeholder=" "
              id="invoiceDate"
              lable="InvoiceDate"
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              onChange={dateSelect}
            />
            {/* <Input
                            type="text"
                            placeholder=" "
                            lable={t("Narration")}
                            id="narration"
                            name="narration"
                            value={payload?.narration}
                            onChange={handleChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
                        />
                        <ReactSelect
                            name="challanType"
                            id="challanType"
                            removeIsClearable={true}
                            isShowBorder={true}
                            dynamicOptions={challantypelist}
                            placeholderName="ChallanType"
                            value={payload?.challanType}
                            onChange={handleselectChange}
                            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
                        /> */}
            <Input
              type="text"
              placeholder=" "
              lable={t("Remarks")}
              id="remarks"
              name="remarks"
              value={payload?.remarks}
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
            <div className="col-xl-2 col-sm-4 col-md-6 col-12  d-flex align-items-center gap-1 d-flex ">
              <input
                id="adjustment"
                type="checkbox"
                name="adjustment"
                checked={payload?.adjustment}
                onChange={handleChange}
                // disabled={User}
              />
              <label htmlFor="Adjustment" className="ml-2 mb-0">
                {t("Adjustment")}
              </label>
            </div>

            <div className="col-xl-2 col-sm-4 col-md-6 co-12">
              <div className="">
                <button
                  type="submit"
                  className="btn btn-sm btn block btn-success px-5"
                >
                  Save
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
              <img
                onClick={() => ExportToExcel(tableData)}
                src={excelicon}
                alt="Export to Excel"
                className="excel-icon"
                data-pr-tooltip="Export Active Data"
                style={{ width: "26px", height: "26px", cursor: "pointer" }}
              />
            </div>
          </div>
          <div
            style={{ gap: "4px" }}
            className="d-flex justify-content-end pt-1 px-2"
          >
            <TableFilterDot
              onClick={() => handleFilterInputChange("Pending")}
              color={"#FFFFFF"}
              title={`Pending ${statusCount("Pending")}`}
              bgColor={"#ebebebbf"}
            />
            <TableFilterDot
              onClick={() => handleFilterInputChange("Approved")}
              color={"#90EE90"}
              title={`Approved ${statusCount("Approved")}`}
              bgColor={"#ebebebbf"}
            />
            <TableFilterDot
              onClick={() => handleFilterInputChange("Rejected")}
              color={"#FFB6C1"}
              title={`Rejected ${statusCount("Rejected")}`}
              bgColor={"#ebebebbf"}
            />
          </div>
          <FilterInput
            value={filterInputValue}
            onChange={handleFilterInputChange}
            placeholder="Filter Table"
          />
        </div>

        <div className="mt-1 table_ticket ">
          <CustomTable
            columns={tableHeaders}
            data={tableData.map((itm, index) => ({
              ...itm,
              rowColor: itm.ColorCode,
              sNo: index + 1,
              centreName: itm.Centre || "-",
              amount: itm.Amount || "-",
              paymentDate: itm.TransactionDate || "-",
              paymentMode: itm.PaymentMode || "-",
              expenseType: itm.expensetype || "-",
              invoiceNo: itm.Invoiceno || "-",
              invoiceDate: itm.invoicedate || "-", // fixed typo here
              remarks: itm.remarks || "-",
              // StatusText: itm?.StatusText,
              attachment: (
                <div className="d-flex align-items-center">
                  <img width={16} height={16} src={fileIcon} alt="fileIcon" />
                  <span className="mx-1">({itm?.FileCount || 0})</span>
                </div>
              ),
              action:
                itm?.StatusText === "Pending" ? (
                  <>
                    <div className="d-flex gap-3 align-items-center">
                      <div onClick={() => handleupdate("accept", itm?.id)}>
                        <img
                          src={accept}
                          className=""
                          style={{ height: "25px" }}
                        />
                      </div>
                      <div onClick={() => handleupdate("reject", itm?.id)}>
                        <img src={reject} style={{ height: "30px" }} />
                      </div>
                    </div>
                  </>
                ) : itm?.StatusText === "Approved" ? (
                  <p>
                    Accepted By: {itm?.AcceptBy},<br />
                    Accepted Date: {itm?.AcceptDate}
                  </p>
                ) : itm?.StatusText === "Rejected" ? (
                  <p>
                    Rejected By: {itm?.RejectBy},<br />
                    Rejected Date: {itm?.RejectDate}
                  </p>
                ) : null,
            }))}
          />
        </div>
      </div>
    </>
  );
};

export default CenterExpensesEntry;
