import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { isChecked } from "../util/Commonservices";
import { number } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const CentreShareDefaultModal = ({ show, handleClose, CentreID }) => {
  const [Department, setDepartment] = useState([]);
  const [CentreShareData, setCentreShareData] = useState([]);
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const data = res.data.message;
        const mapped = data.map((ele) => ({
          DepartmentID: ele.DepartmentID,
          Department: ele.Department,
          isChecked: false,
          SharePer: "",
        }));
        setDepartment(mapped);
      })
      .catch((err) => console.log(err));
  };

  const getCentreShareData = () => {
    axiosInstance
      .post("CentreShare/getDefaultCentreShareData", { CentreID: CentreID || "" })
      .then((res) => {
        if (res.status === 200) {
          const val = (res.data.message || []).map((ele) => ({ ...ele, isChecked: false }));
          setCentreShareData(val);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    if (index >= 0) {
      const data = [...Department];
      data[index][name] =
        type === "checkbox"
          ? checked
          : name === "SharePer"
          ? parseInt(value) > 100
            ? ""
            : value
          : value;
      setDepartment(data);
    } else {
      if (type === "checkbox") {
        if (checked) {
          setDepartment(Department.map((ele) => ({ ...ele, [name]: checked })));
        } else {
          setDepartment(
            Department.map((ele) => ({
              ...ele,
              SharePer: name === "SharePer" ? "" : value,
              [name]: checked,
            }))
          );
          document.getElementById("CentreShareDefaultSharePer").value = "";
        }
      } else {
        setDepartment(
          Department.map((ele) => ({
            ...ele,
            SharePer: name === "SharePer" ? (parseInt(value) > 100 ? "" : value) : "",
          }))
        );
        if (name === "SharePer") {
          const el = document.getElementById("CentreShareDefaultSharePer");
          if (el && parseInt(el.value) > 100) el.value = "";
        }
      }
    }
  };

  const Save = () => {
    const data = Department.filter((ele) => ele.isChecked === true);
    if (data.length === 0) {
      toast.error("Please Select one Row");
      return;
    }
    axiosInstance
      .post("CentreShare/DefaultCentreShareCreate", { CentreID: CentreID || "", Data: data })
      .then((res) => {
        if (res.data.message) {
          toast.success(res.data.message);
          getCentreShareData();
          getDepartment();
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Something Went Wrong"));
  };

  const RemoveDefaultShare = () => {
    const data = CentreShareData.filter((ele) => ele.isChecked === true);
    if (data.length === 0) {
      toast.error("Please Select one row");
      return;
    }
    axiosInstance
      .post("CentreShare/RemoveDefaultShare", data)
      .then((res) => {
        toast.success(res?.data?.message);
        getCentreShareData();
        getDepartment();
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message ? err.response.data.message : "Something Went Wrong")
      );
  };

  useEffect(() => {
    getDepartment();
    getCentreShareData();
  }, []);

  return (
    <Dialog
      header={t("Global Centre Share")}
      visible={show}
      onHide={handleClose}
      draggable={false}
      className={theme}
      style={{ width: "500px" }}
    >
      {Department.length > 0 && (
        <Tables>
          <thead className="cf">
            <tr>
              <th>{t("S .No")}</th>
              <th>{t("Department Name")}</th>
              <th>
                <input
                  type="number"
                  placeholder={t("Share %")}
                  style={{
                    width: "100px",
                    borderRadius: "3px",
                    border: "1px solid #ced4da",
                    textAlign: "left",
                    padding: "0 5px",
                  }}
                  name="SharePer"
                  onChange={handleChange}
                  onInput={(e) => number(e, 3)}
                  id="CentreShareDefaultSharePer"
                  disabled={
                    Department.length > 0
                      ? isChecked("isChecked", Department, true).includes(false)
                        ? true
                        : false
                      : false
                  }
                />
              </th>
              <th>
                <input
                  type="checkbox"
                  name="isChecked"
                  onChange={handleChange}
                  checked={
                    Department.length > 0
                      ? !isChecked("isChecked", Department, true).includes(false)
                      : false
                  }
                />
                {t("All")}
              </th>
            </tr>
          </thead>
          <tbody>
            {Department.map((ele, index) => (
              <tr key={index}>
                <td data-title={t("S .No")}>{index + 1}</td>
                <td data-title={t("Department Name")}>{ele.Department}</td>
                <td data-title={t("SharePer")}>
                  <input
                    style={{
                      width: "100px",
                      borderRadius: "3px",
                      border: "1px solid #ced4da",
                      textAlign: "left",
                      padding: "0 5px",
                    }}
                    disabled={!ele.isChecked}
                    type="number"
                    name="SharePer"
                    value={ele.SharePer}
                    onChange={(e) => handleChange(e, index)}
                    onInput={(e) => number(e, 3)}
                  />
                </td>
                <td data-title="#">
                  <input
                    type="checkbox"
                    name="isChecked"
                    onChange={(e) => handleChange(e, index)}
                    checked={ele.isChecked}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Tables>
      )}

      <div className="row mt-2 mb-2">
        <div className="col-sm-3">
          <button type="button" className="btn btn-block btn-success btn-sm" onClick={Save}>
            {t("Save")}
          </button>
        </div>
        <div className="col-sm-3">
          <button type="button" className="btn btn-block btn-danger btn-sm" onClick={handleClose}>
            {t("Close")}
          </button>
        </div>
      </div>

      {CentreShareData.length > 0 && (
        <>
          <Tables>
            <thead>
              <tr>
                <th>{t("S.No.")}</th>
                <th>{t("Department Name")}</th>
                <th>{t("Share %")}</th>
                <th>{t("Delete")}</th>
              </tr>
            </thead>
            <tbody>
              {CentreShareData.map((ele, index) => (
                <tr key={index}>
                  <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                  <td data-title={t("Department Name")}>{ele.Department}&nbsp;</td>
                  <td data-title={t("Share %")}>{ele.SharePer}&nbsp;</td>
                  <td data-title={t("Delete")}>
                    <input
                      type="checkbox"
                      checked={ele.isChecked}
                      name="isChecked"
                      onChange={(e) => {
                        const { name, checked } = e.target;
                        const data = [...CentreShareData];
                        data[index][name] = checked;
                        setCentreShareData(data);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
          <div className="row mt-2 mb-2">
            <div className="col-sm-3">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={RemoveDefaultShare}
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
};

export default CentreShareDefaultModal;
