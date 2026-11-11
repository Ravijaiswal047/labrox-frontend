import React, { use, useEffect, useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import DatePicker from "../../../../components/formComponent/DatePicker";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import TextAreaInput from "../../../../components/formComponent/TextAreaInput";
import Input from "../../../../components/formComponent/Input";
import { useTranslation } from "react-i18next";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import {
  getBindCentreNew,
  getBindCentreType,
  getBindCity,
  getBindCountry,
  getBindstate,
  GetZoneData,
  getBindLocation,
} from "../../../../utils/NetworkApi/commonApi"; import { CustomButton } from "../../../../components/UI/CustomButton";
import moment from "moment";
import { toast } from "react-toastify";
;

const PurchaseOrderAgainstPI = () => {
  const { t } = useTranslation();
  const [supplierList, setSupplierList] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [PurchaseIndentList, setPurchaseIndentList] = useState([]);

  const initialState = {
    Category: "",
    FromDate: new Date(),
    ToDate: new Date(),
    VendorId: "",
    CentreType: [],
    CountryId: "",
    StateId: [],
    LocationId: [],
    PendingPI: [],
    PaymentTerm: "1",
    DeliveryTerm: "1",
    Warranty: "",
    NFANo: "",
    TermCondition: "",
    DeliveryInstruction: "",
    PurchaseIndentList: [],
    IndentNo: "",
    OtherPaymentTerm: "",
    OtherDeliveryTerm: "",
  };
  console.log("InitialState", initialState);

  const [dropDownApis, setDropDownApis] = useState({
    centretypebind: [],
    countrybind: [],
    statebind: [],
    centrebind: [],
    BusinessZoneId: [],
    locationbind: [],
    PurchaseIndentList: []

  });

  console.log("DropDownApis", dropDownApis);

  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState(initialState);
  const handlePayloadMultiSelectNumbers = (data, key = "code") => {
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => Number(item?.[key]))
      .filter((num) => !isNaN(num));
  };

  const handleSelectChange = (name, value) => {
    const selectedValue = value?.value || "";

    if (name === "CountryId") {
      const newPayload = {
        CountryId: selectedValue,
        BusinessZoneId: [],
        StateId: [],
        LocationId: [],
        CentreId: ""
      };

      setPayload((prev) => ({
        ...prev,
        ...newPayload
      }));

      // Load Zones
      GetZoneData(selectedValue, (data) => {
        setDropDownApis((prev) => ({
          ...prev,
          BusinessZoneId: data,
          statebind: [],
          locationbind: []
        }));
      });

    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: selectedValue
      }));
    }
  };
  const handleChange = (e) => {

    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const handleSelectMultiChange = (name, select) => {
    if (name === "BusinessZoneId") {

      const zoneIds = handlePayloadMultiSelectNumbers(select);

      setPayload((prev) => ({
        ...prev,
        BusinessZoneId: select,
        StateId: [],
        LocationId: []
      }));

      getBindstate(
        payload?.CountryId,
        zoneIds,
        (data) => {
          setDropDownApis((prev) => ({
            ...prev,
            statebind: data,
            locationbind: []
          }));
        }
      );
    }
    if (name === "StateId") {
      const stateIds = handlePayloadMultiSelectNumbers(select);

      setPayload((prev) => ({
        ...prev,
        StateId: select,
        LocationId: []
      }));

      getBindLocation(
        "",
        stateIds,
        "",          // typeId
        "",          // countryid
        "",          // cityId
        (data) => {
          setDropDownApis((prev) => ({
            ...prev,
            locationbind: data
          }));
        }
      );
    }

    if (name === "LocationId") {
      const locationIds = handlePayloadMultiSelectNumbers(select);
      setPayload((prev) => ({
        ...prev,
        LocationId: select
      }));
      getPendingPI(
        locationIds, (message) => {
          setDropDownApis((prev) => ({
            ...prev,
            PurchaseIndentList: message,
          }));
        })
    }
    if (name === "PendingPI") {
      setPayload((prev) => ({
        ...prev,
        PendingPI: select
      }));
    }


  };


  const getPendingPI = (locationIds, callback) => {
    axiosInstance
      .post("/POAgainstPI/BindPendingPI", {
        LocationId: locationIds,
      })
      .then((res) => {
        const { success, message } = res?.data || {};
        if (success && Array.isArray(message)) {
          callback(message);
        } else {
          callback([]);
          toast.error(message || "No Data Found.");
        }
      })
      .catch((err) => {
        console.error(err);
        callback([]);
        toast.error(
          err?.response?.data?.message || "Something Went Wrong!"
        );
      });
  };
  useEffect(() => {
    getBindCentreType((data) => {
      setDropDownApis((prev) => ({ ...prev, centretypebind: data }));
    });

    getBindCountry((data) => {
      setDropDownApis((prev) => ({ ...prev, countrybind: data }));
    });

  }, []);

  useEffect(() => {
    getSupplierApi();
    Bindcategorytypes();
  }, []);

  const Bindcategorytypes = () => {
    axiosInstance
      .get("StoreCreateSalesIndent/categorytypes")
      .then((res) => {
        const response = res?.data?.message;
        const newRes = response?.map((ele) => ({
          label: ele?.name,
          value: ele?.id,
        }));
        setCategoryList(newRes);
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

  const getCodes = (arr) => {
    if (!Array.isArray(arr)) return "";
    return arr.map((item) => item.code).join(",");
  };

  const handleSearch = () => {
    const data = {
      FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      VendorID: (payload?.VendorId || "").toString(),
      CentreLocation: handlePayloadMultiSelectNumbers(payload?.LocationId || "").toString(),
      IndentNo: (payload?.IndentNo || "").toString(),
      PendingPI: payload?.PendingPI?.map(item => item.indentno).join(","),
      //ItemCate: (payload?.Category || "").toString(),
      CentreType: handlePayloadMultiSelectNumbers(payload?.CentreType || "").toString(),
      CountryId: (payload?.CountryId || "").toString(),
      StateId: handlePayloadMultiSelectNumbers(payload?.StateId || "").toString(),
      ZoneId: handlePayloadMultiSelectNumbers(payload?.BusinessZoneId || "").toString(),
      Centre: "",
      Manufacture: "",
      SubCategory: "",
      Machine: "",
      ItemType: "",
      ItemIDGroup: "",
      CategoryType: (payload?.Category || "").toString(),

    };
    axiosInstance
      .post("POAgainstPI/bindData", data)
      .then((res) => {
        const response = res?.data?.message;
        setTableData(response || []);
      })
      .catch((err) => {
        console.log(err);
        console.log("Something went wrong");
      });
  };


  const handleApprovedQty = (index, key, value) => {
    const updatedData = [...tableData];
    updatedData[index] = {
      ...updatedData[index],
      [key]: value
    };
    setTableData(updatedData);
  };

  const handlelAllCheckbox = (e) => {
    const checked = e.target.checked;
    setTableData((prev) =>
      prev.map((row) => ({
        ...row,
        checkbox: checked,
        isUpdated: true
      }))
    );
  };

  const handleRowChange = (e, index) => {
    const { name, value, type, checked } = e.target;
    setTableData((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = {
        ...updatedData[index],
        [name]: type === "checkbox" ? checked : value,
        isUpdated: true
      };
      return updatedData;
    });
  };

  const MakePo = () => {
    const selectedRows = tableData.filter((row) => row.checkbox);
    if (selectedRows.length === 0) {
      toast.error("Please Check at least one Item");
      return;
    }
    const data = {
      poMasterList: selectedRows.map((row, index) => ({
        purchaseOrderID: 0,
        purchaseOrderNo: "",
        subject: row.Narration || "",
        vendorID: row.VendorID || 0,
        vendorName: row.SupplierName || "",
        status: 0,
        statusName: "",
        locationID: row.FromLocationID,
        indentNo: row.IndentNo,
        vendorStateId: row.VendorStateId || 0,
        vendorGSTIN: row.VednorStateGstnno || "",
        vendorAddress: row.SupplierAddress || "",
        vendorLogin: row.IsLoginRequired || 0,
        poType: "",
        actionType: "",
        warranty: "",
        nfaNo: "",
        termandcondition: row.Narration || "",
        itemID: row.ItemID,
        itemName: row.ItemName,
        manufactureID: row.ManufactureID,
        manufactureName: row.Manufacture,
        catalogNo: row.CatalogNo || "",
        machineID: row.MachineID,
        machineName: row.MachineName || "",
        majorUnitId: row.MajorUnitId,
        majorUnitName: row.MajorUnitName,
        packSize: row.PackSize,
        orderedQty: row.ApprovedQty,
        discountPercentage: row.DiscountPer || 0,
        isFree: 0,
        rate: row.Rate || 0,
        taxAmount: row.TaxPer || 0,
        discountAmount: row.DiscAmt || 0,
        unitPrice: row.UnitPrice || 0,
        netAmount: row.NetAmount || 0,
        sapLineNo: 0,
        taxPerCGST: row.TaxPerCGST || 0,
        taxPerIGST: row.TaxPerIGST || 0,
        taxPerSGST: row.TaxPerSGST || 0,
        tableSNo: index + 1,
        checkedDate: new Date().toISOString(),
        checkedByID: 0,
        checkedByName: "",
        approvedDate: new Date().toISOString(),
        approvedByID: 0,
        appprovedByName: ""
      })),
      term: (payload.PaymentTerm || "").toString(),
      deliveryTerm: payload?.DeliveryTerm?.toString() || "0",
      termID: payload.OtherPaymentTerm || 0,
      deliveryTermID: payload.OtherDeliveryTerm || 0,
      headerInstruction: payload?.DeliveryInstruction
    };
    axiosInstance
      .post("POAgainstPI/SavePurchaseOrder", data)
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;

        if (status) {
          toast.success(response);
        } else {
          toast.error(response);
        }
        setPayload({});
        setTableData([]);
      })
      .catch((err) => {
        console.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const paymentTermOptions = [
    { label: "100% Payment  within 30 days of delivery and submission of invoice with delivery acknowledgement", value: "1" },
    { label: "Other", value: "2" },
  ];

  const delveryTermOptions = [
    { label: "Other", value: "1" },
  ];

  return (
    <>
      <div className="card">
        <Heading
          name={"Purchase Order Against Purchase Indent"}
          isBreadcrumb={true}
        />
        <div className="row p-2">
          <ReactSelect
            name="Category"
            id="Category"
            removeIsClearable={true}
            dynamicOptions={categoryList}
            // dynamicOptions={[
            //   { label: "Opex", value: "Opex" },
            //   { label: "Capex", value: "Capex" },
            //   { label: "Both", value: "Both" },
            // ]}
            placeholderName="Category"
            value={payload?.Category}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            name="ToDate"
            id="ToDate"
            value={payload?.ToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("TO Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            lable="Indent No."
            id="IndentNo"
            name="IndentNo"
            value={payload.IndentNo}
            onChange={handleChange}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
          <ReactSelect
            name="VendorId"
            id="VendorId"
            removeIsClearable={true}
            dynamicOptions={supplierList?.map((ele) => ({
              label: ele?.name,
              value: ele?.id,
            }))}
            placeholderName="Vendor"
            value={payload?.VendorId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Centre Type"
            name="CentreType"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.centretypebind}
            labelKey="type"
            valueKey="id"
            onChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="CountryId"
            id="CountryId"
            removeIsClearable={true}
            dynamicOptions={dropDownApis?.countrybind?.map((ele) => ({
              value: ele?.CountryID,
              label: ele?.CountryName,
            }))}
            placeholderName="Country"
            value={payload?.CountryId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-m d-6 co-12"}
          />
          <div className="col-xl-2 col-sm-4 col-md-6 col-12">
            <MultiSelctItems
              placeholderName="BusinessZone"
              name="BusinessZoneId"
              values={payload}
              setValues={setPayload}
              dynamicOptions={dropDownApis?.BusinessZoneId}
              labelKey="BusinessZoneName"
              valueKey="BusinessZoneID"
              handleChange={handleSelectMultiChange}
              respclass={""}
            />

          </div>
          <MultiSelctItems
            placeholderName="State"
            name="StateId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.statebind}
            labelKey="stateName"
            valueKey="id"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Location"
            name="LocationId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.locationbind}
            labelKey="Location"
            valueKey="LocationID"
            handleChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Pending PI"
            name="PendingPI"
            values={payload}
            setValues={setPayload}
            dynamicOptions={dropDownApis?.PurchaseIndentList}
            labelKey="indentno"
            valueKey="indentno"
            onChange={handleSelectMultiChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Terms & Conditions"} isBreadcrumb={true} />
        <div className="row p-2">
          <ReactSelect
            name="PaymentTerm"
            id="PaymentTerm"
            removeIsClearable={true}
            dynamicOptions={paymentTermOptions}
            placeholderName="Payment Term"
            value={payload?.PaymentTerm}
            onChange={handleSelectChange}
            respclass={"col-xl-6 col-sm-4 col-md-6 col-12"}
          />
          {payload?.PaymentTerm === "2" && (
            <Input
              type="text"
              lable="Enter Payment Term"
              id="OtherPaymentTerm"
              name="OtherPaymentTerm"
              value={payload.OtherPaymentTerm}
              onChange={handleChange}
              respclass="col-xl-2 col-sm-4 col-md-6 col-12"
            />
          )}
          <ReactSelect
            name="DeliveryTerm"
            id="DeliveryTerm"
            removeIsClearable={true}
            dynamicOptions={delveryTermOptions}
            placeholderName="Delivery Term"
            value={payload?.DeliveryTerm}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          {payload?.DeliveryTerm === "1" && (
            <Input
              type="text"
              lable="Enter Delivery Term"
              id="OtherDeliveryTerm"
              name="OtherDeliveryTerm"
              value={payload.OtherDeliveryTerm}
              onChange={handleChange}
              respclass="col-xl-2 col-sm-4 col-md-6 col-12"
            />
          )}
          <Input
            type="text"
            lable="Warranty"
            id="Warranty"
            name="Warranty"
            value={payload.Warranty}
            onChange={handleChange}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
          <Input
            type="number"
            lable="NFA No"
            id="NFANo"
            name="NFANo"
            value={payload.NFANo}
            onChange={handleChange}
            respclass="col-xl-2 col-sm-4 col-md-6 col-12"
          />
          <TextAreaInput
            name={"TermCondition"}
            id={"TermCondition"}
            lable={"Term & Condition"}
            value={payload?.TermCondition}
            rows={1}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
          <TextAreaInput
            name={"DeliveryInstruction"}
            id={"DeliveryInstruction"}
            lable={"Delivery Instruction"}
            value={payload?.DeliveryInstruction}
            rows={1}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12 customeClass"}
          />
        </div>
      </div>

      <div className="mt-2  text-right d-flex justify-content-end">
        <p
          className="text-danger text-center mr-3"
          style={{ fontStyle: "italic" }}
        >
          * Yellow Marked Item Reject Earlier
        </p>
        <CustomButton
          text="Search"
          icon="search"
          className=" btn-primary btn-sm px-5 ml-1 custom_save_button required-fields"
          type="submit"
          onClick={handleSearch}
        />
        <CustomButton
          text="Make PO"
          className="btn-primary btn-sm px-5 ml-1 custom_save_button required-fields"
          type="submit"
          onClick={MakePo}
        />
        {/* <CustomButton
          text="Update Rate"
          className="btn-primary btn-sm px-5 ml-1 custom_save_button required-fields"
          type="submit"
        >
          Update Rate
        </CustomButton>
        <CustomButton
          text="Reject"
          className="btn-primary btn-sm px-5 ml-1 custom_save_button required-fields"
          type="submit"
        >
          Reject
        </CustomButton> */}
      </div>
      <div className="card">
        <Heading name={"Purchase Indent Details"} isBreadcrumb={true} />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("S.No.")}</th>
                  <th>
                    <input
                      type="checkbox"
                      checked={tableData.length > 0 && tableData.every(row => row.checkbox)}
                      onChange={handlelAllCheckbox}
                    />
                  </th>
                  <th>{t("Indent No.")}</th>
                  {/* <th>{t("Supplier Name")}</th> */}
                  <th>{t("Location")}</th>
                  <th>{t("ItemID")}</th>
                  <th>{t("Item Name")}</th>
                  <th>{t("Manufacturer")}</th>
                  <th>{t("PackSize")}</th>
                  <th>{t("PurchaseUnit")}</th>
                  <th>{t("Narration")}</th>
                  <th>{t("Rate")}</th>
                  <th>{t("Disc(%)")}</th>
                  <th>{t("Tax(%)")}</th>
                  <th>{t("UnitPrice")}</th>
                  <th>{t("Qty.")}</th>
                  <th>{t("NetAmt.")}</th>
                  {/* <th>{t("#")}</th> */}
                  <th>{t("#")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <input
                        type="checkbox"
                        name="checkbox"
                        checked={row?.checkbox || false}
                        onChange={(e) => handleRowChange(e, index)}
                      />
                    </td>
                    <td>{row.IndentNo}</td>
                    {/* <td>{row.SupplierName}</td> */}
                    <td>{row.Location}</td>
                    <td>{row.ItemID}</td>
                    <td>{row.ItemName}</td>
                    <td>{row.Manufacture}</td>
                    <td>{row.PackSize}</td>
                    <td>{row.PurchaseUnit}</td>
                    <td>{row.Narration}</td>
                    <td>{row.Rate}</td>
                    <td>{row.DiscountPer}</td>
                    <td>{row.TaxPer}</td>
                    <td>{row.UnitPrice}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        name="ApprovedQty"
                        value={row.ApprovedQty}
                        onChange={(e) =>
                          handleApprovedQty(index, "ApprovedQty", Number(e.target.value))
                        }
                      />
                    </td>
                    <td>{row.NetAmount}</td>
                    {/* <td>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleConfirm(index)}
                      >
                        ✅
                      </button>
                    </td> */}
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
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
    </>
  );
};

export default PurchaseOrderAgainstPI;
