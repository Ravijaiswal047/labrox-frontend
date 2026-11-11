import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import moment from "moment";
import DatePicker from "../../components/formComponent/DatePicker";
import { dateConfig } from "../../utils/helpers";
import { parseTypedDate, validateFromToDateRange, validateMobileDigits } from "../../utils/validations/validationHelpers";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import Tables from "../../components/UI/customTable";
import Pagination from "../../Pagination/Pagination";
import { Record } from "../../utils/Constants";
import { axiosInstance } from "../../utils/axiosInstance";
import { SelectBox } from "../../components/formComponent/SelectBox";
import ReactSelect from "../../components/formComponent/ReactSelect";
const OldPatientSearchModal = ({ show, setShow, handleSelctData, handleCreateNewPatient, onMobileChange = () => { } }) => {
  const handleNewPatient = () => {
    const mobile = payload?.Mobile;
    setShow(false);
    setPayload({
      Mobile: "",
      UHID: "",
      Name: "",
      FromDate: new Date(),
      ToDate: new Date(),
      CentreID: "",
      FromTime: "00:00:00",
      ToTime: "23:59:59",
    });
    setTableData([]);
    setHasSearched(false);
    setDateRangeError("");
    setMobileError("");
    handleCreateNewPatient(mobile);
  };
  const today = new Date();
  const [payload, setPayload] = useState({
    Mobile: "",
    UHID: "",
    Name: "",
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    FromTime: "00:00:00",
    ToTime: "23:59:59",
    // FromTime: new Date(today.setHours(0, 0, 0, 0)),
    // ToTime: new Date(today.setHours(23, 59, 59, 999)),
  });

  const { t } = useTranslation();
  const dateSelect = (date, name) => {
    setDateRangeError("");
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));
  };
  const [tableData, setTableData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [dateRangeError, setDateRangeError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
    if (name === "Mobile") {
      onMobileChange(value);
      const digitCheck = validateMobileDigits(value);
      setMobileError(digitCheck.isValid ? "" : digitCheck.message);
    }
  };
  const [load, setLoad] = useState(false);
  const [PageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [CentreData, setCentreData] = useState([]);
  const patientRows = Array.isArray(tableData) ? tableData : [];
  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PageSize;
    const lastPageIndex = firstPageIndex + PageSize;
    return patientRows.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, patientRows, PageSize]);

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const handleSearch = () => {
    const fromDate =
      parseTypedDate(document.getElementById("FromDate")?.value) ||
      payload.FromDate;
    const toDate =
      parseTypedDate(document.getElementById("ToDate")?.value) ||
      payload.ToDate;
    const rangeCheck = validateFromToDateRange(fromDate, toDate);
    if (!rangeCheck.isValid) {
      setDateRangeError(rangeCheck.message);
      toast.error(rangeCheck.message);
      return;
    }
    const digitCheck = validateMobileDigits(payload?.Mobile?.trim());
    if (!digitCheck.isValid) {
      setMobileError(digitCheck.message);
      toast.error(digitCheck.message);
      return;
    }
    setDateRangeError("");
    setMobileError("");
    setLoad(true);
    setCurrentPage(1);
    setHasSearched(true);
    const fromTime = moment(payload.FromTime, ["HH:mm:ss", "HH:mm"], true).isValid()
      ? moment(payload.FromTime, ["HH:mm:ss", "HH:mm"]).format("HH:mm:ss")
      : "00:00:00";
    const toTime = moment(payload.ToTime, ["HH:mm:ss", "HH:mm"], true).isValid()
      ? moment(payload.ToTime, ["HH:mm:ss", "HH:mm"]).format("HH:mm:ss")
      : "23:59:59";
    axiosInstance
      .post("Booking/getPatientDetails", {
        Mobile: payload?.Mobile?.trim(),
        PatientCode: payload?.UHID?.trim(),
        Name: payload?.Name?.trim(),
        FromDate: moment(fromDate).format("DD/MMM/YYYY"),
        ToDate: moment(toDate).format("DD/MMM/YYYY"),
        FromTime: fromTime,
        ToTime: toTime,
        CentreID: payload?.CentreID?.toString(),
      })
      .then((res) => {
        const message = res?.data?.message;
        if (Array.isArray(message)) {
          setTableData(message);
          return;
        }
        setTableData([]);
        const text = typeof message === "string" ? message.trim() : "";
        const isEmptyResult = !text || /no data found|no record/i.test(text);
        if (text && !isEmptyResult) {
          toast.error(text);
        }
      })
      .catch((err) => {
        setTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      })
      .finally(() => {
        setLoad(false);
      });
  };
  const handleTime = (time, name) => {
    setPayload({ ...payload, [name]: time });
  };
  const handleSearchSelectChange = (label, value) => {
    if (label === "CentreID") {
      setPayload({
        ...payload,
        ["CentreID"]: value?.value,
      });
    }
  };
  const getAccessCentres = (state) => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        CentreDataValue.unshift({ label: t("None"), value: "" });
        state(CentreDataValue);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          window.sessionStorage.clear();
          window.location.href = "/login";
        }
      });
  };
  useEffect(() => {
    getAccessCentres(setCentreData);
  }, []);
  return (
    <>
      <Dialog
        header={t("Old Patient Search")}
        visible={show}
        className={theme}
        onHide={() => setShow(false)}
        style={{
          width: isMobile ? "80vw" : "75vw",
        }}
      >
        <div className="row">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={CentreData}
              name="CentreID"
              lable="Centre"
              id="Centre"
              removeIsClearable={true}
              placeholderName="Centre"
              value={payload?.CentreID}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Mobile"
              id="Mobile"
              name="Mobile"
              value={payload.Mobile}
              onChange={handleChange}
              placeholder=" "
              maxLength={10}
              ariaInvalid={!!mobileError}
              ariaDescribedBy={mobileError ? "op-Mobile-error" : undefined}
            />
            {mobileError ? (
              <div
                className="error-message text-danger small"
                id="op-Mobile-error"
                role="alert"
              >
                {t(mobileError)}
              </div>
            ) : null}
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="UHID"
              id="UHID"
              name="UHID"
              value={payload.UHID}
              onChange={handleChange}
              placeholder=" "
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              lable="Patient Name"
              id="Name"
              name="Name"
              value={payload.Name}
              onChange={handleChange}
              placeholder=" "
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              placeholder=" "
              id="FromDate"
              lable="FromDate"
              maxDate={new Date()}
              invalid={!!dateRangeError}
            />
          </div>
          <div className="col-md-1">
            <CustomTimePicker
              name="FromTime"
              placeholder="FromTime"
              value={payload?.FromTime}
              id="FromTime"
              lable="FromTime"
              onChange={handleTime}
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              placeholder=" "
              id="ToDate"
              lable="ToDate"
              maxDate={new Date()}
              invalid={!!dateRangeError}
            />
          </div>
          <div className="col-md-1">
            <CustomTimePicker
              name="ToTime"
              placeholder="ToTime"
              value={payload?.ToTime}
              id="ToTime"
              lable="ToTime"
              onChange={handleTime}
            />
          </div>
          <div className="col-sm-1">
            <button
              type="button"
              value={"Search"}
              id="btnSearch"
              className="btn btn-block btn-success btn-sm"
              onClick={handleSearch}
            >
              {t("Search")}
            </button>
          </div>
        </div>
        {dateRangeError ? (
          <div className="text-danger mb-2" role="alert">
            {t(dateRangeError)}
          </div>
        ) : null}
        {load ? (
          <div className="text-center py-4">{t("Searching...")}</div>
        ) : (
          <>
            <div
              style={{
                maxHeight: "310px",
                overflowY: "auto",
              }}
            >
              {" "}
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("Select")}</th>
                    <th>{t("UHID")}</th>
                    <th>{t("Patient Name")}</th>
                    <th>{t("Age")}</th>
                    <th>{t("DOB")}</th>
                    <th>{t("Gender")}</th>
                    <th>{t("Mobile")}</th>
                    <th>{t("City")}</th>
                    <th>{t("State")}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTableData.map((data, index) => (
                    <tr key={index}>
                      <td data-title={t("Select")}>
                        <button
                          className="btn btn-info  btn-sm d-flex"
                          onClick={() => handleSelctData(data)}
                        >
                          {t("Select")}&nbsp;
                        </button>
                      </td>
                      <td data-title={t("UHID")}>{data?.PatientCode}&nbsp;</td>
                      <td data-title={t("Patient Name")}>
                        {data?.Title +
                          " " +
                          data?.FirstName +
                          " " +
                          data?.MiddleName +
                          " " +
                          data?.LastName}
                        &nbsp;
                      </td>
                      <td data-title={t("Age")}>{data?.Age}&nbsp;</td>
                      <td data-title={t("DOB")}>{dateConfig(data?.DOB)}&nbsp;</td>
                      <td data-title={t("Gender")}>{data?.Gender}&nbsp;</td>
                      <td data-title={t("Mobile")}>{data?.Mobile}&nbsp;</td>
                      <td data-title={t("City")}>{data?.City}&nbsp;</td>
                      <td data-title={t("State")}>{data?.State}&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
              {hasSearched && currentTableData.length === 0 && (
                <div className="text-center py-3">{t("No records found")}</div>
              )}
            </div>
            <div className="mt-2">
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={handleNewPatient}
              >
                <i className="fa fa-plus-circle" aria-hidden="true"></i> {t("Create New")}
              </button>
            </div>
          </>
        )}

        {currentTableData?.length > 0 && (
          <div className="d-flex justify-content-end">
            <label className="mt-4 mx-2">{t("No Of Record/Page")}</label>
            <SelectBox
              className="mt-3 p-1 RecordSize mr-2"
              options={Record}
              selectedValue={PageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            />{" "}
            <Pagination
              className="pagination-bar mb-2"
              currentPage={currentPage}
              totalCount={patientRows.length}
              pageSize={PageSize}
              onPageChange={(page) => setCurrentPage(page)}
            />{" "}
          </div>
        )}
      </Dialog>
    </>
  );
};

export default OldPatientSearchModal;
