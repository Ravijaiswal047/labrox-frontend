import React, { useEffect, useRef, useState } from "react";
import Input from "../../../components/formComponent/Input";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import { AutoComplete } from "primereact/autocomplete";
import Tables from "../../../components/UI/customTable";
import Heading from "../../../components/UI/Heading";
import RadioInput from "../../../components/formComponent/RadioInput";
import TransportedDetailModel from "./TransportedDetailModel";
import Modal from "../../../components/ModalComponent/Modal";
import { axiosInstance } from "../../../utils/axiosInstance";
import { toast } from "react-toastify";
import {
  getBindCentreType,
  getBindCountry,
  getBindstate,
} from "../../../utils/NetworkApi/commonApi";
import { CustomButton } from "../../../components/UI/CustomButton";

const DirectStockTransfer = () => {
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});
  const currentLocationRef = useRef(null);
  const itemRef = useRef(null);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  console.log(tableData, "tableData")
  const [manufacturerItemId, setManufacturerItemId] = useState(null);
  const initialState = {
    TransferToLocation: "",
    CentreType: "",
    CountryId: "",
    StateId: "",
    CentreId: "",
    TransferToLocation: "0",
    Barcode: "",
    Category: "",
    SearchOption: "1",
    SearchBy: "1",
    manufactureID: "",
    MachineID: "",
    MachineID: "",
    PackSize: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [DropDownList, setDropDownList] = useState({
    curentlocation: [],
    tolocation: [],
    centretypebind: [],
    countrybind: [],
    statebind: [],
    centrebind: [],
    category: [],
    bindmanufacture: [],
    bindmachine: [],
    bindpacksize: [],
  });

  const handlePayloadMultiSelectNumbers = (data) => {
    console.log(data);
    if (!Array.isArray(data)) return "";
    return data.map((item) => Number(item?.code)).join(",");
  };

  const normalizeNumberArray = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => Number(item?.code ?? item))
        .filter((item) => !Number.isNaN(item));
    }

    if (value === "" || value === null || value === undefined) {
      return [];
    }

    return String(value)
      .split(",")
      .map((item) => Number(item))
      .filter((item) => !Number.isNaN(item));
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
  const SearchOptionList = [
    { label: "By First Name", value: "0" },
    { label: "In Between", value: "1" },
    { label: "By Item Code", value: "2" },
    { label: "By Catalog No", value: "3" },
  ];
  const SearchByList = [
    { label: "Item", value: "0" },
    { label: "Package", value: "1" },
  ];
  const dispatchList = [
    { label: "Courier", value: "Courier" },
    { label: "FieldBoy", value: "FieldBoy" },
  ];
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

  const GetBindCurrentLocaton = () => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindalldata", { locationIds: [21, 22] })
      .then((res) => {
        const response = res?.data?.message;
        console.log(response)
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
        }));
        setDropDownList((prev) => ({ ...prev, curentlocation: newRes }));
      })
      .catch(() => console.log("Something went wrong"));
  };
  const getBindToLocation = (locationId, type, country, state, centre) => {
    axiosInstance
      .post("DirectStockTransfer/GetIndentFromLocation", {
        toLocation: String(locationId || "").split("#")[0],
        typeId: normalizeNumberArray(type),
        countryId: country ? country : "",
        stateId: normalizeNumberArray(state),
        panelId: centre ? centre : "",
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
      .catch(() => console.log("Something went wrong"));
  };
  const handleSelectChange = (name, value) => {
    if (name === "CurrentLocation") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      getBindToLocation(value?.value, "", "", "", "", (data) => {
        setDropDownList((prev) => ({ ...prev, tolocation: data }));
      });
    } else if (name === "CountryId") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      getBindstate(value?.value, "", (data) => {
        setDropDownList((prev) => ({ ...prev, statebind: data }));
      });
      getBindCentreNew(
        handlePayloadMultiSelectNumbers(payload?.CentreType),
        String(value?.value),
        "",
        (data) => {
          setDropDownList((prev) => ({ ...prev, centrebind: data }));
        }
      );
      getBindToLocation(
        String(payload?.CurrentLocation),
        handlePayloadMultiSelectNumbers(payload?.CentreType),
        String(value?.value),
        "",
        "",
        (data) => {
          setDropDownList((prev) => ({ ...prev, tolocation: data }));
        }
      );
    } else if (name === "CentreId") {
      console.log("jhdahsdadjsh");
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      getBindToLocation(
        String(payload?.CurrentLocation),
        handlePayloadMultiSelectNumbers(payload?.CentreType),
        String(payload?.CountryId),
        handlePayloadMultiSelectNumbers(payload?.StateId),
        String(value?.value),
        (data) => {
          setDropDownList((prev) => ({ ...prev, tolocation: data }));
        }
      );
    } else {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    }
  };
  const handleSelectMultiChange = (name, select) => {
    const val = select?.map((ele) => ele?.code);
    if (name === "CentreType") {
      const val = select?.map((ele) => ele?.code);
      setPayload((prev) => ({ ...prev, [name]: select }));
      getBindCentreNew(
        handlePayloadMultiSelectNumbers(select),
        String(payload?.CountryId || ""),
        handlePayloadMultiSelectNumbers(payload?.StateId),
        (data) => {
          setDropDownList((prev) => ({ ...prev, centrebind: data }));
        }
      );
      getBindToLocation(
        String(payload?.CurrentLocation),
        normalizeNumberArray(select),
        "",
        "",
        "",
        (data) => {
          setDropDownList((prev) => ({ ...prev, tolocation: data }));
        }
      );
    } else if (name === "StateId") {
      const val = select?.map((ele) => ele?.code);
      setPayload((prev) => ({ ...prev, [name]: select }));
      getBindCentreNew(
        handlePayloadMultiSelectNumbers(payload?.CentreType),
        String(payload?.CountryId),
        handlePayloadMultiSelectNumbers(select),

        (data) => {
          setDropDownList((prev) => ({ ...prev, centrebind: data }));
        }
      );
      getBindToLocation(
        String(payload?.CurrentLocation),
        normalizeNumberArray(payload?.CentreType),
        String(payload?.CountryId),
        handlePayloadMultiSelectNumbers(select),
        "",
        (data) => {
          setDropDownList((prev) => ({ ...prev, tolocation: data }));
        }
      );
    } else {
      setPayload((prev) => ({ ...prev, [name]: val }));
    }
  };
  const getBindCentreNew = (typeId, CountryID, stateId) => {
    if (!CountryID || !stateId) {
      setDropDownList((prev) => ({ ...prev, centrebind: [] }));
      return;
    }

    axiosInstance
      .get("DirectStockTransfer/bindCentre", {
        params: {
          typeId: typeId ? typeId : "",
          CountryID: CountryID ? CountryID : "",
          stateId: stateId ? stateId : "",
        },
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.centre,
          value: ele?.centreID,
        }));
        setDropDownList((prev) => ({ ...prev, centrebind: newRes }));
      })
      .catch(() => console.log("Something went wrong"));
  };
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
  useEffect(() => {
    GetBindCurrentLocaton();
    Bindcategorytypes();
    getBindCentreType((data) => {
      setDropDownList((prev) => ({ ...prev, centretypebind: data }));
    });

    getBindCountry((data) => {
      setDropDownList((prev) => ({ ...prev, countrybind: data }));
    });
  }, []);

  const Bindmanufacturers = (val) => {
    axiosInstance
      .get("DirectStockTransfer/bindManufacturer", {
        params: {
          // locationidfrom: String(payload?.CurrentLocation) || "",
          itemIDGroup: String(val) || "",
          // locationidto: String(payload?.TransferToLocation) || "0",
        },
      })
      .then((res) => {
        const response = res?.data?.message;


        console.log("Bindmanufacturers", res?.data)
        const newRes = response?.map((ele) => ({
          label: ele?.manufactureName,
          value: ele?.manufactureID,
        }));
        setDropDownList((prev) => ({
          ...prev,
          bindmanufacture: newRes,
        }));

        if (response?.length > 0) {
          setPayload((prev) => ({
            ...prev,
            manufactureID: String(response[0]?.manufactureID) || "",
          }));
          setManufacturerItemId(response?.[0]?.itemid);
        }
      })
      .catch(() => console.log("Something went wrong"));
  };

  const BindMachine = (val) => {
    axiosInstance
      .get("DirectStockTransfer/bindMachine", {
        params: {
          itemIDGroup: Number(payload?.ItemID) || 0,
          manufactureID: Number(val) || 0,
        },
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
      .get("DirectStockTransfer/bindPackSize", {
        params: {
          itemIDGroup: Number(payload?.ItemID) || 0,
          manufactureID: Number(payload?.manufactureID) || 0,
          machineID: Number(val) || 0,
        },
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
          setPayload((prev) => ({
            ...prev,
            PackSize: String(response[0]?.packValue) || "",
          }));
        }
      })
      .catch(() => console.log("Something went wrong"));
  };
  const searchItems = (query) => {
    const searchText = String(query || "").trim();
    if (!searchText) {
      setStockSuggestions([]);
      return;
    }
    if (!payload?.Category) {
      setStockSuggestions([]);
      return;
    }

    axiosInstance
      .get("DirectStockTransfer/SearchItem", {
        params: {
          ItemName: searchText,
          LocationIdFrom: String(payload?.CurrentLocation) || "",
          LocationIdTo: String(payload?.TransferToLocation) || "0",
          ItemCate: String(payload?.Category) || "",
          SearchOption: String(payload?.SearchOption) || "",
          SearchOptionFPackage: String(payload?.SearchBy) || "",
        },
      })
      .then((res) => {
        const response = res?.data?.message;
        console.log(res);
        setStockSuggestions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleAutoCompleteSelect = (e) => {
    const selected = e.value;
    setPayload((prev) => ({
      ...prev,
      ItemName: selected?.packageName || selected,
      ItemID: selected?.id || selected,
      StockID: selected?.stockId ?? selected?.stockID ?? selected?.StockID ?? "",
      packageData: selected?.packageData === 0 ? 0 : selected?.packageData,
    }));
    Bindmanufacturers(selected?.id);
  };

  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.packageName : e.value;
    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({ ...prev, ItemName: val }));
  };
  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.packageName}
      </div>
    </div>
  );

  const handleIssueQtyChange = (e, index) => {
    const value = e.target.value;
    const currentRow = tableData?.[index];
    const availableQty = Number(currentRow?.availableQty || 0);
    const issueQty = Number(value);

    if (value !== "" && !Number.isFinite(issueQty)) {
      toast.error("Please enter issue qty");
      setTableData((prev) =>
        prev.map((row, i) => (i === index ? { ...row, issueQty: "" } : row))
      );
      return;
    }

    if (
      value !== "" &&
      (!Number.isFinite(availableQty) || issueQty > availableQty)
    ) {
      toast.error("Issue Qty cannot be greater than Available Qty");
    }

    setTableData((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, issueQty: value } : row
      )
    );
  };

  const handleAdd = () => {
    axiosInstance
      .get("DirectStockTransfer/SearchItemDetail", {
        params: {
          itemid: manufacturerItemId ? Number(manufacturerItemId) : "",
          location: String(payload?.CurrentLocation) || "",
          tolocation:
            payload?.TransferToLocation === "0"
              ? ""
              : String(payload?.TransferToLocation || ""),
          packageID: String(payload?.Category) || "",
          barcodeno: String(payload?.Barcode) || "",
          stockid: String(payload?.StockID || ""),
        },
      })
      .then((res) => {
        const response = res?.data?.data;
        const rows = Array.isArray(response)
          ? response.map((item) => ({
            ...item,
            stockId: item?.stockId ?? item?.stockID ?? item?.StockID ?? "",
            barcodeno: item?.barcodeNo || "",
            availableQty: item?.avilableQty || "0",
            consumeUnit: item?.minorUnit || "",
            monthlyAverageConsumption: item?.monthAvg || "0",
            issueQty: item?.issueMultiplier || "",
          }))
          : [];

        setTableData((prev) => {
          const newRows = rows.filter(
            (row) => {
              const rowItemId = row?.itemId ?? row?.ItemId ?? row?.ItemID ?? "";

              return !prev.some((existing) => {
                const existingItemId =
                  existing?.itemId ?? existing?.ItemId ?? existing?.ItemID ?? "";

                return String(existingItemId) === String(rowItemId);
              });
            }
          );



          return [...prev, ...newRows];
        });

        console.log(res);
        setStockSuggestions([]);
        if (res?.data?.success === false || !response?.length) {
          toast.error(res?.data?.message || "Error Occurred");
          return;
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleRemove = (index) => {
    setTableData((prev) => prev.filter((_, i) => i !== index));
  };

  const resetDirectStockTransferForm = () => {
    setPayload(initialState);
    setErrors({});
    setAutoCompleteVal("");
    setStockSuggestions([]);
    setTableData([]);
    setManufacturerItemId(null);
    setDropDownList((prev) => ({
      ...prev,
      tolocation: [],
      statebind: [],
      centrebind: [],
      bindmanufacture: [],
      bindmachine: [],
      bindpacksize: [],
    }));
  };

  const handleSave = () => {
    if (isSaving) {
      return;
    }

    if (tableData?.length === 0) {
      toast.error("Please add item");
      return;
    }

    const invalidQty = tableData.some((row) => {
      const issueQty = Number(row?.issueQty);

      return (
        row?.issueQty === "" ||
        row?.issueQty === null ||
        row?.issueQty === undefined ||
        !Number.isFinite(issueQty) ||
        issueQty < 0
      );
    });
    if (invalidQty) {
      toast.error("Please enter issue qty");
      return;
    }

    const invalidAvailableQty = tableData.some((row) => {
      const issueQty = Number(row?.issueQty);
      const availableQty = Number(row?.availableQty || 0);

      return !Number.isFinite(availableQty) || issueQty > availableQty;
    });
    if (invalidAvailableQty) {
      toast.error("Issue Qty cannot be greater than Available Qty");
      return;
    }

    const requestBody = {
      dataToSave: tableData.map((row) => {
        const stockId = row?.stockId ?? row?.stockID ?? row?.StockID ?? "";
        const itemId = row?.itemId ?? row?.ItemId ?? row?.ItemID ?? "";
        const fromLocation = String(payload?.CurrentLocation || "").split("#")[0];
        const fromPanel = String(payload?.CurrentLocation || "").split("#")[1] || "";

        return `${stockId}#${itemId}#${row?.issueQty || ""}#${fromLocation}#${fromPanel}`;
      }),
      narration: payload?.Narration || "",
      transportDetails: [
        {
          transportName: "",
          docketNo: "",
          vehicleNo: "",
          driverName: "",
          driverMobile: "",
          dispatchDate: "",
        },
      ],
      deliveryAddress: payload?.DelivaryAddress || "",
      type: "",
    };

    setIsSaving(true);

    axiosInstance
      .post("DirectStockTransfer/SaveDirectStockTransfer", requestBody)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Saved Successfully");
          resetDirectStockTransferForm();
        } else {
          toast.error(res?.data?.message || "Save failed");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      })
      .finally(() => {
        setIsSaving(false);
      });
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

  console.log(payload);
  return (
    <>
      <Accordion
        name={t("Direct Issue")}
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
            />
            {errors?.CurrentLocation && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.CurrentLocation}
              </div>
            )}
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
            {/* {errors?.StateId && touched?.StateId && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.StateId}
              </div>
            )} */}
          </div>

          <ReactSelect
            name="CentreId"
            id="CentreId"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.centrebind}
            placeholderName="Centre"
            value={payload?.CentreId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="TransferToLocation"
            id="TransferToLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.tolocation}
            placeholderName="Transfer To Location"
            value={payload?.TransferToLocation}
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
          <ReactSelect
            name="SearchBy"
            id="SearchBy"
            removeIsClearable={true}
            dynamicOptions={SearchByList}
            placeholderName="Search By"
            value={payload?.SearchBy}
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
              onChange={handleSelectChange}
              className={"required-fields"}
            />
            {errors?.Category && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.Category}
              </div>
            )}
          </div>
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              field="packageName"
              completeMethod={(e) => searchItems(e.query)}
              className="w-100 required-fields"
              onSelect={handleAutoCompleteSelect}
              id="empName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
              ref={itemRef}
            />
            <label htmlFor={"searchtest"} className="lable searchtest">
              Items
            </label>
          </div>
          <ReactSelect
            name="manufactureID"
            id="manufactureID"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.bindmanufacture}
            placeholderName="Manufacturer"
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
          <Input
            type="text"
            placeholder=" "
            lable="Barcode"
            id="Barcode"
            name="Barcode"
            value={payload?.Barcode}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          {/* <div className="p-2"> */}

          <CustomButton text={"Add"} onClick={handleAdd} icon={"add"}
          />
          {/* <CustomButton text={"Transported DetailAdd"}
            className="ml-2" onClick={() =>
              handleModel(
                "Transported Detail",
                "60vw",
                "Transported Detail",
                true,
                <TransportedDetailModel
                  handleChangeModel={handleChangeModel}
                />
              )
            } icon={"forword"} /> */}
          {/* <button
              className="btn btn-sm btn-success ml-2"
            
            >                                              
              Transported Detail
            </button> */}
          {/* </div> */}
        </div>
        <Heading title={"Selected Item To Issue"} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("ItemId")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Batch Number")}</th>
                  <th>{t("Expiry Date")}</th>
                  <th>{t("Barcodeno")}</th>
                  <th>{t("Avilable Qty")}</th>
                  <th>{t("Consume Unit")}</th>
                  <th>{t("Unit Price")}</th>
                  <th>{t("Issue Qty")}</th>
                  <th>{t("Monthly Average Consumption")}</th>
                  <th>{t("Remove")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="#">{index + 1}</td>
                    <td data-title="ItemId">{row?.itemId}</td>
                    <td data-title="Item Name">{row?.itemName}</td>
                    <td data-title="Batch Number">{row?.batchNumber}</td>
                    <td data-title="Expiry Date">{row?.expiryDate}</td>
                    <td data-title="Barcodeno">{row?.barcodeno}</td>
                    <td data-title="Avilable Qty">{row?.availableQty}</td>
                    <td data-title="Consume Unit">{row?.consumeUnit}</td>
                    <td data-title="Unit Price">{row?.unitPrice}</td>
                    <td data-title="Issue Qty">
                      <input
                        type="number"
                        min="1"
                        max={row?.issueMultiplier ?? ""}
                        value={row?.issueQty}
                        onChange={(e) => handleIssueQtyChange(e, index)}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </td>
                    <td data-title="Monthly Average Consumption">
                      {row?.monthlyAverageConsumption}
                    </td>
                    <td data-title="Remove">
                      {/* <button onClick={() => handleRemove(index)}>❌</button> */}
                      <CustomButton onClick={() => handleRemove(index)} icon={"delete"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
        <div className="row p-2">
          <Input
            type="text"
            placeholder=" "
            lable="Total Value"
            id="Narration"
            name="TotalValue"
            value={payload?.TotalValue}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Narration"
            id="Narration"
            name="Narration"
            value={payload?.Narration}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Delivary Address"
            id="DelivaryAddress "
            name="DelivaryAddress"
            value={payload?.DelivaryAddress}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <RadioInput
            inputType="checkbox"
            label="Diffrent Delivary Address"
            id="DiffrentDelivaryAddress"
            name="DiffrentDelivaryAddress"
            checked={payload.DiffrentDelivaryAddress === "1"}
            onChange={handleChange}
            respclass={"pl-2"}
          />
          <div className="col-sm-1">
            <CustomButton text={"Save"} onClick={handleSave} icon={"save"} loading={isSaving}
            />

            {/* <button className="btn btn-sm btn-success" onClick={handleSave}>Save</button> */}
          </div>
        </div>

        {/* </div> */}
      </Accordion>
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
    </>
  );
};

export default DirectStockTransfer;
