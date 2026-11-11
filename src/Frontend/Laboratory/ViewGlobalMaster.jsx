import React, { useEffect, useState } from "react";

import { BindFieldType } from "../../utils/NetworkApi/commonApi";
import { axiosInstance } from "../../utils/axiosInstance";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { dateConfig } from "../../utils/helpers";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import { SearchButton } from "../../components/UI/CustomButton";
const ViewGlobalMaster = () => {
  const [FieldType, setFieldType] = useState([]);
  const [type, setType] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [load, setLoad] = useState(false);
  const { t } = useTranslation();
  const handleChanges = (select) => {
    const data = select.map((ele) => {
      return {
        Type: ele?.value,
      };
    });
    setType(data);
  };
  const handleSearch = () => {
    setLoad(true);
    if (type.length > 0) {
      axiosInstance
        .post("Global/getGlobalDataByFieldType", type)
        .then((res) => {
          if (res?.data?.success) {
            setTableData(res?.data?.message);
          } else {
            toast.error(res?.data?.message);
          }
          setLoad(false);
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
      handleEffect();
    }
  };

  const handleEffect = () => {
    setLoad(true);
    axiosInstance
      .post("Global/getGlobalDataAll")
      .then((res) => {
        setTableData(res?.data?.message);
        setLoad(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoad(false);
      });
  };

  useEffect(() => {
    BindFieldType(setFieldType);
    handleEffect();
  }, []);
  return (
    <>
      <Accordion
        name={t("Global Type Master")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-2 col-md-2">
            <SelectBoxWithCheckbox
              options={FieldType}
              placeholder=" "
              name="FieldType"
              lable={t("Field Type")}
              id={t("Field Type")}
              onChange={handleChanges}
            />
          </div>

          <div className="col-sm-1">
            {load ? (
              <Loading />
            ) : (
              <SearchButton
                  text={"Search"}
                  onClick={handleSearch}
              />
            )}
          </div>

          <div className="col-sm-1">
            <Link to="/GlobalTypeMaster">{t("Create New")}</Link>
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row p-2">
          <div className="col-12">
            <Tables>
              <>
                <thead className="cf thead-class">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Field Type")}</th>
                    <th>{t("Field Display")}</th>
                    <th>{t("Entry Date")}</th>
                    <th>{t("Action")}</th>
                    <th>{t("Edit")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((data, index) => (
                    <tr key={index}>
                      <td data-title={t("S.No")}>{index + 1}</td>
                      <td data-title={t("Field Type")}>{data?.FieldType}</td>
                      <td data-title={t("Field Display")}>
                        {data?.FieldDisplay}
                      </td>
                      <td data-title={t("Entry Date")}>
                        {dateConfig(data?.EntryDate)}
                      </td>
                      <td data-title={t("Action")}>
                        {data?.IsActive === 1 ? t("Active") : t("Expired")}
                      </td>
                      <td>
                        {data.CompanyId === 0   ? (
                          <p
                            style={{ color: "red" }}
                            Tooltip={t("System Generated it can't be changed")}
                          >
                            {t("System Generated it can't be changed")}
                          </p>
                        ) : (
                          <Link
                            to="/GlobalTypeMaster"
                            state={{
                              data: data,
                              url: "/api/v1/Global/UpdateGlobalData",
                            }}
                          >
                            {t("Edit")}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ViewGlobalMaster;
