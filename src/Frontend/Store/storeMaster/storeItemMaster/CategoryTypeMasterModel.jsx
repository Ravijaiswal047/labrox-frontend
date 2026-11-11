import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { AutoComplete } from "primereact/autocomplete";
import { Form } from "react-bootstrap";
import { SaveButton } from "../../../../components/UI/CustomButton";

const CategoryTypeMasterModel = ({ setDropDownList }) => {
  const { t } = useTranslation();
  const initialState = {
    CategoryTypeCode: "",
    CategoryTypeName: "",
    Description: "",
    Status: true,
  };

  const [payload, setPayload] = useState(initialState);
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [tableData, setTableData] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getbinddepartment = () => {
    axiosInstance
      .get("AddCategoryType/binddepartment")
      .then((res) => {
        if (res?.data?.success) {
          setTableData(res.data.message || []);
          toast.success(res.data.message);
        } else {
          toast.error(res?.data?.message || "Failed to load department data");
          setTableData([]);
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong while fetching departments");
      });
  };

  useEffect(() => {
    getbinddepartment();
  }, []);

  const handleEdit = (row) => {
    console.log(row);
    setIsUpdate(true);
    setPayload({
      CategoryTypeCode: row?.categoryTypeCode,
      CategoryTypeName: row?.categoryTypeName,
      Description: row?.description,
      Status: row?.status === "Active" ? true : false,
      categoryTypeID: row?.categoryTypeID,
    });
    setAutoCompleteVal(row?.categoryTypeName);
  };
  console.log(payload?.Status);

  const handleSave = () => {
    if (!payload?.CategoryTypeCode) {
      toast.error("Category Type Code is required");
      return;
    }
    if (!payload?.CategoryTypeName) {
      toast.error("Category Type Name is required");
      return;
    }

    const requestBody = {
      categoryTypeCode: payload?.CategoryTypeCode || "",
      categoryTypeName: payload?.CategoryTypeName || "",
      description: payload?.Description || "",
      active: payload?.Status,
    };

    if (!isUpdate) {
      axiosInstance
        .post("AddCategoryType/savegroup", requestBody)
        .then((res) => {
          toast.success(res?.data?.message);
          // setDropDownList();
          getbinddepartment();
          setPayload(initialState);
          setAutoCompleteVal("");
        })
        .catch(() => toast.error("Something went wrong"));
    } else {
      axiosInstance
        .post("AddCategoryType/updategroup", {
          ...requestBody,
          categoryTypeID: payload?.categoryTypeID || 0,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          // setDropDownList()
          getbinddepartment();
          setIsUpdate(false);
          setPayload(initialState);
          setAutoCompleteVal("");
        })
        .catch(() => toast.error("Something went wrong"));
    }
  };

  const searchEmployees = (query) => {
    axiosInstance
      .post("AddCategoryType/bindOldItemName", {
        categoryTypeName: query || "",
      })
      .then((res) => {
        setStockSuggestions(
          Array.isArray(res?.data?.message) ? res.data.message : []
        );
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ fontSize: "12px", width: "100%" }}>
        {item?.itemNameGroup}
      </div>
    </div>
  );

  const handleAutoCompleteSelect = (e) => {
    const selected = e.value;
    setPayload((prev) => ({
      ...prev,
      CategoryTypeName: selected?.itemNameGroup || selected,
    }));
    setAutoCompleteVal(selected?.itemNameGroup || selected);
  };

  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.itemNameGroup : e.value;
    setAutoCompleteVal(val);
    searchEmployees(val);
  };

  return (
    <>
      <div className="row">
        <Input
          type="text"
          placeholder=" "
          lable="CategoryType Code"
          id="CategoryTypeCode"
          name="CategoryTypeCode"
          value={payload?.CategoryTypeCode}
          onChange={handleChange}
          maxLength={50}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          className={"required-fields"}
        />

        {/* <div className="col-xl-3 col-md-6 col-sm-4 col-12 pb-2">
          <AutoComplete
            style={{ width: "100%" }}
            value={autoCompleteVal}
            suggestions={stockSuggestions}
            completeMethod={() => searchEmployees(autoCompleteVal)}
            className="w-100 required-fields"
            onSelect={handleAutoCompleteSelect}
            id="empName"
            onChange={handleAutoCompleteChange}
            itemTemplate={itemTemplate}
          />
          <label htmlFor="empName" className="lable searchtest">
            CategoryType Name
          </label>
        </div> */}

        <Input
          type="text"
          placeholder=" "
          lable="CategoryType Name"
          id="CategoryTypeName"
          name="CategoryTypeName"
          value={payload?.CategoryTypeName}
          onChange={handleChange}
          maxLength={50}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
          className={"required-fields"}
        />

        <TextAreaInput
          name={"Description"}
          id={"Description"}
          lable={"Description"}
          value={payload?.Description}
          rows={1}
          onChange={handleChange}
          maxLength={200}
          respclass={"col-xl-3 col-sm-4 col-md-6 col-12 customeClass"}
        />
        <Form.Check
          type="switch"
          id="Status"
          name="Status"
          label={t("IsActive")}
          checked={payload.Status}
          onChange={(e) => handleChange(e)}
          className="m-0"
        />
        <div className="col-sm-1">
          <SaveButton
            text={isUpdate ? t("Update") : t("Save")}
            onClick={handleSave}
          />

        </div>
      </div>

      <div className="card mt-2">
        <Heading name={"Category Type Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("ID")}</th>
                  <th>{t("Category Type Code")}</th>
                  <th>{t("Category Type Name")}</th>
                  <th>{t("Description")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Edit")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr. No.">{index + 1}</td>
                    <td data-title="Category Type Code">
                      {row?.categoryTypeCode}
                    </td>
                    <td data-title="Category Type Name">
                      {row?.categoryTypeName}
                    </td>
                    <td data-title="Description">
                      <span
                        style={{wordBreak: "break-word", whiteSpace: "normal"}}
                      >
                        {row?.description}
                      </span>
                    </td>
                    <td data-title="Status">{row?.status}</td>
                    <td data-title="Edit">
                      <i
                        className="fa fa-edit"
                        onClick={() => handleEdit(row)}
                      ></i>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div >
    </>
  );
};

export default CategoryTypeMasterModel;
