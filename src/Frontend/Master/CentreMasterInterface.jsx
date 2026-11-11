import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import { Link } from "react-router-dom";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { getEmployeeCenter } from "../../utils/NetworkApi/commonApi";
import { CentreMasterInterfaceValidationSchema } from "../../utils/Schema";

const CentreMasterInterface = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [centre, setCentre] = useState([]);
  const [rateTypes, setRateTypes] = useState([]);
  const [companyInterface, setCompanyInterface] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [errors, setErrors] = useState({});
  const [payload, setPayload] = useState({
    Centre: "",
    RatetypeId: "",
    RateTypeName: "",
    InterfaceCompany: "",
    CentreIdInterface: "",
    InterfaceCentreName: "",
    InterfaceCompanyName: "",
    IsActive: 1,
    IsUpdate: 0,
  });
  const getInterfaceCompany = () => {
    axiosInstance
      .get("ItemMasterInterface/BindInterfaceCompany")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.ID,
            label: ele?.CompanyName,
          };
        });
        setCompanyInterface(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    getInterfaceCompany();
    getItems();
    getEmployeeCenter(setCentre);
  }, []);

  const fetchRateTypes = async (id) => {
    const res = await axiosInstance.post("Centre/GetRateType", {
      CentreId: [id],
    });
    const list = res?.data?.message.map((item) => ({
      label: item?.RateTypeName,
      value: item?.RateTypeID,
    }));
    setRateTypes(list);
  };

  const handleSearchSelectChange = (label, value) => {
    if (label == "InterfaceCompany") {
      setPayload({
        ...payload,
        [label]: value?.value,
        InterfaceCompanyName: getFilteredName(
          value?.value,
          companyInterface,
          "label",
        ),
      });
    } else if (label === "Centre") {
      const selectedValue = value?.value;
      fetchRateTypes(selectedValue);
      setPayload({
        ...payload,
        [label]: value?.value,
        RatetypeId: "",
        RateTypeName: "",
      });
    } else if (label === "RatetypeId") {
      setPayload({
        ...payload,
        [label]: value?.value,
        RateTypeName: getFilteredName(value?.value, rateTypes, "label"),
      });
    } else {
      setPayload({
        ...payload,
        [label]: value?.value,
      });
    }
  };
  const getFilteredName = (id, state, name) => {
    const data = state?.filter((ele) => ele?.value == id);

    return data[0][name];
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const handleSubmit = () => {
    const generatedError = CentreMasterInterfaceValidationSchema(payload);
    if (generatedError === "") {
      setLoading(true);
      setErrors({});
      const items = {
        CentreID: payload?.Centre,
        RatetypeId: payload?.RatetypeId?.toString(),
        InterfaceCompanyID: payload?.InterfaceCompany,
        CentreIDInterface: payload?.CentreIdInterface,
        InterfaceCentreName: payload?.InterfaceCentreName,
        IsActive: 1,
        IsUpdate: 0,
        InterfaceCompanyName: payload?.InterfaceCompanyName,
        RateTypeName: payload?.RateTypeName,
      };

      axiosInstance
        .post("ItemMasterInterface/SaveCentreInterface", items)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setPayload({
              Centre: "",
              RatetypeId: "",
              InterfaceCompany: "",
              CentreIdInterface: "",
              InterfaceCentreName: "",
              IsActive: 1,
              IsUpdate: 0,
              InterfaceCompanyName: "",
              RateTypeName: "",
            });

            getItems();
          } else {
            toast.error(res?.data?.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err?.response?.data?.message);
        });
    } else {
      setErrors(generatedError);
      setLoading(false);
    }
  };
  const getItems = () => {
    axiosInstance
      .get("ItemMasterInterface/GetCentreInterfaceById")
      .then((res) => {
        const data = res?.data?.message;
        setTableData(data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleUpdateData = () => {
    const generatedError = CentreMasterInterfaceValidationSchema(payload);
    if (generatedError === "") {
      setLoading(true);
      setErrors({});
      const items = {
        id: payload?.id,
        centreID: payload?.Centre,
        RatetypeId: payload?.RatetypeId.toString(),
        interfaceCompanyID: payload?.InterfaceCompany,
        centreIDInterface: payload?.CentreIdInterface,
        interfaceCentreName: payload?.InterfaceCentreName,
        IsActive: 1,
        IsUpdate: 0,
        interfaceCompanyName: payload?.InterfaceCompanyName,
        RateTypeName: payload?.RateTypeName,
      };

      axiosInstance
        .post("ItemMasterInterface/UpdateCentreInterfaceById", items)
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setPayload({
              Centre: "",
              RatetypeId: "",
              InterfaceCompany: "",
              CentreIdInterface: "",
              InterfaceCentreName: "",
              IsActive: 1,
              IsUpdate: 0,
              InterfaceCompanyName: "",

              RateTypeName: "",
            });

            getItems();
          } else {
            toast.error(res?.data?.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err?.response?.data?.message);
        });
    } else {
      setErrors(generatedError);
      setLoading(false);
    }
  };
  const handleUpdate = (ele) => {
    fetchRateTypes(ele?.CentreID);
    setPayload({
      id: ele?.id,
      Centre: ele?.CentreID,
      RatetypeId: ele?.RatetypeId,
      RateTypeName: ele?.RateTypeName,
      InterfaceCompany: ele?.Interface_companyID,
      CentreIdInterface: ele?.CentreID_interface,
      InterfaceCentreName: ele?.Interface_CentreName,
      InterfaceCompanyName: ele?.Interface_companyName,
      IsActive: 1,
      IsUpdate: 1,
      updatedate: new Date(),
    });
  };
  return (
    <>
      <Accordion
        name={t("Centre Master Interface")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {" "}
        <div className="row pt-2 pl-2 pr-2 mt-1">
          {" "}
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={centre}
              removeIsClearable={true}
              name="Centre"
              lable="Centre"
              id="Centre"
              placeholderName="Centre"
              value={payload?.Centre}
              onChange={handleSearchSelectChange}
            />
            {payload?.Centre === "" && (
              <span className="error-message">{errors?.Centre}</span>
            )}
          </div>{" "}
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={rateTypes}
              removeIsClearable={true}
              name="RatetypeId"
              lable="RatetypeId"
              id="RatetypeId"
              placeholderName={t("Rate Type")}
              value={payload?.RatetypeId}
              onChange={handleSearchSelectChange}
            />
            {payload?.RatetypeId === "" && (
              <span className="error-message">{errors?.RatetypeId}</span>
            )}
          </div>{" "}
          <div className="col-sm-2">
            <Input
              className="required-fields"
              lable="Centre ID Interface"
              id="CentreIdInterface"
              placeholder=" "
              onChange={handleChange}
              name="CentreIdInterface"
              max={50}
              value={payload?.CentreIdInterface}
            />{" "}
            {payload?.CentreIdInterface === "" && (
              <span className="error-message">{errors?.CentreIdInterface}</span>
            )}
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={companyInterface}
              removeIsClearable={true}
              name="InterfaceCompany"
              lable="Interface Company"
              id="InterfaceCompany"
              placeholderName="Interface Company"
              value={payload?.InterfaceCompany}
              onChange={handleSearchSelectChange}
            />
            {payload?.InterfaceCompany === "" && (
              <span className="error-message">{errors?.InterfaceCompany}</span>
            )}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              lable="Interface Centre Name"
              id="InterfaceCentreName"
              placeholder=" "
              onChange={handleChange}
              name="InterfaceCentreName"
              max={50}
              value={payload?.InterfaceCentreName}
            />{" "}
            {payload?.InterfaceCentreName === "" && (
              <span className="error-message">
                {errors?.InterfaceCentreName}
              </span>
            )}
          </div>
          <div className="col-md-1">
            {loading ? (
              <Loading />
            ) : (
              <button
                type="button"
                className={`btn btn-block ${
                  payload?.IsUpdate ? "btn-success" : "btn-success"
                } btn-sm`}
                onClick={payload?.IsUpdate ? handleUpdateData : handleSubmit}
              >
                {payload?.IsUpdate ? t("Update") : t("Save")}
              </button>
            )}
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-block btn-sm btn-success"
              onClick={() => {
                setErrors({});
                setPayload({
                  Centre: "",
                  RatetypeId: "",
                  InterfaceCompany: "",
                  CentreIdInterface: "",
                  InterfaceCentreName: "",
                  IsActive: 1,
                  IsUpdate: 0,
                  InterfaceCompanyName: "",

                  RateTypeName: "",
                });
              }}
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {" "}
            <div className="row p-2 ">
              <div className="col-12">
                <Tables>
                  <thead>
                    {" "}
                    <tr>
                      <th>{t("S No.")}</th>
                      <th>{t("Centre")}</th>
                      <th>{t("Rate Type")}</th>
                      <th>{t("Centre ID Interface")}</th>
                      <th>{t("Interface Company")}</th>
                      <th>{t("Interface Centre")}</th>
                      <th>{t("Updated Date")}</th>
                      <th>{t("Update")}</th>
                    </tr>
                  </thead>
                  {tableData.map((ele, index) => (
                    <tbody>
                      {" "}
                      <tr key={index}>
                        <td data-title="S No.">{index + 1}</td>
                        <td data-title="Centre">{ele?.Centre}</td>
                        <td data-title="Rate Type">{ele?.RateTypeName}</td>
                        <td data-title="CentreId Interface">
                          {ele?.CentreID_interface}
                        </td>
                        <td data-title="Interface Company Name">
                          {ele?.Interface_companyName}
                        </td>
                        <td data-title="Interface Centre Name">
                          {ele?.Interface_CentreName}
                        </td>
                        <td data-title="Updated Date">{ele?.Updatedate}</td>
                        <td data-title="Edit">
                          <Link
                            type="button"
                            onClick={() => {
                              window.scroll(0, 0);
                              handleUpdate(ele);
                            }}
                          >
                            {t("Edit")}
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  ))}
                </Tables>
              </div>
            </div>
          </>
        )}
      </Accordion>
    </>
  );
};

export default CentreMasterInterface;
