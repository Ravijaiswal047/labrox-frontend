import React, { useState } from "react";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "../../components/UI/Accordion";
import { getTrimmedData } from "../../utils/helpers";
import { toast } from "react-toastify";
const HimsToLims = () => {
  const [formData, setFormData] = useState({
    CrNo: "",
  });
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  //   const handleSubmit = () => {
  //     axiosInstance
  //       .post(
  //         "CRMIntegration/HimsToLimsIntregration",
  //         getTrimmedData({
  //           hmis_request_type: "1",
  //           hmis_patCrNo: formData?.CrNo,
  //         })
  //       )
  //       .then((res) => {
  //         if (res?.data?.success) setTableData(res?.data?.message);
  //         else setTableData([]);
  //       })
  //       .catch((err) => {
  //         toast.error(
  //           err?.response?.data?.message
  //             ? err?.response?.data?.message
  //             : "Something Went Wrong"
  //         );
  //         setTableData([]);
  //       });
  //   };
  const handleSubmit = () => {
    toast.error("Hi");
    // const speech = new SpeechSynthesisUtterance();
    // speech.text = "Successfully";
    // speech.lang = "en-US";
    // speech.pitch = 1;
    // speech.rate = 1;
    // window.speechSynthesis.speak(speech);
  };
  console.log(tableData);
  return (
    <>
      <Accordion
        name={"HimsToLimsIntregration"}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-3">
            <Input
              onChange={handleChange}
              value={formData?.CrNo}
              name="CrNo"
              className="required-fields"
              type="text"
              placeholder=""
              lable="HMIS_PatCrNo"
              id="Visit No"
            />
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-info btn-block btn-sm"
              onClick={handleSubmit}
            >
              {t("Submit")}
            </button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default HimsToLims;
