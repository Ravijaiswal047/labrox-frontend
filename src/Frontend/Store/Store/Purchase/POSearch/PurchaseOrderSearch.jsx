import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePicker";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { getBindCentreType, getBindCountry, getBindstate, getPOBindstate, GetPOZoneData, GetZoneData } from "../../../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import ShowItemDetailsPOModal from "./ShowItemDetailsPOModal";
import { PoStatusList } from "../../../../utils/Constants";
import POQuantityEditModal from "./POQuantityEditModal";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { Link } from "react-router-dom";
import PoCLoseModal from "./PoCLoseModal";
import PoRejectModal from "./PoRejectModal";
import PoEmailModal from "./PoEmailModal";
import { parseAwsKeys } from "../../../../utils/helpers";
import PdfPreviewModal from "../../../utils/PdfPreviewModal";
import { IoDocumentTextOutline } from "react-icons/io5";


const PurchaseOrderSearch = () => {
  const { t } = useTranslation();
  const [showItem, setShowItem] = useState({
    modal: false,
    data: "",
    index: -1
  });
  const [showQtyEdit, setShowQtyEdit] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [showClose, setShowClose] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [rejectModal, setRejectModal] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [emailModal, setEmailModal] = useState({
    modal: false,
    data: "",
    index: -1
  })

  const [previewConfig, setPreviewConfig] = useState({
    visible: false,
    url: null,
  });

  const handleOpenPreview = (keys) => {
    const parsedKeys = parseAwsKeys(keys);

    if (!parsedKeys) return;

    setPreviewConfig({
      visible: true,
      url: parsedKeys,
    });
  };

  const handleClosePreview = () => {
    setPreviewConfig({ visible: false, url: null });
  };

  const [approvalRights, setApprovalRights] = useState({})

  const initialState = {
    FromDate: new Date(),
    ToDate: new Date(),
    VendorId: [],
    LocationId: [],
    CentreType: [],
    BusinessZoneId: [],
    StateId: [],
    PONo: "",
    OrderType: "",
    ActionType: "",
    MakerName: "",
    IndentNo: "",
    poStatus: 0,
  };

  const [locationsearch, setLocationsearch] = useState([]);
  const [payload, setPayload] = useState(initialState);
  const [supplierList, setSupplierList] = useState([]);
  const [makerList, setMakerList] = useState([]);
  const [dropDownApis, setDropDownApis] = useState({
    centretypebind: [],
    BusinessZoneId: [],
    statebind: [],
  });

  const [tableData, setTableData] = useState([]);

  const handlePayloadMultiSelectNumbers = (data) => {
    console.log("Data received:", data);
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item?.code));
  };

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };

  const getBindlocationsearch = () => {
    const requstBody = {
      zoneId: String(""),
      cityId: String(""),
      stateID: String(""),
      typeId: String(""),
      centreid: String("")
    };
    axiosInstance
      .post("VendorQuotation/Bindlocationsearch", {
        ...requstBody,
      })
      .then((res) => {
        const response = res?.data?.message;
        setLocationsearch(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        setLocationsearch([])
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleSelectMultiChange = (name, select) => {
    if (name === "CentreType") {
      setPayload((prev) => ({ ...prev, [name]: select }));
    }
    if (name === "BusinessZoneId") {
      setPayload((prev) => ({
        ...prev,
        BusinessZoneId: select,
        StateId: [],
        CityId: []
      }));

      getPOBindstate(
        handlePayloadMultiSelectNumbers(select),
        (data) => {
          setDropDownApis((prev) => ({
            ...prev,
            statebind: data,
            citybind: []
          }));
        }
      );
    }
    if (name === "StateId") {
      setPayload((prev) => ({
        ...prev,
        StateId: select,
        CityId: []
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: select,
      }))
    }
  };

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const getSupplier = () => {
    axiosInstance
      .get("DirectPO/bindSupplier")
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message;
          setSupplierList(Array.isArray(response) ? response : []);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };



  const getMaker = () => {
    axiosInstance
      .get("POSearch/GetPOApprovalMakers")
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message;
          setMakerList(Array.isArray(response) ? response : []);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const GetPOApprovalRights = () => {
    axiosInstance
      .get("POSearch/GetPOApprovalRights")
      .then((res) => {
        if (res?.data?.success) {
          const response = res?.data?.data;
          setApprovalRights(response);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  useEffect(() => {
    getSupplier();
    getMaker();
    getBindlocationsearch();
    GetPOApprovalRights();
  }, [])

  useEffect(() => {
    getBindCentreType((data) => {
      setDropDownApis((prev) => ({ ...prev, centretypebind: data }));
    });

    GetPOZoneData((data) => {
      setDropDownApis((prev) => ({ ...prev, BusinessZoneId: data }));
    });
  }, []);

  const handleSearchData = (status) => {
    const payloadData = {
      centreType: handlePayloadMultiSelectNumbers(payload?.CentreType) || [0],
      zoneID: handlePayloadMultiSelectNumbers(payload?.BusinessZoneId) || [0],
      stateID: handlePayloadMultiSelectNumbers(payload?.StateId) || [0],
      fromDate: payload?.FromDate,
      toDate: payload?.ToDate,
      vendorID: handlePayloadMultiSelectNumbers(payload?.VendorId) || [0],
      poNo: payload?.PONo,
      POType: payload?.OrderType || "",
      ddlaction: "",
      location: handlePayloadMultiSelectNumbers(payload?.LocationId) || [0],
      indentNo: payload?.IndentNo,
      maker: String(payload?.MakerName),
      poStatus: status || 0,
    };
    axiosInstance
      .post("/POSearch/SearchPO", payloadData)
      .then((res) => {
        if (res?.data?.success) {
          const response = res?.data?.message;
          setTableData(Array.isArray(response) ? response : []);
        }
        else {
          setTableData([])
          toast.error(res?.data?.message ? res?.data?.message : "NO data found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  }

  console.log({ PoStatusList })

  // const printReport = (id) => {
  //   debugger
  //   axiosReport
  //     .post(
  //       `StoreReports/po-report-pdf`,
  //       {
  //         purchaseOrderId: Number(id),
  //       },
  //       {
  //         responseType: "blob",
  //       }
  //     )
  //     .then((res) => {
  //       const url = window.URL.createObjectURL(
  //         new Blob([res.data], { type: "application/pdf" })
  //       );
  //       window.open(url, "_blank");
  //     })
  //     .catch((err) => {
  //       console.log("No Data Found");
  //     });
  // };
  const printReport = (id) => {
    axiosReport
      .post(
        `/StoreReports/PoReportpdf`,
        {},
        {
          params: {
            purchaseOrderId: Number(id),
          },
          responseType: "blob",
        }
      )
      .then((res) => {

        if (!res || !res.data || res.data.size === 0) {
          toast.error("No data found");
          return;
        }

        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = window.URL.createObjectURL(blob);


        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "PO_Report.pdf");

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error(err);


        if (err?.response?.data) {
          const reader = new FileReader();
          reader.onload = function () {
            try {
              const error = JSON.parse(reader.result);
              toast.error(error?.message || "Failed to download PDF");
            } catch {
              toast.error("Failed to download PDF");
            }
          };
          reader.readAsText(err.response.data);
        } else {
          toast.error("Failed to download PDF");
        }
      });
  };
  return (
    <>
      {emailModal?.modal &&
        <PoEmailModal
          show={emailModal?.modal}
          handleClose={() =>
            setEmailModal({ modal: false, data: "", index: -1 })
          }
          state={emailModal?.data}

        />
      }

      {rejectModal?.modal &&
        <PoRejectModal
          show={rejectModal?.modal}
          handleClose={() =>
            setRejectModal({ modal: false, data: "", index: -1 })
          }
          state={rejectModal?.data}
        />

      }
      {showItem?.modal &&
        <ShowItemDetailsPOModal
          show={showItem?.modal}
          handleClose={() =>
            setShowItem({ modal: false, data: "", index: -1 })
          }
          state={showItem?.data}
        />
      }
      {showQtyEdit?.modal &&
        <POQuantityEditModal
          show={showQtyEdit?.modal}
          handleClose={() =>
            setShowQtyEdit({ modal: false, data: "", index: -1 })
          }
          state={showQtyEdit?.data}
        />
      }
      {showClose?.modal &&
        <PoCLoseModal
          show={showClose?.modal}
          handleClose={() => {
            setShowClose({ modal: false, data: "", index: -1 }),
              handleSearchData()
          }

          }
          state={showClose?.data}
        />
      }
      <div className="card">
        <Heading title={"Purchase Order Search"} />
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
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
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
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          {/* <ReactSelect
            name="VendorId"
            id="VendorId"
            removeIsClearable={true}
            dynamicOptions={supplierList?.map((ele) => ({
                label: ele?.supplierName,
                value: ele?.supplierID,
              }))}
            placeholderName="Vendor"
            value={payload?.VendorId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          /> */}
          <MultiSelctItems
            placeholderName="Vendor"
            name="VendorId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={supplierList}
            labelKey="supplierName"
            valueKey="supplierID"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            lable="PO No."
            id="PONo"
            name="PONo"
            value={payload.PONo}
            onChange={handleChange}
            // className="required-fields"
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
          <ReactSelect
            name="OrderType"
            id="OrderType"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Regular", value: "1" },
              { label: "Urgent", value: "2" },
            ]}
            placeholderName="Order Type"
            value={payload?.OrderType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="ActionType"
            id="ActionType"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Prepared", value: "Maker" },
              { label: "Validate", value: "Checker" },
              { label: "Approved", value: "Approval" },
            ]}
            placeholderName="Action Type"
            value={payload?.ActionType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="MakerName"
            id="MakerName"
            removeIsClearable={true}
            dynamicOptions={makerList?.map((ele) => ({
              label: ele?.NAME,
              value: ele?.EmployeeID,
            }))}
            placeholderName="Maker Name"
            value={payload?.MakerName}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            lable="Indent No."
            id="IndentNo"
            name="IndentNo"
            value={payload.IndentNo}
            onChange={handleChange}
            // className="required-fields"
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
        </div>
      </div>
      <div className="card mt-2">
        <Heading title={"Location Filter"} />
        <div className="row p-2">
          <MultiSelctItems
            placeholderName="Centre Type"
            name="CentreType"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.centretypebind}
            labelKey="type"
            valueKey="id"
            handleChange={handleSelectMultiChange}

            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <MultiSelctItems
            placeholderName="BusinessZone"
            name="BusinessZoneId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.BusinessZoneId}
            labelKey="BusinessZoneName"
            valueKey="BusinessZoneID"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="State"
            name="StateId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.statebind}
            labelKey="stateName"
            valueKey="id"
            handleChange={handleSelectMultiChange}

            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Location"
            name="LocationId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={locationsearch}
            labelKey="name"
            valueKey="id"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <div className="col-sm-2">
            <CustomButton
              text={"Search"}
              onClick={() => handleSearchData(0)}
              icon="search"
            />
          </div>
        </div>
        <div className="row pt-1 pl-3 pr-2">
          {PoStatusList.map((ele, i) => {
            return (

              <div
                className="d-flex mr-2 mb-2 pt-1 shadow-sm rounded border hover-shadow"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  backgroundColor:
                    payload.poStatus === ele.value
                      ? "#d0ebff"
                      : "#ffffff",
                }}
                onClick={() => {
                  setPayload({
                    ...payload,
                    poStatus: ele.value,
                  });
                  handleSearchData(ele.value);
                }}
              >
                <button
                  className={`mb-3 mt-2 ml-2 p-2 border-0 POStatus-${ele.value}`}
                  key={ele.value}
                ></button>

                <label className="ml-2 pt-1 pr-2 d-flex">
                  {ele.label}
                </label>
              </div>
            )

          })}
        </div>
      </div>
      <div className="card mt-2">
        <Heading title={"Search Results"} />
        <div className="row">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Action")}</th>
                  <th>{t("PO No.")}</th>
                  <th>{t("Location")}</th>
                  <th>{t("Vendor")}</th>
                  <th>{t("Po Type")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Raised Date")}</th>
                  <th>{t("Gross Amt.")}</th>
                  <th>{t("Net Amt.")}</th>
                  <th>{t("Action Type")}</th>
                  <th>{t("Next Action")}</th>
                  <th>{t("Qty Edit")}</th>
                  <th style={{ width: "4%" }}>{t("PO Close")}</th>
                  <th style={{ width: "4%" }}>{t("PO Reject")}</th>
                  {/* <th>{t("Vendor Comment")}</th> */}
                  {/* <th>{t("Mail")}</th> */}

                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index} style={{ backgroundColor: row?.RowColor || "white" }}>
                    <td data-title={t("Action")}>
                      <div className="d-flex align-items-center" style={{ gap: "4px" }}>
                        <span>{index + 1}</span>
                        <i
                          className="fa fa-search" title="View Items" onClick={() => {
                            setShowItem({
                              modal: true,
                              data: row,
                              index: index,
                            })
                          }}></i>
                        {row?.POStatusType === "Approved" || Number(row?.POStatus) === 4 ? (
                          <span onClick={() => printReport(row.PurchaseOrderID)} style={{ cursor: "pointer" }} title="Print">🖨️</span>
                        ) : null}
                        {row?.PurchaseOrderIDHash ? (
                          <i
                            className="fa fa-paperclip text-primary cursor-pointer"
                            style={{ fontSize: "14px" }}
                            onClick={() => handleOpenPreview(row?.PurchaseOrderIDHash)}
                            title="View Attachments"
                          />
                        ) : null}
                        {row?.BoardApprovalDocument ? (
                          <IoDocumentTextOutline
                            color="#0080ff"
                            style={{ fontSize: "20px", cursor: "pointer" }}
                            onClick={() => handleOpenPreview(row?.BoardApprovalDocument)}
                            title="View Board Approval Document"
                          />
                        ) : null}
                      </div>
                    </td>
               
                    <td data-title={t("PO No.")}>{row.PurchaseOrderNo}</td>
                    <td data-title={t("Location")}>{row.Location}</td>
                    <td data-title={t("Vendor")}>{row.SupplierName}</td>
                    <td data-title={t("Po Type")}>{row.POType}</td>
                    <td data-title={t("Status")}>{row.POStatusType}</td>
                    <td data-title={t("Raised Date")}>{row.RaisedDate}</td>
                    <td data-title={t("Gross Amt.")}>{row.GrossTotal}</td>
                    <td data-title={t("Net Amt.")}>{row.NetTotal}</td>
                    <td data-title={t("Action Type")}>{row.ActionType === "Maker" ? "Prepared" : row.ActionType === "Checker" ? "Validated" : "Approved"}</td>
                    <td data-title={t("Next Action")} className="text-center">
                      {row?.POStatus !== "3" ? (
                        row?.ActionType === "Maker" ? (
                          <Link
                            to="/DirectPO"
                            state={{
                              type: "Checker",
                              id: row?.PurchaseOrderID,
                              No: row?.PurchaseOrderNo,
                              subject: row?.SUBJECT,
                              button: "Update",
                              status: row?.POStatus,
                              url1: `/DirectPO/GetPOData?Poid=${row?.PurchaseOrderID}`,
                              url2: "Employee/UpdateEmployee",
                            }}
                            style={{ textDecoration: "none" }}
                          >
                            <button
                              className="btn btn-sm"
                              style={{ backgroundColor: "aqua", fontWeight: "bold" }}
                              title="Pending For Check"
                            >
                              Validate
                            </button>
                          </Link>
                        ) : row?.ActionType === "Checker" ? (
                          Number(row?.NetTotal) > Number(approvalRights?.limitperpo) ? (
                            <span
                              title="Pending For Approve"
                              style={{
                                backgroundColor: "red",
                                color: "white",
                                fontWeight: "bold",
                                padding: "4px 8px",
                              }}
                            >
                              Limit Exceed
                            </span>
                          ) : (

                            <Link
                              to="/DirectPO"
                              state={{
                                type: "Checker",
                                id: row?.PurchaseOrderID,
                                No: row?.PurchaseOrderNo,
                                subject: row?.SUBJECT,
                                button: "Update",
                                status: row?.POStatus,
                                url1: `/DirectPO/GetPOData?Poid=${row?.PurchaseOrderID}`,
                                url2: "Employee/UpdateEmployee",
                              }}
                              style={{ textDecoration: "none" }}
                            >
                              <button
                                className="btn btn-sm"
                                style={{ backgroundColor: "palegreen", fontWeight: "bold" }}
                                title="Pending For Approve"
                              >
                                Approval
                              </button>
                            </Link>
                          )
                        ) : null
                      ) : (
                        <span title="Reject Reason">{row?.RejectReason}</span>
                      )}
                    </td>

                    <td data-title={t("Qty Edit")} onClick={() => {
                      setShowQtyEdit({
                        modal: true,
                        data: row,
                        index: index,
                      })
                    }}>
                      <Link>
                        {t("Edit")}
                      </Link>

                    </td>
                    <td data-title={t("PO Close")}  onClick={() => {
                      setShowClose({
                        modal: true,
                        data: row,
                        index: index,
                      })
                    }} >
                      <i
                        className="bi bi-x-circle-fill text-danger"
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        title="Close PO"
                      ></i>
                    </td>
                    <td data-title={t("PO Reject")}
                      onClick={() => {
                        setRejectModal({
                          modal: true,
                          data: row,
                          index: index,
                        })
                      }}
                    >
                      <i
                        className="bi bi-x-circle-fill text-danger"
                        style={{ cursor: "pointer", fontSize: "20px" }}
                        title="PO Reject"
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
      {previewConfig.visible && (
        <PdfPreviewModal
          visible={previewConfig.visible}
          url={previewConfig.url}
          onClose={handleClosePreview}
        />
      )}
    </>
  );
};


export default PurchaseOrderSearch;
