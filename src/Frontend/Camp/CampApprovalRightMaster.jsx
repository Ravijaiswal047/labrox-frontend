import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { SaveButton } from "../../components/UI/CustomButton";

const CampApprovalRightMaster = () => {
  const [loading, setLoading] = useState({
    search: false,
    save: false,
  });
  const [tableData, setTableData] = useState([]);
  const [employee, setEmployee] = useState([]);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    VerificationType: [],
    Employee: "",
    isActive: "",
  });

  const VerificationData = [
    {
      label: "CampConfiguration",
      value: "1",
    },
    {
      label: "CampRequest",
      value: "2",
    },
    {
      label: "CampApproval/Reject",
      value: "3",
    },
  ];

  const getEmployee = () => {
    axiosInstance
      .get("Camp/GetEmployees")
      .then((res) => {
        let data = res.data.message;
        let EmployeeData = data.map((ele) => {
          return {
            value: ele?.EmployeeID,
            label: ele?.NAME,
          };
        });
        setEmployee(EmployeeData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getEmployee();
    BindEmployee();
  }, []);

  const handleChange = (event) => {
    const { name, value, type, checked } = event?.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSelectMultiChange = (name, value) => {
    if (name === "VerificationType") {
      setFormData({ ...formData, [name]: value });
    }
  };

  const VerificationTableData = (ele) => {
    switch (ele) {
      case "1":
        return "CampConfiguration";
      case "2":
        return "CampRequest";
      case "3":
        return "CampCreation";
    }
  };

  const BindEmployee = () => {
    setLoading({ ...loading, search: true });
    axiosInstance
      .get("Camp/bindCamptable")
      .then((res) => {
        setTableData(res?.data?.message);
        setLoading({ ...loading, search: false });
      })
      .catch((err) => {
        console.log(err);
        setLoading({ ...loading, search: false });
      });
  };

  const handleSave = () => {
    if (formData?.VerificationType == "" || formData?.Employee == "") {
      toast.error("Please Select All Fields.");
    } else {
      setLoading({ ...loading, save: true });
      const dataArray = formData?.VerificationType?.map((ele) => {
        return {
          EmployeeId: formData?.Employee,
          IsActive: formData?.isActive ? 1 : 0,
          VerificationType: ele,
        };
      });
      axiosInstance
        .post("Camp/save", { data: dataArray })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);

            setFormData({
              VerificationType: [],
              Employee: "",
              isActive: "",
            });
            BindEmployee();
          } else {
            toast.error(res?.data?.message);
          }
          setLoading(false);
          setLoading({ ...loading, save: false });
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong.",
          );
          setLoading({ ...loading, save: false });
        });
    }
  };

  const handleRemove = (data, IsActive) => {
    setLoading(true);
    axiosInstance
      .post("Camp/RightsUpdate", {
        EmployeeId: data?.EmployeeID,
        VerificationType: data?.VerificationType,
        IsActive: IsActive,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setLoading(false);
        BindEmployee();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  return (
    <>
      <Accordion
        name={t("Camp Approval Right Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <MultiSelectComp
              options={[...VerificationData]}
              onChange={handleSelectMultiChange}
              name="VerificationType"
              id="VerificationType"
              value={formData?.VerificationType}
              label="Verification Type"
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={[{ label: "Select", value: "" }, ...employee]}
              onChange={handleChange}
              name="Employee"
              id="Employee"
              selectedValue={formData?.Employee}
              lable="Employee"
            />
          </div>
          <div className="col-sm-1 d-flex align-items-center">
            <input
              name="isActive"
              id="isActive"
              type="checkbox"
              checked={formData?.isActive}
              onChange={handleChange}
            />
            <label className="col-sm-10">{t("Active")}</label>
          </div>
          <div className="col-sm-1">
            {!loading.save && (
              <SaveButton
                text={"Save"}
                onClick={handleSave}
              />
            )}
            {loading?.save && <Loading />}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {loading.search ? (
          <Loading />
        ) : (
          <>
            <>
              {tableData?.length > 0 ? (
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No.")}</th>
                      <th>{t("Employe Name")}</th>
                      <th>{t("Verification")}</th>
                      <th>{t("Status")}</th>
                      <th>{t("Created By")}</th>
                      <th>{t("Created Date")}</th>
                      <th>{t("Change Status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...tableData]?.map((ele, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>{index + 1}</td>
                        <td data-title={t("Employe Name")}>{ele?.Name}</td>
                        <td data-title={t("Verification")}>
                          {VerificationTableData(ele?.VerificationType)}
                        </td>
                        <td data-title={t("Status")}>{ele?.STATUS}</td>
                        <td data-title={t("Created By")}>{ele?.CreatedBy}</td>
                        <td data-title={t("Created Date")}>
                          {ele?.CreateDate}
                        </td>
                        <td data-title={t("Remove")}>
                          {ele?.IsActive === 1 ? (
                            <button
                              type="button"
                              className="DeActive"
                              style={{
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                fontWeight: "bold",
                                width: "40%",
                                marginLeft: "2px",
                              }}
                              onClick={() => handleRemove(ele, 0)}
                            >
                              {t("DeActive")}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="Active"
                              style={{
                                backgroundColor: "green",
                                color: "white",
                                border: "none",
                                fontWeight: "bold",
                                width: "40%",
                                marginLeft: "2px",
                              }}
                              onClick={() => handleRemove(ele, 1)}
                            >
                              {t("Active")}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              ) : (
                <NoRecordFound />
              )}
            </>
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default CampApprovalRightMaster;
