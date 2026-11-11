import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import { DataType, IsActive } from "../../utils/Constants";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { Link } from "react-router-dom";
import { getDepartment } from "../../utils/NetworkApi/commonApi";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";

const InvestigationsList = ({ embedded = false, onEdit, onCreateNew }) => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    DataType: "",
    TestName: "",
    ShortName: "",
    TestCode: "",
    DepartmentID: "",
    IsActive: "",
  });
  const { t } = useTranslation();

  const [data, setData] = useState([]);

  const [department, setDepartment] = useState([]);
  const handleSelect = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleDataChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    const updatedData = [...data];
    updatedData[index][name] = type === "checkbox" ? (checked ? 1 : 0) : value;
    updatedData[index]["IsUpdate"] = true;
    setData(updatedData);
  };

  const getInvestigationsList = () => {
    setLoading(true);
    axiosInstance
      .post("Investigations/GetInvestigations", payload)
      .then((res) => {
        if (res.data.success) {
          setData(res.data.message);
        } else {
          setData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setData([]);
        setLoading(false);
      });
  };
  const handlereactSelectChange = (name, option) => {
    setPayload({
      ...payload,
      [name]: String(option?.value ?? ""),
    });
  };

  const checkboxEdit = () => {
    setLoading(true);
    const UpdateData = data?.filter((ele) => ele?.IsUpdate == true);
    const SaveData = UpdateData?.map((ele) => {
      return {
        InvestigationId: ele?.InvestigationID,
        isActive: ele?.isActive,
      };
    });
    axiosInstance
      .post("Investigations/UpdateActiveInActive", { SaveData: SaveData })
      .then((res) => {
        if (res.data.success) {
          toast.success("Updated Successfully");
          getInvestigationsList();
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        getInvestigationsList();
        setLoading(false);
      });
  };

  console.log(payload);
  useEffect(() => {
    getDepartment(setDepartment, "getDepartmentEmployeeMaster");
  }, []);
  return (
    <>
      <Accordion
        name={t("Investigations List")}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo={embedded ? undefined : "/Investigations"}
        linkTitle={t("Create New")}
        onLinkClick={embedded ? () => onCreateNew?.() : undefined}
        state={
          embedded
            ? undefined
            : {
                url: "Investigations/CreateInvestigation",
              }
        }
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              name="DataType"
              options={DataType}
              id="DataType"
              lable="DataType"
              selectedValue={payload?.DataType}
              onChange={handleSelect}
            />
          </div>
          <div className="col-sm-2">
            <Input
              placeholder=" "
              lable="Test Name"
              id="TestName"
              name="TestName"
              type="text"
              value={payload?.TestName}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              placeholder=" "
              lable="Test Code"
              id="TestCode"
              name="TestCode"
              type="text"
              value={payload?.TestCode}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              placeholderName="Department"
              searchable={true}
              name="DepartmentID"
              id="DepartmentID"
              onChange={handlereactSelectChange}
              value={payload?.DepartmentID}
              dynamicOptions={[
                { label: "Select Department", value: "" },
                ...department,
              ]}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              name="IsActive"
              options={IsActive}
              selectedValue={payload?.IsActive}
              onChange={handleSelect}
            />
          </div>
          <div className="col-sm-1">
            <button
              type="submit"
              className="btn btn-block btn-primary btn-sm"
              onClick={getInvestigationsList}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : data.length > 0 ? (
          <>
            <div
              style={{
                maxHeight: "410px",
                overflowY: "auto",
              }}
            >
              <div className="row p-2 ">
                <div className="col-12">
                  <Tables data={data ?? []}>
                    <thead className="cf">
                      <tr>
                        <th>{t("S.No")}</th>
                        <th>{t("Data Type")}</th>
                        <th>{t("Test Name")}</th>
                        <th>{t("Test Code")}</th>
                        <th>{t("Active / InActive")}</th>
                        <th>{t("Edit")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((item, i) => (
                        <tr key={i}>
                          <td data-title={"S.No"}>{i + 1}</td>
                          <td data-title={"Data Type"}>{item?.DataType}</td>
                          <td data-title={"Test Name"}>{item?.TestName}</td>
                          <td data-title={"Test Code"}>{item?.TestCode}</td>
                          <td data-title={t("Status")}>
                            <input
                              type="checkbox"
                              checked={item?.isActive == 0 ? false : true}
                              name="isActive"
                              onChange={(e) => handleDataChange(e, i)}
                            />
                          </td>
                          <td data-title={"Edit"}>
                            {embedded ? (
                              <span
                                className="text-primary"
                                style={{
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                                onClick={() => onEdit?.(item)}
                              >
                                {t("Edit")}
                              </span>
                            ) : (
                              <Link
                                to="/Investigations"
                                state={{
                                  other: {
                                    button: "Update",
                                    pageName: "Edit",
                                    showButton: true,
                                  },
                                  url1: `Investigations/EditInvestigation?id=${item?.InvestigationID}&DataType=${item?.DataType}`,
                                  url: "Investigations/UpdateInvestigation",
                                }}
                              >
                                {t("Edit")}
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Tables>
                </div>
              </div>{" "}
            </div>{" "}
            <div
              className="row"
              style={{
                position: "sticky",
                bottom: -2,
                marginTop: "3px",
                overflow: "auto",
              }}
            >
              {data.length > 0 && (
                <div
                  className="col-sm-1"
                  style={{ marginBottom: "6px", marginTop: "6px" }}
                >
                  <button
                    className="btn btn-success btn-sm btn-block"
                    onClick={checkboxEdit}
                  >
                    {t("Update")}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default InvestigationsList;
