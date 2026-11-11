import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import FinVsHimsSubCategoryMappingModal from "./FinVsHimsSubCategoryMappingModal";
import DualListbox from "../../../../components/commonComponents/DualListBox";
import { BindMainCenter } from "../../../../NetworkServices/Pettycash";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import {
  FinanceBindCostOfSaleMappedUnMappedData,
  FinanceBindCostOfSaleMappingScreenData,
  FinanceExportToExcelFinVHims,
  FinanceExportToExcelHISConsumeDeptMapping,
  FinanceExporttoExcelNotMappedDataFinVHims,
  FinanceExporttoExcelNotMappedDataHISConsumeDeptMapping,
  FinanceExportToExcelSubCategoryMappingMaster,
  FinanceFinVHimsMappedUnMappedData,
  FinanceFinVHimsMappingScreenData,
  FinanceSaveSelectedItemLeftFinVHims,
  FinanceSaveSelectedItemLeftHISConsumeDeptMapping,
  FinanceSaveSelectedItemLeftSubCategoryMappingMaster,
  FinanceSaveSelectedItemRightFinVHims,
  FinanceSaveSelectedItemRightHISConsumeDeptMapping,
  FinanceSaveSelectedItemRightSubCategoryMappingMaster,
  FinanceSubCategoryMappingMasterMappedUnMappedData,
  FinanceSubCategoryMappingMasterScreenData,
  HISConsumeDeptMappingBindHISConsumeDeptMappedUnMappedData,
  HISConsumeDeptMappingBindHISConsumeDeptMappingScreenData,
} from "../../../../NetworkServices/finance.js";
import { notify } from "../../../../utils/ustil2";
import { exportToExcel } from "../../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../../components/WrapTranslate";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal";

const FinVsHimsSubCategoryMapping = () => {
  const [t] = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const [coa, setCoa] = useState([]);

  const [values, setValues] = useState({
    center: { value: Number(userData?.MainCentreID) },
  });

  const [dropDownState, setDropDownState] = useState({
    Cog: [],
    Coa: [],
    Dept: [],
    HisDept: [],
    Category: [],
    SubCategory: [],
    CostCentre: [],
  });

  const [mappingData, setMappingData] = useState({
    mappedData: [],
    unMappedData: [],
  });

  console.log("mappingData", mappingData);
  console.log("values", values);
  const [centreList, setCentreList] = useState([]);

  const [modalData, setModalData] = useState({ visible: false });

  const handleReactSelect = (name, value) => {
    if (name === "cog") {
      const filteredCogData = coa?.filter(
        (val) => val?.DeptCode === value?.value
      );
      setValues((val) => ({
        ...val,
        [name]: value,
        coa: { label: "", value: "" },
      }));
      setDropDownState((val) => ({
        ...val,
        Coa: filteredCogData,
      }));
    }
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
          <FinVsHimsSubCategoryMappingModal
            handleClose={handleCloseModal}
            centerData={centreList}
          />
        </>
      ),
    });
  };

  const bindAllData = async () => {
    const CenterID = values?.center?.value;
    const response = await FinanceSubCategoryMappingMasterScreenData(CenterID);
    if (response?.success) {
      const cogData = response?.data?.filter((val) => val?.TypeID === 1);
      const COAdata = response?.data?.filter((val) => val?.TypeID === 2);
      const DepartmentData = response?.data?.filter((val) => val?.TypeID === 5);
      // const hisDeptData = response?.data?.filter((val) => val?.TypeID === 2);
      const categoryData = response?.data?.filter((val) => val?.TypeID === 3);
      const subCategoryData = response?.data?.filter(
        (val) => val?.TypeID === 4
      );
      const costCentreData = response?.data?.filter((val) => val?.TypeID === 7);
      const patientTypeData = response?.data?.filter(
        (val) => val?.TypeID === 8
      );
      setCoa(COAdata);
      setDropDownState((val) => ({
        ...val,
        Cog: cogData,
        Coa: COAdata,
        Dept: DepartmentData,
        // HisDept: hisDeptData,
        Category: categoryData,
        SubCategory: subCategoryData,
        CostCentre: costCentreData,
        PatientType: patientTypeData,
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

  const mappedUnmappedData = async () => {
    const payload = {
      coaid: String(values?.coa?.value) || "",
      centreID: String(values?.center?.value) || "",
      department: values?.dept?.value ? String(values?.dept?.value) : "",
      costCentre: values?.costCentre?.value
        ? String(values?.costCentre?.value)
        : "",
      categoryID: values?.category?.value
        ? String(values?.category?.value)
        : "",
      patientType: values?.pType?.value ? String(values?.pType?.value) : "OPD",
    };

    const response =
      await FinanceSubCategoryMappingMasterMappedUnMappedData(payload);
    if (response?.success) {
      setMappingData((val) => ({
        ...val,
        mappedData: response?.data?.mappedData?.map((val) => ({
          ItemID: val.SubCategoryID,
          TypeName: val?.Name,
        })),
        unMappedData: response?.data?.notMappedData?.map((val) => ({
          ItemID: val.SubCategoryID,
          TypeName: val?.NAME,
        })),
      }));
    } else {
      setMappingData((val) => ({
        ...val,
        mappedData: [],
        unMappedData: [],
      }));
      //   notify(response?.message, "error");
    }
  };

  useEffect(() => {
    getCentreList();
    bindAllData();
  }, []);

  useEffect(() => {
    if (
      values?.dept?.value ||
      values?.coa?.value ||
      values?.dept?.value ||
      values?.category?.value ||
      // values?.subCategory?.value ||
      values?.costCentre?.value ||
      values?.pType?.value
    ) {
      mappedUnmappedData();
    }
  }, [
    values?.Department,
    values?.dept,
    values?.coa,
    values?.hisDept,
    values?.category,
    values?.subCategory,
    values?.costCentre,
    values?.pType,
  ]);

  const handleMoveLeft = async (items) => {
    if (!values?.center?.value) {
      notify("Please Select Center", "error");
      return;
    } else if (!values?.dept?.value) {
      notify("Please Select Department", "error");
      return;
    } else if (!values?.coa?.value) {
      notify("Please Select COA", "error");
      return;
    } else if (!values?.pType?.value) {
      notify("Please Select Patient Type", "error");
      return;
    } else if (!values?.cog?.value) {
      notify("Please Select COG", "error");
      return;
    } else if (!values?.category?.value) {
      notify("Please Select Category", "error");
      return;
    } else if (!values?.costCentre?.value) {
      notify("Please Select Cost Centre", "error");
      return;
    }
    const fullItems = mappingData.unMappedData.filter((item) =>
      items.includes(String(item.ItemID))
    );
    debugger;
    const payload = {
      items: fullItems?.map((val) => ({
        centreID: String(values?.center?.value),
        departmentCode: String(values?.dept?.value),
        costCentreCode: String(values?.costCentre?.value),
        hisSubCategoryID: val?.ItemID,
        coaid: Number(values?.coa?.value),
        patientType: String(values?.pType?.value),
      })),
    };

    const response =
      await FinanceSaveSelectedItemRightSubCategoryMappingMaster(payload);

    if (response?.success) {
      mappedUnmappedData();
    } else {
      notify(response?.message, "error");
    }
  };
  const handleMoveRight = async (items) => {
    if (!values?.center?.value) {
      notify("Please Select Center", "error");
      return;
    } else if (!values?.dept?.value) {
      notify("Please Select Department", "error");
      return;
    } else if (!values?.coa?.value) {
      notify("Please Select COA", "error");
      return;
    } else if (!values?.pType?.value) {
      notify("Please Select Patient Type", "error");
      return;
    } else if (!values?.cog?.value) {
      notify("Please Select COG", "error");
      return;
    } else if (!values?.category?.value) {
      notify("Please Select Category", "error");
      return;
    } else if (!values?.costCentre?.value) {
      notify("Please Select Cost Centre", "error");
      return;
    }
    const fullItems = mappingData.mappedData.filter((item) =>
      items.includes(String(item.ItemID))
    );
    debugger;
    const payload = {
      items: fullItems?.map((val) => ({
        centreID: String(values?.center?.value),
        departmentCode: String(values?.dept?.value),
        costCentreCode: String(values?.costCentre?.value),
        hisSubCategoryID: val?.ItemID,
        coaid: Number(values?.coa?.value),
        patientType: String(values?.pType?.value),
      })),
    };

    const response =
      await FinanceSaveSelectedItemLeftSubCategoryMappingMaster(payload);

    if (response?.success) {
      mappedUnmappedData();
    } else {
      notify(response?.message, "error");
    }
  };

  const handleExportToExcel = async () => {
    if (!values?.center?.value) {
      notify("Please Select Center ", "error");
      return;
    }
    const payload = {
      centreID: String(values?.center?.value),
      // finDeptCode: String(values?.dept?.value),
    };

    const response =
      await FinanceExportToExcelSubCategoryMappingMaster(payload);
    if (response?.success) {
      notify(response?.message, "success");
      exportToExcel(
        transformDataInTranslate(response?.data, t),
        "Item Mapping"
      );
    } else {
      notify(response?.message, "error");
    }
  };

  const handleNotMapped = async () => {
    if (
      !values?.center?.value ||
      // !values?.subCategory?.value ||
      !values?.pType?.value
    ) {
      notify("Please Select Center , Sub Category & Patient Type", "error");
      return;
    }
    const payload = {
      centreID: String(values?.center?.value),
      // SubCategory: String(values?.subCategory?.value),
      PatientType: String(values?.pType?.value),
    };

    const response = await FinanceExporttoExcelNotMappedDataFinVHims(payload);
    if (response?.success) {
      notify(response?.message, "success");
      exportToExcel(
        transformDataInTranslate(response?.data, t),
        "Item Not Mapped"
      );
    } else {
      notify(response?.message, "error");
    }
  };
  return (
    <div className="card mt-2">
      <Heading
        name={"Finance Department And LIMS Sub Category Wise Item Mapping "}
        isBreadcrumb={true}
      />
      <div className="row">
        <div className="mt-1 col-xl-6">
          <Heading title={t("Account Section")} isBreadcrumb={false} />
          <div className="row p-2">
            <ReactSelect
              className={"required-fields"}
              isDisabled={true}
              placeholderName={t("Center")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"center"}
              name={"center"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={centreList?.map((val) => ({
                label: val?.Centre,
                value: val?.MainCentreID,
              }))}
              value={values?.center?.value}
            />
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Chart Of Group")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"cog"}
              name={"cog"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={dropDownState?.Cog?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.cog?.value}
            />
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Chart Of Account")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"coa"}
              name={"coa"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={values?.cog?.value &&dropDownState?.Coa?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.coa?.value}
            />
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Department")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"dept"}
              name={"dept"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={dropDownState?.Dept?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.dept?.value}
            />
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Cost Centre")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"costCentre"}
              name={"costCentre"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={dropDownState?.CostCentre?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.costCentre?.value}
            />
          </div>
        </div>
        <div className="mt-1 col-xl-6">
          <Heading title={"LIMS Section"} isBreadcrumb={false} />

          <div className="row p-2">
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Patient Type")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"pType"}
              name={"pType"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={dropDownState?.PatientType?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.pType?.value}
            />
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Category")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"category"}
              name={"category"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={dropDownState?.Category?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.category?.value}
            />
            {/* <ReactSelect
              className={"required-fields"}
              placeholderName={t("Sub Category")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"subCategory"}
              name={"subCategory"}
              removeIsClearable={true}
              handleChange={handleReactSelect}
              dynamicOptions={dropDownState?.SubCategory?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.subCategory?.value}
            /> */}
          </div>
        </div>
      </div>

      <Heading
        title={"Mapping Details"}
        isBreadcrumb={false}
        secondTitle={
          <>
            <button className="btn btn-success" onClick={handleNotMapped}>
              {t("Not Mapped Data")}
            </button>
            <button
              className="btn btn-success ml-2"
              onClick={handleExportToExcel}
            >
              {t("Export To Excel")}
            </button>
            <button
              className="btn btn-success ml-2"
              style={{ background: "red" }}
              onClick={handleOpenMapping}
            >
              {t("Copy Mapping")}
            </button>
          </>
        }
      />
      <div className="p-2">
        <DualListbox
          LeftTitle={"Available"}
          RightTitle={"Remaining"}
          leftData={mappingData?.mappedData}
          rightData={mappingData?.unMappedData}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
        />
      </div>

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

export default FinVsHimsSubCategoryMapping;
