import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { BindItem } from "../../networkServices/BillingsApi";
import { BindItemGRN } from "../../networkServices/InventoryApi";
import { AutoComplete } from "primereact/autocomplete";
import { notify } from "../../utils/utils";
import { PharmacyMedicineItemSearch } from "../../networkServices/pharmecy";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SearchByMedicine = ({
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
  requiredClassName,
}) => {
  const [t] = useTranslation();
  const [value, setValue] = useState("");
  const [items, setItems] = useState([]);
  const [itemsList, setItemList] = useState([]);
  // console.log("ItemList" , itemsList)
  const userData = useLocalStorage("userData", "get");

  const getbindIPDPatientDetails = async (value) => {
    if (callfrom == "GRN" || callfrom == "Con") {
      if (storeLedgerNo == "") {
        return notify("Please Select Store.", "error");
      }
      console.log("payload", payload);
      const payLoadList = {
        itemName: value,
        storeTypeID: storeLedgerNo?.value,
        isConsignment: callfrom == "Con" ? isConsignment : "0",
      };
      // console.log("Pyaload List" , payLoadList);
      try {
        const response = await BindItemGRN(payLoadList);
        // console.log("Response from GRN LIST" , response);
        // setItems(response?.data)
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
      debugger;
      let payload = {
        /* cmd: "item",
        type: "1",
        deptLedgerNo: userData?.deptLedgerNo,
        q: value,
        page: "1",
        rows: 20,
        sort: "ItemName",
        order: "asc",
        isWithAlternate: false,
        isBarCodeScan: false, */
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
        // type: 0,
        // deptLedgerNo: "",
        // panelID: Number(pateintDetails?.PanelID),
        // subcategoryID: 0,
        // itemName: value,
        // canIndentMedicalConsumables: 0,
        // canIndentMedicalItems: 0,
        // rows: 1000,

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
        requestType: String(payload?.Type ? payload?.Type : "MI"),
        IsInternational: pateintDetails?.IsInternational
          ? pateintDetails?.IsInternational
          : "2",
      };
      try {
        const response = await BindItem(payLoadList);
        // console.log("Reponse from bindGRN LIST" , response)
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
    return (
      <div
        className="p-clearfix"
        // onClick={() => validateInvestigation(item, 0, 0, 1, 0)}
      >
        <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
          {(callfrom == "GRN" || callfrom == "Con"
            ? item?.ItemName
            : item?.TypeName) || item?.ItemName}
        </div>
      </div>
    );
  };

  // const handleSelectRow = (e) => {
  //   const { value } = e;
  //   handleItemSelect( (callfrom == "GRN" || callfrom == "Con"? value?.ItemName:value?.TypeName), value?.ItemID, value,e?.originalEvent?.type);
  //   setValue(null);

  // };

  const handleSelectRow = (e) => {
    const { value } = e;
    handleItemSelect(
      (callfrom == "GRN" || callfrom == "Con"
        ? value?.ItemName
        : value?.TypeName) || value?.ItemName,
      value?.ItemID,
      value,
      e?.originalEvent?.type,
      e,
      index,
    );
    setValue(null);
  };

  // const handlePressKey = (e) => {
  //   // console.log("first",e)
  //   console.log("Current input value:", value);
  //   if (e.key === "Enter" || e.keyCode === 13) {
  //     AddRowData({},e.target.value?.length);
  //   }
  // };

  return (
    <div className="row">
      <div className="col-12">
        {/* {console.log("first" , value , items , itemsList)} */}
        <AutoComplete
          value={
            callfrom == "GRN" || callfrom == "Con"
              ? value || itemName
              : value || itemName || ""
          }
          // value={"D3 MUST 15ML - MANKIND"}
          suggestions={items ? items : itemsList}
          completeMethod={search}
          // ref={ref}
          className={` w-100  ${(callfrom == "GRN" || callfrom == "Con") && "table-auto-complete table-auto-complete-custom"} ${requiredClassName ? requiredClassName : ""}`}
          onSelect={(e) => handleSelectRow(e)}
          id="searchtest"
          onChange={(e) => {
            const val = e?.value;
            setValue(
              val === null || val === undefined || val === "" ? [] : val,
            );
            if (handleItemSelect && typeof val === "string") {
              handleItemSelect(
                val,
                null,
                null,
                e?.originalEvent?.type,
                e,
                index,
              );
            }
          }}
          itemTemplate={itemTemplate}
          // onKeyDown={(e) => handlePressKey(e)}
          disabled={disabled}
        />
        {callfrom == "GRN" || callfrom == "Con" ? (
          <></>
        ) : (
          <label
            // htmlFor={id}
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

export default SearchByMedicine;
