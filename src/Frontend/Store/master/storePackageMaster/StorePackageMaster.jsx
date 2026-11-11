import React, { useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { PlusIcon } from "../../../../components/SvgIcons";
import AddNewPackageModal from "./AddNewPackageModal";
import Modal from "../../../../components/ModalComponent/Modal";
import { useTranslation } from "react-i18next";
import { AutoComplete } from "primereact/autocomplete";
import LabeledInput from "../../../../components/formComponent/LabeledInput";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";

const StorePackageMaster = () => {
  const { t } = useTranslation();

  const initialState = {
    Package: "",
    ItemName: "",
    Quantity: "",
  };

  const [payload, setPayload] = useState(initialState);
  const [dropDownList, setDropDownList] = useState({ bindindentdetails: [] });
  const [modalData, setModalData] = useState({});
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [handleModelData, setHandleModelData] = useState({});

  const staticStockItems = [
    { itemNameGroup: "Paracetamol", itemIDGroup: "1", issueMultiplier: 1 },
    { itemNameGroup: "Amoxicillin", itemIDGroup: "2", issueMultiplier: 1 },
    { itemNameGroup: "Ibuprofen", itemIDGroup: "3", issueMultiplier: 1 },
    { itemNameGroup: "Cetrizine", itemIDGroup: "4", issueMultiplier: 1 },
  ];

  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleChanges = (index, name, value) => {
    setDropDownList((prev) => ({
      ...prev,
      bindindentdetails: prev.bindindentdetails.map((row, i) =>
        i === index ? { ...row, [name]: value } : row
      ),
    }));
  };

  const handleRemove = (indexToRemove) => {
    setDropDownList((prev) => ({
      ...prev,
      bindindentdetails: prev.bindindentdetails.filter(
        (_, i) => i !== indexToRemove
      ),
    }));
  };

  const handleModel = (
    label,
    width,
    type,
    isOpen,
    Component,
    handleInsertAPI,
    extrabutton
  ) => {
    setHandleModelData({
      label,
      width,
      type,
      isOpen,
      Component,
      handleInsertAPI,
      extrabutton: extrabutton || <></>,
    });
  };

  const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };

  const handleChangeModel = (data) => {
    setModalData(data);
  };

  useEffect(() => {
    setHandleModelData((prev) => ({ ...prev, modalData }));
  }, [modalData]);

  const searchItems = (query) => {
    const filtered = staticStockItems.filter((item) =>
      item.itemNameGroup.toLowerCase().includes(query.toLowerCase())
    );
    setStockSuggestions(filtered);
  };

  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.itemNameGroup : e.value;
    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({ ...prev, ItemName: val }));
  };

  const handleAutoCompleteSelect = (e) => {
    const selected = e.value;
    setPayload((prev) => ({
      ...prev,
      ItemName: selected?.itemNameGroup || selected,
      ItemID: selected?.itemIDGroup || selected,
      issueMultiplier: selected?.issueMultiplier || selected,
    }));
  };

  const itemTemplate = (item) => (
    <div style={{ fontSize: "12px", width: "100%" }}>{item?.itemNameGroup}</div>
  );

  const handleAddItems = () => {
    if (payload.ItemName && payload.Quantity) {
      setDropDownList((prev) => ({
        ...prev,
        bindindentdetails: [
          ...prev.bindindentdetails,
          {
            itemId: payload.ItemID,
            typeName: payload.ItemName,
            qty: payload.Quantity,
          },
        ],
      }));
      setPayload(initialState);
      setAutoCompleteVal("");
    } else {
      alert("Please fill all required fields.");
    }
  };

  return (
    <>
      <div className="card">
        <Heading name="Store Package Master" isBreadcrumb />
        <div className="row p-2">
          <div className="col-xl-2 col-sm-4 col-md-6 co-12 d-flex">
            <ReactSelect
              name="Package"
              id="Package"
              removeIsClearable
              placeholderName="Package"
              value={payload.Package}
              onChange={handleSelectChange}
              respclass="w-100"
            />
            <button
              className="btnAdd"
              onClick={() =>
                handleModel(
                  "Add New Package",
                  "30vw",
                  "Add New Package",
                  true,
                  <AddNewPackageModal
                    handleChangeModel={handleChangeModel}
                    setIsOpen={setIsOpen}
                  />
                )
              }
            >
              <PlusIcon />
            </button>
          </div>

          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={(e) => searchItems(e.query)}
              className="w-100 required-fields"
              onSelect={handleAutoCompleteSelect}
              id="empName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
            />
            <label htmlFor="searchtest" className="lable searchtest">
              Items
            </label>
          </div>

          <div className="col-sm-2">
            <LabeledInput label="Package Name" value="" />
          </div>

          <div className="col-sm-2">
            <LabeledInput label="Item Name" value="" />
          </div>

          <Input
            type="text"
            lable="Quantity"
            id="Quantity"
            name="Quantity"
            value={payload.Quantity}
            onChange={handleChange}
            className="required-fields"
            respclass="col-xl-2 col-sm-4 col-md-6 co-12"
          />

          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleAddItems}
            >
              Add Items
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th style={{ width: "3%", textAlign: "center" }}>
                    {t("Sr.No.")}
                  </th>
                  <th style={{ width: "7%" }}>{t("ItemID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Qty")}</th>
                  <th style={{ width: "3%", textAlign: "center" }}>{t("#")}</th>
                </tr>
              </thead>
              <tbody>
                {dropDownList.bindindentdetails.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td style={{ width: "7%" }}>{row.itemId}</td>
                    <td>{row.typeName}</td>
                    <td>
                      <input
                        type="text"
                        className="form-control"
                        name="qty"
                        value={row.qty}
                        onChange={(e) =>
                          handleChanges(index, "qty", e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btnAdd"
                        onClick={() => handleRemove(index)}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
      <div className="mt-2  text-right">
        <button
          className=" btn-primary btn-sm px-5 ml-1 custom_save_button required-fields"
          type="submit"
        >
          Save
        </button>
        <button
          className="btn-primary btn-sm px-5 ml-1 custom_save_button required-fields"
          type="submit"
        >
          Reset
        </button>
      </div>
      {handleModelData.isOpen && (
        <Modal
          visible={handleModelData.isOpen}
          setVisible={setIsOpen}
          modalWidth={handleModelData.width}
          Header={t(handleModelData.label)}
          buttonType="submit"
          buttons={handleModelData.extrabutton}
          modalData={handleModelData.modalData}
          setModalData={setModalData}
        >
          {handleModelData.Component}
        </Modal>
      )}
    </>
  );
};

export default StorePackageMaster;
