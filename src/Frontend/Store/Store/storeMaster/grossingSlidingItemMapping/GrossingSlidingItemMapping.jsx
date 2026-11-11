import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";

const GrossingSlidingItemMapping = () => {
  const { t } = useTranslation();
  const initialState = {
    Type: "",
    ItemsId: "",
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
      <Accordion
        name={t("Location Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <ReactSelect
            name="Type"
            id="Type"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Grossing", value: "1" },
              { label: "Sliding", value: "2" },
              { label: "Other", value: "3" },
            ]}
            placeholderName="Type"
            value={payload?.Type}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Items"
            name="ItemsId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <div className="col-sm-1">
            <button className="btn btn-sm btn-success">Save</button>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Centre Details")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Sr No.")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Type")}</th>
                  <th>{t("Delete")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr No.">{index + 1}</td>
                    <td data-title="Item Name">{row?.Location}</td>
                    <td data-title="Type">{row?.Items}</td>
                    <td data-title="Delete">{row?.Items}</td>
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

export default GrossingSlidingItemMapping;
