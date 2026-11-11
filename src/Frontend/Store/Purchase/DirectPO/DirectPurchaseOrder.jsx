import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import { AutoComplete } from "primereact/autocomplete";
import { useTranslation } from "react-i18next";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UploadFile from "../../../utils/UploadFileModal/UploadFile";
import { guidNumber } from "../../../../utils/generateGuid";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const DirectPurchaseOrder = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const { state } = location;
  console.log(state?.No, "state?.No")
  const [EditData, setEditData] = useState(false);
  const [poDetails, setPoDetails] = useState({});
  const [supplierList, setSupplierList] = useState([]);
  const [selectedStateList, setSelectedStateList] = useState([]);
  const [stateArray, setGetStateArray] = useState([]);
  const [supplierState, setSupplierState] = useState([]);
  const [centre, setCentre] = useState([]);
  const [locationsearch, setLocationsearch] = useState([]);
  const [categoryType, setCategoryType] = useState([])
  const [manufacturer, setManufacturer] = useState([]);
  const [machineList, setMachineList] = useState([]);
  const [packSizeList, setPackSizeList] = useState([]);
  const [PoTerms, setPoTerms] = useState([]);
  const [status, setStatus] = useState(null);
  console.log(status, "status")
  const [isFileLinked, setIsFileLinked] = useState(false);
  const [showFileModal, setShowFileModal] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  console.log(status, "status");

  const [tableData, setTableData] = useState([]);
  console.log(tableData, "tableData")
  console.log(tableData)
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const initialState = {
    Category: "",
    SupplierName: "",
    SupplierState: "",
    GSTNNO: "",
    DeliveryState: "",
    DCentre: "",
    DLocation: "",
    ItemName: "",
    ItemId: "",
    POType: "",
    Manufacture: "",
    Machine: "",
    PackSize: "",
    SearchOption: "1",
    PaymentTerm: "",
    DeliveryTerm: "",
    Warranty: "",
    NFANo: "",
    TermCondition: "",
    DeliveryInstruction: "",
    FilePath: "",
    isserviceable: "0",
  };


  const [payload, setPayload] = useState(initialState);

  const handleSelectChange = (name, option) => {
    if (!option) {
      setPayload((prev) => ({
        ...prev,
        [name]: null,
      }));
      return;
    }

    if (name === "DeliveryState") {
      setPayload((prev) => ({
        ...prev,
        DeliveryState: option.value,
        DCentre: null,
        DLocation: null,
      }));

      CentreAPIPost(option.value);
    }

    else if (name === "DCentre") {
      setPayload((prev) => ({
        ...prev,
        DCentre: option.value,
        DLocation: null,
      }));

      getBindlocationsearch(option.value);
    }

    if (name === "SupplierName") {
      SupplierStateAPIPost(option.value);
      setPayload((prev) => ({
        ...prev,
        SupplierName: option.value,
      }));
    }
    else if (name === "SupplierState") {
      setPayload((prev) => ({
        ...prev,
        SupplierState: option.value,
        GSTNNO: option.GSTNNO,
        SupplierType: option.SupplierType,
        Address: option.Address,
      }));
    }
    else if (name === "Manufacture") {
      setPayload((prev) => ({
        ...prev,
        Manufacture: option.value,
        Machine: null
      }));

      bindMachineAPIPost(option.value);
    }
    else if (name === "Machine") {
      setPayload((prev) => ({
        ...prev,
        Machine: option.value,
        PackSize: null,
        PackValue: "",
      }));
      bindPackSizeAPIPost(option.value);
    }
    else {
      setPayload((prev) => ({
        ...prev,
        [name]: option.value,
      }));
    }
  };

  const handleCaptureUploadedFile = (name, count, isUploaded, guid) => {
    if (count > 0) {
      setIsFileLinked(true);
      if (guid) {
        setPayload((prev) => {
          const guids = prev.FilePath ? prev.FilePath.split(",") : [];
          if (!guids.includes(guid)) {
            guids.push(guid);
          }
          return { ...prev, FilePath: guids.join(",") };
        });
      }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const searchItems = async (query) => {

    const requestBody = {
      itemName: query || "",
      searchOption: String(payload?.SearchOption || ""),
      isserviceable: payload?.isserviceable
      // locationidfrom: String(payload?.DeliveryLocation?.[0]?.code || ""),
      // itemtype: String(""),
    };

    try {
      const res = await axiosInstance.post(
        "VendorQuotation/SearchItem",
        requestBody
      );
      const response = res?.data?.message;
      setStockSuggestions(Array.isArray(response) ? response : []);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Error Occurred");
    }
  };

  const handleAutoCompleteChange = (e) => {
    const val =
      typeof e.value === "object" ? e.value.ItemNameGroup : e.value;

    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({
      ...prev,
      ItemName: val,
    }));
  };

  const handleAutoCompleteSelect = (e) => {
    const selected = e.value;
    setAutoCompleteVal(selected?.ItemNameGroup);
    setPayload((prev) => ({
      ...prev,
      ItemName: selected?.ItemNameGroup,
      ItemId: selected?.ItemIDGroup,
      PackSize: "",
      PackValue: "",

    }));
    ManufacturerAPIPost(selected?.ItemIDGroup);
  };

  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.ItemNameGroup}
      </div>
    </div>
  );

  const handleTableChange = (index, field, value) => {
    setTableData((prev) => {
      const updated = [...prev];
      const row = updated[index];

      // validate only when status is 0 or 1
      if (status === 0 || status === 1) {
        const newQty = parseFloat(value) || 0;

        const isFreeField =
          field === "freeQty" ||
          field === "checkedfreeQty" ||
          field === "approvedfreeQty";

        const limit = isFreeField
          ? parseFloat(row.originalFreeQty) || 0
          : parseFloat(row.originalQty) || 0;

        if (newQty > limit) {
          toast.error(
            isFreeField
              ? "Cannot increase free quantity"
              : "Cannot increase quantity"
          );

          return prev;
        }
      }

      updated[index] = {
        ...row,
        [field]: value,
      };

      const qty =
        parseFloat(
          status === 0
            ? updated[index].checkedQty
            : status === 1
              ? updated[index].approvedQty
              : updated[index].quantity
        ) || 0;

      const rate = parseFloat(updated[index].Rate) || 0;
      const discount = parseFloat(updated[index].DiscountPer) || 0;
      const igst = parseFloat(row.IGSTPer) || 0;
      const cgst = parseFloat(row.CGSTPer) || 0;
      const sgst = parseFloat(row.SGSTPer) || 0;

      const baseAmount = rate * qty;
      const discountAmount = baseAmount * (discount / 100);
      const afterDiscount = baseAmount - discountAmount;

      const gstPercent = igst > 0 ? igst : cgst + sgst;
      const gstAmount = afterDiscount * (gstPercent / 100);

      updated[index].NetAmount = (afterDiscount + gstAmount).toFixed(2);

      return updated;
    });
  };

  const getCentreAndState = (LocationID) => {
    axiosInstance
      .post(`/DirectPO/bindPODLocation?Locationid=${LocationID}`)
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message[0];
          setPayload(payload => ({
            ...payload,
            DCentre: response?.centreID,
            DLocation: response?.locationID,
            DeliveryState: response?.stateID,
          }))
          CentreAPIPost(response.stateID);
          getBindlocationsearch(response?.centreID);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const getTerms = () => {
    axiosInstance
      .post(`/DirectPO/bindPOTermCondtion?purchaseOrderId=${state?.id}`)
      .then((res) => {
        if (res?.data?.message?.length > 0) {
          const response = res?.data?.message[0];
          setPayload(payload => ({
            ...payload,
            DeliveryTerm: response?.deliveryTermId,
            PaymentTerm: response?.PaymentTerm,
          }))
          CentreAPIPost(response.stateID);
        }
        else {
          toast?.error("Data not Found")
        }
      })

      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const fetch = () => {
    setEditData(true);
    axiosInstance
      .post(state?.url1)
      .then((res) => {
        const responseData = res.data.message[0];
        const data = res.data.message;
        console.log("responseData", responseData);
        setStatus(responseData?.Status);
        setPoDetails({
          ...responseData,
          LastWorkDay: new Date(responseData.LastWorkDay)
        });
        setPayload((prev) => ({
          ...prev,
          SupplierName: responseData?.VendorID,
          Category: responseData?.categorytypeID,
          SupplierState: responseData?.VendorStateId,
          GSTNNO: responseData?.VednorStateGstnno,
          Address: responseData?.VendorAddress,
          DeliveryState: responseData?.VendorStateeId || "",
          DCentre: responseData?.DeliveryLocationID || "",
          DLocation: responseData?.DeliveryLocationID || "",
          ItemName: responseData?.ItemNameGroup,
          POType: responseData?.ActionType || "",
          Manufacture: responseData?.ManufactureID || "",
          Machine: responseData?.MachineID || "",
          PackSize: responseData?.PackSize || "",
          PaymentTerm: responseData?.Paymentterms || "",
          DeliveryInstruction: responseData?.HeaderInstruction || "",
          DeliveryTerm: (responseData?.DeliveryTermID) || "",
          Warranty: responseData?.Warranty || "",
          NFANo: responseData?.NFANo || "",
          TermCondition: responseData?.TermandCondition || "",
          ItemId: responseData?.ItemIDGroup,
          POTermsCondition: responseData?.Paymentterms || "",

        }))
        const bindData = data?.map((item) => ({
          ...item,
          CategoryTypeName: item?.categorytypename,
          ItemCategory: item?.ItemCategory,
          Itemid: item?.Itemid,
          ItemName: item?.ItemName,
          hsncode: item?.hsncode,
          ManufactureName: item?.ManufactureName,
          catalogno: item?.catalogno,
          MachineName: item?.MachineName,
          PackSize: item?.PackSize,
          Rate: item?.Rate,
          DiscountPer: item?.DiscountPer,
          IGSTPer: item?.IGSTPer,
          CGSTPer: item?.CGSTPer,
          SGSTPer: item?.SGSTPer,
          quantity: item?.OrderedQty,
          originalQty: item?.OrderedQty,
          freeQty: item?.FreeQty,
          NetAmount: item?.NetAmount,
          originalFreeQty: item?.FreeQty,
        }))
        setTableData(bindData)
        SupplierStateAPIPost(responseData.VendorID);
        getCentreAndState(responseData?.DeliveryLocationID);
      })
      .catch((err) => {
        setEditData(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured"
        );
      });
  };

  useEffect(() => {
    if (state) {
      fetch();
    }
  }, [state]);

  useEffect(() => {
    if (payload?.ItemId && payload.Manufacture != "") bindMachineAPIPost(payload?.Manufacture);
  }, [payload?.ItemId, payload.Manufacture]);

  const handleAdd = async () => {
    if (!payload?.Category) {
      toast.error("Please Select Category");
      return;
    }
    if (!payload?.SupplierName) {
      toast.error("Please Select SupplierName");
      return;
    }
    if (!payload?.DCentre) {
      toast.error("Please Select Centre");
      return;
    }
    if (!payload?.DLocation) {
      toast.error("Please Select Location");
      return;
    }
    if (!payload?.ItemId) {
      toast.error("Please Select Item");
      return;
    }
    if (!payload?.Manufacture) {
      toast.error("Please Select Manufacture");
      return;
    }
    if (!payload?.Machine) {
      toast.error("Please Select Machine");
      return;
    }
    if (!payload?.PackSize) {
      toast.error("Please Select Pack Size");
      return;
    }
    const packValueString = payload?.PackSize || payload?.PackValue || "";
    const packValueElements = String(packValueString).split("#");
    const selectedItemId = String(packValueElements[2] || "");
    if (!selectedItemId) {
      toast.error("Invalid Pack Size");
      return;
    }
    const alreadyExists = tableData?.some(
      (item) => String(item?.Itemid) === selectedItemId
    );

    if (alreadyExists) {
      toast.error("This Item Is Already Added");
      return;
    }
    const requstBody = {
      ItemID: selectedItemId,
      SupplierID: String(payload?.SupplierName),
      DeliveryLocationID: String(payload?.DLocation),
      MachineID: String(payload?.Machine || ""),
    };
    try {
      const res = await axiosInstance.post("DirectPO/GetItemDetailToAdd", requstBody);
      const status = res?.data?.success;
      const data = res?.data?.message;
      if (status) {
        setTableData((prev) => [...prev, ...data.map(item => {
          const rate = parseFloat(item.Rate) || 0;
          const qty = parseFloat(item.Qty) || 1;
          const discount = parseFloat(item.DiscountPer) || 0;
          const igst = parseFloat(item.gstntax) || 0;
          const cgst = parseFloat(item.CGSTPer) || 0;
          const sgst = parseFloat(item.SGSTPer) || 0;

          const baseAmount = rate * qty;
          const afterDiscount = baseAmount - (baseAmount * (discount / 100));
          const gstPercent = igst > 0 ? igst : cgst + sgst;
          const netAmount = afterDiscount + (afterDiscount * (gstPercent / 100));

          return {
            ...item,
            IGSTPer: igst,
            quantity: qty,
            freeQty: 0,
            NetAmount: netAmount.toFixed(2),
            isRateEditable: rate === 0,
          };
        })]);
        setAutoCompleteVal("");
        setManufacturer([]);
        setMachineList([]);
        setPackSizeList([]);
      } else {
        toast.error(typeof data === "string" ? data : "No Data Found");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "No Data Found");
    }
  };


  const handleRemove = (index) => {
    setTableData((prev) => {
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
        setMachineList([]);
        setPackSizeList([]);
      }

      return updated;
    });
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

  const SupplierStateAPIPost = async (id) => {
    const requstBody = {
      vendorid: String(id),
    };

    await axiosInstance
      .post("VendorQuotation/bindvendorgstndata", requstBody)
      .then((res) => {
        const data = res?.data?.message;
        if (Array.isArray(data)) {
          setSupplierState(data);

          const supplierStateArray = data.map((ele) => {
            const parts = ele.stateid?.split("#") || [];
            return {
              value: parts[0],
              label: ele.state,
              GSTNNO: parts[1] || "",
              SupplierType: parts[2] || "",
              Address: parts[3] || "",
            };
          });

          setSelectedStateList(supplierStateArray);
          if (data?.length > 0) {
            setPayload((prev) => ({
              ...prev,
              GSTNNO: supplierStateArray[0]?.GSTNNO,
              Address: supplierStateArray[0]?.Address,
              SupplierType: supplierStateArray[0]?.SupplierType,
              SupplierName: id,
              SupplierState: data[0]?.stateid?.split("#")?.[0],
            }));
          }
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong"
        );
      });
  };

  const getState = () => {
    axiosInstance
      .get("VendorMaster/GetState")
      .then((res) => {
        const response = res?.data?.message;
        setGetStateArray(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const CentreAPIPost = (stateId) => {
    const requestBody = {
      StateID: String(stateId || ""),
    };

    axiosInstance
      .post("/VendorQuotation/bindCentre", requestBody)
      .then((res) => {
        const status = res?.data?.success;
        const data = res?.data?.message;

        if (status && Array.isArray(data)) {
          const formattedData = data.map((item) => ({
            label: item?.Centre,
            value: item?.CentreID,
          }));

          setCentre(formattedData);
        } else {
          setCentre([]);

          setPayload((prev) => ({
            ...prev,
            DCentre: null,
            DLocation: null,
          }));
        }
      })
      .catch(() => {
        setCentre([]);
        setLocationsearch([]);
      });
  };

  const getBindlocationsearch = (centerid) => {
    axiosInstance
      .post("VendorQuotation/Bindlocationsearch", {
        centreid: String(centerid),
        cityId: "",
        TypeId: "",
        ZoneId: "",
        StateID: ""
      })
      .then((res) => {
        const status = res?.data?.success;
        const response = res?.data?.message;

        if (status && Array.isArray(response)) {
          const formattedData = response.map((item) => ({
            label: item?.name,
            value: item?.id,
          }));
          setLocationsearch(formattedData);
        } else {
          setLocationsearch([]);

          setPayload((prev) => ({
            ...prev,
            DLocation: null,
          }));
        }
      })
      .catch(() => {
        setLocationsearch([]);
      });
  };


  const getCategory = () => {
    axiosInstance
      .get("DirectPO/PageLoad")
      .then((res) => {
        const response = res?.data?.message;
        if (res?.data?.success == true) {
          const formattedData = response?.map((item) => ({
            label: item?.name,
            value: item?.id,
          }));
          setCategoryType(formattedData);
        } else {
          toast.error(res?.data?.message)
        }

      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };


  const ManufacturerAPIPost = async (itemId) => {
    const requestBody = {
      itemIDGroup: String(itemId),
    };

    try {
      const res = await axiosInstance.post(
        "VendorQuotation/bindManufacturer",
        requestBody
      );

      if (res?.data?.success) {
        const data = res?.data?.message;
        setManufacturer(Array.isArray(data) ? data : []);
      } else {
        setManufacturer([]);
      }
    } catch (err) {
      console.log(err);
      setManufacturer([]);
    }
  };

  const bindMachineAPIPost = async (manufactureId) => {
    const requestBody = {
      locationidfrom: String(payload?.DLocation),
      ManufactureID: String(manufactureId),
      ItemIDGroup: String(payload?.ItemId),
    };

    try {
      const res = await axiosInstance.post(
        "VendorQuotation/bindMachine",
        requestBody
      );

      if (res?.data?.success) {
        const data = res?.data?.message;
        setMachineList(Array.isArray(data) ? data : []);
        setPackSizeList([]);
      } else {
        setMachineList([]);
        setPackSizeList([]);
      }
    } catch (err) {
      console.log(err);
      setMachineList([]);
    }
  };

  const bindPackSizeAPIPost = async (machineId) => {
    const requestBody = {
      MachineID: String(machineId),
      locationidfrom: String(payload?.DLocation),
      ManufactureID: String(payload?.Manufacture),
      ItemIDGroup: String(payload?.ItemId),
    };

    try {
      const res = await axiosInstance.post(
        "VendorQuotation/bindPackSize",
        requestBody
      );

      if (res?.data?.success) {
        const data = res?.data?.message;
        setPackSizeList(Array.isArray(data) ? data : []);
        setPayload((prev) => ({
          ...prev,
          PackSize: data?.[0]?.PackValue,
          PackValue: data?.[0]?.PackValue,
        }));
      } else {
        setPackSizeList([]);
      }
    } catch (err) {
      console.log(err);
      setPackSizeList([]);
    }
  };

  const paymentTermOptions = [
    {
      value: "After 30 Days from the date of delivery at place",
      label: "After 30 Days from the date of delivery at place",
    },
    {
      value: "50% Advance 50% Post delivery",
      label: "50% Advance 50% Post delivery",
    },
    {
      value: "100% Advance Payment",
      label: "100% Advance Payment",
    },
    {
      value: "Other",
      label: "Other",
    },
  ];

  const deliveryTermOptions = [
    {
      value: "3",
      label: "Delivered at Door Step",
    },
    {
      value: "4",
      label: "Ex-Works",
    },
    {
      value: "2",
      label: "Other",
    },
  ];

  const handleSave = async () => {
    if (!payload?.FilePath) {
      toast.error("Please Select Upload File");
      return;
    }
    const purchaseOrder = [];
    tableData.forEach((row) => {
      const qty = parseFloat(row.quantity) || 0;
      const rate = parseFloat(row.Rate) || 0;
      const discountPer = parseFloat(row.DiscountPer) || 0;
      const igst = parseFloat(row.IGSTPer) || 0;
      const cgst = parseFloat(row.CGSTPer) || 0;
      const sgst = parseFloat(row.SGSTPer) || 0;

      const baseAmount = rate * qty;
      const discountAmount = baseAmount * (discountPer / 100);
      const afterDiscount = baseAmount - discountAmount;
      const gstPercent = igst > 0 ? igst : cgst + sgst;
      const taxAmount = afterDiscount * (gstPercent / 100);
      const netAmount = afterDiscount + taxAmount;
      const discountedRate = rate - (rate * discountPer / 100);
      const calUnitPrice =
        discountedRate +
        (discountedRate * gstPercent) / 100;


      purchaseOrder.push({
        purchaseOrderID: 0,
        purchaseOrderNo: "",
        itemID: row.Itemid,
        itemName: row.ItemName,
        manufactureID: row.ManufactureID,
        manufactureName: row.ManufactureName,
        catalogNo: row.catalogno || "",
        machineID: Number(row.MachineID),
        machineName: row.MachineName,
        majorUnitId: row.MajorUnitId,
        majorUnitName: row.MajorUnitName,
        packSize: String(row.PackSize),
        orderedQty: qty,
        checkedQty: 0,
        approvedQty: 0,
        grnQty: 0,
        rate: rate,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        discountPercentage: discountPer,
        netAmount: parseFloat(netAmount.toFixed(2)),
        unitPrice: calUnitPrice,
        isFree: 0,
        purchaseOrderDetailID: 0,
        sapLineNo: 0,
        taxPerCGST: cgst,
        taxPerIGST: igst,
        taxPerSGST: sgst,
        PurchaseOrderIDHash: payload.FilePath ? payload.FilePath.split(",") : [],
        S_Currency: row.Currency,
        S_Amount: row?.NetAmount / (DefaultCurrencyName == row.Currency ? 1 : row.Selling_Specific),
        C_Factor: DefaultCurrencyName == row.Currency ? 1 : row.Selling_Specific

      });

      if (parseFloat(row.freeQty) > 0) {
        purchaseOrder.push({
          purchaseOrderID: 0,
          purchaseOrderNo: "",
          itemID: row.Itemid,
          itemName: row.ItemName,
          manufactureID: row.ManufactureID,
          manufactureName: row.ManufactureName,
          catalogNo: row.catalogno || "",
          machineID: Number(row.MachineID),
          machineName: row.MachineName,
          majorUnitId: row.MajorUnitId,
          majorUnitName: row.MajorUnitName,
          packSize: String(row.PackSize),
          orderedQty: parseFloat(row.freeQty),
          checkedQty: 0,
          approvedQty: 0,
          grnQty: 0,
          rate: 0,
          taxAmount: 0,
          discountAmount: 0,
          discountPercentage: 0,
          netAmount: 0,
          unitPrice: 0,
          isFree: 1,
          purchaseOrderDetailID: 0,
          sapLineNo: 0,
          taxPerCGST: 0,
          taxPerIGST: 0,
          taxPerSGST: 0,
          PurchaseOrderIDHash: payload.FilePath ? payload.FilePath.split(",") : [],
          S_Currency: row.Currency,
          C_Factor: 0,
          S_Amount: 0
        });
      }
    });

    const purchaseOrderTax = [];
    tableData.forEach((row) => {
      const qty = parseFloat(row.quantity) || 0;
      const rate = parseFloat(row.Rate) || 0;
      const discountPer = parseFloat(row.DiscountPer) || 0;
      const igst = parseFloat(row.IGSTPer) || 0;
      const cgst = parseFloat(row.CGSTPer) || 0;
      const sgst = parseFloat(row.SGSTPer) || 0;

      const baseAmount = rate * qty;
      const afterDiscount = baseAmount - baseAmount * (discountPer / 100);

      if (igst > 0) {
        purchaseOrderTax.push({
          purchaseOrderID: 0,
          purchaseOrderNo: "",
          itemID: row.Itemid,
          taxName: "IGST",
          percentage: igst,
          taxAmt: parseFloat((afterDiscount * (igst / 100)).toFixed(2)),
          createdBy: "",
          createdByID: 0,
          purchaseOrderTaxID: 0,
          companyID: "",
        });
      } else {
        if (cgst > 0) {
          purchaseOrderTax.push({
            purchaseOrderID: 0,
            purchaseOrderNo: "",
            itemID: row.Itemid,
            taxName: "CGST",
            percentage: cgst,
            taxAmt: parseFloat((afterDiscount * (cgst / 100)).toFixed(2)),
            createdBy: "",
            createdByID: 0,
            purchaseOrderTaxID: 0,
            companyID: "",
          });
        }
        if (sgst > 0) {
          purchaseOrderTax.push({
            purchaseOrderID: 0,
            purchaseOrderNo: "",
            itemID: row.Itemid,
            taxName: "SGST",
            percentage: sgst,
            taxAmt: parseFloat((afterDiscount * (sgst / 100)).toFixed(2)),
            createdBy: "",
            createdByID: 0,
            purchaseOrderTaxID: 0,
            companyID: "",
          });
        }
      }
    });
    const selectedDeliveryTerm = deliveryTermOptions.find(
      (item) => item.value === payload?.DeliveryTerm
    );

    const requestBody = {
      po: {
        subject: "",
        vendorID: Number(payload.SupplierName),
        vendorName: supplierList.find(s => s.supplierID == payload.SupplierName)?.supplierName || "",
        locationID: Number(payload.DLocation),
        indentNo: "",
        vendorStateId: Number(payload.SupplierState),
        vendorGSTIN: payload.GSTNNO || "",
        vendorAddress: payload.Address || "",
        vendorLogin: 0,
        poType: payload.POType || "",
        warranty: payload.Warranty || "",
        nfaNo: payload.NFANo || "",
        termandcondition: payload.TermCondition || "",
        purchaseOrderID: 0,
        purchaseOrderNo: "",
        actionType: "",
        deliveryTerm: selectedDeliveryTerm?.label || "",
        termConditionID: Number(payload.PaymentTerm) || 0,
        deliveryTermID: Number(payload.DeliveryTerm) || 0,
        headerInstruction: payload.DeliveryInstruction || "",
        // POTermsCondition: payload.PaymentTerm,
        PaymentTermsCondition: payload.PaymentTerm,
        purchaseOrderIDHash: payload.FilePath ? payload.FilePath.split(",") : [],
        Isserviceable: payload?.isserviceable
      },
      purchaseOrder: purchaseOrder,
      purchaseOrderTax: purchaseOrderTax,
      actionType: "",
      purchaseOrderIDHash: payload.FilePath ? payload.FilePath.split(",") : [],
    };

    try {
      const res = await axiosInstance.post("DirectPO/savePurchaseOrder", requestBody);
      debugger
      const status = res?.data?.success;
      if (status) {
        toast.success(res?.data?.message);
        setPayload(initialState);
        setTableData([]);
        setIsFileLinked(false);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occurred");
    }
  };

  const handleMakeAction = async (actionType) => {
    const poMaster = [];

    tableData.forEach((row, index) => {
      const qty =
        parseFloat(
          status == 0
            ? row.checkedQty ?? row.quantity
            : status == 1
              ? row.approvedQty ?? row.quantity
              : row.quantity
        ) || 0;
      const freeQty = parseFloat(row.freeQty) || 0;
      const rate = parseFloat(row.Rate) || 0;
      const discountPer = parseFloat(row.DiscountPer) || 0;
      const igst = parseFloat(row.IGSTPer) || 0;
      const cgst = parseFloat(row.CGSTPer) || 0;
      const sgst = parseFloat(row.SGSTPer) || 0;
      const checkedQty = (row.checkedQty)
      const approvedQty = (row.approvedQty)
      const baseAmount = rate * qty;
      const discountAmount = baseAmount * (discountPer / 100);
      const afterDiscount = baseAmount - discountAmount;
      const gstPercent = igst > 0 ? igst : cgst + sgst;
      const taxAmount = afterDiscount * (gstPercent / 100);
      const netAmount = afterDiscount + taxAmount;
      const discountedRate = rate - (rate * discountPer / 100);
      const calUnitPrice =
        discountedRate +
        (discountedRate * gstPercent) / 100;

      // const calUnitPrice = (rate - discountAmount) + taxAmount;
      // console.log(calUnitPrice, "calUnitPrice")

      poMaster.push({
        purchaseOrderNo: state?.No,
        purchaseOrderID: String(state?.id),
        subject: String(state?.subject || ""),

        vendorID: Number(payload.SupplierName),
        vendorName:
          supplierList.find((s) => s.supplierID == payload.SupplierName)
            ?.supplierName || "",

        locationID: Number(payload.DLocation),
        indentNo: "",
        vendorStateId: Number(payload.SupplierState),
        vendorGSTIN: payload.GSTNNO || "",
        vendorAddress: payload.Address || "",
        vendorLogin: 0,

        poType: payload.POType || "",
        isDirectPO: 1,
        actionType: actionType,

        itemID: row.Itemid.toString(),
        itemName: row.ItemName,
        manufactureID: row.ManufactureID,
        manufactureName: row.ManufactureName,
        catalogNo: row.catalogno,
        machineID: Number(row.MachineID),
        machineName: row.MachineName,
        majorUnitId: row.MajorUnitId,
        majorUnitName: row.MajorUnitName,
        packSize: String(row.PackSize),

        orderedQty: String(qty),
        checkedQty: String(row.checkedQty ?? qty),
        approvedQty: String(row.approvedQty ?? qty),
        grnQty: 0,

        rate: rate,
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        discountPercentage: discountPer,
        netAmount: parseFloat(netAmount.toFixed(2)),
        // netAmount: parseFloat(row.NetAmount.toFixed(2)),
        unitPrice: calUnitPrice,

        isFree: 0,
        tableSNo: index + 1,

        taxPerCGST: cgst,
        taxPerIGST: igst,
        taxPerSGST: sgst,

        warranty: payload.Warranty || "",
        nfaNo: payload.NFANo || "",
        termandcondition: payload.TermCondition || "",
        S_Currency: row.Currency,
        S_Amount: row?.NetAmount / (DefaultCurrencyName == row.Currency ? 1 : row.Selling_Specific),
        C_Factor: DefaultCurrencyName == row.Currency ? 1 : row.Selling_Specific
      });

      if (freeQty > 0) {
        poMaster.push({
          purchaseOrderNo: state?.No,
          purchaseOrderID: String(state?.id),
          subject: "",

          vendorID: Number(payload.SupplierName),
          vendorName:
            supplierList.find((s) => s.supplierID == payload.SupplierName)
              ?.supplierName || "",

          locationID: Number(payload.DLocation),
          indentNo: "",
          vendorStateId: Number(payload.SupplierState),
          vendorGSTIN: payload.GSTNNO || "",
          vendorAddress: payload.Address || "",
          vendorLogin: 0,

          poType: payload.POType || "",
          isDirectPO: 1,
          actionType: actionType,

          itemID: row.Itemid.toString(),
          itemName: row.ItemName,
          manufactureID: row.ManufactureID,
          manufactureName: row.ManufactureName,
          catalogNo: row.catalogno,
          machineID: Number(row.MachineID),
          machineName: row.MachineName,
          majorUnitId: row.MajorUnitId,
          majorUnitName: row.MajorUnitName,
          packSize: String(row.PackSize),

          orderedQty: String(freeQty),
          checkedQty: String(row.checkedfreeQty ?? freeQty),
          approvedQty: String(row.approvedfreeQty ?? freeQty),
          grnQty: 0,

          rate: 0,
          taxAmount: 0,
          discountAmount: 0,
          discountPercentage: 0,
          netAmount: 0,
          unitPrice: 0,

          isFree: 1,
          tableSNo: index + 1,

          taxPerCGST: 0,
          taxPerIGST: 0,
          taxPerSGST: 0,

          warranty: payload.Warranty || "",
          nfaNo: payload.NFANo || "",
          termandcondition: payload.TermCondition || "",
          S_Currency: row.Currency,
          C_Factor: 0,
          S_Amount: 0
        });
      }
    });

    const requestBody = {
      poMaster,
      buttonActionType: actionType,
      headerInstruction: payload.DeliveryInstruction || "",
    };
    debugger
    try {
      const res = await axiosInstance.post(
        "DirectPO/MakeAction",
        requestBody
      );

      if (res?.data?.success) {
        toast.success(res?.data?.message);
        fetch();
        actionType === "Approval" && navigate("/POSearch");

      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occurred");
      console.log(err, "Error Occurred");
    }
  };

  useEffect(() => {
    getState();
    getSupplier();
    getCategory()
  }, []);

  return (
    <>
      {showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            setShowFileModal({ modal: false, data: "", index: -1 });
          }}
          documentId={showFileModal?.data}
          pageName="POInvoice"
          handleUploadCount={handleCaptureUploadedFile}
        />
      )}
      <div className="card">
        <Heading name={"Direct Purchase Order"} isBreadcrumb={true} />
        <div className="row p-2">
          <ReactSelect
            name="Category"
            id="Category"
            removeIsClearable={true}
            dynamicOptions={categoryType}
            placeholderName="Category"
            value={payload?.Category}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            isDisabled={state ? true : false}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              placeholderName="Supplier Name"
              name="SupplierName"
              id="SupplierName"
              removeIsClearable={true}
              className="required-fields"
              dynamicOptions={supplierList?.map((ele) => ({
                label: ele?.supplierName,
                value: ele?.supplierID,
              }))}
              value={payload?.SupplierName}
              onChange={handleSelectChange}
              isDisabled={state ? true : false}
            />
          </div>

          <ReactSelect
            placeholderName="Supplier State"
            name="SupplierState"
            id="SupplierState"
            removeIsClearable={true}
            dynamicOptions={selectedStateList?.map((ele) => ({
              label: ele?.label,
              value: ele?.value,
              GSTNNO: ele?.GSTNNO,
              SupplierType: ele?.SupplierType,
              Address: ele?.Address,
            }))}
            value={payload?.SupplierState}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            isDisabled={state ? true : false}
          />

          <Input
            type="text"
            placeholder=" "
            lable={(DefaultCurrencyName == "INR" ? "GSTN No" : "Tax No")}
            id="GSTNNO"
            name="GSTNNO"
            value={payload.GSTNNO}
            onChange={handleChange}
            maxLength={15}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            disabled={state ? true : false}
          />

          <Input
            type="text"
            placeholder=" "
            lable="Address"
            id="Address"
            name="Address"
            value={payload?.Address}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            disabled={state ? true : false}
          />

          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              placeholderName="Delivery State"
              name="DeliveryState"
              id="DeliveryState"
              removeIsClearable={true}
              dynamicOptions={stateArray?.map((ele) => ({
                label: ele?.name,
                value: ele?.id,
              }))}
              value={payload?.DeliveryState}
              onChange={handleSelectChange}
              isDisabled={state ? true : false}
            />
          </div>

          <ReactSelect
            name="DCentre"
            id="DCentre"
            removeIsClearable={true}
            dynamicOptions={centre}
            placeholderName="D. Centre"
            value={payload?.DCentre}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            isDisabled={state ? true : false}
          />
          <ReactSelect
            name="DLocation"
            id="DLocation"
            removeIsClearable={true}
            dynamicOptions={locationsearch}
            placeholderName="D. Location"
            value={payload?.DLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            isDisabled={state ? true : false}
          />
          <ReactSelect
            name="isserviceable"
            id="isserviceable"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Stock", value: "0" },
              { label: "Service", value: "1" },
            ]}
            placeholderName="Type"
            value={payload?.isserviceable}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            isDisabled={tableData?.length > 0 ? true : false}
          />
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Direct Purchase Order"} isBreadcrumb={true} />
        <div className="row p-2">
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={(e) => searchItems(e.query)}
              field="ItemNameGroup"
              onSelect={handleAutoCompleteSelect}
              id="empName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
            />
            <label htmlFor="searchtest" className="lable searchtest">
              Items
            </label>
          </div>
          <ReactSelect
            name="POType"
            id="POType"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Normal", value: "Normal" },
              { label: "Immidiate", value: "Immidiate" },
            ]}
            placeholderName="PO Type"
            value={payload?.POType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="Manufacture"
            id="Manufacture"
            removeIsClearable={true}
            dynamicOptions={manufacturer?.map((item) => ({
              label: item?.ManufactureName,
              value: item?.ManufactureID,
            }))}
            placeholderName="Manufacture"
            value={payload?.Manufacture}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            placeholderName="Machine"
            name="Machine"
            id="Machine"
            removeIsClearable={true}
            dynamicOptions={machineList?.map((item) => ({
              label: item?.MachineName,
              value: item?.MachineID,
            }))}
            value={payload?.Machine}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="PackSize"
            id="PackSize"
            removeIsClearable={true}
            dynamicOptions={packSizeList?.map((item) => ({
              label: item?.PackSize,
              value: item?.PackValue,
            }))}
            placeholderName="Pack Size"
            value={payload?.PackSize}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <CustomButton text={t("Add Item")} icon={"add"} onClick={handleAdd} />
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Added Item"} isBreadcrumb={true} secondTitle={
          <>
            <strong>
              Total ={" "}
              <span style={{ color: "green" }}>
                {tableData
                  .reduce((sum, row) => sum + (parseFloat(row.NetAmount) || 0), 0)
                  .toFixed(2)}
              </span>
            </strong>
          </>
        } />
        <div className="row">
          <div className="col-sm-12">
            <Tables style={{ maxHeight: "400px", overflowY: "auto" }}>
              <thead style={{ position: "sticky", top: 0, }}>
                <tr>
                  <th>{t("S.No.")}</th>
                  <th>{t("Category")}</th>
                  <th>{t("Item Category")}</th>
                  <th>{t("ItemID")}</th>
                  <th>{t("Item Name")}</th>
                  {DefaultCurrencyName == "INR" &&
                    <th>{t("HSN Code")}</th>}
                  <th>{t("Manufacturer")}</th>
                  <th>{t("Catalog No.")}</th>
                  <th>{t("Machine")}</th>
                  <th>{t("CurrentStock")}</th>
                  <th>{t("Pack Size")}</th>
                  <th>{t("Trade Currency")}</th>
                  <th>{t("Currency Converter")}</th>
                  <th>{t("Trade Currency Amt")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("Discount %")}</th>
                  <th>{t(DefaultCurrencyName == "INR" ? "IGST %" : "Tax")}</th>
                  {DefaultCurrencyName == "INR" &&
                    <>
                      <th>{t(DefaultCurrencyName == "INR" ? "CGST %" : "Tax")}</th>
                      <th>{t(DefaultCurrencyName == "INR" ? "SGST %" : "Tax")}</th>
                    </>}
                  <th>{t("Qty.")}</th>
                  <th>{t("Free Qty.")}</th>
                  <th>{t("Net Amt.")}</th>
                  <th>{t("#")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No.")}>{index + 1}</td>
                    <td data-title={t("Category")}>{row.CategoryTypeName}</td>
                    <td data-title={t("Item Category")}>{row.ItemCategory}</td>
                    <td data-title={t("ItemID")}>{row.Itemid}</td>
                    <td data-title={t("Item Name")}>{row.ItemName}</td>
                    {DefaultCurrencyName == "INR" &&
                      <td data-title={t("HSN Code")}>{row.hsncode}</td>}
                    <td data-title={t("Manufacturer")}>{row.ManufactureName}</td>
                    <td data-title={t("Catalog No.")}>{row.catalogno}</td>
                    <td data-title={t("Machine")}>{row.MachineName}</td>
                    <td data-title={t("CurrentStock")}>{row.CurrentStock}</td>
                    <td data-title={t("Pack Size")}>{row.PackSize}</td>
                    <td data-title={t("Currency")}>{row.Currency}</td>
                    <td data-title={t("Currency Converter")}>{DefaultCurrencyName == row.Currency ? 1 : row.Selling_Specific}</td>
                    <td data-title={t("Currency Amt")}>{(row?.NetAmount / (DefaultCurrencyName == row.Currency ? 1 : row.Selling_Specific)).toFixed(3)}</td>
                    <td data-title={t("Rate")}>
                      {row.isRateEditable ? (
                        <div style={{ width: "80px" }}>
                          <Input
                            type="number"
                            min="0"
                            id={`Rate_${index}`}
                            name="Rate"
                            value={row?.Rate ?? ""}
                            removeFormGroupClass={true}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (parseFloat(value) < 0) {
                                toast.error("Rate cannot be negative");
                                return;
                              }
                              handleTableChange(index, "Rate", value);
                            }}
                          />
                        </div>
                      ) : (
                        row.Rate
                      )}
                    </td>
                    <td data-title={t("Discount %")}>{row.DiscountPer}</td>
                    <td data-title={t("IGST %")}>{row.IGSTPer}</td>
                    {DefaultCurrencyName == "INR" &&
                      <>
                        <td data-title={t("CGST %")}>{row.CGSTPer}</td>
                        <td data-title={t("SGST %")}>{row.SGSTPer}</td>
                      </>
                    }
                    <td data-title={t("Qty.")}>
                      <div style={{ width: "50px" }}>
                        <Input

                          type="text"
                          value={
                            status === 0
                              ? row?.checkedQty ?? row?.quantity ?? ""
                              : status === 1
                                ? row?.approvedQty ?? row?.quantity ?? ""
                                : row?.quantity ?? ""
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (status === 0) {
                              handleTableChange(index, "checkedQty", value);
                            } else if (status === 1) {
                              handleTableChange(index, "approvedQty", value);
                            } else {
                              handleTableChange(index, "quantity", value);
                            }
                          }}
                        />
                      </div>
                    </td>
                    <td data-title={t("Free Qty.")}>
                      <Input
                        type="text"
                        // value={row?.freeQty || ""}
                        value={
                          status === 0
                            ? row?.checkedfreeQty ?? row?.freeQty ?? ""
                            : status === 1
                              ? row?.approvedfreeQty ?? row?.freeQty ?? ""
                              : row?.freeQty ?? ""
                        }

                        onChange={(e) => {
                          // const value = e.target.value.replace(/\D/g, "");
                          // handleTableChange(index, "freeQty", value);
                          const value = e.target.value.replace(/\D/g, "");
                          if (status === 0) {
                            handleTableChange(index, "checkedfreeQty", value);
                          } else if (status === 1) {
                            handleTableChange(index, "approvedfreeQty", value);
                          } else {
                            handleTableChange(index, "freeQty", value);
                          }
                        }}
                      />
                    </td>
                    <td data-title={t("Net Amt.")}>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: "80px" }}
                        value={row?.NetAmount || ""}
                      />
                    </td>
                    <td data-title={t("#")}>
                      <span title="Remove" onClick={() => handleRemove(index)}>❌</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Terms & Conditions"} isBreadcrumb={true} />
        <div className="row p-2">
          <ReactSelect
            name="PaymentTerm"
            id="PaymentTerm"
            removeIsClearable={true}
            dynamicOptions={paymentTermOptions}
            placeholderName="Payment Term"
            value={payload?.PaymentTerm}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="DeliveryTerm"
            id="DeliveryTerm"
            removeIsClearable={true}
            dynamicOptions={deliveryTermOptions}
            placeholderName="Delivery Term"
            value={payload?.DeliveryTerm}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            lable="Warranty"
            id="Warranty"
            name="Warranty"
            value={payload.Warranty}
            onChange={handleChange}
            maxLength={50}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
          <Input
            type="number"
            lable="NFA No"
            id="NFANo"
            name="NFANo"
            value={payload.NFANo}
            maxLength={50}
            onChange={handleChange}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
          <TextAreaInput
            name={"TermCondition"}
            id={"TermCondition"}
            lable={"Term & Condition"}
            maxLength={200}
            value={payload?.TermCondition}
            rows={1}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <TextAreaInput
            name={"DeliveryInstruction"}
            id={"DeliveryInstruction"}
            lable={"Delivery Instruction Remarks"}
            value={payload?.DeliveryInstruction}
            rows={1}
            maxLength={200}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
        </div>
        <div className="p-2" style={{ gap: "10px" }}>
          {tableData.length > 0 && ![0, 1, 2].includes(status) && (
            <CustomButton text={t("Save")} icon="save" onClick={handleSave} />
          )}
          {![0, 1, 2].includes(status) && (
            <CustomButton
              className="ml-2 mr-2"
              text={t("Reset")}
              icon={"save"}
              onClick={() => { setPayload(initialState); setTableData([]); setIsFileLinked(false); }}
            />
          )}
          {status == 0 && <CustomButton text="Check" onClick={() => handleMakeAction("Check")} className="ml-2" />}
          {status == 1 && <CustomButton text="Approval" onClick={() => handleMakeAction("Approval")} className="ml-2" />}
          {[0, 1, 2].includes(status) && (
            <Link to="/POSearch">
              <span className="ml-4">Back to list</span>
            </Link>
          )}
          {![0, 1, 2].includes(status) && (
            <CustomButton
              icon={"add"}
              text={t("Upload file")}
              onClick={handleOpenUploadModal}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default DirectPurchaseOrder;