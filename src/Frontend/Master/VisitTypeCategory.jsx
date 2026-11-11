import React, { useEffect, useMemo, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import { axiosInstance } from "../../utils/axiosInstance";
import { Link, useLocation } from "react-router-dom";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { toast } from "react-toastify";
import { getVisitType } from "../../utils/NetworkApi/commonApi";
import Loading from "../../components/loader/Loading";
const VisitTypeCategory = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [Category, setCategory] = useState([]);
  const [payload, setPayload] = useState({
    Category: "",
    VisitType: "",
    CategoryName: "",
    VisitTypeName: "",
    IsUpdate: false,
    ID: 0,
    IsActive: 1,
  });
  console.log(payload);
  const handleSearchSelectChange = (label, value) => {
    if (label == "VisitType") {
      getTableData(Number(value?.value));
      setPayload({
        ...payload,
        VisitTypeName: value?.label,
        [label]: value?.value,
      });
    }

    if (label == "Category")
      setPayload({
        ...payload,
        CategoryName: value?.label,
        [label]: value?.value,
      });
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    });
  };
  const [VisitType, setVisitType] = useState([]);
  const [tableData, setTableData] = useState([]);
  const getTableData = (value) => {
    setLoading(true);
    axiosInstance
      .post("CommonController/GetVisitCategoryData", { VisitTypeID: value })
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
    if (!payload?.VisitType) {
      toast.error("Please Select Visit Type");
      return;
    } else if (!payload?.Category) {
      toast.error("Please Select Category");
      return;
    } else {
      setLoading(true);
      const items = {
        ID: payload?.ID,
        Category: payload?.CategoryName,
        CategoryID: payload?.Category,
        VisitTypeID: payload?.VisitType,
        VisitType: payload?.VisitTypeName,
        IsActive: payload?.IsActive,
      };
      axiosInstance
        .post("CommonController/SaveOrUpdateVisitCategory", { ...items })
        .then((res) => {
          if (res?.data?.success) {
            toast.success(res?.data?.message);
            setPayload({
              Category: "",
              VisitType: "",
              CategoryName: "",
              VisitTypeName: "",
              IsUpdate: false,
              ID: 0,
              IsActive: 1,
            });
            getTableData(0);
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

  const VisitTypeCategory = () => {
    axiosInstance
      .post("Global/getGlobalData", { Type: "VisitTypeCategory" })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldID,
            label: ele.FieldDisplay,
          };
        });
        setCategory(value);
      })
      .catch((err) => console.log(err));
  };
  const handleUpdate = (ele) => {
    setPayload({
      Category: ele?.CategoryID,
      VisitType: ele?.VisitTypeID,
      CategoryName: ele?.Category,
      VisitTypeName: ele?.VisitType,
      IsUpdate: true,
      ID: ele?.ID,
      IsActive: ele?.IsActive,
    });
  };
  useEffect(() => {
    getTableData(0);
    getVisitType(setVisitType);
    VisitTypeCategory();
  }, []);
  return (
    <div>
      <Accordion
        name={t("Visit Type Category")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              dynamicOptions={VisitType}
              removeIsClearable={true}
              name="VisitType"
              lable="VisitType"
              id="VisitType"
              placeholderName="VisitType"
              value={payload?.VisitType}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              className="required-fields"
              name="Category"
              id="Category"
              removeIsClearable={true}
              dynamicOptions={Category}
              placeholderName="Department Category"
              value={payload?.Category}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-md-1">
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
              {t("IsActive")}
            </label>
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
                  Category: "",
                  VisitType: "",
                  CategoryName: "",
                  VisitTypeName: "",
                  IsUpdate: false,
                  ID: 0,
                  IsActive: 1,
                });

                getTableData(0);
              }}
            >
              {t("Reset")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={"Search Data"} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S No.")}</th>
                    <th>{t("VisitType")}</th>
                    <th>{t("Department Category")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Edit")}</th>
                  </tr>
                </thead>
                {tableData?.map((ele, index) => (
                  <tbody>
                    <tr key={index}>
                      <td data-title="S.No">{index + 1}</td>
                      <td data-title="VisitType">{ele?.VisitType}</td>
                      <td data-title="Department Category">{ele?.Category}</td>
                      <td data-title="Status">
                        {ele?.IsActive == 0 ? "In Active" : "Active"}
                      </td>
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
        )}
      </Accordion>
    </div>
  );
};

export default VisitTypeCategory;
