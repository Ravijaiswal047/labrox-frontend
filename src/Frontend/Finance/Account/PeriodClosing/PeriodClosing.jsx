import React, { useEffect, useState } from "react";

import { useTranslation } from "react-i18next";
import {
  filterByTypes,
  handleReactSelectDropDownOptions,
  notify,
} from "../../../utils/Utils";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { PurchaGetBindAllCenter } from "../../../../NetworkServices/Purchase.js";

import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import Heading from "../../../../components/UI/Heading";
import Tables from "../../../../components/UI/customTable";
import Input from "../../../../components/formComponent/Input";
import {
  bindFinancialYear,
  bindFinancialYearPeriodClosing,
  BindVoucherBillingScreenControls,
  GrdFinancialYearAPI,
  SaveFinancialAPI,
} from "../../../../NetworkServices/finance.js";
import DatePicker from "../../../../components/formComponent/DatePickerHis";
import CustomSelect from "../../../../components/formComponent/CustomSelect";
import CustomModalAlert from "../../../../components/formComponent/CustomModalAlert";
import HisTable from "../../../../components/UI/customTable/HisTable";
import { bindVoucherBillingScreenControls } from "../../../../NetworkServices/Pettycash.js";

const PeriodClosing = () => {
  const ip = useLocalStorage("ip", "get");
  const [t] = useTranslation();
  const [modalOpen, setModalOpen] = useState(false);

  const localData = useLocalStorage("userData", "get");
  const [tbodyData, setTbodyData] = useState([]);
  const [centres, setCentres] = useState([]);
  const userData = useLocalStorage("userData", "get");
  const [values, setValues] = useState({
    allCenter: { value: userData?.MainCentreID },
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
  const getBindFinancialYear = async (centreID) => {
    let apiResp = await bindFinancialYearPeriodClosing(centreID);
    if (apiResp?.success) {
      setDropDownState((val) => ({
        ...val,
        FinancialYearBook: handleReactSelectDropDownOptions(
          apiResp?.data,
          "FinancialYear",
          "Id"
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

  const handleReactChange = async (name, e) => {
    setValues((val) => ({ ...val, [name]: e }));
    if (name === "FyId") {
      let apiResp = await GrdFinancialYearAPI(
        e?.value,
        values?.allCenter?.value
      );
      if (apiResp?.success) {
        setTbodyData(apiResp?.data);
      } else {
        setTbodyData([]);
      }
    } else {
      let apiResp = await GrdFinancialYearAPI(
        values?.FyId?.value,
        e?.value
      );
      if (apiResp?.success) {
        setTbodyData(apiResp?.data);
      } else {
        setTbodyData([]);
      }
    }
  };
  const THEAD = [
    { width: "1%", name: t("SNo") },
    { name: t("Month") },
    { width: "10%", name: t("Action") },
  ];
  const handleCustomSelect = (index, name, e) => {
    const data = [...tbodyData];
    data[index][name] = e?.value;
    setTbodyData(data);
  };
  const handleSave = async () => {
    const FinancialList = [];
    tbodyData.map((val) => {
      FinancialList.push({
        MonthId: val?.MonthId,
        Radio: val?.ClosingFlag,
      });
    });

    const payloadData = {
      Id: values?.FyId?.value,
      CentreID: Number(values?.allCenter?.value),
      Financial: FinancialList,
    };
    let apiResp = await SaveFinancialAPI(payloadData);
    if (apiResp?.success) {
      notify(apiResp?.message, "success");
      return true;
    } else {
      notify(apiResp?.message, "error");
      return false;
    }
  };
  const handleSaveOpen = () => {
    setModalOpen(true);
  };
  return (
    <div className="mt-2 ">
      {modalOpen && (
        <CustomModalAlert
          isOpen={modalOpen}
          setIsOpen={setModalOpen}
          handleActionItem={handleSave}
          width={"20vw"}
          Header={"Are You Sure ?"}
          component={"Do You Want To Save ?"}
        />
      )}
      <div className=" card">
        <Heading name={t("Period Closing")} isBreadcrumb={true} />
        <div className="row p-2">
          {/* <ReactSelect
            placeholderName={t("Centre")}
            className={"required-fields"}
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
        </div>
      </div>
      {tbodyData?.length > 0 && (
        <div className="card">
          <div className=" mt-2 spatient_registration_card">
            <Heading title={t("Voucher Mapping")} isBreadcrumb={false} />
            <HisTable
              thead={THEAD}
              tbody={tbodyData?.map((val, index) => ({
                sn: index + 1,
                month: val?.Month,
                Action: (
                  <CustomSelect
                    option={[
                      { label: "Open", value: "O" },
                      { label: "Close", value: "C" },
                    ]}
                    isRemoveSearchable={true}
                    placeHolder={t("Action")}
                    value={val?.ClosingFlag}
                    name="ClosingFlag"
                    onChange={(name, e) => handleCustomSelect(index, name, e)}
                  />
                ),
              }))}
            />
          </div>
          <div className="m-2 d-flex justify-content-end">
            <button
              className="btn btn-sm btn-success px-3"
              onClick={handleSaveOpen}
            >
              {t("Save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodClosing;
