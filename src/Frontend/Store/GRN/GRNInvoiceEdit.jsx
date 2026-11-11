import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../components/UI/Accordion";
import Input from "../../../components/formComponent/Input";

const GRNInvoiceEdit = () => {
  const { t } = useTranslation();
  const initialState = {
    GRNNo: "",
  };
  const [payload, setPayload] = useState(initialState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <Accordion
        name={t("GRN Invoice Detail Update")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <Input
            type="number"
            placeholder=" "
            lable="GRN NO"
            id="GRNNo"
            name="GRNNo"
            value={payload.GRNNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
           <div className="col-sm-1">
            <button className="btn btn-sm btn-success">Search</button>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default GRNInvoiceEdit;
