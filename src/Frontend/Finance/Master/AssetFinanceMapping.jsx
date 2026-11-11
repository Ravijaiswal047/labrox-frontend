import { useEffect, useState } from "react";
import Heading from "../../../components/UI/Heading";
import {
  BindAssetMappingScreenData,
  BindCentreWorkOrder,
  PrintAssetMappingAPI,
  SaveAssetMappingAPI,
  SaveConfiguration,
  SearchAssetMappingAPI,
} from "../../../NetworkServices/finance.js";
import { useTranslation } from "react-i18next";
import Tables from "../../../components/UI/customTable";
import CustomSelect from "../../../components/formComponent/CustomSelect";
import { notify, SaveAssetMappingPayload } from "../../../utils/ustil2";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";
import { ExcelIconSVG } from "../../../components/SvgIcons";
import { exportToExcel } from "../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../components/WrapTranslate";
import { filterByTypes, handleReactSelectDropDownOptions } from "../../utils/Utils";
import HisTable from "../../../components/UI/customTable/HisTable";
import { bindVoucherBillingScreenControls } from "../../../NetworkServices/Pettycash.js";

export default function AssetFinanceMapping() {
  const [t] = useTranslation();
  const [tableData, setTableData] = useState([]);
    const [centres, setCentres] = useState([]);
  const [dropDownState, setDropDownState] = useState({
    chartOfAccount: [],
    ItemList: [],
  });
  // const { GetEmployeeWiseCenter } = useSelector((state) => state?.CommonSlice);
  const userData = useLocalStorage("userData", "get");
  const [values, setValues] = useState({
    Centre: { value: userData?.MainCentreID},
  });

  const selectAll = (name, value, keyID) => {
    tableData?.forEach((item, index) => {
      item[keyID] = value?.value;
    });
    // debugger
    setTableData([...tableData]);
    // setValues((val) => ({ ...val, [name]: value?.value }));
  };
  //  const getPatientType = async () => {
  //     // debugger
  //     const resp = await BindCentreWorkOrder({ centreID: 0, rateTypeID: 0 })
  //     setCentres(resp?.message || []);
  //   };
  //   useEffect(() => {
  //     getPatientType();
  //   }, []);
  

  let thead = [
    {
      name: (
        <>
          {t("S.No.")}{" "}
          <input
            type="checkbox"
            className="table-checkbox"
            onChange={(e) =>
              selectAll("isChecked", { value: e?.target?.checked }, "isChecked")
            }
          />
        </>
      ),
      width: "1%",
    },
    { name: t("Item Name"), width: "3%" },
    {
      name: (
        // <div style={{ whiteSpace: "wrap" }}>
        <CustomSelect
          placeHolder={t("Department")}
          name="AllDepartment"
          onChange={(name, value) => {
            selectAll(name, value, "FinDeptCode");
          }}
          value={values?.AllDepartment}
          option={dropDownState?.Department}
        />
        // </div>
      ),
      // width: "10%",
    },
    {
      name: (
        // <div style={{ whiteSpace: "wrap" }}>
        <CustomSelect
          placeHolder={t("Purchase COA")}
          name="PurchaseCOA"
          onChange={(name, value) => {
            selectAll(name, value, "PurchaseCOAID");
          }}
          value={values?.PurchaseCOA}
          option={dropDownState?.PurchaseCOA}
        />
        // </div>
      ),
      // width: "1%",
    },
    {
      name: (
        <CustomSelect
          placeHolder={t("Opening DR")}
          name="OpeningDR"
          onChange={(name, value) => {
            selectAll(name, value, "OpeningCOAIDDr");
          }}
          value={values?.OpeningDR}
          option={dropDownState?.CRDR}
        />
      ),
      // width: "1%",
    },
    {
      name: (
        <CustomSelect
          placeHolder={t("Opening CR")}
          name="OpeningCR"
          onChange={(name, value) => {
            selectAll(name, value, "OpeningCOAIDCr");
          }}
          value={values?.OpeningCR}
          option={dropDownState?.CRDR}
        />
      ),
      // width: "1%",
    },
    {
      name: (
        <CustomSelect
          placeHolder={t("Acc. Depreciation Dr")}
          name="AccumulatedDepreciationDR"
          onChange={(name, value) => {
            selectAll(name, value, "AccDepreCOAIDDr");
          }}
          value={values?.AccumulatedDepreciationDR}
          option={dropDownState?.CRDR}
        />
      ),
      // width: "1%",
    },
    {
      name: (
        <CustomSelect
          placeHolder={t("Acc. Depreciation Cr")}
          name="AccumulatedDepreciationCR"
          onChange={(name, value) => {
            selectAll(name, value, "AccDepreCOAIDCr");
          }}
          value={values?.AccumulatedDepreciationCR}
          option={dropDownState?.CRDR}
        />
      ),
      // width: "1%",
    },
    {
      name: (
        <CustomSelect
          placeHolder={t("Monthly Dep Dr")}
          name="MonthlyDepDr"
          onChange={(name, value) => {
            selectAll(name, value, "MonthlyDepreCOAIDDr");
          }}
          value={values?.MonthlyDepDr}
          option={dropDownState?.TypeIDThree}
        />
      ),
      // width: "1%",
    },
    {
      name: (
        <CustomSelect
          placeHolder={t("Monthly Dep Cr")}
          name="MonthlyDepCr"
          onChange={(name, value) => {
            selectAll(name, value, "MonthlyDepreCOAIDCr");
          }}
          value={values?.MonthlyDepCr}
          option={dropDownState?.CRDR}
        />
      ),
      // width: "1%",
    },
  ];

  let SalesHead = [];
  if (values?.SaleHideshow) {
    SalesHead = [
      {
        name: (
          <CustomSelect
            placeHolder={t("Sale Asset Dr")}
            name="SaleAssetDr"
            onChange={(name, value) => {
              selectAll(name, value, "SaleAssetDr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.TypeIDThree}
          />
        ),
      },
      {
        name: (
          <CustomSelect
            placeHolder={t("Sale Asset Cr")}
            name="SaleAssetCr"
            onChange={(name, value) => {
              selectAll(name, value, "SaleAssetCr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.CRDR}
          />
        ),
      },
      {
        name: (
          <CustomSelect
            placeHolder={t("Sale Dep Dr")}
            name="SaleDepDr"
            onChange={(name, value) => {
              selectAll(name, value, "SaleDepDr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.CRDR}
          />
        ),
      },
      {
        name: (
          <CustomSelect
            placeHolder={t("Sale Dep Cr")}
            name="SaleDepCr"
            onChange={(name, value) => {
              selectAll(name, value, "SaleDepCr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.TypeIDThree}
          />
        ),
      },
      {
        name: (
          <CustomSelect
            placeHolder={t("Sale Sale Cr")}
            name="SaleSaleCr"
            onChange={(name, value) => {
              selectAll(name, value, "SaleSaleCr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.TypeIDThree}
          />
        ),
      },
    ];
  }

  let WriteOffHead = [];
  if (values?.WriteOffHideshow) {
    WriteOffHead = [
      {
        name: (
          <CustomSelect
            placeHolder={t("Write Off Asset Dr")}
            name="WriteOffAssetDr"
            onChange={(name, value) => {
              selectAll(name, value, "WriteOffAssetDr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.TypeIDThree}
          />
        ),
      },
      {
        name: (
          <CustomSelect
            placeHolder={t("Write Off Asset Cr")}
            name="WriteOffAssetCr"
            onChange={(name, value) => {
              selectAll(name, value, "WriteOffAssetCr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.CRDR}
          />
        ),
      },
      {
        name: (
          <CustomSelect
            placeHolder={t("Write Off Depre Dr")}
            name="WriteOffDepreDr"
            onChange={(name, value) => {
              selectAll(name, value, "WriteOffDepreDr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.TypeIDThree}
          />
        ),
      },
      {
        name: (
          <CustomSelect
            placeHolder={t("Write Off Depre Cr")}
            name="WriteOffDepreCr"
            onChange={(name, value) => {
              selectAll(name, value, "WriteOffDepreCr");
            }}
            value={values?.AllDepartment}
            option={dropDownState?.CRDR}
          />
        ),
      },
    ];
  }
  const handleReactChange = async (name, value) => {
    if(name==="Centre"){
      fetchData(value?.value)
    } 
    setValues((val) => ({ ...val, [name]: value }));
  };

  async function fetchData(CentreID) {
    const [reportControlData] = await Promise.all([
      BindAssetMappingScreenData((CentreID)),
    ]);  
    if (reportControlData?.success) {
      setDropDownState((val) => ({
        Department: filterByTypes(
          reportControlData?.data,
          [4],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        PurchaseCOA: filterByTypes(
          reportControlData?.data,
          [2],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        CRDR: filterByTypes(
          reportControlData?.data,
          [1],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        Subcategory: filterByTypes(
          reportControlData?.data,
          [6],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        ItemList: filterByTypes(
          reportControlData?.data,
          [7],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        TypeIDThree: filterByTypes(
          reportControlData?.data,
          [3],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
        centre: filterByTypes(
          reportControlData?.data,
          [3],
          ["TypeID"],
          "TextField",
          "ValueField"
        ),
      }));
      const SaleHideshow = filterByTypes(
        reportControlData?.data,
        [8],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      const WriteOffHideshow = filterByTypes(
        reportControlData?.data,
        [9],
        ["TypeID"],
        "TextField",
        "ValueField"
      );
      if (SaleHideshow?.length > 0 && WriteOffHideshow?.length > 0) {
        setValues((val) => ({
          ...val,
          SaleHideshow: Number(SaleHideshow[0]?.value),
          WriteOffHideshow: Number(WriteOffHideshow[0]?.value),
        }));
      }
    }
  }

  const getCentreAPI = async () => {

     let apiResp= await bindVoucherBillingScreenControls(1)
    //  debugger
     if(apiResp?.success){
       setCentres(filterByTypes(
          apiResp?.data,
          [14],
          ["TypeID"],
          "TextField",
          "ValueField"
        ));
     }
    
  }
  useEffect(() => {
    if(values?.Centre?.value){
      fetchData(values?.Centre?.value);
    }
    getCentreAPI()
  }, []);

  const handleValidate = (tData) => {
    const newData = JSON.parse(JSON.stringify(tData));
    let isNotiFy = false;
    newData
      ?.filter((item) => item?.isChecked)
      ?.map((item) => {
        if (Number(item?.OpeningCOAIDCr) === Number(item?.OpeningCOAIDDr)) {
          item.OpeningCOAIDcolor = "red";
          isNotiFy = true;
        } else {
          item.OpeningCOAIDcolor = "";
        }
        if (Number(item?.AccDepreCOAIDCr) === Number(item?.AccDepreCOAIDDr)) {
          item.AccDepreCOAIDcolor = "red";
          isNotiFy = true;
        } else {
          item.AccDepreCOAIDcolor = "";
        }

        if (
          Number(item?.MonthlyDepreCOAIDCr) ===
          Number(item?.MonthlyDepreCOAIDDr)
        ) {
          item.MonthlyDepreCOAIDcolor = "red";
          isNotiFy = true;
        } else {
          item.MonthlyDepreCOAIDcolor = "";
        }

        if (
          Number(item?.SaleAssetCr) === Number(item?.SaleAssetDr) &&
          values?.SaleHideshow
        ) {
          item.SaleAssetcolor = "red";
          isNotiFy = true;
        } else {
          item.SaleAssetcolor = "";
        }

        if (
          Number(item?.SaleDepreCr) === Number(item?.SaleDepreDr) &&
          values?.SaleHideshow
        ) {
          item.SaleDeprecolor = "red";
          isNotiFy = true;
        } else {
          item.SaleDeprecolor = "";
        }

        if (
          Number(item?.SaleSaleCr) === Number(item?.SaleSaleDr) &&
          values?.SaleHideshow
        ) {
          item.SaleSalecolor = "red";
          isNotiFy = true;
        } else {
          item.SaleSalecolor = "";
        }

        if (
          Number(item?.WriteOffAssetCr) === Number(item?.WriteOffAssetDr) &&
          values?.WriteOffHideshow
        ) {
          item.WriteOffAssetcolor = "red";
          isNotiFy = true;
        } else {
          item.WriteOffAssetcolor = "";
        }

        if (
          Number(item?.WriteOffDepreCr) === Number(item?.WriteOffDepreDr) &&
          values?.WriteOffHideshow
        ) {
          item.WriteOffDeprecolor = "red";
          isNotiFy = true;
        } else {
          item.WriteOffDeprecolor = "";
        }

        return item;
      });

    if (isNotiFy) {
      notify("CR and DR can not be same", "error");
    }
    setTableData(newData);
    return isNotiFy;
  };

  const handleSave = async () => {
    if (!tableData?.find((val) => val?.isChecked)) {
      notify("Please select at least one row", "error");
      return;
    }
    const isValidate = handleValidate(tableData);
    if (isValidate) return;
    // return;
    const payload = SaveAssetMappingPayload(tableData, values);
    const apiResp = await SaveAssetMappingAPI(payload);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      fetchData(values?.Centre?.value);
      handleSearch();
    } else {
      notify(apiResp?.message, "error");
    }
  };
  const handleMultiSelectChange = (name, selectedOptions) => {
    setValues((val) => ({ ...val, [name]: selectedOptions }));
  };
  const handleChangeSelectBox = (index, name, value) => {
    const data = [...tableData];
    data[index][name] = value;
    setTableData(data);
  };

  const handleSearch = async () => {
    if (!values?.Subcategory?.value) {
      notify("Please select Subcategory", "error");
      return;
    }
    const payload = {
      SubcategoryID: Number(values?.Subcategory?.value || 0),
      CentreID: Number(values?.Centre?.value || 0),
      ItemID: values?.ItemName?.map((val) => val?.code)?.join(",") || "",
    };
    const apiResp = await SearchAssetMappingAPI(payload);
    if (apiResp?.success) {
      setTableData(apiResp?.data);
    } else {
      setTableData([]);
      notify(apiResp?.message, "error");
    }
  };
  const handleExportExcel = async () => {
    if (!values?.Subcategory?.value) {
      notify("Please select Subcategory", "error");
      return;
    }
    const payload = {
      SubcategoryID: Number(values?.Subcategory?.value || 0),
      CentreID: Number(values?.Centre?.value || 0),
      ItemID: values?.ItemName?.map((val) => val?.code)?.join(",") || "",
    };
    const apiResp = await PrintAssetMappingAPI(payload);
    if (apiResp?.success) {
      exportToExcel(transformDataInTranslate(apiResp?.data?.data, t), t(apiResp?.data?.reportName));
    } else {
      notify(apiResp?.message, "error");
    }
  };
  return (
    <div className="card pt-2">
      <Heading isBreadcrumb={true} 
      name={"Asset Finance Mapping"}
      />
      <div className="row px-2 pt-1">
        <ReactSelect
          placeholderName={t("Centre")}
          searchable={true}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          id={"Centre"}
          name={"Centre"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
           dynamicOptions={centres}
          value={values?.Centre?.value}
        />
        
        <ReactSelect
          placeholderName={t("Sub category")}
          searchable={true}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          id={"Subcategory"}
          name={"Subcategory"}
          removeIsClearable={true}
          className={"required-fields"}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.Subcategory}
          value={values?.Subcategory?.value}
        />
        <MultiSelectComp
          className="col-xl-2 col-md-3 col-sm-6 col-12"
          name="ItemName"
          id="ItemName"
          placeholder={t("Item Name")}
          options={dropDownState?.ItemList?.map((item) => ({
            label: item?.TextField,
            value: item?.ValueField,
          }))}
          onChange={handleMultiSelectChange}
          value={values?.ItemName}
          // className={true}
        />
       { console.log(dropDownState?.ItemList, "asdfgv")}
        <button className="btn btn-primary" onClick={handleSearch}>
          {t("Search")}
        </button>
        <span className="ml-3 mt-0" onClick={handleExportExcel}>
          <ExcelIconSVG />
        </span>
      </div>
      <div className="card">
        <Heading title={t("Asset Finance Mapping")} />

        {tableData?.length > 0 && (
          <>
            <HisTable
              style={{ maxHeight: "60vh" }}
              thead={[...thead, ...SalesHead, ...WriteOffHead]}
              removeHeaderSpace={true}
              tbody={tableData?.map((val, index) => {
                const tData = {
                  "S.No.": (
                    <>
                      {index + 1}{" "}
                      <input
                        type="checkbox"
                        checked={val?.isChecked}
                        className="table-checkbox"
                        onChange={(e) =>
                          handleChangeSelectBox(
                            index,
                            "isChecked",
                            e.target.checked
                          )
                        }
                      />
                    </>
                  ),
                  itemName: val?.ItemName,
                  Department: (
                    <div style={{
                        whiteSpace: "wrap",
                         width: "150px",
                      }}>
                      <CustomSelect
                        option={dropDownState?.Department}
                        placeHolder={t("Department")}
                        className={"required-fields"}
                        value={String(val?.FinDeptCode)}
                        name="FinDeptCode"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                  PurchaseCOA: (
                    <div
                      style={{
                        whiteSpace: "wrap",
                        width: "150px",
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.PurchaseCOA}
                        className={"required-fields"}
                        placeHolder={t("Purchase COA")}
                        value={String(val?.PurchaseCOAID)}
                        name="PurchaseCOAID"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                  OpeningDR: (
                    <div
                      style={{
                        whiteSpace: "wrap",
                         width: "150px",
                        color: val?.OpeningCOAIDcolor,
                        backgroundColor: val?.OpeningCOAIDcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Opening DR")}
                        value={String(val?.OpeningCOAIDDr)}
                        name="OpeningCOAIDDr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                  OpeningCR: (
                    <div
                      style={{
                        whiteSpace: "wrap",
                         width: "150px",
                        color: val?.OpeningCOAIDcolor,
                        backgroundColor: val?.OpeningCOAIDcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Opening CR")}
                        // value={val?.OpeningCOAIDCr}
                        value={String(val?.OpeningCOAIDCr)}
                        name="OpeningCOAIDCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                  AccumulatedDepreciationDR: (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.AccDepreCOAIDcolor,
                        backgroundColor: val?.AccDepreCOAIDcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Accumulated Depreciation DR")}
                        // value={val?.AccDepreCOAIDDr}
                        value={String(val?.AccDepreCOAIDDr)}
                        name="AccDepreCOAIDDr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                  AccumulatedDepreciationCR: (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.AccDepreCOAIDcolor,
                        backgroundColor: val?.AccDepreCOAIDcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Accumulated Depreciation CR")}
                        // value={val?.AccDepreCOAIDCr}
                        value={String(val?.AccDepreCOAIDCr)}
                        name="AccDepreCOAIDCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                  MonthlyDepDr: (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.MonthlyDepreCOAIDcolor,
                        backgroundColor: val?.MonthlyDepreCOAIDcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.TypeIDThree}
                        placeHolder={t("Monthly Dep Dr")}
                        // value={val?.MonthlyDepreCOAIDDr}
                        value={String(val?.MonthlyDepreCOAIDDr)}
                        name="MonthlyDepreCOAIDDr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                  MonthlyDepreCOAIDCr: (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.MonthlyDepreCOAIDcolor,
                        backgroundColor: val?.MonthlyDepreCOAIDcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Monthly Dep Cr")}
                        // value={val?.MonthlyDepreCOAIDCr}
                        value={String(val?.MonthlyDepreCOAIDCr)}
                        name="MonthlyDepreCOAIDCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  ),
                };
                if (values?.SaleHideshow) {
                  tData.SaleAssetDr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.SaleAssetcolor,
                        backgroundColor: val?.SaleAssetcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.TypeIDThree}
                        placeHolder={t("Sale Asset Dr")}
                        value={String(val?.SaleAssetDr)}
                        name="SaleAssetDr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                  tData.SaleAssetCr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.SaleAssetcolor,
                        backgroundColor: val?.SaleAssetcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Sale Asset Dr")}
                        value={String(val?.SaleAssetCr)}
                        name="SaleAssetCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                  tData.SaleDepDr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.SaleDeprecolor,
                        backgroundColor: val?.SaleDeprecolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Sale Dep Dr")}
                        value={String(val?.SaleDepDr)}
                        name="SaleDepDr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                  tData.SaleDepCr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.SaleDeprecolor,
                        backgroundColor: val?.SaleDeprecolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.TypeIDThree}
                        placeHolder={t("Sale Dep Cr")}
                        value={String(val?.SaleDepCr)}
                        name="SaleDepCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                  tData.SaleSaleCr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.SaleSalecolor,
                        backgroundColor: val?.SaleSalecolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.TypeIDThree}
                        placeHolder={t("Sale Sale Cr")}
                        value={String(val?.SaleSaleCr)}
                        name="SaleSaleCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                }
                if (values?.WriteOffHideshow) {
                  tData.WriteOffAssetDr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.WriteOffAssetcolor,
                        backgroundColor: val?.WriteOffAssetcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.TypeIDThree}
                        placeHolder={t("Write Off Asset Dr")}
                        value={String(val?.WriteOffAssetDr)}
                        name="WriteOffAssetDr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                  tData.WriteOffAssetCr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.WriteOffAssetcolor,
                        backgroundColor: val?.WriteOffAssetcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Write Off Asset Cr")}
                        value={String(val?.WriteOffAssetCr)}
                        name="WriteOffAssetCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                  tData.WriteOffDepreDr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.WriteOffAssetcolor,
                        backgroundColor: val?.WriteOffAssetcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.TypeIDThree}
                        placeHolder={t("Write Off Depre Dr")}
                        value={String(val?.WriteOffDepreDr)}
                        name="WriteOffDepreDr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                  tData.WriteOffDepreCr = (
                    <div
                      style={{
                         width: "150px",
                        whiteSpace: "wrap",
                        color: val?.WriteOffAssetcolor,
                        backgroundColor: val?.WriteOffAssetcolor,
                      }}
                    >
                      <CustomSelect
                        option={dropDownState?.CRDR}
                        placeHolder={t("Write Off Depre Cr")}
                        value={String(val?.WriteOffDepreCr)}
                        name="WriteOffDepreCr"
                        onChange={(name, e) =>
                          handleChangeSelectBox(index, name, e?.value)
                        }
                      />
                    </div>
                  );
                }
                return tData;
              })}
              scrollView={"scrollView"}
            />

            <div className="d-flex justify-content-end p-2">
              <button className="btn btn-primary px-3" onClick={handleSave}>
                {t("Save")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
