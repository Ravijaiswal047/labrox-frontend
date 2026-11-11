import React, { useEffect, useState } from "react";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Heading from "../../../components/UI/Heading";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import GRNFromPoTble from "./GRNFromPoTble";
import Input from "../../../components/formComponent/Input";
import RadioInput from "../../../components/formComponent/RadioInput";
import Modal from "../../../components/ModalComponent/Modal";
// import InvoiceUploadModal from "../../../components/ModalComonent/utils/InvoiceUploadModal";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import DatePicker from "../../../components/formComponent/DatePicker";
import { text } from "@fortawesome/fontawesome-svg-core";
import moment from "moment";
import UploadFile from "../../utils/UploadFileModal/UploadFile";
import { CustomButton } from "../../../components/UI/CustomButton";
import { guidNumber } from "../../util/Commonservices";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
const GRNfromPo = () => {
  const { t } = useTranslation();
  const [InvoiceModal, setInvoiceModal] = useState({
    header: null,
    show: false,
    size: null,
    component: null,
    footer: null,
  });
  const initialState = {
    GRNLocation: null,
    OrderNo: null,
    InvoiceDate: new Date(),
    InvoiceNo: "",
    ChallanNo: "",
    ChallanDate: new Date(),
    ReceiveDate: new Date(),
    GateEntryNo: "",
    Freight: "0",
    Octroi: "0",
    RoundOff: "0",
    GRNAmount: "",
    InvoiceAmount: "",
    Narration: "",
    ReagentsTemperature: "Expired",
    IsBarcode: "",
  };
  const [payload, setPayload] = useState(initialState);
  console.log("payload", payload);
  const [GRNLocation, setGRNLocation] = useState([]);
  const [bindorder, setbindorder] = useState([]);
  const [bindorderdetail, setbindorderdetail] = useState([]);
  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const handleSelectChange = (name, value) => {
    if (name === "GRNLocation") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      bindorderAPI(value?.value);
    } else if (name == "OrderNo") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    } else {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    }
  };
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setPayload((prev) => ({ ...prev, [name]: value }));
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => {
      const updatedPayload = { ...prev, [name]: value };

      // If the changed field is Freight, Octroi, or RoundOff, recalculate amounts
      if (name === 'Freight' || name === 'Octroi' || name === 'RoundOff') {
        const freight = parseFloat(name === 'Freight' ? value : prev.Freight) || 0;
        const octroi = parseFloat(name === 'Octroi' ? value : prev.Octroi) || 0;
        const roundOff = parseFloat(name === 'RoundOff' ? value : prev.RoundOff) || 0;

        // Calculate base amount from childDataTabel
        const baseAmount = Array.isArray(childDataTabel)
          ? childDataTabel.reduce((sum, item) => sum + parseFloat(item.NetAmt || 0), 0)
          : parseFloat(prev.GRNAmount) || 0;

        const totalAmount = baseAmount + freight + octroi + roundOff;

        updatedPayload.GRNAmount = totalAmount;
        updatedPayload.InvoiceAmount = totalAmount;
      }

      return updatedPayload;
    });
  };
  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };
  const reagentsTemperatureOptions = [
    { label: "Expired", value: "Expired" },
    // { label: "-Select-", value: "0" },
    { label: "Ambient", value: "Ambient" },
    { label: "2-", value: "2-" },
    { label: "-20", value: "-20" },
    { label: "Damaged", value: "Damaged" },
  ];
  // const LabelInput = [
  //   { label: "Order Date", value: "03-Dec-2021" },
  //   { label: "Order Number", value: "PO/21-22/00000048" },
  //   { label: "Supplier ", value: "SHREE PRASAD AGENCY" },
  //   { label: "Subject ", value: "03-Jun-2025" },
  // ];
  const LabelInput =
    bindorderdetail.length > 0
      ? [
        {
          label: "Order Date",
          value: bindorderdetail[0].podate
            ? new Date(bindorderdetail[0].podate).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }
            )
            : "N/A",
        },
        {
          label: "Order Number",
          value: bindorderdetail[0].PurchaseOrderNo || "N/A",
        },
        {
          label: "Supplier",
          value: bindorderdetail[0].VendorName || "N/A",
        },
        {
          label: "Subject",
          value: bindorderdetail[0].Subject || "N/A",
        },
      ]
      : [];

  const [sectionOrderDetail, setsectionOrderDetail] = useState(false);
  // const handleModalOpen = () => {
  //   setInvoiceModal({
  //     show: true,
  //     header: "Upload Document",
  //     size: "50vw",
  //     component: <InvoiceUploadModal />,
  //     footer: <></>,
  //   });
  // };

  const BindddllocationApi = async () => {
    await axiosInstance
      .get("GRNFormPO/Bindddllocation")
      .then((res) => {
        const response = res?.data?.message;
        console.log("res", response)
        const status = res?.data?.success;
        if (status) {
          setGRNLocation(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const bindorderAPI = async (id) => {
    const requestBody = {
      location: String(id | ""),

    };
    await axiosInstance
      .post("GRNFormPO/Bindorder", requestBody)
      .then((res) => {
        const response = res?.data?.message;
        console.log("rrr", response)
        const status = res?.data?.success;
        if (status) {
          setbindorder(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const SearchApi = async (id) => {
    if (!payload?.GRNLocation) {
      toast.error("Please select GRN Location");
      return;
    }
    if (!payload?.OrderNo) {
      toast.error("Please select Order No");
      return;
    }

    const result = GRNLocation.find(
      (loc) => loc.id.split("#")[0] === payload.GRNLocation
    );
    const requestBody = {
      location: String(result?.id || ""),
      poid: String(payload?.OrderNo),
    };
    await axiosInstance
      .post("GRNFormPO/Bindorderdetail", requestBody)
      .then((res) => {
        const response = res?.data?.message;
        console.log("sss", response)
        const status = res?.data?.success;
        if (status) {
          setbindorderdetail(Array.isArray(response) ? response : []);
          setsectionOrderDetail(true);

        } else {
          toast.error(response);
          handleReset()
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const SearchApiw = () => {
    setsectionOrderDetail(true);
  };

  const [childDataTabel, setChildDataTabel] = useState("");
  console.log("childDataTabrel", childDataTabel);
  const getDataFromChild = (val) => {
    setChildDataTabel(val);
  };

  const [totals, setTotals] = useState({
    TaxAmount: 0,
    DiscountAmount: 0,
    GrossAmt: 0,
  });

  console.log("childDataTabel in parent:", totals);
  console.log("totals", totals);
  console.log("childDataTabel", childDataTabel);
  const VendorID = childDataTabel[0]?.VendorID;
  console.log("VendorID", VendorID);


  const handleSaveBtn = async () => {
    if (payload?.Freight > 0 || payload?.Octroi > 0) {
      if (!payload?.ChallanNo) { toast.error(`Please Enter ${DefaultCurrencyName == "KES" ? "Delivery No" : "Challan No"}`); return; }
    }
    const rowsToSave = Array.isArray(childDataTabel) ? childDataTabel : [];
    if (rowsToSave.length === 0) {
      toast.error("No GRN rows available to save.");
      return;
    }
    console.log("rowsToSave", rowsToSave);
    const hasEmptyBatch = childDataTabel.some(
      (row) => row.BatchNumber.trim() === ""
    );
    if (hasEmptyBatch) {
      toast.error("Batch Number is required ");
      return;
    }
    const missingExpiry = childDataTabel.some(
      (row) => row.IsExpirable == 1 && !row.ExpiryDate
    );
    if (missingExpiry) {
      toast.error("Expiry Date is required");
      return;
    }
    const VendorID = childDataTabel[0]?.VendorID;
    const PurchaseOrderNo = childDataTabel[0]?.PurchaseOrderNo;
    const storeNMStockObj = [];
    rowsToSave?.map((ele) => {
      const IGSTPer = parseFloat(ele?.IGSTPer || 0);
      const CGSTPer = parseFloat(ele?.CGSTPer || 0);
      const SGSTPer = parseFloat(ele?.SGSTPer || 0);
      const Rate = parseFloat(ele?.Rate) || 0;
      let Disc = parseFloat(ele?.DiscountPer) || 0;
      const Quantity = parseFloat(ele?.PaidQty) || 0;
      if (Disc > 100) Disc = 100;

      const Tax = IGSTPer === 0 ? CGSTPer + SGSTPer : IGSTPer;
      const disc = precise_round(Rate * Disc * 0.01, 5);
      const ratedisc = precise_round(Rate - disc, 5);
      const tax = precise_round(ratedisc * Tax * 0.01, 5);
      const ratetaxincludetax = precise_round(ratedisc + tax, 5);
      const taxAmount = precise_round(tax, 5);
      const discountAmount = precise_round(disc, 5);
      const NetAmount = precise_round(ratetaxincludetax * Quantity, 5);
      let obj = {
        stockID: Number(0) || 0,
        itemID: Number(ele?.itemid) || 0,
        itemName: String(ele?.typename || ""),
        ledgerTransactionID: 0,
        ledgerTransactionNo: "",
        batchNumber: String(ele?.BatchNumber || ""),
        rate: Number(ele?.Rate) || 0,
        discountPer: Number(ele?.DiscountPer) || 0,
        // discountAmount: Number(ele?.DiscountAmt) || 0,
        discountAmount: Number(discountAmount) || 0,
        taxPer: Number(Tax) || 0,
        taxAmount: Number(taxAmount) || 0,
        unitPrice: (Number(ele?.BuyPrice - discountAmount) + taxAmount) || 0,
        mrp: Number(ele?.Rate) || 0,
        initialCount: (Number(ele?.Converter) || 1) * (Number(ele?.PaidQty) || 0),
        releasedCount: 0,
        pendingQty: 0,
        rejectQty: 0,
        expiryDate: String(ele?.ExpiryDate || ""),
        naration: String(payload?.Narration || ""),
        isFree: 0,
        locationID: Number(ele?.LocationId) || 0,
        panel_Id: Number(ele?.panelid) || 0,
        indentNo: "",
        fromLocationID: 0,
        fromStockID: 0,
        reusable: 0,
        manufactureID: Number(ele?.ManufactureID) || 0,
        macID: Number(ele?.MachineID) || 0,
        majorUnitID: Number(ele?.MajorUnitId) || 0,
        majorUnit: String(ele?.MajorUnitInDecimal || ""),
        minorUnitID: Number(ele?.MinorUnitId) || 0,
        minorUnit: String(ele?.MinorUnitName || ""),
        converter: Number(ele?.Converter) || 0,
        remarks: "",
        barcodeNo: String(ele?.Barcode || ""),
        isExpirable: Number(ele?.IsExpirable) || 0,
        issueMultiplier: Number(ele?.IssueMultiplier) || 0,
        packSize: String(ele?.PackSize || ""),
        barcodeOption: Number(ele?.BarcodeOption) || 0,
        barcodeGenrationOption: Number(ele?.BarcodeGenrationOption) || 0,
        issueInFIFO: Number(ele?.IssueInFIFO) || 0,
        majorUnitInDecimal: Number(ele?.MajorUnitInDecimal) || 0,
        minorUnitInDecimal: Number(ele?.MinorUnitInDecimal) || 0,
        isPost: 0,
        postDate: moment(payload.InvoiceDate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        postUserID: "",
        updateRemarks: "",
        stockPhysicalVerificationID: "",
        initialCount_old: "",
        initialCount_New: "",
        stockPhysicalVerificationRemarks: "",
        qutationid: "",
        poPendingQty: 0,
        saP_grn_po_line_no: 0,
        SAPLineNo: 0,
        S_Currency: ele.Currency,
        S_Amount: ele?.NetAmt / (DefaultCurrencyName == ele.Currency ? 1 : ele.Selling_Specific),
        C_Factor: DefaultCurrencyName == ele.Currency ? 1 : ele.Selling_Specific
      };
      storeNMStockObj.push(obj);
    });

    const storeTaxChargedListObj = [];
    rowsToSave?.map((ele) => {
      const IGSTPer = parseFloat(ele?.IGSTPer || 0);
      const CGSTPer = parseFloat(ele?.CGSTPer || 0);
      const SGSTPer = parseFloat(ele?.SGSTPer || 0);
      const Rate = parseFloat(ele?.Rate) || 0;
      let Disc = parseFloat(ele?.DiscountPer) || 0;
      const Quantity = parseFloat(ele?.PaidQty) || 0;
      if (Disc > 100) Disc = 100;

      const Tax = IGSTPer === 0 ? CGSTPer + SGSTPer : IGSTPer;
      const disc = precise_round(Rate * Disc * 0.01, 5);
      const ratedisc = precise_round(Rate - disc, 5);
      const tax = precise_round(ratedisc * Tax * 0.01, 5);
      // const taxAmount = precise_round(tax * Quantity, 5); 
      const taxName = IGSTPer > 0 ? "IGST" : "CGST/SGST";

      let obj = {
        ledgerTransactionID: 0,
        ledgerTransactionNo: "",
        stockID: 0,
        itemID: Number(ele?.itemid) || 0,
        taxName: String(taxName),
        percentage: Number(Tax) || 0,
        taxAmt: Number(tax) || 0,
        batchNumber: String(ele?.BatchNumber || ""),
      };
      storeTaxChargedListObj.push(obj);
    });

    const requestBody = {
      storeLedgerTransaction: {
        ledgerTransactionID: 0,
        ledgerTransactionNo: "",
        vendorID: Number(VendorID) || 0,
        typeOfTnx: "Purchase",
        purchaseOrderNo: String(PurchaseOrderNo || ""),
        grossAmount: Number(totals?.GrossAmt) || 0,
        discountOnTotal: Number(totals?.DiscountAmount) || 0,
        taxAmount: Number(totals?.TaxAmount) || 0,
        netAmount: Number(payload?.GRNAmount) || 0,
        invoiceAmount: Number(payload?.InvoiceAmount) || 0,
        invoiceNo: String(payload?.InvoiceNo || ""),
        invoiceDate: moment(payload.InvoiceDate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        invoiceAttachment: 0,
        chalanNo: String(payload?.ChallanNo || ""),
        chalanDate: moment(payload.ChallanDate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
        discountReason: "",
        remarks: String(payload?.Narration || ""),
        indentNo: "",
        freight: Number(payload?.Freight) || 0,
        octori: Number(payload?.Octroi) || 0,
        gatePassInWard: String(payload?.GateEntryNo || ""),
        gatePassOutWard: "",
        isReturnable: 0,
        roundOff: Number(payload?.RoundOff) || 0,
        locationID: Number(payload?.GRNLocation) || 0,
        isDirectGRN: 0,
        updateRemarks: "",
      },
      storeNMStock: storeNMStockObj,
      storeTaxChargedList: storeTaxChargedListObj,
      fileName: "",
      purchaseOrderId: String(bindorderdetail[0]?.PurchaseOrderID),
      vendorLogin: "",
      receiveDate: moment(payload.ReceiveDate).format("YYYY-MM-DD"),
      reagents: "",
    };

    await axiosInstance
      .post("GRNFormPO/SaveGrn", requestBody)
      .then(async (res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          // setbindorderdetail(Array.isArray(response) ? response : []);
          // setsectionOrderDetail(true);
          toast.success(response);
          // if (payload?.GRNLocation && payload?.OrderNo) {
          //   // await SearchApi();
          // }
          handleReset()
        } else {
          toast.error(response);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  console.log("payload", payload);


  const precise_round = (num, decimals) => {
    return Number(Math.round(num + "e" + decimals) + "e-" + decimals);
  };

  // useEffect(() => {
  //   if (Array.isArray(childDataTabel)) {
  //     const totalNetAmt = childDataTabel.reduce(
  //       (sum, item) => sum + parseFloat(item.NetAmt || 0),
  //       0
  //     );

  //     setPayload((prev) => ({
  //       ...prev,
  //       GRNAmount: totalNetAmt,
  //       InvoiceAmount: totalNetAmt,
  //     }));

  //     let TaxAmount = 0;
  //     let DiscountAmount = 0;
  //     let GrossAmt = 0;

  //     childDataTabel?.forEach((item) => {
  //       const Quantity = parseFloat(item.PaidQty || 0);
  //       const Rate = parseFloat(item.Rate || 0);
  //       const Discount = parseFloat(item.DiscountAmt || 0);
  //       const GST = parseFloat(item.TotalGSTAmt || 0);

  //       TaxAmount += precise_round(GST * Quantity, 5);
  //       DiscountAmount += precise_round(Discount * Quantity, 5);
  //       GrossAmt += precise_round(Rate * Quantity, 5);
  //     });

  //     setTotals({ TaxAmount, DiscountAmount, GrossAmt });
  //   }
  // }, [childDataTabel]);

  useEffect(() => {
    if (Array.isArray(childDataTabel)) {
      const totalNetAmt = childDataTabel.reduce(
        (sum, item) => sum + parseFloat(item.NetAmt || 0),
        0
      );

      const freight = parseFloat(payload.Freight) || 0;
      const octroi = parseFloat(payload.Octroi) || 0;
      const roundOff = parseFloat(payload.RoundOff) || 0;

      const finalAmount = totalNetAmt + freight + octroi + roundOff;

      setPayload((prev) => ({
        ...prev,
        GRNAmount: finalAmount,
        InvoiceAmount: finalAmount,
      }));

      let TaxAmount = 0;
      let DiscountAmount = 0;
      let GrossAmt = 0;

      childDataTabel?.forEach((item) => {
        const Quantity = parseFloat(item.PaidQty || 0);
        const Rate = parseFloat(item.Rate || 0);
        const Discount = parseFloat(item.DiscountAmt || 0);
        const GST = parseFloat(item.TotalGSTAmt || 0);

        TaxAmount += precise_round(GST * Quantity, 5);
        DiscountAmount += precise_round(Discount * Quantity, 5);
        GrossAmt += precise_round(Rate * Quantity, 5);
      });

      setTotals({ TaxAmount, DiscountAmount, GrossAmt });
    }
  }, [childDataTabel, payload.Freight, payload.Octroi, payload.RoundOff]);

  const [show2, setShow2] = useState(false);
  const [Identity, setIdentity] = useState([]);
  const [PatientGuid, SetPatientGuid] = useState("");
  const [UploadDoumentType, setUploadDoumentType] = useState([""]);
  const handleClose2 = () => {
    setShow2(false);
  };
  const handleReset = () => {
    setPayload(initialState);
    setsectionOrderDetail(false);
  };
  // const handleUploadCount = (
  //   name,
  //   value,
  //   secondName,
  //   medicalName,
  //   medicalValue,
  //   MedicalSName
  // ) => {
  //   setLTData({
  //     ...LTData,
  //     [name]: value,
  //     [secondName]: value === 0 ? 0 : 1,
  //     [medicalName]: medicalValue,
  //     [MedicalSName]: medicalValue === 0 ? 0 : 1,
  //   });
  // };
  const getDocumentType = (data) => {
    setUploadDoumentType(data);
  };
  const getRequiredAttachment = () => {
    axiosInstance
      .post("Global/GetGlobalData", {
        Type: "RequiredAttachment",
      })
      .then((res) => {
        let data = res.data.message;
        let RequiredAttachment = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        return setIdentity(RequiredAttachment);
      })
      .catch((err) => console.log(err));
  };
  useEffect(() => {
    BindddllocationApi();
    getRequiredAttachment();
    const patientId = guidNumber();
    SetPatientGuid(patientId);

  }, []);
  return (
    <>
      {show2 && (
        <UploadFile
          // options={Identity}
          show={show2}
          handleClose={handleClose2}
          documentId={PatientGuid}
          pageName="GRNfromPo"
          getDocumentType={getDocumentType}
        />
      )}
      <Accordion
        name={t("GRN Against Purchase Order")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          <ReactSelect
            name="GRNLocation"
            id="GRNLocation"
            removeIsClearable={true}
            dynamicOptions={GRNLocation.map((ele) => ({
              label: ele?.name,
              value: ele?.id?.split("#")[0],
            }))}
            placeholderName="GRN Location"
            value={payload?.GRNLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="OrderNo"
            id="OrderNo"
            removeIsClearable={true}
            dynamicOptions={bindorder.map((ele) => ({
              label: ele?.PurchaseOrderNo,
              value: ele?.PurchaseOrderID,
            }))}
            placeholderName="Order No"
            value={payload?.OrderNo}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            <CustomButton
              text={t("Search")}
              icon={"search"}
              className="btn btn-sm btn-success"
              onClick={SearchApi}
            />
          </div>
        </div>
      </Accordion>
      {sectionOrderDetail ? (
        <>
          <div className="card">
            <Heading title={"Order Detail"} />
            <div className="row p-2">
              {LabelInput?.map((ele) => (
                <div className="col-xl-2 col-sm-4 col-md-6 col-12">
                  <LabeledInput label={ele?.label} value={ele?.value} />
                </div>
              ))}
            </div>
            <div className="row">
              <div className="col-sm-12">
                <GRNFromPoTble
                  bindorderdetail={bindorderdetail}
                  sendData={getDataFromChild}
                />
              </div>
            </div>
          </div>
          <div className="card">
            <Heading title={"GRN Details"} />
            <div className="row p-2">
              <Input
                type="text"
                placeholder=" "
                lable="Invoice No"
                id="InvoiceNo"
                name="InvoiceNo"
                value={payload.InvoiceNo}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />

              <DatePicker
                name="InvoiceDate"
                id="InvoiceDate"
                value={payload?.InvoiceDate}
                onChange={dateSelect}
                placeholder=""
                lable={t("Invoice Date")}
                className="custom-calendar"
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable={t(DefaultCurrencyName == "KES" ? "Delivery No" : "Challan No")}
                id="ChallanNo"
                name="ChallanNo"
                value={payload.ChallanNo}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <DatePicker
                name="ChallanDate"
                id="ChallanDate"
                value={payload?.ChallanDate}
                onChange={dateSelect}
                placeholder=""
                lable={t(DefaultCurrencyName == "KES" ? "Delivery Date" : "Challan Date")}
                className="custom-calendar"
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />

              <DatePicker
                name="ReceiveDate"
                id="ReceiveDate"
                value={payload?.ReceiveDate}
                onChange={dateSelect}
                placeholder=""
                lable={t("Receive Date")}
                className="custom-calendar"
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable="Gate Entry No"
                id="GateEntryNo"
                name="GateEntryNo"
                value={payload.GateEntryNo}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable="Freight"
                id="Freight"
                name="Freight"
                value={payload.Freight}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable="Octroi"
                id="Octroi"
                name="Octroi"
                value={payload.Octroi}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable="Round Off"
                id="RoundOff"
                name="RoundOff"
                value={payload.RoundOff}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable="GRN Amount"
                id="GRNAmount"
                name="GRNAmount"
                value={payload.GRNAmount}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable="Invoice Amount"
                id="InvoiceAmount"
                name="InvoiceAmount"
                value={payload.InvoiceAmount}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <Input
                type="text"
                placeholder=" "
                lable="Narration"
                id="Narration"
                name="Narration"
                value={payload.Narration}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <ReactSelect
                name="ReagentsTemperature"
                id="ReagentsTemperature"
                removeIsClearable={true}
                dynamicOptions={reagentsTemperatureOptions}
                placeholderName="Reagents Temperature"
                value={payload?.ReagentsTemperature}
                onChange={handleSelectChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              <CustomButton
                text="Add Invoice"
                icon="add"
                // className="btn btn-sm btn-success"
                onClick={() => {
                  setShow2(true);
                }}
              >
                {t("Add Invoice Attachment")}
              </CustomButton>
            </div>
            <div className="d-flex justify-content-center align-items-center flex-wrap my-3">
              <div className="me-3">
                <RadioInput
                  inputType="checkbox"
                  label="IsBarcode"
                  id="IsBarcode"
                  name="IsBarcode"
                  checked={payload.IsBarcode}
                  onChange={handleChange}
                />
              </div>

              <div className="d-flex justify-content-center align-items-center">
                <CustomButton
                  text="Save"
                  icon="save"
                  // className="btn btn-sm btn-success "
                  style={{ marginRight: "4px" }}
                  onClick={handleSaveBtn}
                >
                  Save
                </CustomButton>
                <CustomButton
                  text="Reset"
                  icon="reset"
                  // className="btn btn-sm btn-success "
                  style={{ marginLeft: "4px" }}
                  onClick={handleReset}
                >
                  Reset
                </CustomButton>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      {InvoiceModal?.show && (
        <Modal
          visible={InvoiceModal?.show}
          setVisible={() =>
            setInvoiceModal({
              show: false,
              component: null,
              size: null,
            })
          }
          modalWidth={InvoiceModal?.size}
          Header={InvoiceModal?.header}
          footer={InvoiceModal?.footer}
        >
          {InvoiceModal?.component}
        </Modal>
      )}
    </>
  );
};

export default GRNfromPo;
