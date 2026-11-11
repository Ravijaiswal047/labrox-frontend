import React from "react";
import { useState, useEffect } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import { ExportToExcel, autocompleteOnBlur } from "../../utils/helpers";
import Accordion from "@app/components/UI/Accordion";
import { axiosInstance } from "../../utils/axiosInstance";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { apiUrls } from "../../utils/apiUrls";
import { GetRateTypeByGlobalCentre } from "../../utils/NetworkApi/commonApi";
import AutoComplete from "../../components/formComponent/AutoComplete";
import Input from "../../components/formComponent/Input";
import { toast } from "react-toastify";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";

const DailyOSReport = () => {
  const InitialData = {
    BusinessUnitId: [],
    SalesManager: [],
    RateTypeID: 0,
    RateTypeLabel: "",
    FromDate: new Date(),
    ToDate: new Date(),
  };
  const [searchData, setSearchData] = useState(InitialData);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false)
  const [businessUnits, setBusinessUnits] = useState([])
  const [salesManager, setSalesManager] = useState([])
  const [client, setClient] = useState([]);
  const [rateTypeSuggestions, setRateTypeSuggestions] = useState([]);
  const [rateTypeIndex, setRateTypeIndex] = useState(0);
  const [selectRateType, setSelectRateType] = useState(false);
  const { t } = useTranslation();

  // fetch centres
  useEffect(() => {
    const fetchBusinessUnits = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(apiUrls.getGlobalCentres);
        const data = res?.data?.message || [];
        const mapped = data.map(r => ({
          value: String(r?.CentreID),
          label: r?.Centre,
        }));

        setBusinessUnits(mapped);
      } catch (err) {
        console.error("Failed to load centers", err);
        setBusinessUnits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessUnits();
  }, []);

  useEffect(() => {
    const fetchSalesManagers = async () => {
      try {
        const res = await axiosInstance.get(apiUrls.getAllsalesManager);
        const data = res.data.message;
        const mapped = data.map((ele) => ({
          value: ele.PROID,
          label: ele.ProName,
        }))
        setSalesManager(mapped)
      } catch (error) {
        console.error("Failed to load sales managers", err);

      }
    }

    fetchSalesManagers()
  }, [])

  useEffect(() => {
    GetRateTypeByGlobalCentre(setClient);
  }, []);

  const handleRateTypeChange = (e) => {
    const value = e.target.value;

    // Update the label in state as user types
    setSearchData((prev) => ({ ...prev, RateTypeLabel: value }));

    if (value.trim() === "") {
      setSelectRateType(false);
      setRateTypeSuggestions([]);
      setSearchData((prev) => ({ ...prev, RateTypeID: 0, RateTypeLabel: "" }));
    } else {
      const filtered = client.filter((item) =>
        item.label.toLowerCase().includes(value.toLowerCase())
      );
      setRateTypeSuggestions(filtered);
      setSelectRateType(true);
      // Don't set RateTypeID here, only when item is selected
    }
  };
  // commm
  const handleRateTypeKeyDown = (e) => {
    if (rateTypeSuggestions.length === 0) return;

    if (e.which === 38) { // Up
      setRateTypeIndex((prev) =>
        prev > 0 ? prev - 1 : rateTypeSuggestions.length - 1
      );
    } else if (e.which === 40) { // Down
      setRateTypeIndex((prev) =>
        prev === rateTypeSuggestions.length - 1 ? 0 : prev + 1
      );
    } else if (e.which === 13) { // Enter
      handleRateTypeSelect(rateTypeSuggestions[rateTypeIndex]);
      setRateTypeIndex(0);
    }
  };

  const handleRateTypeSelect = (data) => {
    setSearchData((prev) => ({
      ...prev,
      RateTypeLabel: data.label,
      RateTypeID: data.value,
    }));
    setSelectRateType(false);
    setRateTypeSuggestions([]);
  };


  const dateSelect = (value, name) => {
    if (name === "FromDate") {
      const updateDate =
        new Date(searchData?.ToDate) - value < 0 ? value : searchData.ToDate;
      setSearchData((searchData) => ({
        ...searchData,
        [name]: value,
        ToDate: updateDate,
      }));
    } else if (name === "ToDate") {
      setSearchData((searchData) => ({
        ...searchData,
        [name]: value,
      }));
    } else {
      setSearchData((searchData) => ({
        ...searchData,
        [name]: value,
      }));
    }
  };

  const handleSelectMultiChange = (name, value) => {
    setSearchData({ ...searchData, [name]: value });

  };

  const handleReport = async () => {
    const searchPayload = {
      BusinessUnitIds: searchData.BusinessUnitId,
      RateTypeID: searchData.RateTypeID,
      ProEmployeeID: searchData.SalesManager,
      FromDate: searchData.FromDate,
      ToDate: searchData.ToDate
    };

    setLoading(true);
    try {
      const res = await axiosInstance.post(apiUrls.DailyOSReport, searchPayload);
      const data = res.data

      if (data.success) {
        setReport(data.message);
      } else {
        setReport([])
        toast.error("No records found.");
      }
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      setLoading(false);
    }
  };


  const handleExportReport = () => {
    if (!report || report === 0) return;
    const formattedDate = new Date(searchData.ToDate).toISOString().split('T')[0];
    ExportToExcel(report, `DailyOSReport-${formattedDate}.xlsx`)
    toast.success("Report downloaded.");
  }



  return (
    <>
      <Accordion
        name={t("Daily OS Report")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <MultiSelectComp
              className="required-fields"
              options={businessUnits}
              name="BusinessUnitId"
              placeholder=" "
              label="Business Unit"
              id="BusinessUnitId"
              value={searchData?.BusinessUnitId}
              onChange={handleSelectMultiChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              name="RateTypeID"
              lable="Rate Type"
              value={searchData.RateTypeLabel || ""}
              placeholder=" "
              onChange={handleRateTypeChange}
              onKeyDown={handleRateTypeKeyDown}
              onBlur={(e) => {
                const snapshot = [...rateTypeSuggestions];
                autocompleteOnBlur(setRateTypeSuggestions);

                setTimeout(() => {
                  const typed = (e.target.value || "").trim();
                  if (!typed) {
                    setSearchData((prev) => ({ ...prev, RateTypeID: 0 }));
                    return;
                  }
                  const match = snapshot.find(
                    (ele) => ele.label.toLowerCase() === typed.toLowerCase()
                  );
                  // Fixed: Changed !match to match
                  if (match) {
                    setSearchData((prev) => ({
                      ...prev,
                      RateTypeLabel: match.label,
                      RateTypeID: Number(match.value),
                    }));
                  } else {
                    setSearchData((prev) => ({ ...prev, RateTypeID: 0 }));
                  }
                }, 200);
              }}
            />

            {selectRateType && rateTypeSuggestions.length > 0 && (
              <AutoComplete
                selects={selectRateType}
                test={rateTypeSuggestions.map((item) => ({
                  TestName: item.label,
                }))}
                handleListSearch={(selected) =>
                  handleRateTypeSelect(
                    rateTypeSuggestions.find(
                      (item) => item.label === selected.TestName
                    )
                  )
                }
                indexMatch={rateTypeIndex}
              />
            )}
          </div>
          <div className="col-sm-2">
            <MultiSelectComp
              className="required-fields"
              options={salesManager}
              name="SalesManager"
              placeholder=" "
              label="Sales Manager"
              id="SalesManager"
              value={searchData?.SalesManager}
              onChange={handleSelectMultiChange}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="FromDate"
              lable="FromDate"
              name="FromDate"
              value={searchData.FromDate ? new Date(searchData.FromDate) : null}
              maxDate={new Date()}
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="ToDate"
              lable={t("To Date")}
              name="ToDate"
              value={searchData.ToDate ? new Date(searchData.ToDate) : null}
              minDate={new Date(searchData.FromDate)}
              maxDate={new Date()}
              onChange={dateSelect}
            />
          </div>

          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={handleReport}
              disabled={loading}
            />
          </div>
          <div className="col-sm-1">
            {report && report.length > 0 && (
              <CustomButton
                  text={"Excel"}
                  icon={"excel"}
                  onClick={handleExportReport}
              />
            )}
          </div>
        </div>
      </Accordion>
      <Accordion
        title={t("Search Data")}
        defaultValue={true}
        linkTo="/Daily OS Report"
        linkTitle={
          <div className="link-title-container mt-2" id="pr_id_11" style={{ marginRight: "10px" }}>
            <label>
              Days Sales OS = ((opening + closing) / 2 / current Sale) * Tenure In Days
            </label>
          </div>
        }

      >
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div
                className="table-responsive"
                style={{ minHeight: "130px", maxHeight: "70vh", overflowY: "auto" }}
              >
                {loading ? (
                  <div className="text-center py-4">
                    <div className="text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : report.length > 0 ? (
                  <Tables className="table table-sm mb-0 p-2">
                    <thead>
                      <tr>
                        <th scope="col">{t("#")}</th>
                        <th scope="col">{t("Business Unit")}</th>
                        <th scope="col">{t("Sales Manager")}</th>
                        {/* <th scope="col">{t("Collection Boy Name")}</th> */}
                        <th scope="col">{t("Rate Type Code")}</th>
                        <th scope="col">{t("Rate Type Name")}</th>
                        <th scope="col">{t("Days Sales OS")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {report.map((r, idx) => {

                        return (
                          <tr key={idx}>
                            <td data-title={t("#")}>{idx + 1}</td>
                            <td data-title={t("Business Unit")}>{r?.BusinessUnit}</td>
                            <td data-title={t("Sales Manager")}>{r?.SalesManager}</td>
                            {/* <td data-title={t("Collection Boy Name")}>{r?.FeildBoy}</td> */}
                            <td data-title={t("Rate Type Code")}>{r?.RateTypeCode}</td>
                            <td data-title={t("Rate Type Name")}>{r?.RateTypeName}</td>
                            <td data-title={t("Days Sales OS")}>{Math.floor(r?.DaysSalesOutstanding) ?? "0"}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DailyOSReport;