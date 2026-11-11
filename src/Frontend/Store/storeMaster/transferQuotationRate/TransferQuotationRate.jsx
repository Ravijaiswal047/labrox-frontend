import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Heading from "../../../../components/UI/Heading";
import Accordion from "../../../../components/UI/Accordion";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Input from "../../../../components/formComponent/Input";
import { RefreshIcon } from "../../../../components/SvgIcons";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../../../components/UI/customTable";
import { axiosInstance } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const TransferQuotationRate = () => {
  const { t } = useTranslation();
  const initialState = {
    FromLocation: "",
    MachineId: "",
    Supplier: "",
    ToLocation: "",
    ChangeSupplier: "",
    ToSupplier: "",
    SupplierState: "",
    GSTNNO: "",
    Address: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [ChangeSupplier, setChangeSupplier] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [FromLocation, setFromLocation] = useState([]);
  const [MachineId, setMachineId] = useState([]);
  const [SupplierId, setSupplierId] = useState([]);
  const [supplierchange, setsupplierchange] = useState([]);
  const [tolocation, settolocation] = useState([]);
  const [selectedStateList, setSelectedStateList] = useState([]);

  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;
  const handleSelectChange = (name, value) => {
    if (name === "FromLocation") {
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
      SearchFromRecords(value?.value, payload?.MachineId, payload?.Supplier);
    } else if (name === "ToSupplier") {
      SupplierStatechadngeApi(value?.value);
      setPayload((prev) => ({ ...prev, [name]: value?.value }));
    } else if (name === "ToState") {
      setPayload((prev) => ({
        ...prev,
        SupplierState: value?.value,
        GSTNNO: value?.GSTNNO,
        SupplierType: value?.SupplierType,
        Address: value?.Address,
      }));
    } else {
      setPayload((prev) => ({
        ...prev,
        [name]: value?.value,
      }));
    }
  };

  const handleSelectMultiChange = (name, select) => {
    if (name === "MachineId") {
      setPayload((prev) => ({ ...prev, [name]: select }));
      SearchFromRecords(payload?.FromLocation, select, payload?.Supplier);
    } else if (name === "Supplier") {
      setPayload((prev) => ({ ...prev, [name]: select }));
      SearchFromRecords(payload?.FromLocation, payload?.MachineId , select);
    } else {
      setPayload((prev) => ({ ...prev, [name]: select }));
    }
  };
  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    if (type === "checkbox" && name === "ChangeSupplier") {
      setChangeSupplier(!checked);
    } else {
      const { value } = e.target;
      setPayload((prev) => ({ ...prev, [name]: value }));
    }
  };
console.log({payload})
  const bindlocationApi = async () => {
    await axiosInstance
      .get("TransferQuotationRate/bindlocation")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setFromLocation(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const bindmachineApi = async () => {
    await axiosInstance
      .get("TransferQuotationRate/bindmachine")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setMachineId(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const bindsupplierApi = async () => {
    await axiosInstance
      .get("TransferQuotationRate/bindsupplier")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setSupplierId(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const bindsupplierchangeApi = async () => {
    await axiosInstance
      .get("TransferQuotationRate/bindsupplierchange")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setsupplierchange(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const bindsupplierchadngeApi = async () => {
    await axiosInstance
      .get("TransferQuotationRate/bindtolocation")
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          settolocation(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const SupplierStatechadngeApi = async (id) => {
    const requstBody = {
      vendorid: String(id),
    };

    await axiosInstance
      .post("/VendorQuotation/bindvendorgstndata", requstBody)
      .then((res) => {
        const data = res?.data?.message;
        const success = res?.data?.success;
        if (success && Array.isArray(data)) {
          const supplierStateArray = data.map((ele) => {
            const parts = ele.stateid?.split("#") || [];
            return {
              value: parts[0],
              label: ele.state,
              GSTNNO: parts[1] || "",
              SupplierType: parts[2] || "",
              Address: parts[3] || "",
            };
          });
          setSelectedStateList(supplierStateArray);
          if (data?.length > 0) {
            setPayload((prev) => ({
              ...prev,
              GSTNNO: supplierStateArray[0]?.GSTNNO,
              Address: supplierStateArray[0]?.Address,
              SupplierState: data[0]?.stateid?.split("#")?.[0],
              ToStateChangeId: supplierStateArray[0]?.value,
              ToStateChangeName: supplierStateArray[0]?.label,
            }));
          }
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong"
        );
      });
  };
  const SearchFromRecords = async (locationId, machineId, SupplierId) => {
    const machineIdData = Array.isArray(machineId) && machineId?.map(item => item.code).join(",");
    const SupplierIdData = Array.isArray(SupplierId) && SupplierId?.map(item => item.code).join(",");
    const requestBody = {
      locationid: String(locationId || ""),
      machineid: String(machineIdData || ""),
      supplier: String(SupplierIdData || ""),
    };
    await axiosInstance
      .post("TransferQuotationRate/SearchFromRecords", requestBody)
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          setTableData(Array.isArray(response) ? response : []);
        }
      })
      .catch((err) => {
        setTableData([])
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  const TransferRateApi = async (id) => {
    if (payload?.FromLocation === "") {
      return toast.warn("Please Select From Location");
    }
    const machineidStr = Array.isArray(payload?.MachineId) ? payload?.MachineId?.map((id) => id.code).join(",") :"";
    const SupplierIdStr = Array.isArray(payload?.Supplier) ? payload?.Supplier?.map((id) => id.code).join(",") :"";
    const ToSupplierName = payload?.ToSupplier ? payload?.ToSupplier?.split("~")[1]?.trim() :"";
    const tableDataItemid =  tableData.map((ele) => ele?.itemid).join(",");
    const requestBody = {
      locationid: String(payload?.FromLocation|| ""),
      machineid: machineidStr || "",
      supplier: SupplierIdStr || "",
      tolocation: String(payload?.ToLocation),
      tosupplier: String(payload?.ToSupplier || ""),
      tosuppliername: supplierchange?.find((ele)=>ele?.id==payload?.ToSupplier)?.name || "",
      tostate: String(payload?.ToStateChangeId || ""),
      tostatename: String(payload?.ToStateChangeName || ""),
      tosupplieraddress: String(payload?.Address || ""),
      togstn: String(payload?.GSTNNO || ""),
      itemidtosave: tableDataItemid || "",
    };
    await axiosInstance
      .post("TransferQuotationRate/TransferRateRecords", requestBody)
      .then((res) => {
        const response = res?.data?.message;
        const status = res?.data?.success;
        if (status) {
          toast.success(response);
          reset()
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const reset = () => {
    setPayload(initialState);
    setTableData([]);
  };
  useEffect(() => {
    bindlocationApi();
    bindmachineApi();
    bindsupplierApi();
    bindsupplierchangeApi();
    bindsupplierchadngeApi();
  }, []);

  return (
    <>
      <Accordion
        name={t("Transfer Quotation Rate From Location")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row mt-2">
          <div className="col-sm-5">
            <Heading title={"From Location"} />
            <div className="row p-2">
              <ReactSelect
                name="FromLocation"
                id="FromLocation"
                removeIsClearable={true}
                dynamicOptions={FromLocation.map((ele) => ({
                  label: ele?.name,
                  value: ele?.id,
                }))}
                placeholderName="From Location"
                value={payload?.FromLocation}
                onChange={handleSelectChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
              />
              <MultiSelctItems
                placeholderName="Machine"
                name="MachineId"
                values={payload}
                setValues={setPayload}
                dynamicOptions={MachineId}
                handleChange={handleSelectMultiChange}
                labelKey="name"
                valueKey="id"
                respclass={"col-xl-4 col-sm-4 col-md-6 col-12"}
              />
              <MultiSelctItems
                placeholderName="Supplier"
                name="Supplier"
                values={payload}
                setValues={setPayload}
                dynamicOptions={SupplierId.map((ele) => ({
                  label: ele.supplierCode
                    ? `${ele.supplierCode} ~ ${ele.name} `
                    : ele.name,
                  value: ele.id,
                }))}
                labelKey="label"
                valueKey="value"
                respclass={"col-xl-4 col-sm-4 col-md-6 col-12"}
                handleChange={handleSelectMultiChange}
              />
            </div>
            <div className="row">
              <ul>
                <li style={{ fontStyle: "italic", color: "red" }}>
                  Only Set Rate Quotation Transfer
                </li>
                <li style={{ fontStyle: "italic", color: "red" }}>
                  Check Change Supplier CheckBox and Then Select Supplier if You
                  Want To Change Supplier
                </li>
              </ul>
            </div>
          </div>
          <div className="col-sm-2 text-center">
            {/* <div className="row"> */}
          <duv onClick={TransferRateApi}>
              {/* <Add/> */}
          </duv>
            <br />
            <div
              className="border border-dark p-1 d-inline-block mt-1"
              onClick={reset}
            >
              <RefreshIcon />
            </div>
            {/* </div> */}
          </div>
          <div className="col-sm-5">
            <Heading title={"To Location"} />
            <div className="row px-2 pt-2">
              <ReactSelect
                name="ToLocation"
                id="ToLocation"
                removeIsClearable={true}
                dynamicOptions={tolocation.map((ele) => ({
                  label: ele?.name,
                  value: ele?.id,
                }))}
                placeholderName="To Location"
                value={payload?.ToLocation}
                onChange={handleSelectChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
              />
              <div className="col-xl-4 col-sm-4 col-md-6 co-12 d-flex">
                {/* <RadioInput
                  inputType="checkbox"
                  id="ChangeSupplier"
                  name="ChangeSupplier"
                  checked={ChangeSupplier === false}
                  onChange={handleChange}
                /> */}
                <Form.Check
                  type="switch"
                  id="ChangeSupplier"
                  name="ChangeSupplier"
                  checked={ChangeSupplier === false}
                  onChange={(e) => handleChange(e)}
                  className="m-0"
                />
                <ReactSelect
                  name="ToSupplier"
                  id="ToSupplier"
                  removeIsClearable={true}
                  dynamicOptions={supplierchange.map((ele) => ({
                    label: ele.supplierCode
                      ? `${ele.supplierCode} ~ ${ele.name}`
                      : ele.name,
                    value: ele?.id,
                  }))}
                  placeholderName="To Supplier"
                  value={payload?.ToSupplier}
                  onChange={handleSelectChange}
                  respclass={"w-100"}
                  isDisabled={ChangeSupplier}
                />
              </div>
              <ReactSelect
                name="ToState"
                id="ToState"
                removeIsClearable={true}
                dynamicOptions={selectedStateList?.map((ele) => ({
                  label: ele?.label,
                  value: ele?.value,
                  GSTNNO: ele?.GSTNNO,
                  Address: ele?.Address,
                }))}
                placeholderName="State"
                value={payload?.SupplierState}
                onChange={handleSelectChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
                isDisabled={ChangeSupplier}
              />
              <Input
                type="number"
                placeholder=" "
                lable={t(DefaultCurrencyName == "INR" ? "GSTN" : "Tax")}
                id="GSTNNo"
                name="GSTNNo"
                value={payload?.GSTNNO}
                onChange={handleChange}
                respclass={"col-xl-4 col-sm-4 col-md-6 co-12"}
                disabled={ChangeSupplier}
              />
              <Input
                type="text"
                placeholder=" "
                lable="Address"
                id="Address"
                name="Address"
                value={payload?.Address}
                onChange={handleChange}
                respclass={"col-xl-8 col-sm-4 col-md-6 co-12"}
                disabled={ChangeSupplier}
              />
            </div>
          </div>
        </div>
        <div className="row d-flex justify-content-center pb-2">
          <div className="col-sm-1">
            <button
              className="btn btn-sm btn-success"
              onClick={TransferRateApi}
            >
              Transfer Rate
            </button>
          </div>
        </div>
      </Accordion>
      <Heading
        title={t("Quotation Detail")}
        secondTitle={
          <>
            <ColorCodingSearch
              color={"#FFC0CB"}
              label={t("Rate Not Set")}
            />
            <ColorCodingSearch
              color={"#90EE90"}
              label={t("Rate Set")}
            />
          </>
        }
      />
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th>{t("#")}</th>
                <th>{t("Vendor Name")}</th>
                <th>{t("Vednor State Name")}</th>
                <th>{t("Machine Name")}</th>
                <th>{t("Item Name")}</th>
                <th>{t("itemid")}</th>
                <th>{t("Rate")}</th>
                <th>{t("Discount Per")}</th>
                <th>{t("Discount Amt")}</th>
                 <th>{t(DefaultCurrencyName == "INR" ? "IGST Per" : "Tax")}</th>
                 <th>{t(DefaultCurrencyName == "INR" ? "SGST Per" : "Tax")}</th>
                 <th>{t(DefaultCurrencyName == "INR" ? "CGST Per" : "Tax")}</th>
                <th>{t(DefaultCurrencyName == "INR" ? "GST Amount" : "Tax Amount")}</th>
                <th>{t("FinalPrice")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((row, index) => (
                <tr key={index}>
                  <td data-title="#">
                    <input
                      type="checkbox"
                      name="ComparisonStatus"
                      checked={row?.ComparisonStatus === 1}
                      readOnly
                    />
                  </td>
                  <td data-title="Supplier State">{row?.vendorname}</td>
                  <td data-title="Machine Name">{row?.VednorStateName}</td>
                  <td data-title="Item ID">{row?.MachineName}</td>
                  <td data-title="Item Name">{row?.ItemName}</td>
                  <td data-title="Item Name">{row?.itemid}</td>
                  <td data-title="Rate">{row?.Rate}</td>
                  <td data-title="Discount Per">{row?.DiscountPer}</td>
                  <td data-title="Discount Amt">{row?.DiscountAmt}</td>
                  <td data-title="IGST Per">{row?.IGSTPer}</td>
                  <td data-title="SGST Per">{row?.SGSTPer}</td>
                  <td data-title="CGST Per">{row?.CGSTPer}</td>
                  <td data-title="GST Amount">{row?.GSTAmount}</td>
                  <td data-title="Buy Price">{row?.FinalPrice}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default TransferQuotationRate;
