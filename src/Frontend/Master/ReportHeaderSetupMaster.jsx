import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";

import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import { Link } from "react-router-dom";

const ReportHeaderSetupMaster = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    LabelId: "",
    LabelName: "",
    IsActive: 1,
    IsUpdate: 0,
    ID: 0,
  });
  const [tableData, setTableData] = useState([]);
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };
  const getTableData = () => {
    setLoading(true);
    axiosInstance
      .get("ReportMaster/GetMasterHeaderSetup")
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          setTableData(data);
        } else {
          setTableData([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        setTableData([]);
        console.log(err);
      });
  };
  const handleSubmit = () => {
    if (!payload?.LabelId?.trim()) {
      toast.error("Please Enter Label Id");
      return;
    } else if (!payload?.LabelName?.trim()) {
      toast.error("Please Enter Label Name");
      return;
    } else {
      setLoading(true);
      const items = {
        LabelID: payload?.LabelId,
        LabelDetail: payload?.LabelName,
        IsActive: payload?.IsActive,
        IsUpdate: 0,
        ID: payload?.ID,
      };
      axiosInstance
        .post("ReportMaster/SaveHeadermasterSetup", [items])
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setPayload({
              LabelId: "",
              LabelName: "",
              IsActive: 1,
              IsUpdate: 0,
              ID: 0,
            });
            getTableData();
          } else {
            toast.error(res?.data?.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          toast.error(err?.response?.data?.message);
        });
    }
  };
  const handleUpdate = (ele) => {};
  useEffect(() => {
    getTableData();
  }, []);
  return (
    <div>
      <Accordion
        name={t("Report Header Setup Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {" "}
        <div className="row pt-2 pl-2 pr-2 mt-1">
          {" "}
          <div className="col-sm-2">
            <Input
              className="required-fields"
              lable="Label Id"
              id="LabelId"
              placeholder=" "
              onChange={handleChange}
              name="LabelId"
              max={50}
              value={payload?.LabelId}
            />{" "}
          </div>
          <div className="col-sm-2">
            <Input
              className="required-fields"
              lable="LabelName"
              id="LabelName"
              placeholder=" "
              onChange={handleChange}
              name="LabelName"
              max={50}
              value={payload?.LabelName}
            />{" "}
          </div>
          {/* <div className="col-md-1">
            <input
              name="IsActive"
              className="mt-1"
              type="checkbox"
              id="IsActive"
              onChange={handleChange}
              checked={payload?.IsActive}
            />
            &nbsp;
            <label htmlFor="IsActive" className="control-label">
              {t("Is Active")}
            </label>
          </div> */}
          <div className="col-md-1">
            {loading ? (
              <Loading />
            ) : (
              <button
                type="button"
                className={`btn btn-block ${
                  payload?.IsUpdate ? "btn-success" : "btn-success"
                } btn-sm`}
                onClick={handleSubmit}
              >
                {payload?.IsUpdate ? t("Update") : t("Save")}
              </button>
            )}
          </div>
          <div className="col-md-1">
            <button
              className="btn btn-block btn-sm btn-success"
              onClick={() => {
                setPayload({
                  LabelId: "",
                  LabelName: "",
                  IsActive: 1,
                  IsUpdate: 0,
                  ID: 0,
                });

                getTableData();
              }}
            >
              {t("Reset")}
            </button>
          </div>
        </div>{" "}
        <div className="p-1">
          <Tables>
            <thead className="cf">
              {" "}
              <tr>
                <th>{t("S No.")}</th>
                <th>{t("Label Id")}</th>
                <th>{t("Label Name")}</th>
                {/* <th>{t("Status")}</th> */}
                {/* <th>{t("Edit")}</th> */}
              </tr>
            </thead>
            {tableData?.map((ele, index) => (
              <tbody>
                <tr key={index}>
                  <td data-title="S.No">{index + 1}</td>
                  <td data-title="Label Id">{ele?.LabelID}</td>
                  <td data-title="Label Name">{ele?.LabelDetail}</td>
                  {/* <td data-title="Status">
                    {ele?.IsActive == 0 ? "In Active" : "Active"}
                  </td> */}
                  {/* <td data-title="Edit">
                    <Link
                      type="button"
                      onClick={() => {
                        window.scroll(0, 0);
                        handleUpdate(ele);
                      }}
                    >
                      {t("Edit")}
                    </Link>
                  </td> */}
                </tr>
              </tbody>
            ))}
          </Tables>
        </div>
      </Accordion>
    </div>
  );
};

export default ReportHeaderSetupMaster;
