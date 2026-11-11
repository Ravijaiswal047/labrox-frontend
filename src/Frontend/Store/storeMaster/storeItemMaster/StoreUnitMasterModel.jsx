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

const StoreUnitMasterModel = () => {
  const { t } = useTranslation();
  const initialState = {
    Name: "",
    Status: true,
    AllowDecimalValue: false,
  };
  const [payload, setPayload] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);
  const [tableData, setTableData] = useState([]);
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

  const BindTable = () => {
    axiosInstance
      .get("StoreUnitMaster/bindunit")
      .then((res) => {
        let data = res.data.message;
        if (data?.length > 0) {
          setTableData(data);
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
    BindTable();
  }, []);
  const handleEdit = (row) => {
    console.log(row);
    setIsUpdate(true);
    setPayload({
      Name: row?.name,
      Status: row?.status === "Yes" ? true : false,
      AllowDecimalValue: row?.allowDecimalValue === "Yes" ? true : false,
      id: row?.id,
    });
  };
  console.log(payload?.id);
  const handleSave = () => {
    let tempErrors = {};
    if (!payload?.Name) { tempErrors.Name = "Name is Required", toast.error("Name is required") };
    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    const requestBody = {
      name: String(payload?.Name) || "",
      allowDecimalValue: payload?.AllowDecimalValue === true ? "1" : "0",
    };

    const requestBodyUpdate = {
      id: Number(payload?.id) || 0,
      name: String(payload?.Name) || "",
      allowDecimalValue: payload?.AllowDecimalValue,
    };

    const apiCall = !isUpdate
      ? axiosInstance.post("StoreUnitMaster/saveunit", requestBody)
      : axiosInstance.post("StoreUnitMaster/updateunit", requestBodyUpdate);

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
            respclass={""}
            className={"required-fields"}
          />
          {errors?.Name && (
            <div className="text-danger" style={{ fontSize: "12px" }}>
              {errors?.Name}
            </div>
          )}
        </div>
        {/* <div className="col-sm-3 d-flex align-items-center">
          <label className="switch">
            <input
              type="checkbox"
              checked={payload.Status}
              onChange={handleChange}
              name="Status"
            />
            <span className="slider"></span>
          </label>
          <strong className="ml-2 mb-2">{t("IsActive")}</strong>
        </div> */}
        <div className="col-sm-3 d-flex align-items-center">
          <label className="switch">
            <input
              type="checkbox"
              checked={payload.AllowDecimalValue}
              onChange={handleChange}
              name="AllowDecimalValue"
            />
            <span className="slider"></span>
          </label>
          <strong className="ml-2 mb-2">{t("AllowDecimalValue")}</strong>
        </div>

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
                  <th>{t("AllowDecimalValue")}</th>
                  <th>{t("Edit")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="ID">{row.id}</td>
                    <td data-title="Name">{row?.name}</td>
                    <td data-title="AllowDecimalValue">
                      {row?.allowDecimalValue}
                    </td>
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

export default StoreUnitMasterModel;
