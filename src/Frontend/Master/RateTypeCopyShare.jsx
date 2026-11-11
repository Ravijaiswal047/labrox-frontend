import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Accordion from "@app/components/UI/Accordion";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";

const RateTypeCopyShare = () => {
  const navigate = useNavigate();
  const [RateTypeData, setRateTypeData] = useState([]);
  const [load, setLoad] = useState(false);
  const [payload, setPayload] = useState({
    FromRateTypeID: "2",
    ToRateTypeID: "3",
  });
  const { t } = useTranslation();

  const handleSelect = (event) => {
    const { name, value } = event.target;
    setPayload({ ...payload, [name]: value });
  };

  const getRateList = () => {
    axiosInstance
      .get("Centre/getRateList")
      .then((res) => {
        let data = res.data.message;
        let RateType = data.map((ele) => {
          return {
            value: ele.CentreID,
            label: ele.Centre,
          };
        });
        setRateTypeData(RateType);
      })
      .catch((err) => console.log(err));
  };

  const Save = () => {
    if (payload?.FromRateTypeID === payload?.ToRateTypeID) {
      toast.error("From-doctor And To-doctor Cant Be The Same.");
    } else {
      setLoad(true);
      axiosInstance
        .post("RateTypeShare/SaveRateTypeCopy", payload)
        .then((res) => {
          if (res.data.success) {
            toast.success(res.data.message);
          } else {
            toast.error("Something went wrong");
          }
          setLoad(false);
        })
        .catch((err) => {
          toast.error(err.response.data.message);
          setLoad(false);
        });
    }
  };

  useEffect(() => {
    getRateList();
  }, []);
  return (
    <>
      <Accordion
        name={t("Rate Type Copy Share")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <SelectBox
              onChange={handleSelect}
              className="required-fields"
              lable="From RateType"
              id="From RateType"
              options={[{ label: "From RateType", value: "" }, ...RateTypeData]}
              name="FromRateTypeID"
              value={payload?.FromRateTypeID}
            />
          </div>{" "}
          <div className="col-sm-2">
            <SelectBox
              className="required-fields"
              lable="To RateType"
              id="To RateType"
              onChange={handleSelect}
              options={[{ label: "To RateType", value: "" }, ...RateTypeData]}
              name="ToRateTypeID"
              value={payload?.ToRateTypeID}
            />
          </div>
          {load ? (
            <Loading />
          ) : (
            <div className="col-sm-1">
              <button
                className="btn btn-block btn-success btn-sm"
                onClick={Save}
              >
                {t("Save")}
              </button>
            </div>
          )}
          <div className="col-sm-1">
            <button
              className="btn btn-block btn-primary btn-sm"
              onClick={() => navigate(-1)}
            >
              {t("Back")}
            </button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default RateTypeCopyShare;
