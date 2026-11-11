import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BindItem } from "../../networkServices/BillingsApi";
import { BindItemGRN } from "../../networkServices/InventoryApi";
import { AssetGetItemList } from "../../networkServices/AssetAndEquipment";
import { AutoComplete } from "primereact/autocomplete";
import { notify } from "../../utils/utils";
import { PharmacyMedicineItemSearch } from "../../networkServices/pharmecy";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SearchByMedicineItemName = ({
  data,
  handleItemSelect,
  itemName,
  pateintDetails,
  payload,
  callfrom,
  storeLedgerNo,
  isConsignment,
  AddRowData,
  setIsExpirable,
  setValues,
  disabled,
  index,
  isMedSearch,
  isIndentMedicineSearch,
  saleOnList,
  isAvailQyantity,
}) => {
  const [t] = useTranslation();
  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);
  const [itemsList, setItemList] = useState([]);
  const userData = useLocalStorage("userData", "get");

  const getbindIPDPatientDetails = async (value) => {
    if (callfrom === "AssetGRN") {
      if (storeLedgerNo == "") {
        return notify("Please Select Store.", "error");
      }
      const payLoadList = {
        itemName: value,
        storeTypeID: storeLedgerNo?.value,
      };
      try {
        const response = await AssetGetItemList(payLoadList);
        setItemList(response?.data);
        setIsExpirable ? setIsExpirable(response?.data) : null;
        return response?.data;
      } catch (error) {
        console.log(error);
      }
    } else if (callfrom == "GRN" || callfrom == "Con") {
      if (storeLedgerNo == "") {
        return notify("Please Select Store.", "error");
      }
      const payLoadList = {
        itemName: value,
        storeTypeID: storeLedgerNo?.value,
        isConsignment: callfrom == "Con" ? isConsignment : "0",
      };
      try {
        const response = await BindItemGRN(payLoadList);
        setValues
          ? setValues((prevPayload) => ({
            ...prevPayload,
            ConversionFactor: response?.data?.[0]?.ConversionFactor,
          }))
          : null;
        setItemList(response?.data);
        setIsExpirable(response?.data);
        return response?.data;
      } catch (error) {
        console.log(error);
      }
    } else if (isMedSearch) {
      let payload = {
        cmd: "item",
        type: "1",
        deptLedgerNo: userData?.deptLedgerNo,
        q: value,
        page: "1",
        rows: 20,
        sort: "ItemName",
        order: "asc",
        isWithAlternate: false,
        isBarCodeScan: false,
        PanelId: pateintDetails?.Panel
          ? pateintDetails?.Panel
          : pateintDetails?.Panel?.value,
        isCashPanel: pateintDetails?.isCashPanel
          ? pateintDetails?.isCashPanel
          : 1,
        isPackage: 0,
      };
      try {
        let apiResp = await PharmacyMedicineItemSearch(payload);
        return apiResp?.data;
      } catch (error) {
        console.log(error);
      }
    } else if (isIndentMedicineSearch) {
      let payload = {
        searchBy: "1",
        itemName: value,
        saleOn: saleOnList?.[0]?.TextField ? saleOnList?.[0]?.TextField : "",
        PanelId: pateintDetails?.Panel
          ? pateintDetails?.Panel
          : pateintDetails?.Panel?.value,
        isCashPanel: pateintDetails?.isCashPanel
          ? pateintDetails?.isCashPanel
          : 1,
        isPackage: 0,
      };
      try {
        let apiResp = await PharmacyMedicineItemSearch(payload);
        return apiResp?.data;
      } catch (error) {
        console.log(error);
      }
    } else {
      const payLoadList = {
        scheduleChargeID: Number(
          pateintDetails?.ScheduleChargeID
            ? pateintDetails?.ScheduleChargeID
            : "",
        ),
        panelID: Number(pateintDetails?.PanelID ? pateintDetails?.PanelID : ""),
        ipdCaseTypeID: Number(
          pateintDetails?.IPDCaseTypeID ? pateintDetails?.IPDCaseTypeID : "",
        ),
        itemName: value,
        categoryID: Number(
          payload?.Category?.value ? payload?.Category?.value : "",
        ),
        subcategory: Number(
          payload?.SubCategoryID?.value ? payload?.SubCategoryID?.value : "",
        ),
        requestType: String(payload?.Type ? payload?.Type : ""),
        IsInternational: pateintDetails?.IsInternational
          ? pateintDetails?.IsInternational
          : "2",
        LedgerNumber: String(payload?.department) || "0",
      };
      try {
        const response = await BindItem(payLoadList);
        return response?.data;
      } catch (error) {
        console.log(error);
      }
    }
  };

  const search = async (event) => {
    const item = await getbindIPDPatientDetails(event?.query.trim());
    setItems(item);
  };

  const itemTemplate = (item) => {
    // CORRECTED: Ensure AvlQty is not null or empty string before checking if it's 0
    const isOutOfStock =
      isAvailQyantity &&
      item?.AvlQty != null &&
      item?.AvlQty !== "" &&
      Number(item?.AvlQty) === 0;

    return (
      <div
        className="p-clearfix"
        style={isOutOfStock ? { opacity: 0.5, pointerEvents: "none" } : {}}
      >
        <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
          {(callfrom == "GRN" || callfrom == "Con"
            ? item?.ItemName
            : item?.TypeName) || item?.ItemName}

          {isAvailQyantity && (
            <span
              style={{
                float: "right",
                fontSize: "10px",
                color: isOutOfStock ? "red" : "#888",
                fontWeight: isOutOfStock ? "bold" : "normal",
              }}
            >
              {item?.AvlQty}
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleSelectRow = (e) => {
    debugger
    const { value } = e;

    // CORRECTED: Fixed early return bug and null check issue
    if (payload?.Type === "MI") {
      if (
        isAvailQyantity &&
        value?.AvlQty != null &&
        value?.AvlQty !== "" &&
        Number(value?.AvlQty) === 0
      ) {
        notify("Item cannot be selected as Available Quantity is 0.", "error");
        setValue("");
        return; // Stops here ONLY if out of stock
      }
      // Removed the standalone `return` that was here, which prevented binding!
    }

    handleItemSelect(
      (callfrom == "AssetGRN"
        ? value?.Typename
        : callfrom == "GRN" || callfrom == "Con"
          ? value?.ItemName
          : value?.TypeName),
      value?.ItemID,
      value,
      e?.originalEvent?.type,
      e,
      index,
    );
    setValue(null);
  };

  return (
    <div className="row">
      <div className="col-12">
        <AutoComplete
          value={
            callfrom == "GRN" || callfrom == "Con"
              ? value
                ? value
                : itemName
              : value ?? itemName?.label
          }
          suggestions={items ? items : itemsList}
          completeMethod={search}
          className={` w-100 ${(callfrom == "GRN" || callfrom == "Con") && "table-auto-complete table-auto-complete-custom"}`}
          onSelect={(e) => handleSelectRow(e)}
          id="searchtest"
          onChange={(e) => {
            setValue(e?.value === undefined ? null : e?.value);
          }}
          itemTemplate={itemTemplate}
          disabled={disabled}
        />
        {callfrom == "GRN" || callfrom == "Con" || callfrom === "AssetGRN" ? (
          <></>
        ) : (
          <label
            className="label lable truncate "
            style={{ fontSize: "5px !important" }}
          >
            {t("Search Item")}
          </label>
        )}
      </div>
    </div>
  );
};

export default SearchByMedicineItemName;
