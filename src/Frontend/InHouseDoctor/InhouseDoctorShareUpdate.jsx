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
import { setLoading } from "../../store/reducers/loadingSlice/loadingSlice.js";
import { useDispatch } from "react-redux";
import Input from "../../components/formComponent/Input.jsx";
import { SaveButton } from "../../components/UI/CustomButton.jsx";

const InhouseDoctorShareUpdate = () => {
  const { t } = useTranslation();

  const [payload, setPayload] = useState({
    toDate: new Date(),
    fromDate: new Date(),
    CentreID: "",
    DoctorID: "",
    labNo: "",
  });

  const [load, setLoad] = useState(false);
  const [Center, setCenter] = useState([]);
  const [DoctorData, setDoctorData] = useState([]);
  const dispatch = useDispatch();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

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
      dispatch(setLoading(true));
      const [doctorRes] = await Promise.all([
        axiosInstance.post("CommonController/Fetchprocedure", {
          typeName: "inHouse_Doctorsanddepartment",
          params: ["Doctor", "0"],
        }),
      ]);

      const doctorListRes =
        doctorRes?.data?.data?.map((item) => ({
          label: item?.EmployeeName,
          value: item?.EmployeeID,
        })) || [];

      setDoctorData(doctorListRes);
    } catch (error) {
      console.error("Error fetching doctors/departments:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSave = async () => {
    if (!payload?.labNo) {
      if (!payload?.CentreID) {
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

      const res = await axiosInstance.post(
        "InhouseDoctor/DoctorShareInhouseUpdate",
        {
          DoctorID: payload?.DoctorID || 0,
          CentreID: payload?.CentreID || 0,
          fromDate: moment(payload.fromDate).format("YYYY-MM-DD"),
          toDate: moment(payload.toDate).format("YYYY-MM-DD"),
          LabNo: String(payload?.labNo),
        },
      );

      if (res?.data?.success) {
        toast.success(res?.data?.message);
      } else {
        toast.error(res?.data?.message);
      }

      setPayload({
        toDate: new Date(),
        fromDate: new Date(),
        CentreID: "",
        DoctorID: "",
        labNo: "",
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message
          ? error?.response?.data?.message
          : "Error Occur",
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
        name={t("DoctorShareUpdate(Inhouse)")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="card px-2 py-2">
          <div className="row">
            <div className="col-12 col-sm-6 col-md-2 my-1">
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
            <div className="col-12 col-sm-6 col-md-2 my-1">
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
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <SelectBox
                className="required-fields"
                lable="Centre"
                id="CentreID"
                name="CentreID"
                onChange={handleSelect}
                selectedValue={payload?.CentreID}
                options={[{ label: "Select Centre", value: "" }, ...Center]}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
              <SelectBox
                className="required-fields"
                lable="Doctor"
                id="DoctorID"
                name="DoctorID"
                onChange={handleSelect}
                selectedValue={payload?.DoctorID}
                options={[{ label: "Select Doctor", value: "" }, ...DoctorData]}
              />
            </div>
            <div className="col-12 col-sm-6 col-md-2 my-1">
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
            <div className="col-12 col-sm-6 col-md-2 my-1">
              {load ? (
                <Loading />
              ) : (
                <SaveButton
                  onClick={handleSave}
                  text={t("Save")}
                />
                
              )}
            </div>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default InhouseDoctorShareUpdate;
