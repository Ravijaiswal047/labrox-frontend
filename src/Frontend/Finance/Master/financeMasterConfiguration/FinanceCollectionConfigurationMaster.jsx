import { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import {
  BindCentreWorkOrder,
  BindCollectionConfigurationData,
  BindReportControlsAPI,
  GetConfigurationFinance,
  SaveConfiguration,
  UpdateConfiguration,
} from "../../../../NetworkServices/finance.js";
import { useTranslation } from "react-i18next";

import Tables from "../../../../components/UI/customTable";
import CustomSelect from "../../../../components/formComponent/CustomSelect";
import { notify } from "../../../../utils/ustil2";
import { useSelector } from "react-redux";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { filterByTypes, handleReactSelectDropDownOptions } from "../../../utils/Utils";
import HisTable from "../../../../components/UI/customTable/HisTable";
import { bindVoucherBillingScreenControls } from "../../../../NetworkServices/Pettycash.js";

export default function FinanceCollectionConfigurationMaster() {
  const [t] = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [dropDownState, setDropDownState] = useState({
    chartOfAccount: [],
  });
  const [centres, setCentres] = useState([]);
  // const { GetEmployeeWiseCenter } = useSelector((state) => state?.CommonSlice);
  const userData = useLocalStorage("userData", "get");
  const [values, setValues] = useState({
    Centre:{ value: userData?.MainCentreID },
  });

  const thead = [
    { name: t("S.No."), width: "1%" },
    { name: t("Payment Mode") },
    { name: t("Currency"), width: "1%" },
    { name: t("Is Sync"), width: "2%" },
    { name: t("Chart Of A/C") },
    { name: t("Skip Cheque Deposit Process"), width: "2%" },
    { name: t("Skip Bank Reconciliation Process"), width: "2%" },
  ];
  const handleReactChange = async (name, value) => {
    if (name === "Centre") {
      let apiResp = await BindCollectionConfigurationData(value?.value, 2);
      if (apiResp?.success) {
        setDropDownState((val) => ({
          ...val,
          chartOfAccount: handleReactSelectDropDownOptions(
            apiResp?.data,
            "AccountName",
            "COAID"
          ),
        }));
      }
    }
    setValues((val) => ({ ...val, [name]: value }));
  };

  async function fetchData() {
    // debugger
    const [configurationData, reportControlData] = await Promise.all([
      BindCollectionConfigurationData(values?.Centre?.value, 1),
      BindCollectionConfigurationData(values?.Centre?.value, 2),
    ]);
    if (configurationData?.success) {
      setTableData(configurationData?.data);
    }
    if (reportControlData?.success) {
      setDropDownState((val) => ({
        ...val,
        chartOfAccount: handleReactSelectDropDownOptions(
          reportControlData?.data,
          "AccountName",
          "COAID"
        ),
      }));
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
    fetchData();
    getCentreAPI();
  }, []);
  const handleSave = async () => {
    // let payload = [];
    // for (const [index, val] of tableData?.entries()) {
    //   if (!val?.COGCode) {
    //     notify(
    //       `Please select cart of group for ${val?.TypeName} In Row ${index + 1}`,
    //       "error"
    //     );
    //     handleCustomSelect(index, "colorcode", { value: "#f44d4d" });
    //     return;
    //   } else if (!val?.COAID && val?.IsCOARequired === 1) {
    //     notify(
    //       `Please select chart of account for ${val?.TypeName} In Row ${index + 1}`,
    //       "error"
    //     );
    //     handleCustomSelect(index, "colorcode", { value: "#f44d4d" });
    //     return;
    //   }
    //   payload.push({
    //     id: Number(val?.ID),
    //     groupTypeID: String(val?.GroupTypeID || 0),
    //     isCOARequired: String(val?.IsCOARequired || 0),
    //     cogCode: String(val?.COGCode || 0),
    //     coaid: String(val?.COAID || 0),
    //   });
    // }

    let payload = tableData?.map((val) => ({
      currencyCode: String(val?.CurrencyCode),
      centreID: Number(val?.CentreID || 0),
      paymentModeID: Number(val?.PaymentModeId || 0),
      isSync: Number(val?.IsSync ? 1 : 0),
      coaid: Number(val?.COAID || 0),
      isSkipChequeDepositProcess: Number(
        val?.IsSkipChequeDepositProcess ? 1 : 0
      ),
      isSkipBankReconciliationProcess: Number(
        val?.IsSkipBankReconciliationProcess ? 1 : 0
      ),
    }));

    const apiResp = await SaveConfiguration(payload);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      fetchData();
    } else {
      notify(apiResp?.message, "error");
    }
  };
  const handleChangeCheckbox = (index, name, value) => {
    const data = [...tableData];
    data[index][name] = value;
    setTableData(data);
  };

  return (
    <div className="card pt-2">
      <Heading isBreadcrumb={true}
       name={t("Finance Collection Configuration")}
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
        // isDisabled={true}
        />
      </div>
      {tableData?.length > 0 && (
        <>
          <HisTable
            style={{ maxHeight: "60vh" }}
            thead={thead}
            tbody={tableData?.map((val, index) => ({
              "S.No.": index + 1,
              PaymentMode: val?.PaymentMode,
              Currency: val?.CurrencyCode,
              IsSync: (
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={val?.IsSync}
                  onChange={(e) =>
                    handleChangeCheckbox(index, "IsSync", e?.target?.checked)
                  }
                />
              ),
              "Chart Of Account": (
                <>
                  <CustomSelect
                    option={dropDownState?.chartOfAccount?.filter(
                      (item) =>
                        item?.CurrencyCode === val?.CurrencyCode &&
                        item?.GroupCode === val?.GroupCode
                    )}
                    placeHolder={t("Chart Of Account")}
                    value={val?.COAID}
                    name="COAID"
                    onChange={(name, e) =>
                      handleChangeCheckbox(index, name, e?.value)
                    }
                  />
                </>
              ),
              IsSkipChequeDepositProcess: val?.PaymentModeId === 2 && (
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={val?.IsSkipChequeDepositProcess}
                  onChange={(e) =>
                    handleChangeCheckbox(
                      index,
                      "IsSkipChequeDepositProcess",
                      e?.target?.checked
                    )
                  }
                />
              ),
              IsSkipBankReconciliationProcess: (
                <input
                  type="checkbox"
                  className="table-checkbox"
                  checked={val?.IsSkipBankReconciliationProcess}
                  onChange={(e) =>
                    handleChangeCheckbox(
                      index,
                      "IsSkipBankReconciliationProcess",
                      e?.target?.checked
                    )
                  }
                />
              ),
            }))}
          />

          <div className="d-flex justify-content-end p-2">
            <button className="btn btn-primary px-3" onClick={handleSave}>
              {t("Save")}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
