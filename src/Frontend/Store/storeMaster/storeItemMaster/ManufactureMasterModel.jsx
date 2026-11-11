import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Heading from "../../../../components/UI/Heading";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { CustomButton } from "../../../../components/UI/CustomButton";
import "../../index.css";
const ManufactureMasterModel = () => {
  const { t } = useTranslation();
  const [DropDownList, setDropDownList] = useState({
    subcategorylist: [],
    bindtablelist: [],
  });
  const initialState = {
    Name: "",
    ContactPerson: "",
    DLNo: "",
    TinNo: "",
    Mobile: "",
    Phone: "",
    Email: "",
    Fax: "",
    Address1: "",
    Address2: "",
    Address3: "",
    Country: "",
    City: "",
    Pincode: "",
    Status: true,
  };
  const [payload, setPayload] = useState(initialState);
  const [isUpdate, setIsUpdate] = useState(false);
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
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
      .get("StoreManufactureMaster/bindmanufacture")
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
    console.log("Editing row:", row);
    setIsUpdate(true);
    setPayload({
      Name: row?.name || "",
      ContactPerson: row?.contact_Person || "",
      DLNo: row?.dlno || "",
      TinNo: row?.tinno || "",
      Mobile: row?.mobile || "",
      Phone: row?.phone || "",
      Email: row?.email || "",
      Fax: row?.fax || "",
      Address1: row?.address || "",
      Address2: row?.address2 || "",
      Address3: row?.address3 || "",
      Country: row?.country || "",
      City: row?.city || "",
      Pincode: row?.pinCode || "",
      Status: row?.status === "Active" ? true : false,
      ManufactureID: row?.id || 0,
    });
  };

  const handleSave = () => {
    let tempErrors = {};
    if (!payload?.Name) { tempErrors.Name = "Name is required", toast.error("Name is required") };
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    const commonData = {
      name: String(payload?.Name || ""),
      contactPerson: String(payload?.ContactPerson || ""),
      address: String(payload?.Address1 || ""),
      address2: String(payload?.Address2 || ""),
      address3: String(payload?.Address3 || ""),
      phone: String(payload?.Phone || ""),
      mobile: String(payload?.Mobile || ""),
      fax: String(payload?.Fax || ""),
      country: String(payload?.Country || ""),
      city: String(payload?.City || ""),
      pincode: String(payload?.Pincode || ""),
      dlNo: String(payload?.DLNo || ""),
      tinNo: String(payload?.TinNo || ""),
      email: String(payload?.Email || ""),
      active: payload?.Status,
    };

    const requestBody = commonData;
    const requestBodyUpdate = {
      ...commonData,
      manufactureID: String(payload?.ManufactureID) || "",
      IsActive: payload?.Status,
    };

    const apiCall = !isUpdate
      ? axiosInstance.post("StoreManufactureMaster/savedata", requestBody)
      : axiosInstance.post("StoreManufactureMaster/update", requestBodyUpdate);

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
      <div className="row">
        <div className="col-xl-3 col-sm-4 col-md-6 co-12">

          <Input
            type="text"
            placeholder=" "
            lable="Name"
            id="Name"
            name="Name"
            value={payload?.Name}
            onChange={handleChange}
            className={"required-fields"}
            respclass={""}
          />
          {errors?.Name && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.Name}
            </div>
          )}
        </div>
        <Input
          type="text"
          placeholder=" "
          lable="Contact Person"
          id="ContactPerson"
          name="ContactPerson"
          value={payload?.ContactPerson}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />

        <Input
          type="number"
          placeholder=" "
          lable="DL No"
          id="DLNo"
          name="DLNo"
          value={payload?.DLNo}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="number"
          placeholder=" "
          lable="Tin No"
          id="TinNo"
          name="TinNo"
          value={payload?.TinNo}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="number"
          placeholder=" "
          lable="Mobile"
          id="Mobile"
          name="Mobile"
          value={payload?.Mobile}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="number"
          placeholder=" "
          lable="Phone"
          id="Phone"
          name="Phone"
          value={payload?.Phone}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="email"
          placeholder=" "
          lable="Email"
          id="Email"
          name="Email"
          value={payload?.Email}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Fax"
          id="Fax"
          name="Fax"
          value={payload?.Fax}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Address1"
          id="Address1"
          name="Address1"
          value={payload?.Address1}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Address2"
          id="Address2"
          name="Address2"
          value={payload?.Address2}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Address3"
          id="Address3"
          name="Address3"
          value={payload?.Address3}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="Country"
          id="Country"
          name="Country"
          value={payload?.Country}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="text"
          placeholder=" "
          lable="City"
          id="City"
          name="City"
          value={payload?.City}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
        />
        <Input
          type="number"
          placeholder=" "
          lable="Pincode"
          id="Pincode"
          name="Pincode"
          value={payload?.Pincode}
          onChange={handleChange}
          respclass={"col-xl-3 col-sm-4 col-md-6 co-12"}
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
          <button
            className="btn btn-sm btn block btn-success"
            onClick={handleSave}
          >
            {isUpdate ? t("Update") : t("Save")}
          </button>
        </div> */}
        <CustomButton
          className="ml-3"
          icon={"save"}
          text={isUpdate ? t("Update") : t("Save")}
          onClick={handleSave}

        />
      </div>
      <div className="card mt-2">
        <Heading name={"Store Manufacture Master Detail"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables
              style={{
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              <thead style={{ position: "sticky", top: -1 }}>
                <tr>
                  <th>{t("ID")}</th>
                  <th>{t("Name")}</th>
                  <th>{t("Contact Person")}</th>
                  <th>{t("Contact No")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Edit")}</th>
                </tr>
              </thead>
              <tbody>
                {DropDownList?.bindtablelist?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="ID">{row?.id}</td>
                    <td data-title="Name">{row?.name}</td>
                    <td data-title="Contact Person">{row?.contact_Person}</td>
                    <td data-title="Contact No">{row?.mobile}</td>
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

export default ManufactureMasterModel;
