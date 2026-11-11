import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePicker";
import Input from "../../../../components/formComponent/Input";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import Loading from "../../../../components/loader/Loading";
import { toast } from "react-toastify";
import DispatchModal from "../DispatchModal/DispatchModal";
import moment from "moment";
import { CustomButton } from "../../../../components/UI/CustomButton";

function IndentReceive() {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [subtableData, setSubTableData] = useState([]);
  const [rowPayloads, setRowPayloads] = useState({});
  const [selectedRow, setSelectedRow] = useState(null);
  const [dispatchModalShow, setDispatchModalShow] = useState(false);


  const [payload, setPayload] = useState({
    CurrentLocation: "",
    IndentNo: "",
    FromDate: new Date(),
    ToDate: new Date(),
    IndentStatus: "Pending For Received",
    QuickReceive: "",
  });
  const [DropDownList, setDropDownList] = useState({
    curentlocation: [],
    //intolocation: [],
  });

  const GetBindCurrentLocaton = () => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindalldata")
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
  useEffect(() => {
    GetBindCurrentLocaton();
  }, []);
  const handleSelectChange = (name, value) => {
    console.log("value", value, name);
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
    }));
  };
  // const handleReceiveQtyChange = (e, index) => {
  //   console.log(index);
  //   const inputValue = e.target.value;
  //   const max = subtableData[index]?.receiveQty || 0;
  //   if (Number(inputValue) > max) return;
  //   setRowPayloads((prev) => ({
  //     ...prev,
  //     [index]: {
  //       ...prev[index],
  //       receiveQty: inputValue,
  //     },
  //   }));
  // };


  const handleReceiveQtyChange = (e, index) => {
    const inputValue = e.target.value;
    const row = subtableData[index];

    const isPrQty = row?.prQty > 0;
    const max = isPrQty ? row?.prQty : row?.receiveQty;

    if (Number(inputValue) > max) return;

    setRowPayloads((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [isPrQty ? "prQty" : "receiveQty"]: inputValue,
      },
    }));
  };
  const handleRemarkChange = (e, index) => {
    const value = e.target.value;
    setRowPayloads((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        pandingRemarks: value,
      },
    }));
  };


  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };


  useEffect(() => {
    const initial = {};
    subtableData.forEach((row, index) => {
      initial[index] = {
        receiveQty: row?.receiveQty || 0,
        pandingRemarks: "",
      };
    });

    setRowPayloads(initial);
  }, [subtableData]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const requestBody = {
        Location: payload?.CurrentLocation || "0",
        DateType: payload?.DateType || "",
        FromDate: moment(payload?.FromDate).format("YYYY-MM-DD 00:00:00"),
        ToDate: moment(payload?.ToDate).format("YYYY-MM-DD 23:59:59"),
        IndentNo: payload?.IndentNo || "",
        IndentType: payload?.IndentStatus || "",
      };
      const res = await axiosInstance.post(
        "IndentReceive/searchindent",
        requestBody
      );
      const tableDataFromAPI = res?.data?.message;
      if (res?.data?.success) {
        setTableData(res?.data?.message)
        setSubTableData([]);
      }
      else {
        toast.error(res?.data?.message)
        setTableData([])
      }
    } catch (error) {
      console.log(error);
      toast.error(t(error?.response?.data?.message));
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (row, index) => {
    setSelectedRow(index);

    axiosInstance
      .post("IndentReceive/BindItemDetail", {
        indentno: row?.indentno,
        itemid: row?.itemid || "",
      })
      .then((res) => {
        const data = res?.data?.message;

        if (Array.isArray(data)) {
          setSubTableData(data);
        } else {
          setSubTableData([]);
        }
      });
  };

  const handleReceive = async () => {
    try {
      const formattedData = subtableData.map((row, index) => {
        const payload = rowPayloads[index] || {};
        const isPrQty = row?.prQty > 0;

        return {
          IndentNo: String(row.indentno || ""),
          ItemId: String(row.itemId || ""),
          StockId: String(row.stockId || ""),
          ReceiveQty: String(
            isPrQty
              ? payload.prQty ?? row.prQty ?? "0"
              : payload.receiveQty ?? "0"
          ),
          FromLocation: String(row.fromLocationId || ""),
          FromPanel: String(row.fromPanelId || ""),
          IssueInvoiceNo: String(row.issueInvoiceNo || ""),
          PendingRemarks: String(payload.pandingRemarks || ""),
          ToLocation: String(row.toLocationID || ""),
        };
      });
      const requestBody = {
        mydataadj: formattedData,
      };

      const res = await axiosInstance.post(
        "IndentReceive/receive-all",
        formattedData
      );
      if (res?.data?.success) {
        toast.success(res?.data?.message);
        handleSearch()
      } else { toast.error(res?.data?.message); }
      setSubTableData([]);
      handleSearch();
    } catch (error) {
      console.log(error, "rere");
      toast.error(error?.response?.data?.message);
    }
  };

  const handleBarcodeSearch = async (barcode) => {
    try {
      const res = await axiosInstance.get("IndentReceive/searchbybarcode", {
        params: { BarcodeNo: barcode, },
      });
      const response = res?.data?.message;
      setPayload((prev) => ({ ...prev, QuickReceive: "" }));
      if (!response || response.length === 0) {
        toast.error("Barcode not found");
        return;
      }
      const { indentNo, itemId, id } = response[0];

      handleItemClickFromBarcode(indentNo, itemId, id);

    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };
  const handleItemClickFromBarcode = (indentno, itemid, id) => {
    axiosInstance
      .post("IndentReceive/BindItemDetail", {
        indentno: String(indentno),
        itemid: String(itemid),
        id: String(id),
      })
      .then((res) => {
        const data = res?.data?.message;

        if (Array.isArray(data)) {
          setSubTableData(data);
        } else {
          setSubTableData([]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
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
  const handleDispatch = (row) => {
    console.log("Selected Row for Dispatch:", row);
    setSelectedRow(row);
    setDispatchModalShow(true);
  };
  const handleCloseDispatch = () => {
    setDispatchModalShow(false);

  };
  const IndentStatusOptions = [
    { label: "All", value: "All" },
    { label: "Pending For Received", value: "Pending For Received" },
    { label: "Partial Received", value: "Partial Received" },
    { label: "Received", value: "Received" },
  ];

  const colorCodingData = [
    { color: "#ADD8E6", id: "3", labelKey: "Pending For Received" },
    { color: "#FFD700", id: "5", labelKey: "Partial Received" },
    { color: "#88E788", id: "4", labelKey: "Received" },
  ];
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
        <Heading name={"Consume Store Item"} isBreadcrumb={true} />
        <div className="row px-2 py-2">
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
          {/* <Input
            type="text"
            placeholder=" "
            lable="Indent Status"
            id="IndentStatus"
            name="IndentStatus"
            value={payload?.IndentStatus}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}

          <ReactSelect
            name="IndentStatus"
            id="IndentStatus"
            removeIsClearable={true}
            dynamicOptions={IndentStatusOptions}
            placeholderName="Indent Status"
            value={payload?.IndentStatus}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            <CustomButton
              text={t("Search")}
              icon={"search"}
              onClick={() => handleSearch()}
            />
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
          <div className="col-md-6 col-12">
            <div className="table-scroll">
              <Tables>
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1 }}>
                  <tr>
                    <th>{t("Sr.No.")}</th>
                    <th>{t("Indent No.")}</th>
                    <th>{t("Indent Date")}</th>
                    <th>{t("Issue From Location")}</th>
                    <th>{t("Issue ToLocation")}</th>
                    <th>{t("Created User")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Print")}</th>
                    <th>{t("Invoice")}</th>
                    {/* <th>{t("Dispatch")}</th> */}
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((row, index) => (
                    <tr
                      key={index}
                      style={{
                        backgroundColor: selectedRow === index ? "#87CEEB" : row?.Rowcolor,
                        cursor: "pointer"
                      }}
                    >
                      <td data-title="#">{index + 1}</td>
                      <td data-title="Indent No">
                        {row?.Status === "Received" ? (
                          <span>{row?.indentno}</span>
                        ) : (
                          <a
                            href="/#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleItemClick(row, index);
                            }}
                          >
                            {row?.indentno}
                          </a>
                        )}
                      </td>
                      <td data-title="Indent Date">{row?.IndentDate}
                      </td>
                      <td data-title="Issue From Location">
                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                          {row?.FromLocation}
                        </span>
                      </td>
                      <td data-title="Issue To Location">
                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                          {row?.ToLocation}
                        </span>
                      </td>
                      <td data-title="Created User">{row?.Username}</td>
                      <td data-title="Status">
                        <span style={{ wordWrap: "break-word", whiteSpace: "normal" }}>{row?.Status}</span>
                      </td>
                      <td data-title="Print">
                        <i
                          onClick={() => handlePrint(row)}
                          aria-label="Print item"
                        >
                          <i className="fa fa-print" aria-hidden="true"></i>
                        </i>
                      </td>
                      <td data-title="Invoice">
                        <i
                          onClick={() => handleInvoicePrint(row)}
                          aria-label="Print item"
                        >
                          <i className="fa fa-print" aria-hidden="true"></i>
                        </i>
                      </td>
                      {/* <td data-title="Dispatch">
                        <span
                          onClick={() => handleDispatch(row)}
                          aria-label="Print item"
                        >
                         <i className="fa fa-truck"></i>
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>

          <div className="col-md-6 col-12">
            <div className="row px-2 py-2">
              {tableData.length > 0 && (
                <Input
                  type="text"
                  lable="Scan Barcode For Quick Receive"
                  id="QuickReceive"
                  name="QuickReceive"
                  value={payload?.QuickReceive}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleBarcodeSearch(e.target.value);
                    }
                  }}
                  onChange={handleChange}
                  respclass={"col-xl-4 col-sm-4 col-md-6 co-10"}
                />
              )}
              {tableData.length > 0 && subtableData.length > 0 && (
                <button
                  type="button"
                  className="btn btn-primary btn-sm mx-4"
                  onClick={() => handleReceive()}
                >
                  {t("Receive Now")}
                </button>
              )}
            </div>


            <div className="table-scroll">
              {tableData.length > 0 && subtableData.length > 0 && (
                <Tables>
                  <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1 }}>
                    <tr>
                      <th>{t("Sr.No.")}</th>
                      <th>{t("Item Id")}</th>
                      <th>{t("Item Name")}</th>
                      <th>{t("Barcode No")}</th>
                      <th>{t("Unit")}</th>
                      <th>{t("Pending Qty")}</th>
                      <th>{t("Recived Qty")}</th>
                      <th>{t("Pending Remarks")}</th>
                      <th>{t("Request Qty")}</th>
                      <th>{t("Approved Qty")}</th>
                      <th>{t("Issued Qty")}</th>
                      <th>{t("Last Receive Qty")}</th>
                      <th>{t("Reject Qty")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subtableData?.map((row, index) => (
                      <tr key={index}>
                        <td data-title="#">{index + 1}</td>
                        <td data-title="Item Id">{row?.itemId}</td>
                        <td data-title="Item Name">{row?.itemName}</td>
                        <td data-title="Barcode No">{row?.barcodeNo}</td>
                        <td data-title="Unit">{row?.minorUnitName}</td>
                        <td data-title="Panding Qty">
                          {row?.prQty}
                        </td>
                        <td data-title="Recived Qty">
                          {/* <Input
                            type="number"
                            value={
                              prQty > 0
                                ? rowPayloads[index]?.prQty ?? ""
                                : rowPayloads[index]?.receiveQty ?? ""
                            }
                            onChange={(e) => handleReceiveQtyChange(e, index)}

                            
                          /> */}
                          <Input
                            type="number"
                            value={
                              subtableData[index]?.pendingQty > 0
                                ? rowPayloads[index]?.pendingQty ?? subtableData[index]?.pendingQty ?? ""
                                : rowPayloads[index]?.receiveQty ?? ""
                            }
                            onChange={(e) => handleReceiveQtyChange(e, index)}
                          />
                        </td>
                        <td data-title="Panding Remarks">
                          <Input
                            type="text"
                            placeholder=" "
                            lable="Panding Remarks"
                            id={`pandingRemarks-${index}`}
                            name="pandingRemarks"
                            value={rowPayloads[index]?.pandingRemarks || ""}
                            onChange={(e) => handleRemarkChange(e, index)}
                            respclass="col-12"
                          />
                        </td>
                        <td data-title="Request Qty">{row?.reqQty}</td>
                        <td data-title="Approved Qty">{row?.approvedQty}</td>
                        <td data-title="Issued Qty">{row?.pendingQty}</td>
                        <td data-title="Last Receive Qty">{row?.receiveQty}</td>
                        <td data-title="Reject Qty">{row?.rejectQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              )}
            </div>
          </div>
        </div>
      </div >
    </>
  );
}

export default IndentReceive;
