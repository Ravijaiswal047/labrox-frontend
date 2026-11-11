import React, { useEffect, useRef, useState } from "react";
import { useSSR, useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Accordion from "../../../../components/UI/Accordion";
import { PlusIcon, RefreshIcon } from "../../../../components/SvgIcons";
import Input from "../../../../components/formComponent/Input";
import RadioInput from "../../../../components/formComponent/RadioInput";
import ManufactureDetail from "./ManufactureDetail";
import SearchStoreItemDetail from "./SearchStoreItemDetail";
import {
  getBindMachine,
  getBindUnit,
  getCategoryType,
  getItemCategory,
  getManufacture,
  getSubCategory,
} from "../../../../utils/NetworkApi/commonApi";
import CategoryTypeMasterModel from "./CategoryTypeMasterModel";
import Modal from "../../../../components/ModalComponent/Modal";
import SubCategoryTypeMasterModel from "./SubCategoryTypeMasterModel";
import ItemTypeMasterModel from "./ItemTypeMasterModel";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import ManufactureMasterModel from "./ManufactureMasterModel";
import StoreUnitMasterModel from "./StoreUnitMasterModel";
import { Form } from "react-bootstrap";
import { CustomButton, SaveButton } from "../../../../components/UI/CustomButton";
import { AutoComplete } from "primereact/autocomplete";
import { Dialog } from "primereact/dialog";
import * as XLSX from "xlsx";
import Tables from "../../../../components/UI/customTable";
import Loading from "../../../../components/loader/Loading";
import { downloadExcelBlob } from "../../../../utils/helpers";

const StoreItemMaster = () => {
  const { t } = useTranslation();

  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const initialState = {
    Category: "",
    SubCategory: "",
    ItemType: "",
    ItemName: "",
    ItemDescription: "",
    ItemCode: "",
    HSNCode: "",
    GSTTax: "",
    StorageTemp: "",
    ItemSpecification: "",
    ModalNo: "",
    Barcode: "1",
    BarcodeGenerationOption: "2",
    ExpiryDateCutoff: "",
    IssueInFIFOOrder: "1",
    IsExpirable: "0",
    // manufacture
    Manufacture: "",
    CatalogNo: "",
    Machine: "",
    PurchaseUnit: "",
    Converter: "1",
    PackSize: "1",
    ConsumptionUnit: "",
    IssueMultiplier: "0",
    isserviceable: "0"
  };
  const isMobile = window.innerWidth <= 768;
  const [payload, setPayload] = useState(initialState);
  console.log(payload, "fewfwefew")
  const [load, setLoad] = useState({ upload: false, save: false, download: false });
  const [excelLoading, setExcelLoading] = useState(false);
  const [modalData, setModalData] = useState({});
  const [errors, setErrors] = useState({});
  console.log(errors, "errors")
  const [handleModelData, setHandleModelData] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [manufactureTableList, setManufactureTableList] = useState([]);
  console.log(manufactureTableList, "manufactureTableList")
  const [DropDownList, setDropDownList] = useState({
    categorylist: [],
    subcategorylist: [],
    itemcategorylist: [],
    // itemcategorylist: [],
    machinelist: [],
    itemslist: [],
    unitlist: [],
    manufacturelist: [],
  });

   const fileInputRef = useRef(null);
   

  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [TemplateData, setTemplateData] = useState([]);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const theme = useLocalStorage("theme", "get");
  const handleSelectChange = (name, value) => {
    const selectedValue = value?.value || "";

    if (name === "Category") {
      setPayload((prev) => ({
        ...prev,
        Category: selectedValue,
        SubCategory: "",
        ItemType: "",
        ItemID: ""
      }));
      setDropDownList((prev) => ({
        ...prev,
        subcategorylist: [],
        itemcategorylist: []
      }));


      if (selectedValue) {
        getSubCategory(selectedValue, (data) => {
          setDropDownList((prev) => ({
            ...prev,
            subcategorylist: data
          }));
        });
      } else {
        setDropDownList((prev) => ({
          ...prev,
          subcategorylist: [],
          itemcategorylist: [],
          itemslist: []
        }));
      }

    } else if (name === "SubCategory") {

      setPayload((prev) => ({
        ...prev,
        SubCategory: selectedValue,
        ItemType: "",
        ItemID: ""
      }));
      setDropDownList((prev) => ({
        ...prev,
        itemcategorylist: []
      }));

      if (selectedValue) {
        getItemCategory(selectedValue, (data) => {
          setDropDownList((prev) => ({
            ...prev,
            itemcategorylist: data
          }));
        });
      } else {
        setDropDownList((prev) => ({
          ...prev,
          itemcategorylist: [],
          itemslist: []
        }));
      }

    } else if (name === "isserviceable" && selectedValue === "1") {

      if (!payload?.Category) {
        toast.error("Please Select Category");
        return;
      }
      if (!payload?.SubCategory) {
        toast.error("Please Select SubCategory");
        return;
      }
      if (!payload?.ItemType) {
        toast.error("Please Select ItemType");
        return;
      }
      if (!payload?.ItemName) {
        toast.error("Please Select Item Name");
        return;
      }

      const naManufacture = DropDownList?.manufacturelist?.find(
        (ele) => ele?.name?.toUpperCase() === "NA"
      );
      const naMachine = DropDownList?.machinelist?.find(
        (ele) => ele?.name?.toUpperCase() === "NA"
      );
      const naUnit = DropDownList?.unitlist?.find(
        (ele) => ele?.name?.toUpperCase() === "NA"
      );
      const naUnitId = naUnit?.id?.split("#")[0];

      const newData = {
        Active: false,
        isActive: 1,
        ManufactureCompany: naManufacture?.id || "",
        CatalogNo: payload?.CatalogNo,
        Machine: naMachine?.id || "",
        PurchasedUnit: naUnitId || "",
        Converter: payload?.Converter,
        PackSize: payload?.PackSize,
        ConsumptionUnit: naUnitId || "",
        IssueMultiplier: payload?.IssueMultiplier,
        purchaseUnitName: naUnit?.name || "NA",
        ConsumeUnitName: naUnit?.name || "NA",
        manufacureName: naManufacture?.name || "NA",
        machineName: naMachine?.name || "NA",
        GlCode: "",
        itemID: 0
      };
      setManufactureTableList((prev) => {
        const alreadyExists = prev?.some(
          (row) =>
            row?.manufacureName === "NA" &&
            row?.machineName === "NA" &&
            row?.purchaseUnitName === "NA" &&
            row?.ConsumeUnitName === "NA"
        );
        return alreadyExists ? prev : [...prev, newData];
      });

      setPayload((prev) => ({
        ...prev,
        [name]: selectedValue
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: selectedValue
      }));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: ""
    }));
  };
  const searchItems = async (query) => {
    const requestBody = {
      ItemName: query || "",
    };
    await axiosInstance
      .post("StoreItemMasterUpdate/bindOldItemName", {
        ...requestBody,
      })
      .then((res) => {
        const response = res?.data?.message;
        setStockSuggestions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        // toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleAutoCompleteChange = (e) => {
    // const val = typeof e.value === "object" ? e.value.ItemNameGroup : e.value;
    const val = typeof e.value === "object" ? e.value.itemNameGroup : e.value;
    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({ ...prev, ItemName: val }));
  };
  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.itemNameGroup}
      </div>
    </div>
  );

  // const handleAutoCompleteSelect = (e) => {
  //   const selected = e.value;
  //   setPayload((prev) => ({
  //     ...prev,
  //     ItemName: selected?.ItemNameGroup || selected,
  //     ItemID: selected?.ItemIDGroup || selected,
  //   }));
  // };

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;
  //   if (name === "Converter") {
  //     setPayload((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   } else {
  //     setPayload((prev) => ({
  //       ...prev,
  //       [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
  //     }));
  //   }
  // };

  //   const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;

  //   if (name === "Converter") {
  //     // Prevent setting value less than 1
  //     if (Number(value) < 1 && value !== "") return;

  //     setPayload((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   } else {
  //     setPayload((prev) => ({
  //       ...prev,
  //       [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
  //     }));
  //   }
  // };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "Converter") {
      const numericValue = Number(value);
      if (value !== "" && (isNaN(numericValue) || numericValue < 1)) return;

      setPayload((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? (checked ? "1" : "0") : value,
      }));
    }
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleResetClick = () => {
    setPayload(initialState);
    setManufactureTableList([]);
    setAutoCompleteVal("");
    setStockSuggestions([]);
    setIsUpdate(false);
  };

  useEffect(() => {
    getCategoryType((data) => {
      setDropDownList((prev) => ({ ...prev, categorylist: data }));
    });
  }, []);


  // after modal closing effects
  useEffect(() => {
    if (handleModelData?.isOpen === false) {
      if (handleModelData?.type === "Category Type Master") {
        getCategoryType((data) => {
          setDropDownList((prev) => ({
            ...prev,
            categorylist: data,
          }));
        });
      }

      if (handleModelData?.type === "Sub Category Type Master") {
        getSubCategory(payload?.Category, (data) => {
          setDropDownList((prev) => ({
            ...prev,
            subcategorylist: data,
          }));
        });
      }

      if (handleModelData?.type === "Item Type Master") {
        getItemCategory(payload?.SubCategory, (data) => {
          setDropDownList((prev) => ({
            ...prev,
            itemcategorylist: data,
          }));
        });
      }

      if (handleModelData?.type === "Store Manufacture Master") {
        getManufacture((data) => {
          setDropDownList((prev) => ({
            ...prev,
            manufacturelist: data,
          }));
        });
      }

      if (handleModelData?.type === "Store Unit Master") {
        getBindUnit((data) => {
          setDropDownList((prev) => ({
            ...prev,
            unitlist: data,
          }));
        });
      }
    }
  }, [handleModelData?.isOpen]);

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

  const handleSave = () => {
    let tempErrors = {};
    if (!payload.Category) tempErrors.Category = "This Field Required";
    if (!payload.SubCategory) tempErrors.SubCategory = "This Field Required";
    if (!payload.ItemType) tempErrors.ItemType = "This Field Required";
    if (!payload.ItemName) tempErrors.ItemName = "This Field Required";
    if (!payload.HSNCode && DefaultCurrencyName == "INR") tempErrors.HSNCode = "This Field Required";
    if (!payload.GSTTax) tempErrors.GSTTax = "This Field Required";
    if (!payload.Barcode) tempErrors.Barcode = "This Field Required";
    // if (!payload.Machine) tempErrors.Machine = "This Field Required";
    if (!payload.BarcodeGenerationOption)
      tempErrors.BarcodeGenerationOption = "This Field Required";
    if (!payload.isserviceable)
      tempErrors.isserviceable = "This Field Required";

    setErrors(tempErrors);

    if (Object.keys(tempErrors).length > 0) {
      toast.error("Please fill all required fields");
      return;
    }
    if (!manufactureTableList?.length > 0) {
      return toast.error(
        "Atleast one Row  Required in Manufacture Detail table"
      );
    }

    const requestBody = {
      storeItemMaster: manufactureTableList?.map((ele) => ({
        categoryTypeID: Number(payload?.Category) || 0,
        subCategoryTypeID: Number(payload?.SubCategory) || 0,
        subCategoryID: Number(payload?.ItemType) || 0,
        typeName: String(payload?.ItemName) || "",
        description: String(payload?.ItemDescription) || "",
        specification: String(payload?.ItemSpecification) || "",
        makeandModelNo: String(payload?.ModalNo) || "",
        hsnCode: String(payload?.HSNCode) || "",
        expdatecutoff: Number(payload?.ExpiryDateCutoff) || 0,
        gstnTax: Number(payload?.GSTTax) || 0,
        temperatureStock: String(payload?.StorageTemp) || "",
        isActive: true,
        isExpirable: payload?.IsExpirable === "1" ? true : false,
        manufactureID: Number(ele?.ManufactureCompany) || 0,
        manufactureName: String(ele?.manufacureName) || "",
        catalogNo: String(ele?.CatalogNo) || "",
        machineID: Number(ele?.Machine) || 0,
        machineName: String(ele?.machineName) || "",
        majorUnitId: Number(ele?.PurchasedUnit) || 0,
        majorUnitName: String(ele?.purchaseUnitName) || "",
        packSize: String(ele?.PackSize) || "",
        converter: Number(ele?.Converter) || 0,
        minorUnitId: Number(ele?.ConsumptionUnit) || 0,
        minorUnitName: String(ele?.ConsumeUnitName) || "",
        issueMultiplier: Number(ele?.IssueMultiplier) || 0,
        barcodeOption: Number(payload?.Barcode) || 0,
        barcodeGenrationOption: Number(payload?.BarcodeGenerationOption) || 0,
        isserviceable: Number(payload?.isserviceable) || 0,
        issueInFIFO: payload?.IssueInFIFOOrder === 1 ? true : false,
        majorUnitInDecimal: 0,
        minorUnitInDecimal: 0,
        itemIDGroup: 0,
        apolloItemCode: String(payload?.ItemCode) || "",
        glCodes: ele?.GlCodes ? String(ele?.GlCodes) : "0",
        clientItemCode: "0",
      })),

      consumeData: [
        {
          paramID: 0,
          paramName: "",
          paramType: "",
          qty: 0,
          unit: "",
          labMachineID: 0,
          labMachineName: "",
        },
      ],
    };

    const updateRequestBody = {
      itemData: manufactureTableList?.map((ele) => ({
        // itemID: Number(payload?.itemID),
        itemID: Number(ele?.itemID) || 0,
        categoryTypeID: Number(payload?.Category) || 0,
        subCategoryTypeID: Number(payload?.SubCategory) || 0,
        subCategoryID: Number(payload?.ItemType) || 0,
        typeName: String(payload?.ItemName) || "",
        machineName: String(ele?.machineName) || "",
        manufactureName: String(ele?.manufacureName) || "",
        packSize: String(ele?.PackSize) || "",
        description: String(payload?.ItemDescription) || "",
        specification: String(payload?.ItemSpecification) || "",
        makeandModelNo: String(payload?.ModalNo) || "",
        hsnCode: String(payload?.HSNCode) || "",
        expdatecutoff: Number(payload?.ExpiryDateCutoff) || 0,
        gstnTax: Number(payload?.GSTTax) || 0,
        temperatureStock: String(payload?.StorageTemp) || "",
        isActive: Number(ele?.isActive) || 0,
        isExpirable: payload?.IsExpirable,
        manufactureID: Number(ele?.ManufactureCompany) || 0,
        catalogNo: String(ele?.CatalogNo) || "",
        machineId: Number(ele?.Machine) || 0,
        // majorUnitId: Number(ele?.ConsumptionUnit) || 0,
        // majorUnitName: String(ele?.ConsumeUnitName) || "",

        majorUnitId: Number(ele?.PurchasedUnit) || 0,
        majorUnitName: String(ele?.purchaseUnitName) || "",

        converter: Number(ele?.Converter) || 0,

        minorUnitId: Number(ele?.ConsumptionUnit) || 0,
        minorUnitName: String(ele?.ConsumeUnitName) || "",

        // minorUnitId: Number(ele?.PurchasedUnit) || 0,
        // minorUnitName: String(ele?.purchaseUnitName) || "",
        itemIDGroup: Number(payload?.itemIDGroup) || 0,
        issueMultiplier: Number(ele?.IssueMultiplier) || 0,
        barcodeOption: Number(payload?.Barcode) || 0,
        barcodeGenrationOption: Number(payload?.BarcodeGenerationOption) || 0,
        isserviceable: String(payload?.isserviceable) || "0",
        issueInFIFO: payload?.IssueInFIFOOrder === 1 ? true : false,
        majorUnitInDecimal: 0,
        minorUnitInDecimal: 0,
        apolloItemCode: String(payload?.ItemCode) || "",
        glCodes: ele?.GlCodes ? String(ele?.GlCodes) : "0",
        clientItemCode: "0",
      })),
      consumeData: [
        {
          paramID: 0,
          paramName: "",
          paramType: "",
          qty: 0,
          unit: "",
          labMachineID: 0,
          labMachineName: "",
        },
      ],
      userId: Number(userData?.EmployeeID) || 0,
      userName: String(userData?.Username) || "",
    };

    if (!isUpdate) {
      setLoad(true);
      axiosInstance
        .post("InventryManageApprovalStore/SaveStoreItemMaster", requestBody)
        .then((res) => {
          toast.success(res?.data?.message);
          handleResetClick();
          // getbinddepartment();
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Wents Wrong"
          );
        });
    } else {
      setLoad(true);

      axiosInstance
        .post("InventryManageApprovalStore/UpdateItemMaster", updateRequestBody)
        .then((res) => {
          toast.success(res?.data?.message);
          handleResetClick();
          // getbinddepartment();
          setIsUpdate(false);
        })
        .catch((err) => {
          console.log(err);
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Wents Wrong"
          );
        });
    }
  };

  const handleEditManufacture = (item) => {
    setLoad(true);
    axiosInstance
      .get("StoreUnitMaster/bindsavedmanufacture", { params: { itemid: item } })
      .then((res) => {
        const response = res?.data?.message;
        const data = response?.map((ele) => ({
          Active: true,
          isActive: ele?.isactive,
          ManufactureCompany: ele?.ManufactureID,
          CatalogNo: ele?.CatalogNo,
          Machine: ele?.MachineID,
          PurchasedUnit: ele?.MinorUnitId,
          Converter: ele?.Converter,
          PackSize: ele?.PackSize,
          ConsumptionUnit: ele?.MajorUnitId,
          IssueMultiplier: ele?.IssueMultiplier,
          purchaseUnitName: ele?.MajorUnitName,
          ConsumeUnitName: ele?.MinorUnitName,
          manufacureName: ele?.ManufactureName,
          machineName: ele?.MachineName,
          GlCodes: ele?.GLCodes,
          itemID: ele?.ItemId,
          isserviceable: ele?.Isserviceable,
        }));
        setManufactureTableList(data);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Wents Wrong"
        );
        setLoad(false);
        setManufactureTableList([]);
      });
  };

  const handleEdit = (item) => {
    console.log(item, "handleEdit");
    setIsUpdate(true);
    getSubCategory(item.categoryTypeID, (data) => {
      setDropDownList((prev) => ({
        ...prev,
        subcategorylist: data,
      }));
    });

    getItemCategory(item.subCategoryTypeID, (data) => {
      setDropDownList((prev) => ({
        ...prev,
        itemcategorylist: data,
      }));
    });

    setPayload({
      ...payload,
      Category: item.categoryTypeID || "",
      SubCategory: item.subCategoryTypeID || "",
      ItemType: item.subCategoryID || "",
      ItemName: item.itemName || "",
      ItemDescription: item.description || "",
      ItemCode: item.apolloItemCode || "",
      HSNCode: item.hsnCode || "",
      GSTTax: item.gstnTax || "",
      StorageTemp: item.temperatureStock || "",
      ItemSpecification: item.specification || "",
      ModalNo: item.makeAndModelNo || "",
      Barcode: item.barcodeOption || "",
      BarcodeGenerationOption: item.barcodeGenrationOption || "2",
      ExpiryDateCutoff: item.expDateCutoff || "",
      IssueInFIFOOrder: item.issueInFIFO ? "1" : "0",
      IsExpirable: item.isExpirable ? "1" : "0",
      itemId: item?.itemID,
      itemIDGroup: item?.itemIDGroup,
      isActive: item?.isactive == 1 ? true : false,
      isserviceable: item.isserviceable,
    });

    handleEditManufacture(item?.itemIDGroup);
  };
  const handleAdd = () => {
    let tempErrors = {};
    if (!payload?.Manufacture)
      tempErrors.Manufacture = "Manufacture is Required";
    if (!payload?.PurchaseUnit)
      tempErrors.PurchaseUnit = "Purchase Unit is Required";
    if (!payload?.ConsumptionUnit)
      tempErrors.ConsumptionUnit = "Consumption Unit is Required";
    if (!payload?.Machine)
      tempErrors.Machine = "Machine is Required";
    setErrors(tempErrors);
    if (payload?.Converter < 1)
      return toast?.warn("Converter Should be Greater or Equals to 1");
    if (Object.keys(tempErrors).length > 0) return;
    const purchaseUnitName = DropDownList?.unitlist?.find(
      (ele) => ele?.id?.split("#")[0] === payload?.PurchaseUnit
    )?.name;
    const ConsumeUnitName = DropDownList?.unitlist?.find(
      (ele) => ele?.id?.split("#")[0] === payload?.ConsumptionUnit
    )?.name;
    const manufacureName = DropDownList?.manufacturelist?.find(
      (ele) => ele?.id === payload?.Manufacture
    )?.name;
    const machineName = DropDownList?.machinelist?.find(
      (ele) => ele?.id === payload?.Machine
    )?.name;
    const newData = {
      Active: false,
      isActive: 1,
      ManufactureCompany: payload?.Manufacture || "NA",
      CatalogNo: payload?.CatalogNo,
      Machine: payload?.Machine || "NA",
      PurchasedUnit: payload?.PurchaseUnit || "NA",
      Converter: payload?.Converter,
      PackSize: payload?.PackSize,
      ConsumptionUnit: payload?.ConsumptionUnit || "NA",
      IssueMultiplier: payload?.IssueMultiplier,
      purchaseUnitName: purchaseUnitName,
      ConsumeUnitName: ConsumeUnitName,
      manufacureName: manufacureName,
      machineName: machineName || "",
      GlCode: "",
      itemID: 0
    };

    setManufactureTableList((prev) => {
      const updatedData = [...prev, newData];
      return updatedData;
    });

    setPayload((prev) => ({
      ...prev,
      Manufacture: "",
      CatalogNo: "",
      Machine: "",
      PurchaseUnit: "",
      Converter: "1",
      PackSize: "1",
      ConsumptionUnit: "",
      IssueMultiplier: "0",
    }));
    setErrors({});
  };
  const handleRemove = (index) => {
    setManufactureTableList((prev) => {
      const updatedData = prev.filter((_, i) => i !== index);
      return updatedData;
    });
  };
  const handletableChange = (index, name, value) => {
    setManufactureTableList((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [name]: value } : row))
    );
  };

  useEffect(() => {
    getManufacture((data) => {
      setDropDownList((prev) => ({ ...prev, manufacturelist: data }));
    });
    getBindUnit((data) => {
      setDropDownList((prev) => ({ ...prev, unitlist: data }));
    });
    getBindMachine((data) => {
      setDropDownList((prev) => ({ ...prev, machinelist: data }));
    });
  }, []);

  // side render when disabling 
  useEffect(() => {
    if (payload?.IssueInFIFOOrder === "1") {
      setPayload((prev) => ({
        ...prev,
        Barcode: "1",
        BarcodeGenerationOption: "2",
        // IsExpirable: "1"
      }));
    }
  }, [payload?.IssueInFIFOOrder]);



   const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

   const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
  
      setLoad((prev) => ({ ...prev, upload: true }));
      const reader = new FileReader();
  
      reader.onload = (event) => {
        try {
          const data = event.target.result;
  
          const workbook = XLSX.read(new Uint8Array(data), {
            type: "array",
          });
  
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  
          // Read as raw arrays so we can detect the real header row
          const rawRows = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: "",
          });

          // Find the first row that looks like a header (non-empty first cell, multiple non-empty cells)
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
            const row = rawRows[i];
            const nonEmpty = row.filter((c) => c !== "" && c !== null && c !== undefined);
            if (nonEmpty.length >= 3) {
              headerRowIndex = i;
              break;
            }
          }

          const headers = rawRows[headerRowIndex];
          let jsonData = rawRows.slice(headerRowIndex + 1)
            .filter((row) => row.some((c) => c !== "" && c !== null && c !== undefined))
            .map((row) => {
              const obj = {};
              headers.forEach((h, i) => {
                if (h !== "" && h !== null && h !== undefined) {
                  const value = row[i] ?? "";
                  obj[h] = typeof value === "number" ? Number(value.toFixed(2)) : value;
                }
              });
              return obj;
            });
  
          if (jsonData.length === 0) {
            toast.error("The uploaded file is empty.");
  
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
  
            return;
          }
  
          setTemplateData(jsonData);
          setShowImportDialog(true);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (error) {
          console.error(error);
          toast.error("Error reading file.");

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } finally {
          setLoad((prev) => ({ ...prev, upload: false }));
        }
      };
  
      reader.readAsArrayBuffer(file);
    };

  const handleImportSave = async () => {
    if (!TemplateData.length) return;
    setLoad((prev) => ({ ...prev, save: true }));
    try {
      const columnMap = {
        ItemId: "itemIDGroup",
        CategoryTypeName: "categoryTypeName",
        SubCategoryTypeName: "subCategoryTypeName",
        SubCategoryName: "subCategoryName",
        CategoryTypeID: "categoryTypeID",
        SubCategoryTypeID: "subCategoryTypeID",
        SubCategoryID: "subCategoryID",
        TypeName: "typeName",
        Specification: "specification",
        Description: "description",
        ClientItemCode: "clientItemCode",
        HsnCode: "hsnCode",
        HsrCode: "hsnCode",
        ExpDateCutoff: "expdatecutoff",
        GstnTax: "gstnTax",
        TemperatureStock: "temperatureStock",
        ManufactureName: "manufactureName",
        ManufactureID: "manufactureID",
        CatalogNo: "catalogNo",
        MachineName: "machineName",
        MachineId: "machineId",
        MajorUnitName: "majorUnitName",
        MajorUnitId: "majorUnitId",
        Converter: "converter",
        PackSize: "packSize",
        MinorUnitName: "minorUnitName",
        MinorUnitId: "minorUnitId",
        IsExpirable: "isExpirable",
        IssueMultiplier: "issueMultiplier",
        BarcodeOption: "barcodeOption",
        BarcodeGenrationOption: "barcodeGenrationOption",
        IssueInFIFO: "issueInFIFO",
        MajorUnitInDecimal: "majorUnitInDecimal",
        MinorUnitInDecimal: "minorUnitInDecimal",
        ApolloItemCode: "apolloItemCode",
        GlCodes: "glCodes",
        Isserviceable: "isserviceable",
        IsServiceable: "isserviceable",
        IsActive: "isActive",
      };

      const boolFields = new Set(["isExpirable", "issueInFIFO", "barcodeOption", "barcodeGenrationOption",
        "majorUnitInDecimal", "minorUnitInDecimal", "isserviceable", "isActive"]);
      const numFields = new Set(["itemIDGroup", "categoryTypeID", "subCategoryTypeID", "subCategoryID",
        "manufactureID", "machineId", "majorUnitId", "minorUnitId", "converter",
        "expdatecutoff", "gstnTax", "issueMultiplier"]);

      const toBool = (v) => {
        if (typeof v === "boolean") return v;
        if (typeof v === "number") return v !== 0;
        return String(v).toLowerCase() === "yes" || v === "1" || String(v).toLowerCase() === "true";
      };

      const storeItemMaster = TemplateData.map((row) => {
        const item = {};
        Object.entries(row).forEach(([excelKey, val]) => {
          const apiKey = columnMap[excelKey] ?? (excelKey.charAt(0).toLowerCase() + excelKey.slice(1));
          if (boolFields.has(apiKey)) {
            item[apiKey] = toBool(val);
          } else if (numFields.has(apiKey)) {
            item[apiKey] = Number(val) || 0;
          } else {
            item[apiKey] = String(val ?? "");
          }
        });
        return item;
      });

      const res = await axiosInstance.post(
        "InventryManageApprovalStore/ImportStoreItemMaster",
        { storeItemMaster, consumeData: [] }
      );
      if (res.status === 200) {
        toast.success(res.data.message || "Data saved successfully");
        setShowImportDialog(false);
        setTemplateData([]);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setLoad((prev) => ({ ...prev, save: false }));
    }
  };


  const handleExportMaster = async () => {
     
  
      try {
        setExcelLoading(true)
        const res = await axiosReport.get("commonReports/ExportItemMaster", {
          responseType: "blob",
        });
  
        const contentType = res.headers?.["content-type"] || "";
        if (contentType.includes("application/json")) {
          const text = await res.data.text();
          const json = JSON.parse(text);
          toast.warning(json?.message || "No records found.");
          setExcelLoading(false)
          return;
        }
  
        if (!res.data || res.data.size === 0) {
          toast.warning("No data available to export.");
          setExcelLoading(false)
          return;
        }else{
        downloadExcelBlob(res?.data,"storeItem")
         toast.success("Excel generated successfully");

        }
        
      } catch (err) {
        if (err?.response?.data instanceof Blob) {
          const text = await err.response.data.text();
          try {
            const json = JSON.parse(text);
            toast.error(json?.message || "Error while fetching report.");
            setExcelLoading(false)
          } catch {
            toast.error("Error while fetching report.");
            setExcelLoading(false)
          }
          return;
        }
        toast.error(err?.response?.data?.message || "Error while fetching report.");
        setExcelLoading(false)
      } finally {
        setExcelLoading(false)
      }
  
    };


















  // useEffect(() => {
  //   if (payload?.IsExpirable === "1") {
  //     setPayload((prev) => ({
  //       ...prev,
  //       Barcode: "1",
  //       BarcodeGenerationOption: "2",
  //       // IsExpirable: "1"
  //     }));
  //   }
  // }, [payload?.IsExpirable]);

  return (
    <>
      <Accordion
        name={t("Store Item Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <div className=" d-flex">
              <ReactSelect
                name="Category"
                id="Category"
                removeIsClearable={true}
                dynamicOptions={[
                  // { label: "Select", value: "" },
                  ...DropDownList?.categorylist?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  })),
                ]}
                placeholderName="Category"
                value={payload?.Category}
                onChange={handleSelectChange}
                respclass={"w-100"}
                className={"required-fields"}
              />
              <button
                className="btnAdd"
                onClick={() =>
                  setPayload((prev) => ({
                    ...prev,
                    Category: "",
                    SubCategory: "",
                    ItemType: "",
                  }))
                }
              >
                <RefreshIcon />
              </button>
              <button
                className="btnAdd"
                onClick={() =>
                  handleModel(
                    "Category Type Master",
                    isMobile,
                    "Category Type Master",
                    true,
                    <CategoryTypeMasterModel
                      setDropDownList={() =>
                        getCategoryType((data) => {
                          setDropDownList((prev) => ({
                            ...prev,
                            categorylist: data,
                          }));
                        })
                      }
                    />
                  )
                }
              >
                <PlusIcon />
              </button>
            </div>
            {errors?.Category && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Category}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <div className=" d-flex">
              <ReactSelect
                name="SubCategory"
                id="SubCategory"
                removeIsClearable={true}
                dynamicOptions={[
                  // { label: "Select", value: "" },
                  ...DropDownList?.subcategorylist?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  })),
                ]}
                placeholderName="Sub Category"
                value={payload?.SubCategory}
                onChange={handleSelectChange}
                respclass={"w-100"}
                className={"required-fields"}
              />
              <button
                className="btnAdd"
                onClick={() =>
                  setPayload((prev) => ({
                    ...prev,
                    SubCategory: "",
                    ItemType: "",
                  }))
                }
              >
                <RefreshIcon />
              </button>
              <button
                className="btnAdd"
                onClick={() =>
                  handleModel(
                    "Sub Category Type Master",
                    isMobile,
                    "Sub Category Type Master",
                    true,
                    <SubCategoryTypeMasterModel
                      handleChangeModel={handleChangeModel}
                    />
                  )
                }
              >
                <PlusIcon />
              </button>
            </div>
            {errors?.SubCategory && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.SubCategory}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <div className=" d-flex">
              <ReactSelect
                name="ItemType"
                id="ItemType"
                removeIsClearable={true}
                dynamicOptions={[
                  // { label: "Select", value: "" },
                  ...DropDownList?.itemcategorylist?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  })),
                ]}
                placeholderName="Item Type"
                value={payload?.ItemType}
                onChange={handleSelectChange}
                respclass={"w-100"}
                className={"required-fields"}
              />
              <button
                className="btnAdd"
                onClick={() =>
                  setPayload((prev) => ({
                    ...prev,
                    ItemType: "",
                  }))
                }
              >
                <RefreshIcon />
              </button>
              <button
                className="btnAdd"
                onClick={() =>
                  handleModel(
                    "Item Type Master",
                    isMobile,
                    "Item Type Master",
                    true,
                    <ItemTypeMasterModel
                      handleChangeModel={handleChangeModel}
                    />
                  )
                }
              >
                <PlusIcon />
              </button>
            </div>
            {errors?.ItemType && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.ItemType}
              </div>
            )}
          </div>
          {/* <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <Input
              type="text"
              placeholder=" "
              lable="Item Name"
              id="ItemName"
              name="ItemName"
              value={payload?.ItemName}
              onChange={handleChange}
              respclass={""}
              className={"required-fields"}
            />
            {errors?.ItemName && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.ItemName}
              </div>
            )}
          </div> */}
          {/* automcomplete */}
          <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
            <AutoComplete
              style={{ width: "100%" }}
              value={payload?.ItemName}
              suggestions={stockSuggestions}
              completeMethod={() => searchItems(autoCompleteVal)}
              // onSelect={"handleAutoCompleteSelect"}
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
            type="text"
            placeholder=" "
            lable="Item Description"
            id="ItemDescription"
            name="ItemDescription"
            value={payload?.ItemDescription}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Item Code"
            id="ItemCode"
            name="ItemCode"
            value={payload?.ItemCode}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          {DefaultCurrencyName == "INR" &&
            <div className="col-xl-2 col-sm-4 col-md-6 co-12">
              <Input
                type="text"
                placeholder=" "
                lable="HSN Code"
                id="HSNCode"
                name="HSNCode"
                value={payload?.HSNCode}
                onChange={handleChange}
                respclass={""}
                className={"required-fields"}
              />
              {errors?.HSNCode && DefaultCurrencyName == "INR" && (
                <div className="text-danger" style={{ fontSize: "12px" }}>
                  {errors?.HSNCode}
                </div>
              )}
            </div>}
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Input
              type="number"
              placeholder=" "
              lable={DefaultCurrencyName == "INR" ? "GST Tax %" : "Tax %"}
              id="GSTTax"
              name="GSTTax"
              value={payload?.GSTTax}
              onChange={handleChange}
              respclass={""}
              className={"required-fields"}
            />
            {errors?.GSTTax && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.GSTTax}
              </div>
            )}
          </div>
          <Input
            type="text"
            placeholder=" "
            lable="Storage Temperature"
            id="StorageTemp"
            name="StorageTemp"
            value={payload?.StorageTemp}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Item Specification"
            id="ItemSpecification"
            name="ItemSpecification"
            value={payload?.ItemSpecification}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="number"
            placeholder=" "
            lable="Make and Model No"
            id="ModalNo"
            name="ModalNo"
            value={payload?.ModalNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="number"
            placeholder=" "
            lable="Expiry Days Cutoff"
            id="ExpiryDateCutoff"
            name="ExpiryDateCutoff"
            disabled={payload?.IsExpirable !== "1"}
            value={payload?.ExpiryDateCutoff}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              name="Barcode"
              id="Barcode"
              removeIsClearable={true}
              dynamicOptions={[
                { label: "Stock Wise", value: "1" },
                { label: "Item Wise", value: "2" },
              ]}
              placeholderName="Barcode Option"
              value={payload?.Barcode}
              //isDisabled={payload?.IssueInFIFOOrder == "1" ? true : false}
              onChange={handleSelectChange}
              respclass={""}
              className={"required-fields"}
            />
            {errors?.Barcode && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Barcode}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              name="BarcodeGenerationOption"
              id="BarcodeGenerationOption"
              removeIsClearable={true}
              dynamicOptions={[
                { label: "Self", value: "1" },
                { label: "System Generated", value: "2" },
              ]}
              placeholderName="Barcode Generation Option"
              value={payload?.BarcodeGenerationOption}
              onChange={handleSelectChange}
              respclass={""}
              className={"required-fields"}
            />
            {errors?.BarcodeGenerationOption && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.BarcodeGenerationOption}
              </div>
            )}
          </div>
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
              className={"required-fields"}
              isDisabled={payload?.isserviceable === "1"}
            />
            {errors?.isserviceable && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.isserviceable}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <Form.Check
              type="switch"
              id="IssueInFIFOOrder"
              name="IssueInFIFOOrder"
              label={t("Issue In FIFO Order")}
              checked={payload.IssueInFIFOOrder == "1"}
              onChange={(e) => handleChange(e)}
              className="m-0"
            />
          </div>
          <Form.Check
            type="switch"
            //disabled={payload?.IssueInFIFOOrder == "1" ? true : false}
            id="IsExpirable"
            name="IsExpirable"
            label={t("IsExpirable")}
            checked={payload.IsExpirable === "1"}
            // isDisabled={payload?.IssueInFIFOOrder === "1" ? true : false}  
            onChange={(e) => handleChange(e)}
            className="m-0"
          />
        </div>
      </Accordion>
      <Accordion
        name={t("Manufacture Detail")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <div className=" d-flex">
              <ReactSelect
                name="Manufacture"
                id="Manufacture"
                removeIsClearable={true}
                dynamicOptions={[
                  { label: "Select", value: "" },
                  ...DropDownList?.manufacturelist?.map((item) => ({
                    label: item?.name,
                    value: item?.id,
                  })),
                ]}
                placeholderName="Manufacture"
                value={payload?.Manufacture}
                onChange={handleSelectChange}
                respclass={"w-100"}
                className={"required-fields"}
              />

              <button
                className="btnAdd"
                onClick={() =>
                  handleModel(
                    "Store Manufacture Master",
                    isMobile,
                    "Store Manufacture Master",
                    true,
                    <ManufactureMasterModel
                      handleChangeModel={handleChangeModel}
                    />
                  )
                }
              >
                <PlusIcon />
              </button>
            </div>
            {errors?.Manufacture && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Manufacture}
              </div>
            )}
          </div>
          <Input
            type="text"
            placeholder=" "
            lable="Catalog No"
            id="CatalogNo"
            name="CatalogNo"
            value={payload?.CatalogNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <ReactSelect
              name="Machine"
              id="Machine"
              removeIsClearable={true}
              dynamicOptions={[
                { label: "Select", value: "" },
                ...DropDownList?.machinelist?.map((item) => ({
                  label: item?.name,
                  value: item?.id,
                })),
              ]}
              className={"required-fields"}
              placeholderName="Machine"
              value={payload?.Machine}
              onChange={handleSelectChange}
            // respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            />
            {errors?.Machine && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Machine}
              </div>
            )}
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <div className=" d-flex">
              <ReactSelect
                name="PurchaseUnit"
                id="PurchaseUnit"
                removeIsClearable={true}
                dynamicOptions={[
                  { label: "Select", value: "" },
                  ...DropDownList?.unitlist?.map((item) => ({
                    label: item?.name,
                    value: item?.id?.split("#")[0],
                  })),
                ]}
                placeholderName="Purchase Unit"
                value={payload?.PurchaseUnit}
                onChange={handleSelectChange}
                respclass={"w-100"}
                className={"required-fields"}
              />

              <button
                className="btnAdd"
                onClick={() =>
                  handleModel(
                    "Store Unit Master",
                    isMobile,
                    "Store Unit Master",
                    true,
                    <StoreUnitMasterModel
                      handleChangeModel={handleChangeModel}
                    />
                  )
                }
              >
                <PlusIcon />
              </button>
            </div>
            {errors?.PurchaseUnit && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.PurchaseUnit}
              </div>
            )}
          </div>
          <Input
            type="text"
            placeholder=" "
            lable="Converter"
            id="Converter"
            name="Converter"
            min={1}
            value={payload?.Converter}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="PackSize"
            id="PackSize"
            name="PackSize"
            value={payload?.PackSize}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <div className=" d-flex">
              <ReactSelect
                name="ConsumptionUnit"
                id="ConsumptionUnit"
                removeIsClearable={true}
                dynamicOptions={[
                  { label: "Select", value: "" },
                  ...DropDownList?.unitlist?.map((item) => ({
                    label: item?.name,
                    value: item?.id?.split("#")[0],
                  })),
                ]}
                placeholderName="Consumption Unit"
                value={payload?.ConsumptionUnit}
                onChange={handleSelectChange}
                respclass={"w-100"}
                className={"required-fields"}
              />

              <button
                className="btnAdd"
                onClick={() =>
                  handleModel(
                    "Store Unit Master",
                    isMobile,
                    "Store Unit Master",
                    true,
                    <StoreUnitMasterModel
                      handleChangeModel={handleChangeModel}
                    />
                  )
                }
              >
                <PlusIcon />
              </button>
            </div>
            {errors?.ConsumptionUnit && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.ConsumptionUnit}
              </div>
            )}
          </div>
          <Input
            type="number"
            placeholder=" "
            lable="Issue Multiplier"
            id="IssueMultiplier"
            name="IssueMultiplier"
            value={payload?.IssueMultiplier}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            {/* <button
              className="btn btn-sm btn block btn-success"
              onClick={handleAdd}
            >
              Add
            </button> */}
            <CustomButton
              icon={"add"}
              text={"Add"}
              onClick={handleAdd}

            />
          </div>
        </div>
      </Accordion>

      <ManufactureDetail
        manufactureTableList={manufactureTableList}
        handleRemove={handleRemove}
        handletableChange={handletableChange}
      />
      <div className="card p-2">
        <div className="col-sm-12 d-flex justify-content-center">
          <div className="col-auto">
                    <input
                                type="file"
                                id="importFile"
                                style={{ display: "none" }}
                                onChange={handleFileUpload}
                                accept=".xlsx, .xls"
                              />
                              <CustomButton
                                text={"Import"}
                                variant="success"
                                icon="upload"
                                onClick={() => document.getElementById("importFile").click()}
                                className="ml-2"
                              />
                  </div>

                    <CustomButton
                                text={"Export"}
                                icon="excel"
                                 onClick={handleExportMaster}
                                className="ml-2"
                              />


          <CustomButton
            className="ml-3"
            icon={"save"}
            text={isUpdate ? t("Update") : t("Save")}
            onClick={handleSave}

          />
          <CustomButton
            className="ml-3"
            icon={"refresh"}
            text={t("Reset")}
            onClick={handleResetClick}

          />

        </div>
      </div>
      <SearchStoreItemDetail handleEdit={handleEdit} />
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

      {showImportDialog && (
        <Dialog
          visible={showImportDialog}
          className={theme}
          header={<span style={{ fontSize: "14px" }}>Import Store Items</span>}
          onHide={() => { setShowImportDialog(false); setTemplateData([]); }}
          style={{ width: "90vw" }}
        >
          <div className="card-body p-0">
            {TemplateData.length > 0 ? (
              <div className="row p-2">
                <div className="col-12" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                  <Tables>
                    <thead>
                      <tr>
                        {Object.keys(TemplateData[0]).map((key, index) => (
                          <th key={index}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TemplateData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.keys(row).map((key, colIndex) => (
                            <td key={colIndex}>{row[key]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
                <div className="col-12 mt-2 d-flex justify-content-end">
                  {load.save ? (
                    <Loading />
                  ) : (
                    <SaveButton
                      text={t("Save Data")}
                      onClick={handleImportSave}
                      disabled={load.download || load.upload}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-3">No data found</div>
            )}
          </div>
        </Dialog>
      )}
    </>
  );
};

export default StoreItemMaster;
