import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { SaveButton, SearchButton } from "../../../components/UI/CustomButton";
import CustomTable from "../../../components/Table/CustomTable";
import { LuLogs } from "react-icons/lu";
import { axiosInstance } from "../../../utils/axiosInstance";
import { Button } from "react-bootstrap";
import CombindRateTypeLogsModal from "./CombindRateTypeLogsModal";
import { useDispatch } from "react-redux";
import { setLogsData, setLogToggleModal } from "../../../store/reducers/CombinedRateTypeSlice/CombinedRateTypeSlice";

const ItemWiseRateList = () => {
  const dispatch = useDispatch();
  const [t] = useTranslation();
  const [dropdownList, setDropdownList] = useState({
    groupList: [],
    DepartmentList: [],
    categoryList: [],
    itemsList: [],
  });

  const [payload, setPayload] = useState({
    Item: "",
    Group: "",
    Department: "",
    Category: "",
    ItemName: "",
  });

  const getDepartmentList = async () => {
    await axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        console.log(res);
        const resList = res?.data?.message?.map((item, _) => ({
          label: item?.Department,
          value: item?.DepartmentID,
        }));
        setDropdownList((prev) => ({ ...prev, DepartmentList: resList }));
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {});
  };

  const getBillingCategory = () => {
    axiosInstance
      .get("Investigations/BindBillingCategory")
      .then((res) => {
        let data = res.data.message;
        let resList = data.map((ele) => {
          return {
            value: ele?.BillingCategoryId,
            label: ele?.BillingCategoryName,
          };
        });
        setDropdownList((prev) => ({ ...prev, categoryList: resList }));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getItems = async (depID = 0, bilCat = 0) => {
    const itemPayload = {
      departmentID: Number(depID || payload?.Department) || 0,
      billingCategory: Number(bilCat || payload?.Category) || 0,
    };
    await axiosInstance
      .post("RateList/getItemList", itemPayload)
      .then((res) => {
        console.log(res);
        const resList = res?.data?.message?.map((item, _) => ({
          ...item,
          label: item?.TestName,
          value: item?.InvestigationID,
        }));
        setDropdownList((prev) => ({ ...prev, itemsList: resList }));
      });
  };

  useEffect(() => {
    getDepartmentList();
    getBillingCategory();
    getItems();
  }, []);

  const handleReactSelectChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
    if (name == "Department") {
      getItems(e?.value, 0);
    }
    if (name == "Category") {
      getItems(0, e?.value);
    }
  };

  const handleSearch = () => {
    getRateList();
    console.log(payload);
  };

  const tableHeaders = [
    { header: "Sr.No", field: "SrNo", width: "3%" },
    { header: "RateTypeID", field: "RateTypeID", width: "10%" },
    { header: "RateTypeID", field: "RateTypeID2", width: "10%" }, // duplicate allowed
    { header: "RateTypeName", field: "RateTypeName", width: "20%" },
    { header: "BaseRate", field: "BaseRate", width: "20%" },
    { header: "MaxRate", field: "MaxRate", width: "20%" },
    { header: "Rate", field: "Rate", width: "20%" },
    { header: "ItemCode", field: "ItemCode", width: "20%" },
    { header: "ItemDisplayName", field: "ItemDisplayName", width: "20%" },
    { header: "LastUpdatedBy", field: "LastUpdatedBy", width: "20%" },
    { header: "Select", field: "Select", width: "20%" },
    { header: "Log", field: "Log", width: "20%" },
  ];

  // Dummy Data (5 rows)
  const initialData = [
    {
      SrNo: 1,
      RateTypeID: 23,
      RateTypeID2: 23,
      RateTypeName: "General",
      BaseRate: 150,
      MaxRate: 300,
      Rate: 200,
      ItemCode: "IT001",
      ItemDisplayName: "Hemoglobin",
      LastUpdatedBy: "Admin",
      isChecked: false,
    },
    {
      SrNo: 2,
      RateTypeID: 24,
      RateTypeID2: 24,
      RateTypeName: "Special",
      BaseRate: 250,
      MaxRate: 500,
      Rate: 350,
      ItemCode: "IT002",
      ItemDisplayName: "Liver Test",
      LastUpdatedBy: "System",
      isChecked: false,
    },
    {
      SrNo: 3,
      RateTypeID: 25,
      RateTypeID2: 25,
      RateTypeName: "Premium",
      BaseRate: 200,
      MaxRate: 450,
      Rate: 300,
      ItemCode: "IT003",
      ItemDisplayName: "Kidney Test",
      LastUpdatedBy: "Admin",
      isChecked: false,
    },
    {
      SrNo: 4,
      RateTypeID: 26,
      RateTypeID2: 26,
      RateTypeName: "General",
      BaseRate: 180,
      MaxRate: 400,
      Rate: 260,
      ItemCode: "IT004",
      ItemDisplayName: "Sugar Test",
      LastUpdatedBy: "User1",
      isChecked: false,
    },
    {
      SrNo: 5,
      RateTypeID: 27,
      RateTypeID2: 27,
      RateTypeName: "Special",
      BaseRate: 220,
      MaxRate: 420,
      Rate: 310,
      ItemCode: "IT005",
      ItemDisplayName: "Thyroid Test",
      LastUpdatedBy: "User2",
      isChecked: false,
    },
  ];

  const [tableData, setTableData] = useState(initialData);

  // Toggle Checkbox
  const toggleCheckbox = (index) => {
    const updated = [...tableData];
    updated[index].isChecked = !updated[index].isChecked;
    setTableData(updated);
  };

  // Update Editable Fields (Rate, ItemCode, ItemDisplayName)
  const updateValue = (index, field, value) => {
    const updated = [...tableData];
    updated[index][field] = value;
    setTableData(updated);
  };

  // SAVE ONLY SELECTED ROWS
  const handleSave = () => {
    const updated = tableData.filter((x) => x.isChecked);
    console.log("Updated Rows:", updated);
    alert("Updated rows logged in console!");
  };

  const getRateList = async () => {
    const getdataType = dropdownList?.categoryList?.find(
      (item) => item?.value == payload?.Category
    );
    const rateListPayload = {
      BillingCategory: String(payload?.Category) || "",
      CentreID: 2965,
      DepartmentID: String(payload?.Department) || "",
      TestID: String(payload?.ItemName) || "",
      dataType: getdataType?.label || "",
    };
    await axiosInstance
      .post("/RateList/RateListGet", rateListPayload)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {});
  };

  const handleLogsModal = (row, idx) => {
    dispatch(setLogToggleModal(true));
    dispatch(setLogsData(row));
  };

  const renderData = tableData.map((row, i) => ({
    ...row,
    Rate: row.isChecked ? (
      <input
        type="text"
        value={row.Rate}
        onChange={(e) => updateValue(i, "Rate", e.target.value)}
        className="form-control"
      />
    ) : (
      row.Rate
    ),

    ItemCode: row.isChecked ? (
      <input
        type="text"
        value={row.ItemCode}
        onChange={(e) => updateValue(i, "ItemCode", e.target.value)}
        className="form-control"
      />
    ) : (
      row.ItemCode
    ),

    ItemDisplayName: row.isChecked ? (
      <input
        type="text"
        value={row.ItemDisplayName}
        onChange={(e) => updateValue(i, "ItemDisplayName", e.target.value)}
        className="form-control"
      />
    ) : (
      row.ItemDisplayName
    ),

    Select: (
      <input
        type="checkbox"
        checked={row.isChecked}
        onChange={() => toggleCheckbox(i)}
      />
    ),

    Log: (
      <Button
        onClick={() => handleLogsModal(row, i)}
        className="logs_btn text-white rounded px-2"
      >
        <LuLogs />
      </Button>
    ),
  }));

  return (
    <>
      {/* Search Filters */}
      <div className="main_container row">
        <ReactSelect
          dynamicOptions={[]}
          placeholderName={t("Group")}
          id="Group"
          name="Group"
          value={payload.Group}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2 d-none"
        />

        <ReactSelect
          dynamicOptions={[...dropdownList?.DepartmentList]}
          placeholderName={t("Department")}
          id="Department"
          name="Department"
          value={payload.Department}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={[...dropdownList?.categoryList]}
          placeholderName={t("Category")}
          id="Category"
          name="Category"
          value={payload.Category}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <ReactSelect
          dynamicOptions={[...dropdownList?.itemsList]}
          placeholderName={t("ItemName")}
          id="ItemName"
          name="ItemName"
          value={payload.ItemName}
          onChange={handleReactSelectChange}
          respclass="col-sm-12 col-3 col-md-2"
        />

        <SearchButton text={t("Search")} onClick={handleSearch} />
        <SaveButton className="mx-2" text={t("Save")} onClick={handleSave} />
      </div>

      {/* Table */}
      <div className="info_section d-flex align-item-center my-2">
        <p>
          <strong>Investigation ID: </strong>
          <span>xxx</span>
        </p>
        <p>
          <strong>Investigation Code: </strong>
          <span>xxx</span>
        </p>
        <p>
          <strong>Investigation Name: </strong>
          <span>xxx</span>
        </p>
      </div>
      <div className="my-2">
        <CustomTable columns={tableHeaders} data={renderData} />
      </div>
      <CombindRateTypeLogsModal title={t("Item wise RateList Update Logs")} />
    </>
  );
};
export default ItemWiseRateList;
