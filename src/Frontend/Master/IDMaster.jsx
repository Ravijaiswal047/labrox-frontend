import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import moment from "moment";
import {
  getTrimmedData,
  number,
  selectedValueCheck,
} from "../../utils/helpers";
import { validationForIDMAster } from "../../utils/Schema";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Input from "../../components/formComponent/Input";
import DatePicker from "../../components/formComponent/DatePicker";

import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CustomButton } from "../../components/UI/CustomButton";

const IDMaster = () => {
  const { t } = useTranslation();
  const [update, setUpdate] = useState(false);
  const [load, setLoad] = useState(false);
  const [err, setErr] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [TypeName, setTypeName] = useState([]);
  const [Separator, setSeparator] = useState([]);
  const [LengthList, setLengthList] = useState([]);
  const [formData, setFormData] = useState({
    TypeID: "",
    TypeName: "",
    InitialChar: "",
    Separator1: "",
    FinancialYearStart: new Date(),
    Separator2: "",
    TypeLength: "",
    Separator3: "",
    FormatPreview: "",
    chkCentre: false,
    chkFinancialYear: false,
    isActive: false,
  });
  console.log(formData);

  const DateSelect = (name, date) => {
    setFormData({
      ...formData,
      [name]: date,
    });
  };

  const getDropDownData = (name) => {
    axiosInstance
      .post("Global/getGlobalData", { Type: name })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            label: ele.FieldDisplay,
            value: ele.FieldDisplay,
          };
        });

        switch (name) {
          case "IDMaster":
            value.unshift({ label: "Type Name", value: "" });
            setTypeName(value);
            break;
          case "Separator":
            value.unshift({ label: "Separator", value: "" });
            setSeparator(value);
            break;
        }
      })
      .catch((err) => console.log(err));
  };

  const getIdMasterDropDown = () => {
    axiosInstance
      .get("IDMaster/gettypelengthMaster")
      .then((res) => {
        const data = res?.data?.message;
        const val = data?.map((ele) => {
          return {
            value: ele?.TypeLengthId,
            label: ele?.NAME,
          };
        });
        setLengthList(val);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const getIDMaster = () => {
    axiosInstance
      .get("IDMaster/getIDMasterData", formData)
      .then((res) => {
        if (res.status === 200) {
          setData(res.data.message);
          setLoading(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSelectChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  //   const handleChange = (e) => {
  //     const { name, value, type, checked } = e.target;
  //     setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  //   };

  const handleChange = (e, name) => {
    if (e && e.target) {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    } else {
      setFormData({ ...formData, [name]: e });
    }
  };

  useEffect(() => {
    let data = moment(formData?.FinancialYearStart).format("YY");
    let val = Number(data) + 1;

    setFormData({
      ...formData,
      FormatPreview: `${formData?.InitialChar}${formData?.Separator1}${
        formData?.chkFinancialYear ? data + val : ""
      }${formData?.Separator2}${formData?.chkCentre ? "CC" : ""}${
        formData?.Separator3
      }${selectedValueCheck(LengthList, formData?.TypeLength).label}`,
    });
  }, [
    formData?.InitialChar,
    formData?.Separator1,
    formData?.FinancialYearStart,
    formData?.chkFinancialYear,
    formData?.Separator2,
    formData?.chkCentre,
    formData?.Separator3,
    formData?.TypeLength,
  ]);

  const editIDMaster = (id) => {
    axiosInstance
      .post("IDMaster/getIDMasterDataByID", {
        TypeID: id,
      })
      .then((res) => {
        const data = res.data.message[0];
        setFormData(data);
      })
      .catch((err) => console.log(err));
    getDropDownData("IDMaster");
  };

  const postData = () => {
    const generatedError = validationForIDMAster(formData);
    if (generatedError == "") {
      setLoad(true);
      if (update === true) {
        axiosInstance
          .post(
            "IDMaster/UpdateIDMasterData",
            getTrimmedData({
              ...formData,
            }),
          )
          .then((res) => {
            if (res.data.success) {
              setLoad(false);
              toast.success(res.data.message);
              getIDMaster();
              setFormData({
                TypeID: "",
                TypeName: "",
                InitialChar: "",
                Separator1: "",
                FinancialYearStart: new Date(),
                Separator2: "",
                TypeLength: "",
                Separator3: "",
                FormatPreview: "",
                chkCentre: false,
                chkFinancialYear: false,
                isActive: false,
              });
              setUpdate(false);
            } else {
              toast.error(res.data.message);
              setLoad(false);
            }
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
        setLoad(true);

        axiosInstance
          .post(
            "IDMaster/InsertIDMasterDatas",
            getTrimmedData({
              ...formData,
              chkCentre: formData?.chkCentre ? "1" : "0",
              chkFinancialYear: formData?.chkFinancialYear ? "1" : "0",
              isActive: "0",
            }),
          )
          .then((res) => {
            if (res.data.success) {
              setLoad(false);
              toast.success(res.data.message);
              setFormData({
                TypeID: "",
                TypeName: "",
                InitialChar: "",
                Separator1: "",
                FinancialYearStart: new Date(),
                Separator2: "",
                TypeLength: "",
                Separator3: "",
                FormatPreview: "",
                chkCentre: false,
                chkFinancialYear: false,
                isActive: false,
              });
              getIDMaster();
            } else {
              toast.error(res.data.message);
              setLoad(false);
            }
          })
          .catch((err) => {
            toast.error(err.response.data.message);
            setLoad(false);
          });
      }
    } else {
      setErr(generatedError);
    }
  };

  useEffect(() => {
    getDropDownData("IDMaster");
    getDropDownData("Separator");
    getIdMasterDropDown();
    getIDMaster();
  }, []);
  return (
    <>
      <Accordion name={t("ID Master")} defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              name="TypeName"
              className="required-fields"
              onChange={handleSelectChange}
              options={TypeName}
              selectedValue={formData?.TypeName}
              lable="Type"
            />
            {formData?.TypeName === "" && (
              <div className="error-message">{err?.TypeName}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              className="required-fields"
              lable="Initial Char"
              name="InitialChar"
              id="InitialChar"
              placeholder=""
              value={formData?.InitialChar}
              onInput={(e) => number(e, 8)}
              onChange={handleChange}
            />
            {formData?.InitialChar === "" && (
              <div className="error-message">{err?.InitialChar}</div>
            )}
          </div>
          <div className="col-sm-2">
            <SelectBox
              name="Separator1"
              onChange={handleSelectChange}
              options={Separator}
              selectedValue={formData?.Separator1}
              lable="Separator"
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="chkFinancialYear"
                type="checkbox"
                checked={formData?.chkFinancialYear}
                onChange={handleChange}
                value={formData?.chkFinancialYear}
              />
            </div>
            <label className="ml-2">{t("Financial Year")}</label>{" "}
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FinancialYearStart"
              id="FinancialYearStart"
              lable="Financial Year Start"
              placeholder=" "
              value={formData?.FinancialYearStart}
              //   onChange={handleChange}
              onChange={(date) => handleChange(date, "FinancialYearStart")}
              maxDate={new Date(formData?.FinancialYearStart)}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              name="Separator2"
              onChange={handleSelectChange}
              options={Separator}
              selectedValue={formData?.Separator2}
              lable="Separator"
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="chkCentre"
                type="checkbox"
                checked={formData?.chkCentre}
                onChange={handleChange}
              />
            </div>
            <label className="ml-2">{t("Centre")}</label>
          </div>
        </div>
        <div className="row pt-1 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              name="Separator3"
              onChange={handleSelectChange}
              options={Separator}
              selectedValue={formData?.Separator3}
              lable="Separator"
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              name="TypeLength"
              className="required-fields"
              onChange={handleSelectChange}
              options={[{ label: "Length", value: "" }, ...LengthList]}
              selectedValue={formData?.TypeLength}
            />
            {formData?.TypeLength === "" && (
              <div className="error-message">{err?.TypeLength}</div>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Preview"
              name="FormatPreview"
              id="FormatPreview"
              placeholder=""
              onChange={handleChange}
              value={formData?.FormatPreview}
            />
            {err?.FormatPreview}
          </div>
          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <CustomButton
                  text={update ? t("Update") : t("Save")}
                  icon={update ? t("edit") : t("save")}
                  onClick={postData}
              />
            )}
          </div>
        </div>
      </Accordion>
      {loading ? (
        <Loading />
      ) : (
        <Accordion title={t("Search Data")} defaultValue={true}>
          <div className="row p-2 ">
            <div className="col-12">
              {data.length > 0 ? (
                <Tables>
                  <thead>
                    <tr>
                      <th>{t("S.No")}</th>
                      <th>{t("Type Name")}</th>
                      <th>{t("Initial Character")}</th>
                      <th>{t("Separator")}</th>
                      <th>{t("Financial Year")}</th>
                      <th>{t("Separator")}</th>
                      <th>{t("Type Length")}</th>
                      <th>{t("Separator")}</th>
                      <th>{t("Format Preview")}</th>
                      <th>{t("Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((data, i) => (
                      <tr key={i}>
                        <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                        <td data-title={t("Type Name")}>
                          {data?.TypeName}&nbsp;
                        </td>
                        <td data-title={t("Initial Character")}>
                          {data?.InitialChar}&nbsp;
                        </td>
                        <td data-title={t("Separator")}>
                          {data?.Separator1}&nbsp;
                        </td>
                        <td data-title={t("Financial Year")}>
                          {data?.FinancialYearStart !== "0000-00-00 00:00:00"
                            ? moment(data?.FinancialYearStart).format(
                                "DD MMM YYYY",
                              )
                            : "-"}
                          &nbsp;
                        </td>
                        <td data-title={t("Separator")}>
                          {data?.Separator2}&nbsp;
                        </td>
                        <td data-title={t("Type Length")}>
                          {data?.TypeLength}&nbsp;
                        </td>
                        <td data-title={t("Separator")}>
                          {data?.Separator3}&nbsp;
                        </td>
                        <td data-title={t("Format Preview")}>
                          {data?.FormatPreview}&nbsp;
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
                              editIDMaster(data?.TypeID);
                              setUpdate(true);
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
                <NoRecordFound />
              )}
            </div>
          </div>
        </Accordion>
      )}
    </>
  );
};

export default IDMaster;
