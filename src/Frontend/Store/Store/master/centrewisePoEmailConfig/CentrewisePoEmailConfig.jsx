import React from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";

const CentrewisePoEmailConfig = () => {
  const initialState = {
    Centre: "",
    ToEmail: "",
  };
  const [payload, setPayload] = React.useState(initialState);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      <div className="card">
        <Heading name="Centre Wise PO Email Confignaure" isBreadcrumb />
        <div className="row p-2">
          <ReactSelect
            name="Centre"
            id="Centre"
            removeIsClearable
            placeholderName="Centre"
            value={payload.Centre}
            onChange={handleSelectChange}
            respclass="col-xl-2 col-sm-4 col-md-6 co-12 "
          />
          <TextAreaInput
            name={"ToEmail"}
            id={"ToEmail"}
            lable={"ToEmail"}
            value={payload?.ToEmail}
            rows={1}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <TextAreaInput
            name={"Ccmail"}
            id={"Ccmail"}
            lable={"Ccmail"}
            value={payload?.Ccmail}
            rows={1}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <div className="col-sm-1">
            <button className="btn btn-primary w-100">Save</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CentrewisePoEmailConfig;
