import React, { useEffect, useState } from "react";
import Input from "../../../components/formComponent/Input";
import Accordion from "../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../components/formComponent/MultiSelctItems";
import { AutoComplete } from "primereact/autocomplete";
import Tables from "../../../components/UI/customTable";
import Heading from "../../../components/UI/Heading";
import RadioInput from "../../../components/formComponent/RadioInput";
import DatePicker from "../../../components/formComponent/DatePicker";
import { axiosInstance } from "../../../utils/axiosInstance";
import { CustomButton } from "../../../components/UI/CustomButton";


import {
  getBindCentreNew,
  getBindCentreType,
  getBindCity,
  getBindCountry,
  getBindstate,
  getCollectionBoy,
  GetZoneData
} from "../../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import IssueTableModal from "./IssueTableModal";
import moment from "moment";

const DirectIssue = () => {
  const { t } = useTranslation();
  const [IssueModal, setIssueModal] = useState(false);
  const [FieldBoyData, setFieldBoyData] = useState([]);

  const [DropDownList, setDropDownList] = useState({
    curentlocation: [],
    centretypebind: [],
    countrybind: [],
    statebind: [],
    citybind: [],
    centrebind: [],
    issuelocation: [],
    category: [],
    bindmanufacture: [],
    bindmachine: [],
    bindpacksize: [],
    itemdata: [],
    bindindentdetails: [],

  });

  const initialState = {
    CurrentLocation: "",
    CentreType: [],
    CountryId: "",
    BusinessZoneId: [],
    StateId: [],
    CentreId: "",
    IssueToLocation: "",
    Category: "",
    SupplierName: "",
    SearchOption: "0",
    Manufacturer: "",
    MachineID: "",
    PackSize: "",
    BarcodeNo: "",
    Narration: "",
    TotalValue: "",
    DelivaryAddress: "",
    FieldBoy: "",
    dispatchType: "Courier",
    TotalWeight: "",
    NoofBox: "",
    TotalValue: "",
    DispatchDate: new Date(),
    ConsignmentNote: "",
    Temperature: "",
    CourierName: "",
    AWBNumber: "",
    DelivaryAddress: "",
  };

  const [payload, setPayload] = useState(initialState);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");

  const [errors, setErrors] = useState({});
  const [tableData, setTableData] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
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

  // remove a row from the selected items table
  const handleRemove = (index) => {
    setTableData((prev) => prev.filter((_, i) => i !== index));
  };

  // update issue qty for a row in the selected items table
  const handleIssueQtyChange = (e, index) => {
    const value = e.target.value;
    setTableData((prev) =>
      prev.map((row, i) => (i === index ? { ...row, issueQty: value } : row))
    );
  };

  const resetForm = () => {
    setPayload(initialState);
    setErrors({});
    setAutoCompleteVal("");
    setStockSuggestions([]);
    setTableData([]);
  };

  const handleSave = () => {
    if (isSaving) return;

    if (tableData?.length === 0) {
      toast.error("Please add item");
      return;
    }

    // every row must have a valid issue qty
    const invalidQty = tableData.some((row) => {
      const issueQty = Number(row?.issueQty);
      return (
        row?.issueQty === "" ||
        row?.issueQty === null ||
        row?.issueQty === undefined ||
        !Number.isFinite(issueQty) ||
        issueQty <= 0
      );
    });
    if (invalidQty) {
      toast.error("Please enter issue qty");
      return;
    }

    // issue qty cannot exceed available qty
    const invalidAvailableQty = tableData.some((row) => {
      const issueQty = Number(row?.issueQty);
      const availableQty = Number(row?.availableQty || 0);
      return issueQty > availableQty;
    });
    if (invalidAvailableQty) {
      toast.error("Issue Qty cannot be greater than Available Qty");
      return;
    }
    const selectedFieldBoy = FieldBoyData?.find(
      (ele) => String(ele?.value) === String(payload?.FieldBoy)
    );

    const requestBody = {
      dataToSave: tableData.map((row) => ({
        stockId: row?.stockid ?? row?.stockID ?? row?.StockID ?? "",
        itemId: row?.itemId ?? row?.itemid ?? "",
        issueQty: Number(row?.issueQty),
        fromLocation: (payload?.CurrentLocation || 0).split("#")[0],
        fromPanel: (payload?.CurrentLocation || 0).split("#")[1],
      })),
      narration: payload?.Narration || "",
      dispatchOption: payload?.dispatchType || "",
      dispatchDate: moment(payload?.DispatchDate).format("YYYY-MM-DD"),
      courierName: payload?.CourierName || "",
      awbNumber: payload?.AWBNumber || "",
      fieldBoyID: payload?.FieldBoy || "",
      fieldBoyName: selectedFieldBoy?.label || "",
      otherName: "",
      noofBox: payload?.NoofBox || "",
      totalWeight: payload?.TotalWeight || "",
      consignmentNote: payload?.ConsignmentNote || "",
      temperature: payload?.Temperature || "",
      transportDetails: [],
      issueTo: String(payload?.IssueToLocation || ""),
      deliveryAddress: payload?.DelivaryAddress || "",
    };

    setIsSaving(true);
    axiosInstance
      .post("DirectIssue/savedirectissue", requestBody)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message || "Saved Successfully");
          resetForm();
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

  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => Number(item?.code));
  };


  const handleSelectMultiChange = (name, select) => {

    if (name === "BusinessZoneId") {

      setPayload((prev) => ({
        ...prev,
        BusinessZoneId: select,
        StateId: [],
        CityId: []
      }));

      getBindstate(
        payload?.CountryId,
        handlePayloadMultiSelectNumbers(select),
        (data) => {
          setDropDownList((prev) => ({
            ...prev,
            statebind: data,
          }));
        }
      );

    }
    if (name === "CentreType") {
      setPayload((prev) => ({ ...prev, [name]: select }));
      getBindCentreNew(
        [],
        handlePayloadMultiSelectNumbers(select),
        payload?.StoreNotCreated,
        (data) => {
          setDropDownList((prev) => ({ ...prev, centrebind: data }));
        }
      );
    }
    if (name === "StateId") {
      setPayload((prev) => ({
        ...prev,
        StateId: select,

      }));

    }
  };

  const handleSelectChange = (name, value) => {
    const selectedValue = value?.value || "";
    if (name === "CountryId") {
      setPayload((prev) => ({
        ...prev,
        CountryId: selectedValue,
        StateId: [],
        CentreId: ""
      }));

      GetZoneData(selectedValue, (data) => {
        setDropDownList((prev) => ({
          ...prev,
          BusinessZoneId: data,
          statebind: [],
          citybind: []
        }));
      });

    } else if (name === "IssueToLocation") {

      setPayload((prev) => ({
        ...prev,
        IssueToLocation: selectedValue,
        // storeLocationAddress: value?.storeLocationAddress || "",
        DelivaryAddress: value?.storeLocationAddress || ""
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

  const Bindmanufacturers = (val) => {
    axiosInstance
      .get("StoreCreateSalesIndent/manufacturers", {
        params: {
          locationId: String(payload?.CurrentLocation || "").split("#")[0],
          itemIDGroup: String(val) || "",
        },
      })
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.manufactureName,
          value: ele?.manufactureID,
          itemID:
            ele?.itemId
        }));
        setDropDownList((prev) => ({
          ...prev,
          bindmanufacture: newRes,
        }));

        if (response?.length > 0) {
          const selectedItemID =
            response[0]?.itemID ??
            response[0]?.itemId ??
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
        manufactureID: Number(payload.Manufacturer) || 0,
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
        manufactureID: Number(payload?.Manufacturer) || 0,
        machineID: Number(val) || 0,
        IndentType: "",
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

    setErrors((prev) => ({
      ...prev,
      ItemID: "",
    }));
  };

  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.itemNameGroup}
      </div>
    </div>
  );


  const searchItems = (query) => {
    axiosInstance
      .post("StoreCreateSalesIndent/SearchItem", {
        itemName: String(query),
        locationIdFrom: String(payload?.CurrentLocation) || "",
        locationIdTo: String(payload?.IssueToLocation) || "",
        itemCategory: String(payload?.Category) || "",
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

  const GetBindIssueToLocation = (location) => {
    axiosInstance
      .get(`DirectIssue/bindindentfromlocation1?toLocation=${location}`)
      .then((res) => {
        const response = res?.data;
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
          storeLocationAddress: ele?.storeLocationAddress,
        }));
        setDropDownList((prev) => ({ ...prev, issuelocation: newRes }));
      })
      .catch(() => console.log("Something went wrong"));
  };

  const Bindcategorytypes = () => {
    axiosInstance
      .get("DirectIssue/load")
      .then((res) => {
        const newRes = res?.data?.categoryTypes?.map((ele) => ({
          label: ele?.name,
          value: ele?.id,
        }));

        setDropDownList((prev) => ({
          ...prev,
          category: newRes,
        }));

        if (!res?.data?.hasApprovalRight) {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message || "Something went wrong"
        );
      });
  };

  const GetItemData = () => {
    if (!payload?.CurrentLocation) {
      toast.error("Please Select Current Location");
      return
    }
    if (!payload?.ItemID) {
      toast.error("Please Select Item");
      return
    }
    axiosInstance
      .post("DirectIssue/searchitemdetail", {
        itemId: String(payload?.ItemIDData) || "",
        location: String(payload?.CurrentLocation) || "",
        issueLocation: String(payload?.IssueToLocation) || "",
        packageID: "",
        barcodeNo: payload?.BarcodeNo,
      })
      .then((res) => {
        const response = res?.data.data;
        setDropDownList((prev) => ({ ...prev, itemdata: response }));
        if (response?.length > 0) {
          setIssueModal(true);
        } else {
          toast.error("No data found");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      })
  }


  useEffect(() => {
    GetBindCurrentLocaton();
    Bindcategorytypes();
    getCollectionBoy(setFieldBoyData, true);
  }, []);

  useEffect(() => {
    if (payload?.CurrentLocation && payload?.Manufacturer) {
      BindMachine(payload?.CurrentLocation && payload?.Manufacturer);
    }
  }, [payload?.CurrentLocation, payload?.Manufacturer]);

  useEffect(() => {
    if (payload?.CurrentLocation && payload?.MachineID) {
      BindPackSize(payload?.CurrentLocation && payload?.MachineID);
    }
  }, [payload?.CurrentLocation, payload?.MachineID]);

  useEffect(() => {
    if (payload?.CurrentLocation) {
      GetBindIssueToLocation(payload?.CurrentLocation);
    }
  }, [payload?.CurrentLocation]);

  useEffect(() => {
    getBindCentreType((data) => {
      setDropDownList((prev) => ({ ...prev, centretypebind: data }));
    });
    getBindCountry((data) => {
      setDropDownList((prev) => ({ ...prev, countrybind: data }));
    });
  }, []);

  // recalculate Total Value = sum(UnitPrice * IssueQty) whenever the table changes
  useEffect(() => {
    const finalAmt = tableData.reduce(
      (sum, row) =>
        sum + (Number(row?.unitPrice) || 0) * (Number(row?.issueQty) || 0),
      0
    );
    setPayload((prev) => ({
      ...prev,
      TotalValue: Number(finalAmt.toFixed(5)),
    }));
  }, [tableData]);




  return (
    <>
      {IssueModal && (
        <IssueTableModal
          show={IssueModal}
          onHandleShow={() => setIssueModal(false)}
          data={DropDownList?.itemdata}
          onAddItems={(items, mode) =>
            setTableData((prev) =>
              mode === "replace" ? items : [...prev, ...items]
            )
          }
        />
      )}

      <Accordion
        name={t("Direct Issue")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.curentlocation}
            placeholderName="Current Location"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
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
            />
          </div>
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
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="BusinessZone"
              name="BusinessZoneId"
              values={payload}
              setValues={setPayload}
              dynamicOptions={DropDownList?.BusinessZoneId}
              labelKey="BusinessZoneName"
              valueKey="BusinessZoneID"
              handleChange={handleSelectMultiChange}

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

            />
          </div>

          <ReactSelect
            name="CentreId"
            id="CentreId"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.centrebind?.map((ele) => ({
              label: ele?.centre,
              value: ele?.centreID,
            }))}
            placeholderName="Centre"
            value={payload?.CentreId}
            onChange={handleSelectChange}
            className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="IssueToLocation"
            id="IssueToLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.issuelocation}
            placeholderName="Issue To Location"
            value={payload?.IssueToLocation}
            onChange={handleSelectChange}
            className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="Category"
            id="Category"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.category}
            placeholderName="Category"
            value={payload?.Category}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
            onChange={handleSelectChange}
            className={"required-fields"}
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
          {/* <ReactSelect
            name="SearchBy"
            id="SearchBy"
            removeIsClearable={true}
            dynamicOptions={SearchByList}
            placeholderName="Search By"
            value={payload?.SearchBy}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}
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
            {/* {errors?.ItemID && (
              <div className="text-danger" style={{ fontSize: "12px" }}>
                {errors?.ItemID}
              </div>
            )} */}
          </div>
          <ReactSelect
            name="Manufacturer"
            id="Manufacturer"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.bindmanufacture}
            placeholderName="Manufacturer"
            value={payload?.Manufacturer}
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
            id="BarcodeNo"
            name="BarcodeNo"
            value={payload?.BarcodeNo}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                GetItemData();
              }
            }}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <CustomButton text={"Add Item"} icon={"add"} onClick={GetItemData} />
        </div>
        <Heading title={"Selected Item To Issue"} />
        <div className="row">
          <div className="col-sm-12">
            <Tables tableHeight="direct-issue-item-table">
              <thead style={{ position: "sticky", top: -1, zIndex: 99 }}>
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

                      {row?.issueQty}
                    </td>
                    <td data-title="Monthly Average Consumption">
                      {row?.monthlyAverageConsumption}
                    </td>
                    <td data-title="Remove">
                      <span onClick={() => handleRemove(index)}>
                        <i class="bi bi-trash-fill" />
                      </span>
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
            id="TotalValue"
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
        </div>
        <Heading
          title={
            <>
              Dispatch Details
              <span
                style={{ fontSize: "10px", color: "red", fontStyle: "italic" }}
              >
                * You can enter dispatch detail if you want
              </span>
            </>
          }
        />

        <div className="row p-2">
          <ReactSelect
            name="dispatchType"
            id="dispatchType"
            removeIsClearable={true}
            dynamicOptions={dispatchList}
            placeholderName="Dispatch Type"
            value={payload?.dispatchType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="No of Box"
            id="NoofBox"
            name="NoofBox"
            value={payload?.NoofBox}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Total Weight"
            id="TotalWeight"
            name="TotalWeight"
            value={payload?.TotalWeight}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="DispatchDate"
            id="DispatchDate"
            value={payload?.DispatchDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Dispatch Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Consignment Note"
            id="ConsignmentNote"
            name="ConsignmentNote"
            value={payload?.ConsignmentNote}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Temperature"
            id="Temperature"
            name="Temperature"
            value={payload?.Temperature}
            maxLength={4}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          {payload?.dispatchType === "Courier" ? (
            <>
              <Input
                type="text"
                placeholder=" "
                lable="Courier Name"
                id="CourierName"
                name="CourierName"
                value={payload?.CourierName}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              />

              <Input
                type="text"
                placeholder=" "
                lable="AWB Number"
                id="AWBNumber"
                name="AWBNumber"
                value={payload?.AWBNumber}
                onChange={handleChange}
                respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
              />
            </>
          ) : (
            <ReactSelect
              name="FieldBoy"
              id="FieldBoy"
              removeIsClearable={true}
              dynamicOptions={FieldBoyData}
              placeholderName="FieldBoy"
              value={payload?.FieldBoy}
              onChange={handleSelectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
          )}
          <Input
            type="text"
            placeholder=" "
            lable="Delivary Address"
            id="DelivaryAddress "
            name="DelivaryAddress"
            value={payload?.DelivaryAddress}
            onChange={handleChange}
            disabled={true}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <div className="col-sm-1 d-flex">
            <CustomButton
              text={isSaving ? "Saving..." : "Save"}
              icon={"save"}
              className="btn btn-sm btn-success"
              onClick={() => handleSave()}
              disabled={isSaving}
            />
            {/* {isSaving ? "Saving..." : "Save"}
            </CustomButton> */}
            <CustomButton
              text="Reset"
              icon={"refresh"}
              className="btn btn-sm btn-success ml-2"
              onClick={() => resetForm()}
            />
            {/* Reset
            </CustomButton> */}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DirectIssue;
