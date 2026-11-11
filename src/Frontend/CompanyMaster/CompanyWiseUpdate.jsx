import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import Tables from "../../components/UI/customTable";
const CompanyWiseUpdate = () => {
  const [company, setCompany] = useState([]);
  const [cid, setCID] = useState("");
  const [data, setData] = useState([]);
  const [mainData, setMainData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [compTableData, setcompTableData] = useState([]);
  const { t, i18n } = useTranslation();
  const [load, setLoad] = useState(false);
  const getCompanyName = () => {
    axiosInstance
      .get("CompanyMaster/getCompanyName")
      .then((res) => {
        let data = res?.data?.message;
        let Company = data
          .filter((ele) => ele?.CompanyCode)
          ?.map((ele) => {
            return {
              ...ele,
              value: ele?.CompanyId,
              label: ele?.CompanyName.split("-")[1],
            };
          });
        Company.unshift({ label: "Select Company", value: "" });
        setCompany(Company);
      })
      .catch((err) =>
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };

  const GetComanyWiseModule = (value) => {
    setLoad(true);
    axiosInstance
      .post("CompanyMaster/GetCompanywiseCheckbox", {
        CompanyId: value,
      })
      .then((res) => {
        setLoad(false);
        console.log(res?.data?.message[0]);
        let data = res?.data?.message;
        if (value === "") {
          setCID(value);
          setcompTableData(data);
        } else {
          setCID(value);
          setData(data[0]);
          let transformedMessage = transformedData(data)[0];
          setMainData(transformedMessage.module);
          setTableData(transformedMessage.module);
        }
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  useEffect(() => {
    getCompanyName();
    GetComanyWiseModule("");
  }, []);

  const transformedData = (array) => {
    let transformedMessage = array.map((item) => {
      let { CompanyName, CompanyId, dtentry, createdby, ...modules } = item;
      let moduleArray = Object.keys(modules).map((key) => {
        return { [key]: modules[key] };
      });

      return {
        CompanyName,
        CompanyId,
        dtentry,
        createdby,
        module: moduleArray,
      };
    });
    return transformedMessage;
  };

  const handleSelectChange = (label, value) => {
    setCID(value?.value);
    GetComanyWiseModule(value?.value);
  };

  const filterModule = (e) => {
    const { name, value, checked } = e?.target;

    if (name === "filterByName") {
      if (value !== "") {
        const filterData = mainData.filter((ele) => {
          const key = Object.keys(ele)[0];
          return key.toLowerCase().includes(value.toLowerCase());
        });
        setTableData(filterData);
      } else {
        setTableData(mainData);
      }
    } else if (name === "isActive") {
      const isActiveValue = checked ? 1 : 0;
      const filterData = mainData.filter((ele) => {
        const key = Object.keys(ele)[0];
        return ele[key] === isActiveValue;
      });
      setTableData(filterData);
    }
  };

  const handleDataChange = (e, index) => {
    const { name, checked } = e.target;

    const updatedValue = checked ? 1 : 0;
    // Update data
    setData((data) => ({ ...data, [name]: updatedValue }));

    // Update tableData
    const updatedTableData = [...tableData];
    updatedTableData[index][name] = updatedValue;
    setTableData(updatedTableData);

    // Update mainData
    const updatedMainData = [...mainData];
    updatedMainData[index][name] = updatedValue;
    setMainData(updatedMainData);
  };
  const handleSave = (paylad = data) => {
    setLoad(true);
    axiosInstance
      .post("CompanyMaster/UpdateCompanywiseCheckbox", paylad)
      .then((res) => {
        // setCID("");

        setLoad(false);
        toast.success(res?.data?.message);
        GetComanyWiseModule(paylad?.CompanyId);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  const headers = compTableData.length > 0 ? Object.keys(compTableData[0]) : [];

  const handleCheckUpdate = (payload, name, value) => {
    setLoad(true);
    const updatedData = { ...payload, [name]: value };
    axiosInstance
      .post("CompanyMaster/UpdateCompanywiseCheckbox", updatedData)
      .then((res) => {
        setLoad(false);
        GetComanyWiseModule("");
        toast.success(res.data.message);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  console.log(cid);
  return (
    <>
      <Accordion
        name={t("Company Wise Access Module")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2" style={{ zIndex: 999 }}>
            <ReactSelect
              dynamicOptions={company}
              removeIsClearable={true}
              className="required-fields"
              value={cid}
              menuPosition={"fixed"}
              onChange={handleSelectChange}
              placeholder={"Select Centre"}
            />
          </div>
          <div className="col-sm-1"></div>
          {cid != "" && (
            <>
              <label className="col-sm-1">{t("Filter By Name")}</label>
              <div className="col-sm-2">
                <Input
                  type={"text"}
                  placeholder={"Filter By Name"}
                  className="form-control  input-sm"
                  onChange={filterModule}
                  name="filterByName"
                />
              </div>
            </>
          )}
        </div>
        <>
          {load && <Loading />}
          {cid == "" ? (
            <div
              style={{
                maxHeight: "380px",
                overflowY: "auto",
              }}
            >
              <div className="p-2">
                <Tables
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <thead
                    style={{
                      position: "sticky",
                      top: "0",
                      zIndex: 9999,
                    }}
                  >
                    <tr>
                      <th>{t("S.no")}</th>
                      {headers &&
                        headers
                          .filter((ele) => ele !== "CompanyId")
                          .map((header) => <th key={header}>{t(header)} </th>)}
                      <th>#</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compTableData?.map((ele, index) => (
                      <>
                        <tr key={index}>
                          <td data-title="S.no" className="text-center">
                            {index + 1}
                          </td>
                          <td data-title={t("CompanyName")}>
                            {ele?.CompanyName}
                          </td>
                          {headers &&
                            headers
                              .filter(
                                (data) =>
                                  data !== "CompanyId" &&
                                  data !== "CompanyName",
                              )
                              .map((header) => (
                                <td key={header} data-title={header}>
                                  {/* {ele[header] && ele[header] ? (
                                  <i
                                    className="fa fa-check"
                                    style={{ color: "green" }}
                                  ></i>
                                ) : (
                                  <i
                                    className="fa fa-close"
                                    style={{ color: "red" }}
                                  ></i>
                                )} */}
                                  <CheckBox
                                    key={index}
                                    value={ele[header]}
                                    name={header}
                                    data={ele}
                                    handleCheckUpdate={handleCheckUpdate}
                                  />
                                </td>
                              ))}
                          <td
                            data-title={t("Action")}
                            className="text-info"
                            style={{
                              textDecoration: "underline",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setCID(ele?.CompanyId);
                              GetComanyWiseModule(ele?.CompanyId);
                            }}
                          >
                            <i
                              className="pi pi-pen-to-square"
                              //   style={{ color: "green" }}
                            ></i>
                          </td>
                        </tr>
                      </>
                    ))}
                  </tbody>
                </Tables>
              </div>{" "}
            </div>
          ) : (
            <>
              <div className="row p-2">
                {tableData &&
                  tableData.map((ele, index) => {
                    const [key, value] = Object.entries(ele)[0];
                    return (
                      <div
                        className="col-sm-2 d-flex p-1 ml-2"
                        style={{
                          padding: "2px",
                          justifyContent: "space-between",
                          border: "1px solid grey",
                          margin: "1px",
                        }}
                      >
                        <label
                          className={`col-sm-9 ${
                            ele?.isActive == 1 ? "requiredlabel" : ""
                          }`}
                        >
                          {t(key)}
                        </label>
                        <div className="col-sm-3">
                          <input
                            name={`${key}`}
                            type="checkbox"
                            checked={value === 1 ? true : false}
                            onChange={(e) => handleDataChange(e, index)}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div className="row mx-1 mb-2">
                {load ? (
                  <Loading />
                ) : (
                  <div className="col-sm-1">
                    <button
                      className="btn-block btn btn-success btn-sm"
                      onClick={() => {
                        handleSave();
                      }}
                    >
                      {t("Save")}
                    </button>
                  </div>
                )}

                <label
                  className="text-primary"
                  onClick={() => {
                    GetComanyWiseModule("");
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {t("Back to List")}
                </label>
              </div>
            </>
          )}
        </>{" "}
      </Accordion>
    </>
  );
};

export default CompanyWiseUpdate;

function CheckBox({ value, name, data, handleCheckUpdate }) {
  const [isChecked, setIsChecked] = useState(!!value);

  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);
    handleCheckUpdate(data, name, checked ? 1 : 0);
  };

  return (
    <label className="switch">
      <input type="checkbox" checked={isChecked} onChange={handleChange} />
      <span className="slider"></span>
    </label>
  );
}
