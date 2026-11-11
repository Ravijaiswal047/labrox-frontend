import React, { useState, useEffect } from "react";
import Heading from "../../../components/UI/Heading";
import { handleReactSelectDropDownOptions, notify } from "../../utils/Utils";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import {
  AccessMasterSaveMapping,
  BindBackendData,
  BindMainCenter,
} from "../../../NetworkServices/Pettycash";
import Tables from "../../../components/UI/customTable";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";
import LabeledInput from "../../../components/formComponent/LabeledInput";
import HisTable from "../../../components/UI/customTable/HisTable";

function PettyCashAccessMaster() {
  const [t] = useTranslation();
  const [centerName, setBindCenter] = useState([]);
  const [pettyName, setPettyName] = useState([]);
  const [bindata, setBindData] = useState([]);
  const [isHeaderChecked, setIsHeaderChecked] = useState(false);
  const [isHeaderVerifyChecked, setIsHeaderVerifyChecked] = useState(false);
  const [isHeaderAuthChecked, setIsHeaderAuthChecked] = useState(false);
  const [coid, setCoid] = useState([]);

  const isMobile = window.innerWidth <= 800;
  const userData = useLocalStorage("userData", "get");

  const [values, setValues] = useState({
    center: { value: userData?.MainCentreID },
    cashChart: "",
  });
  console.log("ddd", values);
  const handleChangeCheckboxHeader = (e) => {
    const isChecked = e.target.checked;
    setIsHeaderChecked(isChecked);

    const updatedData = bindata.map((val) => ({
      ...val,
      isChecked: isChecked,
    }));
    setBindData(updatedData);
  };

  const handleChangeCheckboxHeaderVerify = (e) => {
    const isChecked = e.target.checked;
    setIsHeaderVerifyChecked(isChecked);

    const updatedData = bindata.map((val) => ({
      ...val,
      IsVerify: isChecked ? 1 : 0,
    }));
    setBindData(updatedData);
  };

  const handleChangeCheckboxHeaderAuth = (e) => {
    const isChecked = e.target.checked;
    setIsHeaderAuthChecked(isChecked);

    const updatedData = bindata.map((val) => ({
      ...val,
      IsAuth: isChecked ? 1 : 0,
    }));
    setBindData(updatedData);
  };

  const handleChangeCheckbox = (e, index) => {
    const updatedData = [...bindata];
    updatedData[index].isChecked = e.target.checked;
    setBindData(updatedData);

    const allChecked = updatedData.every((item) => item.isChecked);
    setIsHeaderChecked(allChecked);
  };

  const handleChangeCheckboxVerify = (e, index) => {
    const updatedData = [...bindata];
    updatedData[index].IsVerify = e.target.checked ? 1 : 0;
    setBindData(updatedData);

    const allChecked = updatedData.every((item) => item.IsVerify === 1);
    setIsHeaderVerifyChecked(allChecked);
  };

  const handleChangeCheckboxAuth = (e, index) => {
    const updatedData = [...bindata];
    updatedData[index].IsAuth = e.target.checked ? 1 : 0;
    setBindData(updatedData);

    const allChecked = updatedData.every((item) => item.IsAuth === 1);
    setIsHeaderAuthChecked(allChecked);
  };

  const isAccessHeaderChecked = bindata.every((item) => item.isChecked);
  const isVerifyheaderChecked = bindata.every((item) => item.IsVerify === 1);
  const isAuthHeaderChecked = bindata.every((item) => item.IsAuth === 1);

  const theadBindDetail = [
    { width: "5%", name: t("SNo") },
    {
      width: "5%",
      name: isMobile ? (
        t("Access")
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: "-29px",
          }}
        >
          <input
            className="mr-2"
            type="checkbox"
            checked={isAccessHeaderChecked}
            onChange={handleChangeCheckboxHeader}
          />
          <p>{t("Access")}</p>
        </div>
      ),
    },
    {
      width: "5%",
      name: isMobile ? (
        t("Verify")
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: "-29px",
          }}
        >
          <input
            type="checkbox"
            checked={isVerifyheaderChecked}
            onChange={handleChangeCheckboxHeaderVerify}
            className="mr-2"
          />
          <p>{t("Verify")}</p>
        </div>
      ),
    },
    {
      width: "5%",
      name: isMobile ? (
        t("Auth")
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            marginBottom: "-29px",
          }}
        >
          <input
            type="checkbox"
            checked={isAuthHeaderChecked}
            onChange={handleChangeCheckboxHeaderAuth}
            className="mr-2"
          />
          <p>{t("Auth")}</p>
        </div>
      ),
    },
    { width: "5%", name: t("Employee Id") },
    { width: "15%", name: t("Employee Name") },
    { width: "15%", name: t("Entry Date") },
    { width: "15%", name: t("Entry By") },
  ];

  const handleSelect = (name, value) => {
    setValues((val) => ({ ...val, [name]: value }));
  };

  const handleBindMainCenter = async () => {
    try {
      const response = await BindMainCenter();
      if (response.success) {
        setBindCenter(response.data);
      } else {
        setBindCenter([]);
      }
    } catch (error) {
      setBindCenter([]);
    }
  };

  const handleBindBackendData = async () => {
    let payload = {
      filterType: 1,
      centreID: values?.center?.value,
      coaid: 0,
    };
    let apiResp = await BindBackendData(payload);

    if (apiResp?.success) {
      // setCoid(apiResp.data[0].ValueField);
      setPettyName(apiResp.data);
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const displayBindBackendData = async () => {
    let payload = {
      filterType: 2,
      centreID: values?.center?.value,
      coaid: values?.cashChart?.value,
    };
    let apiResp = await BindBackendData(payload);

    if (apiResp?.success) {
      setBindData(
        apiResp.data.map((item) => ({
          ...item,
          isChecked : item?.IsMapped,
          isVerify: 0,
          isAuth: 0,
        }))
      );
    } else {
      notify(apiResp?.message, "error");
    }
  };

  const handleSave = async () => {
    let RecPayload = {
      pccoaid: values?.cashChart?.value,
      empMappingList: bindata
        .filter((val) => val.isChecked)
        .map((val) => ({
          pccoaid: values?.cashChart?.value,
          employeeID: val.EmployeeID.toString(),
          isVerify: val.IsVerify,
          isAuth: val.IsAuth,
        })),
    };

    try {
      const ReciveResp = await AccessMasterSaveMapping(RecPayload);
      if (ReciveResp.success) {
        notify(`${ReciveResp?.message}`, "success");
        // handleBindBackendData();
        displayBindBackendData();
      } else {
        notify("No records found", "error");
      }
    } catch (error) {
      notify("Some error occurred", "error");
    }
  };

  useEffect(() => {
    if(values?.cashChart?.value){
      displayBindBackendData();
    }
  }, [values]);

  useEffect(() => {
    handleBindMainCenter();
    handleBindBackendData();
  }, []);

  return (
    <div className="m-2 spatient_registration_card card">
      <Heading
        name={t("Access Master")}
        isBreadcrumb={true}
      />
      <div className="row row-cols-lg-5 row-cols-md-2 row-cols-1 p-2">
        <ReactSelect
          placeholderName={t("Center Name")}
          id={"center"}
          searchable={true}
          removeIsClearable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          dynamicOptions={handleReactSelectDropDownOptions(
            centerName,
            "Centre",
            "MainCentreID"
          )}
          isDisabled={true}
          onChange={handleSelect}
          value={`${values?.center?.value}`}
          name={"center"}
        />

        <ReactSelect
          placeholderName={t("Petty Cash Chart Of A/C")}
          id="cashChart"
          onChange={handleSelect}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          dynamicOptions={handleReactSelectDropDownOptions(
            pettyName,
            "TextField",
            "ValueField"
          )}
          name="cashChart"
          value={values?.cashChart?.ValueField}
        />
        <LabeledInput
          style={{ color: "red !important" }}
          className="col-xl-4 col-md-4 col-sm-6 col-12"
          label={t("Note")}
          substringEnd={50}
          isNote={true}
          value={t("Petty Cash Access is mandatory for Verify and Auth")}
        />
      </div>

      {bindata.length > 0 && (
        <div className="card">
          <Heading title={t("Employee Mapping")} isBreadcrumb={false} />
          <HisTable
            isSearch={true}
            thead={theadBindDetail}
            tbody={bindata.map((val, index) => ({
              sno: index + 1,
              Access: (
                <input
                  type="checkbox"
                  checked={val.isChecked}
                  onChange={(e) => handleChangeCheckbox(e, index)}
                />
              ),
              Verify: (
                <input
                  type="checkbox"
                  checked={val.IsVerify === 1}
                  onChange={(e) => handleChangeCheckboxVerify(e, index)}
                />
              ),
              Auth: (
                <input
                  type="checkbox"
                  checked={val.IsAuth === 1}
                  onChange={(e) => handleChangeCheckboxAuth(e, index)}
                />
              ),
              EmployeeId: val.EmployeeID,
              EmpName: val.EmployeeName,
              EntryDate: val.EntryDate,
              EntryBy: val.EntryBy,
            }))}
          />
          <div className="w-100 d-flex p-2 justify-content-end">
            <button
              className="btn btn-lg btn-success"
              type="button"
              onClick={handleSave}
            >
              {t("Save")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PettyCashAccessMaster;
