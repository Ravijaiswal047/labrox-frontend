import React, { useEffect, useState } from "react";
import Tables from "../../../../components/UI/customTable";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import {
  getBindCentreType,
  getBindCountry,
  getBindstate,
} from "../../../../utils/NetworkApi/commonApi";
import moment from "moment";
import IssueModal from "./IssueModal";
import CloseReason from "./CloseReason";
import { CustomButton } from "../../../../components/UI/CustomButton";

const IndentIssue = () => {
  const { t } = useTranslation();
  // const [tableData, setTableData] = useState([]);
  const [showIssue, setshowIssue] = useState(false);
  const [showCloseRow, setshowCloseRow] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  console.log("selectedRow", selectedRow);
  const [selectedViewRow, setSelectedViewRow] = useState(null);
  const [subtableData, setSubTableData] = useState([]);
  const [DropDownList, setDropDownList] = useState({
    curentlocation: [],
    tolocation: [],
    centretypebind: [],
    countrybind: [],
    statebind: [],
    centrebind: [],
    dataTable: [],
  });
  const [payload, setPayload] = useState({
    CurrentLocation: "",
    FromDate: new Date(),
    ToDate: new Date(),
    CountryId: "",
    StateId: "",
    CentreType: "",
    IssueToLocation: "",
    IndentNo: "",
    IndentStatus: "All",
    Action: "Approval",
  });
  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return "";
    return data.map((item) => Number(item?.code)).join(",");
  };

  const handleSelectChange = (name, value) => {
    if (name === "CurrentLocation") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      getBindToLocation(value?.value, "", "", "", (data) => {
        setDropDownList((prev) => ({ ...prev, tolocation: data }));
      });
    } else if (name === "CountryId") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      getBindstate(value?.value, (data) => {
        setDropDownList((prev) => ({ ...prev, statebind: data }));
      });
      getBindToLocation(
        String(payload?.CurrentLocation),
        String(value?.value),
        "",
        "",
        (data) => {
          setDropDownList((prev) => ({ ...prev, tolocation: data }));
        }
      );
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

  const IndentStatusList = [
    { value: "All", label: "All" },
    { value: "New", label: "New" },
    { value: "Issued", label: "Issued" },
    { value: "Close", label: "Close" },
    { value: "Reject", label: "Reject" },
    { value: "Partial Issue", label: "Partial Issue" },
    { value: "Partial Receive", label: "Partial Receive" },
  ];

  const colorCodingData = [
    { color: "#ADD8E6", id: "1", labelKey: "New" }, // Light Blue
    { color: "#90EE90", id: "2", labelKey: "Issued" }, // Light Green
    { color: "#FFA500", id: "3", labelKey: "Close" }, // Orange
    { color: "#FF6347", id: "4", labelKey: "Reject" }, // Tomato Red
    { color: "#FFD700", id: "5", labelKey: "Partial Issue" }, // Gold
    { color: "#9370DB", id: "6", labelKey: "Partial Receive" }, // Medium Purple
  ];


  const GetBindCurrentLocaton = () => {
    axiosInstance
      .get("StoreIndentIssue/bindalldata")
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
  const getBindToLocation = (locationId, country, state, type) => {
    axiosInstance
      .post("StoreIndentIssue/bindindentfromlocation", {
        toLocation: String(locationId) || "",
        typeId: type ? type : "",
        countryID: country ? country : "",
        stateID: state ? state : "",
        indentType: "SI",
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
        }));
        setDropDownList((prev) => ({ ...prev, tolocation: newRes }));
        if (response?.length > 0) {
          setPayload((prev) => ({
            ...prev,
            TransferToLocation: String(response[0]?.locationId) || "",
          }));
        }
      })
      .catch(() => console.log("Something Went Wrong"));
  };

  const handleSelectMultiChange = (name, select) => {
    const val = select?.map((ele) => ele?.code);
    if (name === "StateId") {
      const val = select?.map((ele) => ele?.code);
      setPayload((prev) => ({ ...prev, [name]: select }));
      getBindToLocation(
        String(payload?.CurrentLocation),
        String(payload?.CountryId),
        handlePayloadMultiSelectNumbers(select),
        handlePayloadMultiSelectNumbers(payload?.CentreType),
        (data) => {
          setDropDownList((prev) => ({ ...prev, tolocation: data }));
        }
      );
    } else if (name === "CentreType") {
      const val = select?.map((ele) => ele?.code);
      setPayload((prev) => ({ ...prev, [name]: select }));

      getBindToLocation(
        String(payload?.CurrentLocation),
        String(payload?.CountryId),
        handlePayloadMultiSelectNumbers(payload?.StateId),
        handlePayloadMultiSelectNumbers(select),
        (data) => {
          setDropDownList((prev) => ({ ...prev, tolocation: data }));
        }
      );
    } else {
      setPayload((prev) => ({ ...prev, [name]: val }));
    }
  };
  const handleSearch = () => {
    const formattedPayload = {
      tolocation: String(payload?.IssueToLocation || "0"),
      fromlocation: String(payload?.CurrentLocation || "0"),
      fromdate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
      todate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
      indentno: String(payload?.IndentNo || ""),
      indenttype: String(payload?.IndentStatus || ""),
      ActionType: String(payload?.Action || ""),
      IsSIIndentType: "SI",
    };
    axiosInstance
      .post("StoreIndentIssue/searchdata", formattedPayload)
      .then((res) => {
        const response = res?.data?.message;
        if (Array.isArray(response)) {
          setDropDownList((prev) => ({ ...prev, dataTable: response }));
        } else {
          setDropDownList((prev) => ({ ...prev, dataTable: [] }));
          toast.warning("No data found");
        }
      })
      .catch((err) => {
        const errorMsg =
          err?.response?.data?.message ||
          "Something Went Wrong. Please try Again.";
        toast.error(errorMsg);
      });
  };
  useEffect(() => {
    GetBindCurrentLocaton();
    getBindCountry((data) => {
      setDropDownList((prev) => ({ ...prev, countrybind: data }));
    });
    getBindCentreType((data) => {
      setDropDownList((prev) => ({ ...prev, centretypebind: data }));
    });
  }, []);

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

  const handlePrint = (row) => {
    axiosReport
      .get(`StoreReports/IndentIssueReport?IndentNo=${row?.indentno}`,
        { responseType: "blob" })
      .then((res) => {
        const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Batch receipt error:", err);
        toast.error(err?.response?.data?.message);
      });
  };

  const handleAddressPrint = (row) => {
    axiosReport
      .post(
        "StoreReports/IndentIssueReciept", {
        Type: "2",
        IndentNo: row?.indentno || "",
        //BatchNumber: row?.IssueInvoiceNo || "",
      },
        { responseType: "blob" }
      )
      .then((res) => {
        const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Batch receipt error:", err);
        toast.error(err?.response?.data?.message);
      });
  };

  const handleInvoicePrint = (row) => {
    axiosReport
      .post(
        "StoreReports/IndentIssueReciept", {
        Type: "1",
        BatchNumber: row?.IssueInvoiceNo || "",
      },
        { responseType: "blob" }
      )
      .then((res) => {
        const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        window.open(url, "_blank");
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error("Batch receipt error:", err);
        toast.error(err?.response?.data?.message);
      });
  };

  const handleOpenIssue = (row) => {
    setshowIssue(true);
    setSelectedRow(row);
  };
  const handleCloseSchedule = () => {
    setshowIssue(false);
    handleSearch()

  };
  const handleClose = (row) => {
    setshowCloseRow(true);
    setSelectedRow(row);
  };
  const handleCloseRow = () => {
    setshowCloseRow(false);
  };
  return (
    <>
      {showIssue && (
        <IssueModal
          show={showIssue}
          id={selectedRow?.indentno}
          CurrentLocation={selectedRow?.FromLocation}
          ToLocation={selectedRow?.ToLocation}
          tolocationid={selectedRow?.tolocationid}
          CurrentLocationId={selectedRow?.fromlocationid}
          onHandleShow={handleCloseSchedule}
        />
      )}
      {showCloseRow && (
        <CloseReason
          show={showCloseRow}
          id={selectedRow?.indentno}
          //id={state.DoctorID}
          onHandleShow={handleCloseRow}
        />
      )}
      <div className="card">
        <Heading name={"Stock Indent Search /Issue"} isBreadcrumb={true} />
        <div className="row px-2 py-2">
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.curentlocation}
            placeholderName="Indent Location"
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
            lable={t("Indent Date From ")}
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
            lable={t("Indent Date To ")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <ReactSelect
              name="CountryId"
              id="CountryId"
              removeIsClearable={true}
              dynamicOptions={DropDownList?.countrybind?.map((ele) => ({
                value: ele?.CountryID,
                label: ele?.CountryName,
              }))}
              placeholderName="Country"
              value={payload?.CountryId}
              onChange={handleSelectChange}
              respclass={""}
            />
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="State"
              name="StateId"
              values={payload}
              setValues={setPayload}
              dynamicOptions={DropDownList?.statebind}
              labelKey="stateName"
              valueKey="id"
              handleChange={handleSelectMultiChange}
              respclass={""}
            />
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="Centre Type"
              values={payload}
              setValues={setPayload}
              name="CentreType"
              dynamicOptions={DropDownList?.centretypebind}
              labelKey="type"
              valueKey="id"
              handleChange={handleSelectMultiChange}
              respclass={""}
            />
          </div>
          <ReactSelect
            name="IssueToLocation"
            id="IssueToLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.tolocation}
            placeholderName="Issue To Location"
            value={payload?.IssueToLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Indent No"
            id="IndentNo"
            name="IndentNo"
            value={payload?.IndentNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="IndentStatus"
            id="IndentStatus"
            removeIsClearable={true}
            dynamicOptions={IndentStatusList}
            placeholderName="Indent Status"
            value={payload?.IndentStatus}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Action"
            id="Action"
            removeIsClearable={true}
            dynamicOptions={[{ value: "Approval", label: "Approved" }]}
            isDisabled={true}
            placeholderName="Action"
            value={payload?.Action}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            {/* <button className="btn btn-sm btn-success" onClick={handleSearch}>{t("Search")}</button> */}
            <CustomButton icon={"search"} text={"Search"} onClick={handleSearch} />
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading
          name={"Issue Detail"}
          isBreadcrumb={true}
          secondTitle={
            <>
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                //   onClick={() => handleCallViewMedReq(id)}
                />
              ))}
            </>
          }
        />
        <div className="row">
          <div className="col-sm-12">
            {DropDownList?.dataTable?.length > 0 &&(
            <Tables >
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("View Item")}</th>
                  <th>{t("Indent No")}</th>
                  <th>{t("Indent Date")}</th>
                  <th style={{ width: "25%" }}>{t("Indent From Location")}</th>
                  <th style={{ width: "25%" }}>{t("Indent To Location")}</th>
                  <th>{t("Created User")}</th>
                  <th>{t("Narration")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Expected Date")}</th>
                  <th>{t("Action Type")}</th>
                  <th>{t("Indent issue")}</th>
                  <th>{t("Print")}</th>
                  <th >{t("Invoice Print")}</th>
                  <th>{t("Address Print")}</th>
                  <th>{t("Close")}</th>
                </tr>
              </thead>
              <tbody>
                {DropDownList?.dataTable?.map((row, index) => (
                  <>
                    <tr key={index} style={{ backgroundColor: row?.RowColor }}>
                      <td data-title="#">{index + 1}</td>
                      <td data-title="View Item">
                        <i onClick={() => handleViewItem(row)}>
                          <i className="fa fa-eye"></i>
                        </i>
                      </td>
                      <td data-title="Indent No">{row?.indentno}</td>
                      <td data-title="Indent Date">{row?.IndentDate}</td>
                      <td data-title="Indent From Location">
                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                          {row?.FromLocation}
                        </span>
                      </td>
                      <td data-title="Indent To Location">
                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                          {row?.ToLocation}
                        </span>
                      </td>
                      <td data-title="Created User">{row?.Username}</td>
                      <td data-title="Narration">{row?.Narration}</td>
                      <td data-title="Status">{row?.Status}</td>
                      <td data-title="Expected Date">{row?.ExpectedDate}</td>
                      <td data-title="Action Type">{row?.ActionType}</td>
                      <td data-title="Issue Print">
                        {row?.Status !== "Issued" && (
                          <i onClick={() => handleOpenIssue(row)}>
                            <i className="fa fa-exclamation-triangle"></i>
                          </i>
                        )}
                      </td>
                      <td data-title="Print">
                        <i onClick={() => handlePrint(row)}>
                          <i className="fa fa-print" aria-hidden="true"></i>
                        </i>
                      </td>
                      <td data-title="Invoice Print">
                        {row?.Status !== "New" && (
                          <i onClick={() => handleInvoicePrint(row)}>
                            <i className="fa fa-print" aria-hidden="true"></i>
                          </i>
                        )}
                      </td>

                      <td data-title="Address Print">
                        {row?.Status !== "New" && (
                          <i onClick={() => handleAddressPrint(row)}>
                            <i className="fa fa-print" aria-hidden="true"></i>
                          </i>
                        )}
                      </td>

                      <td data-title="Close">
                        <i onClick={() => handleClose(row)}>
                          <i className="fa fa-times"></i>
                        </i>
                      </td>
                    </tr>
                    {selectedRow?.indentno === row?.indentno &&
                      subtableData?.length > 0 && (
                        <tr>
                          <td></td>
                          <td colSpan="17">
                            <Tables >
                              <thead>
                                <tr>
                                  <th style={{ width: "5%", textAlign: "center" }}>
                                    {t("#")}</th>
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
                ))}
              </tbody>
            </Tables>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default IndentIssue;
