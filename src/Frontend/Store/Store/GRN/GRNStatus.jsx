import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../components/UI/Accordion";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import DatePicker from "../../../components/formComponent/DatePicker";
import Input from "../../../components/formComponent/Input";
import Heading from "../../../components/UI/Heading";
import ColorCodingSearch from "../../../components/ModalComponent/ColorCodingSearch";
import { axiosInstance, axiosReport } from "../../../utils/axiosInstance";
import moment from "moment/moment";
import { toast } from "react-toastify";
import Tables from "../../../components/UI/customTable";
import Modal from "../../../components/ModalComponent/Modal";
import ShowDetailitemGRNStatus from "./ShowDetailitemGRNStatus";
import { CustomButton, SearchButton } from "../../../components/UI/CustomButton";
import { guidNumber } from "../../../utils/generateGuid";
import UploadFile from "../../utils/UploadFileModal/UploadFile";
import { Link } from "react-router-dom";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
const GRNStatus = () => {
  const { t } = useTranslation();

  const initialState = {
    GRNLocation: "",
    Supplier: "",
    FromDate: new Date(),
    ToDate: new Date(),
    PONumber: "",
    InvoiceChallanNo: "",
    GRNNo: "",
    GRNType: "All",
    FilePath: "",
  };

  const [payload, setPayload] = useState(initialState);
  const [getLocations, setGetLocations] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [searchtableData, setSearchtableData] = useState([]);
  const [getRights, setGetRights] = useState({});
    const userData = useLocalStorage("userData", "get");
    const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    index: -1,
    ledgerTransactionId: null,
  });
  const [handleModelData, setHandleModelData] = useState({
    isOpen: false,
    label: "",
    width: "",
    Component: null,
  });

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const dateSelect = (date, name) => {
    setPayload({ ...payload, [name]: date });
  };

  const GRNTypeOption = [
    { label: "Select", value: "All" },
    { label: "Non-Posted", value: "0" },
    { label: "Posted", value: "1" },
    { label: "Cancel", value: "3" },
  ];

  const colorCodingData = [
    { color: "#FFC0CB", id: "8", labelKey: "Post" },
    { color: "#90EE90", id: "7", labelKey: "Un-Post" },
    // { color: "#FFC0CB", id: "7", labelKey: "Un-Post" },
    { color: "#DC143C", id: "15", labelKey: "Cancle" },
  ];

  const getLocationApi = async () => {
    const requstBody = {
      itemid: String(""),
      centerid: String(""),
      sateID: String(""),
    };
    await axiosInstance
      .post("VendorQuotation/GetLocations", { ...requstBody })
      .then((res) => {
        const respons = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setGetLocations(Array.isArray(respons) ? respons : []);
        }
      });
  };

  const getSupplierApi = async () => {
    await axiosInstance
      .get("VendorQuotation/bindsupplier")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setSupplierList(Array.isArray(response) ? response : []);
        } else {
          toast.error("Data not found!");
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const GetRightsApi = async () => {
    await axiosInstance.get("GRNStatus/GetRights").then((res) => {
      const respons = res?.data?.data;
      const status = res?.data?.status;
      if (status) {
        setGetRights(respons);
      }
    });
  };

  const handelSearch = async () => {
    // if (payload?.GRNLocation === "" || payload?.Supplier === "") {
    //   toast.warn("Please Select Location and Supplier..!");
    //   return;
    // }
    try {
      const requstBody = {
        location: String(payload?.GRNLocation || ""),
        fromdate: moment(payload.FromDate, "YYYY-MM-DD HH-mm-ss").format("YYYY-MM-DD"),
        todate: moment(payload.ToDate, "YYYY-MM-DD HH-mm-ss").format("YYYY-MM-DD"),
        supplier: String(payload?.Supplier || ""),
        ponumber: String(payload?.PONumber || ""),
        invoiceno: String(payload?.InvoiceChallanNo || ""),
        grnno: String(payload?.GRNNo || ""),
        grnstatus: String(payload?.GRNType || ""),
        grnId: "",
        type: "",
      };

      const res = await axiosInstance.post("GRNStatus/SearchData", requstBody);
      const respons = res?.data?.message;
      const status = res?.data?.success;

      if (status && Array.isArray(respons)) {
        setSearchtableData(respons);
        GetRightsApi();
      } else {
        toast.error(respons || "Something went wrong");
        setSearchtableData([]);
      }
    } catch (error) {
      console.error("GRN Search Error:", error);
      setSearchtableData([]);
      toast.error(
        error?.response?.data?.message || error?.message || "Server Error"
      );
    }
  };

  // ✅ FIX: handleModel now accepts a renderFn (function returning JSX) OR JSX directly
  const handleModel = (label, width, type, isOpen, ComponentOrJSX) => {
    setHandleModelData({
      label,
      width,
      type,
      isOpen,
      Component:
        typeof ComponentOrJSX === "function"
          ? ComponentOrJSX
          : () => ComponentOrJSX,
    });
  };

  const setIsOpen = (val) => {
    setHandleModelData((prev) => ({ ...prev, isOpen: val }));
  };

  const printReport = (LedgerTransactionID) => {
    axiosReport
      .post(`StoreReports/ledger-transaction-pdf?ledgerTransactionId=${LedgerTransactionID}`, {}, { responseType: "blob", })
      .then((res) => {
        const url = window.URL.createObjectURL(
          new Blob([res.data], { type: "application/pdf" }),
        );
        window.open(url, "_blank");
      })
      .catch((err) => {
        console.log("No Data Found")
      });
  }

  const handleCaptureUploadedFile = async () => {
    const payload = {
      LedgerTransactionId: String(showFileModal?.ledgerTransactionId),
      FileName: showFileModal?.data,
    };

    try {
      const res = await axiosInstance.post(
        "DirectGRN/savegrndocument",
        payload
      );

      if (res?.data?.success) {
        toast.success("Document Saved Successfully");
      }
    } catch (error) {
      toast.error("Error saving document");
    }
  };

  const handleOpenUploadModal = (item, index) => {
    let currentGuid = item?.DocumentGuid;
    if (!currentGuid) {
      currentGuid = guidNumber();
      setSearchtableData((prev) =>
        prev.map((row, i) =>
          i === index ? { ...row, DocumentGuid: currentGuid } : row
        )
      );
    }
    setShowFileModal({ modal: true, data: currentGuid, index, ledgerTransactionId: item?.LedgerTransactionID });
  };



  useEffect(() => {
    getLocationApi();
    getSupplierApi();
  }, []);

  const ShowModalGRNStatusPost = ({ items }) => {
    const handlePostRowApi = async () => {
      const requstBody = {
        grnId: String(items.grnid || ""),
        type: String(items.type || ""),
      };
      await axiosInstance
        .post("GRNStatus/Post", { ...requstBody })
        .then((res) => {
          const respons = res?.data?.message;
          const status = res?.data?.success;
          if (status) {
            toast.success(respons);
            setHandleModelData((val) => ({ ...val, isOpen: false }));
            handelSearch();
          }
        });
    };

    const hendelBtnNo = () => {
      setHandleModelData((val) => ({ ...val, isOpen: false }));
    };

    return (
      <div className="card mt-2">
        <Heading name={`Do you want to ${items.heading}?`} isBreadcrumb={true} />
        <div className="row p-3">
          <div className="col-sm-12 d-flex" style={{ gap: "10px" }}>
            <CustomButton text={"Yes"} onClick={handlePostRowApi} />
            <CustomButton text={"No"} onClick={hendelBtnNo} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Upload File Modal */}
      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            handleCaptureUploadedFile();
            setShowFileModal({ modal: false, data: "", index: -1 });
          }}
          documentId={showFileModal?.data}
          pageName="GRNInvoice"
          handleUploadCount={handleCaptureUploadedFile}
        />
      )}

      {handleModelData?.isOpen && handleModelData?.Component && (
        <Modal
          visible={handleModelData.isOpen}
          setVisible={setIsOpen}
          Header={handleModelData.label}
          modalWidth={handleModelData.width}
        >
          <handleModelData.Component />
        </Modal>
      )}

      <Accordion name={t("GRN Status")} defaultValue={true} isBreadcrumb={true}>
        <div className="row p-2">
          <ReactSelect
            name="GRNLocation"
            id="GRNLocation"
            removeIsClearable={true}
            dynamicOptions={getLocations?.map((ele) => ({
              label: ele?.Location,
              value: ele?.LocationID,
            }))}
            placeholderName="GRN Location"
            value={payload?.GRNLocation}
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
          <ReactSelect
            name="Supplier"
            id="Supplier"
            removeIsClearable={true}
            dynamicOptions={supplierList?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            placeholderName="Supplier"
            value={payload?.Supplier}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="PO Number"
            id="PONumber"
            name="PONumber"
            value={payload.PONumber}
            maxLength={10}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
             lable={t(DefaultCurrencyName == "KES" ? "Invoice/Delivery No" : "Invoice/Challan No")}
            id="InvoiceChallanNo"
            name="InvoiceChallanNo"
            maxLength={10}
            value={payload.InvoiceChallanNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="GRN No"
            id="GRNNo"
            name="GRNNo"
            value={payload.GRNNo}
            maxLength={10}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="GRNType"
            id="GRNType"
            removeIsClearable={true}
            dynamicOptions={GRNTypeOption}
            placeholderName="GRN Type"
            value={payload?.GRNType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            <SearchButton text={"Search"} onClick={handelSearch} />
          </div>
        </div>
      </Accordion>

      <div className="card">
        <Heading
          name={t("GRN Details")}
          defaultValue={true}
          isBreadcrumb={true}
          secondTitle={
            <>
              {colorCodingData.map(({ color, labelKey, id }) => (
                <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
              ))}
            </>
          }
        />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("View Item")}</th>
                  <th>{t("GRN No")}</th>
                  <th>{t("PO Number")}</th>
                  <th>{t("Invoice No")}</th>
                  <th>{t(DefaultCurrencyName == "KES" ? "Delivery No" : "Challan No")}</th>
                  <th>{t("Supplier")}</th>
                  <th>{t("GRN Date")}</th>
                  <th>{t("Gross Amt")}</th>
                  <th>{t("Disc Amt")}</th>
                  <th>{t("Tax Amt")}</th>
                  <th>{t("GRN/Net Amt")}</th>
                  <th>{t("Post")}</th>
                  <th>{t("UnPost")}</th>
                  <th>{t("Cancel")}</th>
                  <th>{t("Print")}</th>
                  <th>{t("Doc")}</th>
                  <th>{t("Edit")}</th>
                  <th>{t("Bar Code")}</th>
                </tr>
              </thead>
              <tbody>
                {searchtableData?.map((item, index) => (
                  <tr key={index} style={{ backgroundColor: item?.rowColor }}>
                    <td data-title={t("#")}>{index + 1}</td>

                    {/* View Item */}
                    <td data-title={t("View Item")}>
                      <i
                        className="fa fa-search ShowGRNStatusPost-big-icon-print"
                        style={{ color: "#03a0e7", marginLeft: 8, cursor: "pointer" }}
                        onClick={() =>
                          handleModel(
                            "Item Detail",
                            "70vw",
                            "Store Location (SI)",
                            true,
                            () => (
                              <ShowDetailitemGRNStatus
                                items={searchtableData[index]}
                                index={index}
                              />
                            )
                          )
                        }
                      />
                    </td>

                    <td data-title={t("GRN No")}>{item?.LedgerTransactionNo}</td>
                    <td data-title={t("PO Number")}>{item?.PurchaseOrderNo}</td>
                    <td data-title={t("Invoice No")}>{item?.InvoiceNo}</td>
                    <td data-title={t("Challan No")}>{item?.ChalanNo}</td>
                    <td data-title={t("Supplier")}>{item?.SupplierName}</td>
                    <td data-title={t("GRN Date")}>{item?.GRNDate}</td>
                    <td data-title={t("Gross Amt")}>{item?.GrossAmount}</td>
                    <td data-title={t("Disc Amt")}>{item?.DiscountOnTotal}</td>
                    <td data-title={t("Tax Amt")}>{item?.TaxAmount}</td>
                    <td data-title={t("GRN/Net Amt")}>{item?.NetAmount}</td>

                    <td data-title={t("Post")}>
                      {item?.islocktoday == 0 &&
                        !item?.isPost &&
                        getRights?.canPost && (
                          <i
                            className="fa fa-check-square ShowGRNStatusPost-big-icon-check-square"
                            style={{ cursor: "pointer", color: "#03a0e7" }}
                            onClick={() =>
                              handleModel(
                                "",
                                "40vw",
                                "",
                                true,
                                () => (
                                  <ShowModalGRNStatusPost
                                    items={{
                                      grnid: item?.LedgerTransactionID,
                                      type: "1",
                                      heading: "Post",
                                    }}
                                  />
                                )
                              )
                            }
                          />
                        )}
                    </td>

                    {/* UnPost */}
                    <td data-title={t("UnPost")}>
                      {item?.islocktoday == 0 &&
                        item?.isPost &&
                        getRights?.canUnpost && (
                          <i
                            className="fa fa-times-circle ShowGRNStatusPost-big-icon-Remove"
                            style={{ cursor: "pointer", color: "#03a0e7" }}
                            onClick={() =>
                              handleModel(
                                "",
                                "40vw",
                                "",
                                true,
                                () => (
                                  <ShowModalGRNStatusPost
                                    items={{
                                      grnid: item?.LedgerTransactionID,
                                      type: "0",
                                      heading: "UnPost",
                                    }}
                                  />
                                )
                              )
                            }
                          />
                        )}
                    </td>

                    {/* Cancel */}
                    <td data-title={t("Cancel")}>
                      {item?.islocktoday == 0 &&
                        !item?.isPost &&
                        getRights?.canCancel && (
                          <i
                            className="fa fa-times ShowGRNStatusPost-big-icon-Remove"
                            style={{ cursor: "pointer", color: "#03a0e7" }}
                            onClick={() =>
                              handleModel(
                                "",
                                "40vw",
                                "",
                                true,
                                () => (
                                  <ShowModalGRNStatusPost
                                    items={{
                                      grnid: item?.LedgerTransactionID,
                                      type: "3",
                                      heading: "Cancel",
                                    }}
                                  />
                                )
                              )
                            }
                          />
                        )}
                    </td>

                    {/* Print */}
                    <td data-title={t("Print")} onClick={() => printReport(item?.LedgerTransactionID)}>
                      <i
                        className="fa fa-print ShowGRNStatusPost-big-icon-print"
                        style={{ cursor: "pointer", color: "#03a0e7" }}
                      />
                    </td>

                    {/* Doc */}
                    <td data-title={t("Doc")}>
                      <i
                        className="fa fa-file-pdf ShowGRNStatusPost-big-icon-print"
                        style={{ cursor: "pointer", color: "#03a0e7" }}
                        onClick={() => handleOpenUploadModal(item, index)}
                      />
                    </td>
                    {!item?.isPost ? <td data-title={t("Edit")}>
                      <Link to="/DirectGRN" state={{
                        LedgerTransactionID: item.LedgerTransactionID,
                        LedgerTransactionNo: item.LedgerTransactionNo,
                        PurchaseOrderNo: item?.PurchaseOrderNo,


                      }}>
                        <i
                          className="fa fa-edit ShowGRNStatusPost-big-icon-print"
                          style={{ cursor: "pointer", color: "#03a0e7" }}
                        />
                      </Link>
                    </td> : "-"}
                    {/* Bar Code */}
                    <td data-title={t("Bar Code")}>
                      <i
                        className="fa fa-print ShowGRNStatusPost-big-icon-print"
                        style={{ cursor: "pointer", color: "#03a0e7" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default GRNStatus;