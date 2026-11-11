import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import Tables from "../../components/UI/customTable";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Loading from "../../components/loader/Loading";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Input from "../../components/formComponent/Input";
import { number } from "../../utils/helpers";
import moment from "moment";
const CompanyWiseSmsWPCountModal = ({ show, companyId, handleClose }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const [payload, setPayload] = useState({
    Date: new Date(),
    MobileNo: "",
  });
  const [load, setLoad] = useState(false);
  // const [payload2, setPayload2] = useState({
  //   Date: new Date(),
  // });
  // const [key, setKey] = useState({
  //   Count: false,
  //   BookingLog: true,
  // });
  const [tableData, setTableData] = useState([]);
  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const fetch = () => {
    setLoad(true);
    axiosInstance
      .post("CompanyMaster/GetSMSDataCompanyWise", {
        FromDate: moment(payload?.Date).format("YYYY-MM-DD"),
        MobileNo: payload?.MobileNo?.toString(),
        CompanyId: companyId.toString(),
      })
      .then((res) => {
        setLoad(false);
        const data = res?.data?.message;
        setTableData(data);
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };
  const handleSelectChange = (e) => {
    const { name, value, checked, type } = e.target;
    setPayload((payload) => ({
      ...payload,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };
  useEffect(() => {
    fetch();
  }, []);
  return (
    <>
      <Dialog
        header={"Company Wise Sms & Whatsapp Data"}
        onHide={handleClose}
        style={{ width: isMobile ? "80vw" : "90vw" }}
        className={theme}
        visible={show}
      >
        {load ? (
          <Loading />
        ) : (
          <>
            <div className="row">
              <div className="col-sm-2">
                <DatePicker
                  name="Date"
                  maxDate={new Date()}
                  placeholder=" "
                  id="Date"
                  lable="From Date"
                  onChange={dateSelect}
                  className="custom-calendar"
                  value={payload?.Date}
                />
              </div>
              <div className="col-sm-2 ">
                <Input
                  lable="Mobile Number"
                  id="MobileNo"
                  placeholder=" "
                  name="MobileNo"
                  onInput={(e) => number(e, 10)}
                  max={10}
                  value={payload?.MobileNo}
                  type="number"
                  autoComplete={"off"}
                  onChange={handleSelectChange}
                />
              </div>
              <div className="col-sm-1">
                <button
                  type="button"
                  className="btn btn-block btn-success btn-sm"
                  onClick={fetch}
                >
                  {t("Search")}
                </button>
              </div>
            </div>
            <div className="row p-2">
              <div className="col-sm-12">
                <Tables
                  style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                  }}
                >
                  <thead>
                    <tr>
                      <th className="text-center">{t("S.No")}</th>
                      <th className="text-center">{t("MobileNo")}</th>
                      <th className="text-center" style={{ width: "600px" }}>
                        {t("Text")}
                      </th>
                      <th className="text-center">{t("Category")}</th>
                      <th className="text-center">{t("Type")}</th>
                      <th className="text-center">{t("Sms Date")}</th>
                    </tr>
                  </thead>
                  {tableData?.map((ele, index) => (
                    <>
                      <tr>
                        <td data-title={index + 1} className="text-center">
                          {index + 1}
                        </td>

                        <td data-title={t("MobileNo")} className="text-center">
                          {ele?.MOBILENO}
                        </td>
                        <td
                          data-title={t("Text")}
                          className="text-center"
                          style={{
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                          }}
                        >
                          {ele?.SMSTEXT}
                        </td>
                        <td data-title={t("Category")} className="text-center">
                          {ele?.Category}
                        </td>
                        <td data-title={t("Type")} className="text-center">
                          {ele?.MessageType}
                        </td>
                        <td data-title={t("Sms Date")} className="text-center">
                          {ele?.dtEntry}
                        </td>
                      </tr>
                    </>
                  ))}
                </Tables>
              </div>
            </div>
          </>
        )}
      </Dialog>
    </>
  );
};

export default CompanyWiseSmsWPCountModal;
