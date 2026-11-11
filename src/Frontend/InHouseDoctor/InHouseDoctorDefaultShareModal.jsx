import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { isChecked } from "../util/Commonservices";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";

const shareTypeOptions = [
  { label: "Percentage", value: "Percentage" },
  { label: "Rupees", value: "Amount" },
];
const calculationOptions = [
  { label: "Gross", value: "Gross" },
  { label: "Net", value: "Net" },
];
const discountOnOptions = [
  { label: "Lab", value: "Lab" },
  { label: "Doctor", value: "Doctor" },
  { label: "Both", value: "Both" },
];

const InHouseDoctorDefaultShareModal = ({ show, handleClose, DoctorID }) => {
  const [departmentList, setDepartmentList] = useState([]);
  const [savedDefaults, setSavedDefaults] = useState([]);
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const getDepartmentList = () => {
    axiosInstance
      .get("Department/getDepartment")
      .then((res) => {
        const list = res.data.message.map((ele) => ({
          DepartmentID: ele.DepartmentID,
          Department: ele.Department,
          isChecked: false,
          ShareType: "",
          ShareValue: "",
          CalculationBasis: "",
          DiscountOn: "",
        }));
        setDepartmentList(list);
      })
      .catch((err) => console.log(err));
  };

  const getSavedDefaults = () => {
    axiosInstance
      .post("InHouseDoctor/GetDefaultDoctorShare", { employeeID: Number(DoctorID) })
      .then((res) => {
        if (Array.isArray(res?.data?.data)) {
          setSavedDefaults(res.data.data.map((e) => ({ ...e, isChecked: false })));
        }
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (index, field, value) => {
    const data = [...departmentList];
    data[index][field] = value;
    setDepartmentList(data);
  };

  const Save = () => {
    const data = departmentList.filter((ele) => ele.isChecked === true);
    if (data.length === 0) {
      toast.error("Please Select one Row");
      return;
    }
    axiosInstance
      .post("InHouseDoctor/SaveDefaultDoctorShare", {
        employeeID: Number(DoctorID),
        Data: data.map((d) => ({
          DepartmentID: d.DepartmentID,
          ShareType: d.ShareType,
          ShareValue: Number(d.ShareValue) || 0,
          CalculationBasis: d.CalculationBasis,
          DiscountOn: d.DiscountOn,
        })),
      })
      .then((res) => {
        if (res?.data?.message) {
          toast.success(res.data.message);
          getSavedDefaults();
          getDepartmentList();
        } else {
          toast.error("Something went wrong");
        }
      })
      .catch((err) => toast.error(err?.response?.data?.message));
  };

  const RemoveDefault = () => {
    const data = savedDefaults.filter((ele) => ele.isChecked === true);
    if (data.length === 0) {
      toast.error("Please Select one row");
      return;
    }
    axiosInstance
      .post("InHouseDoctor/RemoveDefaultDoctorShare", data.map((d) => ({ DepartmentID: d.DepartmentID })))
      .then((res) => {
        toast.success(res?.data?.message);
        getSavedDefaults();
        getDepartmentList();
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Something Went Wrong"));
  };

  useEffect(() => {
    getDepartmentList();
    getSavedDefaults();
  }, []);

  return (
    <Dialog
      header={t("Default Doctor Share")}
      visible={show}
      onHide={handleClose}
      draggable={false}
      className={theme}
      style={{ width: "800px" }}
    >
      {departmentList.length > 0 && (
        <Tables>
          <thead className="cf">
            <tr>
              <th>{t("S.No")}</th>
              <th>{t("Department Name")}</th>
              <th>{t("Share Type")}</th>
              <th>{t("Share Value")}</th>
              <th>{t("Calculation")}</th>
              <th>{t("Discount On")}</th>
              <th>
                <input
                  type="checkbox"
                  name="isChecked"
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setDepartmentList(departmentList.map((ele) => ({ ...ele, isChecked: checked })));
                  }}
                  checked={
                    departmentList.length > 0
                      ? !isChecked("isChecked", departmentList, true).includes(false)
                      : false
                  }
                />
                {t(" All")}
              </th>
            </tr>
          </thead>
          <tbody>
            {departmentList.map((ele, index) => (
              <tr key={index}>
                <td data-title={t("S.No")}>{index + 1}</td>
                <td data-title={t("Department Name")}>{ele.Department}</td>
                <td data-title={t("Share Type")}>
                  <ReactSelect
                    dynamicOptions={shareTypeOptions}
                    value={ele.ShareType}
                    onChange={(_, selected) =>
                      handleChange(index, "ShareType", selected ? selected.value : "")
                    }
                    isDisabled={!ele.isChecked}
                    placeholderName=""
                  />
                </td>
                <td data-title={t("Share Value")}>
                  <Input
                    type="number"
                    value={ele.ShareValue}
                    onChange={(e) => handleChange(index, "ShareValue", e.target.value)}
                    disabled={!ele.isChecked}
                  />
                </td>
                <td data-title={t("Calculation")}>
                  <ReactSelect
                    dynamicOptions={calculationOptions}
                    value={ele.CalculationBasis}
                    onChange={(_, selected) =>
                      handleChange(index, "CalculationBasis", selected ? selected.value : "")
                    }
                    isDisabled={!ele.isChecked}
                    placeholderName=""
                  />
                </td>
                <td data-title={t("Discount On")}>
                  <ReactSelect
                    dynamicOptions={discountOnOptions}
                    value={ele.DiscountOn}
                    onChange={(_, selected) =>
                      handleChange(index, "DiscountOn", selected ? selected.value : "")
                    }
                    isDisabled={!ele.isChecked}
                    placeholderName=""
                  />
                </td>
                <td data-title="#">
                  <input
                    type="checkbox"
                    name="isChecked"
                    checked={ele.isChecked}
                    onChange={(e) => handleChange(index, "isChecked", e.target.checked)}
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
            onClick={Save}
          >
            {t("Save")}
          </button>
        </div>
        <div className="col-sm-3">
          <button
            type="button"
            className="btn btn-block btn-danger btn-sm"
            onClick={handleClose}
          >
            {t("Close")}
          </button>
        </div>
      </div>

      {savedDefaults.length > 0 && (
        <>
          <Tables>
            <thead>
              <tr>
                <th>{t("S.No.")}</th>
                <th>{t("Department Name")}</th>
                <th>{t("Share Type")}</th>
                <th>{t("Share Value")}</th>
                <th>{t("Calculation")}</th>
                <th>{t("Discount On")}</th>
                <th>{t("Delete")}</th>
              </tr>
            </thead>
            <tbody>
              {savedDefaults.map((ele, index) => (
                <tr key={index}>
                  <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                  <td data-title={t("Department Name")}>{ele.Department}&nbsp;</td>
                  <td data-title={t("Share Type")}>{ele.ShareType}&nbsp;</td>
                  <td data-title={t("Share Value")}>{ele.ShareValue}&nbsp;</td>
                  <td data-title={t("Calculation")}>{ele.CalculationBasis}&nbsp;</td>
                  <td data-title={t("Discount On")}>{ele.DiscountOn}&nbsp;</td>
                  <td data-title={t("Delete")}>
                    <input
                      type="checkbox"
                      checked={ele.isChecked}
                      name="isChecked"
                      onChange={(e) => {
                        const data = [...savedDefaults];
                        data[index].isChecked = e.target.checked;
                        setSavedDefaults(data);
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
                onClick={RemoveDefault}
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

export default InHouseDoctorDefaultShareModal;
