import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import { setLoading } from "../../../../store/reducers/loadingSlice/loadingSlice";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { apiUrls } from "../../../../utils/apiUrls";

import { notify } from "../../../../utils/utils";
import { useDispatch } from "react-redux";
import { formatStandardDate } from "../../../../utils/helpers";
import { CustomButton } from "../../../../components/UI/CustomButton";

const AddReading = ({ payloadData, onSave, onCancel,tableData }) => {
  const [payload, setPayload] = useState({
    Reading: "",
    Date: new Date(),
  });
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (
      value !== "" &&
      !/^\d*\.?\d*$/.test(value)
    ) {
      return;
    }
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const dateSelect = (date, name) => {
  
    setPayload((prev) => ({
      ...prev,
      [name]: date,
    }));

  };

  const handleSave = async () => {
    if (!payload.Reading) {
      notify("Please add reading", "warn");
      return;
    }

    const searchPayload = {
      labId: String(payloadData.Centre), // 5757
      controlId: payloadData.Control, // 24040006
      parameterId: payloadData.Parameter, // LSHHI526
      levelId: String(payloadData.Level), // 2
      entryDate: formatStandardDate(payload.Date,"YYYY-MM-DD") || new Date().toISOString().split("T")[0],
      reading: payload.Reading,
      controlName: payloadData?.ControlName || "",
      lotNumber: payloadData?.LotNumber || "",
      labObservationName: payloadData?.ParameterName || "",
      level: payloadData?.LevelName || "", // 2
      barcodeNo: payloadData?.Sinno || "",
      // macId: tableData[0]?.machineName || "",
    };

    await axiosInstance
      .post(apiUrls.SaveReading, searchPayload)
      .then((res) => {
        console.log("res", res);
        if(res?.data?.success){
          notify(res?.data?.message, "success");
        }
        else{
          notify(res?.data?.message, "warn");
        }
        if (onSave) onSave(res);
      })
      .catch((err) => {
        notify(err?.data?.message, "error");
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
  };
  console.log("payload", tableData);

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col-sm-4">
          <Input
            type="text"
            placeholder=""
            lable={t("Reading")}
            name="Reading"
            respclass="w-100"
            value={payload.Reading}
            onChange={handleChange}
          />
        </div>
        <div className="col-sm-4">
          <DatePicker
            name="Date"
            id="Date"
            value={payload?.Date}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Date")}
            className="custom-calendar"
            //   respclass="col-xl-2 col-sm-4 col-md-6 co-12"
          />
        </div>
        <div className="mx-2 ">
          {/* <Button onClick={handleSave} className="rounded py-0 ml-2">
            Save
          </Button> */}
          <CustomButton text="Save" className="mx-2 mb-1" icon="save" onClick={handleSave} />
                    
        </div>
        <div className="mx-2 ">
          {/* <Button onClick={handleCancel} className="rounded py-0 ml-2">
            Cancel
          </Button> */}
          <CustomButton text="Cancel" className="mx-2 mb-1" icon="cancel" onClick={handleCancel} />
        </div>
      </div>

      {/* <CustomTable columns={columns} data={tableData} /> */}
    </div>
  );
};

export default AddReading;
