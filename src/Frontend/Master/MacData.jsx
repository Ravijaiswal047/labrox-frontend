import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";

const MacData = () => {
  const [macNo, setMacNo] = useState("");
  const [tableData, setTableData] = useState([]);
  const { t } = useTranslation();
  const fetch = () => {
    axiosInstance
      .post("macdata/MacDetails", {
        BarCodeNo: macNo.trim(),
      })
      .then((res) => {
        if (res?.data?.message.length == 0) {
          setTableData([]);
          toast.error("No record found");
        }
        setTableData(res?.data?.message);
      })
      .catch((err) => {
        setTableData([]);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong.",
        );
      });
  };
  return (
    <>
      <Accordion name={t("Mac Data")} defaultValue={true} isBreadcrumb={true}>
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              type="text"
              className="required-fields"
              lable="Barcode Number"
              id="BarcodeNo"
              placeholder=" "
              value={macNo}
              onChange={(e) => {
                setMacNo(e?.target?.value);
              }}
            />
          </div>
          <div className="col-sm-1">
            <button onClick={fetch} className="btn btn-primary btn-sm w-100">
              {t("Search")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Data")} defaultValue={true}>
        <div className="row p-2">
          <div className="col-12">
            <Tables>
              <thead className="cf text-center" style={{ zIndex: 99 }}>
                <tr>
                  <th className="text-center">{t("#")}</th>
                  <th className="text-center">{t("BarcodeNo")}</th>
                  <th className="text-center">{t("PName")}</th>
                  <th className="text-center">{t("Status")}</th>
                  <th className="text-center">{t("VisitNo")}</th>
                  <th className="text-center">{t("InvestigationName")}</th>
                  <th className="text-center">{t("MachineName")}</th>
                  <th className="text-center">{t("Reading")}</th>
                  <th className="text-center">{t("RerunReason")}</th>
                  <th className="text-center">{t("RerunReason1")}</th>
                  <th className="text-center">{t("Machineid")}</th>
                  <th className="text-center">{t("Machineid1")}</th>
                  <th className="text-center">{t("Reading1")}</th>
                  <th className="text-center">{t("Centre")}</th>
                </tr>
              </thead>
              {tableData?.length > 0 && (
                <tbody>
                  {tableData?.map((ele, index) => (
                    <>
                      <tr>
                        <td data-title="#" className="text-center">
                          {index + 1}
                        </td>
                        <td data-title="BarcodeNo" className="text-center">
                          {ele?.BarcodeNo}
                        </td>
                        <td data-title="PName" className="text-center">
                          {ele?.PName}
                        </td>
                        <td data-title="Status" className="text-center">
                          {ele?.Status}
                        </td>
                        <td data-title="VisitNo" className="text-center">
                          {ele?.VisitNo}
                        </td>
                        <td
                          data-title="InvestigationName"
                          className="text-center"
                        >
                          {ele?.InvestigationName}
                        </td>
                        <td data-title="MachineName" className="text-center">
                          {ele?.MachineName}
                        </td>
                        <td data-title="Reading" className="text-center">
                          {ele?.Reading}
                        </td>{" "}
                        <td data-title="RerunReason" className="text-center">
                          {ele?.RerunReason}
                        </td>{" "}
                        <td data-title="RerunReason1" className="text-center">
                          {ele?.RerunReason1}
                        </td>{" "}
                        <td data-title="Machineid" className="text-center">
                          {ele?.machineid}
                        </td>{" "}
                        <td data-title="Machineid1" className="text-center">
                          {ele?.machineid1}
                        </td>
                        <td data-title="Reading1" className="text-center">
                          {ele?.reading1}
                        </td>
                        <td data-title="Centre" className="text-center">
                          {ele?.Centre}
                        </td>
                      </tr>
                    </>
                  ))}
                </tbody>
              )}
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default MacData;
