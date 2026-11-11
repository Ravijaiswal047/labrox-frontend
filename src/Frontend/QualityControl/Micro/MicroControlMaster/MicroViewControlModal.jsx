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

const MicroViewControlModal = ({ controlId, controlData }) => {
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
    { header: "Method", field: "method" },
    { header: "ExpectedValue", field: "ExpectedValue" },
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
      .post("QCMicro/GetControlParameterDetail", payload)
      .then((res) => {
        if (res?.data?.message) {
          const mappedData = res?.data?.message?.map((item, index) => ({
            srNo: index + 1,
            labObservationId: item.ControlID || "",
            labObservationName: item.LabObservation_Name || "",
            level: item.Level || "",
            method: item.Method || "",
            ExpectedValue: item.ExpectedValue || "",
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

export default MicroViewControlModal;
