import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";
import moment from "moment";
import { axiosInstance } from "../../utils/axiosInstance";
import { GetRateTypeByGlobalCentre } from "../../utils/NetworkApi/commonApi";
import Loading from "../../components/loader/Loading";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { ExportToExcel } from "../../utils/helpers";
import Tables from "../../components/UI/customTable";

import Accordion from "@app/components/UI/Accordion";
import { TypeData } from "../../utils/Constants";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { useTranslation } from "react-i18next";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";

const LedgerStatusAsOnDate = () => {
  const [RateType, setRateType] = useState([]);
  const [TableData, setTableData] = useState({});
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    RateTypeId: [],
    AsOnDate: new Date(),
    AsOnTime: "00:00:00",
    FromDate: new Date(),
    ToDate: new Date(),
    DateType: "1",
  });

  const { t } = useTranslation();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };
  const handleSelectMultiChange = (name, value) => {
    if (name === "RateTypeId") {
      setPayload({ ...payload, [name]: value });
    }
  };

  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleSearch = () => {
    if (payload?.RateTypeId?.length > 0) {
      const formattedPayload = {
        AsOnDate: moment(payload?.AsOnDate, "DD-MM-YYYY").format("DD-MMM-YYYY"),
        AsOnTime: payload?.AsOnTime,
        FromDate: moment(payload?.FromDate, "DD-MM-YYYY").format("DD-MMM-YYYY"),
        ToDate: moment(payload?.ToDate, "DD-MM-YYYY").format("DD-MMM-YYYY"),
        DateType: payload?.DateType,
        RateTypeId: payload?.RateTypeId,
      };
      setLoading(true);
      axiosInstance
        .post("Accounts/LedgerStatusAsOnDateReport", formattedPayload)
        .then((res) => {
          const data = res?.data?.message;
          const obj = {
            DateType: payload?.DateType,
            details: data,
          };
          setTableData(obj);

          setLoading(false);
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
          setLoading(false);
        });
    } else {
      toast.error("Please Select Rate Type");
    }
  };
  useEffect(() => {
    GetRateTypeByGlobalCentre(setRateType);
  }, []);
  return (
    <>
      <Accordion
        name={t("Ledger Status As On Date Report")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <MultiSelectComp
              options={RateType}
              placeholder=" "
              className="required-fields"
              label="RateType"
              id="RateType"
              name="RateTypeId"
              value={payload?.RateTypeId}
              onChange={handleSelectMultiChange}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={TypeData}
              name="DateType"
              lable="Type"
              id="Type"
              selectedValue={payload?.DateType}
              onChange={handleChange}
            />
          </div>
          {payload?.DateType === "1" && (
            <>
              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  placeholder=" "
                  id="AsOnDate"
                  lable="As On Date"
                  name="AsOnDate"
                  value={payload?.AsOnDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                />
              </div>
            </>
          )}
          {payload?.DateType === "2" && (
            <>
              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  placeholder=" "
                  id="FromDate"
                  lable="FromDate"
                  name="FromDate"
                  value={payload?.FromDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                />
              </div>
              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  placeholder=" "
                  id="ToDate"
                  lable="ToDate"
                  name="ToDate"
                  value={payload?.ToDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                  minDate={new Date(payload.FromDate)}
                />
              </div>
            </>
          )}
          {payload?.DateType === "3" && (
            <>
              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  placeholder=" "
                  id="FromDate"
                  lable="FromDate"
                  name="FromDate"
                  value={payload?.FromDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                />
              </div>
              <div className="col-sm-2">
                <DatePicker
                  className="custom-calendar"
                  placeholder=" "
                  id="ToDate"
                  lable="ToDate"
                  name="ToDate"
                  value={payload?.ToDate}
                  onChange={dateSelect}
                  maxDate={new Date()}
                  minDate={new Date(payload.FromDate)}
                />
              </div>
            </>
          )}
          <div className="col-sm-1">
          </div>
          <SearchButton
            text={"Search"}
            onClick={handleSearch}
          />
          <div className="col-sm-1">
            <CustomButton
              text={"Report"}
              icon={"excel"}
              onClick={() => ExportToExcel(TableData.details)}
              disabled={!TableData.details || TableData.details.length === 0}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {TableData.details && TableData.details.length > 0 && (
              <>
                {TableData?.DateType === "1" && (
                  <div className="card">
                    <>
                      <Tables>
                        <thead className="cf">
                          <tr>
                            <th>{t("S.No.")}</th>
                            <th>{t("Code")}</th>
                            <th>{t("Client Name")}</th>
                            <th>{t("Zone")}</th>
                            <th>{t("State")}</th>
                            <th>{t("City")}</th>
                            <th>{t("Contact No.")}</th>
                            <th>{t("Date")}</th>
                            <th>{t("Opening Balance")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TableData.details.map((ele, index) => (
                            <tr key={index}>
                              <td data-title="S.No.">{index + 1}</td>
                              <td data-title="Code">{ele?.PanelCode}</td>
                              <td data-title="Client Name">{ele?.PanelName}</td>
                              <td data-title="Zone">{ele?.Zone}</td>
                              <td data-title="State">
                                {ele?.State == "------SELECT-----"
                                  ? ""
                                  : ele?.State}
                              </td>
                              <td data-title="City">
                                {ele?.City == "-----SELECT----"
                                  ? ""
                                  : ele?.City}
                              </td>
                              <td data-title="Contact No.">{ele?.Mobile}</td>
                              <td data-title="Date">{ele?.AsOnDate}</td>
                              <td
                                data-title="Opening Balance"
                                className="amount"
                              >
                                {ele?.OpeningBalance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Tables>
                    </>
                  </div>
                )}
              </>
            )}
            {TableData.details && TableData.details.length > 0 && (
              <>
                {TableData?.DateType === "2" && (
                  <div className="card">
                    <>
                      <Tables>
                        <thead className="cf">
                          <tr>
                            <th>{t("S.No.")}</th>
                            <th>{t("Code")}</th>
                            <th>{t("Client Name")}</th>
                            <th>{t("Creation Date")}</th>
                            <th>{t("Zone")}</th>
                            <th>{t("State")}</th>
                            <th>{t("City")}</th>
                            <th>{t("Contact No.")}</th>
                            <th>{t("Date")}</th>
                            <th>{t("Opening Balance")}</th>
                            <th>{t("IsBookingLock")}</th>
                            <th>{t("Paid Amt")}</th>
                            <th>{t("Balance Amt")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TableData.details.map((ele, index) => (
                            <tr key={index}>
                              <td data-title="S.No.">{index + 1}</td>
                              <td data-title="Code">{ele?.PanelCode}</td>
                              <td data-title="Client Name">{ele?.PanelName}</td>
                              <td data-title="Creation Date">
                                {ele?.CreatorDate}
                              </td>
                              <td data-title="Zone">{ele?.Zone}</td>
                              <td data-title="State">{ele?.State}</td>
                              <td data-title="City">{ele?.City}</td>
                              <td data-title="Contact No.">{ele?.Mobile}</td>
                              <td data-title="Date">{ele?.AsOnDate}</td>
                              <td data-title="Opening Balance">
                                {ele?.OpeningBalance}
                              </td>
                              <td data-title="IsBookingLock">
                                {ele?.IsBlockPanelBooking == 0 ? "No" : "Yes"}
                              </td>
                              <td data-title="Paid Amt">
                                {ele?.ReceivedAmount}
                              </td>
                              <td data-title="Balance Amt">
                                {ele?.TotalOutstanding}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Tables>
                    </>
                  </div>
                )}
              </>
            )}
            {TableData.details && TableData.details.length > 0 && (
              <>
                {TableData?.DateType === "3" && (
                  <div className="card">
                    <>
                      <Tables>
                        <thead className="cf">
                          <tr>
                            <th>{t("S.No.")}</th>
                            <th>{t("Code")}</th>
                            <th>{t("Client Name")}</th>
                            <th>{t("Zone")}</th>
                            <th>{t("State")}</th>
                            <th>{t("City")}</th>
                            <th>{t("Contact No.")}</th>
                            <th>{t("Date")}</th>
                            <th>{t("Opening Balance")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {TableData.details.map((ele, index) => (
                            <tr key={index}>
                              <td data-title="S.No.">{index + 1}</td>
                              <td data-title="Code">{ele?.PanelCode}</td>
                              <td data-title="Client Name">{ele?.PanelName}</td>
                              <td data-title="Zone">{ele?.Zone}</td>
                              <td data-title="State">{ele?.State}</td>
                              <td data-title="City">{ele?.City}</td>
                              <td data-title="Contact No.">{ele?.Mobile}</td>
                              <td data-title="Date">{ele?.AsOnDate}</td>
                              <td
                                data-title="Opening Balance"
                                style={{ textAlign: "right" }}
                              >
                                {ele?.OpeningBalance}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Tables>
                    </>
                  </div>
                )}
              </>
            )}
            {Object.keys(TableData)?.length == 0 && <NoRecordFound />}
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default LedgerStatusAsOnDate;
