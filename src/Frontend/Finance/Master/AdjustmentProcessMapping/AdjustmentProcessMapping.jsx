import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import {
  // handleReactSelectDropDownOptions,
  notify,
} from "../../../../utils/utils";
import {
  BindBranchCentre,
  FinanceBindStockAdjProcessMappingData,
  FinanceBindStockAdjProcessScreenControls,
  FinanceChangeStockAdjProcessStatus,
  FinanceSaveStockAdjProcessMapping,
} from "../../../../NetworkServices/finance.js";
// import Tables from "../../../../components/UI/customTable";
import { GetStore } from "../../../../NetworkServices/finance.js";
import CopyModalAdjuProcess from "./CopyModalAdjuProcess.jsx";
import { BindMainCenter } from "../../../../NetworkServices/Pettycash.js";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { handleReactSelectDropDownOptions } from "../../../utils/Utils.jsx";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal.jsx";
import HisTable from "../../../../components/UI/customTable/HisTable.jsx";
const AdjustmentProcessMapping = () => {
  const [t] = useTranslation();
  const [centreList, setCentreList] = useState([]);

  const userData = useLocalStorage("userData", "get");

  const [values, setValues] = useState({
    center: { value: Number(userData?.MainCentreID) },
  });

  const [dropDownState, setDropDownState] = useState({
    GetBindAllCenter: [],
    HisDept: [],
    Ttype: [],
    FinDept: [],
    Coa: [],
    StoreType: [],
  });
  const [modalData, setModalData] = useState({ visible: false });

  const [tableData, setTableData] = useState([]);

  const THEAD = [
    { name: t("S.No."), width: "1%" },
    { name: t("Transaction Type") },
    { name: t("Centre Name") },
    { name: t("HIS Department") },
    { name: t("Fin Department") },
    { name: t("Account Name") },
    { name: t("Store Type") },
    { name: t("Delete") },
  ];

  const handleReactChange = (name, value) => {
    setValues((val) => ({
      ...val,
      [name]: value,
    }));
  };
  const getCentreList = async () => {
    let apiResp = await BindMainCenter();
    if (apiResp?.success) {
      setCentreList(apiResp?.data);
    }
  };

  const GetBindAllCenter = async () => {
    try {
      const response = await BindBranchCentre();
      setDropDownState((val) => ({
        ...val,
        GetBindAllCenter: handleReactSelectDropDownOptions(
          response?.data,
          "CentreName",
          "CentreID"
        ),
      }));
    } catch (error) {
      console.log(error, "SomeThing Went Wrong");
    }
  };

  const GetStoreList = async () => {
    try {
      // const response = await approvalBindLedger();
      const response = await GetStore();
      if (response.success) {
        setDropDownState((val) => ({
          ...val,
          StoreType: handleReactSelectDropDownOptions(
            response?.data,
            "StoreName",
            "StoreID"
          ),
        }));
      } else {
        notify(response.message, "error");
      }
    } catch (error) {
      console.error("Error fetching department data:", error);
      setDropDownState((val) => ({
        ...val,
        StoreType: [],
      }));
    }
  };

  useEffect(() => {
    GetBindAllCenter();
    GetStoreList();
    getCentreList();
  }, []);

  const handleCloseModal = (ele, data) => {
    setModalData((val) => ({ ...val, visible: false }));
  };

  const handleOpenMapping = (data, index) => {
    setModalData({
      visible: true,
      width: "40vw",
      label: t("Center Mapping Details"),
      handleCloseModal: handleCloseModal,
      buttonName: "Save",
      CallAPI: () => {},
      modalData: {},
      footer: <></>,
      Component: (
        <>
          <CopyModalAdjuProcess handleClose={handleCloseModal} centerData={centreList}/>
        </>
      ),
    });
  };

  const bindTableData = async () => {
    const response = await FinanceBindStockAdjProcessMappingData();
    if (response?.success) {
      setTableData(response?.data);
    } else {
      setTableData([]);
      notify(response?.message, "error");
    }
  };

  const handleSave = async () => {
    if (
      !values?.center?.value ||
      !values?.hisDept?.value ||
      !values?.transactionType?.value ||
      !values?.finDepartment?.value ||
      !values?.coa?.value ||
      !values?.storeType?.value
    ) {
      notify("Please Select All Required Fields", "error");
      return;
    }
    const payload = {
      CentreID: values?.center?.value,
      HisDepartment: values?.hisDept?.value,
      TransactionType: values?.transactionType?.value,
      FinDepartment: values?.finDepartment?.value,
      COAID: values?.coa?.value,
      StoreType: values?.storeType?.label,
      StoreTypeID: values?.storeType?.value,
    };
    const response = await FinanceSaveStockAdjProcessMapping(payload);
    if (response?.success) {
      bindTableData();
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  const AllDropDownData = async () => {
    const response = await FinanceBindStockAdjProcessScreenControls();
    if (response?.success) {
      const cogData = response?.data?.filter((val) => val?.TypeID === 6);
      const COAdata = response?.data?.filter((val) => val?.TypeID === 2);
      const DepartmentData = response?.data?.filter((val) => val?.TypeID === 1);
      const hisDeptData = response?.data?.filter((val) => val?.TypeID === 3);
      const storeTypeData = response?.data?.filter((val) => val?.TypeID === 5);
      const transactionType = response?.data?.filter(
        (val) => val?.TypeID === 4
      );
      setDropDownState((val) => ({
        ...val,
        Cog: cogData,
        Coa: COAdata,
        FinDept: DepartmentData,
        HisDept: hisDeptData,
        storeTypeData: storeTypeData,
        Ttype: transactionType,
      }));
    } else {
      setDropDownState({
        Cog: [],
        Coa: [],
        Dept: [],
        HisDept: [],
        Category: [],
        SubCategory: [],
      });
      notify(response?.message, "error");
    }
  };

  useEffect(() => {
    AllDropDownData();
    bindTableData();
  }, []);

  const handleDelete = async (val) => {
    const payload = {
      id: val?.ID,
    };
    const response = await FinanceChangeStockAdjProcessStatus(payload);
    if (response?.success) {
      debugger
      bindTableData();
      notify(response?.message, "success");
    } else {
      notify(response?.message, "error");
    }
  };

  return (
    <div className="card mt-2">
      <Heading name="Adjustment Process Mapping" isBreadcrumb={true} />
      <div className="row p-2">
        <ReactSelect
          className={"required-fields"}
          isDisabled={true}
          placeholderName={t("Center")}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-4 col-12"
          id={"center"}
          name={"center"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={centreList?.map((val) => ({
            label: val?.Centre,
            value: val?.MainCentreID,
          }))}
          value={values?.center?.value}
        />
        <ReactSelect
          placeholderName={t("HIS Department")}
          searchable={true}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          id={"hisDept"}
          className={"required-fields"}
          name={"hisDept"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.HisDept?.map((val) => ({
            label: val?.TextField,
            value: val?.ValueField,
          }))}
          value={values?.hisDept?.value}
        />
        <ReactSelect
          placeholderName={t("Transaction Type")}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          id={"transactionType"}
          name={"transactionType"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.Ttype?.map((val) => ({
            label: val?.TextField,
            value: val?.ValueField,
          }))}
          value={values?.transactionType?.value}
        />
        <ReactSelect
          placeholderName={t("Fin. Department")}
          searchable={true}
          className={"required-fields"}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          id={"finDepartment"}
          name={"finDepartment"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.FinDept?.map((val) => ({
            label: val?.TextField,
            value: val?.ValueField,
          }))}
          value={values?.finDepartment?.value}
        />
        <ReactSelect
          placeholderName={t("Chart Of Account")}
          searchable={true}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          id={"coa"}
          className={"required-fields"}
          name={"coa"}
          removeIsClearable={true}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.Coa?.map((val) => ({
            label: val?.TextField,
            value: val?.ValueField,
          }))}
          value={values?.coa?.value}
        />
        <ReactSelect
          placeholderName={t("Store Type")}
          searchable={true}
          respclass="col-xl-2 col-md-3 col-sm-6 col-12"
          id={"storeType"}
          name={"storeType"}
          removeIsClearable={true}
          className={"required-fields"}
          onChange={(name, e) => handleReactChange(name, e)}
          dynamicOptions={dropDownState?.storeTypeData?.map((val) => ({
            label: val?.TextField,
            value: val?.ValueField,
          }))}
          value={values?.storeType?.value}
        />
        <button className="btn btn-success ml-2" onClick={handleSave}>
          {t("Save")}
        </button>
        <button
          className="btn btn-success ml-2"
          style={{ background: "red" }}
          onClick={handleOpenMapping}
        >
          {t("Copy Mapping")}
        </button>
      </div>
      {tableData?.length > 0 && (
        <div className="">
          <Heading
            title={t("Adjustment(+)/Process(-) Mapping Details")}
            isBreadcrumb={false}
          />
          <HisTable
            isSearch={true}
            thead={THEAD}
            tbody={tableData?.map((val, index) => ({
              SrNo: index + 1,
              transactionType: val?.TransactionType,
              center: val?.CentreName,
              hisDept: val?.RoleName,
              finDepartment: val?.FinancDeparment,
              AccountName : val?.AccountName,
              storeType: val?.StoreType,
              delete: (
                <span
                  className="fa fa-trash"
                  style={{color:"red"}}
                  onClick={() => handleDelete(val)}
                ></span>
              ),
            }))}
          />
        </div>
      )}
      {modalData?.visible && (
        <FinanceModal
          visible={modalData?.visible}
          setVisible={(ele, data) => {
            modalData?.handleCloseModal(ele, data);
          }}
          modalData={modalData?.modalData}
          modalWidth={modalData?.width}
          Header={modalData?.label}
          buttonType="button"
          buttonName={modalData?.buttonName}
          footer={modalData?.footer}
          handleAPI={modalData?.CallAPI}
        >
          {modalData?.Component}
        </FinanceModal>
      )}
    </div>
  );
};

export default AdjustmentProcessMapping;
