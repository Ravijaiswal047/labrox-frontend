import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../components/UI/Heading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../../components/formComponent/MultiSelectComp";

import {
  BindSICTypeMasterAPI,
  EmployeeListAPI,
  SaveSICAuthorizationAPI,
} from "../../../NetworkServices/finance.js";
import { notify } from "../../../utils/ustil2";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import { handleReactSelectDropDownOptions } from "../../utils/Utils";

export default function SICReportTypeAuthorization() {
  const [t] = useTranslation();
  const ip = useLocalStorage("ip", "get");
  const [values, setValues] = useState({
    Employee: { value: "" },
    nameOfAuthorization: [],
  });
  const [dropDownState, setDropDownState] = useState({
    Employeelist: [],
    EmployeelistMultiselect: [],
    nameOfAuthorization: [],
  });
  console.log("sssssss", values);
  const handleReactChange = async (name, e) => {
    if (name === "Employee") {
      let apiResp = await BindSICTypeMasterAPI(e?.value);
      if (apiResp?.success) {
        const selected = [];
        const nameOfAuthorization = [];
        apiResp?.data?.forEach((val) => {
          if (val?.SICTypeID?.split("#")[1] === "1") {
            selected.push({
              name: val?.SICTypeName,
              code: val?.SICTypeID,
            });
          }
          nameOfAuthorization.push({
            name: val?.SICTypeName,
            code: val?.SICTypeID,
          });
        });

        setValues((val) => ({
          ...val,
          [name]: e,
          nameOfAuthorization: selected,
        }));
        setDropDownState((val) => ({
          ...val,
          nameOfAuthorization: nameOfAuthorization,
        }));
      }
    } else {
      setValues((val) => ({ ...val, [name]: e }));
    }
  };
  const EmployeeList = async () => {
    let resp = await EmployeeListAPI();
    if (resp?.success) {
      setDropDownState((val) => ({
        ...val,
        Employeelist: handleReactSelectDropDownOptions(
          resp?.data,
          "EmployeeName",
          "EmployeeID"
        ),
        EmployeelistMultiselect: resp?.data?.map((val) => ({
          name: val?.EmployeeName,
          code: val?.EmployeeID,
        })),
      }));
    }
  };
  useEffect(() => {
    EmployeeList();
  }, []);
  const handleSave = async () => {
    if (!values?.Employee?.value) {
      notify("Please Select Employee", "error");
      return;
    }
    const payload = {
      employeeID: values?.Employee?.value,
      AuthMaster: values?.nameOfAuthorization?.map((val)=>({
        authID: val?.code?.split("#")[0],
        // selected: true,
      }))||[],
      chkShowCopyEmployee: true,
      CopyEmployee: values?.CopyToEmployees?.map((val) => ({
        employeeID: val?.code?.split("#")[0],
        // selected: true,
      }))||[],
      ipaddress: ip,
    };
    
//     debugger
// return
    let ApiResp = await SaveSICAuthorizationAPI(payload);
    if (ApiResp?.success) {
      notify(ApiResp?.message);
      setValues({
        Employee: { value: "" },
        nameOfAuthorization: [],
      });
    } else {
      notify(ApiResp?.message, "error");
    }
  };
  return (
    <>
      <div className=" card">
        <Heading name={t("SIC Authorization")} isBreadcrumb={true} />
        <div className="row p-2">
          <ReactSelect
            placeholderName={t("Employee")}
            className={"required-fields"}
            searchable={true}
            respclass="col-xl-2 col-md-4 col-sm-6 col-12"
            id={"Employee"}
            name={"Employee"}
            removeIsClearable={true}
            onChange={(name, e) => handleReactChange(name, e)}
            dynamicOptions={dropDownState?.Employeelist}
            value={values?.Employee?.value}
          />
          <MultiSelectComp
            className="col-xl-2 col-md-4 col-sm-6 col-12"
            name="nameOfAuthorization"
            id="nameOfAuthorization"
            placeholder={t("Name Of Authorization")}
            isRemoveTemplate={true}
            options={dropDownState?.nameOfAuthorization}
            onChange={handleReactChange}
            value={values?.nameOfAuthorization}
            requiredClassName={true}
          />

          <MultiSelectComp
            className="col-xl-2 col-md-4 col-sm-6 col-12"
            name="CopyToEmployees"
            id="CopyToEmployees"
            placeholder={t("Copy To Employees")}
            options={dropDownState?.EmployeelistMultiselect?.filter(
              (val) => val?.code !== values?.Employee?.value
            )}
            onChange={handleReactChange}
            value={values?.CopyToEmployees}
          />

          <button
            className="btn btn-sm btn-primary ml-2 px-3"
            onClick={handleSave}
          >
            {t("Save")}
          </button>
        </div>
      </div>
    </>
  );
}
