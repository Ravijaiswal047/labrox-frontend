import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { PurchaGetBindAllCenter } from "../../../../NetworkServices/Purchase.js";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Heading from "../../../../components/UI/Heading";
import {
  bindFinancialYear,
  CloseBookAPI,
} from "../../../../NetworkServices/finance.js";
import { notify } from "../../../../utils/ustil2";
import { filterByTypes, handleReactSelectDropDownOptions } from "../../../utils/Utils";
import { bindVoucherBillingScreenControls } from "../../../../NetworkServices/Pettycash.js";
const FinancialYearBook = () => {
  const [t] = useTranslation();
  const userData = useLocalStorage("userData", "get");
     const [centres, setCentres] = useState([]);
  const initialData = {
    allCenter: { value: userData?.MainCentreID },
    openclose: {
      label: "Open",
      value: "O",
    },
  };
  const [values, setValues] = useState(initialData);

  const [dropDownState, setDropDownState] = useState({
    GetBindAllCenter: [],
    FinancialYearBook: [],
  });
  // const getPurchaGetBindAllCenterAPI = async () => {
  //   try {
  //     const GetBindAllCenter = await PurchaGetBindAllCenter();
  //     setDropDownState((val) => ({
  //       ...val,
  //       GetBindAllCenter: handleReactSelectDropDownOptions(
  //         GetBindAllCenter?.data,
  //         "CentreName",
  //         "CentreID"
  //       ),
  //     }));
  //   } catch (error) {
  //     console.log(error, "SomeThing Went Wrong");
  //   }
  // };

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

  const getBindFinancialYear = async () => {
    let apiResp = await bindFinancialYear();
    // debugger
    if (apiResp?.success) {
      setDropDownState((val) => ({
        ...val,
        FinancialYearBook: handleReactSelectDropDownOptions(
          apiResp?.data,
          "TextField",
          "ValueField"
        ),
      }));
    }
  };

  useEffect(() => {
    // getPurchaGetBindAllCenterAPI();
    getCentreAPI();
    if (values?.allCenter?.value) {
      getBindFinancialYear(values?.allCenter?.value);
    }
  }, []);

  const handleReactChange = (name, e, key) => {
    if (name === "FyId") {
      setValues((val) => ({
        ...val,
        [name]: e,
        openclose: { value: e?.FYBook },
      }));
    } else {
      setValues((val) => ({ ...val, [name]: e }));
    }
  };

  const handleSave = async () => {
    const payloadData = {
      FyId: values?.FyId?.value.toString(),
      Type: values?.openclose?.value,
      CanClose: values?.FyId?.CanClose.toString(),
    };
    let apiResp = await CloseBookAPI(payloadData);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      getBindFinancialYear(values?.allCenter?.value);
      setValues(initialData);
    } else {
      notify(apiResp?.message, "error");
    }
  };

  return (
    <div className="mt-2 spatient_registration_card">
      <div className="patient_registration card">
        <Heading name={t(" Financial Year Book Closing")} isBreadcrumb={true} />
        <div className="row p-2">
          {/* <ReactSelect
            placeholderName={t("Centre")}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            id={"allCenter"}
            name={"allCenter"}
            // isDisabled={true}
            removeIsClearable={true}
            onChange={(name, e) => handleReactChange(name, e)}
            dynamicOptions={centres}
            value={values?.allCenter?.value}
          /> */}

          <ReactSelect
            placeholderName={t("Financial Year")}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            id={"FyId"}
            name={"FyId"}
            className={"required-fields"}
            removeIsClearable={true}
            onChange={(name, e) => handleReactChange(name, e)}
            dynamicOptions={dropDownState?.FinancialYearBook}
            value={values?.FyId?.value}
          />

          <ReactSelect
            placeholderName={t("Open/Close")}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            id={"openclose"}
            name={"openclose"}
            className={"required-fields"}
            removeIsClearable={true}
            onChange={(name, e) => handleReactChange(name, e)}
            dynamicOptions={[
              { label: "Open", value: "O" },
              { label: "Close", value: "C" },
            ]}
            value={values?.openclose?.value}
          />

          <div className="col-xl-2 col-md-4 col-sm-6 col-12">
            <button
              className="btn btn-sm btn-primary mr-1"
              onClick={handleSave}
            >
              {t("Save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialYearBook;
