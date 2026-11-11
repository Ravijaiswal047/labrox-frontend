import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";

const StoreAddressMaster = () => {
  const { t } = useTranslation();
  const initialState = {
    LocationId: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <>
      {" "}
      <Accordion
        name={t("Location Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <ReactSelect
            name="LocationId"
            id="LocationId"
            removeIsClearable={true}
            // dynamicOptions={GRNTypeOption}
            placeholderName="Location"
            value={payload?.LocationId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Address"
            id="Address"
            name="Address"
            value={payload?.Address}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            <button className="btn btn-sm btn-success">Update</button>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Location Store Address")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr No.")}</th>
                  <th>{t("Location Name")}</th>
                  <th>{t("Store Address")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr No.">{index + 1}</td>
                    <td data-title="Location Name">{row?.Location}</td>
                    <td data-title="Store Address">{row?.Items}</td>
                    
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default StoreAddressMaster;
