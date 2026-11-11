import React, { useEffect, useState } from "react";
import Heading from "../../components/UI/Heading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { Button } from "react-bootstrap";
import { axiosInstance } from "../../utils/axiosInstance";
import { apiUrls } from "../../utils/apiUrls";
import DropdownItem from "react-bootstrap/esm/DropdownItem";

const Master = () => {
  const [t] = useTranslation();
  const [payload, setPayload] = useState({
    toolType: "",
    Investigation: "",
  });
  const [dropdownList, setDropdownList] = useState({
    investigationList: [],
  });

  const handleReactSelect = (name, option) => {
    setPayload((prev) => ({ ...prev, [name]: option?.value }));
  };

  const getInvestigations = async () => {
    await axiosInstance
      .get(apiUrls?.BindInvestigationList)
      .then((res) => {
        const invResLIst = res?.data?.message?.map((item, _) => ({
          label: item?.TestName,
          value: String(item?.InvestigationID),
        }));
        setDropdownList((prev) => ({ ...prev, investigationList: invResLIst }));
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  useEffect(() => {
    getInvestigations();
  }, []);

  return (
    <>
      <div style={{ height: "80vh" }} className="card">
        <Heading title={"Tool Master"} />
        <div className="row px-2 py-2">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[]}
              value={payload?.toolType}
              onChange={handleReactSelect}
              placeholderName={t("ToolType")}
              label={t("ToolType")}
              id={"toolType"}
              name={"toolType"}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[]}
              value={payload?.dateType}
              onChange={handleReactSelect}
              placeholderName={t("DateType")}
              label={t("DateType")}
              id={"dateType"}
              name={"dateType"}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={dropdownList?.investigationList}
              value={payload?.Investigation}
              onChange={handleReactSelect}
              placeholderName={t("Investigation")}
              label={t("Investigation")}
              id={"Investigation"}
              name={"Investigation"}
            />
          </div>
          <Button className="rounded px-4">Submit</Button>
        </div>
      </div>
    </>
  );
};

export default Master;
