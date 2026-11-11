import React, { useEffect, useState } from "react";
import Input from "../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import CustomTable from "../../../components/Table/CustomTable";
import RadioInput from "../../../components/formComponent/RadioInput";
import DatePicker from "../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import CashFlowFrameMenu from "../CashFlowFrameMenu";
import { ViewMenu } from "../../../components/SvgIcons";
import { axiosInstance } from "../../../utils/axiosInstance";
import { apiUrls } from "../../../utils/apiEndpoints";
import FileUpload from "../../ManageQuery/FileUpload";
import { notify } from "../../../utils/utils";
import moment from "moment";
import { ExportToExcel, number } from "../../../utils/helpers";
import { clearFiles } from "../../../store/reducers/fileUploadSlice/fileUploadSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const CashTransfer = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const initialState = {
    TransferTo: "1",
    UserID: "",
    UserName: "",
    UploadReceipt: "",
    FromDate: new Date(),
    ToDate: new Date(),
    TransferAmt: "",
    ShortDepositeReason: "",
    documents: [],
    fieldBoyMobileNo: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [dropDownList, setDropdownlist] = useState({
    transfertoList: [],
    secondlist: [],
  });
  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   setPayload((prev) => ({
  //     ...prev,
  //     [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
  //   }));
  // };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setPayload((prev) => {
      let newValue = type === "checkbox" ? (checked ? "1" : "0") : value;

      if (name === "TransferAmt") {
        const maxTransferAmt =
          Number(tableData?.records?.[0]?.transferAmt) || 0;

        if (Number(newValue) > maxTransferAmt) {
          toast.error(
            `Transfer amount should not be greater than Total Cash Balance`
          );
          return prev; 
        }
      }

      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  const handleSelectChange = (name, value) => {
    if (name === "TransferTo") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      GetCashtransferToList(value?.value);
    }
    if (name === "UserID") {
      setPayload((prev) => ({
        ...prev,
        [name]: value?.value,
        UserName: value?.label,
        fieldBoyMobileNo: value?.Mobile,
        Mobile: value?.Mobile,
      }));
    } else {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    }
  };
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]); // strip "data:*/*;base64,"
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileResponse = async (files) => {
    if (files) {
      // const filePromises = Array.from(files).map(async (file) => {
      //   const base64File = await fileToBase64(file);
      //   console.log('base64File',base64File)
      //   return {
      //     fileName: file.name,
      //     fileBase64: base64File.split(",")[1],
      //   };
      // });

      const fileArray = Array.isArray(files) ? files : [files];
      const documentData = await Promise.all(
        fileArray.map(async (file) => ({
          fileName: file.name,
          fileBase64: await fileToBase64(file),
        }))
      );

      setPayload((prev) => ({
        ...prev,
        documents: documentData,
      }));
    } else {
      setPayload((prev) => ({ ...prev, documents: [] }));
    }
  };

  const TransferToOption = [
    { label: "User", value: "1" },
    { label: "Field Boy", value: "2" },
    { label: "Bank", value: "3" },
  ];
  const labelItem = [
    { label: "Last Day Collection", value: "0" },
    { label: "Total Cash Amount Pending For Receive", value: "0" },
    { label: "Total Cash Balance", value: "100" },
  ];

  const handleAllCheckboxChange = (e) => {
    const checked = e.target.checked;
    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        IsCheck: checked,
      }))
    );
  };

  const handleCheckboxChange = (index, field, checked) => {
    setTableData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: checked } : row))
    );
  };

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const Historycolumns = [
    { header: "S.No.", field: "SNo" },
    // { header: "Client Code", field: "ClientCode" },
    // { header: "Client Name", field: "ClientName" },
    { header: "Transfer By", field: "TransferBy" },
    { header: "Transfer To", field: "TransferTo" },
    { header: "Amount", field: "Amount" },
    { header: "Transfer Date Time", field: "TransferDateTime" },
    { header: "TypeName", field: "TypeName" },
    { header: "IsReceive", field: "IsReceive" },
    { header: "IsReject", field: "IsReject" },
    { header: "RejectReason", field: "RejectReason" },
  ];

  const GetCashtransferToList = async (type) => {
    await axiosInstance
      .post(apiUrls?.Fetchprocedure, {
        typeName: "CashFlow_MasterUserAndFieldBoy",
        params: [String(type ? String(type) : payload.TransferTo)],
      })
      .then((res) => {
        if (!Array.isArray(res?.data?.data)) {
          notify("Internal error occured", "error");
          return;
        }
        setDropdownlist((prev) => ({
          ...prev,
          transfertoList: res?.data?.data?.map((roleList) => ({
            label: roleList?.EmployeeNameTo,
            value: roleList?.ID,
            Mobile: roleList?.Mobile,
          })),
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const GetSummaryList = async () => {
    await axiosInstance
      .get(apiUrls?.GetSummary)
      .then((res) => {
        setTableData(res?.data?.message || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    GetSummaryList();
    GetCashtransferToList();
  }, []);
  const handleSave = async () => {
    if (!payload?.UserID) {
      toast.error("User is Required");
      return;
    }
    if (!payload?.TransferAmt) {
      toast.error("Transfer Amt. is Required");
      return;
    }

    if (!payload?.ShortDepositeReason) {
      toast.error("Short Deposite Reason  is Required");
      return;
    }
    const requestBody = {
      typeID: Number(payload?.TransferTo) || 1,
      depositAmount: Number(payload?.TransferAmt) || 0,
      employee_ID_To: Number(payload?.UserID) || 0,
      employeeName_To: String(payload?.UserName || ""),
      shortDepositRejectReason: String(payload?.ShortDepositeReason || ""),
      fieldBoyMobileNo: String(payload?.fieldBoyMobileNo) || "",
      oldFieldBoyMobileNo: String(payload?.Mobile) || "",
      document: payload?.documents || [],
      // PaymentType:''
    };
    await axiosInstance
      .post(apiUrls?.CashDeposit, requestBody)
      .then((res) => {
        notify(res?.data?.message || []);
        setPayload(initialState);
        dispatch(clearFiles());
        handleSearch();
      })
      .catch((err) => {
        console.log(err);
      });
  };

const downloadExcel = (blobData, fileName) => {
  const blob = new Blob([blobData], {
    type:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


const handleSearch = async (type = "0") => {
  const fromDateStr = payload?.FromDate
    ? moment(payload.FromDate).toISOString()
    : null;

  const toDateStr = payload?.ToDate
    ? moment(payload.ToDate).toISOString()
    : null;

  const requestBody = {
    employeeID: 0,
    transactionType: "DEPOSIT",
    fromDate: fromDateStr,
    toDate: toDateStr,
    type: type,
  };

  try {
    const res = await axiosInstance.post(
      apiUrls?.CashReports,
      requestBody,
      type === "1" ? { responseType: "blob" } : {}
    );

    // 🔍 SEARCH MODE
    if (type === "0") {
      if (!Array.isArray(res?.data?.message)) {
        notify("Internal error occured", "error");
        return;
      }

      setDropdownlist((prev) => ({
        ...prev,
        secondlist: res?.data?.message,
      }));
    }

    // 📥 EXCEL MODE
    if (type === "1") {
      downloadExcel(res.data, "Deposit_Cash_Report.xlsx");
    }
  } catch (err) {
    console.log(err);
  }
};

  const handleExcelDownload = (tableData) => {
    ExportToExcel(tableData, "Search Item Master Details");
  };
  const handleReset = () => {
    setPayload(initialState);
    dispatch(clearFiles());
  };
  return (
    <>
      {showMore && <CashFlowFrameMenu />}
      <div className="card">
        <Heading
          name={"Cash Transfer"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <div className="col-sm-2">
                <label>
                  Last Day Collection{" "}
                  <span className="text-danger ml-2">
                    {tableData?.records?.[0]?.receivedAmt || 0}
                  </span>
                </label>
              </div>
              <div className="col-sm-3">
                <label>
                  Total Cash Amount Pending For Receive
                  <span className="text-danger ml-2">
                    {tableData?.records?.[0]?.transferPendingAmt || 0}
                  </span>
                </label>
              </div>
              <div className="col-sm-2">
                <label>
                  Total Cash Balance
                  <span className="text-danger ml-2">
                    {tableData?.records?.[0]?.transferAmt || 0}
                  </span>
                </label>
              </div>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <div className="row p-2">
          <ReactSelect
            name="TransferTo"
            id="TransferTo"
            removeIsClearable={true}
            dynamicOptions={TransferToOption}
            placeholderName="Transfer To"
            value={payload?.TransferTo}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="UserID"
            id="UserID"
            removeIsClearable={true}
            dynamicOptions={dropDownList?.transfertoList}
            placeholderName="User"
            value={payload?.UserID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            className={"required-fields"}
          />
          {/* <Input
            type="number"
            placeholder=" "
            lable={t("Transfer Amt.")}
            id="TransferAmt"
            name="TransferAmt"
            value={payload?.TransferAmt}
            onChange={handleChange}
            // inputRef={TransferAmtRef}
            className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}
          <Input
            type="number"
            placeholder=" "
            lable={t("Transfer Amt.")}
            id="TransferAmt"
            name="TransferAmt"
            value={payload?.TransferAmt}
            onChange={handleChange}
            max={tableData?.records?.[0]?.transferAmt}
            className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <Input
            type="text"
            placeholder=" "
            lable={t("Short Deposite Reason")}
            id="ShortDepositeReason"
            name="ShortDepositeReason"
            value={payload?.ShortDepositeReason}
            onChange={handleChange}
            // inputRef={ShortDepositeReasonRef}
            className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          {payload?.TransferTo === "2" && (
            <Input
              type="text"
              placeholder=" "
              lable={t("Mobile No.")}
              id="fieldBoyMobileNo"
              name="fieldBoyMobileNo"
              value={payload?.fieldBoyMobileNo}
              onChange={handleChange}
              onInput={(e) => number(e, 10)}
              className={"required-fields"}
              respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />
          )}

          <div className="d-flex justify-content-between">
            <FileUpload
              placeholder="Upload Attachment"
              allowedTypes={[".pdf", ".png", ".jpg", ".jpeg"]}
              onFileSelect={handleFileResponse}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
            <Button className="ml-2 rounded py-0" onClick={handleSave}>
              Save
            </Button>
            <Button
              className="rounded py-0 ml-2 bg-danger"
              onClick={handleReset}
            >
              Clear
            </Button>
          </div>
          {/* <div className="col-xl-1 col-sm-4 col-md-6 col-12 d-flex">
            <Button className="rounded py-0 ml-2" onClick={handleSave}>
              Save
            </Button>
            <Button
              className="rounded py-0 ml-1 bg-danger"
              onClick={handleReset}
            >
              Clear
            </Button>
          </div> */}
        </div>
      </div>

      {/* <div className="card mt-2">
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={columns}
              data={tableData?.data?.map((item, index) => ({
                "#": (
                  <input
                    type="checkbox"
                    checked={item.IsCheck || false}
                    onChange={(e) =>
                      handleCheckboxChange(index, "IsCheck", e.target.checked)
                    }
                  />
                ),
                srNo: index + 1,
                ClinetCode: item.employee_ID_To || "-",
                "Client Name": item.employeeName_To,
                "Total Amt.": item.Amount,
                "Transfer Amt.": (
                  <input
                    type="number"
                    name="TransferAmt"
                    className="form-control"
                    value={item.TransferAmt || 0}
                    onChange={(e) =>
                      handleItemChange(index, e.target.name, e.target.value)
                    }
                  />
                ),
                "Short Deposite Reason": (
                  <input
                    type="text"
                    name="ShortDepositeReason"
                    className="form-control"
                    value={item.ShortDepositeReason || ""}
                    onChange={(e) =>
                      handleItemChange(index, e.target.name, e.target.value)
                    }
                  />
                ),
              }))}
            />
          </div>
        </div>
      </div> */}
      {/* <div className="row mb-3">
        <div className="col-sm-12 d-flex justify-content-end">
          <Button className="rounded py-0 ml-2 mt-2" onClick={handleSave}>
            Save
          </Button>
          <Button className="rounded py-0 ml-2 mt-2 bg-danger">Clear</Button>
        </div>
      </div> */}
      <div className="card mt-2">
        <Heading name={"Transfer History"} isBreadcrumb={true} />
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
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

      <div className="col-sm-6 d-flex justify-content-left">
  <Button className="rounded py-0" onClick={() => handleSearch("0")}>
    Search
  </Button>

  <Button
    className={`rounded py-0 ml-2 ${
      dropDownList?.secondlist?.length > 0
        ? "bg-green hover:bg-green"
        : "bg-red cursor-not-allowed disButton"
    }`}
    disabled={dropDownList?.secondlist?.length === 0}
    onClick={() => handleSearch("1")}
  >
    Download Excel
  </Button>
</div>

        </div>
      </div>
      <div className="card mt-2">
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={Historycolumns}
              data={dropDownList?.secondlist?.map((item, index) => ({
                // "#": index,
                SNo: index + 1,
                // ClientCode: item.ReceivedByID,
                // ClientName: item.ReceivedBy,
                TransferBy: item.TransferToID,
                TransferTo: item.TransferTo,
                Amount: item.Amount,
                TypeName: item.TypeName,
                TransferDateTime: item.CreatedDate,
                IsReceive: item.IsReceive,
                IsReject: item.IsReject,
                RejectReason: item.RejectReason,
              }))}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default CashTransfer;
