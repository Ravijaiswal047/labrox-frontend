import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import Input from "../../components/formComponent/Input";
import { dateConfig, number } from "../../utils/helpers";
import CompanyWiseSmsWPCountModal from "../utils/CompanyWiseSmsWPCountModal";

const CompanyWiseSmsWPCount = () => {
  const [payload, setPayload] = useState({
    CompanyId: "",
    WhatsAppCount: "",
    SmsCount: "",
  });
  const [load, setLoad] = useState(false);
  const [Company, setCompany] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [modal, setModal] = useState({
    show: false,
    companyId: "",
  });
  const handleClose = () => {
    setModal({
      show: false,
      companyId: "",
    });
  };
  const handleSearchSelectChange = (label, value) => {
    const selectedValue = value?.value;
    setPayload({
      ...payload,
      [label]: selectedValue,
    });
    if (value) {
      getTable(selectedValue);
    } else {
      setTableData([]);
    }
    handleClose();
  };
  const handleChangeValue = (e) => {
    const { name, value } = e.target;
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  const getTable = (CompanyId) => {
    setLoad(true);
    axiosInstance
      .post("CompanyMaster/gettabledata", {
        CompanyId: CompanyId.toString(),
      })
      .then((res) => {
        setLoad(false);
        const data = res?.data?.message?.smsCount;
        const finalData = data?.map((ele) => {
          return {
            ...ele,
            dueDate: res?.data?.message?.dueDate[0]?.DueDate,
          };
        });
        setTableData(finalData);
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
  const getCompanyId = () => {
    axiosInstance
      .get("CompanyMaster/getCompanyName")
      .then((res) => {
        const data = res?.data?.message;
        const newData = data?.map((ele) => {
          return {
            label: ele?.CompanyName,
            value: ele?.CompanyId,
          };
        });
        setCompany(newData);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const returnTotalCount = (type) => {
    return tableData.reduce((acc, item) => acc + Number(item[type]), 0);
  };
  const handleSave = () => {
    if (payload?.WhatsAppCount === "" && payload?.SmsCount === "") {
      toast.error("Enter Any Whatsapp or Sms Count");
      return;
    }
    axiosInstance
      .post("CompanyMaster/SaveCount", [
        {
          CompanyId: payload.CompanyId,
          WhatsAppCount: Number(payload?.WhatsAppCount),
          SmsCount: Number(payload?.SmsCount),
        },
      ])
      .then((res) => {
        if (res?.data?.success) {
          setPayload({
            ...payload,
            WhatsAppCount: "",
            SmsCount: "",
          });
          toast.success(res?.data?.message);
          getTable(payload?.CompanyId);
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Wents Wrong",
        );
      });
  };
  const { t } = useTranslation();
  useEffect(() => {
    getCompanyId();
  }, []);
  return (
    <>
      {modal?.show && (
        <CompanyWiseSmsWPCountModal
          show={modal?.show}
          handleClose={handleClose}
          companyId={modal?.companyId}
        />
      )}{" "}
      <Accordion
        name={t("Company Wise Sms Count And WhatsApp Count")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1 pb-1">
          <div className="col-sm-2">
            <ReactSelect
              name="CompanyId"
              id="CompanyId"
              className="required-fields"
              removeIsClearable={true}
              lable="CompanyId"
              placeholderName={t("Company")}
              value={payload?.CompanyId}
              dynamicOptions={Company}
              onChange={handleSearchSelectChange}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title="Add Count" defaultValue={true}>
        {payload?.CompanyId != "" && (
          <>
            {" "}
            <div className="row px-2 mt-2 mb-1">
              <div className="col-sm-2">
                <Input
                  lable="WhatsApp Count"
                  placeholder=" "
                  type="number"
                  name="WhatsAppCount"
                  id="WhatsAppCount"
                  onInput={(e) => number(e, 8)}
                  onChange={handleChangeValue}
                  value={payload?.WhatsAppCount}
                />
              </div>
              <div className="col-sm-2">
                {" "}
                <Input
                  lable="Sms Count"
                  type="number"
                  placeholder=" "
                  name="SmsCount"
                  id="SmsCount"
                  onInput={(e) => number(e, 8)}
                  onChange={handleChangeValue}
                  value={payload?.SmsCount}
                />
              </div>
              {load ? (
                <Loading />
              ) : (
                <div className="col-sm-1">
                  <button
                    className="btn btn-block btn-success btn-sm"
                    onClick={handleSave}
                  >
                    {t("Save")}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </Accordion>
      {tableData?.length > 0 && (
        <>
          <Accordion title={t("Search Data")} defaultValue={true}>
            <div className="row px-3 mt-1 d-flex align-items-center">
              <div
                className="badge-box text-white bg-success rounded px-2 py-1 mr-2 pointer-cursor"
                onClick={() =>
                  setModal({
                    show: true,
                    companyId: payload?.CompanyId,
                  })
                }
              >
                {`WhatsApp Used : ${tableData[0].UsedWhatsAppCount}/${returnTotalCount("Whatsappcount")}`}
              </div>
              <div
                className="badge-box text-white bg-primary rounded px-2 py-1 ml-2 pointer-cursor"
                onClick={() =>
                  setModal({
                    show: true,
                    companyId: payload?.CompanyId,
                  })
                }
              >
                {`SMS Used : ${tableData[0].UsedSmsCount}/${returnTotalCount("SmsCount")}`}
              </div>
              <div className="badge-box text-white bg-info rounded px-2 py-1 ml-3">
                Last Payment DueDate : {tableData[0].dueDate ?? "Not Set"}
              </div>
            </div>

            <div className="row p-2">
              <div className="col-sm-12">
                <Tables>
                  <thead>
                    <tr>
                      <th className="text-center">{t("S.No")}</th>
                      <th className="text-center">{t("CompanyName")}</th>

                      <th className="text-center">{t("WhatsApp Count")}</th>
                      <th className="text-center">{t("SMS Count")}</th>
                      <th className="text-center">{t("DtEntry")}</th>
                    </tr>
                  </thead>
                  {tableData?.map((ele, index) => (
                    <>
                      <tr>
                        {" "}
                        <td data-title={index + 1} className="text-center">
                          {index + 1}
                        </td>{" "}
                        <td data-title="CompanyName" className="text-center">
                          {ele?.CompanyName}
                        </td>{" "}
                        <td
                          data-title="WhatsApp Count"
                          style={{ textAlign: "right" }}
                        >
                          {ele?.Whatsappcount}
                        </td>{" "}
                        <td
                          data-title="SMS Count"
                          style={{ textAlign: "right" }}
                        >
                          {ele?.SmsCount}
                        </td>
                        <td data-title="SMS Count" className="text-center">
                          {dateConfig(ele?.dtentry)}
                        </td>
                      </tr>
                    </>
                  ))}
                </Tables>
              </div>
            </div>
          </Accordion>
        </>
      )}
    </>
  );
};

export default CompanyWiseSmsWPCount;
