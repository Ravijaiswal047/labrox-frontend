import { memo, useEffect, useState } from 'react';
import { t } from "i18next";
import Accordion from '../../components/UI/Accordion';
import DatePicker from '../../components/formComponent/DatePicker';
import { CustomButton } from '../../components/UI/CustomButton';
import { getAccessCentres } from '../../utils/NetworkApi/commonApi';
import MultiSelectComp from '../../components/formComponent/MultiSelectComp';
import ReactSelect from '../../components/formComponent/ReactSelect';
import Input from '../../components/formComponent/Input';
import { axiosReport } from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { downloadExcelBlob, openPdfBlob } from '../../utils/helpers';
import Loading from '../../components/loader/Loading';
import { SelectBox } from '../../components/formComponent/SelectBox';

const searchTypeOptions = [
  { value: "All", label: "All" },
  { value: "Name", label: "Name" },
  { value: "Age", label: "Age" },
  { value: "Gender", label: "Gender" },
  { value: "Mobile", label: "Mobile" },
  { value: "Address", label: "Address" },
  { value: "Doctor", label: "Doctor" },
  { value: "Other", label: "Other" },
];

const DemographicChange = () => {

  const [loadingSearch, setLoadingSearch] = useState(false);

  const [payload, setPayload] = useState({
    formDate: new Date(),
    ToDate: new Date(),
    BookingCentre: [],
    ChangeCentre: [],
    searchType: "All",
    searchValue: "",
  });

  const [dropDownApis, setDropDownApis] = useState({
    BookingCenter: [],
    ChangeCenter: [],
  });

  const handleDate = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectMultiChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, option) => {
    setPayload((prev) => ({ ...prev, [name]: option?.value ?? "All", searchValue: "" }));
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    getAccessCentres((data) => {
      setDropDownApis((prev) => ({ ...prev, ChangeCenter: data }));
    });
  }, []);

  const handleSearch = (format) => {
    setLoadingSearch(true);
    const apiPayload = {
      fromDate: payload?.formDate,
      toDate: payload?.ToDate,
      bookingCentreIds: payload?.BookingCentre,
      changeCentreIds: payload?.ChangeCentre,
      ledgerTransactionID: 0,
      reportFormat: format,
      searchType: payload?.searchType,
      searchValue: payload?.searchValue,
    };

    axiosReport
      .post(
        "DemographicChange/GetDemographicChangeReport/GetDemographicChangeReport",
        apiPayload,
        {
          responseType: "blob",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
        }
      )
      .then(async (res) => {
        const contentType = res.headers?.["content-type"] || "";

        if (
          contentType.includes("application/json") ||
          contentType.includes("text/plain")
        ) {
          const text = await res.data.text();
          try {
            const json = JSON.parse(text);
            toast.error(json?.message || t("No data found"));
          } catch {
            toast.warning(t("No records found for selected filters"));
          }
          return;
        }

        if (!res.data || res.data.size === 0) {
          toast.warning(t("No records found for selected filters"));
          return;
        }

        const mimeType =
          format === "Pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        const extension = format === "Pdf" ? "pdf" : "xlsx";

        const typedBlob = new Blob([res.data], { type: mimeType });
        const url = window.URL.createObjectURL(typedBlob);

        const disposition = res.headers?.["content-disposition"] || "";
        const serverFilename = disposition
          .match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)?.[1]
          ?.replace(/['"]/g, "")
          ?.trim();
        const fallbackFilename = `DemographicChangeReport_${new Date()
          .toISOString()
          .slice(0, 10)}.${extension}`;

        if (format === "Pdf") {
          openPdfBlob(res.data);
          toast.success(t("Pdf opened successfully"));
        } else {
          downloadExcelBlob(res.data, "DemographicChangeReport");
          toast.success(t("Excel downloaded successfully"));
        }

        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
      })
      .catch(async (err) => {
        console.error(err);
        if (err?.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const json = JSON.parse(text);
            toast.error(json?.message || t("Error generating report"));
          } catch {
            toast.error(t("Error generating report"));
          }
        } else {
          toast.error(t("Error generating report"));
        }
      })
      .finally(() => {
        setLoadingSearch(false);
      });
  };

  return (
    <>
      <Accordion title={"Demographic Change Report"} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              className="custom-calendar"
              maxDate={new Date()}
              value={payload?.formDate}
              name="formDate"
              id="formDate"
              lable={t("From Date")}
              onChange={handleDate}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <DatePicker
              maxDate={new Date()}
              value={payload?.ToDate}
              minDate={payload?.formDate}
              name="ToDate"
              id="ToDate"
              lable={t("To Date")}
              onChange={handleDate}
              className="custom-calendar"
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={dropDownApis?.ChangeCenter}
              name="BookingCentre"
              value={payload?.BookingCentre}
              placeholder={t("Booking Centre")}
              onChange={handleSelectMultiChange}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <MultiSelectComp
              options={dropDownApis?.ChangeCenter}
              name="ChangeCentre"
              value={payload?.ChangeCentre}
              placeholder={t("Change Centre")}
              onChange={handleSelectMultiChange}
            />
          </div>

          <div className="col-12 col-sm-6 col-md-2 my-1">
            <div className="d-flex">
              <div style={{ width: "40%" }}>
                {/* <ReactSelect
                  id="searchType"
                  name="searchType"
                  placeholderName={t("Search Type")}
                  value={payload?.searchType}
                  dynamicOptions={searchTypeOptions}
                  onChange={handleSelectChange}
                  removeIsClearable={true}
                /> */}
                <SelectBox
                    options={searchTypeOptions}
                    id="searchType"
                    lable="searchType"
                    selectedValue={payload.searchType}
                    name="searchType"
                    onChange={handleChange}
                  />
              </div>
              <div style={{ width: "87%" }}>
                <Input
                  type="text"
                  name="searchValue"
                  id="searchValue"
                  lable={t("Search Value")}
                  value={payload?.searchValue}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-md-2 my-1">
            {loadingSearch ? (
              <Loading />
            ) : (
              <div className="d-flex gap-2">
                <CustomButton text={"PDF"} icon={"pdf"} onClick={() => handleSearch("Pdf")} className="mr-2" />
                <CustomButton text={"Excel"} icon={"excel"} onClick={() => handleSearch("Excel")} />
              </div>
            )}
          </div>

        </div>
      </Accordion>
    </>
  );
};

export default DemographicChange;
