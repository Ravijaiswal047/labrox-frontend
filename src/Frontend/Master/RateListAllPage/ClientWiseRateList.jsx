// import React, { useState } from "react";
// import { LuLogs } from "react-icons/lu";
// import ReactSelect from "../../../components/formComponent/ReactSelect";
// import { SearchButton, SaveButton } from "../../../components/UI/CustomButton";
// import CustomTable from "../../../components/Table/CustomTable";
// import { useTranslation } from "react-i18next";

// const ClientWiseRateList = () => {
//   const [t] = useTranslation();

//   const dropdownList = {
//     DepartmentList: [
//       { label: "Pathology", value: 1 },
//       { label: "Radiology", value: 2 },
//       { label: "Microbiology", value: 3 },
//     ],
//     categoryList: [
//       { label: "General", value: 1 },
//       { label: "Special", value: 2 },
//     ],
//     itemsList: [
//       { label: "Hemoglobin", value: 10 },
//       { label: "WBC Count", value: 11 },
//       { label: "Sugar Test", value: 12 },
//     ],
//   };

//   const [payload, setPayload] = useState({
//     Department: "",
//     BillingCategory: "",
//     SearchByName: "",
//     Centre:'',
//     RateTypeCategory:'',
//     RateType:'',
//     DepartmentGroup:'',
//     BillingCategory:'',
//     SearchByName:'',
//   });

//   const handleReactSelectChange = (name, e) => {
//     setPayload((prev) => ({ ...prev, [name]: e?.value }));
//   };

//   // TABLE HEADERS
//   const tableHeaders = [
//     { header: "Sr.No", field: "SrNo", width: "3%" },
//     { header: "InvestigationID", field: "InvestigationID", width: "10%" },
//     { header: "InvestigationCode", field: "InvestigationCode", width: "10%" },
//     { header: "InvestigationName", field: "InvestigationName", width: "20%" },
//     { header: "BaseRate", field: "BaseRate", width: "20%" },
//     { header: "MaxRate", field: "MaxRate", width: "20%" },
//     { header: "Rate", field: "Rate", width: "20%" },
//     { header: "ItemCode", field: "ItemCode", width: "20%" },
//     { header: "ItemDisplayName", field: "ItemDisplayName", width: "20%" },
//     { header: "LastUpdatedBy", field: "LastUpdatedBy", width: "20%" },
//     { header: "Select", field: "Select", width: "20%" },
//     { header: "Log", field: "Log", width: "20%" },
//   ];

//   // DUMMY TABLE DATA (3 ROWS)
//   const initialData = [
//     {
//       SrNo: 1,
//       InvestigationID: 101,
//       InvestigationCode: "INV001",
//       InvestigationName: "Hemoglobin",
//       BaseRate: 100,
//       MaxRate: 200,
//       Rate: 150,
//       ItemCode: "HB001",
//       ItemDisplayName: "Hemoglobin Test",
//       LastUpdatedBy: "Admin",
//       isChecked: false,
//     },
//     {
//       SrNo: 2,
//       InvestigationID: 102,
//       InvestigationCode: "INV002",
//       InvestigationName: "WBC Count",
//       BaseRate: 120,
//       MaxRate: 220,
//       Rate: 180,
//       ItemCode: "WBC002",
//       ItemDisplayName: "White Blood Cell Count",
//       LastUpdatedBy: "System",
//       isChecked: false,
//     },
//     {
//       SrNo: 3,
//       InvestigationID: 103,
//       InvestigationCode: "INV003",
//       InvestigationName: "Sugar Test",
//       BaseRate: 110,
//       MaxRate: 210,
//       Rate: 160,
//       ItemCode: "SGR003",
//       ItemDisplayName: "Glucose Test",
//       LastUpdatedBy: "User",
//       isChecked: false,
//     },
//   ];

//   const [tableData, setTableData] = useState(initialData);

//   // Toggle Checkbox
//   const toggleCheckbox = (index) => {
//     const updated = [...tableData];
//     updated[index].isChecked = !updated[index].isChecked;
//     setTableData(updated);
//   };

//   // Update editable fields
//   const updateValue = (index, field, value) => {
//     const updated = [...tableData];
//     updated[index][field] = value;
//     setTableData(updated);
//   };

//   // SAVE SELECTED
//   const handleSave = () => {
//     const updated = tableData.filter((x) => x.isChecked);
//     console.log("Updated Objects:", updated);
//     alert("Check console for updated values!");
//   };

//   // RENDER FINAL TABLE DATA
//   const renderData = tableData.map((row, index) => ({
//     ...row,

//     Rate: row.isChecked ? (
//       <input
//         type="text"
//         value={row.Rate}
//         onChange={(e) => updateValue(index, "Rate", e.target.value)}
//         className="form-control"
//       />
//     ) : (
//       row.Rate
//     ),

//     ItemCode: row.isChecked ? (
//       <input
//         type="text"
//         value={row.ItemCode}
//         onChange={(e) => updateValue(index, "ItemCode", e.target.value)}
//         className="form-control"
//       />
//     ) : (
//       row.ItemCode
//     ),

//     ItemDisplayName: row.isChecked ? (
//       <input
//         type="text"
//         value={row.ItemDisplayName}
//         onChange={(e) => updateValue(index, "ItemDisplayName", e.target.value)}
//         className="form-control"
//       />
//     ) : (
//       row.ItemDisplayName
//     ),

//     Select: (
//       <input
//         type="checkbox"
//         checked={row.isChecked}
//         onChange={() => toggleCheckbox(index)}
//       />
//     ),

//     Log: <LuLogs />,
//   }));

//   return (
//     <>
//       <div className="main_container row">
//         <ReactSelect
//           dynamicOptions={[...dropdownList?.CentreList]}
//           placeholderName={t("Centre")}
//           name="Centre"
//           value={payload.Centre}
//           onChange={handleReactSelectChange}
//           respclass="col-sm-12 col-3 col-md-2"
//         />

//         <ReactSelect
//           dynamicOptions={[...dropdownList?.RateTypeCategoryList]}
//           placeholderName={t("RateTypeCategory")}
//           name="RateTypeCategory"
//           value={payload.RateTypeCategory}
//           onChange={handleReactSelectChange}
//           respclass="col-sm-12 col-3 col-md-2"
//         />

//         <ReactSelect
//           dynamicOptions={[...dropdownList?.RateTypeList]}
//           placeholderName={t("RateType")}
//           name="RateType"
//           value={payload.RateType}
//           onChange={handleReactSelectChange}
//           respclass="col-sm-12 col-3 col-md-2"
//         />

//         <ReactSelect
//           dynamicOptions={[...dropdownList?.DepartmentGroupList]}
//           placeholderName={t("DepartmentGroup")}
//           name="DepartmentGroup"
//           value={payload?.DepartmentGroup}
//           onChange={handleReactSelectChange}
//           respclass="col-sm-12 col-3 col-md-2"
//         />

//         <ReactSelect
//           dynamicOptions={[...dropdownList?.categoryList]}
//           placeholderName={t("BillingCategory")}
//           name="BillingCategory"
//           value={payload?.BillingCategory}
//           onChange={handleReactSelectChange}
//           respclass="col-sm-12 col-3 col-md-2"
//         />

//         <ReactSelect
//           dynamicOptions={[...dropdownList.itemsList]}
//           placeholderName={t("SearchByName")}
//           name="SearchByName"
//           value={payload.SearchByName}
//           onChange={handleReactSelectChange}
//           respclass="col-sm-12 col-3 col-md-2"
//         />

//         <SearchButton text={t("Search")} onClick={() => {}} />
//         <SaveButton className="mx-2" text={t("Save")} onClick={handleSave} />
//       </div>

//       <div className="my-2">
//         <CustomTable columns={tableHeaders} data={renderData} />
//       </div>
//     </>
//   );
// };

// export default ClientWiseRateList;

import React, { useState } from "react";
import { LuLogs } from "react-icons/lu";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { SearchButton, SaveButton } from "../../../components/UI/CustomButton";
import CustomTable from "../../../components/Table/CustomTable";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setLogsData, setLogToggleModal } from "../../../store/reducers/CombinedRateTypeSlice/CombinedRateTypeSlice";
import CombindRateTypeLogsModal from "./CombindRateTypeLogsModal";

const ClientWiseRateList = () => {
  const [t] = useTranslation();
  const dispatch = useDispatch();

  const [payload, setPayload] = useState({
    Centre: "",
    RateTypeCategory: "",
    RateType: "",
    DepartmentGroup: "",
    BillingCategory: "",
    SearchByName: "",
  });

  const [dropdownList, setDropdownList] = useState({
    dropdownList: [],
    RateTypeCategoryList: [],
    Department: [],
    RateTypeList: [],
    DepartmentGroupList: [],
    categoryList: [],
    itemsList: [],
  });

  const handleReactSelectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  const tableHeaders = [
    { header: "Sr.No", field: "SrNo", width: "3%" },
    { header: "InvestigationID", field: "InvestigationID", width: "10%" },
    { header: "InvestigationCode", field: "InvestigationCode", width: "10%" },
    { header: "InvestigationName", field: "InvestigationName", width: "20%" },
    { header: "BaseRate", field: "BaseRate", width: "20%" },
    { header: "MaxRate", field: "MaxRate", width: "20%" },
    { header: "Rate", field: "Rate", width: "20%" },
    { header: "ItemCode", field: "ItemCode", width: "20%" },
    { header: "ItemDisplayName", field: "ItemDisplayName", width: "20%" },
    { header: "LastUpdatedBy", field: "LastUpdatedBy", width: "20%" },
    { header: "Select", field: "Select", width: "20%" },
    { header: "Log", field: "Log", width: "20%" },
  ];

  const initialData = [
    {
      SrNo: 1,
      InvestigationID: 101,
      InvestigationCode: "INV001",
      InvestigationName: "Hemoglobin",
      BaseRate: 100,
      MaxRate: 200,
      Rate: 150,
      ItemCode: "HB001",
      ItemDisplayName: "Hemoglobin Test",
      LastUpdatedBy: "Admin",
      isChecked: false,
    },
    {
      SrNo: 2,
      InvestigationID: 102,
      InvestigationCode: "INV002",
      InvestigationName: "WBC Count",
      BaseRate: 120,
      MaxRate: 220,
      Rate: 180,
      ItemCode: "WBC002",
      ItemDisplayName: "White Blood Cell Count",
      LastUpdatedBy: "System",
      isChecked: false,
    },
    {
      SrNo: 3,
      InvestigationID: 103,
      InvestigationCode: "INV003",
      InvestigationName: "Sugar Test",
      BaseRate: 110,
      MaxRate: 210,
      Rate: 160,
      ItemCode: "SGR003",
      ItemDisplayName: "Glucose Test",
      LastUpdatedBy: "User",
      isChecked: false,
    },
  ];

  const [tableData, setTableData] = useState(initialData);

  const toggleCheckbox = (index) => {
    const updated = [...tableData];
    updated[index].isChecked = !updated[index].isChecked;
    setTableData(updated);
  };

  const updateValue = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;
    setTableData(updated);
  };

  const handleSave = () => {
    const updated = tableData.filter((x) => x.isChecked);
    console.log("Updated Objects:", updated);
  };

  const handleLogsModal = (row, idx) => {
    dispatch(setLogToggleModal(true))
    dispatch(setLogsData(row))
  };

  const renderData = tableData.map((row, index) => ({
    ...row,

    Rate: row.isChecked ? (
      <input
        type="text"
        value={row.Rate}
        onChange={(e) => updateValue(index, "Rate", e.target.value)}
        className="form-control"
      />
    ) : (
      row.Rate
    ),

    ItemCode: row.isChecked ? (
      <input
        type="text"
        value={row.ItemCode}
        onChange={(e) => updateValue(index, "ItemCode", e.target.value)}
        className="form-control"
      />
    ) : (
      row.ItemCode
    ),

    ItemDisplayName: row.isChecked ? (
      <input
        type="text"
        value={row.ItemDisplayName}
        onChange={(e) => updateValue(index, "ItemDisplayName", e.target.value)}
        className="form-control"
      />
    ) : (
      row.ItemDisplayName
    ),

    Select: (
      <input
        type="checkbox"
        checked={row.isChecked}
        onChange={() => toggleCheckbox(index)}
      />
    ),

    Log: (
      <Button
        onClick={() => handleLogsModal(row, index)}
        className="logs_btn text-white rounded px-2"
      >
        <LuLogs />
      </Button>
    ),
  }));

  return (
    <>
      <div className="main_container row">
        <ReactSelect
          dynamicOptions={dropdownList.CentreList}
          placeholderName={t("Centre")}
          name="Centre"
          value={payload.Centre}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={dropdownList.RateTypeCategoryList}
          placeholderName={t("RateTypeCategory")}
          name="RateTypeCategory"
          value={payload.RateTypeCategory}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={dropdownList.RateTypeList}
          placeholderName={t("RateType")}
          name="RateType"
          value={payload.RateType}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={dropdownList.DepartmentGroupList}
          placeholderName={t("DepartmentGroup")}
          name="DepartmentGroup"
          value={payload.DepartmentGroup}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={dropdownList.Department}
          placeholderName={t("Department")}
          name="Department"
          value={payload.Department}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={dropdownList.categoryList}
          placeholderName={t("BillingCategory")}
          name="BillingCategory"
          value={payload.BillingCategory}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={dropdownList.itemsList}
          placeholderName={t("SearchByName")}
          name="SearchByName"
          value={payload.SearchByName}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />
        <div>
          <SearchButton text={t("Search")} onClick={() => {}} />
          <SaveButton className="mx-2" text={t("Save")} onClick={handleSave} />
        </div>
      </div>

      <div className="my-2">
        <CustomTable columns={tableHeaders} data={renderData} />
      </div>
      <CombindRateTypeLogsModal title="Client Wise RateList Update Logs"/>
    </>
  );
};

export default ClientWiseRateList;
