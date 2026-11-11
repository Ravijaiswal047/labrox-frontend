import React, { use, useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import { AutoComplete } from "primereact/autocomplete";
import Input from "../../../../components/formComponent/Input";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { CustomButton } from "../../../../components/UI/CustomButton";
import moment from "moment";
import { vendorreturnStatusList } from "../../../../utils/Constants";
import { number } from "../../../../utils/helpers";

const SupplierReturn = () => {
  const { t } = useTranslation();
  const [loctionData, setLocationData] = useState([]);
  const [supplierList, setSupplierList] = useState([]);

  const [tableData, setTableData] = useState([]);

  const initialState = {
    VendorId: "",
    LocationId: "",
    FromDate: new Date(),
    ToDate: new Date(),
    BarcodeNo: "",
    Remarks: "",
    ItemID: "",
    RowColor: "",
  };
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [payload, setPayload] = useState(initialState);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const searchItems = async (query) => {
    const requestBody = {
      itemName: String(query || ""),
      locationidfrom: String(payload?.LocationId || ""),
      searchOption: String(payload?.VendorId || ""),
      itemtype: String(""),
    };
    await axiosInstance
      .post("VendorQuotation/SearchItemWthItemId", {
        ...requestBody,
      })
      .then((res) => {
        const response = res?.data?.message;
        setStockSuggestions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        //toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.ItemNameGroup : e.value;
    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({ ...prev, ItemName: val, ItemID: "" }));
  };

  const handleAutoCompleteSelect = (e) => {
    if (!payload?.LocationId) {
      toast.warn("Please Select Location");
      return;
    }
    const selected = e.value;
    setAutoCompleteVal(selected?.ItemNameGroup);
    setPayload((prev) => ({
      ...prev,
      itemName: selected?.ItemNameGroup,
      ItemID: selected?.ItemID || selected?.ItemIDGroup || "",
    }));
  };
  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.ItemNameGroup}
      </div>
    </div>
  );

  const handleReturnQtyChange = (e, index) => {
    const value = e.target.value;

    setTableData((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (Number(value) > Number(row.inhandQty)) {
          toast.warn("Return Qty cannot be greater than Inhand Qty");

          return {
            ...row,
            returnQty: "",
            isChecked: false
          };
        }

        return {
          ...row,
          returnQty: value,
          isChecked: Number(value) > 0,
        };
      })
    );
  };

  const handleCheckedChange = (e, index) => {
    const checked = e.target.checked;
    setTableData((prev) =>
      prev.map((row, i) =>
        i === index
          ? {
            ...row,
            isChecked: checked,
          }
          : row
      )
    );
  };


  useEffect(() => {
    GetBindCurrentLocaton();
    getSupplierApi();
  }, []);

  const GetBindCurrentLocaton = () => {
    axiosInstance
      .post("StoreCreateSalesIndent/bindalldata")
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
        }));
        setLocationData(newRes);
      })
      .catch(() => console.log("Something went wrong"));
  };

  const getSupplierApi = async () => {
    await axiosInstance
      .get("VendorQuotation/bindsupplier")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setSupplierList(Array.isArray(response) ? response : []);
        } else {
          toast.error("Data not found!");
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  useEffect(() => {
    if (payload?.RowColor) {
      handleSearch(payload.RowColor);
    }
  }, [payload.RowColor]);


  const handleSearch = (status) => {
    if (!payload?.LocationId) {
      toast.warn("Please Select Location");
      return;
    }
    if (!payload?.VendorId) {
      toast.warn("Please Select Supplier");
      return;
    }

    const data = {
      FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      LocationId: Number(payload?.LocationId?.[0]) || 0,
      SupplierId: Number(payload?.VendorId || 0),
      ItemID: String(payload?.ItemID || ""),
      BarcodeNo: (payload?.BarcodeNo || ""),
      //RowColor: status || "",
      RowColor: payload?.RowColor || "",
    };

    axiosInstance
      .post("VendorReturn/SearchData", data)
      .then((res) => {
        const response = res?.data?.message;
        setTableData(response);
      })
      .catch((err) => {
        if (
          err?.response?.status === 400 &&
          Array.isArray(err?.response?.data?.message)
        ) {
          setTableData([]);
          toast.warn("No Record Found");
          return;
        }
        console.log("FULL ERROR:", err);
        console.log("RESPONSE:", err?.response);
        console.log("DATA:", err?.response?.data);
      });
  };


  const handleSave = () => {
    const payloadData = tableData
      .filter((row) => row.isChecked && Number(row.returnQty) > 0)
      .map((row) => ({
        locationId: Number(row?.locationID),
        vendorId: Number(row?.vendorID),
        stockId: Number(row.stockID),
        quantity: Number(row.returnQty),
        ItemID: Number(row.itemID),
        remark: payload?.Remarks || "",
      }));

    if (payloadData.length === 0) {
      toast.warn("Select at least one item");
      return;
    }
    axiosInstance
      .post("VendorReturn/SaveVendorReturn", {
        items: payloadData,
      })
      .then((res) => {
        const response = res?.data?.message;
        if (response) {
          toast.success("Item Return Successfully");
          setTableData([]);
          setPayload({});
        }
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const handleReset = () => {
    setPayload(initialState);
    setTableData([]);
    setAutoCompleteVal("");
    setStockSuggestions([]);


  };


  return (
    <>
      <div className="card">
        <Heading name={"Return Item To Supplier"} isBreadcrumb={true} />
        <div className="row p-2">
          <ReactSelect
            name="LocationId"
            id="LocationId"
            removeIsClearable={true}
            dynamicOptions={loctionData}
            placeholderName="Location"
            value={payload?.LocationId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="VendorId"
            id="VendorId"
            removeIsClearable={true}
            dynamicOptions={supplierList?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            placeholderName="Supplier"
            value={payload?.VendorId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={(e) => searchItems(e.query)} onSelect={handleAutoCompleteSelect}
              id="ItemID"
              name="ItemName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
              field="ItemNameGroup"
            />
            <label htmlFor="ItemsName" className="lable searchtest">
              Items
            </label>
          </div>
          <Input
            type="text"
            lable="Barcode No"
            id="BarcodeNo"
            name="BarcodeNo"
            value={payload?.BarcodeNo}
            onChange={handleChange}
            className="required-fields"
            respclass="col-xl-2 col-sm-4 col-md-6 co-12"
          />
          <div className="col-sm-1 d-flex">
            <CustomButton
              text={"Search"}
              icon={"search"}
              className="mr-2"
              onClick={handleSearch}
            />
            <CustomButton
              text={"Reset"}
              icon={"refresh"}
              onClick={handleReset}
            />
          </div>
        </div>

        {tableData?.length > 0 && (
          <div className="row p-2">
            <Input
              type="text"
              lable="Remarks"
              id="Remarks"
              name="Remarks"
              value={payload?.Remarks}
              onChange={handleChange}
              className="required-fields"
              respclass="col-xl-2 col-sm-4 col-md-6 co-12"
            />
            <div className="col-sm-1 d-flex">
              <CustomButton
                text={"Save"}
                icon={"save"}
                onClick={handleSave}
              />
            </div>
          </div>
        )}

        <div className="row pt-1 pl-3 pr-2">
          {vendorreturnStatusList.map((ele, i) => {
            return (

              <div
                className="d-flex mr-2 mb-2 pt-1 shadow-sm rounded border hover-shadow"
                style={{
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                  backgroundColor:
                    payload.RowColor === ele.labelKey
                      ? "#d0ebff"
                      : "#ffffff",
                }}
                onClick={() => {
                  setPayload({
                    ...payload,
                    RowColor: ele.labelKey,
                  });
                }}
              >
                <button
                  className={`mb-3 mt-2 ml-2 p-2 border-0 SRStatus-${ele.value}`}
                  key={ele.value}
                ></button>

                <label className="ml-2 pt-1 pr-2 d-flex">
                  {ele.label}
                </label>
              </div>
            )

          })}
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={t("Return Item List")} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th style={{ width: "3%" }}>{t("Sr.No.")}</th>
                  <th>{t("Purchase Date")}</th>
                  <th>{t("Stockid")}</th>
                  <th>{t("Item Type")}</th>
                  <th>{t("Item ID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("BarcodeNo")}</th>
                  <th>{t("Batch Number")}</th>
                  <th>{t("Expiry Date")}</th>
                  <th>{t("Purchase Qty")}</th>
                  <th>{t("Purchase Unit")}</th>
                  <th>{t("Converter")}</th>
                  <th>{t("Inhand Qty")}</th>
                  <th>{t("Consume Unit")}</th>
                  <th>{t("Return Qty")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("Disc Amt")}</th>
                  <th>{t("Tax Amt")}</th>
                  <th>{t("Unit Price")}</th>
                  <th>{t("Cheked")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index} style={{ backgroundColor: row.rowColor }}>
                    <td>{index + 1}</td>
                    <td>{row.purchaseDate}</td>
                    <td>{row.stockID}</td>
                    <td>{row.categoryTypeName}</td>
                    <td>{row.itemID}</td>
                    <td>{row.itemName}</td>
                    <td>{row.barcodeNo}</td>
                    <td>{row.batchNumber}</td>
                    <td>{row.expiryDate}</td>
                    <td>{row.purchaseQty}</td>
                    <td>{row.majorUnit}</td>
                    <td>{row.converter}</td>
                    <td>{row.inhandQty}</td>
                    <td>{row.minorUnit}</td>
                    <td>
                      <Input
                        type="number"
                        value={row.returnQty || ""}
                        onChange={(e) => handleReturnQtyChange(e, index)}
                        min={0}
                        max={row.inhandQty}
                      />
                    </td>
                    <td>{row.rate}</td>
                    <td>{row.discountAmount}</td>
                    <td>{row.taxAmount}</td>
                    <td>{row.unitPrice}</td>
                    <td>
                      <input type="checkbox"
                        checked={row.isChecked}
                        onChange={(e) => handleCheckedChange(e, index)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplierReturn;
