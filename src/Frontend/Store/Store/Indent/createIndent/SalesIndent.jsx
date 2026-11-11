import React, { useEffect, useRef, useState } from "react";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { AutoComplete } from "primereact/autocomplete";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";
import LabeledInput from "../../../../components/formComponent/LabeledInput";
import "./Indent.css";
import ExcelUploadComponent from "./ExcelUploadComponent";
import { axiosInstance } from "../../../../utils/axiosInstance";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { CustomButton } from "../../../../components/UI/CustomButton";
import moment from "moment";

const SalesIndent = () => {
  const { t } = useTranslation();
  const { state } = useLocation();
  const indentno = state?.indentNo;
  const ActionType = state?.ActionType;
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const currentLocationRef = useRef(null);
  const itemRef = useRef(null);
  const quantityRef = useRef(null);
  const remarksRef = useRef(null);
  const initialState = {
    CurrentLocation: "",
    IndentToLocation: "",
    SearchOption: "1",
    Category: "",
    manufactureID: "",
    MachineID: "",
    PackSize: "",
    Quantity: "",
    Remarks: "",
    RejectionReason: "",
    CheckerComments: "",
    ItemIDData: "",
  };
  const [payload, setPayload] = useState(initialState);
  console.log(payload, "payload");
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [DropDownList, setDropDownList] = useState({
    curentlocation: [],
    intolocation: [],
    category: [],
    bindmanufacture: [],
    bindmachine: [],
    bindpacksize: [],
    bindoldindentdata: [],
    bindindentdetails: [],
  });
  console.log(DropDownList, "DropDownList");
  console.log(indentno, "indentno");

  const getHandleCheck = async (indentNo) => {
    try {
      const res = await axiosInstance.get(
        `StoreIndentRePrint/searchindentbyno?IndentNo=${indentNo}`
      );
      const data = res?.data?.message;
      if (Array.isArray(data)) {
        const first = data[0];
        setPayload((prev) => ({

          ...prev,
          CurrentLocation: first?.FromLocationDisplay || "",
          IndentToLocation: first?.ToLocationDisplay || "",
          Remarks: first?.Narration || "",
          RejectionReason: first?.rejectreason || "",
          Category: String(first?.CategoryTypeId) || "",

        }));
        const tableData = data.map((ele) => ({
          itemId: ele?.ItemId,
          typeName: ele?.ItemName,
          qty: ele?.ReqQty,
          checkedQty:
            state?.ActionType === "Maker"
              ? ele?.ReqQty
              : ele?.CheckedQty,
          approvedQty:
            state?.ActionType === "Checker"
              ? ele?.CheckedQty
              : ele?.ApprovedQty,
          rate: ele?.Rate,
          minorUnitName: ele?.UnitPrice,
          unitId: ele?.UnitId,
          unitName: ele?.UnitName,
          labRequiredDate: ele?.ExpectedDate,
          discountPer: ele?.DiscountPer,
          taxPerIGST: ele?.TaxPerIGST,
          taxPerCGST: ele?.TaxPerCGST,
          taxPerSGST: ele?.TaxPerSGST,
          taxPerUTGST: ele?.TaxPerUTGST,
          taxPerCESS: ele?.TaxPerCESS,
          discountAmount: ele?.DiscountAmount,
          taxAmount: ele?.TaxAmount,
          taxAmountIGST: ele?.TaxAmountIGST,
          taxAmountCGST: ele?.TaxAmountCGST,
          taxAmountSGST: ele?.TaxAmountSGST,
          taxAmountUTGST: ele?.TaxAmountUTGST,
          taxAmountCESS: ele?.TaxAmountCESS,
          totalAmount: ele?.TotalAmount,
          checked: false,
          inhandQty: ele?.InhandQty,

        }));
        setDropDownList((prev) => ({
          ...prev,
          bindindentdetails: tableData,
        }));
      }
      // toast.success("Checked Successfully");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    if (indentno) {
      getHandleCheck(indentno);
    }
  }, [indentno]);


  useEffect(() => {
    if (state?.indentNo && payload?.CurrentLocation) {
      GetBindToLocaton(payload?.CurrentLocation);
    }
  }, [state?.indentNo, payload?.CurrentLocation]);

  const handleSelectChange = (name, value) => {
    if (name === "CurrentLocation") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      GetBindToLocaton(value?.value);
      //GetCreateSaesIndent(value?.value);
      if (name === "Category") {
        fetchTemplateData(value?.value);
      }
    } else if (name === "manufactureID") {
      const selectedItemID =
        value?.itemID ??
        value?.ItemID ??
        value?.ItemId ??
        value?.itemId ??
        value?.itemid ??
        value?.Itemid;
      setPayload((prev) => ({
        ...prev,
        [name]: value?.value,
        ItemIDData:
          selectedItemID !== undefined && selectedItemID !== null
            ? String(selectedItemID)
            : prev.ItemIDData,
        MachineID: "",
        PackSize: "",
      }));
      setDropDownList((prev) => ({
        ...prev,
        bindmachine: [],
        bindpacksize: [],
      }));
    } else if (name === "MachineID") {
      setPayload((prev) => ({
        ...prev,
        [name]: value?.value,
        PackSize: "",
      }));
      setDropDownList((prev) => ({
        ...prev,
        bindpacksize: [],
      }));
    } else {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    }
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const SearchOptionList = [
    { label: "By First Name", value: "0" },
    { label: "In Between", value: "1" },
    { label: "By Item Code", value: "2" },
    { label: "By Catalog No", value: "3" },
  ];

  const handleParsedData = (data) => {
    console.log("Parsed Excel Data:", data);
  };
  const [templateData, setTemplateData] = useState([]);

  const fetchTemplateData = () => {
    axiosInstance
      .post("StoreCreateSalesIndent/getitems", {
        locationIdFrom: String(payload?.CurrentLocation?.split("#")[0]) || "",
        itemCategory: String(payload?.Category) || "",
        indentType: "SI",
      })
      .then((res) => {
        const response = res?.data?.message;
        console.log(response);
        if (Array.isArray(response)) {
          setTemplateData(response);
        }
      })
      .catch(() => console.log("Something went wrong"));
  };

  useEffect(() => {
    if (payload?.CurrentLocation && payload?.Category) {
      fetchTemplateData();
    }
  }, [payload?.CurrentLocation, payload?.Category]);

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

  const GetBindToLocaton = (locationid) => {
    axiosInstance
      .post("StoreCreateSalesIndent/BindIndentToLocation", {
        // fromLocation: String(3),
        fromLocation: String(locationid?.split("#")[0]),
        myIndentNo: "",
        indentType: "SI",
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
        }));
        setDropDownList((prev) => ({ ...prev, intolocation: newRes }));
        setPayload((prev) => ({
          ...prev,
          IndentToLocation:
            prev?.IndentToLocation || String(response[0]?.locationId) || "",
        }));
      })
      .catch(() => console.log("Something went wrong"));
  };
  // const GetCreateSaesIndent = (locationid) => {
  //   axiosInstance
  //     .get("StoreCreateSalesIndent/OpenCreateSaesIndentPage", {
  //       params: { locationId: String(locationid?.split("#")[0]), sipi: "SI" },
  //     })
  //     .then((res) => {
  //       const response = res?.data?.message;
  //       const newRes = response?.map((ele) => ({
  //         label: ele?.locationName,
  //         value: ele?.locationId,
  //       }));
  //       setDropDownList((prev) => ({ ...prev, intolocation: newRes }));
  //     })
  //     .catch(() => console.log("Something went wrong"));
  // };
  const Bindcategorytypes = () => {
    axiosInstance
      .get("StoreCreateSalesIndent/categorytypes")
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.name,
          value: ele?.id,
        }));
        setDropDownList((prev) => ({ ...prev, category: newRes }));
      })
      .catch(() => console.log("Something went wrong"));
  };

  const Bindmanufacturers = (val) => {
    axiosInstance
      .get("StoreCreateSalesIndent/manufacturers", {
        params: {
          locationId: String(payload?.CurrentLocation?.split("#")[0]) || "",
          itemIDGroup: String(val) || "",
          indentType: "SI",
        },
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.manufactureName,
          value: ele?.manufactureID,
          itemID:
            ele?.itemID ??
            ele?.ItemID ??
            ele?.ItemId ??
            ele?.itemId ??
            ele?.itemid ??
            ele?.Itemid,
        }));
        setDropDownList((prev) => ({
          ...prev,
          bindmanufacture: newRes,
        }));

        if (response?.length > 0) {
          const selectedItemID =
            response[0]?.itemID ??
            response[0]?.ItemID ??
            response[0]?.ItemId ??
            response[0]?.itemId ??
            response[0]?.itemid ??
            response[0]?.Itemid;
          setPayload((prev) => ({
            ...prev,
            manufactureID: String(response[0]?.manufactureID) || "",
            ItemIDData:
              selectedItemID !== undefined && selectedItemID !== null
                ? String(selectedItemID)
                : prev.ItemIDData,
          }));
        }
      })
      .catch(() => console.log("Something went wrong"));
  };

  const BindMachine = (val) => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindMachine", {
        locationIdFrom: Number(payload?.CurrentLocation?.split("#")[0]) || 0,
        itemIDGroup: Number(payload?.ItemID) || 0,
        manufactureID: Number(val) || 0,
        indentType: "SI",
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.machineName,
          value: ele?.machineID,
        }));
        setDropDownList((prev) => ({
          ...prev,
          bindmachine: newRes,
        }));

        if (response?.length > 0) {
          setPayload((prev) => ({
            ...prev,
            MachineID: String(response[0]?.machineID) || "",
          }));
        }
      })
      .catch(() => console.log("Something went wrong"));
  };
  const BindPackSize = (val) => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindPackSize", {
        locationIdFrom: Number(payload?.CurrentLocation?.split("#")[0]) || 0,
        itemIDGroup: Number(payload?.ItemID) || 0,
        manufactureID: Number(payload?.manufactureID) || 0,
        machineID: Number(val) || 0,
        indentType: "SI",
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.packSize,
          value: ele?.packValue,
        }));
        setDropDownList((prev) => ({
          ...prev,
          bindpacksize: newRes,
        }));

        if (response?.length > 0) {
          const matchedPackSize =
            response.find(
              (ele) =>
                String(ele?.packValue || "").split("#")[2] ===
                String(payload?.ItemIDData || "")
            ) || response[0];

          setPayload((prev) => ({
            ...prev,
            PackSize: String(matchedPackSize?.packValue) || "",
          }));
        }
      })
      .catch(() => console.log("Something went wrong"));
  };
  const BindOldIndentData = (val) => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindOldIndentData", {
        // itemID: 1,
        // locationID: 1,
        // indentType: "SI",
        // toLocationID: 1,
        itemID: Number(val) || 0,
        locationID: Number(payload?.CurrentLocation?.split("#")[0]) || 0,
        indentType: "SI",
        toLocationID: Number(payload?.IndentToLocation?.split("#")[0]) || 0,
      })
      .then((res) => {
        const response = res?.data?.message;
        setDropDownList((prev) => ({
          ...prev,
          bindoldindentdata: response,
        }));
      })
      .catch(() => console.log("Something went wrong"));
  };

  const AddIndentData = (val) => {
    let tempErrors = {};
    let errorFields = [];

    if (!payload?.Quantity) {
      tempErrors.Quantity = "This Field Required";
      errorFields.push(quantityRef);
    }

    setErrors(tempErrors);
    if (errorFields.length > 0) {
      errorFields.forEach((fieldRef, index) => {
        setTimeout(() => {
          fieldRef?.current?.focus?.();
          if (
            fieldRef?.current?.type !== "number" &&
            fieldRef?.current?.setSelectionRange
          ) {
            const len = fieldRef.current.value.length;
            fieldRef.current.setSelectionRange(len, len);
          }
        }, index * 300);
      });
      return;
    }
    axiosInstance
      .post("StoreCreateSalesIndent/SearchItemDetail", {
        itemID: String(payload?.ItemIDData) || "",
        curLocation: `${payload?.IndentToLocation?.split("#")[0] || ""}#${payload?.CurrentLocation?.split("#")[0] || ""}`,
        indentType: "SI",
      })
      .then((res) => {
        const response = res?.data?.message;
        toast.success(res?.data?.message);
        const newRes = response?.map((ele) => ({
          ...ele,
          qty: Number(payload?.Quantity),
          checkedQty: 0,
          approvedQty: 0,
        }));
        // setDropDownList((prev) => ({
        //   ...prev,
        //   bindindentdetails: newRes,
        // }));
        setDropDownList((prev) => {
          const existingIds = new Set(prev.bindindentdetails.map(i => i.itemId));
          const filtered = newRes.filter(i => !existingIds.has(i.itemId));

          if (filtered.length === 0) {
            toast.error("Item already added");
            return prev;
          }

          return {
            ...prev,
            bindindentdetails: [...prev.bindindentdetails, ...filtered],
            bindoldindentdata: [],  
          };
        });
      })
      .catch((err) => toast.error(err?.response?.data?.message));
  };

  useEffect(() => {
    if (payload?.manufactureID) {
      BindMachine(payload?.manufactureID);
    }
  }, [payload?.manufactureID]);
  useEffect(() => {
    if (payload?.MachineID) {
      BindPackSize(payload?.MachineID);
    }
  }, [payload?.MachineID]);

  useEffect(() => {
    GetBindCurrentLocaton();
    Bindcategorytypes();
  }, []);
  const searchItems = (query) => {
    axiosInstance
      .post("StoreCreateSalesIndent/SearchItem", {
        itemName: String(query),
        locationIdFrom: String(payload?.CurrentLocation) || "",
        locationIdTo: String(payload?.IndentToLocation) || "",
        itemCategory: String(payload?.Category) || "",
        indentType: "SI",
        searchOption: String(payload?.SearchOption) || "",
      })
      .then((res) => {
        const response = res?.data?.message;
        setStockSuggestions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  // const handleAutoCompleteSelect = (e) => {
  //   const selected = e.value;
  //   setPayload((prev) => ({
  //     ...prev,
  //     ItemName: selected?.itemNameGroup || selected,
  //     ItemID: selected?.itemIDGroup || selected,
  //     issueMultiplier: selected?.issueMultiplier || selected,
  //   }));
  //   Bindmanufacturers(selected?.itemIDGroup);
  //   BindOldIndentData(selected?.itemIDGroup);
  // };

  const handleAutoCompleteSelect = (e) => {
    const selected = e.value;
    setAutoCompleteVal(selected?.itemNameGroup || "");
    setPayload((prev) => ({
      ...prev,
      ItemName: selected?.itemNameGroup,
      ItemID: selected?.itemIDGroup,
      issueMultiplier: selected?.issueMultiplier,
      ItemIDData: selected?.itemID,
      manufactureID: "",
      MachineID: "",
      PackSize: "",
    }));

    setDropDownList((prev) => ({
      ...prev,
      bindmanufacture: [],
      bindmachine: [],
      bindpacksize: [],
    }));

    Bindmanufacturers(selected?.itemIDGroup);
    BindOldIndentData(selected?.itemID);
    setErrors((prev) => ({
      ...prev,
      ItemID: "",
    }));
  };

  // const handleAutoCompleteChange = (e) => {
  //   const val = typeof e.value === "object" ? e.value.itemNameGroup : e.value;
  //   setAutoCompleteVal(val);
  //   searchItems(val);
  //   setPayload((prev) => ({ ...prev, ItemName: val }));
  // };


  const handleAutoCompleteChange = (e) => {
    let val = e.value;
    if (typeof val === "object") {
      val = val?.itemNameGroup || "";
    }
    setAutoCompleteVal(val);
    setPayload((prev) => ({
      ...prev,
      ItemName: val,
      ...(typeof e.value !== "object" && {
        ItemID: "",
        ItemIDData: "",
        manufactureID: "",
        MachineID: "",
        PackSize: "",
      }),
    }));

    if (typeof e.value !== "object") {
      setDropDownList((prev) => ({
        ...prev,
        bindmanufacture: [],
        bindmachine: [],
        bindpacksize: [],
      }));
    }

    if (val) {
      searchItems(val);
    }
  };

  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.itemNameGroup}
      </div>
    </div>
  );


  const handleChanges = (index, name, value) => {
    setDropDownList((prev) => ({
      ...prev,
      bindindentdetails: prev.bindindentdetails.map((row, i) => {
        if (i !== index) return row;

        let newVal = value;

        if (name === "checkedQty") {
          const maxQty = Number(row?.qty) || 0;

          if (Number(value) > maxQty) {
            toast.error("Checked Qty cannot exceed Qty");
            newVal = String(maxQty);
          }
        }

        if (name === "approvedQty") {
          const checkedQty = Number(row?.checkedQty) || 0;

          if (Number(value) > checkedQty) {
            toast.error("Approved Qty cannot exceed Checked Qty");
            newVal = String(checkedQty);
          }
        }

        return { ...row, [name]: newVal };
      }),
    }));
  };
  const dateSelect = (index, name, date) => {
    const rawDate = date?.target?.value ?? date;

    setDropDownList((prev) => ({
      ...prev,
      bindindentdetails: prev.bindindentdetails.map((row, i) =>
        i === index ? { ...row, [name]: rawDate } : row
      ),
    }));
  };

  const handleRemove = (indexToRemove) => {
    setDropDownList((prevState) => ({
      ...prevState,
      bindindentdetails: prevState.bindindentdetails.filter(
        (_, idx) => idx !== indexToRemove
      ),
    }));
  };

  const handleSave = () => {
    let tempErrors = {};
    let errorFields = [];

    if (!payload?.CurrentLocation) {
      tempErrors.CurrentLocation = "This Field Required";
      errorFields.push(currentLocationRef);
    }
    if (!payload?.Category) {
      tempErrors.Category = "This Field Required";
    }

    if (!payload?.ItemID) {
      tempErrors.ItemID = "This Field Required";
      errorFields.push(itemRef);
    }
    if (!payload?.Remarks) {
      tempErrors.Remarks = "This Field Required";
      errorFields.push(remarksRef);
    }

    setErrors(tempErrors);
    if (errorFields.length > 0) {
      errorFields.forEach((fieldRef, index) => {
        setTimeout(() => {
          fieldRef?.current?.focus?.();

          if (fieldRef?.current?.setSelectionRange) {
            const len = fieldRef.current.value.length;
            fieldRef.current.setSelectionRange(len, len);
          }
        }, index * 300);
      });
      return;
    }
    if (!DropDownList?.bindindentdetails?.length > 0) {
      return toast.error("Atleast one Row  Required in Indent Detail table");
    }
    if (
      DropDownList?.bindindentdetails?.some((ele) => !ele?.labRequiredDate)
    ) {
      return toast.error("Please Select Lab Required Date for all items");
    }
    const requestBody = {
      indentList: DropDownList?.bindindentdetails?.map((ele) => ({
        indentNo: "",
        fromRights: "Maker",
        itemId: Number(ele?.itemId) || 0,
        itemName: String(ele?.typeName) || "",
        fromPanelId: Number(payload?.CurrentLocation?.split("#")[1]) || 0,
        fromLocationID: Number(payload?.CurrentLocation?.split("#")[0]) || 0,
        toLocationID: Number(payload?.IndentToLocation?.split("#")[0]) || 0,
        //fromLocationID: Number(payload?.CurrentLocation) || 0,
        toPanelID: Number(payload?.IndentToLocation?.split("#")[1]) || 0,
        //toLocationID: Number(payload?.IndentToLocation) || 0,
        reqQty: Number(ele?.qty) || 0,
        minorUnitID: Number(ele?.minorUnitId) || 0,
        minorUnitName: String(ele?.minorUnitName) || "",
        narration: String(payload?.Remarks),
        expectedDate: moment(ele?.labRequiredDate).format("YYYY-MM-DD"),
        indentType: "SI",
        isBackupEntry: 0,
        rate: Number(ele?.rate) || 0,
        discountPer: Number(ele?.discountPer) || 0,
        taxPerIGST: Number(ele?.taxPerIGST) || 0,
        taxPerCGST: Number(ele?.taxPerCGST) || 0,
        taxPerSGST: Number(ele?.taxPerSGST) || 0,
        netAmount: Number(ele?.qty) * Number(ele?.rate),
        // approvedQty: Number(ele?.approvedQty) || 0,
        approvedQty: 0,

        checkedQty: Number(ele?.checkedQty) || 0,
        maxQty: Number(ele?.qty) || 0,
        vendorid: Number(ele?.vendorId) || 0,
        vendorStateId: Number(ele?.vendorStateId) || 0,
        vednorStateGstnno: String(ele?.vendorStateGstnNo) || "0",
        unitPrice: Number(ele?.rate) || 0,
        Category: Number(payload?.Category) || 0,
        //dtEntry: "2025-05-31T07:26:27.632Z",
      })),
    };
    axiosInstance
      .post("StoreCreateSalesIndent/SaveIndent", requestBody)
      .then((res) => {
        const response = res?.data?.message;
        if (res?.data?.success) {
          toast.success("Sales Indent Save Successfuly");
          setPayload({ ...initialState });
          setDropDownList((prevState) => ({
            ...prevState,
            bindindentdetails: [],
          }));
          setAutoCompleteVal("");
          setStockSuggestions([]);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Wents Wrong"
        );
      });
  };

  const handleCheck = async (actionType) => {
    try {
      let LblActionTypeString = "";
      let FromRights = "";
      if (actionType === "Check") {
        LblActionTypeString = "Maker";
        FromRights = "Maker";
      }
      else if (actionType === "Approve") {
        LblActionTypeString = "Checker";
        FromRights = "Checker";
      }
      else if (actionType === "FinalApprove") {
        LblActionTypeString = "Approval";
        FromRights = "Approval";
      }

      const payload2 = {
        ButtonActionType: actionType,
        RejectionReason: String(payload?.RejectionReason) || "",
        CheckerComment: String(payload?.CheckerComments) || "",
        LblActionTypeString: LblActionTypeString,
        StoreSaveIndentDetail: DropDownList?.bindindentdetails?.map((ele) => ({

          indentNo: state?.indentNo || "",
          fromRights: FromRights,
          itemId: Number(ele?.itemId) || 0,
          itemName: String(ele?.typeName) || "",
          fromPanelId: Number(payload?.CurrentLocation?.split("#")[1]) || 0,
          fromLocationID: Number(payload?.CurrentLocation?.split("#")[0]) || 0,
          toLocationID: Number(payload?.IndentToLocation?.split("#")[0]) || 0,
          toPanelID: Number(payload?.IndentToLocation?.split("#")[1]) || 0,
          reqQty: Number(ele?.qty) || 0,
          minorUnitID: Number(ele?.MinorUnitName) || 0,
          minorUnitName: String(ele?.minorUnitName) || "",
          narration: String(payload?.Remarks) || "",
          expectedDate: moment(ele?.labRequiredDate ?? ele?.ExpectedDate).format("YYYY-MM-DD"),
          indentType: "SI",
          isBackupEntry: 0,
          rate: Number(ele?.rate) || 0,
          discountPer: Number(ele?.discountPer) || 0,
          taxPerIGST: Number(ele?.taxPerIGST) || 0,
          taxPerCGST: Number(ele?.taxPerCGST) || 0,
          taxPerSGST: Number(ele?.taxPerSGST) || 0,
          netAmount: Number(ele?.qty) * Number(ele?.rate) || 0,
          approvedQty: Number(ele?.approvedQty) || 0,
          checkedQty: Number(ele?.checkedQty) || 0,
          maxQty: Number(ele?.qty) || 0,
          vendorid: Number(ele?.vendorId) || 0,
          vendorStateId: Number(ele?.vendorStateId) || 0,
          //vednorStateGstnno: String(ele?.VednorStateGstnno) || "",
          unitPrice: Number(ele?.rate) || 0,
          Category: Number(payload?.Category) || 0
        }))
      };
      //debugger
      const res = await axiosInstance.post(
        "StoreCreateSalesIndent/MakeAction",
        payload2
      );
      if (res?.data?.success) {
        toast.success(`${actionType} Successfully`);
        setPayload({ ...initialState });
        setDropDownList((prevState) => ({
          ...prevState,
          bindindentdetails: [],
        }));
        navigate("/IndentStatusAndApproval");
      } else {
        // toast.error("Something went wrong");
      }
      setErrors({});
      setAutoCompleteVal("");
      setStockSuggestions([]);


    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message);
    }
  };

  const handeReset = () => {
    setPayload({ ...initialState });
    setDropDownList((prevState) => ({
      ...prevState,
      bindindentdetails: [],
    }));
    setErrors({});
    setAutoCompleteVal("");
    setStockSuggestions([]);
  };
  return (
    <>
      <Accordion
        name={t("Indent Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div
            className="col-xl-2 col-sm-4 col-md-6 co-12"
            tabIndex={-1}
            ref={currentLocationRef}
          >
            <ReactSelect
              name="CurrentLocation"
              id="CurrentLocation"
              removeIsClearable={true}
              dynamicOptions={DropDownList?.curentlocation}
              placeholderName="Current Location"
              value={payload?.CurrentLocation}
              onChange={handleSelectChange}
              ref={currentLocationRef}
              className={"required-fields"}
              isDisabled={!!state?.indentNo}
            />
            {errors?.CurrentLocation && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.CurrentLocation}
              </div>
            )}
          </div>
          <ReactSelect
            name="IndentToLocation"
            id="IndentToLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.intolocation}
            placeholderName="Indent Location "
            value={payload?.IndentToLocation}
            onChange={handleSelectChange}
            isDisabled={!!state?.indentNo}
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
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              name="Category"
              id="Category"
              removeIsClearable={true}
              dynamicOptions={DropDownList?.category}
              placeholderName="Category"
              value={payload?.Category}
              isDisabled={!!state?.indentNo}
              onChange={handleSelectChange}
              className={"required-fields"}
            />
            {errors?.Category && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Category}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12" tabIndex={-1}>
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={(e) => searchItems(e.query)}
              className="w-100 required-fields"
              onSelect={handleAutoCompleteSelect}
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
              field="itemNameGroup"
              id="empName"
            />
            <label htmlFor={"searchtest"} className="lable searchtest">
              Items
            </label>
            {errors?.ItemID && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.ItemID}
              </div>
            )}
          </div>
          <div className="col-sm-2">
            <LabeledInput
              label="Issue Multiplier"
              value={payload?.issueMultiplier}
            />
          </div>
        </div>
        <div className="d-none">
          <ExcelUploadComponent
            // templateData={newExcel}
            templateData={templateData?.length ? templateData : [{}]}
            // onFileParsed={(data) => {
            //   console.log("Parsed Excel Data", data);
            // }}
            fileAccept=".xlsx, .xls"
            onFileParsed={handleParsedData}
            uploadLabel="Choose Excel File"
            downloadLabel="Download Sample Template"
            t={t}
          // excelData={excelData}
          // AddEcelList={AddEcelList}
          />
        </div>
        <div className="row px-2 pt-2">
          <ReactSelect
            name="manufactureID"
            id="manufactureID"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.bindmanufacture}
            placeholderName="Manufacture"
            value={payload?.manufactureID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <ReactSelect
            name="MachineID"
            id="MachineID"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.bindmachine}
            placeholderName="Machine"
            value={payload?.MachineID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="PackSize"
            id="PackSize"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.bindpacksize}
            placeholderName="Pack Size"
            value={payload?.PackSize}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="text"
              placeholder=" "
              lable="Quantity"
              id="Quantity"
              name="Quantity"
              value={payload?.Quantity}
              onChange={handleChange}
              respclass={""}
              className={"required-fields"}
              maxLength={10}
              inputRef={quantityRef}
              // onInput={(e) => {
              //   e.target.value = e.target.value.replace(/[^0-9.]/g, "");
              // }}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/\D/g, "");
              }}
            />
            {errors?.Quantity && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Quantity}
              </div>
            )}
          </div>
          <div className="col-sm-4 d-flex">
            {/* <button className="btn btn-sm btn-success" onClick={AddIndentData}>
                
              </button> */}
            <CustomButton icon={"add"} text={"Add"} onClick={AddIndentData} />

            <ul>
              <li style={{ fontStyle: "italic", color: "red" }}>
                * For SI Qty Will be Consumption Unit and For PI Qty Will be
                Purchased Unit
              </li>
            </ul>
          </div>
        </div>
      </Accordion>

      <Accordion
        name={t("Sales Indent Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row p-2">
          {DropDownList?.bindoldindentdata && (
            <>
              {[
                {
                  label: "Item Name",
                  value: DropDownList.bindoldindentdata.itemName,
                },
                {
                  label: "Buffer Percentage",
                  value: DropDownList.bindoldindentdata.bufferPercentage,
                },
                {
                  label: "Average Consumption",
                  value: DropDownList.bindoldindentdata.averageConsumption,
                },
                {
                  label: "Wastage Percentage",
                  value: DropDownList.bindoldindentdata.wastagePercentage,
                },
                {
                  label: "InHand Qty",
                  value: DropDownList.bindoldindentdata.wareInhandQty,
                },
                {
                  label: "Last Indent Pending Qty",
                  value: DropDownList?.bindoldindentdata?.lastPendingQty,
                },
              ].map((item, index) => (
                <div className="col-sm-2" key={index}>
                  <LabeledInput label={item.label} value={item.value || 0} />
                </div>
              ))}
            </>
          )}
        </div>
      </Accordion>
      <Accordion
        name={t("Indent Items")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        {DropDownList?.bindindentdetails?.length > 0 && (
          <div className="row">
            <div className="col-sm-12">
              <Tables className="indent-table">
                <thead>
                  <tr>
                    <th>{t("Sr.No.")}</th>
                    <th>{t("Category")}</th>
                    <th>{t("Issue Multiplier")}</th>
                    <th>{t("ItemID")}</th>
                    <th>{t("Item Name")}</th>
                    {/* <th>Qut Expected Date</th> */}
                    <th>{t("InHand Qty")}</th>
                    {/* <th>{t("InHand Qty(To)")}</th> */}
                    <th>{t("Pending To Receive Qty")}</th>
                    <th>{t("Qty")}</th>
                    <th>{t("Checked Qty")}</th>
                    <th>{t("Approved Qty")}</th>
                    <th style={{ width: "10%" }}>{t("Lab Required Date")}</th>
                    <th>{t("Unit")}</th>
                    <th>{t("Item Type")}</th>
                    <th>{t("Item Code")}</th>
                    <th>{t("Hsn Code")}</th>
                    <th>{t("Rate")}</th>
                    <th>{t("Net Amt")}</th>
                    <th>{t("#")}</th>
                  </tr>
                </thead>
                <tbody>
                  {DropDownList?.bindindentdetails?.map((row, index) => (
                    <tr key={index}>
                      <td data-title="Sr.No.">{index + 1}</td>
                      <td data-title="Category">{row?.categoryTypeName}</td>
                      <td data-title="Issue Multiplier">
                        {row?.issueMultiplier}
                      </td>
                      <td data-title="ItemID">{row?.itemId}</td>
                      <td data-title="Item Name">{row?.typeName}</td>
                      <td data-title="InHand Qty">{row?.inhandQty}</td>
                      {/* <td data-title="InHand Qty(To)">
                        {row?.inhandQtyTo || ""}
                      </td> */}
                      <td data-title="Pending To Receive Qty">
                        {row?.pendingToReceiveQty || "0"}
                      </td>

                      <td data-title="Qty">
                        <input
                          type="text"
                          className="form-control"
                          style={{ minWidth: "50px" }}
                          name="qty"
                          autoComplete="off"
                          disabled={state?.ActionType === "Maker" || state?.ActionType === "Checker"}
                          value={row?.qty}
                          onChange={(e) => handleChanges(index, "qty", e.target.value.replace(/\D/g, ""))}
                        />
                      </td>
                      <td data-title="Checked Qty">
                        <input
                          type="text"
                          className="form-control"
                          name="checkedQty"
                          autoComplete="off"
                          disabled={state?.ActionType === "Checker" || !state}

                          value={row?.checkedQty}
                          onChange={(e) => handleChanges(index, "checkedQty", e.target.value.replace(/\D/g, ""))}
                        />
                      </td>
                      <td data-title="Approved Qty">
                        <input
                          type="text"
                          className="form-control"
                          name="approvedQty"
                          disabled={!state || state?.ActionType === "Maker"}
                          autoComplete="off"
                          value={row?.approvedQty}
                          onChange={(e) => handleChanges(index, "approvedQty", e.target.value.replace(/\D/g, ""))}
                        />
                      </td>
                      <td data-title="Lab Required Date">
                        {/* {row?.labRequiredDate || ""} */}
                        {/* <input
                          type="text"
                          className="form-control"
                          name="labRequiredDate"
                          value={row.labRequiredDate}
                          onChange={(e) =>
                            handleChanges(
                              index,
                              "labRequiredDate",
                              e.target.value
                            )
                          }
                        /> */}

                        {/* <DatePicker
                            name="labRequiredDate"
                            id="labRequiredDate"
                            value={
                              row?.labRequiredDate
                                ? new Date(row.labRequiredDate)
                                : new Date().toISOString()
                            }
                            onChange={(date) =>
                              dateSelect(index, "labRequiredDate", date)
                            }
                            // maxDate={new Date()}
                            className="custom-calendar w-100"
                            respclass={"required-fields"}
                          /> */}
                        <DatePicker
                          name="labRequiredDate"
                          id="labRequiredDate"
                          value={row?.labRequiredDate ? new Date(row.labRequiredDate) : null}
                          onChange={(date) => {
                            dateSelect(index, "labRequiredDate", date);
                          }}
                          className="custom-calendar w-100"
                          respclass={"required-fields"}
                        />
                      </td>
                      <td data-title="Unit">{row?.majorUnitName}</td>
                      <td data-title="Item Type">{row?.itemGroup}</td>
                      <td data-title="Item Code">{row?.apolloItemCode}</td>
                      <td data-title="Hsn Code">{row?.hsnCode}</td>
                      <td data-title="Rate">{row?.rate}</td>
                      <td data-title="Net Amt">{row?.rate * row?.qty || 0}</td>
                      <td data-title="#">
                        <button
                          className="btnAdd"
                          onClick={() => handleRemove(index)}
                        >
                          ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            </div>
          </div>
        )}
        <div className="row p-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="text"
              placeholder=" "
              lable="Remarks"
              id="Remarks"
              name="Remarks"
              value={payload?.Remarks}
              onChange={handleChange}
              ref={remarksRef}
            />
            {errors?.Remarks && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Remarks}
              </div>
            )}
          </div>
          {state?.indentNo && (
            <>
              <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                <Input
                  type="text"
                  placeholder=" "
                  lable="Checker Comments"
                  id="CheckerComments"
                  name="CheckerComments"
                  disabled={state?.ActionType === "Checker"}
                  value={payload?.CheckerComments}
                  onChange={handleChange}
                />
              </div>

              <div className="col-xl-2 col-sm-4 col-md-6 co-12">
                <Input
                  type="text"
                  placeholder=" "
                  lable="Rejection Reason"
                  id="RejectionReason"
                  name="RejectionReason"
                  value={payload?.RejectionReason}
                  onChange={handleChange}
                />
              </div>
            </>
          )}
          <div className="col-sm-1 d-flex" style={{ gap: "10px" }}>
            {!state && (
              <CustomButton icon={"save"} text={"Save"} onClick={handleSave} />
            )}

            {!state?.indentNo && (
              <CustomButton icon={"refresh"} text={"Reset"} onClick={handeReset} />
            )}

            {state?.ActionType === "Maker" && (
              <CustomButton icon={"check"} text={"Check"} onClick={() => handleCheck("Check")} />
            )}

            {state?.ActionType === "Checker" && (
              <CustomButton icon={"save"} text={"Approve"} onClick={() => handleCheck("Approve")} />
            )}

            {(state?.ActionType === "Maker" || state?.ActionType === "Checker") && (
              <CustomButton icon={"delete"} text={"Reject"} onClick={() => handleCheck("Reject")} />
            )}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default SalesIndent;