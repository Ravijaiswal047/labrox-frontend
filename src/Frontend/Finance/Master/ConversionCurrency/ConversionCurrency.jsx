import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import DatePicker from "../../../../components/formComponent/DatePickerHis";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import { SaveCurrencyConverterFactor } from "../../../../NetworkServices/finance.js";
import { LoadCurrencyDetail } from "../../../../NetworkServices/PaymentGatewayApi";
import Tables from "../../../../components/UI/customTable";
import { GetCurrencyConversionDetails } from "../../../../NetworkServices/finance.js";
import { notify } from "../../../../utils/utils";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import HisTable from "../../../../components/UI/customTable/HisTable";

const ConversionCurrency = () => {
  const [t] = useTranslation();
  const [values, setValues] = useState({
    baseCurrency: "",
    date: new Date(),
    currency: "",
    sellingBase: "",
    sellingSpecific: "",
    sellingRound: "",
    buyingBase: "",
    buyingSpecific: "",
    buyingCurrency: "",
  });
  const [currencyList, setCurrencyList] = useState([]);
  const [table, viewTables] = useState([]);
  const localdata = useLocalStorage("userData", "get");

  const CURRENCYDETAILS = [
    { name: t("S.No"), width: "1%" },
    { name: t("Currency"), width: "5%" },
    { name: t("Notation"), width: "3%" },
    { name: t("Selling Base"), width: "3%" },
    { name: t("Selling Specific"), width: "3%" },
    { name: t("Buying Base"), width: "3%" },
    { name: t("Buying Specific"), width: "3%" },
    { name: t("Round"), width: "3%" },
    { name: t("Min Currency"), width: "3%" },
    { name: t("Date"), width: "3%" },
  ];

  const fetchCurrencyDetail = async () => {
    try {
      const response = await LoadCurrencyDetail();

      if (response?.data) {
        setCurrencyList(response.data);
      }
    } catch (error) {
      console.error("Failed to load currency detail:", error);
    }
  };

  useEffect(() => {
    fetchCurrencyDetail();
  }, []);

  const CurrencyConversion = async () => {
    try {
      const payload = {
        countryId: values.currency.S_CountryID,
      };
      const response = await GetCurrencyConversionDetails(payload);

      if (response?.data) {
        viewTables(response.data);
        setValues((val) => ({
          ...val,
          sellingSpecific: response?.data[0]?.Selling_Specific,
          sellingBase: response?.data[0]?.Selling_Base,
          sellingRound: response?.data[0]?.Round,
          buyingBase: response?.data[0]?.Buying_Base,
          buyingSpecific: response?.data[0]?.Buying_Specific,
          buyingCurrency: response?.data[0]?.MinCurrency,
        }));
      }
    } catch (error) {
      console.error("Failed to load currency detail:", error);
    }
  };

  useEffect(() => {
    if (values.currency.S_CountryID) {
      CurrencyConversion();
    }
  }, [values?.currency]);

  // Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((val) => ({
      ...val,
      [name]: value,
    }));
  };

  const handleDateChange = (name, e) => {
    debugger;
    setValues((prev) => ({
      ...prev,
      [name]: e.target.value,
    }));
  };

  // Select Change
  const handleSelect = (name, value) => {
    const selected = currencyList.find(
      (item) => item.S_Currency === value?.value
    );
    setValues((val) => ({
      ...val,
      currency: selected,
      baseCurrency:
        selected?.IsBaseCurrency === 0
          ? { label: "USD", value: "USD" }
          : { label: "INR", value: "INR" },
    }));
  };

  const handleReactSelect = (name, value) => {
    setValues((val) => ({
      ...val,
      [name]: value,
    }));
  };

  const getSpecificNotation = () => {
    if (values?.currency?.S_Notation) {
      return values.currency.S_Notation;
    }
    return "";
  };

  const handleSave = async () => {
    try {
      const baseCurrencyDetail = currencyList.find(
        (item) => item.S_Currency === values.baseCurrency.value
      );

      if (!baseCurrencyDetail) {
        notify("Base currency details not found!");
        return;
      }

      if (!values.currency.S_CountryID) {
        notify("Please select specific currency!");
        return;
      }

      const payload = {
        S_CountryID: values.currency.S_CountryID,
        S_Currency: values.currency.S_Currency,
        S_Notation: values.currency.S_Notation,
        B_CountryID: baseCurrencyDetail.S_CountryID,
        B_Currency: baseCurrencyDetail.S_Currency,
        B_Notation: baseCurrencyDetail.S_Notation,
        Selling_Base: parseFloat(values.sellingBase) || 0,
        Selling_Specific: parseFloat(values.sellingSpecific) || 0,
        Buying_Base: parseFloat(values.buyingBase) || 0,
        Buying_Specific: parseFloat(values.buyingSpecific) || 0,
        Round: parseInt(values.sellingRound) || 0,
        MinCurrency: parseFloat(values.buyingCurrency) || 0,
      };

      const response = await SaveCurrencyConverterFactor(payload);

      if (response?.success || response?.data) {
        notify("Currency conversion factor saved successfully!");
        CurrencyConversion();
      } else {
        notify("Failed to save currency conversion factor!");
      }
    } catch (error) {
      notify("Error saving currency conversion factor!");
    }
  };

  return (
    <div className="card">
      <Heading name={"Currency Conversion"} 
      isBreadcrumb={true}/>

      <div className="row p-2">
        <DatePicker
          className="custom-calendar"
          placeholder=""
          label={t("Date")}
          respclass={"col-xl-2 col-md-4 col-sm-6 col-12"}
          name="date"
          id="date"
          showTime
          hourFormat="12"
          handleChange={(value) => handleDateChange("date", value)}
          value={values.date}
        />

        <ReactSelect
          placeholderName={t("Base Currency")}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          id="type"
          name="baseCurrency"
          removeIsClearable={true}
          isDisabled={true}
          dynamicOptions={[
            { label: "INR", value: "INR" },
            { label: "USD", value: "USD" },
          ]}
          onChange={handleReactSelect}
          value={localdata?.centreCurrency}
        />

        <ReactSelect
          placeholderName={t("Specific Currency")}
          searchable={true}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          id={"currency"}
          name={"currency"}
          removeIsClearable={true}
          dynamicOptions={currencyList.map((item) => ({
            label: `${item.S_Currency} $ ${item.S_Notation}`,
            value: item.S_Currency,
          }))}
          value={
            values.currency
              ? {
                  label: `${values.currency.S_Currency} ${values.currency.S_Notation}`,
                  value: values.currency.S_Currency,
                }
              : null
          }
          onChange={handleSelect}
        />

        <ReactSelect
          placeholderName={t("Specific Notation")}
          respclass="col-xl-2 col-md-4 col-sm-6 col-12"
          removeIsClearable={true}
          isDisabled={true}
          dynamicOptions={[
            { label: getSpecificNotation(), value: getSpecificNotation() },
          ]}
          value={getSpecificNotation()}
        />
      </div>

      <Heading title={"Conversion Factor Details"} />

      <div className="row p-2">
        <Input
          type="text"
          placeholder={""}
          className="form-control"
          lable={t("Selling Price In Base")}
          id="sellingBase"
          name="sellingBase"
          value={values?.sellingBase ? values?.sellingBase : ""}
          onChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-4 col-12"
        />

        <Input
          type="text"
          placeholder={""}
          className="form-control"
          lable={t("Selling Price In Specific")}
          id="sellingSpecific"
          name="sellingSpecific"
          value={values?.sellingSpecific}
          onChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-4 col-12"
        />

        <Input
          type="text"
          placeholder={""}
          className="form-control"
          lable={t("Selling Price Round")}
          id="sellingRound"
          name="sellingRound"
          value={values?.sellingRound}
          onChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-4 col-12"
        />

        <Input
          type="text"
          placeholder={""}
          className="form-control"
          lable={t("Buying Price In Base")}
          id="buyingBase"
          name="buyingBase"
          value={values?.buyingBase}
          onChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-4 col-12"
        />

        <Input
          type="text"
          placeholder={""}
          className="form-control"
          lable={t("Buying Price In Specific")}
          id="buyingSpecific"
          name="buyingSpecific"
          value={values?.buyingSpecific}
          onChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-4 col-12"
        />

        <Input
          type="text"
          placeholder={""}
          className="form-control"
          lable={t("Buying Price Min Currency")}
          id="buyingCurrency"
          name="buyingCurrency"
          value={values?.buyingCurrency}
          onChange={handleChange}
          respclass="col-xl-2 col-md-4 col-sm-4 col-12"
        />
      </div>

      <div className="d-flex justify-content-end mb-2 mr-2">
        <button className="btn btn-success" onClick={handleSave}>
          {t("Save")}
        </button>
      </div>
      {table.length > 0 && (
        <HisTable
          thead={CURRENCYDETAILS}
          tbody={table.map((row, index) => ({
            "S.No": index + 1,
            Currency: row.S_Currency,
            Notation: row.S_Notation,
            "Selling Base": row.Selling_Base,
            "Selling Specific": row.Selling_Specific,
            "Buying Base": row.Buying_Base,
            "Buying Specific": row.Buying_Specific,
            Round: row.Round || "0",
            "Min Currency": row.MinCurrency,
            Date: row.DATE,
          }))}
        />
      )}
    </div>
  );
};

export default ConversionCurrency;
