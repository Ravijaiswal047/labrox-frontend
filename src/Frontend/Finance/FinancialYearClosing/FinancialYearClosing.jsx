import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import {
  // filterByTypes,
  // handleReactSelectDropDownOptions,
  notify,
} from "../../../utils/utils";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { PurchaGetBindAllCenter } from "../../../NetworkServices/Purchase.js";

import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import Heading from "../../../components/UI/Heading";
import Tables from "../../../components/UI/customTable";
import Input from "../../../components/formComponent/Input";
import {
  bindFinancialYear,
  BindVoucherBillingScreenControls,
  CloseFinancialYearApi,
} from "../../../NetworkServices/finance.js";
import CustomModalAlert from "../../../components/formComponent/CustomModalAlert";
import { filterByTypes, handleReactSelectDropDownOptions } from "../../utils/Utils";
import { bindVoucherBillingScreenControls } from "../../../NetworkServices/Pettycash.js";
const FinancialYearClosing = () => {
  const ip = useLocalStorage("ip", "get");
  const [t] = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);
  const [centres, setCentres] = useState([]);
  const localData = useLocalStorage("userData", "get");

  const [values, setValues] = useState({
    allCenter: { value: localData?.MainCentreID },
    openclose: {
      label: "Open",
      value: "O",
    },
  });

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
    // debugger
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

  const saveAPI = async () => {
    const payload = {
      FyId: values?.FyId?.value.toString(),
      Type: values?.openclose?.value,
      CanClose: values?.FyId?.CanClose.toString(),
      //CentreID: values?.allCenter?.value,
    };
    let apiResp = await CloseFinancialYearApi(payload);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      //getPurchaGetBindAllCenterAPI();
      return true;
    } else {
      notify(apiResp?.message, "error");
      return false;
    }
  };

  const handleSave = async () => {
    
    if (!values?.FyId?.value) {
      notify("Please Select Financial Year", "error");
      return;
    } else if (!values?.openclose?.value) {
      notify("Please Select Open/Close", "error");
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      {modalOpen && (
        <CustomModalAlert
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          handleActionItem={saveAPI}
          width={"20vw"}
          Header={"Are You Sure ?"}
          component={"Do You Want To Save ?"}
        />
      )}
      <div className="mt-2 ">
        <div className=" card">
          <Heading name={t("Financial Year Closing")} isBreadcrumb={true} />
          <div className="row p-2">
            {/* <ReactSelect
              placeholderName={t("Center")}
              // className={"required-fields"}
              searchable={true}
              respclass="col-xl-2 col-md-4 col-sm-6 col-12"
              id={"allCenter"}
              name={"allCenter"}
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
                // onClick={() => setIsFalse(!isFalse)}
              >
                {t("Save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialYearClosing;
