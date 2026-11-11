import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import RadioInput from "../../../../components/formComponent/RadioInput";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Accordion from "../../../../components/UI/Accordion";
import Tables from "../../../../components/UI/customTable";

const ItemPccMapping = () => {
  const { t } = useTranslation();
  const initialState = {
    CategoryId: "",
    SubCategoryId: "",
    ItemCategory: "",
    Items: "",
    MachineId: "",
    Type: "",
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
        name={t("Mapping Item With Item")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <MultiSelctItems
            placeholderName="Category Type"
            name="CategoryId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <MultiSelctItems
            placeholderName="SubCategory Type"
            name="SubCategoryId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Item Category"
            name="ItemCategory"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Machine"
            name="MachineId"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Items"
            name="Items"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Type"
            name="Type"
            values={payload}
            setValues={setPayload}
            // dynamicOptions={dropDownList?.department}
            labelKey="NAME"
            valueKey="SubCategoryID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <div className="row px-2 pb-2">
            <div className="col-sm-2 d-flex">
              <button className="btn btn-sm btn-success">Save</button>
              <button className="btn btn-sm btn-success ml-2">Search</button>
            </div>
          </div>
        </div>
      </Accordion>
      <Accordion
        name={t("Search Detail")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("Item")}</th>
                  <th>{t("Type")}</th>
                  <th>{t("Created By")}</th>
                  <th>{t("Created Date")}</th>
                  <th>
                    {" "}
                    <input
                      type="checkbox"
                      // checked={row?.isDeleted || false}
                      // onChange={() => handleDeleteToggle(index)}
                    />
                    {t("Delete")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="#">{index + 1}</td>
                    <td data-title="Item">{row?.Item}</td>
                    <td data-title="Type">{row?.Type}</td>
                    <td data-title="Created By">{row?.CreatedBy}</td>
                    <td data-title="Created Date">{row?.CreatedDate}</td>
                    <td data-title="Delete">
                      <input
                        type="checkbox"
                        checked={row?.isDeleted || false}
                        onChange={() => handleDeleteToggle(index)}
                      />
                      <button
                        className="btn btn-danger btn-sm ms-1"
                        onClick={() => handleDelete(index)}
                      >
                        Delete
                      </button>
                    </td>
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

export default ItemPccMapping;
