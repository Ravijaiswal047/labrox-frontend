import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { FaAnglesRight } from "react-icons/fa6";
import Loading from "../../../../components/loader/Loading";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "../../../../components/UI/Accordion";
import Tables from "../../../../components/UI/customTable";
import NoRecordFound from "../../../../components/formComponent/NoRecordFound";

const CopyMslModal = ({ show, onHide, EmpId }) => {
  const { t } = useTranslation();
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  const [data, setData] = useState([]);
  const [load, setLoad] = useState(false);
  const [FormData, setFormData] = useState({
    year: "",
    quarter: "",
    funnelType: "",
    year1: "",
    quarter1: "",
    funnelType1: "",
  });

  const quarterOptions = [
    { label: "Q1 (Apr, May, Jun)", value: "1" },
    { label: "Q2 (Jul, Aug, Sep)", value: "2" },
    { label: "Q3 (Oct, Nov, Dec)", value: "3" },
    { label: "Q4 (Jan, Feb, Mar)", value: "4" },
  ];

  const yearOptions = [
    { label: "2024", value: "2024" },
    { label: "2025", value: "2025" },
    { label: "2026", value: "2026" },
    { label: "2027", value: "2027" },
    { label: "2028", value: "2028" },
    { label: "2029", value: "2029" },
    { label: "2030", value: "2030" },
  ];

  const handleReactChange = (name, e) => {
    setFormData((prev) => ({ ...prev, [name]: e?.value }));
  };

  const handleModalClose = () => {
    onHide(false);
  };

  const handleCopy = async () => {
    if (
      !FormData.year ||
      !FormData.quarter ||
      !FormData.year1 ||
      !FormData.quarter1
    ) {
      toast.error("Please select year and quarter");
      return;
    }

    const payload = {
      from: {
        employeeId: EmpId,
        year: FormData.year,
        type: "2",
        quarter: FormData.quarter,
      },
      to: {
        employeeId: EmpId,
        year: FormData.year1,
        type: "2",
        quarter: FormData.quarter1,
      },
    };

    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/MslCopy", payload);
      if (res?.data?.success) {
        toast.success(res.data.message);
        handleSearch(FormData.year, FormData.quarter);
      } else {
        toast.error(res.data.message);
      }
      setLoad(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoad(false);
    }
  };

  const handleSearch = async (...args) => {
    const [year, quarter] = args;

    try {
      setLoad(true);

      const res = await axiosInstance.post("SalesFunnel/MslFrom", {
        employeeId: EmpId,
        year,
        type: "2",
        quarter,
      });

      setData(res?.data?.success ? res.data.message : []);
    } catch (err) {
      console.log(err);
      setData([]);
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    if (FormData.year && FormData.quarter) {
      handleSearch(FormData.year, FormData.quarter);
    }
  }, [FormData.year, FormData.quarter]);

  return (
    <Dialog
      header={t("Funnel Details")}
      visible={show}
      onHide={handleModalClose}
      className={theme}
      style={{ width: isMobile ? "95vw" : "70vw" }}
      modal
    >
      <div className="row  mb-3">
        <div className="col-md-5">
          <Heading title={t("From MSL")} />

          <div className="row pt-2">
            <div className="col-sm-6  mb-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={yearOptions}
                isShowBorder={true}
                name="year"
                lable={t("Financial Year ")}
                id="year"
                placeholderName={t("Financial Year ")}
                value={FormData?.year}
                onChange={handleReactChange}
              />
            </div>

            <div className="col-sm-6  mb-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={quarterOptions}
                isShowBorder={true}
                name="quarter"
                lable={t("Quarter")}
                id="quarter"
                placeholderName={t("Quarter")}
                value={FormData?.quarter}
                onChange={handleReactChange}
              />
            </div>
          </div>
        </div>

        <div className=" d-flex align-items-center justify-content-center">
          {load ? (
            <Loading />
          ) : (
            <FaAnglesRight
              title="Copy"
              size={26}
              className="text-primary mt-4"
              onClick={handleCopy}
            />
          )}
        </div>

        <div className="col-md-6">
          <Heading title={t("To MSL")} />

          <div className="row pt-2">
            <div className="col-sm-6  mb-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={yearOptions}
                isShowBorder={true}
                name="year1"
                lable={t("Financial Year ")}
                id="year1"
                placeholderName={t("Financial Year ")}
                value={FormData?.year1}
                onChange={handleReactChange}
              />
            </div>
            <div className="col-sm-6  mb-2">
              <ReactSelect
                className="required-fields"
                dynamicOptions={quarterOptions}
                isShowBorder={true}
                name="quarter1"
                lable={t("Quarter")}
                id="quarter1"
                placeholderName={t("Quarter")}
                value={FormData?.quarter1}
                onChange={handleReactChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-12">
          <Accordion defaultValue={true} title={t("Saved MSL")}>
            <Tables>
              <thead>
                <tr>
                  <th style={{ width: "2%" }}>{t("SNo.")}</th>
                  <th>{t("Month")}</th>
                  <th>{t("Employee Name")}</th>
                  <th>{t("State")}</th>
                  <th>{t("Lab Name")}</th>
                  <th>{t("Dr. Name")}</th>
                  <th>{t("Client Contact")}</th>
                  <th>{t("Client Email")}</th>
                  <th>{t("Dr. Available Days")}</th>
                  <th>{t("Availability")}</th>
                  <th>{t("Prescriber / Non Prescriber")}</th>
                  <th>{t("Expected Business")}</th>
                  <th>{t("No Of Calls")}</th>
                </tr>
              </thead>

              <tbody>
                {data?.length > 0 ? (
                  data.map((row, index) => (
                    <tr key={row?.MSLId || index}>
                      <td data-title={t("Sr.No.")}>{index + 1}</td>

                      <td data-title={t("Month")}>{row?.Month}</td>

                      <td data-title={t("Employee Name")}>
                        {row?.EmployeeName}
                      </td>

                      <td data-title={t("State")}>{row?.StateName}</td>

                      <td data-title={t("Lab Name")}>{row?.CentreName}</td>

                      <td data-title={t("Dr. Name")}>
                        {row?.ContactPersonName}
                      </td>

                      <td data-title={t("Client Contact")}>
                        {row?.MobileNumber}
                      </td>

                      <td data-title={t("Client Email")}>{row?.EmailId}</td>

                      <td data-title={t("Dr. Available Days")}>
                        {row?.MeetingDays}
                      </td>

                      <td data-title={t("Availability")}>{row?.MeetingTime}</td>

                      <td data-title={t("Prescriber / Non Prescriber")}>
                        {row?.ProspectTypeName}
                      </td>

                      <td data-title={t("Expected Business")}>
                        {row?.ExpectedBusinessForecast}
                      </td>

                      <td data-title={t("No Of Calls")}>
                        {row?.NoOfExpectedCalls}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={17} className="text-center">
                      {t("No Record Found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          </Accordion>
        </div>
      </div>
    </Dialog>
  );
};

export default CopyMslModal;
