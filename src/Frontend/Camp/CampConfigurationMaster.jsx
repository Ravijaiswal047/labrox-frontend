import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { CheckApprovalRights } from "../../utils/NetworkApi/commonApi";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { ExportToExcel } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { CustomButton, SaveButton, SearchButton } from "../../components/UI/CustomButton";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { notify } from "../../utils/utils";


const CampConfigurationMaster = () => {

  const { t } = useTranslation();
  const [tabledata, setTableData] = useState([]);
  const [financialYear, setFinancialYear] = useState([]);
  const [Centre, setCentre] = useState([]);
  const [errors, setErrors] = useState([]);
  const accessRightStr = useLocalStorage("accessRight", "get") || "";
  const accessRight = accessRightStr ? accessRightStr?.split(",").filter(Boolean) : [];
  const [payload, setPayload] = useState({
    FinancialYear: "",
    CentreID: "",
    ClientName: [],
    TypeId: [],
  });
  const [loading, setLoading] = useState({
    search: false,
    save: false,
  });
  const [accessed, setAccess] = useState([]);
  const access = accessRight.includes('28')
  // const access = accessed?.some(
  //   (item) => item.VerificationType == "1" && item.IsActive == 1,
  // );
  console.log(access);
  const handleSelectChange = (select, name) => {
    if (name === "CentreID") {
      const val = select.map((ele) => {
        return ele?.value;
      });
      if (val.length === 0) {
        setPayload({ ...payload, ClientName: [], CentreID: [] });
      } else {
        setPayload({
          ...payload,
          [name]: val,
        });
      }
    } else if (name === "ClientName") {
      const val = select.map((ele) => {
        return `${ ele?.value }`;
      });
      setPayload({ ...payload, [name]: val });
    }
  };

  const handleChange = (event) => {
    const { name, value } = event?.target;
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
        if (!Array.isArray(data)) {
          setFinancialYear([]);
          return;
        }
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
    console.log(payload?.CentreID);
    if (payload?.CentreID.length === 0) {
      alert = true;
      toast.error("Please Select Centre");
    }
    return alert;
  };

  const handleSearch = () => {
    const alert = handleAlert(payload);
    if (!alert) {
      setLoading({ ...loading, search: true });
      axiosInstance
        .post("Camp/Searchcampdata", {
          FinancialYear: payload?.FinancialYear.split("#")[1],
          CentreId: payload?.CentreID,
        })
        .then((res) => {
          setLoading({ ...loading, search: false });
          if (res?.data?.data?.length === 0) {
            toast.error("Record not found");
            setPayload({
              FinancialYear: "",
              CentreID: "",
              ClientName: [],
            });
            setRateType([]);
            setTableData([]);
          }

          const data = res?.data?.data;
          if (!Array.isArray(data)) {
            notify('Data not found', 'error')
            setTableData([])
            return
          }
          console.log(data);
          const datas = data?.map((ele) => {
            return {
              ...ele,
              Total:
                ele?.Apr +
                ele?.May +
                ele?.Jun +
                ele?.Jul +
                ele?.Aug +
                ele?.Sep +
                ele?.OCT +
                ele?.Nov +
                ele?.Dec +
                ele?.Jan +
                ele?.Feb +
                ele?.Mar,
            };
          });
          setTableData(datas);
        })
        .catch((err) => {
          setLoading({ ...loading, search: false });
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong.",
          );
          setTableData([]);
        });
    }
  };

  const handleSave = () => {
    {
      const CampData = {
        FinacialYearDetail: payload?.FinancialYear,
        CampConfigDetail: tabledata.map((ele) => ({
          Panel_ID: ele.ClientID,
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
          ApprovedStatus: ele?.ApprovedStatus,
        })),
      };
      if (
        CampData.CampConfigDetail.every((item) => item.ApprovedStatus === 1)
      ) {
        toast.error("All Camp Configuration are approved");
      } else {
        const data = CampData.CampConfigDetail.filter(
          (item) => item.ApprovedStatus === 0,
        );
        console.log(CampData.CampConfigDetail);
        CampData.CampConfigDetail = data;
        setLoading({ ...loading, save: true });
        axiosInstance
          .post("Camp/SaveCampConfig", CampData)
          .then((res) => {
            toast.success(res.data?.message);
            setLoading({ ...loading, save: false });
            setErrors([]);
            handleSearch();
          })
          .catch((err) => {
            setLoading({ ...loading, save: false });
            toast.error(err?.response?.data?.message ?? "Error Occurred");
          });
      }
    }
  };

  useEffect(() => {
    getFinancialYear();
    getAccessCentres();
    CheckApprovalRights(setAccess);
  }, []);
  return (
    <>
      <Accordion
        name="Camp Configuration Count Master"
        isBreadcrumb={true}
        defaultValue={true}
      >
        {!access ? (
          <div className="card-header">
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
              value={payload?.CentreID}
              placeholder=" "
              lable="Centre"
              id="Centre"
              onChange={handleSelectChange}
              isDisabled={!access}
            />
          </div>
          <div className="col-sm-1">
            <div style={{ display: "flex" }}>
              <div
                style={{
                  height: "20px",
                  width: "25px",
                  backgroundColor: "lightgreen",
                  border: "1px solid black",
                }}
              ></div>
              <label style={{ marginLeft: "5px" }}>{t("Approved")}</label>
            </div>
          </div>

          <div className="col-sm-1">
            {!loading?.search && (
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
              text={"Excel"}
              icon={"excel"}
              type="submit"
              onClick={() => ExportToExcel(tabledata)}
              disabled={tabledata?.length === 0 || !access}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title="Search Detail" defaultValue={true}>
        {tabledata?.length >= 0 ? (
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
                </tr>
              </thead>
              <tbody>
                {[...tabledata]?.map((ele, index) => (
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
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Apr
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="May">
                      {" "}
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.May
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="June">
                      {" "}
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Jun
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="July">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Jul
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="August">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Aug
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="September">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Sep
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="October">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.OCT
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="November">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Nov
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="December">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Dec
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="January">
                      {" "}
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Jan
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="February">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Feb
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="March">
                      {ele?.ApprovedStatus === 1 ? (
                        ele?.Mar
                      ) : (
                        <Input
                          className={` ${ errors
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
                        />
                      )}
                      &nbsp;
                    </td>
                    <td data-title="March">{ele?.Total}&nbsp;</td>
                  </tr>
                ))}
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
                </tr>
              </tbody>
            </Tables>

            <div className="row mt-2 mb-1 px-2">
              <div className="col-sm-1">
                {!loading?.save && (
                  <SaveButton
                    text={"Save"}
                    onClick={handleSave}
                  />
                )}
                {loading?.save && <Loading />}
              </div>
            </div>
          </>
        ) : (
          <NoRecordFound />
        )}{" "}
      </Accordion>
    </>
  );
};

export default CampConfigurationMaster;
