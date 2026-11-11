import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getTrimmedData, PreventSpecialCharacter } from "../../utils/helpers";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";

const CentreTypeMaster = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [formData, setFormData] = useState({
    CentreType: "",
    IsActive: true,
  });
  const [tableData, setTableData] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const reg = /^([^0-9$%]*)$/;
    if (type == "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      if (PreventSpecialCharacter(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    }
  };

  const UpdateCentreType = () => {
    const payload = {
      type: formData?.CentreType?.trim(),
      id: formData?.id,
      IsActive: formData?.IsActive == true ? 1 : 0,
    };
    setLoad(true);
    if (payload?.type.length > 2) {
      axiosInstance
        .post("/Centre/UpdateCentreType", getTrimmedData(payload))
        .then((res) => {
          toast.success(res?.data?.message);
          setFormData({
            CentreType: "",
            IsActive: false,
          });
          getTableData();
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could Not Update",
          );
        });
    } else {
      setLoad(false);
      toast.error("CentreType must have atleast 3 characters");
    }
  };
  const SaveCentreType = () => {
    const payload = {
      type: formData?.CentreType.trim(),
      IsActive: formData?.IsActive == true ? 1 : 0,
    };
    if (payload?.type.length > 2) {
      setLoad(true);
      axiosInstance
        .post("/Centre/SaveCentreType", payload)
        .then((res) => {
          toast.success(
            res?.data?.message
              ? res?.data?.message
              : "CentreType Saved Successfully",
          );
          setFormData({
            CentreType: "",
            IsActive: false,
          });
          getTableData();
          setLoad(false);
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Could Not Save",
          );
        });
    } else {
      setLoad(false);
      toast.error("CentreType must have atleast 3 characters");
    }
  };

  const handleEditCentreType = (ele) => {
    setFormData({
      id: ele?.id,
      CentreType: ele?.type,
      IsActive: ele?.IsActive == 1 ? true : false,
    });
    window.scroll(0, 0);
  };

  const getTableData = () => {
    axiosInstance
      .get("Centre/GetCentreTypeData")
      .then((res) => {
        if (res?.data.message) {
          console.log(res.data.message);
          setTableData(res?.data?.message);
        } else {
          setTableData([]);
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        console.log(err?.response?.data?.message);
      });
  };

  useEffect(() => {
    getTableData();
  }, []);

  console.log(tableData);
  return (
    <>
      <Accordion
        name={t("Centre Type Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              onChange={handleChange}
              className="required-fields"
              value={formData?.CentreType}
              name="CentreType"
              type="text"
              placeholder=""
              lable="Centre Type"
              id="Centre Type"
              max={20}
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="IsActive"
                id="IsActive"
                className="mb-3"
                type="checkbox"
                onChange={handleChange}
                checked={formData.IsActive}
              />
            </div>
            <label htmlFor="IsActive" className="ml-2">
              {t("IsActive")}
            </label>
          </div>
          {load ? (
            <Loading />
          ) : (
            <div className="col-sm-1">
              {!formData?.id && (
                <button
                  type="button"
                  className="btn btn-success btn-sm w-100"
                  onClick={SaveCentreType}
                >
                  {t("Save")}
                </button>
              )}
              {formData?.id && (
                <button
                  type="button"
                  className="btn btn-warning btn-sm"
                  onClick={UpdateCentreType}
                >
                  {t("Update")}
                </button>
              )}
            </div>
          )}
          <div className="col-sm-1"></div>
          <div className="col-sm-7 m-0 p-1">
            <Tables data={tableData ?? []}>
              <thead className="cf thead-class" style={{ zIndex: 99 }}>
                <tr>
                  <th className="text-center">{t("S.No")}</th>
                  <th className="text-center">{t("CentreType")}</th>
                  <th className="text-center">{t("Status")}</th>
                  <th className="text-center">
                    <i className="fa fa-edit"></i>
                  </th>
                </tr>
              </thead>

              <tbody>
                {tableData.map((ele, index) => (
                  <tr key={ele.ID}>
                    <td data-title="#" className="text-center">
                      {index + 1}
                    </td>
                    <td data-title={t("CentreType")} className="text-center">
                      {ele?.type} &nbsp;
                    </td>
                    <td data-title={t("Active")} className="text-center">
                      {ele?.IsActive == 1 ? "Active" : "Inactive"} &nbsp;
                    </td>
                    <td data-title={t("Select")} className="text-center">
                      <button
                        className="btn btn-primary btn-sm btn-class"
                        onClick={() => handleEditCentreType(ele)}
                      >
                        <i className="fa fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default CentreTypeMaster;
