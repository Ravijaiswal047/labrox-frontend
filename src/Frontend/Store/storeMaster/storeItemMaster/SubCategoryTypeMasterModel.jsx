import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Tables from "../../../../components/UI/customTable";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { SaveButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const SubCategoryTypeMasterModel = () => {
  const userData = useLocalStorage("userData", "get");
  const ST_AutoGenerateSubcategoryCode = userData?.ST_AutoGenerateSubcategoryCode;
  const { t } = useTranslation();
  const initialState = {
    Category: "",
    SubCategoryTypeCode: "",
    SubCategoryTypeName: "",
    Description: "",
    Status: true,
  };
  const [payload, setPayload] = useState(initialState);
  const [isUpdate, setIsUpdate] = useState(false);
  const [errors, setErrors] = useState({});
  const [DropDownList, setDropDownList] = useState({
    categorylist: [],
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
      .get("AddSubCategoryType/bindcattype")
      .then((res) => {
        let data = res.data.message;
        if (data?.length > 0) {
          setDropDownList((prev) => ({ ...prev, categorylist: data }));
        } else {
          toast.error("No Data Found");
        }
      })
      .catch((err) => {
        console.log(err);
        // toast.error("Something went wrong");
      });
  };
  const BindTable = () => {
    axiosInstance
      .get("AddSubCategoryType/binddepartment")
      .then((res) => {
        let data = res.data.message;
        if (data?.length > 0) {
          setDropDownList((prev) => ({ ...prev, bindtablelist: data }));
        } else {
          toast.error("No Data Found");
        }
      })
      .catch((err) => {
        console.log(err);
        // toast.error("Something went wrong");
      });
  };
  useEffect(() => {
    GetBindSubcattype();
    BindTable();
  }, []);
  const handleEdit = (row) => {
    setIsUpdate(true);
    setPayload({
      Category: row?.categoryTypeID,
      SubCategoryTypeCode: row?.code,
      SubCategoryTypeName: row?.subCategoryTypeName,
      Description: row?.description,
      Status: row?.status === "Active" ? true : false,
      subCategoryTypeID: row?.subCategoryTypeID,
      categoryTypeID: row?.categoryTypeID,
    });
    // setAutoCompleteVal(row?.categoryTypeName);
  };

  const handleSave = () => {
    let tempErrors = {};

    if (!payload?.Category) {
      tempErrors.Category = "Category is required";
    }
    if (!payload?.SubCategoryTypeName) {
      tempErrors.SubCategoryTypeName = "Sub Category Type Name is required";
    }

    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;
    const requestBody = {
      name: String(payload?.SubCategoryTypeName) || "",
      active: Number(payload?.Status) || 0,
      category: Number(payload?.Category) || 0,
      code: String(payload?.SubCategoryTypeCode) || "",
      description: String(payload?.Description) || "",
      glCodeInventory: "",
      glCodeConsumption: "",
    };
    const requestBodyUpdate = {
      subCategoryTypeID: Number(payload?.subCategoryTypeID) || 0,
      name: String(payload?.SubCategoryTypeName) || "",
      active: payload?.Status,
      categoryTypeID: Number(payload?.Category) || 0,
      code: String(payload?.SubCategoryTypeCode) || "",
      description: String(payload?.Description) || "",
      glCodeInventory: "",
      glCodeConsumption: "",
    };
    if (!isUpdate) {
      axiosInstance
        .post("AddSubCategoryType/savegroup", requestBody)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            BindTable();
            setPayload(initialState);
          } else {
            toast.error(res?.data?.message);
          }
        })
        .catch(() => toast.error("Something went wrong"));
    } else {
      axiosInstance
        .post("AddSubCategoryType/updategroup", requestBodyUpdate)
        .then((res) => {
          toast.success(res?.data?.message);
          BindTable();
          setIsUpdate(false);
          setPayload(initialState);
        })
        .catch(() => toast.error("Something went wrong"));
    }
  };

  return (
    <>
      {/* <div className="card"> */}
      {/* <Heading name={"Category Type Details"} isBreadcrumb={true} /> */}
      <div className="row">
        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <ReactSelect
            name="Category"
            id="Category "
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Select", value: "" },
              ...DropDownList?.categorylist?.map((item) => ({
                label: item?.categoryTypeName,
                value: item?.categoryTypeID,
              })),
            ]}
            placeholderName="Category"
            value={payload?.Category}
            onChange={handleSelectChange}
            respclass={""}
            className={"required-fields"}
          />
          {errors?.Category && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.Category}
            </div>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <Input
            type="text"
            placeholder=" "
            lable="Sub CategoryType Code"
            id="SubCategoryTypeCode"
            name="SubCategoryTypeCode"
            value={payload?.SubCategoryTypeCode}
            onChange={handleChange}
            maxLength={50}
            respclass={""}
            // className={"required-fields"}
            disabled={userData?.ST_AutoGenerateSubcategoryCode == "1"}
          />
          {errors?.SubCategoryTypeCode && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.SubCategoryTypeCode}
            </div>
          )}
        </div>
        <div className="col-xl-2 col-sm-4 col-md-6 co-12">
          <Input
            type="text"
            placeholder=" "
            lable="Sub CategoryType Name"
            id="SubCategoryTypeName"
            name="SubCategoryTypeName"
            value={payload?.SubCategoryTypeName}
            onChange={handleChange}
            respclass={""}
            maxLength={50}
            className={"required-fields"}
          />
          {errors?.SubCategoryTypeName && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.SubCategoryTypeName}
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
          label={t("IsActive")}
          checked={payload.Status}
          onChange={(e) => handleChange(e)}
          className="m-0"
        />
        {/* <div className="col-sm-1">
          <button className="btn btn-sm btn-success" onClick={handleSave}>
            {isUpdate ? t("Update") : t("Save")}
          </button>
        </div> */}
        <div className="col-sm-1">
          <SaveButton
            text={isUpdate ? t("Update") : t("Save")}
            onClick={handleSave}
          />
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Sub Category Type Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("ID")}</th>
                  <th>{t("Category Type Code")}</th>
                  <th>{t("Category Type Name")}</th>
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
                    <td data-title="Sr. No.">{index + 1}</td>
                    <td data-title="Category Type Code">
                      {row?.categoryTypeCode}
                    </td>
                    <td data-title="Category Type Name">
                      {row?.categoryTypeName}
                    </td>
                    <td data-title="Item Category Code">{row?.code}</td>
                    <td data-title="Item Category Name">
                      {row?.subCategoryTypeName}
                    </td>
                    <td data-title="description">
                      <span
                        style={{ wordBreak: "break-word", whiteSpace: "normal" }}
                      >
                        {row?.description}
                      </span>
                    </td>
                    <td data-title="status">{row?.status}</td>
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

export default SubCategoryTypeMasterModel;
