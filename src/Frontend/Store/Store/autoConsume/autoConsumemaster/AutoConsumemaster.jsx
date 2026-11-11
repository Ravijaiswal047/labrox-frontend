import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import { useTranslation } from "react-i18next";
import {
  GetBindcattype,
  getBindCentreType,
  GetBinditem,
  GetBindSubcattype,
  GetItemCategory,
  GetMachine,
} from "../../../../utils/NetworkApi/commonApi";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Tables from "../../../../components/UI/customTable";
import CustomSelect from "../../../../components/formComponent/CustomSelect";

const AutoConsumemaster = () => {
  const { t } = useTranslation();
  const [headerSelections, setHeaderSelections] = useState({
    consumeType: "",
    eventType: "",
  });
  const [tableData, setTableData] = useState([
    {
      subCategory: "Capex",
      itemType: "for testing",
      itemID: "6026",
      itemName: "ASD A-15 BIOSYSTEMS ABBOTT 1",
      machine: "A-15 BIOSYSTEMS",
      manufacture: "ABBOTT",
      packSize: "1",
      consumeType: "",
      eventType: "",
      consumeUnit: "KG",
      qtyPerTes: "",
      centreType: "",
      labItem: "",
    },
    {
      subCategory: "Capex",
      itemType: "for testing",
      itemID: "6024",
      itemName: "LPG A-15 BIOSYSTEMS ABBOTT 1",
      machine: "A-15 BIOSYSTEMS",
      manufacture: "ABBOTT",
      packSize: "1",
      consumeType: "",
      eventType: "",
      consumeUnit: "LABEL",
      qtyPerTes: "",
      centreType: "",
      labItem: "",
    },
    {
      subCategory: "Capex",
      itemType: "for testing",
      itemID: "6025",
      itemName: "LPG A-15 BIOSYSTEMS ABDOS 1",
      machine: "A-15 BIOSYSTEMS",
      manufacture: "ABDOS",
      packSize: "1",
      consumeType: "",
      eventType: "",
      consumeUnit: "LTR",
      qtyPerTes: "",
      centreType: "",
      labItem: "",
    },
  ]);

  const [DropDownList, setDropDownList] = useState({
    categorylist: [],
    subcategorylist: [],
    itemcategorylist: [],
    machinelist: [],
    items: [],
    bindType: [],
  });

  const [payload, setPayload] = useState({
    CategoryType: [],
    SubCategoryType: [],
    ItemCategory: [],
    Machine: [],
    Items: [],
    SearchBy: "1",
    Type: "",
  });
  const handlePayloadMultiSelectNumbers = (data) => {
    if (!Array.isArray(data)) return [];
    const result = data.map((item) => Number(item?.code));
    console.log(result);
    return result;
  };
  const handleSelectMultiChange = (name, select) => {
    if (name === "CategoryType") {
      setPayload((prev) => ({ ...prev, [name]: select }));
      GetBindSubcattype(handlePayloadMultiSelectNumbers(select), (data) => {
        setDropDownList((prev) => ({ ...prev, subcategorylist: data }));
      });
      setPayload((prev) => ({
        ...prev,
        SubCategoryType: "",
        ItemCategory: "",
        Machine: "",
        Items: "",
      }));
      setDropDownList((prev) => ({
        ...prev,
        subcategorylist: [],
        itemcategorylist: [],
        items: [],
      }));
    } else if (name === "SubCategoryType") {
      setPayload((prev) => ({ ...prev, [name]: select }));
      GetItemCategory(handlePayloadMultiSelectNumbers(select), (data) => {
        setDropDownList((prev) => ({ ...prev, itemcategorylist: data }));
      });
      setPayload((prev) => ({
        ...prev,
        ItemCategory: "",
        Machine: "",
        Items: "",
      }));
      setDropDownList((prev) => ({
        ...prev,
        itemcategorylist: [],
        items: [],
      }));
    } else if (name === "ItemCategory") {
      setPayload((prev) => ({ ...prev, [name]: select }));

      GetBinditem(
        handlePayloadMultiSelectNumbers(payload?.CategoryType),
        handlePayloadMultiSelectNumbers(payload?.SubCategoryType),
        handlePayloadMultiSelectNumbers(select),
        (data) => {
          setDropDownList((prev) => ({ ...prev, items: data }));
        }
      );
      setPayload((prev) => ({
        ...prev,
        Machine: "",
        Items: "",
      }));
      setDropDownList((prev) => ({
        ...prev,
        items: [],
      }));
    } else {
      setPayload((prev) => ({ ...prev, [name]: select }));
    }
  };
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };

  useEffect(() => {
    GetBindcattype((data) => {
      setDropDownList((prev) => ({ ...prev, categorylist: data }));
    });
    GetMachine((data) => {
      setDropDownList((prev) => ({ ...prev, machinelist: data }));
    });
    getBindCentreType((data) => {
      setDropDownList((prev) => ({ ...prev, bindType: data }));
    });
  }, []);
  // const handleInputChange = (index, name, value) => {
  //   const updatedData = [...tableData];
  //   updatedData[index][name] = value;
  //   setTableData(updatedData);
  // };

  const handleSelect = (name, selectedOption) => {
    const value = selectedOption?.value;

    const updatedTableData = tableData.map((row) => ({
      ...row,
      [name]: value,
    }));

    setTableData(updatedTableData);
    setHeaderSelections((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomSelect = (index, name, selectedOption) => {
    const value = selectedOption?.value;

    const updatedData = [...tableData];
    updatedData[index] = {
      ...updatedData[index],
      [name]: value,
    };

    setTableData(updatedData);
  };

 
const handleAllInputChange = (fieldName, value) => {
  const updatedTableData = tableData.map((row) => ({
    ...row,
    [fieldName]: value,
  }));
  setTableData(updatedTableData);
};


const handleInputChange = (index, fieldName, value) => {
  const updatedTableData = [...tableData];
  updatedTableData[index] = {
    ...updatedTableData[index],
    [fieldName]: value,
  };
  setTableData(updatedTableData);
};

  return (
    <>
      <div className="card">
        <Heading title={"Store Item Auto Consume Master"} />
        <div className="row p-2">
          <MultiSelctItems
            placeholderName="Category Type"
            name="CategoryType"
            values={payload}
            setValues={setPayload}
            labelKey="categoryTypeName"
            valueKey="categoryTypeID"
            dynamicOptions={DropDownList?.categorylist}
            handleChange={handleSelectMultiChange}
            requiredClassName={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Sub Category Type"
            name="SubCategoryType"
            values={payload}
            setValues={setPayload}
            labelKey="subCategoryTypeName"
            valueKey="subCategoryTypeID"
            dynamicOptions={DropDownList?.subcategorylist}
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Item Category"
            name="ItemCategory"
            values={payload}
            setValues={setPayload}
            labelKey="name"
            valueKey="subCategoryID"
            dynamicOptions={DropDownList?.itemcategorylist}
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Machine"
            name="Machine"
            values={payload}
            setValues={setPayload}
            labelKey="name"
            valueKey="id"
            dynamicOptions={DropDownList?.machinelist}
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <MultiSelctItems
            placeholderName="Items"
            name="Items"
            values={payload}
            setValues={setPayload}
            labelKey="itemName"
            valueKey="itemId"
            dynamicOptions={DropDownList?.items}
            handleChange={handleSelectMultiChange}
            requiredClassName={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="SearchBy"
            id="SearchBy "
            removeIsClearable={true}
            dynamicOptions={[
              { value: "1", label: "Single Store Item" },
              { value: "2", label: "Multiple Store Item" },
            ]}
            placeholderName="Search By"
            value={payload?.SearchBy}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Type"
            id="Type "
            removeIsClearable={true}
            dynamicOptions={DropDownList?.bindType?.map((ele) => ({
              label: ele?.type,
              value: ele?.id,
            }))}
            placeholderName="Type"
            value={payload?.Type}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-1">
            <button className="btn btn-sm btn-success">Add</button>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading title={"Store Item List"} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>SubCategory</th>
                  <th>Item Type</th>
                  <th>ItemID</th>
                  <th>Item Name</th>
                  <th>Machine</th>
                  <th>Manufacture</th>
                  <th>PackSize</th>
                  <th>
                    <CustomSelect
                      name="consumeType"
                      value={headerSelections.consumeType}
                      placeHolder="Consume Type"
                      option={[
                        { label: "Consume Type", value: "0" },
                        { label: "Patient Wise", value: "1" },
                        { label: "Test Wise", value: "2" },
                        { label: "Barcode No Wise", value: "3" },
                        { label: "Machine Wise", value: "4" },
                      ]}
                      onChange={handleSelect}
                    />
                  </th>

                  <th>
                    <CustomSelect
                      option={[
                        { label: "Routine", value: "routine" },
                        { label: "Emergency", value: "emergency" },
                      ]}
                      placeHolder="Event Type"
                      value={headerSelections.eventType}
                      name="eventType"
                      onChange={(name, e) => handleSelect(name, e)}
                    />
                  </th>
                  <th>Consume Unit</th>
                  <th style={{ width: "8%" }}>
                    <input
                      placeholder="QtyPerTes"
                      type="text"
                      className="form-control"
                      onChange={(e) =>
                        handleAllInputChange("qtyPerTes", e.target.value)
                      }
                    />
                  </th>
                  <th>Centre Type</th>
                  <th>Lab Item</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index}>
                    <td data-title="Sr. No."> {index + 1} </td>
                    <td data-title="SubCategory"> {row.subCategory} </td>
                    <td data-title="Item Type"> {row.itemType} </td>
                    <td data-title="ItemID"> {row.itemID} </td>
                    <td data-title="Item Name"> {row.itemName} </td>
                    <td data-title="Machine"> {row.machine} </td>
                    <td data-title="Manufacture"> {row.manufacture} </td>
                    <td data-title="PackSize"> {row.packSize} </td>
                    <td data-title="Consume Type">
                      <CustomSelect
                        name="consumeType"
                        value={row.consumeType}
                        option={[
                          { label: "Select", value: "" },
                          { label: "Consume Type", value: "0" },
                          { label: "Patient Wise", value: "1" },
                          { label: "Test Wise", value: "2" },
                          { label: "Barcode No Wise", value: "3" },
                          { label: "Machine Wise", value: "4" },
                        ]}
                        onChange={(name, option) =>
                          handleCustomSelect(index, name, option)
                        }
                      />
                    </td>
                    <td data-title="Select Event Type">
                      <CustomSelect
                        option={[
                          { label: "Routine", value: "routine" },
                          { label: "Emergency", value: "emergency" },
                        ]}
                        placeHolder="Event Type"
                        value={row.eventType}
                        name="eventType"
                        onChange={(name, option) =>
                          handleCustomSelect(index, name, option)
                        }
                      />
                    </td>
                    <td data-title="Consume Unit"> {row.consumeUnit} </td>
                    <td data-title="QtyPerTes">
                      <input
                        placeholder="QtyPerTes"
                        type="text"
                        className="form-control"
                        value={row?.qtyPerTes || ""}
                        onChange={(e) =>
                          handleInputChange(index, "qtyPerTes", e.target.value)
                        }
                      />
                    </td>
                    <td data-title="Centre Type"> {row.centreType} </td>
                    <td data-title="Lab Item"> {row.labItem} </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <div className="row p-2">
          <div className="col-sm-12 d-flex justify-content-end">
            <button className="btn btn-sm btn-success">Save</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AutoConsumemaster;
