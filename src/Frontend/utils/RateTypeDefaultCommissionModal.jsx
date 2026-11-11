import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { isChecked } from "../util/Commonservices";
import { number } from "../../utils/helpers";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const RateTypeDefaultCommissionModal = ({ show, handleClose, RateTypeID }) => {
  const [Department, setDepartment] = useState([]);
  const [RateTypeData, setRateTypeData] = useState([]);
  const { t } = useTranslation();

  const ID = {
    RateTypeID: RateTypeID ? RateTypeID : "",
  };

  const getDepartment = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        let data = res.data.message;
        let Department = data.map((ele) => {
          return {
            DepartmentID: ele.DepartmentID,
            Department: ele.Department,
            isChecked: false,
            CommissionPer: "",
          };
        });
        setDepartment(Department);
      })
      .catch((err) => console.log(err));
  };

  const RemoveDefaultCommission = () => {
    let data = RateTypeData.filter((ele) => ele?.isChecked === true);
    data.map((ele) => {
      return {
        DepartmentID: ele?.DepartmentID,
      };
    });
    if (data.length > 0) {
      axiosInstance
        .post("RateTypeCommission/RemoveDefaultCommission", data)
        .then((res) => {
          toast.success(res?.data?.message);
          getRateTypeData();
          getDepartment();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else {
      toast.error("Please Select one row");
    }
  };

  const getRateTypeData = () => {
    axiosInstance
      .post("RateTypeCommission/getDefaultRateTypeCommissionData", {
        RateTypeID: ID.RateTypeID,
      })
      .then((res) => {
        if (res.status === 200) {
          const data = res.data.message;
          const val = data.map((ele) => {
            return {
              ...ele,
              isChecked: false,
            };
          });
          setRateTypeData(val);
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
          : name === "CommissionPer"
            ? parseInt(value) > 100
              ? ""
              : value
            : value;
      setDepartment(data);
    } else {
      if (type === "checkbox") {
        if (checked) {
          const data = Department.map((ele) => {
            return {
              ...ele,
              [name]: checked,
            };
          });
          setDepartment(data);
        } else {
          const data = Department.map((ele) => {
            return {
              ...ele,
              CommissionPer: name === "CommissionPer" ? "" : value,
              [name]: checked,
            };
          });
          setDepartment(data);
          document.getElementById("CommissionPer").value = "";
        }
      } else {
        const data = Department.map((ele) => {
          return {
            ...ele,
            CommissionPer:
              name === "CommissionPer" ? (parseInt(value) > 100 ? "" : value) : "",
          };
        });
        setDepartment(data);
        if (name === "CommissionPer") {
          let data = document.getElementById("CommissionPer").value;
          if (parseInt(data) > 100) {
            document.getElementById("CommissionPer").value = "";
          }
        }
      }
    }
  };

  const Save = () => {
    const data = Department?.filter((ele) => ele.isChecked === true);
    if (data.length > 0) {
      axiosInstance
        .post("RateTypeCommission/DefaultRateTypeCommissionCreate", {
          RateTypeID: ID.RateTypeID,
          Data: data,
        })
        .then((res) => {
          if (res.data.message) {
            toast.success(res.data.message);
            getRateTypeData();
            getDepartment();
          } else {
            toast.error("Something went wrong");
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    } else {
      toast.error("Please Select one Row");
    }
  };

  useEffect(() => {
    getDepartment();
    getRateTypeData();
  }, []);

  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("Department Commission")}
        visible={show}
        onHide={() => {
          handleClose();
        }}
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
                    placeholder={t("Commission %")}
                    style={{
                      width: "100px",
                      borderRadius: "3px",
                      border: "1px solid #ced4da",
                      textAlign: "left",
                      padding: "0 5px",
                    }}
                    name="CommissionPer"
                    onChange={handleChange}
                    onInput={(e) => number(e, 3)}
                    id="CommissionPer"
                    disabled={
                      Department?.length > 0
                        ? isChecked("isChecked", Department, true).includes(
                            false,
                          )
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
                      Department?.length > 0
                        ? isChecked("isChecked", Department, true).includes(
                            false,
                          )
                          ? false
                          : true
                        : false
                    }
                  />
                  {t("All")}
                </th>
              </tr>
            </thead>
            <tbody>
              {Department?.map((ele, index) => (
                <tr key={index}>
                  <td data-title={t("S .No")}>{index + 1}</td>
                  <td data-title={t("Department Name")}>{ele?.Department}</td>
                  <td data-title={t("CommissionPer")}>
                    <input
                      className=""
                      style={{
                        width: "100px",
                        borderRadius: "3px",
                        border: "1px solid #ced4da",
                        textAlign: "left",
                        padding: "0 5px",
                      }}
                      disabled={ele?.isChecked ? false : true}
                      type="number"
                      name="CommissionPer"
                      id="CommissionPer"
                      value={ele?.CommissionPer}
                      onChange={(e) => handleChange(e, index)}
                      onInput={(e) => number(e, 3)}
                    />
                  </td>
                  <td data-title={"#"}>
                    <input
                      type="checkbox"
                      name="isChecked"
                      onChange={(e) => handleChange(e, index)}
                      checked={ele?.isChecked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        )}
        <div className="row mt-2 mb-2">
          <div className="col-sm-3">
            <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              id="btnSave"
              onClick={Save}
            >
              {t("Save")}
            </button>
          </div>
          <div className="col-sm-3">
            <button
              type="button"
              className="btn btn-block btn-danger btn-sm"
              id="btnSave"
              onClick={handleClose}
            >
              {t("Close")}
            </button>
          </div>
        </div>
        {RateTypeData.length > 0 && (
          <>
            <Tables>
              <thead>
                <tr>
                  <th>{t("S.No.")}</th>
                  <th>{t("Department Name")}</th>
                  <th>{t("Commission %")}</th>
                  <th>{t("Delete")}</th>
                </tr>
              </thead>
              <tbody>
                {RateTypeData?.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                    <td data-title={t("Department Name")}>
                      {ele?.Department}&nbsp;
                    </td>
                    <td data-title={t("Commission %")}>{ele?.CommissionPer}&nbsp;</td>
                    <td data-title={t("Delete")}>
                      <input
                        type="checkbox"
                        checked={ele?.isChecked}
                        name="isChecked"
                        onChange={(e) => {
                          const { name, checked } = e.target;
                          const data = [...RateTypeData];
                          data[index][name] = checked;
                          setRateTypeData(data);
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
                  id="btnSave"
                  onClick={RemoveDefaultCommission}
                >
                  {t("Delete")}
                </button>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default RateTypeDefaultCommissionModal;
