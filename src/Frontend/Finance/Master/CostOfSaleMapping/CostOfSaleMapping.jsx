import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import CostOfSaleMappingModal from "./CostOfSaleMappingModal";
import DualListbox from "../../../../components/commonComponents/DualListBox";
import { BindMainCenter } from "../../../../NetworkServices/Pettycash";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import {
  FinanceBindCostOfSaleMappedUnMappedData,
  FinanceBindCostOfSaleMappingScreenData,
  FinanceExportToExcelBindCostOfSale,
  FinanceExporttoExcelNotMappedDataBindCostOfSale,
  FinanceSaveSelectedItemLeftBindCostOfSale,
  FinanceSaveSelectedItemRightBindCostOfSale,
} from "../../../../NetworkServices/finance.js";
import { notify } from "../../../../utils/ustil2";
import { exportToExcel } from "../../../../utils/exportLibrary";
import { transformDataInTranslate } from "../../../../components/WrapTranslate";
import FinanceModal from "../../../../components/ModalComponent/FinanceModal";

const CostOfSaleMapping = () => {
  const [t] = useTranslation();
  const userData = useLocalStorage("userData", "get");

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
    PaitentType: [],
  });

  const [mappingData, setMappingData] = useState({
    mappedData: [],
    unMappedData: [],
  });

  const [coa, setCoa] = useState([]);
  const [centreList, setCentreList] = useState([]);

  const [modalData, setModalData] = useState({ visible: false });

  const handleReactSelect = (name, value) => {
    if (name === "cog") {
      const filteredCogData = coa?.filter(
        (val) => val?.DeptCode === value?.value
      );
      setDropDownState((val) => ({
        ...val,
        Coa: filteredCogData,
      }));
      setValues((val) => ({
        ...val,
        [name]: value,
        coa: { label: "", value: "" },
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
          <CostOfSaleMappingModal
            handleClose={handleCloseModal}
            centerData={centreList}
          />
        </>
      ),
    });
  };

  const bindAllData = async () => {
    const CentreId = values?.center?.value;
    const response = await FinanceBindCostOfSaleMappingScreenData(CentreId);
    if (response?.success) {
      const cogData = response?.data?.filter((val) => val?.TypeID === 1);
      const COAdata = response?.data?.filter((val) => val?.TypeID === 2);
      const patientType = response?.data?.filter((val) => val?.TypeID === 7);
      const DepartmentData = response?.data?.filter((val) => val?.TypeID === 5);
      const hisDeptData = response?.data?.filter((val) => val?.TypeID === 6);
      const categoryData = response?.data?.filter((val) => val?.TypeID === 3);
      const subCategoryData = response?.data?.filter(
        (val) => val?.TypeID === 4
      );
      setCoa(COAdata);
      setDropDownState((val) => ({
        ...val,
        Cog: cogData,
        Coa: COAdata,
        Dept: DepartmentData,
        HisDept: hisDeptData,
        Category: categoryData,
        SubCategory: subCategoryData,
        PaitentType: patientType,
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
      COAID: Number(values?.coa?.value) || 0,
      CentreID: String(values?.center?.value) || "",
      Department: values?.dept?.value ? String(values?.dept?.value) : "",
      HISDepartment: Number(values?.hisDept?.value) || 0,
      SubCategory: Number(values?.subCategory?.value) || 0,
      CategoryID: Number(values?.category?.value) || 0,
      PatientType: String(values?.pType?.value) || "OPD",
    };

    const response = await FinanceBindCostOfSaleMappedUnMappedData(payload);
    if (response?.success) {
      setMappingData((val) => ({
        ...val,
        mappedData: response?.data?.mappedData?.map((item) => ({
          ItemID: item?.SubCategoryID,
          TypeName: item?.Name,
          ...item,
        })),
        unMappedData: response?.data?.notMappedData?.map((item) => ({
          IsActive: item?.Active,
          ItemID: item?.SubCategoryID,
          TypeName: item?.NAME,
          ...item,
        })),
      }));
    } else {
      setMappingData((val) => ({
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
      values?.hisDept?.value ||
      values?.category?.value ||
      values?.subCategory?.value ||
      values?.pType?.value
    ) {
      mappedUnmappedData();
    }
  }, [
    values?.dept,
    values?.coa,
    values?.hisDept,
    values?.category,
    values?.subCategory,
    values?.pType?.value,
  ]);

  const handleMoveLeft = async (items) => {
    if (items.length === 0) {
      notify("Please Select Items", "error");
      return;
    }
    debugger;
    if (!values?.center?.value) {
      notify("Please Select Center", "error");
      return;
    } else if (!values?.hisDept?.value) {
      notify("Please Select HIS Department", "error");
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
    } else if (!values?.pType?.value) {
      notify("Please Select Patient Type", "error");
      return;
    }

    const fullItems = mappingData.unMappedData.filter((item) =>
      items.includes(String(item.ItemID))
    ); // I only need the ItemID, so I’m skipping the full object lookup. :)

    const payload = {
      items: fullItems?.map((val) => ({
        centreID: String(values?.center?.value),
        hisDepartmnetID: Number(values?.hisDept?.value),
        departmentCode: String(values?.dept?.value),
        subCategoryID: String(val?.ItemID),
        patientType: values?.pType.label,
        coaid: values?.coa?.value ? Number(values?.coa?.value) : 0,
      })),
    };

    const response = await FinanceSaveSelectedItemRightBindCostOfSale(payload);

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
    } else if (!values?.hisDept?.value) {
      notify("Please Select HIS Department", "error");
      return;
    } else if (!values?.dept?.value) {
      notify("Please Select Department", "error");
      return;
    } else if (!values?.coa?.value) {
      notify("Please Select COA", "error");
      // return;
    } else if (!values?.pType?.value) {
    } else if (!values?.cog?.value) {
      notify("Please Select COG", "error");
      // return;
    } else if (!values?.pType?.value) {
      notify("Please Select Patient Type", "error");
      return;
    }
    const fullItems = mappingData.mappedData.filter((item) =>
      items.includes(String(item.ItemID))
    ); // I only need the ItemID, so I’m skipping the full object lookup.(Don't Judge !) :)

    const payload = {
      items: fullItems?.map((val) => ({
        centreID: String(values?.center?.value),
        hisDepartmnetID: Number(values?.hisDept?.value),
        departmentCode: String(values?.dept?.value),
        subCategoryID: String(val?.ItemID),
        patientType: values?.pType.label,
        coaid: values?.coa?.value ? Number(values?.coa?.value) : 0,
      })),
    };

    const response = await FinanceSaveSelectedItemLeftBindCostOfSale(payload);

    if (response?.success) {
      mappedUnmappedData();
    } else {
      notify(response?.message, "error");
    }
  };

  const handleExportToExcel = async () => {
    if (!values?.center?.value || !values?.dept?.value) {
      notify("Please Select Center And Department", "error");
      return;
    }
    const payload = {
      centreID: String(values?.center?.value),
      finDeptCode: String(values?.dept?.value),
    };

    const response = await FinanceExportToExcelBindCostOfSale(payload);
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
      !values?.hisDept?.value ||
      !values?.pType?.value
    ) {
      notify("Please Select Center , Patient Type &  HIS Department", "error");
      return;
    }
    debugger;
    const payload = {
      centreID: String(values?.center?.value),
      hisDepartment: String(values?.hisDept?.value),
      PatientType: String(values?.pType?.value),
    };

    const response =
      await FinanceExporttoExcelNotMappedDataBindCostOfSale(payload);
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
    <div className="card mt-3">
      <Heading
        name={"Cost Of Sale Mapping"}
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
              dynamicOptions={dropDownState?.Coa?.map((val) => ({
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
          </div>
        </div>
        <div className="mt-1 col-xl-6">
          <Heading title={"LIMS Section"} isBreadcrumb={false} />

          <div className="row p-2">
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("HIS Deptartment")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"hisDept"}
              name={"hisDept"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={dropDownState?.HisDept?.map((val) => ({
                label: val?.TextField,
                value: val?.ValueField,
              }))}
              value={values?.hisDept?.value}
            />
            <ReactSelect
              className={"required-fields"}
              placeholderName={t("Patient Type")}
              searchable={true}
              respclass="col-xl-6 col-md-4 col-sm-4 col-12"
              id={"pType"}
              name={"pType"}
              removeIsClearable={true}
              onChange={handleReactSelect}
              dynamicOptions={dropDownState?.PaitentType?.map((val) => ({
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

export default CostOfSaleMapping;
