import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { TokenGenerationMasterValidations } from "../../utils/Schema";
import { bindDepartment } from "../../utils/NetworkApi/commonApi";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
const TokenGenerationMaster = () => {
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState({
    DepartmentId: "",
    ResetType: "Day",
    GroupName: "",
    Sequence: "",
    ModalityId: "",
    DepartmentName: "",
    Modality: "",
  });
  const [token, setToken] = useState([]);
  const [department, setDepartment] = useState([]);
  const [modality, setModality] = useState([]);
  const [saveData, setSaveData] = useState([]);
  const [err, setErr] = useState("");
  const handleChange = (e) => {
    const { name, value, selectedIndex } = e.target;
    const label = e?.target?.children?.[selectedIndex]?.text;
    if (name === "DepartmentId") {
      setFormData({
        ...formData,
        [name]: value,
        DepartmentName: label,
        ModalityId: "",
      });
      ShowGridByCategoryWise(value);
      BindModality(value);
    } else if (name === "ModalityId") {
      setFormData({
        ...formData,
        [name]: value,
        Modality: label,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  console.log(formData);
  const { t } = useTranslation();
  const BindModality = (value) => {
    axiosInstance
      .post("/ModalityMaster/BindModality", {
        DepartmentId: value,
      })
      .then((res) => {
        let data = res.data.message;
        let responce = data.map((ele) => {
          return {
            value: ele.Id,
            label: ele.NAME,
          };
        });
        setModality(responce);
      })
      .catch((err) => {
        setModality([]);
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  const ShowGridByCategoryWise = (value) => {
    axiosInstance
      .post("/ModalityMaster/ShowGridByCategoryWise", {
        DepartmentId: value,
      })
      .then((res) => {
        setToken(res?.data?.message);
      })
      .catch((err) => {
        setToken([]);
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  const handleAddToken = () => {
    const generatedError = TokenGenerationMasterValidations(formData);
    if (generatedError == "") {
      setSaveData([
        ...saveData,
        {
          ...formData,
          GroupName: formData?.GroupName?.trim(),
          Sequence: formData?.Sequence?.trim(),
        },
      ]);
      setFormData({
        DepartmentId: "",
        ResetType: "Day",
        GroupName: "",
        Sequence: "",
        ModalityId: "",
        DepartmentName: "",
        Modality: "",
      });
      setErr("");
      ShowGridByCategoryWise("");
    } else setErr(generatedError);
  };
  const handleRemoveToken = (i) => {
    const SlicedData = [...saveData];
    SlicedData.splice(i, 1);
    setSaveData(SlicedData);
  };

  const handleSaveToken = () => {
    const generatedError = TokenGenerationMasterValidations(formData);
    if (generatedError == "" || saveData?.length > 0) {
      setLoad(true);
      axiosInstance
        .post("/ModalityMaster/SaveTokenMaster", {
          SaveToken:
            saveData?.length > 0
              ? saveData
              : [
                  {
                    ...formData,
                    GroupName: formData?.GroupName?.trim(),
                    Sequence: formData?.Sequence?.trim(),
                  },
                ],
        })
        .then((res) => {
          setLoad(false);
          toast.success(res?.data?.message);
          setFormData({
            DepartmentId: "",
            ResetType: "Day",
            GroupName: "",
            Sequence: "",
            ModalityId: "",
            DepartmentName: "",
            Modality: "",
          });
          setSaveData([]);
          ShowGridByCategoryWise("");
          setErr("");
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else setErr(generatedError);
  };
  const handleEdit = (ele) => {
    axiosInstance
      .post("/ModalityMaster/EditGroup", {
        GroupName: ele?.GroupName,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        ShowGridByCategoryWise(formData?.DepartmentId);
      })
      .catch((err) => {
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  console.log(formData);
  useEffect(() => {
    bindDepartment(setDepartment);
    BindModality("");
    ShowGridByCategoryWise("");
  }, []);
  return (
    <>
      <Accordion
        name="Token Generation Master"
        isBreadcrumb={true}
        defaultValue={true}
      >
        <>
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-12 col-md-2">
              <SelectBox
                lable="Department"
                id="Department"
                options={[
                  { label: "Select Department", value: "" },
                  ...department,
                ]}
                selectedValue={formData?.DepartmentId}
                name="DepartmentId"
                onChange={handleChange}
                className="required-fields"
              />
              {formData?.DepartmentId === "" && (
                <span className="error-message">{err?.DepartmentId}</span>
              )}
            </div>
            <label className="col-md-1 requiredlabel" htmlFor="Modality">
              {t("Reset Time")} :
            </label>
            <div className="col-md-2">
              <div className="row">
                <div className="col-md-3 mt-1">
                  <input
                    type="radio"
                    name="ResetType"
                    value="Day"
                    id="Day"
                    checked={formData?.ResetType == "Day"}
                    onChange={handleChange}
                  />
                  &nbsp;
                  <label htmlFor="Day">{t("Day")}</label>
                </div>

                <div className="col-md-4 mt-1">
                  <input
                    type="radio"
                    name="ResetType"
                    value="Month"
                    id="Month"
                    checked={formData?.ResetType == "Month"}
                    onChange={handleChange}
                  />
                  &nbsp;
                  <label htmlFor="Month">{t("Month")}</label>
                </div>

                <div className="col-md-3 mt-1">
                  <input
                    type="radio"
                    name="ResetType"
                    value="Year"
                    id="Year"
                    checked={formData?.ResetType == "Year"}
                    onChange={handleChange}
                  />
                  &nbsp;
                  <label htmlFor="Year">{t("Year")}</label>{" "}
                </div>
              </div>
            </div>

            <div className="col-md-2">
              <Input
                id="Group Name"
                lable="Group Name"
                placeholder=" "
                type="text"
                autoComplete="off"
                className="required-fields"
                name="GroupName"
                value={formData?.GroupName}
                onChange={handleChange}
              />
              {formData?.GroupName === "" && (
                <span className="error-message">{err?.GroupName}</span>
              )}
            </div>

            <div className="col-md-2">
              <Input
                id="Token Prefix"
                lable="Token Prefix"
                placeholder=" "
                type="text"
                autoComplete="off"
                className="required-fields"
                name="Sequence"
                value={formData?.Sequence}
                onChange={handleChange}
              />
              {formData?.Sequence === "" && (
                <span className="error-message">{err?.Sequence}</span>
              )}
            </div>
            <div className="col-md-2">
              <SelectBox
                id="Modality Name"
                lable="Modality Name"
                placeholder=" "
                options={[{ label: "Select Modality", value: "" }, ...modality]}
                className="required-fields"
                selectedValue={formData?.ModalityId}
                name="ModalityId"
                onChange={handleChange}
              />
              {formData?.ModalityId === "" && (
                <span className="error-message">{err?.ModalityId}</span>
              )}
            </div>
            <div className="col-md-1">
              <button
                type="button"
                className={"btn btn-block btn-primary btn-sm"}
                onClick={handleAddToken}
              >
                {t("Add")}
              </button>
            </div>
          </div>

          {saveData?.length > 0 && (
            <>
              <div
                style={{
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <Tables
                  className="table table-bordered table-hover table-striped tbRecord"
                  cellPadding="{0}"
                  cellSpacing="{0}"
                >
                  <thead
                    className="cf text-center"
                    style={{
                      position: "sticky",
                      zIndex: 99,
                      top: 0,
                    }}
                  >
                    <tr>
                      <th className="text-center">{t("#")}</th>
                      <th className="text-center">{t("Department Name")}</th>
                      <th className="text-center">{t("Token Prefix")}</th>
                      <th className="text-center">{t("Modality Name")}</th>
                      <th className="text-center">{t("Group Name")}</th>
                      <th className="text-center">{t("ResetTime")}</th>{" "}
                      <th className="text-center">{t("Remove")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {saveData?.map((ele, index) => (
                      <>
                        <tr>
                          <td data-title="#" className="text-center">
                            {index + 1}
                          </td>
                          <td
                            data-title="Department Name"
                            className="text-center"
                          >
                            {ele?.DepartmentName}
                          </td>
                          <td data-title="Token Prefix" className="text-center">
                            {ele?.Sequence}
                          </td>
                          <td
                            data-title="Modality Name"
                            className="text-center"
                          >
                            {ele?.Modality}
                          </td>
                          <td data-title="Group Name" className="text-center">
                            {ele?.GroupName}
                          </td>
                          <td data-title="Reset Time" className="text-center">
                            {ele?.ResetType}
                          </td>
                          <td data-title="Remove" className="text-center">
                            <button
                              className="btn btn-danger btn-sm w-3"
                              onClick={() => handleRemoveToken(index)}
                            >
                              X
                            </button>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </Tables>
              </div>
            </>
          )}
          <div
            className="row mt-1 mb-2"
            style={{ display: "flex", justifyContent: "center" }}
          >
            <div className="col-md-1">
              {load ? (
                <Loading />
              ) : (
                <button
                  type="button"
                  className={"btn btn-block btn-success btn-sm"}
                  onClick={handleSaveToken}
                >
                  {t("Save")}
                </button>
              )}
            </div>
          </div>
        </>
      </Accordion>

      <Accordion title={t("Search Detail")} defaultValue={true}>
        <Tables
          className="table table-bordered table-hover table-striped tbRecord"
          cellPadding="{0}"
          cellSpacing="{0}"
        >
          <thead className="cf text-center" style={{ zIndex: 99 }}>
            <tr>
              <th className="text-center">{t("#")}</th>
              <th className="text-center">{t("Token Type")}</th>
              <th className="text-center">{t("Department")}</th>
              <th className="text-center">{t("Modality Name")}</th>
              <th className="text-center">{t("Group Name")}</th>
              <th className="text-center">{t("Token Prefix")}</th>
              <th className="text-center">{t("Reset Type")}</th>

              <th className="text-center">{t("Delete")}</th>
            </tr>
          </thead>
          {token?.length > 0 && (
            <tbody>
              {token?.map((ele, index) => (
                <>
                  <tr>
                    <td data-title="#" className="text-center">
                      {index + 1}
                    </td>
                    <td data-title="Token Type" className="text-center">
                      {ele?.Token_Type}
                    </td>
                    <td data-title="Department" className="text-center">
                      {ele?.department}
                    </td>
                    <td data-title="Modality Name" className="text-center">
                      {ele?.ModalityName}
                    </td>
                    <td data-title="Group Name" className="text-center">
                      {ele?.GroupName}
                    </td>
                    <td data-title="Token Prefix" className="text-center">
                      {ele?.Sequence}
                    </td>
                    <td data-title="Reset Type" className="text-center">
                      {ele?.ResetType}
                    </td>

                    <td data-title="Edit" className="text-center">
                      <Link
                        className="text-primary"
                        style={{
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                        onClick={() => handleEdit(ele)}
                      >
                        {t("Delete")}
                      </Link>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          )}
        </Tables>
      </Accordion>
    </>
  );
};

export default TokenGenerationMaster;
