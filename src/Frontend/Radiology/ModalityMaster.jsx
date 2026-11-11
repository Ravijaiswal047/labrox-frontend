import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { bindDepartment, bindFloor } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import { ModalityMasterValidations } from "../../utils/Schema";

import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
const ModalityMaster = () => {
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState({
    DepartmentId: "",
    ModalityName: "",
    Floor: "",
    RoomNo: "",
    IsActive: 1,
    ModalityId: "",
  });
  const [modality, setModality] = useState([]);
  const [department, setDepartment] = useState([]);
  const [floor, setFloor] = useState([]);
  const [err, setErr] = useState("");
  const handleChange = (e) => {
    const { name, value, type, checked, selectedIndex } = e.target;
    const label = e?.target?.children?.[selectedIndex]?.text;
    if (name === "DepartmentId") {
      setFormData({
        ...formData,
        [name]: value,
      });
      BindModality(value);
      setModality([]);
    } else if (name === "Floor") {
      setFormData({
        ...formData,
        [name]: label,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      });
    }
  };
  console.log(formData);
  const { t } = useTranslation();

  useEffect(() => {
    bindDepartment(setDepartment);
    bindFloor(setFloor);
    BindModality(formData?.DepartmentId);
  }, []);

  const BindModality = (value) => {
    axiosInstance
      .post("ModalityMaster/BindModalityMaster", {
        DepartmentId: value,
      })
      .then((res) => {
        setModality(res?.data?.message);
      })
      .catch((err) => {
        setModality([]);

        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  const SaveModality = () => {
    const generatedError = ModalityMasterValidations(formData);
    if (generatedError == "") {
      setLoad(true);
      axiosInstance
        .post("ModalityMaster/SaveUpdateModality", {
          ...formData,
          ModalityName: formData?.ModalityName?.trim(),
          RoomNo: formData?.RoomNo?.trim(),
        })
        .then((res) => {
          setLoad(false);
          toast?.success(res?.data?.message);
          setFormData({
            DepartmentId: "",
            ModalityName: "",
            Floor: "",
            RoomNo: "",
            IsActive: 1,
            ModalityId: "",
          });
          BindModality("");
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

  const handleEdit = (id) => {
    const editData = modality?.filter((ele, _) => {
      return ele?.ID === id;
    });
    console.log(editData);
    setFormData({
      DepartmentId: editData[0]?.DepartmentId,
      ModalityName: editData[0]?.ModalityName,
      Floor: editData[0]?.FLOOR,
      RoomNo: editData[0]?.RoomNo,
      IsActive: editData[0]?.Isactive == "1" ? 1 : 0,
      ModalityId: editData[0]?.ID,
    });
  };
  return (
    <>
      <Accordion
        name={t("Modality Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-md-2">
            <SelectBox
              options={[
                { label: "Select Department", value: "" },
                ...department,
              ]}
              lable="Department"
              className="required-fields"
              id="Department"
              selectedValue={formData?.DepartmentId}
              name="DepartmentId"
              onChange={handleChange}
            />

            {formData?.DepartmentId === "" && (
              <span className="error-message">{err?.DepartmentId}</span>
            )}
          </div>

          <div className="col-md-2">
            <Input
              className="required-fields"
              id="Modality Name"
              lable="Modality Name"
              placeholder=" "
              type="text"
              name="ModalityName"
              value={formData?.ModalityName}
              onChange={handleChange}
            />
            {formData?.ModalityName?.trim() === "" && (
              <span className="error-message">{err?.ModalityName}</span>
            )}
          </div>

          <div className="col-md-2">
            <SelectBox
              options={[{ label: "Select Floor", value: "" }, ...floor]}
              name="Floor"
              lable="Floor"
              id="Floor"
              selectedValue={formData?.Floor}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-2">
            <Input
              id="Room Number"
              lable="Room Number"
              placeholder=" "
              type="text"
              autoComplete="off"
              name="RoomNo"
              value={formData?.RoomNo}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-1">
            <input
              name="IsActive"
              type="checkbox"
              className="mt-1"
              id="IsActive"
              disabled={formData?.ModalityId == ""}
              checked={formData?.IsActive}
              onChange={handleChange}
            />
            <label htmlFor="IsActive" className="control-label">
              &nbsp;{t("IsActive")}
            </label>
          </div>
          <div className="col-md-1 col-sm-6 col-xs-12">
            {load ? (
              <Loading />
            ) : (
              <button
                type="button"
                className={`btn btn-block ${
                  formData?.ModalityId !== "" ? "btn-success" : "btn-success"
                } btn-sm`}
                onClick={SaveModality}
              >
                {formData?.ModalityId !== "" ? t("Update") : t("Save")}
              </button>
            )}
          </div>
          <div className="col-md-1 col-sm-6 col-xs-12">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              onClick={() =>
                setFormData({
                  DepartmentId: "",
                  ModalityName: "",
                  Floor: "",
                  RoomNo: "",
                  IsActive: 1,
                  ModalityId: "",
                })
              }
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {modality?.length > 0 ? (
          <>
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  <th className="text-center">{t("#")}</th>
                  <th className="text-center">{t("Department")}</th>
                  <th className="text-center">{t("Modality Name")}</th>
                  <th className="text-center">{t("Floor")}</th>
                  <th className="text-center">{t("Room No")}</th>
                  <th className="text-center">{t("Active Status")}</th>
                  <th className="text-center">{t("Edit")}</th>
                </tr>
              </thead>

              <tbody>
                {modality?.map((ele, index) => (
                  <>
                    <tr>
                      <td data-title="#" className="text-center">
                        {index + 1}
                      </td>
                      <td data-title="Department" className="text-center">
                        {ele?.SubcategoryName}
                      </td>
                      <td data-title="Modality Name" className="text-center">
                        {ele?.ModalityName}
                      </td>
                      <td data-title="Floor" className="text-center">
                        {ele?.FLOOR}
                      </td>
                      <td data-title="Room No" className="text-center">
                        {ele?.RoomNo}
                      </td>
                      <td data-title="Active Status" className="text-center">
                        {ele?.ActiveStatus}
                      </td>
                      <td data-title="Edit" className="text-center">
                        <Link
                          className="text-primary"
                          style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                          }}
                          onClick={() => handleEdit(ele?.ID)}
                        >
                          {t("Edit")}
                        </Link>
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Tables>
          </>
        ) : (
          <NoRecordFound />
        )}{" "}
      </Accordion>
    </>
  );
};

export default ModalityMaster;
