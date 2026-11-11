import React, { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

const isMobile = window.innerWidth <= 768;
const theme = useLocalStorage("theme", "get");

const ViewDesignationModal = ({ show, onHandleClose, title, id }) => {
  const { t } = useTranslation();
  const [employees, SetEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEmployeesByDesignation = async (id) => {
    setLoading(true);
    axiosInstance
      .post("SalesHierarchy/GetEmployeesByDesignationSales", {
        designationId: id.toString(),
      })
      .then((res) => {
        console.log("employee res", res);
        if (res?.status === 200) {
          const data = res?.data?.message || [];
          SetEmployees(data);
          toast.success(res?.data?.message || "Data fetched successfully");
        } else {
          toast.error("Unexpected response from server");
        }
      })
      .catch((err) => {
        console.error("Get Designation Data Error:", err);
        toast.error(
          err?.response?.data?.message ||
            "Something went wrong while fetching data",
        );
      })
      .finally(() => {
        if (setLoading) setLoading(false);
      });
  };

  useEffect(() => {
    getEmployeesByDesignation(id);
  }, []);

  const removeData = async (EmployeeID) => {
    const payload = {
      EmpID: EmployeeID.toString(),
    };
    console.log("here");
    setLoading(true);
    axiosInstance
      .post("SalesHierarchy/RemoveEmployeeDesignationSales", payload)
      .then((res) => {
        if (res?.status === 200) {
          toast.success(res?.data?.message);
          getEmployeesByDesignation(id);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        console.log(err);
      });
  };

  return (
    <Dialog
      header={
        <div className="flex flex-col">
          <span className="font-normal text-lg">Designation: </span>
          <span className="font-normal text-lg">{title}</span>
        </div>
      }
      className={theme}
      visible={show}
      onHide={onHandleClose}
      style={{ width: isMobile ? "80vw" : "70vw" }}
    >
      <Tables>
        <thead className="cf">
          <tr>
            <th style={{ width: "40px", minWidth: "40px" }}>{t("S.No.")}</th>
            <th>{t("EmployeeID")}</th>
            <th>{t("Employee Code")}</th>
            <th>{t("Employee Name")}</th>
            <th>{t("Reporting Manager")}</th>
            <th>{t("Reporting Designation")}</th>
            <th>{t("Mobile No.")}</th>
            <th>{t("Email")}</th>
            <th>{t("Remove")}</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((item, index) => (
            <tr key={index}>
              <td data-title={t("S.No.")} style={{ width: "40px" }}>
                {index + 1}
              </td>
              <td data-title={t("EmployeeID")}>{item.EmployeeID}</td>
              <td data-title={t("Employee Code")}>{item.EmployeeCode}</td>
              <td data-title={t("Employee Name")}>{item.NAME}</td>
              <td data-title={t("Reporting Manager")}>
                {item.ReportingManager}
              </td>
              <td data-title={t("Reporting Designation")}>
                {item.ReportingDesignation}
              </td>
              <td data-title={t("Mobile No.")}>{item.Mobile}</td>
              <td data-title={t("Email")}>{item.Email}</td>
              <td data-title={t("Remove")}>
                <span onClick={() => removeData(item.EmployeeID)}>❌</span>
              </td>
            </tr>
          ))}
        </tbody>
      </Tables>
    </Dialog>
  );
};

export default ViewDesignationModal;
