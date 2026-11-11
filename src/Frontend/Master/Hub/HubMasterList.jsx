import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { axiosInstance } from "../../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../../components/formComponent/SelectBox";
import Input from "../../../components/formComponent/Input";
import Loading from "../../../components/loader/Loading";
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import { SearchButton } from "../../../components/UI/CustomButton";

const HubMasterList = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [CentreType, setCentreType] = useState([]);
  const [payload, setPayload] = useState({
    CentreType: "",
    CentreName: "",
    CentreCode: "",
    DataType: "HUB",
  });
  const [data, setData] = useState([]);

  const handleSelect = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
  };

  const getCentreData = () => {
    setLoading(true);
    axiosInstance
      .post("Centre/getCentreData", payload)
      .then((res) => {
        if (res.data?.success) {
          setData(res.data.message);
          setLoading(false);
        } else {
          toast.error(res.data?.message || "Failed to load data");
          setData([]);
          setLoading(false);
        }
      })
      .catch((err) => console.log(err));
  };

  const getDropDownData = () => {
    axiosInstance
      .post("Global/getGlobalData", { Type: "HUB" })
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.FieldDisplay,
            label: ele.FieldDisplay,
          };
        });
        value.unshift({ label: "All", value: "" });
        setCentreType(value);
      })
      .catch((err) => console.log(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  useEffect(() => {
    // getCentreData();
    getDropDownData();
  }, []);
  return (
    <>
      <Accordion
        name={`${t("Hub")} ${t("Type List")}`}
        defaultValue={true}
        isBreadcrumb={true}
        linkTo={"/HubMaster"}
        linkTitle={t("Create New")}
        state={{
          url: "",
        }}
      >
        <div className="row pt-2 pl-2 pr-2">
            {/* <div className="col-sm-2 col-md-2">
              <SelectBox
                onChange={handleSelect}
                options={CentreType}
                id="Type"
                lable="Type"
                name="CentreType"
                selectedValue={payload?.CentreType}
              />
            </div> */}
          <div className="col-sm-2 col-md-2">
            <Input
              className="select-input-box form-control input-sm"
              placeholder=" "
              lable="Hub Name"
              id="CentreName"
              name="CentreName"
              type="text"
              value={payload?.CentreName}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2 col-md-2">
            <Input
              name="CentreCode"
              type="text"
              placeholder=" "
              lable="Hub Code"
              id="CentreCode"
              value={payload?.CentreCode}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={getCentreData}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : data.length > 0 ? (
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Name")}</th>
                    <th>{t("Code")}</th>
                    <th>{t("Invoice To")}</th>
                    <th>{t("Business Unit")}</th>
                    <th>{t("Processing Lab")}</th>
                    <th>{t("Reference Rate")}</th>
                    <th>{t("Barcode Logic")}</th>
                    <th>{t("Invoicing")}</th>
                    <th>{t("Creation Date")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((data, i) => (
                    <tr key={i}>
                      <td data-title={t("S.No")}>{i + 1}&nbsp;</td>
                      <td data-title={t("Name")}>{data?.Centre}&nbsp;</td>
                      <td data-title={t("Code")}>{data?.CentreCode}&nbsp;</td>
                      <td data-title={t("Invoice To")}>
                        {data?.InvoiceToStatus}&nbsp;
                      </td>
                      <td data-title={t("Business Unit")}>
                        {data?.BusinessUnitStatus}&nbsp;
                      </td>
                      <td data-title={t("Processing Lab")}>
                        {data?.ProcessingLabStatus}&nbsp;
                      </td>
                      <td data-title={t("Reference Rate")}>
                        {data?.ReferenceRateStatus}&nbsp;
                      </td>
                      <td data-title={t("Barcode Logic")}>
                        {data?.BarcodeDisplay}&nbsp;
                      </td>
                      <td data-title={t("Invoicing")}>
                        {data?.InvoiceToStatus}&nbsp;
                      </td>
                      <td data-title={t("Date")}>{data?.dtEntry}&nbsp;</td>
                      <td data-title={t("Status")}>
                        {data?.isActive == 1 ? t("Active") : t("Expired")}
                        &nbsp;
                      </td>
                      <td data-title={t("Action")}>
                        <Link
                          state={{
                            data: data,
                            other: { button: "Update", pageName: "Edit" },
                            url: "Centre/UpdateCentre",
                            hideCredentials: true,
                          }}
                          to={"/HubMaster"}
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
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default HubMasterList;
