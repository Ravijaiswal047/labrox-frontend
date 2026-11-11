import React, { useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Heading from "../../../../components/UI/Heading";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import { AutoComplete } from "primereact/autocomplete";
import Tables from "../../../../components/UI/customTable";
import Modal from "../../../../components/ModalComponent/Modal";
import { PackageItemModal } from "./PackageItemModal";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";

function ConsmeItem() {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    CurrentLocation: "",
    Barcode: "",
    Package: "",
    Items: "",
    Manufacture: "",
    MachineID: "",
    PackSize: "",
    IssueTo: "",
  });
  const [InvoiceModal, setInvoiceModal] = useState({
    header: null,
    show: false,
    size: null,
    component: null,
    footer: null,
  });
  const handleSelectChange = (name, value) => {
    console.log("value", value, name);
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
    if (name === "Package") {
      handleModalOpen();
    }
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
    }));
  };
  const handleModalOpen = () => {
    setInvoiceModal({
      show: true,
      header: "Stock Details",
      size: "70vw",
      component: <PackageItemModal />,
      footer: <></>,
    });
  };
 
  return (
    <>
     
      <div className="card">
        <Heading name={"Consume Store Item"} isBreadcrumb={true} />
        <div className="row px-2 pt-2">
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="Current Location"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Barcode"
            id="Barcode"
            name="Barcode"
            value={payload?.Barcode}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-3 d-flex">
            <button className="btn btn-sm btn-success">
              {t("Search Items")}
            </button>
            <button className="btn btn-sm btn-success ml-2">
              {t("Reset")}
            </button>
            <button className="btn btn-sm btn-success ml-2">
              {t("Export To Excel")}
            </button>
          </div>
        </div>
        <div className="row px-2">
          <ReactSelect
            name="Package"
            id="Package"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Dummy", value: "1" },
              { label: "Test", value: "2" },
              { label: "Testing", value: "3" },
            ]}
            placeholderName="Package"
            value={payload?.Package}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 co-12">
            <AutoComplete
              style={{ width: "100%" }}
              //   value={items}
              //   suggestions={Array.isArray(stockShow) ? stockShow : []}
              //   completeMethod={() => search(items)}
              className="w-100"
              //   onSelect={(e) => handleSelectRow(e)}
              id="searchtest"
              //   onChange={(e) => {
              //     const data =
              //       typeof e.value === "object" ? e?.value?.label : e.value;
              //     setItems(data);
              //     search(data);
              //     setPayload((prev) => ({ ...prev, testID: data }));
              //   }}
              //   itemTemplate={itemTemplate}
            />
            <label htmlFor={"searchtest"} className="lable searchtest">
              Items
            </label>
          </div>
          <ReactSelect
            name="Manufacture"
            id="Manufacture"
            removeIsClearable={true}
            // dynamicOptions={SearchOptionList}
            placeholderName="Manufacture"
            value={payload?.Manufacture}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <ReactSelect
            name="MachineID"
            id="MachineID"
            removeIsClearable={true}
            // dynamicOptions={SearchOptionList}
            placeholderName="Machine"
            value={payload?.MachineID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="PackSize"
            id="PackSize"
            removeIsClearable={true}
            // dynamicOptions={SearchOptionList}
            placeholderName="Pack Size"
            value={payload?.PackSize}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="IssueTo"
            id="IssueTo"
            removeIsClearable={true}
            // dynamicOptions={SearchOptionList}
            placeholderName="Issue To"
            value={payload?.IssueTo}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Item Details"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Item ID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Issue Date")}</th>
                  <th>{t("Batch Number")}</th>
                  <th>{t("Expiry Date")}</th>
                  <th>{t("Barcode No")}</th>
                  <th>{t("Current Stock Qty")}</th>
                  <th>{t("Consume Qty")}</th>
                  <th>
                    <input type="text" placeholder={t("All Consume Remarks")} />
                  </th>
                  <th>
                    <input type="checkbox" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="S.No">{index + 1}</td>
                    <td data-title="Item ID">{row?.ItemID}</td>
                    <td data-title="Item Name">{row?.ItemName}</td>
                    <td data-title="Issue Date">{row?.IssueDate}</td>
                    <td data-title="Batch Number">{row?.BatchNumber}</td>
                    <td data-title="Expiry Date">{row?.ExpiryDate}</td>
                    <td data-title="Barcode No">{row?.BarcodeNo}</td>
                    <td data-title="Current Stock Qty">
                      {row?.CurrentStockQty}
                    </td>
                    <td data-title="Consume Qty">{row?.ConsumeQty}</td>
                    <td data-title="Consume Remarks">{row?.ConsumeRemarks}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
      {InvoiceModal?.show && (
        <Modal
          visible={InvoiceModal?.show}
          setVisible={() =>
            setInvoiceModal({
              show: false,
              component: null,
              size: null,
            })
          }
          modalWidth={InvoiceModal?.size}
          Header={InvoiceModal?.header}
          footer={InvoiceModal?.footer}
        >
          {InvoiceModal?.component}
        </Modal>
      )}
    </>
  );
}

export default ConsmeItem;
