import React, { useEffect, useState } from "react";
import LabeledInput from "../../../../components/formComponent/LabeledInput";
import Heading from "../../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import CustomTable from "../../../../components/Table/CustomTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";
import { useDispatch } from "react-redux";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { notify } from "../../../../utils/utils";

const ViewControlModal = ({ controlId, controlData }) => {
  console.log(controlId, "control id ........");
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const dispatch = useDispatch();
  const fields = [
    { label: "Control Provider", key: "controlProvider" },
    { label: "Control Name", key: "controlName" },
    { label: "Lot Number", key: "lotNumber" },
    { label: "Machine Name", key: "machine" },
    { label: "Department", key: "department" },
    { label: "Start Date", key: "startDate" },
    { label: "Lot Expiry", key: "lotExpiry" },
  ];
  const columns = [
    { header: "Sr.No", field: "srNo" },
    { header: "Parameter ID", field: "labObservationId" },
    { header: "Parameter Name", field: "labObservationName" },
    { header: "Level", field: "level" },
    { header: "Min Value", field: "minValue" },
    { header: "Max Value", field: "maxValue" },
    { header: "Base Mean Value", field: "baseMeanValue" },
    { header: "Base SD Value", field: "baseSdValue" },
    { header: "Base CV (%)", field: "baseCv" },
    { header: "Lab Mean Value", field: "labMeanValue" },
    { header: "Lab SD Value", field: "labSdValue" },
    { header: "Lab CV (%)", field: "labCv" },
    { header: "Unit", field: "unit" },
    { header: "Temperature", field: "temperature" },
    { header: "Method", field: "method" },
    // { header: "#", field: "hash2" },
  ];
  const formattedData = tableData.map((item, index) => ({
    ...item,
    srNo: index + 1,
  }));

  const getControlDetails = async () => {
    console.log("parameter");
    if (!controlId) return;
    dispatch(setLoading(true));
    const payload = {
      controlId: controlId,
    };
    await axiosInstance
      .post(apiUrls.GetControlParameterDetail, payload)
      .then((res) => {
        console.log("Parameterres", res);
        if (res?.data?.message) {
          // map API response -> table structure
          const mappedData = res?.data?.message?.map((item, index) => ({
            srNo: index + 1,
            labObservationId: item.ControlID || "",
            labObservationName: item.LabObservation_Name || "",
            level: item.Level || "",
            minValue: item.MinValue || "",
            maxValue: item.MaxValue || "",
            baseMeanValue: item.BaseMeanvalue || "",
            baseSdValue: item.BaseSDvalue || "",
            baseCv: item.BaseCVPercentage || "",
            labMeanValue: item.LabMeanValue || "",
            labSdValue: item.LabSDValue || "",
            labCv: item.LabCVPercentage || "",
            unit: item.Unit || "",
            temperature: item.Temperature || "",
            method: item.Method || "",
          }));

          setTableData(mappedData);
        }
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };
  useEffect(() => {
    getControlDetails();
  }, [controlId]);
  console.log(tableData, "View control");
  return (
    <>
      <div className="row">
        {fields?.map(({ label, key }) => (
          <div className="col-xl-2 col-sm-4 col-md-6 col-12 my-2">
            <LabeledInput
              key={key}
              label={label}
              value={controlData?.[key] || "-"}
            />
          </div>
        ))}
      </div>
      <Heading name={t("Parameter List")} isBreadcrumb={true} />
      <div className="row">
        <div className="col-sm-12">
          <CustomTable columns={columns} data={tableData} />
        </div>
      </div>
    </>
  );
};

export default ViewControlModal;
