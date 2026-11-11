import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Loading from "../../components/loader/Loading";

const InterfaceCompanyMaster = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    InterfaceCompany: "",
    InterfaceCompanyID: 0,
    isActive: "1",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setPayload({
        ...payload,
        [name]: checked ? "1" : "0",
      });
    } else {
      setPayload({
        ...payload,
        [name]: value,
      });
    }
  };

  const getInterfaceCompanyData = () => {
    axiosInstance
      .get("ItemMasterInterface/GetInterfacemasterById")
      .then((res) => {
        setTableData(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
      });
  };

  const handleSave = () => {
    setLoading(true);
    axiosInstance
      .post("ItemMasterInterface/SaveInterfaceMaster", {
        CompanyName: payload?.InterfaceCompany,
        IsActive: payload?.isActive.toString(),
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setPayload({
          InterfaceCompany: "",
          isActive: "1",
        });
        setLoading(false);
        getInterfaceCompanyData();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        setLoading(false);
      });
  };

  const handleUpdate = () => {
    setLoading(true);
    axiosInstance
      .post("ItemMasterInterface/UpdateInterfacemaster", {
        Id: payload?.InterfaceCompanyID,
        CompanyName: payload?.InterfaceCompany,
        IsActive: payload?.isActive.toString(),
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setPayload({
          InterfaceCompany: "",
          isActive: "1",
        });
        setLoading(false);
        getInterfaceCompanyData();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        setLoading(false);
      });
  };

  const handleEditData = (ele) => {
    console.log(ele);
    setPayload({
      InterfaceCompany: ele?.CompanyName,
      InterfaceCompanyID: ele?.ID,
      isActive: ele?.IsActive?.toString(),
    });
  };

  useEffect(() => {
    getInterfaceCompanyData();
  }, []);

  return (
    <>
      <Accordion title={t("Interface Company Master")} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <Input
              className="required-fields"
              name="InterfaceCompany"
              lable={t("Interface Company")}
              id="InterfaceCompany"
              value={payload?.InterfaceCompany}
              placeholder=""
              onChange={handleChange}
              max={50}
            />
          </div>
          <div className="col-sm-1 mt-1 d-flex">
            <div className="mt-1">
              <input
                name="isActive"
                id="isActive"
                type="checkbox"
                checked={payload?.isActive === "1"}
                onChange={handleChange}
              />
            </div>
            <label className="control-label ml-2" htmlFor="isActive">
              {t("IsActive")}
            </label>
          </div>
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <>
                {payload?.InterfaceCompanyID ? (
                  <button
                    type="button"
                    className="btn btn-block btn-sm btn-success"
                    id="btnSave"
                    onClick={() => {
                      handleUpdate();
                    }}
                  >
                    {t("Update")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-block btn-sm btn-success"
                    id="btnSave"
                    onClick={() => {
                      handleSave();
                    }}
                  >
                    {t("Save")}
                  </button>
                )}
              </>
            )}
          </div>
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <button
                type="button"
                className="btn btn-block btn-sm btn-success"
                id="btnSave"
                onClick={() => {
                  setPayload({
                    InterfaceCompany: "",
                    isActive: "1",
                  });
                }}
              >
                {t("Reset")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            <Tables>
              <thead>
                <th>{t("S.No")}</th>
                <th>{t("Interface Company IDs")}</th>
                <th>{t("Interface Company Name")}</th>
                <th>{t("Action")}</th>
              </thead>
              <tbody>
                {tableData.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={"S.No"}>{index + 1}</td>
                    <td data-title={"Interface Company IDs"}>{ele?.ID}</td>
                    <td data-title={"Interface Company Name"}>
                      {ele?.CompanyName}
                    </td>
                    <td data-title={"Action"}>
                      <Link
                        id="btnSave"
                        title="Edit"
                        onClick={() => handleEditData(ele)}
                      >
                        {t("Edit")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default InterfaceCompanyMaster;
