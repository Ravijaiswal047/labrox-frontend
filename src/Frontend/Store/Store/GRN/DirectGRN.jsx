import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import Accordion from "../../../components/UI/Accordion";
import { AutoComplete } from "primereact/autocomplete";
import Input from "../../../components/formComponent/Input";
import DirectGRMTableDetails from "./DirectGRMTableDetails";
import Heading from "../../../components/UI/Heading";
import RadioInput from "../../../components/formComponent/RadioInput";
import Modal from "../../../components/ModalComponent/Modal";
// import InvoiceUploadModal from "../../../components/ModalComonent/utils/InvoiceUploadModal";
import Tables from "../../../components/UI/customTable";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import DatePicker from "../../../components/formComponent/DatePicker";
import moment from "moment/moment";
import { CustomButton, SearchButton } from "../../../components/UI/CustomButton";
import { Form } from "react-bootstrap";
import UploadFile from "../../utils/UploadFileModal/UploadFile";
import { guidNumber } from "../../../utils/generateGuid";
import "../index.css"
import { useLocation, useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

function DirectGRN() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const LedgerTransactionID = location?.state?.LedgerTransactionID ?? null;
  const LedgerTransactionNo = location?.state?.LedgerTransactionNo ?? null;
  const PurchaseOrderNo = location?.state?.PurchaseOrderNo ?? null;
  console.log(location?.state, "trsnasatasd")
  // const [isNew, setNew] = useState(false);

  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const [InvoiceModal, setInvoiceModal] = useState({
    header: null,
    show: false,
    size: null,
    component: null,
    footer: null,
  });
  const initialState = {
    GRNLocation: "",
    Supplier: "",
    rateID: "2",
    InvoiceNo: "",
    InvoiceDate: new Date(),
    ChallanNo: "",
    ChallanDate: new Date(),
    GateEntryNo: "",
    SearchOption: "1",
    OldPONO: "",
    Manufacturer: "",
    Machine: "",
    PackSize: "",
    BarcodeNo: "",
    IsBarcode: "",
    ManufactureName: "",
    ManufactureID: "",
    MachineID: "",
    ItemID: "",
    ItemName: "",
    Freight: 0,
    Octroi: 0,
    RoundOff: 0,
    GRNAmount: 0,
    InvoiceAmount: 0,
    ReagentsTemperature: null,
    FilePath: ""
  };

  const [payload, setPayload] = useState(initialState);
  console.log(payload, "payload")
  const [removedStockIds, setRemovedStockIds] = useState([]);
  console.log(removedStockIds, "remove id ")
  const [tableData, settableData] = useState([]);
  console.log(tableData, "tabledata")

  const [manufacturerItemId, setManufacturerItemId] = useState(null);
  const [panelId, setpanelId] = useState(null);
  console.log(panelId, "panelId")
  const [getLocations, setGetLocations] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [manufacturer, setManufacturer] = useState([]);
  const [Machine, setMachine] = useState([]);
  const [packSize, setPackSize] = useState([]);

  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
    if (name === "ManufactureID") {
      const selectedManufacturer = manufacturer.find(
        (m) => String(m.ManufactureID) === String(value?.value)
      );
      setManufacturerItemId(selectedManufacturer?.ItemId || null);
    }
    if (name === "GRNLocation") {
      const selectedLocation = getLocations.find(
        (loc) => String(loc.LocationID) === String(value?.value)
      );

      setpanelId(selectedLocation?.panel_id || null);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
    }));
  };

  const GRMRateOption = [
    { label: "Direct Rate", value: "1" },
    { label: "Quotation Rate", value: "2" },
  ];
  const SearchOptionList = [
    { label: "By First Name", value: "0" },
    { label: "In Between", value: "1" },
    { label: "By Item Code", value: "2" },
    { label: "By Catalog No", value: "3" },
  ];
  const handleModalOpen = () => {
    setInvoiceModal({
      show: true,
      header: "Upload Document",
      size: "50vw",
      // component: <InvoiceUploadModal />,
      footer: <></>,
    });
  };
  const handleAutoCompleteSelect = (e) => {
    if (!payload?.GRNLocation) {
      toast.warn("Please Select RNLocation");
      return;
    }

    // if (payload?.DeliveryLocation?.length === 0) {
    //   toast.warn("please Select DeliveryLocation");
    //   return;
    // }
    const selected = e.value;
    setPayload((prev) => ({
      ...prev,
      ItemName: selected?.ItemNameGroup || selected,
      ItemID: selected?.ItemIDGroup || selected,
    }));
    ManufacturerAPIPost(selected?.ItemIDGroup);
  };
  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.ItemNameGroup : e.value;
    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({ ...prev, ItemName: val }));
  };
  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.ItemNameGroup}
      </div>
    </div>
  );
  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  // const getLocationApi = async () => {
  //   const requstBody = {
  //     itemid: String(""),
  //     centerid: String(""),
  //     sateID: String(""),
  //   };
  //   await axiosInstance
  //     .post("VendorQuotation/GetLocations", { ...requstBody })
  //     .then((res) => {
  //       const respons = res?.data?.message;
  //       const status = res?.data?.success;
  //       if (status) {
  //         setGetLocations(Array.isArray(respons) ? respons : []);
  //       }
  //     });
  // };
  const reagentsTemperatureOptions = [
    { label: "Expired", value: "Expired" },
    { label: "Ambient", value: "Ambient" },
    { label: "2-", value: "2-" },
    { label: "-20", value: "-20" },
    { label: "Damaged", value: "Damaged" },
  ];
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
  const searchItems = async (query) => {
    const requestBody = {
      itemName: query || "",
      locationidfrom: String(payload?.GRNLocation || ""),
      searchOption: String(payload?.SearchOption || "1"),
      itemtype: String(""),
    };
    await axiosInstance
      .post("VendorQuotation/SearchItem", {
        ...requestBody,
      })
      .then((res) => {
        const response = res?.data?.message;
        setStockSuggestions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const ManufacturerAPIPost = async (id) => {
    const requstBody = {
      locationidfrom: String(payload?.GRNLocation || ""),
      itemIDGroup: String(id),
    };
    await axiosInstance
      .post("/VendorQuotation/bindManufacturer", {
        ...requstBody,
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          setManufacturer(data);
          setPayload((prev) => ({
            ...prev,
            ManufactureName: data?.[0]?.ManufactureName,
            ManufactureID: data?.[0]?.ManufactureID,
            // ItemID: data?.[0]?.ItemId

          }));
          setManufacturerItemId(data?.[0]?.ItemId);
        }
      })
      .catch((err) => console.log("No Data Found"));
  };
  const MachineAPIPost = (id, itemID) => {
    const requstBody = {
      locationidfrom: String(payload?.GRNLocation || ""),
      itemIDGroup: String(itemID),
      manufactureID: String(id),
    };
    axiosInstance
      .post("/VendorQuotation/bindMachine", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setMachine(data);
        setPayload((prev) => ({
          ...prev,
          MachineID: data?.[0]?.MachineID,
          MachineName: data?.[0]?.MachineName,
        }));

        PackSizeAPIPost(data?.[0]?.MachineID);
      })
      .catch((err) => {
        // console.log("No Data Found"),
        setMachine([]);
        // toast.error(err?.response?.data?.message);
      });
  };

  const PackSizeAPIPost = (id) => {
    const requstBody = {
      locationidfrom: String(payload?.GRNLocation || ""),
      itemIDGroup: String(payload?.ItemID || ""),
      manufactureID: String(payload?.ManufactureID || ""),
      machineID: String(id || ""),
    };
    axiosInstance
      .post("/VendorQuotation/bindPackSize", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setPackSize(data || []);
        setPayload((prev) => ({
          ...prev,
          PackSize: data?.[0]?.PackSize,
          PackValue: data?.[0]?.PackValue,
        }));
      })
      .catch((err) => console.log("No Data Found"));
  };

  const handleAddBtn = async () => {
    if (!payload?.GRNLocation) {
      toast.error("Please Select GRNLocation");
      return;
    }

    if (!payload?.Supplier) {
      toast.error("Please Select Supplier");
      return;
    }

    if (!payload?.ItemID) {
      toast.error("Please Select Item");
      return;
    }
    const alreadyExists = tableData?.some(
      (item) => String(item?.itemId) == String(payload?.ItemID)
    );

    if (alreadyExists) {
      toast.error("This Item Is Already Added");
      return;
    }
    const requstBody = {
      // itemid: String(payload?.ItemID),
      itemid: String(manufacturerItemId),
      locationid: String(payload?.GRNLocation),
      barcodeno: String(""),
      vendorid: String(payload?.Supplier),
    };
    await axiosInstance
      .post("DirectGRN/SearchItemDetail", { ...requstBody })
      .then((res) => {
        let status = res?.data?.success;
        let data = res?.data?.message;
        if (status) {
          let rowsToAdd = [];
          if (Array.isArray(data) && data.length > 0) {
            rowsToAdd = data.map((item) => ({
              ...item,

              batchNumber: item.batchNumber || "",
              quantity: item.quantity || 0,
              freeQty: item.freeQty || 0,

              // isNew: true,
              StockID: item.stockID || 0,
              IsPost: item.IsPost || 0,

              rate: Number(item.rate || 0),
              discountPer: Number(item.discountPer || 0),
              igstPer: Number(item.igstPer || 0),
              cgstPer: Number(item.cgstPer || 0),
              sgstPer: Number(item.sgstPer || 0),

              converter: Number(item.converter || 1),
            }));
          } else {
            rowsToAdd = [{
              itemId: payload?.ItemID,
              typeName: payload?.ItemName,

              batchNumber: "",
              rate: 0,
              quantity: 0,
              freeQty: 0,
              discountPer: 0,
              igstPer: 0,
              cgstPer: 0,
              sgstPer: 0,
              converter: 1,
              isNew: true,
              isExpirable: true,
              StockID: 0,
              IsPost: 0,
              Converter: 1
            }];
          }
          settableData((prev) => {
            const newData = rowsToAdd
              .filter(
                (item) =>
                  !prev.some(
                    (existing) =>
                      String(existing?.itemId) === String(item?.itemId) &&
                      String(existing?.batchNumber) === String(item?.batchNumber)
                  )
              )
              .map(item => {
                const calc = calculateRow(item);
                return { ...item, ...calc };
              });

            if (newData.length === 0) {
              toast.error("This Item With Same Batch Is Already Added");
              return prev;
            }
            return [...prev, ...newData];
          });

          setPayload(prev => ({
            ...prev,
            ItemID: "",
            ItemName: "",
            ManufactureID: "",
            ManufactureName: "",
            MachineID: "",
            MachineName: "",
            PackSize: "",
            PackValue: "",
            // BarcodeNo: ""
          }));

          setAutoCompleteVal("");
          setManufacturer([]);
          setMachine([]);
          setPackSize([]);
        }
      })
      .catch((err) => {
        console.log(err),
          toast.error(err?.response?.data?.message);
        settableData([]);
      });
  };

  useEffect(() => {
    if (payload?.ItemID)
      MachineAPIPost(payload?.ManufactureID, payload?.ItemID);
  }, [payload?.ItemID, payload?.ManufactureID]);

  useEffect(() => {
    // getLocationApi();
    getSupplierApi();
  }, []);

  const clearForm = () => {
    setPayload(initialState);
    settableData([]);
    setAutoCompleteVal("");
    setRemovedStockIds([]);
  };
  const preciseRound = (num, dec) =>
    Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);

  const handleSave = async () => {
    const missingExpiry = tableData.some(
      (item) => item?.isExpirable && !item?.expiryDate
    );
    if (missingExpiry) {
      toast.error("Please enter Expiry Date");
      return;
    }

    const validations = [
      {
        condition: !payload?.GRNLocation,
        message: "Please Select GRNLocation",
      },
      {
        condition: !payload?.Supplier,
        message: "Please Select Supplier",
      },
      { condition: tableData?.length == 0, message: "items not Added" },
      {
        condition: !payload?.FilePath && !LedgerTransactionID,
        message: "Please Upload Invoice Document",
      },
    ];

    for (const { condition, message } of validations) {
      if (condition) {
        toast.error(message);
        return;
      }
    }


    let [TaxAmount, DiscountAmount, GrossAmt] = [0, 0, 0];

    tableData.forEach((item) => {
      const quantity = +item.quantity || 0;
      const rate = +item.rate || 0;

      const gross = rate * quantity;

      GrossAmt += preciseRound(gross, 2);
      DiscountAmount += preciseRound(Number(item.DiscountAmount) || 0, 2);
      TaxAmount += preciseRound(Number(item.TotalGSTAmount) || 0, 2);
    });
    const stockList = tableData.flatMap((item) => {

      const stockIds = (item.stockid || "").split(",");

      const paidStockId = stockIds[0] || 0;
      const freeStockId = stockIds[1] || 0;

      const baseStock = {
        StockID: Number(paidStockId) || 0,
        ItemID: Number(item.itemId) || 0,
        ItemName: item.typeName || "",

        LedgerTransactionID: String(LedgerTransactionID || "0"),
        LedgerTransactionNo: String(LedgerTransactionNo || "0"),

        BatchNumber: item.batchNumber || "",

        Rate: Number(item.rate) || 0,
        DiscountPer: Number(item.discountPer) || 0,
        DiscountAmount: Number(item.DiscountAmount) || 0,

        TaxPer: Number(item.igstPer || (Number(item.cgstPer) + Number(item.sgstPer))) || 0,
        TaxAmount: Number(item.TotalGSTAmount) || 0,

        UnitPrice: Number(item.BuyPrice) || 0,
        MRP: Number(item.rate) || 0,

        InitialCount: (Number(item.converter) || 1) * (Number(item.quantity) || 0),

        ExpiryDate: item.expiryDate
          ? moment(item.expiryDate).format("YYYY-MM-DD")
          : null,

        IsFree: 0,

        LocationID: Number(payload?.GRNLocation) || 0,
        Panel_Id: String(panelId || ""),

        ManufactureID: Number(item.manufactureID) || 0,

        MajorUnitID: Number(item.majorUnitId) || 0,
        MajorUnit: item.majorUnitName || "",

        MinorUnitID: Number(item.minorUnitId) || 0,
        MinorUnit: item.minorUnitName || "",

        Converter: Number(item.converter) || 1,

        BarcodeNo: item.barcodeNo || "",
        IsExpirable: item.isExpirable ? 1 : 0,

        IssueMultiplier: Number(item.issueMultiplier) || 0,
        PackSize: item.packSize || "",

        BarcodeOption: Number(item.barcodeOption) || 0,
        BarcodeGenrationOption: Number(item.barcodeGenrationOption) || 0,

        IssueInFIFO: item.issueInFIFO ? 1 : 0,

        MajorUnitInDecimal: Number(item.majorUnitInDecimal) || 0,
        MinorUnitInDecimal: Number(item.minorUnitInDecimal) || 0,

        IsPost: Number(item.IsPost) || 0,

        Remarks: item.Remarks || "",
        S_Currency: item.currency,
        S_Amount: item?.NetAmount / (DefaultCurrencyName == item.currency ? 1 : item.selling_Specific),
        C_Factor: DefaultCurrencyName == item.currency ? 1 : item.selling_Specific
      };
      const freeQty = +item.freeQty || 0;

      return freeQty > 0
        ? [
          baseStock,
          {
            ...baseStock,
            StockID: freeStockId,
            Rate: 0,
            DiscountPer: 0,
            DiscountAmount: 0,
            TaxPer: 0,
            TaxAmount: 0,
            UnitPrice: 0,
            MRP: 0,
            InitialCount: (+item.converter || 1) * freeQty,
            IsFree: "1",
            Remarks: "Direct GRN Free Item",
          },
        ]
        : [baseStock];

    });

    const datatax = tableData.flatMap((item) => {
      const itemId = item.itemId;
      const rate = +item.rate || 0;
      const discount = +item.discountPer || 0;
      // const discAmt = preciseRound(rate * discount * 0.01, 5);
      // const ratedisc = preciseRound(rate - discAmt, 5);
      const discAmt = preciseRound(Number(item.DiscountAmount) || 0, 5);
      const ratedisc = preciseRound(rate - discAmt, 5);
      const batch = item.batchNumber || "";

      const taxes = [];

      if (+item.igstPer > 0) {
        taxes.push({
          LedgerTransactionID: String(LedgerTransactionID) || "0",
          LedgerTransactionNo: String(LedgerTransactionNo) || "0",
          StockID: Number(item.stockid) || 0,
          ItemID: itemId,
          BatchNumber: batch,
          TaxName: "IGST",
          Percentage: +item.igstPer,
          TaxAmt: preciseRound(ratedisc * +item.igstPer * 0.01, 5),
        });
      } else {
        if (+item.cgstPer > 0) {
          taxes.push({
            LedgerTransactionID: String(LedgerTransactionID) || "0",
            LedgerTransactionNo: String(LedgerTransactionNo) || "0",
            StockID: Number(item.stockid) || 0,
            ItemID: itemId,
            BatchNumber: batch,
            TaxName: "CGST",
            Percentage: +item.cgstPer,
            TaxAmt: preciseRound(ratedisc * +item.cgstPer * 0.01, 5),
          });
        }

        if (+item.sgstPer > 0) {
          taxes.push({
            LedgerTransactionID: String(LedgerTransactionID) || "0",
            LedgerTransactionNo: String(LedgerTransactionNo) || "0",
            StockID: Number(item.stockid) || 0,
            ItemID: itemId,
            BatchNumber: batch,
            TaxName: "SGST",
            Percentage: +item.sgstPer,
            TaxAmt: preciseRound(ratedisc * +item.sgstPer * 0.01, 5),
          });
        }
      }

      return taxes;
    });

    const requestBody = {
      ledgerTransaction: {
        ledgerTransactionID: String(LedgerTransactionID) || "0",
        ledgerTransactionNo: String(LedgerTransactionNo) || "0",
        vendorID: String(payload?.Supplier || ""),
        typeOfTnx: "Purchase",
        purchaseOrderNo: String(PurchaseOrderNo || ""),
        grossAmount: GrossAmt,
        discountOnTotal: DiscountAmount,
        taxAmount: TaxAmount,
        netAmount: Number(payload?.GRNAmount),
        invoiceAmount: Number(payload?.InvoiceAmount || 0),
        invoiceNo: String(payload?.InvoiceNo),
        invoiceDate: moment(payload?.InvoiceDate, "YYYY-MM-DD HH-mm-ss").format(
          "YYYY-MM-DD"
        ),
        invoiceAttachment: 1,
        chalanNo: String(payload?.ChallanNo),
        chalanDate: moment(payload?.ChallanDate, "YYYY-MM-DD HH-mm-ss").format(
          "YYYY-MM-DD"
        ),
        discountReason: "",
        remarks: String(payload?.Narration || ""),
        indentNo: "",
        freight: Number(payload?.Freight || 0),
        octori: Number(payload?.Octroi || 0),
        gatePassInWard: String(payload?.GateEntryNo),
        gatePassOutWard: "GP-001-OUT",
        isReturnable: 0,
        roundOff: Number(payload?.RoundOff),
        locationID: Number(payload?.GRNLocation),
        isDirectGRN: 1,
        updateRemarks: "Initial entry remarks",
        Deletedstock: removedStockIds.join(",") || ""
      },
      stocks: stockList,
      taxes: datatax,
      filename: payload?.FilePath || "",
      reagents: "HCl, NaOH",
    };
    try {
      const res = await axiosInstance.post(
        "DirectGRN/savedirectgrn",
        requestBody
      );
      const status = res?.data?.success;
      const message = res?.data?.message;

      if (status) {
        clearForm();
        toast.success(message);
        LedgerTransactionID && navigate("/GRNReprint");
        setRemovedStockIds([]);
        setpanelId([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occurred");
    }
  };

  const handleCaptureUploadedFile = (name, count, isUploaded) => {
    if (count > 0) {
      toast.success(`${count} file(s) linked successfully.`);
    }
  };

  const handleOpenUploadModal = () => {
    const currentGuid = payload.FilePath ? payload.FilePath : guidNumber();
    setPayload(prev => ({ ...prev, FilePath: currentGuid }));
    setShowFileModal({
      modal: true,
      data: currentGuid,
      index: -1,
    });
  };

  const handleRemoveRow = (index, item) => {
    if (item?.stockid) {
      setRemovedStockIds(prev => [...prev, item.stockid]);
    }
    settableData((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      if (updated.length === 0) {
        setPayload(prevPayload => ({
          ...prevPayload,
          ItemID: "",
          ItemName: "",
          ManufactureID: "",
          ManufactureName: "",
          MachineID: "",
          MachineName: "",
          PackSize: "",
          PackValue: "",
          BarcodeNo: ""
        }));

        setAutoCompleteVal("");
        setManufacturer([]);
        setMachine([]);
        setPackSize([]);
        setManufacturerItemId(null);
        setpanelId(null);
      }

      return updated;
    });
  };

  const calculateRow = (row) => {
    console.log(row, "row")
    const rate = Number(row.rate || 0);
    const qty = Number(row.quantity || 0);
    let discountPer = Number(row.discountPer || 0);

    const igst = Number(row.igstPer || 0);
    const cgst = Number(row.cgstPer || 0);
    const sgst = Number(row.sgstPer || 0);

    if (discountPer > 100) discountPer = 100;

    // STEP 1
    const discountAmount = rate * discountPer / 100;

    // STEP 2
    const rateAfterDiscount = rate - discountAmount;

    // STEP 3 tax %
    const taxPer = igst > 0 ? igst : (cgst + sgst);

    // STEP 4 tax amount
    const taxAmount = rateAfterDiscount * taxPer / 100;

    // STEP 5 buy price
    const buyPrice = rateAfterDiscount + taxAmount;

    // STEP 6 net amount
    const netAmount = buyPrice * qty;

    return {
      DiscountAmount: preciseRound(discountAmount, 5),
      TotalGSTAmount: preciseRound(taxAmount, 5),
      BuyPrice: preciseRound(buyPrice, 5),
      NetAmount: preciseRound(netAmount, 5),
    };
  };

  const handleTableChange = (index, name, value) => {

    settableData(prev => {

      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [name]: value
      };

      // disable IGST or CGST+SGST
      if (name === "igstPer" && value > 0) {
        updated[index].cgstPer = 0;
        updated[index].sgstPer = 0;
      }

      if (name === "cgstPer" || name === "sgstPer") {
        if (value > 0) {
          updated[index].igstPer = 0;
        }
      }

      const calc = calculateRow(updated[index]);

      // AFTER
      updated[index] = {
        ...updated[index],
        DiscountAmount: calc.DiscountAmount,
        TotalGSTAmount: calc.TotalGSTAmount,
        BuyPrice: calc.BuyPrice,
        NetAmount: calc.NetAmount
      };

      return updated;

    });

  };

  useEffect(() => {
    const baseNetAmount = tableData.reduce((sum, item) => {
      return sum + (Number(item?.NetAmount) || 0);
    }, 0);

    const freight = Number(payload?.Freight) || 0;
    const octroi = Number(payload?.Octroi) || 0;
    const roundOff = Number(payload?.RoundOff) || 0;

    const totalAmount = preciseRound(baseNetAmount + freight + octroi + roundOff, 2);

    setPayload(prev => ({
      ...prev,
      GRNAmount: totalAmount,
      InvoiceAmount: totalAmount,
    }));
  }, [tableData, payload?.Freight, payload?.Octroi, payload?.RoundOff]);

  const BindOldGRNData = async (LedgerTransactionID, PurchaseOrderNo) => {
    try {
      const res = await axiosInstance.get("EditDirectGRN/BindOldGRNData", {
        params: {
          grnid: LedgerTransactionID,
          isdirectgrn: PurchaseOrderNo ? 0 : 1
        },
      });

      let data = res?.data?.data;

      // ensure data is always an array
      if (!Array.isArray(data)) {
        data = [data];
      }

      if (!data || data.length === 0) return;

      const firstRow = data[0];
      setpanelId(firstRow?.panel_id);
      // set form payload
      setPayload((prev) => ({
        ...prev,
        GRNLocation: firstRow?.locationid || "",
        Supplier: firstRow?.vendorid || "",
        InvoiceNo: firstRow?.InvoiceNo || "",
        InvoiceDate: new Date(firstRow?.InvoiceDate),
        GRNAmount: firstRow?.NetAmount || 0,
        InvoiceAmount: firstRow?.InvoiceAmount || 0,
        ChallanNo: firstRow?.ChalanNo,
        ChallanDate: new Date(firstRow?.ChalanDate),
        gatePassInWard: firstRow?.GatePassInWard,
        Freight: firstRow?.Freight,
        Octroi: firstRow?.Octori,
        RoundOff: firstRow?.RoundOff,
        Narration: firstRow?.UpdateRemarks,
        OldPONO: firstRow?.PODnumber,
        IsBarcode: firstRow?.IsBarcodePrinted == 0 ? false : true
      }));

      // table rows
      const rows = data.map((item) => ({
        BuyPrice: item?.UnitPrice,
        DiscountAmount: item?.DiscountAmount,
        NetAmount: item?.NetAmount,
        TotalGSTAmount: item?.TaxAmount,
        apolloItemCode: item?.apolloitemcode,
        barcodeGenrationOption: item?.BarcodeGenrationOption,
        barcodeNo: item?.barcodeno,
        barcodeOption: item?.BarcodeOption,
        cgstPer: item?.CGSTPer || "0",
        converter: item?.Converter,
        discountPer: item?.DiscountPer,
        expDateCutoff: item?.expdatecutoff,
        hsnCode: item?.HsnCode,
        igstPer: item?.IGSTPer || "0",
        isExpirable: item?.IsExpirable == 1 ? false : true,
        expiryDate: new Date(item?.ExpiryDate),
        issueInFIFO: item?.IssueInFIFO == 0 ? false : true,
        issueMultiplier: item?.IssueMultiplier,
        itemGroup: item?.itemgroup,
        itemId: item?.itemid,
        locationId: item?.locationid,
        batchNumber: item?.batchnumber,
        stockid: item?.stockid,
        // machineID: "",
        quantity: item?.PaidQty || "0",
        majorUnitId: item?.MajorUnitID,
        majorUnitInDecimal: item?.MajorUnitInDecimal,
        majorUnitName: item?.MajorUnit,
        manufactureID: item?.ManufactureID,
        minorUnitId: item?.MinorUnitID,
        minorUnitInDecimal: item?.MinorUnitInDecimal,
        minorUnitName: item?.MinorUnit,
        freeQty: item?.FreeQty || "0",
        // packSize: "1",
        // panelId: "",
        rate: item?.rate,
        sgstPer: item?.SGSTPer || "0",
        typeName: item?.itemname,
        selling_Specific: Numberr(item?.selling_Specific),
      }));

      settableData(rows);

    } catch (error) {
      console.log(error);
    }
  };

  console.log({ panelId })

  useEffect(() => {
    if (LedgerTransactionID !== null) {
      BindOldGRNData(LedgerTransactionID, PurchaseOrderNo);
    }
  }, [LedgerTransactionID]);

  useEffect(() => {
    axiosInstance
      .get("DirectGRN/GetLocationWithpanel")
      .then((res) => {
        const respons = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          const locations = Array.isArray(respons) ? respons : [];
          setGetLocations(locations);
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load locations");
      });
  }, []);

  return (
    <>
      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            setShowFileModal({ modal: false, data: "", index: -1 });
          }}
          // options={Identity}
          documentId={showFileModal?.data}
          pageName="GRNInvoice"
          handleUploadCount={handleCaptureUploadedFile}
        />
      )}

      <Accordion name={t("Direct GRN")} defaultValue={true} isBreadcrumb={true}>
        <div className="row px-2 pt-2">
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
            isDisabled={tableData?.length > 0}

            onChange={handleSelectChange}
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
            isDisabled={tableData?.length > 0}
            placeholderName="Supplier"
            value={payload?.Supplier}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="rateID"
            id="rateID"
            removeIsClearable={true}
            dynamicOptions={GRMRateOption}
            isDisabled={true}
            placeholderName="Rate Type"
            value={payload?.rateID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="SearchOption"
            id="SearchOption"
            removeIsClearable={true}
            dynamicOptions={SearchOptionList}
            placeholderName="Search Option"
            value={payload?.SearchOption}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={(e) => searchItems(e.query)} onSelect={handleAutoCompleteSelect}
              id="ItemsName"
              name="ItemsName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
            />
            <label htmlFor="ItemsName" className="lable searchtest">
              Items
            </label>
          </div>
          <Input
            type="number"
            placeholder=" "
            lable="Old PO NO"
            id="OldPONO"
            name="OldPONO"
            className="required-fields"
            value={payload.OldPONO}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
        <div className="row px-2">
          <ReactSelect
            name="ManufactureID"
            id="ManufactureID"
            removeIsClearable={true}
            dynamicOptions={manufacturer?.map((val) => ({
              label: val?.ManufactureName,
              value: val?.ManufactureID,
            }))}
            placeholderName="Manufacturer"
            value={payload?.ManufactureID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="MachineID"
            id="MachineID"
            removeIsClearable={true}
            dynamicOptions={Machine.map((ele) => ({
              label: ele?.MachineName,
              value: ele?.MachineID,
            }))}
            placeholderName="Machine"
            value={payload?.MachineID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="PackSize"
            id="PackSize"
            removeIsClearable={true}
            PackSize
            dynamicOptions={[
              { label: payload?.PackSize, value: payload?.PackSize },
            ]}
            placeholderName="PackSize"
            value={payload?.PackSize}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="number"
            placeholder=" "
            lable="BarcodeNo"
            id="BarcodeNo"
            name="BarcodeNo"
            value={payload.BarcodeNo}
            maxLength={10}
            className="required-fields"
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            {/* <button className="btn btn-sm btn-success" onClick={handleAddBtn}>
              Add
            </button> */}

            <CustomButton icon={"add"} text={"Add"} onClick={handleAddBtn} />
          </div>
        </div>
        <div className="row px-2">
          <div className="col-12">
            {/* <DirectGRMTableDetails /> */}
            <Tables>
              <thead className="cf" style={{ width: "100vw" }}>
                <tr>
                  <th style={{ width: "2%" }}>{t("New Batch")}</th>
                  <th>{t("Item Type")}</th>
                  <th>{t("ItemId")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Item Code")}</th>
                  <th>{t("Hsn Code")}</th>
                  <th>{t("Purchased Unit")}</th>
                  <th>{t("Converter")}</th>
                  <th>{t("Consume Unit")}</th>
                  <th style={{ minWidth: "10vw" }}>{t("Barcode")}</th>
                  <th>{t("Batch Number")}</th>
                  <th style={{ minWidth: "10vw" }}>{t("Expiry Date")}</th>
                  <th>{t("Trade Currency")}</th>
                  <th>{t("Currency Converter")}</th>
                  <th>{t("Trade Currency Amt")}</th>
                  <th style={{ minWidth: "5vw" }}>{t("Rate")}</th>
                  <th style={{ minWidth: "5vw" }}>{t("Receive Qty")}</th>
                  <th>{t("Extra Free Qty")}</th>
                  <th>{t("Discount %")}</th>
                  <th style={{ minWidth: "4vw" }}>{t(DefaultCurrencyName == "INR" ? "IGST %" : "Tax")}</th>

                  {DefaultCurrencyName == "INR" &&
                    <>
                      <th style={{ minWidth: "4vw" }}>{t(DefaultCurrencyName == "INR" ? "CGST %" : "Tax")}</th>
                      <th style={{ minWidth: "4vw" }}>{t(DefaultCurrencyName == "INR" ? "SGST %" : "Tax")}</th>
                    </>
                  }
                  <th style={{ minWidth: "4vw" }}>{t("Discount Amount")}</th>
                  <th style={{ minWidth: "4vw" }}>{t(DefaultCurrencyName == "INR" ? "Total GST Amount" : "Total Tax Amount")}</th>
                  <th style={{ minWidth: "4vw" }}>{t("BuyPrice")}</th>
                  <th style={{ minWidth: "4vw" }}>{t("Net Amt")}</th>
                  <th>{t("#")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((item, index) => (
                  <tr key={index}>
                    <td data-title={t("New Batch")}>{item?.NewBatch}</td>
                    <td data-title={t("Item Type")}>{item?.itemGroup}</td>
                    <td data-title={t("ItemId")}>{item?.itemId}</td>
                    <td data-title={t("Item Name")}>{item?.typeName}</td>
                    <td data-title={t("Item Code")}>{item?.apolloItemCode}</td>
                    <td data-title={t("Hsn Code")}>{item?.hsnCode}</td>
                    <td data-title={t("Purchased Unit")}>
                      {item?.minorUnitName}
                    </td>
                    <td data-title={t("Converter")}>{item?.converter}</td>
                    <td data-title={t("Consume Unit")}>{item?.majorUnitName}</td>
                    <td data-title={t("Barcode")}>
                      <Input
                        type="text"
                        value={item?.barcodeNo || payload.BarcodeNo}
                        maxLength={10}
                        onChange={(e) =>
                          handleTableChange(index, "barcodeNo", e.target.value)
                        }
                      />
                    </td>
                    <td data-title={t("Batch Number")}>
                      <Input
                        type="text"
                        value={item?.batchNumber || ""}
                        onChange={(e) =>
                          handleTableChange(index, "batchNumber", e.target.value)
                        }
                      />
                    </td>
                    <td data-title={t("Expiry Date")}>
                      <DatePicker
                        name="expiryDate"
                        value={item?.expiryDate || ""}
                        onChange={(date) =>
                          handleTableChange(index, "expiryDate", date)
                        }
                        disabled={item?.isNew && !item?.isExpirable}
                        className={`custom-calendar ${item?.isNew && item?.isExpirable ? "required-fields" : ""
                          }`}
                      />
                    </td>
                    <td data-title={t("Currency")}>{item.currency}</td>
                    <td data-title={t("Currency Converter")}>{DefaultCurrencyName == item.currency ? 1 : item.selling_Specific}</td>
                    <td data-title={t("Currency Amt")}>{(item?.NetAmount / (DefaultCurrencyName == item.currency ? 1 : item.selling_Specific)).toFixed(3)}</td>

                    <td data-title={t("Rate")}>

                      <Input
                        type="number"
                        value={(item?.rate) || "0"}
                        onChange={(e) =>
                          handleTableChange(index, "rate", e.target.value)
                        }
                      />
                    </td>
                    <td data-title={t("Receive Qty")} >

                      <div style={{ minWidth: "15%" }}>
                        <Input
                          type="number"
                          value={item?.quantity || "0"}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            handleTableChange(index, "quantity", value);
                          }}
                        />
                      </div>
                    </td>
                    <td data-title={t("Extra Free Qty")}>

                      <Input
                        type="number"
                        value={item?.freeQty || "0"}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          handleTableChange(index, "freeQty", value);
                        }}
                      />
                    </td>
                    <td data-title={t("Discount %")}>

                      <Input
                        type="number"
                        value={item?.discountPer || "0"}
                        onChange={(e) =>
                          handleTableChange(index, "discountPer", e.target.value)
                        }
                      />
                    </td>
                    <td data-title={t("IGST %")}>

                      <Input
                        type="number"
                        value={item?.igstPer || "0"}
                        onChange={(e) =>
                          handleTableChange(index, "igstPer", e.target.value)
                        }
                      />
                    </td>
                    {DefaultCurrencyName == "INR" &&
                      <>
                        <td data-title={t("CGST %")}>

                          <Input
                            type="number"
                            value={item?.cgstPer || "0"}
                            onChange={(e) =>
                              handleTableChange(index, "cgstPer", e.target.value)
                            }
                          />
                        </td>
                        <td data-title={t("SGST %")}>

                          <Input
                            type="number"
                            value={item?.sgstPer || "0"}
                            onChange={(e) =>
                              handleTableChange(index, "sgstPer", e.target.value)
                            }
                          />
                        </td>
                      </>
                    }
                    <td data-title={t("Discount Amount")}>
                      {/* {item?.DiscountAmount} */}
                      {/* <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item?.DiscountAmount || ""}
                      onChange={(e) =>
                        handleTableChange(index, "DiscountAmount", e.target.value)
                      }
                      // readOnly
                      /> */}
                      <Input
                        type="number"
                        value={item?.DiscountAmount || "0"}
                        onChange={(e) =>
                          handleTableChange(index, "DiscountAmount", e.target.value)
                        }
                      // readOnly
                      />
                    </td>
                    <td data-title={t("Total GST Amount")}>
                      {/* {item?.TotalGSTAmount} */}
                      {/* <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item?.TotalGSTAmount || ""}
                      onChange={(e) =>
                        handleTableChange(index, "TotalGSTAmount", e.target.value)
                      }
                      // readOnly
                      /> */}
                      <Input
                        type="number"
                        value={item?.TotalGSTAmount || "0"}
                        onChange={(e) =>
                          handleTableChange(index, "TotalGSTAmount", e.target.value)
                        }
                      // readOnly
                      />
                    </td>
                    <td data-title={t("BuyPrice")}>
                      {/* <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item?.BuyPrice || ""}
                      // onChange={(e) =>
                      //   handleTableChange(index, "BuyPrice", e.target.value)
                      // }
                      // readOnly
                      /> */}
                      <Input
                        type="number"
                        className="form-control form-control-sm"
                        value={item?.BuyPrice || "0"}
                        onChange={(e) =>
                          handleTableChange(index, "BuyPrice", e.target.value)
                        }
                      // readOnly
                      />
                    </td>
                    <td data-title={t("Net Amt")}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={item?.NetAmount || "0"}
                      // onChange={(e) =>
                      //   handleTableChange(index, "NetAmount", e.target.value)
                      // }
                      // readOnly
                      />
                    </td>
                    <td data-title={t("#")}>
                      <span
                        // className="fa fa-trash text-danger"
                        // style={{ cursor: "pointer", fontSize: "16px" }}
                        onClick={() => handleRemoveRow(index, item)}
                        title="Remove"
                      >❌ </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
      <div className="card mt-2">
        <Heading title={"GRN Details"} />
        <div className="row p-2">
          <Input
            type="text"
            placeholder=" "
            lable="Invoice No"
            id="InvoiceNo"
            name="InvoiceNo"
            value={payload.InvoiceNo}
            maxLength={20}
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
            maxLength={10}
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

          <Input
            type="text"
            placeholder=" "
            lable="Gate Entry No"
            id="GateEntryNo"
            name="GateEntryNo"
            value={payload.GateEntryNo}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Freight"
            id="Freight"
            name="Freight"
            maxLength={10}
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
            maxLength={50}
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
            maxLength={5}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="number"
            placeholder=" "
            lable="GRN Amount"
            id="GRNAmount"
            name="GRNAmount"
            value={payload.GRNAmount}
            maxLength={5}
            // onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}

          />
          <Input
            type="number"
            placeholder=" "
            lable="Invoice Amount"
            id="InvoiceAmount"
            name="InvoiceAmount"
            maxLength={50}
            value={payload.InvoiceAmount}
            // onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Narration"
            id="Narration"
            name="Narration"
            maxLength={50}
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
          {/* <RadioInput
            inputType="checkbox"
            label="IsBarcode"
            id="IsBarcode"
            name="IsBarcode"
            checked={payload.IsBarcode}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}

          <div className="ms-2 mt-1 ml-2">
            <Form.Check
              type="switch"
              label="Print Barcode"
              id="IsBarcode"
              name="IsBarcode"
              checked={payload.IsBarcode == "1" ? true : false}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2 d-flex" style={{ gap: "10px" }}>
            {/* <button
              className="btn btn-sm btn-success"
              onClick={() => handleModalOpen()}
            >
              Add Invoice
            </button>
            <button
              className="btn btn-sm btn-success ml-2"
              onClick={handleSave}
            >
              Save
            </button>
            <button className="btn btn-sm btn-success ml-2" onClick={clearForm}>
              Reset
            </button> */}
            <CustomButton icon={"add"} text={payload.FilePath ? t("File Linked") : t("Upload file")}
              onClick={handleOpenUploadModal} />
            <CustomButton icon={"save"} text={LedgerTransactionID ? "Update" : "Save"} onClick={handleSave} />
            <CustomButton icon={"refresh"} text={"Reset"} onClick={clearForm} />


          </div>
        </div>
      </div>
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
}

export default DirectGRN;
