import React, { useState } from "react";
import DatePicker from "../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { Button } from "react-bootstrap";
import { useEffect } from "react";
import { axiosInstance } from "../../utils/axiosInstance";

const FinancialYearPopUpModal = () => {
  const [t] = useTranslation();
  const [payload, setPayload] = useState({
    fromDate: new Date(),
    toDate: new Date(),
    fy: "",
  });

  const [fyList, setFyList] = useState([]);

  const GetFinancialYear = (name) => {
    const generateFYFallback = () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const month = today.getMonth();
      const fyStart = month >= 3 ? currentYear : currentYear - 1;
      return [
        {
          label: `${fyStart - 1}-${fyStart}`,
          value: `${fyStart - 1}-${fyStart}`,
        },
        {
          label: `${fyStart}-${fyStart + 1}`,
          value: `${fyStart}-${fyStart + 1}`,
        },
        {
          label: `${fyStart + 1}-${fyStart + 2}`,
          value: `${fyStart + 1}-${fyStart + 2}`,
        },
      ];
    };

    axiosInstance
      .post("Global/GetGlobalData", {
        Type: name,
      })
      .then((res) => {
        let data = res.data.message;
        if (Array.isArray(data) && data.length > 0) {
          let SampleContainer = data.map((ele) => {
            return {
              value: ele.FieldDisplay,
              label: ele.FieldDisplay,
            };
          });
          setFyList(SampleContainer);
        } else {
          setFyList(generateFYFallback());
        }
      })
      .catch((err) => {
        console.log(err);
        setFyList(generateFYFallback());
      });
  };

  useEffect(() => {
    GetFinancialYear("FinancialYear");
  }, []);

  const dateSelect = (date, name) => {
    setPayload({ ...payload, [name]: date });
  };

  const handleReactChange = (name, e) => {
    setPayload((prev) => ({ ...prev, [name]: e?.value }));
  };

  return (
    <>
      <div className="main_FinancialYearPop">
        <div className="row">
          <div className="col-sm-3 col-md-4 mb-1">
            <DatePicker
              name="fromDate"
              id="fromDate"
              value={payload?.fromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("From Date")}
              className={"w-100"}
            />
          </div>
          <div className="col-sm-3 col-md-4 mb-1">
            <DatePicker
              name="toDate"
              id="toDate"
              value={payload?.toDate}
              onChange={dateSelect}
              maxDate={new Date()}
              placeholder=""
              lable={t("From Date")}
              className={"w-100"}
            />
          </div>
          <div className="col-sm-3 col-md-4">
            <ReactSelect
              dynamicOptions={fyList}
              name="fy"
              isShowBorder={true}
              lable={t("Finacial Year")}
              id="fy"
              removeIsClearable={false}
              placeholderName={t("Finacial Year")}
              value={payload?.fy}
              onChange={handleReactChange}
              className="required-fields"
            />
          </div>
        </div>
        <div className="d-flex align-items-center justify-content-center mt-1">
            <Button className="rounded px-3 mx-auto">Save</Button>
        </div>
      </div>
    </>
  );
};

export default FinancialYearPopUpModal;
