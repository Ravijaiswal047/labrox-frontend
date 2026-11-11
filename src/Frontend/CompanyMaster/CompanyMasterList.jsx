import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Tables from "../../components/UI/customTable";

import { getTrimmedData } from "../../utils/helpers";
import { useTranslation } from "react-i18next";
import { SearchButton } from "../../components/UI/CustomButton";

const CompanyMasterList = () => {
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    CompanyId: "",
    CompanyCode: "",
    CompanyName: "",
    Country: "",
    State: "",
    City: "",
    Email: "",
    Phone: "",
    Address1: "",
    Address2: "",
    Address3: "",
    isPrefixRequired: 0,
    IsWhatsappRequired: 0,
    SelectType: "",
    GraceDays: 0,
    Mobile1: "",
    Mobile2: "",
    BillingType: "",
  });

  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };
  const handleSearch = () => {
    setLoading(true);
    axiosInstance
      .post(
        "CompanyMaster/GetCompanyMaster",
        getTrimmedData({
          ...payload,
          BillingType: payload?.BillingType,
          Mobile1: payload?.Mobile1,
          Mobile2: payload?.Mobile2,
          SelectType: payload?.SelectType,
          CompanyId: payload?.CompanyId,
        }),
      )
      .then((res) => {
        if (res.status === 200) {
          setFormData(res.data.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
        setLoading(false);
      });
  };
  return (
    <>
      <Accordion
        name="Company Master"
        isBreadcrumb={true}
        defaultValue={true}
        linkTo="/CompanyMaster"
        linkTitle={t("Create New")}
        state={{
          url: "",
        }}
      >
        <div className="row px-2 mt-2 mb-2">
          <div className="col-sm-2 col-md-2">
            <Input
              lable="Company Code"
              placeholder=" "
              name="CompanyCode"
              id="CompanyCode"
              type="text"
              value={payload?.CompanyCode}
              onChange={handleChange}
            />
          </div>

          <div className="col-sm-2 col-md-2">
            <Input
              lable="Company Name"
              placeholder=" "
              name="CompanyName"
              id="CompanyName"
              type="text"
              value={payload?.CompanyName}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2 col-md-1">
            <SearchButton
                text={"Search"}
                type="submit"
              id="btnSearch"
              title="Search"
              onClick={handleSearch}
              />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : formData.length > 0 ? (
          <Tables>
            <thead
              style={{
                position: "sticky",
                top: 0,
              }}
            >
              <tr>
                <th>{t("S.No")}</th>
                <th>{t("CompanyCode")}</th>
                <th>{t("CompanyName")}</th>
                <th>{t("Email")}</th>
                <th>{t("State")}</th>
                <th>{t("City")}</th>
                <th>{t("Mobile1")}</th>
                <th>{t("Type")}</th>
                <th>{t("Edit")}</th>
              </tr>
            </thead>
            <tbody>
              {formData.map((ele, index) => (
                <tr key={index}>
                  <td data-title={"S.No"}>{index + 1}&nbsp;</td>
                  <td data-title={"CompanyCode"}>{ele?.CompanyCode} &nbsp;</td>
                  <td data-title={"CompanyName"}>{ele?.CompanyName} &nbsp;</td>
                  <td data-title={"Email"}>{ele?.Email} &nbsp;</td>
                  <td data-title={"State"}>{ele?.State} &nbsp;</td>
                  <td data-title={"City"}>{ele?.City} &nbsp;</td>
                  <td data-title={"Mobile1"}>{ele?.Mobile1} &nbsp;</td>
                  <td data-title={"BillingType"}>{ele?.BillingType} &nbsp;</td>

                  <td data-title={"Edit"}>
                    <Link
                      state={{
                        data: ele?.CompanyID,
                        other: { button: "Update", pageName: "Edit" },
                        url: "CompanyMaster/EditCompanyMaster",
                      }}
                      to="/CompanyMaster"
                    >
                      {t("Edit")}
                    </Link>
                    &nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </Tables>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default CompanyMasterList;
