import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";

const MacObservation = () => {
  const [labNo, setLabNo] = useState("");
  const [tableData, setTableData] = useState([]);
  const { t } = useTranslation();
  const fetch = () => {
    axiosInstance
      .post("MachineMaster/getMacObservationData", {
        BarCodeNo: labNo.trim(),
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
      <Accordion
        name={t("Mac Observation")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              type="text"
              className="required-fields"
              lable="Lab Number"
              id="LabNo"
              placeholder=" "
              value={labNo}
              onChange={(e) => {
                setLabNo(e?.target?.value);
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
      <div className="row p-2">
        <div className="col-12">
          <Tables>
            <thead className="cf text-center" style={{ zIndex: 99 }}>
              <tr>
                <th className="text-center">{t("#")}</th>
                <th className="text-center">{t("LabNo")}</th>
                <th className="text-center">{t("Machine_Id")}</th>
                <th className="text-center">{t("Machine_ParamID")}</th>{" "}
                <th className="text-center">{t("Reading")}</th>
                <th className="text-center">{t("Updatedate")}</th>
                <th className="text-center">{t("dtEntry")}</th>
                <th className="text-center">{t("IsActive")}</th>
                <th className="text-center">{t("IsSync")}</th>
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
                      <td data-title="LabNo" className="text-center">
                        {ele?.LabNo}
                      </td>
                      <td data-title="Machine_Id" className="text-center">
                        {ele?.Machine_Id}
                      </td>
                      <td data-title="Machine_ParamID" className="text-center">
                        {ele?.Machine_ParamID}
                      </td>
                      <td data-title="Reading" className="text-center">
                        {ele?.Reading}
                      </td>
                      <td data-title="Updatedate" className="text-center">
                        {ele?.Updatedate}
                      </td>
                      <td data-title="dtEntry" className="text-center">
                        {ele?.dtEntry}
                      </td>
                      <td data-title="IsActive" className="text-center">
                        {ele?.isActive == 1 ? "Active" : "InActive"}
                      </td>{" "}
                      <td data-title="isSync" className="text-center">
                        {ele?.isSync}
                      </td>{" "}
                    </tr>
                  </>
                ))}
              </tbody>
            )}
          </Tables>
        </div>
      </div>
    </>
  );
};

export default MacObservation;
