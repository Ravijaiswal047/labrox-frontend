import React, { useState } from "react";
import { AutoComplete } from "primereact/autocomplete";
import { useTranslation } from "react-i18next";
import { LoadCentreChartOfAccountAPI } from "../../../NetworkServices/finance.js";

export default function ChartOfAccount({
  VoucherType,
  setOldPayloadData,
  Currency,
  label,
  required,
}) {
  const [t] = useTranslation();
  const [items, setItems] = useState([]);
  const [payloadData, setPayloadData] = useState({});
  // const search = async (event) => {
  //   if (event?.query?.length > 0) {
  //       const payload = {
  //         groupCode: String("0"),
  //         accountTypeID: 0,
  //         currencyCode: String(Currency),
  //         accountName: String(event?.query || ""),
  //         voucherType: String(VoucherType),
  //         isTaxDetail: 0,
  //       };
  //       let results = await LoadCentreChartOfAccountAPI(payload);
  //       if (results?.success) {
  //         setItems(results?.data);
  //       } else {
  //         setItems([]);
  //       }
  //   } else {
  //     setItems([]);
  //   }
  // };

  const search = async (event) => {
    if (event?.query?.length > 0) {
      const payload = {
        groupCode: String("0"),
        accountTypeID: 0,
        currencyCode: String(Currency),
        accountName: String(event?.query || ""),
        voucherType: String(VoucherType),
        isTaxDetail: 0,
      };
      let results = await LoadCentreChartOfAccountAPI(payload);
      if (results?.success) {
        setItems(results?.data);
      } else {
        setItems([]);
      }
    } else {
      setItems([]);
    }
  };

  const validateInvestigation = async (e, name) => {
    const { value } = e;
    setOldPayloadData((val) => ({ ...val, [name]: value }));
  };

  const itemTemplate = (item) => {
    return (
      <div className="p-clearfix">
        <div style={{ float: "left", fontSize: "1rem", width: "100%" }}>
          {item?.TextField}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="col-xl-4 col-md-8 col-sm-6 col-12">
        <AutoComplete
          value={
            payloadData?.coa_cog_wise?.TextField
              ? payloadData?.coa_cog_wise?.TextField
              : payloadData?.coa_cog_wise
          }
          suggestions={items}
          completeMethod={(e) => {
            search(e, "coa_cog_wise");
          }}
          onChange={(e) => {
            setPayloadData({ ...payloadData, coa_cog_wise: e.value });
            if (!e.value) {
              setOldPayloadData((val) => ({ ...val, coa_cog_wise: "" }));
            }
          }}
          className={`w-100 ${required ? "required-fields" : ""}`}
          onSelect={(e) => validateInvestigation(e, "coa_cog_wise")}
          id="coa_cog_wise"
          itemTemplate={itemTemplate}
        />
        <label
          className="label lable truncate ml-3 p-1"
          style={{ fontSize: "5px !important" }}
        >
          {t(label)}
        </label>
      </div>
    </>
  );
}
