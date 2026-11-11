import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { axiosInstance } from "../../utils/axiosInstance";
import { notify } from "../../utils/utils";
import { toast } from "react-toastify";
import Loading from "../../components/loader/Loading";
import moment from "moment";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
const ReferalDoctorShareUpdate = () => {
  const { t } = useTranslation();
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const [payload, setPayload] = useState({
    toDate: new Date(),
    fromDate: new Date(),
    CentreID: [],
    DoctorID: "",
    labNo: ""
  });
  const [load, setLoad] = useState(false);
  const [Center, setCenter] = useState([]);
  const [DoctorData, setDoctorData] = useState([]);
  const [isInclude, setIsInclude] = useState(true);

  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };

  const handleSelect = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSearchSelectChangeDoctor = (label, value) => {
    setPayload({ ...payload, [label]: value ? String(value.value) : "" });
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };
  const getSelectedCentreID = () => payload?.CentreID || "0";

  const fetchCenter = () => {
    axiosInstance
      .get("Centre/getGlobalCentres")
      .then((res) => {
        let data = res.data.message;
        let value = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
            DefaultCentreId: ele.DefaultCentreId,
          };
        });
        setCenter(value);
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };

  const getDoctorSuggestion = async () => {
    try {
      const [doctorRes] = await Promise.all([
        axiosInstance.post("DoctorReferal/getDoctorDataBind"),
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Department", "0"],
        }),
      ]);

      const doctorListRes =
        doctorRes?.data?.message?.map((item) => ({
          label: item?.DoctorName,
          value: item?.DoctorID,
        })) || [];

      setDoctorData([{ label: "Select", value: "" }, ...doctorListRes]);
    } catch (err) {
      console.log(err);
    }
  };


  const handleSave = async () => {
    if (!payload?.labNo) {
      if (!payload?.CentreID?.length) {
        toast.error("Please select Center ");
        return
      }
      if (!payload?.DoctorID) {
        toast.error("Please select Doctor");
        return
      }
    }
    try {
      setLoad(true);
      console.log(payload);

      const res = await axiosInstance.post("InhouseDoctor/DoctorShareUpdate", {
        DoctorID: Number(payload?.DoctorID) || 0,
        CentreID: getSelectedCentreID(),
        fromDate: moment(payload.fromDate).format("YYYY-MM-DD"),
        toDate: moment(payload.toDate).format("YYYY-MM-DD"),
        LabNo: String(payload?.labNo),
        // IsInclude: isInclude ? 1 : 0,
      });

      if (res?.data?.success) {
        toast.success(res?.data?.message);
      } else {
        toast.error(res?.data?.message);
      }

      setPayload({
        toDate: new Date(),
        fromDate: new Date(),
        CentreID: [],
        DoctorID: "",
        labNo: "",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message
          ? error?.response?.data?.message
          : "Error Occur"
      );
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => {
    fetchCenter();
    getDoctorSuggestion();
  }, []);

  return (
    <>
      <Accordion
        title={t("DoctorShareUpdate(Referal)")}
        defaultValue={true}
      >
        <div className="card px-2 py-2">
          <div className="row">
            <div className="col-sm-3 col-md-2 mb-2">
              <DatePicker
                name="fromDate"
                id="fromDate"
                value={payload?.fromDate}
                onChange={dateSelect}
                maxDate={new Date()}
                placeholder=""
                lable={t("From Date")}
                className={"w-100 required-fields"}
              />
            </div>
            <div className="col-sm-3 col-md-2 mb-2">
              <DatePicker
                name="toDate"
                id="toDate"
                value={payload?.toDate}
                onChange={dateSelect}
                maxDate={new Date()}
                placeholder=""
                lable={t("To Date")}
                className={"w-100 required-fields"}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                className="required-fields"
                lable="Centre"
                id="CentreID"
                name="CentreID"
                onChange={handleSelect}
                selectedValue={payload?.CentreID}
                options={[{ label: "Select Centre", value: "" }, ...Center]}
              /> */}
              <ReactSelect
                dynamicOptions={
                  DefaultCurrencyName == "KES"
                    ? [
                      { label: "Select Centre", value: "" },
                      { label: "All Centre", value: "0" },
                      ...Center,
                    ]
                    : [
                      { label: "Select Centre", value: "" },
                      ...Center,
                    ]
                }
                lable="Centre"
                id="CentreID"
                name="CentreID"
                removeIsClearable={true}
                placeholderName={t("Select Centre")}
                value={payload?.CentreID}
                onChange={handleSearchSelectChangeDoctor}
              />
            </div>
            <div className="col-sm-2">
              {/* <SelectBox
                className="required-fields"
                lable="Doctor"
                id="DoctorID"
                name="DoctorID"
                onChange={handleSelect}
                selectedValue={payload?.DoctorID}
                options={DoctorData}
              /> */}
              <ReactSelect
                dynamicOptions={DoctorData}
                lable="Doctor"
                id="DoctorID"
                name="DoctorID"
                removeIsClearable={true}
                placeholderName={t("Select Doctor")}
                value={payload?.DoctorID}
                onChange={handleSearchSelectChangeDoctor}
              />
            </div>
            <div className="col-sm-2">
              <Input
                name="labNo"
                id="labNo"
                lable="Lab No"
                placeholder=" "
                type="text"
                value={payload?.labNo}
                onChange={handleChange}
              />
            </div>
   
            <div className="col-sm-1">
              {load ? (
                <Loading />
              ) : (
                <button
                  className="btn btn-sm btn-success w-100"
                  onClick={handleSave}
                >
                  {t("Save")}
                </button>
              )}
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default ReferalDoctorShareUpdate;