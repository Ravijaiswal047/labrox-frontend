import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Tables from "../../../../components/UI/customTable";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { getCategoryType } from "../../../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { SaveButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const ItemTypeMasterModel = () => {
  const { t } = useTranslation();
  const userData = useLocalStorage("userData", "get");
  const initialState = {
    SubCategory: "",
    ItemTypeCode: "",
    ItemTypeName: "",
    Description: "",
    Status: true,
  };
  const [payload, setPayload] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [DropDownList, setDropDownList] = useState({
    subcategorylist: [],
    bindtablelist: [],
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };

  const GetBindSubcattype = () => {
    axiosInstance
      .get("ItemTypeMaster/subcattype")
      .then((res) => {
        let data = res.data.message;
        if (data?.length > 0) {
          setDropDownList((prev) => ({ ...prev, subcategorylist: data }));
        } else {
          toast.error("No Data Found");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  const BindTable = () => {
    axiosInstance
      .get("ItemTypeMaster/binddepartment")
      .then((res) => {
        let data = res.data.message;
        console.log(data);
        if (data?.length > 0) {
          setDropDownList((prev) => ({ ...prev, bindtablelist: data }));
        } else {
          toast.error("No Data Found");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  useEffect(() => {
    GetBindSubcattype();
    BindTable();
  }, []);

  const handleEdit = (row) => {
    console.log(row);
    setIsUpdate(true);
    setPayload({
      SubCategory: row?.id,
      ItemTypeCode: row?.subCategoryCode,
      ItemTypeName: row?.subCategoryName,
      Description: row?.description,
      Status: row?.status === "Active" ? true : false,
      itemTypeID: row?.subCategoryID,
    });
  };

  const handleSave = () => {
    let tempErrors = {};
    if (!payload?.SubCategory)
      tempErrors.SubCategory = "Sub Category is required";
    if (!payload?.ItemTypeName)
      tempErrors.ItemTypeName = "Item Type Name is required";
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    const commonData = {
      name: String(payload?.ItemTypeName || ""),
      active: Number(payload?.Status) || 0,
      subCategoryTypeID: Number(payload?.SubCategory || 0),
      code: String(payload?.ItemTypeCode || ""),
      description: String(payload?.Description || ""),
    };

    const requestBody = commonData;
    const requestBodyUpdate = {
      ...commonData,
      subCategoryID: Number(payload?.itemTypeID || 0),
    };

    const apiCall = !isUpdate
      ? axiosInstance.post("ItemTypeMaster/savegroup", requestBody)
      : axiosInstance.post(
        "ItemTypeMaster/updatesubcategory",
        requestBodyUpdate
      );

    apiCall
      .then((res) => {
        if (res?.data?.success || isUpdate) {
          toast.success(res?.data?.message);
          BindTable();
          setPayload(initialState);
          if (isUpdate) setIsUpdate(false);
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch(() => toast.error("Something went wrong"));
  };

  return (
    <>
      {/* <div className="card"> */}
      {/* <Heading name={"Category Type Details"} isBreadcrumb={true} /> */}
      <div className="row">
        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <ReactSelect
            name="SubCategory"
            id="SubCategory "
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Select", value: "" },
              ...DropDownList?.subcategorylist?.map((item) => ({
                label: item?.subCategoryTypeName,
                value: item?.subCategoryTypeID,
              })),
            ]}
            placeholderName="Sub Category"
            value={payload?.SubCategory}
            onChange={handleSelectChange}
            respclass={""}
            className={"required-fields"}
          />
          {errors?.SubCategory && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.SubCategory}
            </div>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <Input
            type="text"
            placeholder=" "
            lable="Item Type Code"
            id="ItemTypeCode"
            name="ItemTypeCode"
            value={payload?.ItemTypeCode}
            onChange={handleChange}
            respclass={""}
            maxLength={50}
            // className={"required-fields"}
            disabled={userData?.ST_AutoGenerateSubcategoryCode == "1"}
          />
          {errors?.ItemTypeCode && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.ItemTypeCode}
            </div>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <Input
            type="text"
            placeholder=" "
            lable="Item Type  Name"
            id="ItemTypeName"
            name="ItemTypeName"
            value={payload?.ItemTypeName}
            onChange={handleChange}
            respclass={""}
            maxLength={50}
            className={"required-fields"}
          />
          {errors?.ItemTypeName && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.ItemTypeName}
            </div>
          )}
        </div>
        <TextAreaInput
          name={"Description"}
          id={"Description"}
          lable={"Description"}
          value={payload?.Description}
          rows={1}
          maxLength={200}
          onChange={handleChange}
          respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
        />
        <Form.Check
          type="switch"
          id="Status"
          name="Status"
          label={t("isActive")}
          checked={payload.Status}
          onChange={(e) => handleChange(e)}
          className="m-0"
        />
        {/* <div className="col-sm-1">
          <button className="btn btn-sm btn-success" onClick={handleSave}>
            {isUpdate ? t("Update") : t("Save")}
          </button> */}
        <div className="col-sm-1">
          <SaveButton
            text={isUpdate ? t("Update") : t("Save")}
            onClick={handleSave}
          />
        </div>
      </div>
      {/* </div> */}
      <div className="card mt-2">
        <Heading name={"Item Type Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("ID")}</th>
                  <th>{t("Category Type Name")}</th>
                  <th>{t("SubCategoryType Name")}</th>
                  <th>{t("Item Category Code")}</th>
                  <th>{t("Item Category Name")}</th>
                  <th>{t("Description")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Edit")}</th>
                </tr>
              </thead>
              <tbody>
                {DropDownList?.bindtablelist?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="ID">{row?.ID || index + 1}</td>

                    <td data-title="Category Type Name">
                      {row?.categoryTypeName}
                    </td>
                    <td data-title="Sub Category Type Name">
                      {row?.itemCategoryName}
                    </td>
                    <td data-title="Item Category Code">
                      {row?.subCategoryCode}
                    </td>
                    <td data-title="Item Category Name">
                      {row?.subCategoryName}
                    </td>
                    <td data-title="Description">
                      <span style={{ wordBreak: "break-word", whiteSpace: "normal" }}>
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
      </div>
    </>
  );
};

export default ItemTypeMasterModel;
