import React, { useEffect } from "react";
import { useState } from "react";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";

import Accordion from "@app/components/UI/Accordion";
import { InputFields } from "../../utils/Constants";
import { EditButton, SaveButton } from "../../components/UI/CustomButton";
function InvestigationRequiredMaster() {
  const [TableData, setTableData] = useState([]);
  const [load, setLoad] = useState(false);
  const [loading, setLoading] = useState(true);
  const [update, setUpdate] = useState(false);
  const [payload, setPayload] = useState({
    FieldName: "",
    InputType: "",
    IsRequired: 0,
    IsUnit: 0,
    Unit: "",
    isActive: 0,
    DropDownOption: "",
    initialChar: "",
  });
  const { t } = useTranslation();

  const fetchRequiredField = () => {
    axiosInstance
      .get("InvestigationRequiredMaster/getRequiredMaster")
      .then((res) => {
        const data = res?.data?.message;
        setTableData(data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.reponse?.data?.message
            ? err?.reponse?.data?.message
            : "Error Occured",
        );
      });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
  };

  const editIDMaster = (id) => {
    setUpdate(true);
    axiosInstance
      .post("InvestigationRequiredMaster/getRequiredMasterByID", {
        ID: id,
      })
      .then((res) => {
        const data = res.data.message[0];
        setPayload(data);
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };

  const handleSave = (url, btnName) => {
    if (payload.FieldName !== "") {
      if (payload.InputType !== "") {
        setLoad(true);
        axiosInstance
          .post(url, payload)
          .then((res) => {
            toast.success(res.data?.message);
            setLoad(false);
            fetchRequiredField();
            if (btnName === "Update") {
              setUpdate(false);
            }
            setPayload({
              FieldName: "",
              InputType: "",
              IsRequired: 0,
              IsUnit: 0,
              Unit: "",
              isActive: 0,
              DropDownOption: "",
            });
          })
          .catch((err) => {
            toast.error(
              err?.response?.data?.message
                ? err?.response?.data?.message
                : "Error Occured",
            );
            setLoad(false);
          });
      } else {
        toast.error("Please Select InputType");
      }
    } else {
      toast.error("Please Enter RequiredField Name");
    }
  };

  useEffect(() => {
    fetchRequiredField();
  }, []);
  return (
    <>
      <Accordion
        name={t("Investigation Required Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              placeholder=" "
              type="text"
              id="Required Field"
              lable="Required Field"
              className="required-fields"
              name="FieldName"
              max={50}
              value={payload?.FieldName}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              options={InputFields}
              selectedValue={payload?.InputType}
              name="InputType"
              id="InputType"
              className="required-fields"
              lable="InputType"
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-1">
            <input
              type="checkbox"
              className="mt-1"
              checked={payload?.IsRequired}
              name="IsRequired"
              onChange={handleChange}
            />
            &nbsp;
            <label htmlFor="IsRequired" className="control-label">
              {t("Required")}
            </label>
          </div>

          <div className="col-sm-1 ">
            <input
              type="checkbox"
              className="mt-1"
              checked={payload?.IsUnit}
              name="IsUnit"
              onChange={handleChange}
            />{" "}
            &nbsp;
            <label htmlFor="IsUnit" className="control-label">
              {t("IsUnit")}
            </label>
          </div>
          {payload?.IsUnit == 1 && (
            <div className="col-sm-1 ">
              <Input
                placeholder=" "
                type="text"
                id="Unit"
                lable="Unit"
                max={10}
                value={payload?.Unit}
                name="Unit"
                onChange={handleChange}
              />
            </div>
          )}
          <div className="col-sm-1 ">
            <input
              type="checkbox"
              className="mt-1"
              checked={payload?.isActive}
              name="isActive"
              onChange={handleChange}
            />{" "}
            &nbsp;
            <label className="control-label">{t("isActive")}</label>
          </div>

          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : update ? (
              <EditButton
                text={"Update"}
                onClick={() =>
                  handleSave(
                    "InvestigationRequiredMaster/UpdateInvestigationRequiredMaster",
                    "Update",
                  )
                }
              />
            ) : (
              <SaveButton
                  text={"Save"}
                  onClick={() =>
                  handleSave(
                    "InvestigationRequiredMaster/SaveInvestigationRequiredMaster",
                    "Save",
                  )
                }
              />
            )}
          </div>
        </div>

        <div>
          {loading ? (
            <Loading />
          ) : (
            <div>
              {TableData.length > 0 ? (
                <Tables>
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Required Field")}</th>
                      <th>{t("IsRequired")}</th>
                      <th>{t("IsUnit")}</th>
                      <th>{t("Unit")}</th>
                      <th>{t("DropDown Option")}</th>
                      <th>{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TableData?.map((ele, index) => (
                      <tr key={index}>
                        <td data-title={t("S.No")}>{index + 1}&nbsp;</td>
                        <td data-title={t("Required Field")}>
                          {ele?.FieldName}&nbsp;
                        </td>
                        <td data-title={t("IsRequired")}>
                          <input type="checkbox" checked={ele?.IsRequired} />
                        </td>
                        <td data-title={t("IsUnit")}>
                          <input type="checkbox" checked={ele?.IsUnit} />
                        </td>
                        <td data-title={t("Unit")}>{ele?.Unit}&nbsp;</td>
                        <td data-title={t("DropDown Option")}>
                          {ele?.DropDownOption}&nbsp;
                        </td>
                        <td data-title={t("Action")}>
                          <div
                            className="text-primary"
                            style={{
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
                            onClick={() => {
                              window.scroll(0, 0);
                              editIDMaster(ele?.ID);
                            }}
                          >
                            {t("Edit")}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              ) : (
                "No Data Found"
              )}
            </div>
          )}
        </div>
      </Accordion>
    </>
  );
}

export default InvestigationRequiredMaster;
