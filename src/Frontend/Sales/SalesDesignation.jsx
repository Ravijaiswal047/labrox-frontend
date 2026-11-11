import { useEffect, useState } from "react";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { getDesignationSalesData } from "../../utils/NetworkApi/commonApi";
import { CustomButton } from "../../components/UI/CustomButton";

const SalesDesignation = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [payload, setPayload] = useState({
    DesignationName: "",
    ID: "",
    IsActive: 1,
  });
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEdit = (item) => {
    setPayload({
      ID: item.DesignationID,
      DesignationName: item.DesignationName,
      IsActive: item.IsActive,
      Priority: item.Priority,
    });
    setIsEditing(true);
  };
  const handleToggle = (field) => {
    setPayload((prev) => ({
      ...prev,
      [field]: prev[field] === 1 ? 0 : 1,
    }));
  };

  const handleSave = async () => {
    if (!payload.DesignationName) {
      toast.error("Please enter Designation Name");
      return;
    }
    setLoading(true);
    const apiPayload = {
      name: payload.DesignationName || "",
      id: isEditing ? payload.ID.toString() : "0",
      priority: String(payload.Priority) || "0",
      isNewTestApprove: 0,
      isDirectApprove: 0,
      isShowSpecialRate: 0,
      isActive: payload.IsActive || 0,
    };
    axiosInstance
      .post("SalesHierarchy/SaveDesignationSales", apiPayload)
      .then((res) => {
        console.log("Save res", res);
        if (res?.status === 200) {
          setPayload({
            DesignationName: "",
            ID: "",
            Priority: "",
            IsActive: 1,
          });
          setIsEditing(false);
          getDesignationSalesData(setData, setLoading);
          toast.success(res?.data?.message);
        }
      })
      .catch((err) => {
        console.log("Save err", err);
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getDesignationSalesData(setData, setLoading, 1);
  }, []);

  // console.log("payload", payload);
  return (
    <>
      <Accordion
        name={t("Sales Designation")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {" "}
        <Accordion defaultValue={true} title={t("Add Details")} />
        <div className="row  px-2 mt-2 mb-1">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              autoComplete="off"
              placeholder=" "
              lable="Designation"
              id="Designation"
              name="DesignationName"
              type="text"
              value={payload?.DesignationName}
              onChange={handleChange}
            />
          </div>
          <div className="col-auto mt-2">
            <strong>
              <span className="mb-0">{t("IsActive")}</span>
            </strong>
            <label class="switch ml-2">
              <input
                type="checkbox"
                checked={payload.IsActive === 1}
                onChange={() => handleToggle("IsActive")}
              />

              <span class="slider"></span>
            </label>
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <Input
              autoComplete="off"
              placeholder=" "
              lable="Priority(1-99)"
              id="Priority"
              name="Priority"
              type="number"
              min="1"
              max="99"
              onInput={(e) => {
                if (e.target.value > 99) e.target.value = 99;
                if (e.target.value < 1) e.target.value = "";
              }}
              value={payload?.Priority}
              onChange={handleChange}
            />
          </div>

          <div className="col-auto">
            <CustomButton
              value={isEditing ? "Update" : "Save"}
              id="btnSave"
              className="btn btn-block btn-success btn-sm"
              onClick={handleSave}
              text={t(isEditing ? "Update" : "Save")}
            />

          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            {isEditing && (
              <CustomButton
                text={t("Cancel")}
                className="btn btn-block btn-secondary btn-sm"
                onClick={() => {
                  setIsEditing(false);
                  setPayload({ DesignationName: "", ID: "", IsActive: 1 });
                }}

              />
            )}
          </div>
        </div>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            {loading ? (
              <Loading />
            ) : data && data.length > 0 ? (
              <Tables>
                <thead className="cf">
                  <tr>
                    <th style={{ width: "60px", minWidth: "40px" }}>
                      {t("Sr. No")}
                    </th>
                    <th>{t("Designation")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Priority")}</th>
                    <th>{t("CreatedBy")}</th>
                    <th>{t("CreatedDateTime")}</th>
                    <th>{t("UpdatedBy")}</th>
                    <th>{t("UpdatedDateTime")}</th>
                    <th>{t("Edit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data && data.length > 0 ? (
                    data.map((item, index) => (
                      <tr key={item.ID || index}>
                        <td data-title={t("Sr. No")} style={{ width: "60px" }}>
                          {index + 1}
                        </td>

                        <td data-title={t("Designation")}>
                          {item?.DesignationName}
                        </td>
                        <td data-title={t("Status")}>
                          {item?.IsActive === 1 ? (
                            <span
                              className="badge bg-success"
                              style={{
                                backgroundColor: "#d4edda",
                                color: "#155724",
                                fontWeight: "400",
                              }}
                            >
                              {t("Active")}
                            </span>
                          ) : (
                            <span
                              className="badge bg-danger"
                              style={{
                                backgroundColor: "#f8d7da",
                                color: "#721c24",
                                fontWeight: "400",
                              }}
                            >
                              {t("Inactive")}
                            </span>
                          )}
                        </td>
                        <td data-title={t("Priority")}>
                          {item?.Priority || "-"}
                        </td>
                        <td data-title={t("CreatedBy")}>
                          {item?.CreatedByName || "-"}{" "}
                        </td>
                        <td data-title={t("CreatedDateTime")}>
                          {item?.dtEntry || ""}{" "}
                        </td>
                        <td data-title={t("UpdatedBy")}>
                          {item?.UpdatedByName || "-"}
                        </td>
                        <td data-title={t("UpdatedDateTime")}>
                          {item?.dtUpdate || ""}
                        </td>

                        <td data-title={t("Edit")}>
                          <i
                            className="fa fa-edit"
                            style={{
                              cursor: "pointer",
                              color: "#21218b",
                              fontSize: "14px",
                            }}
                            onClick={() => handleEdit(item)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        {t("No records found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Tables>
            ) : null}
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default SalesDesignation;
