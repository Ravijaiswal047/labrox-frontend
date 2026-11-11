import React, { useEffect, useState } from "react";
import Input from "../../../components/formComponent/Input";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Heading from "../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../components/Table/CustomTable";
import RadioInput from "../../../components/formComponent/RadioInput";
import DatePicker from "../../../components/formComponent/DatePicker";
import { Button } from "react-bootstrap";
import CashFlowFrameMenu from "../CashFlowFrameMenu";
import { ViewMenu } from "../../../components/SvgIcons";
import { apiUrls } from "../../../utils/apiEndpoints";
import { axiosInstance } from "../../../utils/axiosInstance";
import moment from "moment/moment";
import { notify } from "../../../utils/utils";
// import { exportToExcel } from "../../../utils/helpers";
import { ExportToExcel } from '../../../utils/helpers';
import Tables from "../../../components/UI/customTable";
import Accordion from "../../../components/UI/Accordion";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";

const CashReceive = () => {
  const { t } = useTranslation();
  const initialState = {
    ReceiveCashFrom: "0",
    UserID: "",
    UploadReceipt: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [payload, setPayload] = useState(initialState);
  const [SearchData, setSearchData] = useState([]);
  const [dropDownList, setDropdownlist] = useState({
    transfertoList: [],
    secondlist: [],
  });
  const [showMore, setShowMore] = useState(false);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };
  const handleSelectChange = (name, value) => {
    if (name === "ReceiveCashFrom") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      handleSearch(value?.value);
    }
  };
  const ReceiveCashFromOption = [
    { label: "Select", value: "0" },
    { label: "User", value: "1" },
    { label: "Field Boy", value: "2" },
    { label: "Bank", value: "3" },
  ];
  const columns = [
    { header: "S.No.", field: "srNo", width: "5%" },
    { header: "Receive By", field: "receiveBy" },
    { header: "Receive Date Time", field: "receiveDateTime" },
    { header: "Transfer By", field: "transferBy" },
    { header: "Transfer Date Time", field: "transferDateTime" },
    { header: "Amount", field: "Amount" },
    { header: "TypeName", field: "TypeName" },
  ];

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const Historycolumns = [
    { header: "S.No.", field: "srNo", width: "5%" },
    { header: "Client Code", field: "ClientCode" },
    { header: "Client Name", field: "ClientName" },
    { header: "TypeName", field: "TypeName" },
    { header: "Transfer By", field: "transferBy" },
    { header: "Transfer Date Time", field: "transferDateTime" },
    { header: "Amount", field: "Amount" },
    { header: "Receipt", field: "Receipt" },
    { header: "ShortDeposit Reason", field: "ShortDepositReason" },
  ];
  const handleReceive = async (item) => {
    const requsBody = {
      id: item?.ID,
      empID: Number(item?.EmpIDTo) || 0,
      empName: String(item?.NameTo) || "",
      typeID: Number(item?.TypeID) || 0,
      typeName: String(item?.TypeName) || "",
      amount: Number(item?.Amount) || 0,
    };
    try {
      const res = await axiosInstance.post(apiUrls?.CashReceive, requsBody);
      notify(res?.data?.message, "success");
      handleSearch(payload?.ReceiveCashFrom);
    } catch (err) {
      console.error("Error fetching business zone:", err);
    }
  };
  const handleReject = async (item) => {
    const requsBody = {
      id: Number(item?.ID),
      rejectReason: String(item?.RejectReason) || "",
    };

    try {
      const res = await axiosInstance.post(apiUrls?.CancelReceive, requsBody);
      console.log(res?.data?.message[0]?.Message)
      notify(res?.data?.message[0]?.Message, "success");
      handleSearch(payload?.ReceiveCashFrom);
    } catch (err) {
      console.error("Error fetching business zone:", err);
    }
  };

  const downloadExcel = (blobData) => {
    const blob = new Blob([blobData], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "Cash_Receive_Report.xlsx";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };


  const GetCashReports = async (type = "0") => {
    const requestBody = {
      employeeID: 0,
      transactionType: "RECEIVE",
      fromDate: payload?.FromDate
        ? moment(payload.FromDate).toISOString()
        : null,
      toDate: payload?.ToDate
        ? moment(payload.ToDate).toISOString()
        : null,
      type,
    };

    try {
      const res = await axiosInstance.post(
        apiUrls?.CashReports,
        requestBody,
        type === "1"
          ? { responseType: "blob" }
          : {}
      );

      if (type === "0") {
        if (!Array.isArray(res?.data?.message)) {
          notify("Internal error occurred", "error");
          return;
        }
        setSearchData(res.data.message);
      }
      if (type === "1") {
        downloadExcel(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (type) => {
    const requestBody = {
      employeeID: 0,
      typeID: String(type),
    };
    await axiosInstance
      .post(apiUrls?.ReceivePending, requestBody)
      .then((res) => {
        if (!Array.isArray(res?.data?.message)) {
          notify("Internal error occured", "error");
          setDropdownlist((prev) => ({
            ...prev,
            secondlist: [],
          }));
          return;
        }
        setDropdownlist((prev) => ({
          ...prev,
          secondlist: res?.data?.message,
        }));
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    handleSearch(payload?.ReceiveCashFrom);
  }, []);
  const handleExcelDownload = (tableData) => {
    ExportToExcel(tableData, "Search Item Master Details");
  };

  return (
    <>
      {showMore && <CashFlowFrameMenu />}
      <div className="card">
        <Heading
          name={"Cash Receive"}
          isBreadcrumb={true}
          secondTitle={
            <>
              <label onClick={() => setShowMore((prev) => !prev)}>
                <ViewMenu />
              </label>
            </>
          }
        />
        <div className="row p-2">
          <ReactSelect
            name="ReceiveCashFrom"
            id="ReceiveCashFrom"
            removeIsClearable={true}
            dynamicOptions={ReceiveCashFromOption}
            placeholderName="Receive Cash From"
            value={payload?.ReceiveCashFrom}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </div>
      <div className="card mt-2">
        <div className="row">
          <div className="col-sm-12">
            <CustomTable
              columns={Historycolumns}
              data={dropDownList?.secondlist?.map((item, index) => ({
                srNo: index + 1,
                ClientCode: item?.EmpIDTo,
                ClientName: item?.NameTo,
                TypeName: item.TypeName,
                transferBy: item?.NAME,
                transferDateTime: item?.CreatedDate,
                Amount: item?.Amount,
                Receipt: (
                  <>
                    <Button
                      className="rounded py-0"
                      onClick={() => handleReceive(item)}
                    >
                      Receive
                    </Button>
                    <Button
                      className="rounded py-0 ml-1"
                      onClick={() => handleReject(item)}
                    >
                      Reject
                    </Button>
                  </>
                ),
                ShortDepositReason: item?.NoteType,
              }))}
            />
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Receive History"} isBreadcrumb={true} />
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
            <Button
              className="rounded py-0"
              onClick={() => GetCashReports("0")}
            >
              Search
            </Button>

            <Button
              className="rounded py-0 ml-2"
              onClick={() => GetCashReports("1")}
            >
              Export To Excel
            </Button>
          </div>

        </div>
      </div>

      <Accordion title={t("Search Detail")} defaultValue={true} seconTitle={<div className="fw-bold">
        Total Amount: ₹{" "}
        {SearchData.reduce(
          (sum, i) => sum + Number(i?.Amount || 0),
          0
        ).toLocaleString("en-IN")}  |
        Total Transaction: {SearchData.length}
      </div>}>
        {Array.isArray(SearchData) && SearchData.length > 0 ? (
          <Tables>
            <thead className="cf">
              <tr>
                <th>S.No</th>
                <th>Receive By</th>
                <th>Receive Date</th>
                <th>Transfer By</th>
                <th>Transfer Date</th>
                <th>
                  <div>Amount</div>

                </th>
                <th>Type</th>
              </tr>
            </thead>

            <tbody>
              {SearchData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item?.ReceiveNameBy}</td>
                  <td>
                    {item?.dtReceive?.value
                      ? moment(item.dtReceive.value).format(
                        "DD-MMM-YYYY hh:mm A"
                      )
                      : ""}
                  </td>
                  <td>{item?.TransferBy}</td>
                  <td>{item?.TransferDateTime}</td>
                  <td className="fw-semibold">
                    ₹ {Number(item?.Amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td>{item?.TypeName}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default CashReceive;
