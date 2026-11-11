import React, { useEffect, useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import DatePicker from "../../../../components/formComponent/DatePicker";
import Input from "../../../../components/formComponent/Input";
import Heading from "../../../../components/UI/Heading";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import moment from "moment";
import Loading from "../../../../components/loader/Loading";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import { useLocation, Link } from "react-router-dom";
import DispatchModal from "../DispatchModal/DispatchModal";
import { CustomButton } from "../../../../components/UI/CustomButton";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";

const ApprovalSalesIndent = ({ type }) => {
  const { t } = useTranslation();
  const [selectedRow, setSelectedRow] = useState(null);
  const [dispatchModalShow, setDispatchModalShow] = useState(false);
  const [loading, setloading] = useState(false);
  const [DropDownList, setDropDownList] = useState({
    curentlocation: [],
    intolocation: [],
  });
  const initialState = {
    CurrentLocation: "",
    FromDate: new Date(),
    ToDate: new Date(),
    IndentToLocation: "",
    IndentNo: "",
    IndentStatus: "All",
    Action: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const [subtableData, setSubTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    if (name === "CurrentLocation") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      GetBindToLocaton(value?.value);
    } else {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
    }));
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const colorCodingData = [
    { color: "#FFE4C4", id: "1", labelKey: "New" }, // Light Blue
    { color: "#ffffff", id: "2", labelKey: "Issued" }, // Light Green
    { color: "#90EE90", id: "3", labelKey: "Close" }, // Orange
    { color: "#FFC0CB", id: "4", labelKey: "Reject" }, // Tomato Red
    { color: "#FFFF00", id: "5", labelKey: "Partial Issue" }, // Gold
    { color: "#D3D3D3", id: "6", labelKey: "Partial Receive" }, // Medium Purple
  ];
  const GetBindCurrentLocaton = () => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindalldata", { locationIds: [21, 22] })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
        }));
        setDropDownList((prev) => ({ ...prev, curentlocation: newRes }));
      })
      .catch(() => console.log("Something went wrong"));
  };
  const GetBindToLocaton = (locationid) => {
    axiosInstance
      .post("StoreIndentRePrint/bindindentfromlocation", {
        toLocation: String(locationid?.split("#")?.[0]),
        indentType: String(type),
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationID,
        }));
        setDropDownList((prev) => ({ ...prev, intolocation: newRes }));
        setPayload((prev) => ({
          ...prev,
          IndentToLocation: String(response[0]?.locationID) || "",
        }));
      })
      .catch(() => console.log("Something went wrong"));
  };
  useEffect(() => {
    GetBindCurrentLocaton();
  }, []);
  const indentStatusOption = [
    { label: "All", value: "All" },
    { label: "New", value: "New" },
    { label: "Issued", value: "Issued" },
    { label: "Close", value: "Close" },
    { label: "Reject", value: "Reject" },
    { label: "Partial Issue", value: "Partial Issue" },
    { label: "Partial Receive", value: "Partial Receive" },
  ];
  const indentActionOption = [
    { label: "Maked", value: "Maker" },
    { label: "Checked", value: "Checker" },
    { label: "Approved", value: "Approval" },
  ];
  const handleSearch = () => {
    axiosInstance
      .post("StoreIndentRePrint/searchindent", {
        toLocation: String(payload?.IndentToLocation) || "0",
        fromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
        toDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
        fromLocation: String(payload?.CurrentLocation) || "0",
        indentNo: String(payload?.IndentNo) || "",
        indentType: String(type),
        actionType: String(payload?.Action) || "",
        isSIIndentType: String(payload?.IndentStatus) || "",
      })
      .then((res) => {
        const response = res?.data?.message;
        setTableData(response);

      })
      .catch(() => console.log("Something went wrong"));
  };

  const handleExportToExcel = () => {
    axiosInstance
      .post("StoreIndentRePrint/searchindent", {
        toLocation: String(payload?.IndentToLocation) || "0",
        fromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
        toDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
        fromLocation: String(payload?.CurrentLocation) || "0",
        indentNo: String(payload?.IndentNo) || "",
        indentType: String(type),
        actionType: String(payload?.Action) || "",
        isSIIndentType: String(payload?.IndentStatus) || "",
      })
      .then((res) => {
        const data = res?.data?.message;

        if (!data || data.length === 0) {
          toast.error("No data found");
          return;
        }
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Indent Report");
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        });
        saveAs(blob, "StoreIndentReport.xlsx");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const handleViewItem = (row) => {
    if (selectedRow?.indentno === row?.indentno) {
      setSelectedRow(null);
      setSubTableData([]);
      return;
    }
    axiosInstance
      .get("StoreIndentRePrint/BindItemDetail", {
        params: {
          locationId: String(row?.tolocationid) || "0",
          indentNo: String(row?.indentno) || "",
        },
      })
      .then((res) => {
        const response = res?.data?.message;
        setSubTableData(response);
        setSelectedRow(row);
      })
      .catch(() => console.log("Something went wrong"));
  };
  const handleNextAction = (row) => {
    console.log(row);
    axiosInstance

  };
  const handlePrint = async (row) => {
    setloading(true);
    try {
      const res = await axiosReport.post(
        `StoreReports/IndentReceipt?indentNo=${row?.indentno}`,
        {},
        { responseType: "blob" }
      );
      const blob = res.data;
      const text = await blob.text();
      try {
        const json = JSON.parse(text);
        if (json?.success === false) {
          toast.error(json?.message || "No data found");
          return;
        }
      } catch {
        const pdfBlob = new Blob([blob], { type: "application/pdf" });
        const url = window.URL.createObjectURL(pdfBlob);
        window.open(url, "_blank");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      setloading(false);
    }
  };
  const handleDispatch = (row) => {
    setSelectedRow(row);
    setDispatchModalShow(true);
  };
  const handleCloseDispatch = () => {
    setDispatchModalShow(false);

  };
  return (
    <>
      {dispatchModalShow && (
        <DispatchModal
          show={dispatchModalShow}
          handleShow={setDispatchModalShow}
          title="Dispatch Details"
          Id={selectedRow?.indentno}
          onHandleShow={handleCloseDispatch}
        />
      )}
      <div className="card">
        <Heading name={"Indent Status and Approval"} isBreadcrumb={true} />
        <div className="row px-2 pt-2">
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.curentlocation}
            placeholderName="Current Location"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

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
            lable={t("TO Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="IndentNo"
            id="IndentNo"
            name="IndentNo"
            value={payload?.IndentNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="IndentToLocation"
            id="IndentToLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.intolocation}
            placeholderName="Indent Location "
            value={payload?.IndentToLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <ReactSelect
            name="IndentStatus"
            id="IndentStatus"
            removeIsClearable={true}
            dynamicOptions={indentStatusOption}
            placeholderName="Indent Status"
            value={payload?.IndentStatus}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Action"
            id="Action"
            removeIsClearable={true}
            dynamicOptions={indentActionOption}
            placeholderName="Action"
            value={payload?.Action}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">

            <CustomButton icon={"save"} text={"Search"} onClick={handleSearch} className="mr-2" />

            <CustomButton icon={"excel"} text={"Excel"} onClick={() => { handleExportToExcel() }} />

          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading
          name={"Indent Detail"}
          isBreadcrumb={true}
          secondTitle={
            <>
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                //onClick={() => handleCallViewMedReq(id)}
                />
              ))}
            </>
          }
        />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("View Item")}</th>
                  <th>{t("Indent No")}</th>
                  <th>{t("Indent Date")}</th>
                  <th>{t("Indent From Location")}</th>
                  <th>{t("Indent To Location")}</th>
                  <th>{t("Created User")}</th>
                  <th>{t("Checked User")}</th>
                  <th>{t("Checked Date")}</th>
                  <th>{t("Approved User")}</th>
                  <th>{t("Approved Date")}</th>
                  <th>{t("Narration")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Expected Date")}</th>
                  <th>{t("Action Type")}</th>
                  <th>{t("Next Action")}</th>
                  <th>{t("Print")}</th>
                  <th>{t("Dispatch")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.length > 0 ? (
                  tableData?.map((row, index) => (
                    <>
                      <tr key={index} style={{ backgroundColor: row?.Rowcolor || "white" }}>
                        <td>{index + 1}</td>
                        <td>
                          <i className="btnAdd" onClick={() => handleViewItem(row)}>
                            <i className="fa fa-search" aria-hidden="true"></i>
                          </i>
                        </td>
                        <td>{row?.indentno}</td>
                        <td>{row?.IndentDate}</td>
                        <td>{row?.FromLocation}</td>
                        <td>{typeof row?.ToLocation === "object" ? "" : row?.ToLocation}</td>
                        <td>{row?.Username}</td>
                        <td>{row?.CheckedUserName}</td>
                        <td>{row?.CheckedDate}</td>
                        <td>{row?.ApprovedUserName}</td>
                        <td>{row?.ApprovedDate}</td>
                        <td>{row?.Narration}</td>
                        <td>{row?.Status}</td>
                        <td>
                          {typeof row?.ExpectedDate === "object" || !row?.ExpectedDate
                            ? "-"
                            : row?.ExpectedDate}
                        </td>
                        <td
                          style={{
                            backgroundColor:
                              row?.ActionType === "Checker"
                                ? "#f9f1ba"
                                : row?.ActionType === "Maker"
                                  ? "#cdfbf8"
                                  : row?.ActionType === "Approval"
                                    ? "#c7fea2"
                                    : "transparent",
                          }}
                        >
                          {row?.ActionType}
                        </td>
                        <td>
                          {row?.ActionType === "Maker" || row?.ActionType === "Checker" ? (
                            <Link
                              to="/CreateIndent"
                              state={{
                                indentNo: row?.indentno,
                                ActionType: row?.ActionType,
                                IndentType: row?.IndentType,
                              }}
                            >
                              {row?.ActionType === "Checker" ? t("Approve") : t("Check")}
                            </Link>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>
                          <i onClick={() => !loading && handlePrint(row)}>
                            {loading ? <Loading /> : <i className="fa fa-print" aria-hidden="true"></i>}
                          </i>
                        </td>
                        <td>
                          <i onClick={() => handleDispatch(row)}>
                         <i className="fa fa-truck"></i>
                          </i>
                        </td>
                      </tr>

                      {selectedRow?.indentno === row?.indentno && subtableData?.length > 0 && (
                        <tr>
                          <td></td>
                          <td colSpan="17">
                            <Tables>
                              <thead>
                                <tr>
                                  <th style={{ width: "5%", textAlign: "center" }}>{t("#")}</th>
                                  <th>{t("Item Name")}</th>
                                  <th>{t("Consume/Issue Unit")}</th>
                                  <th>{t("Request Qty")}</th>
                                  <th>{t("Approved Qty")}</th>
                                  <th>{t("Issue Qty")}</th>
                                  <th>{t("Receive Qty")}</th>
                                  <th>{t("Rejected Qty")}</th>
                                  <th>{t("Available Qty")}</th>
                                  <th>{t("Stock In Hand")}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {subtableData?.map((item, subIndex) => (
                                  <tr key={subIndex}>
                                    <td>{subIndex + 1}</td>
                                    <td>{item?.itemName}</td>
                                    <td>{item?.minorUnitName}</td>
                                    <td>{item?.reqQty}</td>
                                    <td>{item?.approvedQty}</td>
                                    <td>{item?.issueQty}</td>
                                    <td>{item?.receiveQty}</td>
                                    <td>{item?.rejectQty}</td>
                                    <td>{item?.pendingQty}</td>
                                    <td>{item?.receiveQty}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Tables>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan="18" style={{ textAlign: "center", padding: "10px" }}>
                      <NoRecordFound />
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          </div>
        </div>
      </div >
    </>
  );
};

export default ApprovalSalesIndent;
