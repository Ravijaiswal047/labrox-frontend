import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import { ClockSVG, PlusIcon } from "../../../../components/SvgIcons";
import { AutoComplete } from "primereact/autocomplete";
import Tables from "../../../../components/UI/customTable";
import Heading from "../../../../components/UI/Heading";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { VendorQuotationAllItemSchema, VendorQuotationValidationSchema } from "../../../../utils/Schema";
import moment from "moment";
import Modal from "../../../../components/ModalComponent/Modal";
import StoreLocationSIModel from "../storeLocationMaster/StoreLocationSIModel";
import ChangeTaxPercentageModel from "./ChangeTaxPercentageModel";
import AddedItemSearchRowShow from "./ShowDetailitem";
import ShowDetailitem from "./ShowDetailitem";
import ShowDetailsModel from "./ShowDetailsModel";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import "../../../SalesFunnel/index.css";
const VendorQuotation = () => {
  const { t } = useTranslation();

  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const initialState = {
    SupplierName: "",
    SupplierState: "",
    GSTNNO: "",
    Address: "",
    SupplierType: "",
    DeliveryState: "",
    CentreType: [],
    CentreId: "",
    DeliveryLocation: [],
    FromDate: new Date(),
    ToDate: new Date(),
    RefNo: "",
    Machine: "",
    Items: "",
    Manufacturer: "",
    ManufactureID: "",
    ManufactureName: "",
    MachineID: "",
    PackSize: "",
    Terms: "",
    QtRefNo: "",
    Supplier: { label: "", value: "" },
    SearchOption: "1",
    ItemName: "",
    ItemID: "",
    PackSize: "",
    PackValue: "",
    Location: "",
    FromDateTabel: new Date(),
    ToDateTabel: new Date(),
    NoofRecord: "10",
    isserviceable:"0",
  };
  const [payload, setPayload] = useState(initialState);
  const [supplier, setSupplier] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [supplierState, setSupplierState] = useState([]);
  const [stateArray, setGetStateArray] = useState([]);
  const [centertype, setCentertype] = useState([]);
  const [centre, setCentre] = useState([]);
  const [locationsearch, setLocationsearch] = useState([]);
  const [machineall, setMachineall] = useState([]);
  const [manufacturer, setManufacturer] = useState([]);
  const [packSize, setPackSize] = useState([]);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [Machine, setMachine] = useState([]);
  const [itemsearchDataTabel, setItemsearchDataTabel] = useState([]);
  const [searchDataTabel, setSearchDataTabel] = useState([]);
  const [locationsearchDataTabel, setLocationsearchDataTabel] = useState([]);
  const [errors, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [itemDetailTabel, setiTemDetailTabel] = useState([]);
  // console.log("itemDetailTabel", itemDetailTabel);
  const [ChangeGstntax, setChangeGstntax] = useState("");

  const handleSelectChange = (name, option) => {
    console.log("Selected:", name, option);

    // When selection is cleared
    if (!option) {
      setPayload((prev) => ({
        ...prev,
        [name]: null,
      }));
      return;
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
    else if (name === "DeliveryState") {
      setPayload((prev) => {
        const updatedPayload = {
          ...prev,
          DeliveryState: option?.value,
          CentreType: [],
          CentreId: [],
          DeliveryLocation: [],
        };
        CentreAPIPost(option?.value, []);
        getBindlocationsearch(option?.value, [], []);

        return updatedPayload;
      });
    }
    else if (name === "ManufactureID") {
      setPayload((prev) => ({
        ...prev,
        [name]: option?.value,
        MachineID: "",
        PackSize: ""
      }))
    }
    else if (name === "isserviceable") {
      const naMachine = machineall?.find(
        (ele) => String(ele?.name).trim().toUpperCase() === "NA"
      );
      setPayload((prev) => ({
        ...prev,
        isserviceable: option.value,
        Machine: Number(option.value) === 1 ? naMachine?.id ?? "" : "",
      }));
    }

    else {
      setPayload((prev) => ({
        ...prev,
        [name]: option.value,
      }));
    }
  };

  const handleSelectChanges = (name, value) => {
    setPayload((prev) => ({
      ...prev,
      SupplierState: value?.value,
      GSTNNO: value?.GSTNNO,
      SupplierType: value?.SupplierType,
      Address: value?.Address,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const precise_round = (num, decimals) => {
    return Number(Math.round(num + "e" + decimals) + "e-" + decimals);
  };

  const handleChangeItemDetailTabel = (index, name, value) => {
    setiTemDetailTabel((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const updatedRow = { ...row, [name]: value };

        const Quantity = parseFloat(updatedRow.Quantity || 0);
        const Rate = parseFloat(updatedRow.Rate || 0);
        let Disc = parseFloat(updatedRow.DiscountPercent || 0);
        if (Disc > 100) Disc = 100;

        const IGSTPer = parseFloat(updatedRow.IGSTPercent || 0);
        const CGSTPer = parseFloat(updatedRow.gstntax || 0) / 2;
        const SGSTPer = parseFloat(updatedRow.gstntax || 0) / 2;

        const Tax = IGSTPer === 0 ? CGSTPer + SGSTPer : IGSTPer;

        const disc = precise_round(Rate * Disc * 0.01, 5);
        const rateDisc = precise_round(Rate - disc, 5);
        const tax = precise_round(rateDisc * Tax * 0.01, 5);
        const finalRate = precise_round(rateDisc + tax, 5);
        const netAmount = precise_round(finalRate * Quantity, 5);

        return {
          ...updatedRow,
          DiscountPercent: Disc,
          DiscountAmount: disc,
          TotalGSTAmount: tax,
          BuyPrice: finalRate,
          NetAmount: netAmount,
        };
      })
    );
  };

  const dateSelect = (date, name) => {
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };
  const colorCodingData = [
    { color: "#FFC0CB", id: "7", labelKey: "Created" },
    { color: "#E2680A", id: "15", labelKey: "Checked" },
    { color: "#90EE90", id: "8", labelKey: "Approved" },
  ];

  const getSupplier = () => {
    axiosInstance
      .get("VendorQuotation/bindsupplier")
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
  const [selectedStateList, setSelectedStateList] = useState([]);
  const SupplierStateAPIPost = async (id) => {
    const requstBody = {
      vendorid: String(id),
    };

    await axiosInstance
      .post("/VendorQuotation/bindvendorgstndata", requstBody)
      .then((res) => {
        const data = res?.data?.message;
        if (Array.isArray(data)) {
          setSupplierState(data);

          // Build array of SupplierState objects
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
  const getBindcentertype = () => {
    axiosInstance
      .get("VendorQuotation/bindcentertype")
      .then((res) => {
        const response = res?.data?.message;
        setCentertype(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const CentreAPIPost = (DeliveryState, CentreType) => {
    const CentreTypeCodes = CentreType?.map(item => item.code).join(",");
    const requstBody = {
      employeeid: "",
      itemid: "",
      centreid: "",
      zoneId: String(""),
      cityId: String(""),
      stateID: String(DeliveryState || ""),
      typeId: String(CentreTypeCodes || ""),
    };
    axiosInstance
      .post("/VendorQuotation/bindCentre", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setCentre(data);
      })
      .catch((err) => {
        setCentre([]);
        console.error("No Data Found")
      });
  };

  const getBindlocationsearch = (DeliveryState, CentreType, CentreId) => {
    const CentreTypeCodes = CentreType?.map(item => item.code).join(",");
    const CentreIdCodes = Array.isArray(CentreId) && CentreId?.map(item => item.code).join(",");
    const requstBody = {
      zoneId: String(""),
      cityId: String(""),
      stateID: String(DeliveryState || ""),
      typeId: String(CentreTypeCodes || ""),
      centreid: String(CentreIdCodes || "")
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
        console.log(err?.response?.data?.message || "Error Occurred");
      });
  };

  const getBindmachineall = () => {
    axiosInstance
      .get("VendorQuotation/Bindmachineall")
      .then((res) => {
        const response = res?.data?.message;
        setMachineall(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const ManufacturerAPIPost = (id) => {
    const DeliveryLocation = payload?.DeliveryLocation?.map(item => item.code).join(",");
    const requstBody = {
      locationidfrom: String(DeliveryLocation),
      itemIDGroup: String(id),
    };
    axiosInstance
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
          }));
        }
      })
      .catch((err) => console.log("No Data Found"));
  };
  useEffect(() => {
    if (payload?.ItemID && payload.ManufactureID != "") MachineAPIPost(payload.ManufactureID, payload?.ItemID);
  }, [payload?.ItemID, payload.ManufactureID]);
  const PackSizeAPIPost = (id) => {
    const requstBody = {
      locationidfrom: String(payload?.DeliveryLocation?.[0]?.code || ""),
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
  const MachineAPIPost = (id, itemID) => {
    const DeliveryLocation = payload?.DeliveryLocation?.map(item => item.code).join(",");
    const requstBody = {
      locationidfrom: String(DeliveryLocation),
      itemIDGroup: String(itemID || ""),
      manufactureID: String(id || ""),
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
      .catch((err) => console.log("No Data Found"));
  };
  const [TermConditionsTabel, setTermConditionsAddTabel] = useState([]);
  const TermConditionsAdd = () => {
    if (!payload?.Terms) {
      return toast.warn("Please input Terms");
    }
    setTermConditionsAddTabel((prev) => [
      ...prev,
      {
        Terms: String(payload?.Terms) || "",
      },
    ]);
    const handleResetTermConditionsTabelAdd = () => {
      setPayload((prev) => ({
        ...prev,
        Terms: "",
      }));
    };
    handleResetTermConditionsTabelAdd();
  };
  const handleRemoveTermConditionsTabelRow = (indexToRemove) => {
    setTermConditionsAddTabel((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };
  const handleRemoveItemTabelRow = (indexToRemove) => {
    setiTemDetailTabel((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };
  const allData = (val) => {
    console.log(val?.ItemIDGroup);
  };
  const resetState = (shouldResetAll = false) => {
    setPayload((prev) => ({
      ...initialState,

      ...(shouldResetAll && {
        SupplierName: prev.SupplierName,
        SupplierState: prev.SupplierState,
        GSTNNO: prev.GSTNNO,
        Address: prev.Address,
        SupplierType: prev.SupplierType,
      }),
    }));

    setiTemDetailTabel([]);
    setTermConditionsAddTabel([]);
  };
  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.ItemNameGroup : e.value;
    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({ ...prev, ItemName: val, ManufactureID: "", MachineID: "", PackSize: "" }));
    allData(e?.value);
  };
  const handleAutoCompleteSelect = (e) => {
    if (!payload?.SupplierName) {
      toast.warn("please Select Supplier");
      return;
    }

    if (payload?.DeliveryLocation?.length === 0) {
      toast.warn("please Select DeliveryLocation");
      return;
    }
    const selected = e.value;
    setPayload((prev) => ({
      ...prev,
      ItemName: selected?.ItemNameGroup || selected,
      ItemID: selected?.ItemIDGroup || selected,
    }));
    ManufacturerAPIPost(selected?.ItemIDGroup);
  };

  const searchItems = (query) => {
    const requestBody = {
      itemName: query || "",
      locationidfrom: String(payload?.DeliveryLocation?.[0]?.code || ""),
      searchOption: String(payload?.SearchOption || ""),
      itemtype: String(""),
      isserviceable: payload?.isserviceable
    };
    axiosInstance
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

  const handleSelectMultiChange = (name, select) => {
    setPayload((prev) => {
      let updatedPayload = { ...prev, [name]: select };

      if (name === "CentreType") {
        updatedPayload.CentreId = [];
        updatedPayload.DeliveryLocation = [];

        CentreAPIPost(updatedPayload.DeliveryState, select);
        getBindlocationsearch(updatedPayload.DeliveryState, select, []);
      }

      else if (name === "CentreId") {
        updatedPayload.DeliveryLocation = [];

        getBindlocationsearch(
          updatedPayload.DeliveryState,
          updatedPayload.CentreType,
          select
        );
      }

      return updatedPayload;
    });
  };
  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.ItemNameGroup}
      </div>
    </div>
  );
  const [AddItemDetailDisebel, setAddItemDetailDisebel] = useState(false);

  const AddItemdetailtoaddall = () => {
    const generatedError = VendorQuotationAllItemSchema(payload);
    const requstBody = {
      machine: String(payload?.Machine),
      locationidfrom: String(""),
      itemtype: payload?.SupplierType,
    };

    if (generatedError === "") {
      setLoading(true);
      axiosInstance
        .post("/VendorQuotation/getitemdetailtoaddall", {
          ...requstBody,
        })
        .then((res) => {
          let data = res?.data?.message;
          setiTemDetailTabel(data);
        })
        .catch((err) => console.log("No Data Found"));
    } else {
      toast.error(generatedError)
      setErros(generatedError);
      setLoading(false);
    }
  }; 

  const [quotationData, setquotationData] = useState([]);
  const AddItemDetail = () => {
    const generatedError = VendorQuotationAllItemSchema(payload);
    const termsArray = TermConditionsTabel.map((item) => item.Terms);
    const DeliveryLocationStr = payload?.DeliveryLocation.map(
      (loc) => loc.code
    ).join(",");
    const itemTypeIdStr = itemDetailTabel
      .map((item) => item.itemtypeid)
      .join(",");
    const packValueString = packSize?.[0]?.PackValue || "";
    const packValueElements = packValueString.split("#");
    const selectedManufacturer = manufacturer?.find(
      (m) => String(m?.ManufactureID) === String(payload?.ManufactureID)
    );
    const requstBody = {
      quno: String(""),
      fromdate: String(payload?.FromDate || ""),
      todate: String(payload?.ToDate || ""),
      status: String(payload?.SearchOption || ""),
      noofRecord: String(payload?.RefNo || ""),
      vendorid: String(payload?.SupplierName || ""),
      itemid: String(
        selectedManufacturer?.ItemId || payload?.ItemID || packValueElements[2] || ""
      ),
      location: (payload?.DeliveryLocation || []).map((loc) => loc.code),
    };
    debugger
    if (generatedError === "" && payload?.ItemName !== "") {
      axiosInstance
        .post("/VendorQuotation/getitemdetailtoadd", {
          ...requstBody,
        })
        .then((res) => {
          if (res?.data?.success) {
            let data = res?.data?.message || [];
            setiTemDetailTabel((prevData) => {
              const existingIds = new Set(
                prevData.map((row) => String(row?.Itemid))
              );
              const newRows = data.filter(
                (row) => !existingIds.has(String(row?.Itemid))
              );
              if (newRows.length === 0) {
                toast.warn("Item already added");
                return prevData;
              }
              return [...prevData, ...newRows];
            });
            setAddItemDetailDisebel(true);
          }
        })
        .catch((err) => {
          console.log("No Data Found")
        });
    } else if (generatedError !== "") {
      setErros(generatedError);
      setLoading(false);
    } else {
      toast.error("Item is required")
    }
  };

  const printReport = (Quotationno) => {
    axiosReport
      .post(`StoreReports/GetVendorQuotation?Quotationno=${Quotationno}`, {}, { responseType: "blob", })
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
  const searchDataTabelAPI = async (id) => {
    const requstBody = {
      quno: String(payload?.QtRefNo || ""),
      fromdate: moment(payload.FromDateTabel, "YYYY-MM-DD HH-mm-ss").format(
        "YYYY-MM-DD"
      ),
      todate: moment(payload.ToDateTabel, "YYYY-MM-DD HH-mm-ss").format(
        "YYYY-MM-DD"
      ),
      status: String(payload?.Status || ""),
      noofRecord: String(payload?.NoofRecord),
      vendorid: String(payload?.Supplier?.value || ""),
      itemid: String(payload?.ItemID || ""),
      location: String(payload?.Location || ""),
    };
    await axiosInstance
      .post("/VendorQuotation/SearchData", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setSearchDataTabel(data);
      })
      .catch((err) => {
        setSearchDataTabel([]);
        toast?.error("No Data Found")
      });
  };
  const itemsearchDataTabelAPI = () => {
    axiosInstance
      .get("VendorQuotation/Binditemsearch")
      .then((res) => {
        const response = res?.data?.message;
        setItemsearchDataTabel(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const locationsearchDataTabelAPI = () => {
    const requstBody = {
      zoneId: "",
      cityId: "",
      stateID: "",
      typeId: "",
      centreid: "",
    };
    axiosInstance
      .post("VendorQuotation/Bindlocationsearch", {
        ...requstBody,
      })
      .then((res) => {
        const response = res?.data?.message;
        setLocationsearchDataTabel(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        console.log(err?.response?.data?.message || "Error Occurred");
      });
  };

  const termsArray = TermConditionsTabel.map((item) => item.Terms);

  const saveDataAPI = async (id) => {
    const isSameState = String(payload?.SupplierState) === String(payload?.DeliveryState);
    // const generatedError = VendorQuotationValidationSchema(payload);
    const termsArray = TermConditionsTabel.map((item) => item.Terms);
    const DeliveryLocationStr = payload?.DeliveryLocation.map(
      (loc) => loc.code
    ).join(",");
    const requestArray = [];
    const requestBody = {
      quotationData: requestArray,
      quotationDataTerms: termsArray,
    };
    itemDetailTabel.map((ele) => {
      const obj = {
        qutationno: 0,
        quotationrefno: String(payload?.RefNo),
        vendorId: Number(payload?.SupplierName),
        vendorName: supplierList?.find((ele) => ele?.id === payload?.SupplierName)?.name,
        vendorAddress: String(payload?.Address || ""),
        vendorStateId: Number(payload?.SupplierState || ""),
        vednorStateName: selectedStateList?.find((ele) => ele?.value === payload?.SupplierState)?.label,
        vednorStateGstnno: String(payload?.GSTNNO || ""),
        EntryDateFrom: moment(payload?.FromDate, "YYYY-MM-DD HH:mm:ss").format(
          "YYYY-MM-DD"
        ),
        EntryDateTo: moment(payload?.ToDate, "YYYY-MM-DD HH:mm:ss").format(
          "YYYY-MM-DD"
        ),
        deliveryStateID: payload?.DeliveryState,
        deliveryStateName: stateArray?.find((ele) => ele?.id === payload?.DeliveryState)?.name,
        deliveryCentreID: 0,
        deliveryCentreName: "",
        deliveryLocationID: String(DeliveryLocationStr),
        deliveryLocationName: String(""),
        itemCategoryID: Number(ele?.itemtypeid || 0),
        itemCategoryName: String(ele?.ItemCategory),
        itemID: Number(ele?.Itemid || 0),
        itemName: String(ele?.ItemName || ""),
        hsnCode: String(ele?.hsncode),
        manufactureID: Number(ele?.ManufactureID || 0),
        manufactureName: String(ele?.ManufactureName || ""),
        machineID: String(ele?.MachineID || ""),
        machineName: String(ele?.MachineName || ""),
        rate: Number(ele?.Rate),
        qty: 1,//
        discountPer: Number(ele?.DiscountPercent),
        // igstPer: Number(ele?.gstntax),
        // sgstPer: Number(ele?.gstntax / 2),
        // cgstPer: Number(ele?.gstntax / 2),
        igstPer:
          DefaultCurrencyName === "KES"
            ? Number(ele?.gstntax)
            : isSameState
              ? 0
              : Number(ele?.gstntax),
        cgstPer: Number(
          DefaultCurrencyName === "INR" && isSameState
            ? ele?.gstntax / 2
            : 0
        ),
        sgstPer: Number(
          DefaultCurrencyName === "INR" && isSameState
            ? ele?.gstntax / 2
            : 0
        ),
        conversionFactor: Number(ele?.PackSize), //
        purchasedUnit: String(ele?.MinorUnitName),
        consumptionUnit: String(ele?.MajorUnitName),
        buyPrice: Number(ele?.BuyPrice || 0),
        freeQty: Number(0), //
        discountAmt: Number(ele?.DiscountAmount || 0),
        gstAmount: Number(ele.gstntax || 0),
        finalPrice: Number(ele.BuyPrice || 0),
        isserviceable: Number(payload?.isserviceable || "0"),
        isActive: true,
        // EntryDateTo:"",
        // EntryDateFrom:"",
      };
      requestArray?.push(obj);
    });

    // if (generatedError === "") {
    setLoading(true);
    await axiosInstance
      .post("/VendorQuotation/SaveVendorquotation", {
        ...requestBody,
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          toast.success(res?.data?.message);
          // searchDataTabelAPI(res?.data?.quotationNo);
          resetState(true);
        }
      })
      .catch((err) => console.log("No Data Found"));
    // } else {
    //   setErros(generatedError);
    //   setLoading(false);
    // }
  };

  useEffect(() => {
    getState();
    // getBindlocationsearch();
    getBindcentertype();
    getBindmachineall();
    getSupplier();
    // CentreAPIPost();
    locationsearchDataTabelAPI();
    itemsearchDataTabelAPI();
  }, []);
  const [modalData, setModalData] = useState({});
  const [handleModelData, setHandleModelData] = useState({});
  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    extrabutton
  ) => {
    setHandleModelData({
      label: label,
      width: width,
      type: type,
      isOpen: isOpen,
      Component: Component,
      handleInsertAPI: handleInsertAPI,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  };
  useEffect(() => {
    setHandleModelData((val) => ({ ...val, modalData: modalData }));
  }, [modalData]);

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };
  const handleChangeModel = (data) => {
    setModalData(data);
  };
  const [ChangeTax, setChangeTax] = useState(false);

  const OnChangeTax = (index, newGstntax) => {
    setiTemDetailTabel((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, gstntax: newGstntax } : row
      )
    );
    setHandleModelData({ isOpen: false });
  };

  const [buttonStates, setButtonStates] = useState({});

  const handleCheckButton = (row, status) => {
    const requestBody = {
      itemId: String(row?.Qutationno),
      status: status,
      userId: "",
    };

    axiosInstance
      .post("VendorQuotation/SetStatus", requestBody)
      .then((res) => {
        const success = res?.data?.success;
        const message = res?.data?.message;

        if (success) {
          setButtonStates((prev) => ({
            ...prev,
            [row.Qutationno]: {
              check: false,
              approve: true,
            },
          }));
          toast.success(message);
          searchDataTabelAPI();
        } else {
          toast.error(message ? message : "Something went wrong");
        }
      })
      .catch(() => toast.error("No Data Found"));
  };

  const handleApproveButton = async (row) => {
    const requestBody = {
      itemId: String(row?.Qutationno),
      status: 2,
      userId: "",
    };

    await axiosInstance
      .post("VendorQuotation/SetStatus", requestBody)
      .then((res) => {
        const status = res?.data?.success;
        const message = res?.data?.message;

        if (status) {
          setButtonStates((prev) => ({
            ...prev,
            [row.Qutationno]: {
              approve: false,
              check: false,
            },
          }));
          toast.success(message);
        }
      })
      .catch(() => toast.error("No Data Found"));
  };

  useEffect(() => {
    const initialStates = {};
    searchDataTabel?.forEach((row) => {
      initialStates[row.Qutationno] = {
        check: true,
        approve: false,
      };
    });
    setButtonStates(initialStates);
  }, [searchDataTabel]);

  return (
    <>
      {handleModelData?.isOpen && (
        <Modal
          visible={handleModelData?.isOpen}
          setVisible={setIsOpen}
          modalWidth={handleModelData?.width}
          Header={t(handleModelData?.label)}
          buttonType={"submit"}
          buttons={handleModelData?.extrabutton}
          modalData={handleModelData?.modalData}
          setModalData={setModalData}
        >
          {handleModelData?.Component}
        </Modal>
      )}
      <Accordion
        name={t("Supplier And Location Detail")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
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
              respclass={""}
              isDisabled={AddItemDetailDisebel}
              className={"required-fields"}
            />
            </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              placeholderName="Supplier Name"
              name="SupplierName"
              id="SupplierName"
              removeIsClearable={true}
              className="required-fields"
              dynamicOptions={supplierList?.map((ele) => ({
                label: ele?.name,
                value: ele?.id,
              }))}
              value={payload?.SupplierName}
              onChange={handleSelectChange}
              respclass={""}
              isDisabled={AddItemDetailDisebel}
            />
            {payload?.SupplierName === "" && (
              <span className="error-message">{errors?.SupplierName}</span>
            )}
          </div>
          <ReactSelect
            placeholderName="Supplier State"
            name="SupplierState"
            id="SupplierState"
            removeIsClearable={true}
            className={"required-fields"}
            dynamicOptions={selectedStateList?.map((ele) => ({
              label: ele?.label,
              value: ele?.value,
              GSTNNO: ele?.GSTNNO,
              SupplierType: ele?.SupplierType,
              Address: ele?.Address,
            }))}
            isDisabled={AddItemDetailDisebel}
            value={payload?.SupplierState}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable={(DefaultCurrencyName == "INR" ? "GSTN No" : "Tax No")}
            id="GSTNNo"
            name="GSTNNo"
            value={payload?.GSTNNO}
            onChange={handleChange}
            maxLength={50}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            disabled={AddItemDetailDisebel}
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
            disabled={AddItemDetailDisebel}
          />

          <ReactSelect
            placeholderName="Supplier Type"
            name="SupplierType"
            id="SupplierType"
            dynamicOptions={[
              { label: payload?.SupplierType, value: payload?.SupplierType },
            ]}
            removeIsClearable={true}
            value={payload?.SupplierType}
            onChange={handleSelectChange}
            isDisabled={true}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
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
              className="required-fields"
            />
            {payload?.DeliveryState === "" && (
              <span className="error-message">{errors?.DeliveryState}</span>
            )}
          </div>
          <MultiSelctItems
            placeholderName="Center Type"
            name="CentreType"
            values={payload}
            setValues={setPayload}
            dynamicOptions={centertype}
            labelKey="name"
            valueKey="id"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            disabled={payload?.DeliveryState == ""}
          />

          <MultiSelctItems
            placeholderName="Centre"
            name="CentreId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={centre}
            labelKey="Centre"
            valueKey="CentreID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            handleChange={handleSelectMultiChange}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="Delivery Location"
              name="DeliveryLocation"
              values={payload}
              setValues={setPayload}
              dynamicOptions={locationsearch}
              labelKey="name"
              valueKey="id"
              handleChange={handleSelectMultiChange}
              requiredClassName="required-fields"
              respclass={""}
            />
            {payload?.DeliveryLocation.length === 0 && (
              <span className="error-message">{errors?.DeliveryLocation}</span>
            )}
          </div>

          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            minDate={new Date()}
          />

          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            minDate={new Date()}
          />

          <Input
            type="text"
            placeholder=" "
            lable="Ref No "
            id="RefNo"
            name="RefNo"
            value={payload?.RefNo}
            maxLength={50}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </Accordion>
      <Accordion
        name={t("Item Detail")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-xl-3 col-sm-4 col-md-6 co-12 ">
            <div className="d-flex">
              <ReactSelect
                placeholderName="Machine"
                name="Machine"
                id="Machine"
                removeIsClearable={true}
                dynamicOptions={machineall?.map((ele) => ({
                  label: ele?.name,
                  value: ele?.id,
                }))}
                className="required-fields"
                value={payload?.Machine}
                onChange={handleSelectChange}
                respclass={"w-100"}
              />

              {/* <button className="btn btn-sm btn-success" onClick={AddItemdetailtoaddall}>
                AddAllItems
              </button> */}
              <CustomButton icon={"add"} text={" AddAllItems"} onClick={AddItemdetailtoaddall} className="ml-2" />
            </div>
            {payload?.Machine === "" && (
              <span className="error-message">{errors?.Machine}</span>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12 d-none">
            <ReactSelect
              placeholderName="Search Option"
              name="SearchOption"
              id="SearchOption"
              removeIsClearable={true}
              dynamicOptions={[
                { label: "In Between", value: "0" },
                { label: "By First Name", value: "1" },
                { label: "By Item Code", value: "2" },
                { label: "By Catalog No", value: "w" },
              ]}
              value={payload?.SearchOption}
              onChange={handleSelectChange}
              respclass={"w-100"}
            />
          </div>
          <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={() => searchItems(autoCompleteVal)}
              onSelect={handleAutoCompleteSelect}
              id="ItemsName"
              name="ItemsName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
            />
            <label htmlFor="ItemsName" className="lable searchtest">
              Items
            </label>
          </div>
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

          <div
            className="col-sm-12 d-flex justify-content-center"
            style={{ marginBottom: "5px" }}
          >
            <div className="col-sm-1">
              {/* <button
                className="btn btn-sm btn-success"
                onClick={AddItemDetail}
              >
                Add
              </button> */}
              <CustomButton icon={"add"} text={"Add"} onClick={AddItemDetail} className="ml-2" />

            </div>
          </div>
        </div>
      </Accordion>
      <Accordion name={t("Added Item")} defaultValue={true} isBreadcrumb={true}>
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr No.")}</th>
                  <th>{t("Item Category")}</th>
                  <th>{t("ItemID")}</th>
                  <th>{t("Item Name")}</th>
                  {DefaultCurrencyName == "INR" &&
                    <th>{t("Hsn Code")}</th>}
                  <th>{t("Manufacturer")}</th>
                  <th>{t("Catalog No")}</th>
                  <th>{t("Machine")}</th>
                  <th>{t("Purchased Unit")}</th>
                  <th>{t("Pack Size")}</th>
                  <th>{t("Consumption Unit")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("Discount %")}</th>
                  <th>{t(DefaultCurrencyName == "INR" ? "IGST %" : "Tax")}</th>
                  {DefaultCurrencyName == "INR" &&
                    <>
                      <th>{t(DefaultCurrencyName == "INR" ? "CGST %" : "Tax")}</th>
                      <th>{t(DefaultCurrencyName == "INR" ? "SGST %" : "Tax")}</th>

                      <th>{t(DefaultCurrencyName == "INR" ? "Total GST %" : "Total Tax %")}</th>
                    </>
                  }
                  <th>{t("Change Tax")}</th>
                  <th>{t("Discount Amount")}</th>
                  <th>{t(DefaultCurrencyName == "INR" ? "Total GST Amount" : "Total Tax Amount")}</th>
                  <th>{t("#")}</th>
                </tr>
              </thead>
              <tbody>
                {itemDetailTabel?.map((row, index) => {
                  // const totalGST = ChangeTax ? ChangeGstntax : row?.gstntax;
                  // let cgst = 0;
                  // let sgst = 0;
                  // let IGST = 0;
                  // // let SupplierState = 25;
                  // // let DeliveryState = 26;
                  // const isSameState = String(payload?.SupplierState) === String(payload?.DeliveryState);

                  // if (SupplierState === DeliveryState) {
                  //   IGST = totalGST;
                  //   cgst = 0;
                  //   sgst = 0;
                  // } else {
                  //   cgst = totalGST / 2;
                  //   sgst = totalGST / 2;
                  //   IGST = 0;
                  // }
                  const isSameState = String(payload?.SupplierState) === String(payload?.DeliveryState);

                  const totalGST = row?.gstntax || 0;
                  let cgst = 0, sgst = 0, IGST = 0;

                  if (isSameState && DefaultCurrencyName === "INR") {
                    cgst = totalGST / 2;
                    sgst = totalGST / 2;
                    IGST = 0;
                  } else {
                    IGST = totalGST;
                    cgst = 0;
                    sgst = 0;
                  }
                  return (
                    <tr key={index}>
                      <td data-title="Sr No.">
                        {index + 1}
                        <i
                          className="fa fa-search"
                          style={{ color: "#03a0e7", marginLeft: 8 }}
                          onClick={() =>
                            handleModel(
                              "Item Detail",
                              "70vw",
                              "Store Location (SI)",
                              true,
                              <ShowDetailitem
                                handleChangeModel={handleChangeModel}
                                items={itemDetailTabel[index]}
                                index={index}
                                OnChangeTax={OnChangeTax}
                              />
                            )
                          }
                        ></i>
                      </td>
                      <td data-title="Item Category">{row?.ItemCategory}</td>
                      <td data-title="ItemID">{row?.Itemid}</td>
                      <td data-title="Item Name">{row?.ItemName}</td>
                      {DefaultCurrencyName == "INR" && <td data-title="Hsn Code">{row?.hsncode}</td>}
                      <td data-title="Manufacturer">{row?.ManufactureName}</td>
                      <td data-title="Catalog No">{row?.itemtypeid}</td>
                      <td data-title="Machine">{row?.MachineName}</td>
                      <td data-title="Purchased Unit">{row?.MinorUnitName}</td>
                      <td data-title="Pack Size">{row?.PackSize}</td>
                      <td data-title="Consumption Unit">
                        {row?.MajorUnitName}
                      </td>

                      <td data-title="Rate">
                        <input
                          type="text"
                          style={{ width: "50px" }}
                          // className="form-control required-fields"
                          className={"required-fields form-control"}
                          name="Rate"
                          value={row?.Rate || ""}
                          onChange={(e) =>
                            handleChangeItemDetailTabel(
                              index,
                              "Rate",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td data-title="Discount %">
                        <input
                          type="text"
                          className="form-control"
                          name="DiscountPercent"
                          value={row?.DiscountPercent || ""}
                          onChange={(e) =>
                            handleChangeItemDetailTabel(
                              index,
                              "DiscountPercent",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      <td data-title="IGST %">{IGST}</td>
                      {DefaultCurrencyName == "INR" &&
                        <>
                          <td data-title="CGST %">{cgst}</td>
                          <td data-title="SGST %">{sgst}</td>

                          <td data-title="Total GST %">{totalGST}</td></>
                      }

                      <td data-title="Change Tax">
                        <i
                          className="fa fa-edit"
                          style={{ color: "#03a0e7", cursor: "pointer" }}
                          onClick={() =>
                            handleModel(
                              "Change Tax Percentage",
                              "70vw",
                              "Store Location (SI)",
                              true,
                              <ChangeTaxPercentageModel
                                handleChangeModel={handleChangeModel}
                                items={itemDetailTabel[index]}
                                index={index}
                                OnChangeTax={OnChangeTax}
                              />
                            )
                          }
                        ></i>
                      </td>

                      <td data-title="Discount Amount">
                        {row?.DiscountAmount}
                      </td>
                      <td data-title="Total GST Amount">
                        {row?.TotalGSTAmount}
                      </td>
                      <td data-title="#">
                        <i
                          class="fa fa-times"
                          style={{ color: "red" }}
                          aria-hidden="true"
                          onClick={() =>
                            handleRemoveItemTabelRow(index)
                          }
                        ></i>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Terms & Conditions")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          <Input
            type="text"
            placeholder=" "
            lable="Terms"
            id="Terms"
            name="Terms"
            value={payload?.Terms}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            {/* <button
              className="btn btn-sm btn-success"
              onClick={TermConditionsAdd}
            >
              Add
            </button> */}

            <CustomButton icon={"add"} text={"Add"} onClick={TermConditionsAdd} className="ml-2" />

          </div>
          <div className="col-sm-9">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr No.")}</th>
                  <th>{t("Terms")}</th>
                  <th>{t("#")}</th>
                </tr>
              </thead>
              <tbody>
                {TermConditionsTabel?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr No.">{index + 1}</td>
                    <td data-title="Terms">{row?.Terms}</td>
                    <td data-title="#">
                      <i
                        class="fa fa-times"
                        style={{ color: "red" }}
                        aria-hidden="true"
                        onClick={() =>
                          handleRemoveTermConditionsTabelRow(index)
                        }
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
      <div className="card p-2">
        <div className="col-sm-12 d-flex justify-content-center" style={{ gap: "10px" }}>
          {/* <button
            className="btn btn-sm btn block btn-success"
            onClick={saveDataAPI}
          >
            Save
          </button>
          <button
            className="btn btn-sm btn block btn-success ml-2"
            onClick={resetState}
          >
            Reset
          </button> */}
          <CustomButton icon={"save"} text={"Save"} onClick={saveDataAPI} className="ml-2" />
          <CustomButton icon={"refresh"} text={"Reset"} onClick={resetState} className="ml-2" />

        </div>
      </div>
      <div className="card">
        <Heading
          title={"Search Details"}
          secondTitle={
            <>
              <ReactSelect
                placeholderName="Location"
                name="Location"
                id="Location"
                removeIsClearable={true}
                dynamicOptions={locationsearchDataTabel.map((ele) => ({
                  label: ele?.name,
                  value: ele?.id,
                }))}
                value={payload?.Location}
                onChange={handleSelectChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
              />
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
              ))}
            </>
          }
        />
        <div className="row p-2">
          <ReactSelect
            name="NoofRecord"
            id="NoofRecord"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "5", value: "5" },
              { label: "10", value: "10" },
              { label: "20", value: "20" },
              { label: "50", value: "50" },
              { label: "100", value: "100" },
            ]}
            placeholderName="No of Record"
            value={payload?.NoofRecord}
            onChange={handleSelectChange}
            respclass={"col-xl-1 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Qt No/Ref No"
            id="QtRefNo"
            name="QtRefNo"
            value={payload?.QtRefNo}
            onChange={handleChange}
            respclass={"col-xl-1 col-sm-4 col-md-6 co-12"}
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
          <ReactSelect
            name="ItemID"
            id="ItemID"
            removeIsClearable={true}
            dynamicOptions={itemsearchDataTabel?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            placeholderName="Items"
            value={payload?.ItemID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <DatePicker
            name="FromDateTabel"
            id="FromDateTabel"
            value={payload?.FromDateTabel}
            onChange={dateSelect}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="ToDateTabel"
            id="ToDateTabel"
            value={payload?.ToDateTabel}
            onChange={dateSelect}
            placeholder=""
            lable={t("To Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Status"
            id="Status"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Created", value: "0" },
              { label: "Checked", value: "1" },
              { label: "Approved", value: "2" },
            ]}
            placeholderName="Status"
            value={payload?.Status}
            onChange={handleSelectChange}
            respclass={"col-xl-1 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            {/* <button
              className="btn btn-sm btn-success"
              onClick={searchDataTabelAPI}
            >
              Search
            </button> */}

            <CustomButton icon={"search"} text={"Search"} onClick={searchDataTabelAPI} className="ml-2" />

          </div>
        </div>
        <div className="row px-2">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("Select")}</th>
                  <th>{t("Check")}</th>
                  <th>{t("Approve")}</th>
                  <th>{t("Print")}</th>
                  <th>{t("Quotation No.")}</th>
                  <th>{t("From Date")}</th>
                  <th>{t("To Date")}</th>
                  <th>{t("Vendor Name")}</th>
                  <th>{t("Vendor Address")}</th>
                  {/* <th>{t("GSTN No.")}</th> */}
                  <th>{t(DefaultCurrencyName == "INR" ? "GSTN No" : "Tax No")}</th>
                  <th>{t("Delivery State")}</th>
                  <th>{t("Delivery Location")}</th>
                </tr>
              </thead>
              <tbody>
                {searchDataTabel?.map((row, index) => {
                  const buttonState = buttonStates[row.Qutationno] || {};

                  return (
                    <tr key={index} style={{ backgroundColor: row?.rowcolor }}>
                      <td data-title="#">{index + 1}</td>

                      <td data-title="Select">
                        <i
                          className="fa fa-search"
                          style={{ color: "#03a0e7", marginLeft: 8 }}
                          onClick={() =>
                            handleModel(
                              "Item Detail",
                              "70vw",
                              "Store Location (SI)",
                              true,
                              <ShowDetailsModel
                                handleChangeModel={handleChangeModel}
                                items={row}
                                index={index}
                                OnChangeTax={OnChangeTax}
                              />
                            )
                          }
                        ></i>
                      </td>

                      <td data-title="Check">
                        {row.ApprovalStatus === 0 && (
                          <button
                            className="btn-Check-color"
                            onClick={() => handleCheckButton(row, "1")}
                          >
                            Check
                          </button>
                        )}
                      </td>

                      <td data-title="Approve">
                        {row?.ApprovalStatus === 1 && (
                          <button
                            className="btn-Approve-color"
                            onClick={() => handleCheckButton(row, "2")}
                          >
                            Approve
                          </button>
                        )}
                      </td>

                      <td data-title="Print" onClick={() => printReport(row?.Qutationno)}>
                        <i
                          className="fa fa-print"
                          style={{ color: "#03a0e7" }}
                        ></i>
                      </td>
                      <td data-title="Quotation No.">{row?.Qutationno}</td>
                      <td data-title="From Date">{row?.EntryDateFrom}</td>
                      <td data-title="To Date">{row?.EntryDateTo}</td>
                      <td data-title="Vendor Name">{row?.VendorName}</td>
                      <td data-title="Vendor Address">{row?.Address}</td>
                      <td data-title="GSTN No.">{row?.VednorStateGstnno}</td>
                      <td data-title="Delivery State">
                        {row?.DeliveryStateName}
                      </td>
                      <td data-title="Delivery Location" style={{
                        wordWrap: "break-word",
                        whiteSpace: "normal",
                      }}>
                        {row?.DeliveryLocationName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default VendorQuotation;

