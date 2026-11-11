import React, { useEffect, useState } from "react";

import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { CheckApprovalRights } from "../../utils/NetworkApi/commonApi";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { ExportToExcel } from "../../utils/helpers";
import { useTranslation } from "react-i18next";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Input from "../../components/formComponent/Input";
import Accordion from "@app/components/UI/Accordion";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
const CampConfigurationApproval = () => {
  const { t } = useTranslation();
  const [tabledata, setTableData] = useState([]);
  const [financialYear, setFinancialYear] = useState([]);
  const [Centre, setCentre] = useState([]);
  const [isChecked, setisChecked] = useState(false);
  const [errors, setErrors] = useState([]);
  const [payload, setPayload] = useState({
    FinancialYear: "",
    CentreID: "",
    ClientName: [],
    TypeId: [],
    Status: "-1",
  });
   const accessRightStr = useLocalStorage("accessRight", "get") || "";
    const accessRight = accessRightStr
      ? accessRightStr?.split(",").filter(Boolean)
      : [];
  const [accessed, setAccess] = useState([]);
  const access = accessRight?.includes('28');
  // const access = accessed?.some(
  //   (item) => item.VerificationType == "1" && item.IsActive == 1,
  // );
  const [loading, setLoading] = useState({
    search: false,
    save: false,
  });
  const StatusType = [
    {
      label: "All",
      value: "-1",
    },
    {
      label: "Pending",
      value: "0",
    },
    {
      label: "Approved",
      value: "1",
    },
  ];

  const handleSelectChange = (select, name, value) => {
    if (name === "CentreID") {
      const val = select.map((ele) => {
        return ele?.value;
      });
      if (val.length === 0) {
        setPayload({ ...payload, ClientName: [], CentreID: [] });
      } else {
        //getAccessDataRate(val);
        setPayload({
          ...payload,
          [name]: val,
        });
      }
    } else if (name === "ClientName") {
      const val = select.map((ele) => {
        return `${ele?.value}`;
      });
      console.log(val);
      setPayload({ ...payload, [name]: val });
    }
  };

  const handleChange = (event) => {
    const { value, name } = event?.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleValue = (e, index) => {
    const { name, value } = e.target;
    const datas = [...tabledata];
    datas[index][name] = Number(value);
    setTableData(datas);
  };

  const getFinancialYear = () => {
    axiosInstance
      .get("Camp/BindFinacialYearDetail")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.ID,
            label: ele.FinancialYear,
          };
        });
        setFinancialYear(CentreDataValue);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data.message
            ? err?.response?.data.message
            : "Something Went wrong",
        );
      });
  };
  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setCentre(CentreDataValue);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data.message
            ? err?.response?.data.message
            : "Something Went wrong",
        );
      });
  };

  const handleAlert = () => {
    var alert = false;
    if (payload?.FinancialYear === "") {
      alert = true;
      toast.error("Please Select FinancialYear");
    }

    return alert;
  };

  const handleSearch = () => {
    const alert = handleAlert(payload);
    if (!alert) {
      setLoading({ ...loading, search: true });
      axiosInstance
        .post("Camp/Binddetails", {
          FinancialYear: payload?.FinancialYear.split("#")[1],
          CentreId: payload?.CentreID,
          status: Number(payload?.Status),
        })
        .then((res) => {
          setLoading({ ...loading, search: false });
          if (res?.data?.message?.length === 0) {
            toast.error("Record not found");
            setPayload({
              FinancialYear: "",
              CentreID: "",
              ClientName: [],
            });
            setTableData([]);
          }
          const data = res?.data?.message;
          const update = data.map((item) => {
            return {
              ...item,
              Total:
                item?.Apr +
                item?.May +
                item?.Jun +
                item?.Jul +
                item?.Aug +
                item?.Sep +
                item?.OCT +
                item?.Nov +
                item?.Dec +
                item?.Jan +
                item?.Feb +
                item?.Mar,
            };
          });
          setTableData(update);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong.",
          );
          setTableData([]);
          setLoading({ ...loading, search: false });
        });
    }
  };
  const getErrors = (tableData) => {
    let err = [];
    let transformedErr = {};
    const data = JSON.parse(JSON.stringify(tableData));
    console.log(data);
    for (let i = 0; i < data?.length; i++) {
      let obj = data[i];
      delete obj.Total;
      delete obj.IsApproved;
      delete obj.ApprovedStatus;
      delete obj.FinancialYear;
      let hasZeroValue = false;

      for (let [key, value] of Object.entries(obj)) {
        if (key !== "Panel_ID" && Number(value) === 0) {
          hasZeroValue = true;
          if (!transformedErr[i]) {
            transformedErr[i] = { index: i, month: [key] };
          } else {
            transformedErr[i].month.push(key);
          }
        }
      }

      if (hasZeroValue) {
        err.push({
          index: i,
          month: Object.keys(obj).filter(
            (key) => key !== "Panel_ID" && Number(obj[key]) === 0,
          ),
        });
      }
    }

    return Object.values(transformedErr);
  };

  const handleSave = (status) => {
    const Error = getErrors(tabledata);

    setErrors(Error);
    // if(Error.length===0)
    {
      setLoading({ ...loading, approve: true });
      const approvalStatus = status === "Approve" ? 1 : 0;
      const CampData = {
        FinacialYearDetail: payload?.FinancialYear,
        CampConfigDetail: tabledata
          .filter((ele) => ele.isChecked)
          .map((ele) => ({
            Panel_ID: ele.CentreId,
            Apr: ele.Apr,
            May: ele.May,
            Jun: ele.Jun,
            Jul: ele.Jul,
            Aug: ele.Aug,
            Sep: ele.Sep,
            Oct: ele.OCT,
            Nov: ele.Nov,
            Dec: ele.Dec,
            Jan: ele.Jan,
            Feb: ele.Feb,
            Mar: ele.Mar,
            Id: ele?.ID,
            ApprovedStatus: approvalStatus,
          })),
      };

      axiosInstance
        .post("Camp/ApproveCampConfig", CampData)
        .then((res) => {
          toast.success(res.data?.message);
          setTableData([]);
          setLoading({ ...loading, approve: false });
          handleSearch();
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message ?? "Error Occurred");
          setLoading({ ...loading, approve: false });
        });
    }
    // else {
    //   toast.error('Camp Count cannot be zero')
    // }
  };
  const handleChangeMain = (e, index, names) => {
    const { value, name, checked, type } = e.target;

    if (index >= 0) {
      const data = [...tabledata];
      data[index][name] = type === "checkbox" ? checked : value;
      setTableData(data);
    } else {
      setisChecked(checked);
      const data = [...tabledata];

      const updatedata = data.map((ele) => {
        if (isApprovedRow(ele)) {
          return ele;
        } else {
          return {
            ...ele,
            [name]: type === "checkbox" ? checked : value,
          };
        }
      });
      console.log(updatedata);
      setTableData(updatedata);
    }
  };
  console.log(tabledata);
  const isApprovedRow = (item) =>
    Number(item?.ApprovedStatus) === 1 || Number(item?.IsApproved) === 1;
  const selectedRows = tabledata.filter((item) => item?.isChecked);
  const hasSelectedRows = selectedRows.length > 0;
  const hasApprovedSelection = selectedRows.some(isApprovedRow);
  const hasPendingSelection = selectedRows.some((item) => !isApprovedRow(item));

  useEffect(() => {
    getFinancialYear();
    getAccessCentres();

    CheckApprovalRights(setAccess);
  }, []);
  return (
    <>
      <Accordion
        name={t("Camp Configuration Count Approval")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {!access ? (
          <div className="card-header">
            {" "}
            <p style={{ color: "red", paddingLeft: "2px" }}>
              You don't have access to this page.
            </p>{" "}
          </div>
        ) : null}

        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <SelectBox
              options={[{ label: "Select", value: "" }, ...financialYear]}
              name="FinancialYear"
              selectedValue={payload?.FinancialYear}
              onChange={handleChange}
              id="Financial Year"
              lable="Financial Year"
              isDisabled={!access}
            />
          </div>

          <div className="col-sm-2">
            <SelectBoxWithCheckbox
              options={Centre}
              name="CentreID"
              placeholder=" "
              lable="Centre"
              id="Centre"
              value={payload?.CentreID}
              onChange={handleSelectChange}
              isDisabled={!access}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              options={[...StatusType]}
              name="Status"
              id="Status"
              lable="Status"
              selectedValue={payload?.Status}
              onChange={handleChange}
              isDisabled={!access}
            />
          </div>
          <div className="col-sm-1">
            {!loading.search && (
              <SearchButton
                  text={"Search"}
                  onClick={handleSearch}
                disabled={!access}
              />
            )}
            {loading.search && <Loading />}
          </div>
          <div className="col-sm-1">
            <CustomButton
              icon={"excel"}
              text={"Excel"}
              onClick={() => ExportToExcel(tabledata)}
              disabled={tabledata?.length === 0 || !access}
              />
          </div>

          <div className="col-sm-2">
            <div style={{ display: "flex" }}>
              <div></div>
              <div
                style={{
                  height: "15px",
                  width: "20px",
                  backgroundColor: "lightgreen",
                  border: "1px solid black",
                }}
              ></div>
              <label style={{ marginLeft: "5px" }}>{t("Approved")}</label>&nbsp;
              <div
                style={{
                  height: "15px",
                  width: "20px",
                  backgroundColor: "white",
                  border: "1px solid black",
                }}
              ></div>
              <label style={{ marginLeft: "5px" }}>{t("Pending")}</label>
            </div>
          </div>
        </div>
      </Accordion>{" "}
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {tabledata.length > 0 ? (
          <>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Camp Centre")}</th>
                  <th>{t("Centre Code")}</th>

                  <th>{t("April")}</th>
                  <th>{t("May")}</th>
                  <th>{t("June")}</th>
                  <th>{t("July")}</th>
                  <th>{t("August")}</th>
                  <th>{t("September")}</th>
                  <th>{t("October")}</th>
                  <th>{t("November")}</th>
                  <th>{t("December")}</th>
                  <th>{t("January")}</th>
                  <th>{t("February")}</th>
                  <th>{t("March")}</th>
                  <th>{t("Total")}</th>
                  <th>
                    {t("Select")}
                    <br></br>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      name="isChecked"
                      onChange={(e) => handleChangeMain(e)}
                    />
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabledata.map((ele, index) => {
                  const isRowEditable = ele?.isChecked && !isApprovedRow(ele);

                  return (
                  <tr
                    key={index}
                    style={{
                      backgroundColor:
                        ele?.ApprovedStatus === 1 ? "lightgreen" : "",
                    }}
                  >
                    <td data-title="S.No">{index + 1}&nbsp;</td>
                    <td data-title="Camp Centre">{ele?.Centre}&nbsp;</td>

                    <td data-title="Rate Type Code">{ele?.CentreCode}&nbsp;</td>

                    <td data-title="April">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Apr
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Apr")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Apr}
                          type="number"
                          name="Apr"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="May">
                      {" "}
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.May
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("May")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.May}
                          type="number"
                          name="May"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="June">
                      {" "}
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Jun
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Jun")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Jun}
                          type="number"
                          name="Jun"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="July">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Jul
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Jul")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Jul}
                          type="number"
                          name="Jul"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="August">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Aug
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Aug")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Aug}
                          type="number"
                          name="Aug"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="September">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Sep
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Sep")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Sep}
                          type="number"
                          name="Sep"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="October">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.OCT
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("OCT")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.OCT}
                          type="number"
                          name="OCT"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="November">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Nov
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Nov")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Nov}
                          type="number"
                          name="Nov"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="December">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Dec
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Dec")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Dec}
                          type="number"
                          name="Dec"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="January">
                      {" "}
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Jan
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Jan")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Jan}
                          type="number"
                          name="Jan"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="February">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Feb
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Feb")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Feb}
                          type="number"
                          name="Feb"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="March">
                      {ele?.ApprovedStatus === 1 && !ele?.isChecked ? (
                        ele?.Mar
                      ) : (
                        <Input
                          className={`form-control ui-autocomplete-input input-sm  ${
                            errors
                              .find((error) => error.index === index)
                              ?.month.includes("Mar")
                              ? "wrange"
                              : ""
                          }`}
                          value={ele?.Mar}
                          type="number"
                          name="Mar"
                          onChange={(e) => handleValue(e, index)}
                          max={10}
                          disabled={!isRowEditable}
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="Total">{ele?.Total}&nbsp;</td>
                    <td data-title="">
                      <input
                        type="checkbox"
                        checked={!!ele?.isChecked}
                        name="isChecked"
                        onChange={(e) => handleChangeMain(e, index)}
                      />
                    </td>
                  </tr>
                  );
                })}
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "right", fontWeight: "bold" }}
                  >
                    {t("GTotal")}
                  </td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Apr, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.May, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Jun, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Jul, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Aug, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Sep, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.OCT, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Nov, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Dec, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Jan, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Feb, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Mar, 0)}</td>
                  <td>{tabledata.reduce((acc, ele) => acc + ele.Total, 0)}</td>
                  <td></td>
                </tr>
              </tbody>
            </Tables>

            <div className="row mt-2 mb-1 px-2">
              <div className="col-sm-1">
                {!loading.approve && (
                  <CustomButton
                    text={"Approve"}
                    onClick={()=>handleSave("Approve")}
                    disabled={!hasSelectedRows || hasApprovedSelection}
                  />
                )}
                {loading.approve && <Loading />}
              </div>
              <div className="col-sm-1">
                {!loading.approve && (
                  <CustomButton
                    text={"Not Approve"}
                    onClick={()=>handleSave("Not Approve")}
                    disabled={!hasSelectedRows || hasPendingSelection}
                  />
                )}
                {loading.approve && <Loading />}
              </div>
            </div>
          </>
        ) : (
          <div className="card">
            <NoRecordFound />
          </div>
        )}{" "}
      </Accordion>
    </>
  );
};

export default CampConfigurationApproval;
