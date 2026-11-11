import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { toast } from "react-toastify";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { number } from "../../utils/helpers";
import ReactSelect from "../../components/formComponent/ReactSelect";

const CompanyPaymentDetail = () => {
  const [payload, setPayload] = useState({
    CompanyName: "",
    CompanyId: "",
    Amount: "",
    PaymentType: "Debit",
    DueDate: new Date(),
    load: false,
  });
  const [loads, setLoads] = useState({
    name: "",
    loading: -1,
  });
  const [company, setCompany] = useState([]);
  const [tableData, setTableData] = useState([]);
  const handleChangeValue = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const handleChange = (label, value) => {
    if (label == "CompanyId" && value?.value == "") {
      setPayload({
        ...payload,
        CompanyId: "",
        CompanyName: "",
        Amount: "",
        PaymentType: "Debit",
        DueDate: new Date(),
      });
      setTableData([]);
    } else if (label == "CompanyId") {
      setPayload({
        ...payload,
        CompanyName: value?.label,
        [label]: value?.value,
        Amount: "",
        PaymentType: "Debit",
        DueDate: new Date(),
      });
      companyData(value?.value);
    } else {
      setPayload({
        ...payload,
        [label]: value?.value,
      });
    }
  };

  const companyData = (value) => {
    axiosInstance
      .post("CompanyMaster/GetCompanyPaymentDetail", {
        CompanyId: value,
      })
      .then((res) => {
        setTableData(res?.data?.message);
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        ),
      );
  };
  const handleSave = () => {
    if (payload.Amount != 0 && payload.Amount != "") {
      setPayload({
        ...payload,
        load: true,
      });

      axiosInstance
        .post("CompanyMaster/SaveCompanyPaymentDetail", {
          ...payload,
          Amount:
            payload?.PaymentType == "Credit"
              ? payload?.Amount * -1
              : payload?.Amount,
          DueDate: moment(payload?.DueDate).format("DD-MMM-YYYY"),
        })
        .then((res) => {
          toast.success(res?.data?.message);
          companyData(payload?.CompanyId);
          setPayload({
            ...payload,
            load: false,
            Amount: "",
            PaymentType: "Debit",
            DueDate: new Date(),
          });
        })
        .catch((err) => {
          setPayload({
            ...payload,
            load: false,
          });
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else {
      toast.error("Amount can't be blank or zero");
    }
  };
  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const { t } = useTranslation();

  const getCompanyName = () => {
    axiosInstance
      .get("CompanyMaster/getCompanyName")
      .then((res) => {
        let data = res?.data?.message;
        let Company = data?.map((ele) => {
          return {
            value: ele?.CompanyId,
            label: ele?.CompanyName,
          };
        });

        setCompany(Company);
      })
      .catch((err) =>
        console.log(err?.res?.data ? err?.res?.data : "Something Went Wrong"),
      );
  };

  const handleGetReport = (ele, index, name) => {
    setLoads({ loading: index, name: name });
    axiosReport
      .post("commonReports/CompanyPaymentData", {
        details: ele,
      })
      .then((res) => {
        setLoads({ loading: -1, name: "" });
        window.open(res?.data?.url, "_blank");
      })
      .catch((err) => {
        setLoads({ loading: -1, name: "" });
        toast.error(
          err?.data?.message ? err?.data?.message : "Something Went Wrong",
        );
      });
  };
  useEffect(() => {
    getCompanyName();
  }, []);

  const handleRemove = (ele) => {
    axiosInstance
      .post("CompanyMaster/InActivePaymentDetail", {
        PaymentDetailID: ele?.PaymentDetailID,
        CompanyId: ele?.CompanyId,
      })
      .then((res) => {
        toast.success(res?.data?.message);
        companyData(payload?.CompanyId);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };

  return (
    <>
      <Accordion
        name="Company Payment Detail"
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={company}
              name="CompanyId"
              lable="Company Name"
              id="Company Name"
              removeIsClearable={true}
              className="required-fields"
              value={payload?.CompanyId}
              placeholderName="Company Name"
              onChange={handleChange}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title="Add Payment Detail" defaultValue={true}>
        {payload?.CompanyName != "" && (
          <div className="row px-2 mt-2 mb-1">
            <div className="col-sm-2">
              <Input
                lable="Amount"
                placeholder=" "
                name="Amount"
                id="Amount"
                className="required-fields"
                onInput={(e) => number(e, 8)}
                onChange={handleChangeValue}
                value={payload?.Amount}
              />
            </div>
            <label className="col-sm-1">PaymentType :</label>
            <div className="col-sm-2">
              <span className="col-sm-3">Debit</span>
              <span className="col-sm-3">
                <input
                  type="radio"
                  value="Debit"
                  name="PaymentType"
                  onChange={handleChangeValue}
                  checked={payload?.PaymentType == "Debit"}
                />
              </span>
              <span className="col-sm-3">Credit</span>
              <span className="col-sm-3">
                <input
                  type="radio"
                  value="Credit"
                  name="PaymentType"
                  onChange={handleChangeValue}
                  npm
                  run
                  test
                  checked={payload?.PaymentType == "Credit"}
                />
              </span>
            </div>

            <div className="col-sm-2">
              <DatePicker
                className="custom-calendar required-fields"
                placeholder=" "
                id="Due Date"
                lable="Due Date"
                name="DueDate"
                onChange={dateSelect}
                value={payload?.DueDate}
              />
            </div>

            {payload?.load ? (
              <Loading />
            ) : (
              <div className="col-sm-1">
                <button
                  className="btn btn-block btn-success btn-sm"
                  onClick={handleSave}
                >
                  Save
                </button>
              </div>
            )}
          </div>
        )}
      </Accordion>

      {/* {tableData?.length > 0
          ? "TotalOutstandingAmt : " + tableData[0]?.TotalOutStandingAmt
          : ""} */}
      {tableData?.length > 0 && (
        <>
          {" "}
          <Accordion title="Search Detail" defaultValue={true}>
            {" "}
            <div className="row px-3 mt-1">
              <label
                style={{
                  color: `${
                    tableData[0]?.TotalOutStandingAmt >= 0 ? "red" : "green"
                  }`,
                }}
              >
                {tableData?.length > 0
                  ? "Total Outstanding Amount : " +
                    tableData[0]?.TotalOutStandingAmt
                  : ""}
              </label>
            </div>
            <Tables>
              <thead
                className="cf text-center"
                style={{ position: "sticky", zIndex: 0, top: 0 }}
              >
                <tr>
                  <th className="text-center">{t("SNo.")}</th>
                  <th className="text-center">{t("CompanyName")}</th>
                  <th className="text-center">{t("Amount")}</th>
                  <th className="text-center">{t("DueDate")}</th>
                  <th className="text-center">{t("PaymentType")}</th>

                  <th className="text-center">{t("Order Id")}</th>
                  <th className="text-center">{t("Payment Id")}</th>
                  <th className="text-center">{t("EntryDate")}</th>
                  <th className="text-center">{t("CreatedBy")}</th>
                  <th className="text-center">{t("Status")}</th>
                  <th className="text-center">{t("Remove")}</th>

                  <th className="text-center">{t("PDF")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((ele, index) => (
                  <>
                    <tr>
                      <td data-title={index + 1} className="text-center">
                        {index + 1}
                      </td>
                      <td data-title="CompanyName" className="text-center">
                        {ele?.CompanyName}
                      </td>
                      <td
                        style={{ textAlign: "right" }}
                        data-title="Amount"
                        className="text-center"
                      >
                        {ele?.Amount}
                      </td>
                      <td data-title="DueDate" className="text-center">
                        {ele?.DueDate}
                      </td>
                      <td data-title="PaymentType" className="text-center">
                        {ele?.PaymentType}
                      </td>
                      <td data-title="OrderId" className="text-center">
                        {ele?.orderId}
                      </td>
                      <td data-title="Payment" className="text-center">
                        {ele?.PaymentID}
                      </td>
                      <td data-title="dtentry" className="text-center">
                        {ele?.dtentry}
                      </td>
                      <td data-title="CreatedBy" className="text-center">
                        {ele?.CreatedBy}
                      </td>
                      <td data-title="Status" className="text-center">
                        {ele?.ActiveStatus}
                      </td>
                      <td data-title="PaymentType" className="text-center">
                        {ele?.ShowIsActive == "0" ||
                        ele?.ActiveStatus != "Active" ? (
                          ""
                        ) : (
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemove(ele)}
                            style={{
                              backgroundColor: "red",
                              color: "white",
                              border: "none",
                              padding: "2px 7px",
                              fontSize: "12px",
                              cursor: "pointer",
                              borderRadius: "4px",
                            }}
                          >
                            X
                          </button>
                        )}
                      </td>
                      <td data-title="Pdf" style={{ textAlign: "center" }}>
                        {loads?.name === "print" && loads?.loading === index ? (
                          <Loading />
                        ) : (
                          ele.PaymentType == "Credit" && (
                            <i
                              className="pi pi-file-pdf"
                              style={{
                                fontSize: "15px",
                                color: "red",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                handleGetReport(ele, index, "print")
                              }
                            ></i>
                          )
                        )}
                      </td>
                    </tr>
                  </>
                ))}
              </tbody>
            </Tables>{" "}
          </Accordion>
        </>
      )}
    </>
  );
};

export default CompanyPaymentDetail;
