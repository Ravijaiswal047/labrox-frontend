import React, { useState } from "react";
import MultiSelctItems from "../../../../components/formComponent/MultiSelctItems";
import Accordion from "../../../../components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { AutoComplete } from "primereact/autocomplete";
import RadioInput from "../../../../components/formComponent/RadioInput";
import Tables from "../../../../components/UI/customTable";
import Heading from "../../../../components/UI/Heading";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import { useEffect } from "react";
import { axiosInstance, axiosReport } from "../../../../utils/axiosInstance";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import Modal from "../../../../components/ModalComponent/Modal";
import ShowDetailitem from "../vendorQuotation/ShowDetailitem";
import ShowDetailsModel from "../vendorQuotation/ShowDetailsModel";
import { CustomButton } from "../../../../components/UI/CustomButton";
import { useLocalStorage } from "../../../../utils/hooks/useLocalStorage";

const VendorQuotationComparison = () => {
  const { t } = useTranslation();
    
  const userData = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userData?.DefaultCurrencyName;

  const initialState = {
    CentreId: "",
    StateId: "",
    LocationId: "",
    SearchOption: "",
    Items: "",
    ManufactureID: "",
    MachineID: "",
    PackSize: "",
    OnlySetRate: 0,
    ItemID: "",
  };
  const [payload, setPayload] = useState(initialState);
  console.log("payload", payload);
  const [tableData, setTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value}));
  };
  // const handleChange = (e) => {

  //   const { name, value } = e.target;
  //     console.log("check",name,value);
  //   setPayload((prev) => ({ ...prev, [name]: value }));
  // };
  const [handleModelData, setHandleModelData] = useState({});
  const [modalData, setModalData] = useState({});
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
      label: label,
      width: width,
      type: type,
      isOpen: isOpen,
      Component: Component,
      handleInsertAPI: handleInsertAPI,
      extrabutton: extrabutton ? extrabutton : <></>,
    });
  }; 

  const handleChangeModel = (data) => {
    setModalData(data);
  };

  const OnChangeTax = (index, newGstntax) => {
    setTableData((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, gstntax: newGstntax } : row
      )
    );
    setHandleModelData({ isOpen: false });
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const finalValue = type === "checkbox" ? (checked ? 1 : 0) : value;
    setPayload((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleAutoCompleteSelect = (e) => {
    if (!payload?.CentreId) {
      toast.warn("please Select Centre");
      return;
    }

    if (payload?.DeliveryLocation?.length === 0) {
      toast.warn("please Select DeliveryLocation");
      return;
    }
    const selected = e.value;
    setPayload((prev) => ({
      ...prev,
      ItemName: selected?.ItemNameGroup || selected,
      ItemID: selected?.ItemIDGroup || selected,
    }));
    ManufacturerAPIPost(selected?.ItemIDGroup);
  };
  const handleAutoCompleteChange = (e) => {
    const val = typeof e.value === "object" ? e.value.ItemNameGroup : e.value;
    setAutoCompleteVal(val);
    searchItems(val);
    setPayload((prev) => ({ ...prev, ItemName: val , ManufactureID:"", MachineID:"", PackSize:""}));
  };
  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <div style={{ float: "left", fontSize: "12px", width: "100%" }}>
        {item?.ItemNameGroup}
      </div>
    </div>
  );
  const SearchOptionList = [
    { label: "By First Name", value: "0" },
    { label: "In Between", value: "1" },
    { label: "By Item Code", value: "2" },
    { label: "By Catalog No", value: "3" },
  ];
  const [GetStateArray, setGetStateArray] = useState([]);
  const [CentreData, setCentreData] = useState([]);
  const [Locationsearch, setLocationsearch] = useState([]);
  const [autoCompleteVal, setAutoCompleteVal] = useState("");
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [manufacturer, setManufacturer] = useState([]);
  const [Machine, setMachine] = useState([]);
  const [packSize, setPackSize] = useState([]);
  const getState = async () => {
    await axiosInstance
      .get("VendorMaster/GetState")
      .then((res) => {
        const response = res?.data?.message;
        setGetStateArray(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const CentreAPIPost = () => {
    const StateIdArrayStr = payload?.StateId.map((loc) => loc.code).join(",");
    const requstBody = {
      stateid: String(StateIdArrayStr || ""),
    };
    axiosInstance
      .post("VendorQuotationComparison/bindCentre", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setCentreData(data);
      })
      .catch((err) => console.error("No Data Found"));
  };
  const GetLocations = () => {
    const requstBody = {
      itemid: String(""),
      centreid: String(""),
      stateID: String(""),
    };
    axiosInstance
      .post("VendorQuotation/GetLocations", { ...requstBody })
      .then((res) => {
        const response = res?.data?.message;
        setLocationsearch(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const searchItems = async (query) => {
    const requestBody = {
      itemName: query || "",
      locationidfrom: String(payload?.DeliveryLocation?.[0]?.code || ""),
      searchOption: String(payload?.SearchOption || ""),
      itemtype: String(""),
    };
    await axiosInstance
      .post("VendorQuotation/SearchItem", {
        ...requestBody,
      })
      .then((res) => {
        const response = res?.data?.message;
        setStockSuggestions(Array.isArray(response) ? response : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  const ManufacturerAPIPost = async (id) => {
    const requstBody = {
      locationidfrom: String(payload?.DeliveryLocation?.[0]?.code),
      itemIDGroup: String(id),
    };
    await axiosInstance
      .post("/VendorQuotation/bindManufacturer", {
        ...requstBody,
      })
      .then((res) => {
        if (res?.data?.success) {
          let data = res?.data?.message;
          setManufacturer(data);
          setPayload((prev) => ({
            ...prev,
            ManufactureName: data?.[0]?.ManufactureName,
            ManufactureID: data?.[0]?.ManufactureID,
          }));
        }
      })
      .catch((err) => console.log("No Data Found"));
  };
  const MachineAPIPost = (id, itemID) => {
    const requstBody = {
      locationidfrom: String(payload?.LocationId || ""),
      itemIDGroup: String(itemID || ""),
      manufactureID: String(id || ""),
    };
    axiosInstance
      .post("/VendorQuotation/bindMachine", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setMachine(data);
        setPayload((prev) => ({
          ...prev,
          MachineID: data?.[0]?.MachineID,
          MachineName: data?.[0]?.MachineName,
        }));

        PackSizeAPIPost(data?.[0]?.MachineID);
      })
      .catch((err) => console.log("No Data Found"));
  };
  const PackSizeAPIPost = (id) => {
    const requstBody = {
      locationidfrom: String(payload?.DeliveryLocation?.[0]?.code || ""),
      itemIDGroup: String(payload?.ItemID || ""),
      manufactureID: String(payload?.ManufactureID || ""),
      machineID: String(id || ""),
    };
    axiosInstance
      .post("/VendorQuotation/bindPackSize", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        setPackSize(data || []);
        setPayload((prev) => ({
          ...prev,
          PackSize: data?.[0]?.PackSize,
          PackValue: data?.[0]?.PackValue,
        }));
      })
      .catch((err) => console.log("No Data Found"));
  };
  const SearchBtnApi = async (id) => {
    if(payload?.LocationId===""){
      toast.warn("Please Select Location..!")
      return;
    }
    const requstBody = {
      item: String(payload?.ItemID || ""),
      fromdate: String(""),
      todate: String(""),
      location: String(payload?.LocationId || ""),
      onlyserate: String(payload?.OnlySetRate || ""),
    };
    await axiosInstance
      .post("VendorQuotationComparison/SearchData", {
        ...requstBody,
      })
      .then((res) => {
        let data = res?.data?.message;
        let success = res?.data?.success;
        if (success) {
          setTableData(data || []);
        } else {
          toast.error(data);
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };

  console.log({tableData})
  const setRateApi = async (row) => {
    const requstBody = {
      qid: String(row?.Qutationno),
      itemid: String(row?.ItemID),
      locationid: String(row?.DeliveryLocationID),
    };
    await axiosInstance
      .post("VendorQuotationComparison/SetRate", {
        ...requstBody,
      })
      .then((res) => {
        const success = res?.data?.success;
        const message = res?.data?.message;
        if (success) {
          toast.success(message);
          SearchBtnApi();
        } else {
          toast.error(res?.data?.message ? res?.data?.message : "Something went wrong")
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      });
  };
  useEffect(() => {
    if (payload?.ItemID) MachineAPIPost(payload.ManufactureID, payload?.ItemID);
  }, [payload?.ItemID, payload.ManufactureID]);
  useEffect(() => {
    getState();
    GetLocations();
    if (payload?.StateId) {
      CentreAPIPost();
    }
  }, [payload?.StateId]);

   useEffect(() => {
      setHandleModelData((val) => ({ ...val, modalData: modalData }));
    }, [modalData]);

     const setIsOpen = () => {
    setHandleModelData((val) => ({ ...val, isOpen: false }));
  };

  const downLoadExcel=()=>{
    axiosReport
    .get("StoreReports/VendorQuotationExcel", {
      responseType: "blob",
    })
    .then((res)=>{
      const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `${"Item Rate List"}.xlsx`);
          document.body.appendChild(link);
          link.click();
          toast?.success("Excel downloaded successfully")
    })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "No data available.",
        );
      })
  }

  const printReport =(Quotationno)=>{
      axiosReport
          .post(`StoreReports/GetVendorQuotation?Quotationno=${Quotationno}`, {}, {responseType: "blob",})
          .then((res) => {
            const url = window.URL.createObjectURL(
              new Blob([res.data], { type: "application/pdf" }),
            );
            window.open(url, "_blank");
          })
          .catch((err) => {
            console.log("No Data Found")
          });
    }
    
  return (
    <>
    {handleModelData?.isOpen && (
            <Modal
              visible={handleModelData?.isOpen}
              setVisible={setIsOpen}
              modalWidth={handleModelData?.width}
              Header={t(handleModelData?.label)}
              buttonType={"submit"}
              buttons={handleModelData?.extrabutton}
              modalData={handleModelData?.modalData}
              setModalData={setModalData}
            >
              {handleModelData?.Component}
            </Modal>
          )}
      <Accordion
        name={t("Location Filter")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row px-2 pt-2">
          <MultiSelctItems
            placeholderName="State"
            name="StateId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={GetStateArray}
            labelKey="name"
            valueKey="id"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <MultiSelctItems
            placeholderName="Centre"
            name="CentreId"
            values={payload}
            setValues={setPayload}
            dynamicOptions={CentreData}
            labelKey="Centre"
            valueKey="CentreID"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="LocationId"
            id="LocationId"
            removeIsClearable={true}
            dynamicOptions={Locationsearch.map((ele) => ({
              label: ele?.Location,
              value: ele.LocationID,
            }))}
            placeholderName="Location"
            value={payload?.LocationId}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="SearchOption"
            id="SearchOption"
            removeIsClearable={true}
            dynamicOptions={SearchOptionList}
            placeholderName="Search Option"
            value={payload?.SearchOption}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-xl-2 col-md-6 col-sm-4 col-12 pb-2">
            <AutoComplete
              style={{ width: "100%" }}
              value={autoCompleteVal}
              suggestions={stockSuggestions}
              completeMethod={() => searchItems(autoCompleteVal)}
              onSelect={handleAutoCompleteSelect}
              id="ItemsName"
              name="ItemsName"
              onChange={handleAutoCompleteChange}
              itemTemplate={itemTemplate}
            />
            <label htmlFor="ItemsName" className="lable searchtest">
              Items
            </label>
          </div>
          <ReactSelect
            name="ManufactureID"
            id="ManufactureID"
            removeIsClearable={true}
            dynamicOptions={manufacturer?.map((val) => ({
              label: val?.ManufactureName,
              value: val?.ManufactureID,
            }))}
            placeholderName="Manufacturer"
            value={payload?.ManufactureID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="MachineID"
            id="MachineID"
            removeIsClearable={true}
            dynamicOptions={Machine.map((ele) => ({
              label: ele?.MachineName,
              value: ele?.MachineID,
            }))}
            placeholderName="Machine"
            value={payload?.MachineID}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="PackSize"
            id="PackSize"
            removeIsClearable={true}
            PackSize
            dynamicOptions={[
              { label: payload?.PackSize, value: payload?.PackSize },
            ]}
            placeholderName="PackSize"
            value={payload?.PackSize}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          {/* <RadioInput
            inputType="checkbox"
            label="Only Set Rate"
            id="OnlySetRate"
            name="OnlySetRate"
            checked={payload.OnlySetRate}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}
          {/* <RadioInput
            inputType="checkbox"
            label="Only Set Rate"
            id="OnlySetRate"
            name="OnlySetRate"
            checked={payload.OnlySetRate === 1}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          /> */}
          <Form.Check
              type="switch"
              id="OnlySetRate"
              name="OnlySetRate"
              label={t("Only Set Rate")}
              checked={payload.OnlySetRate == "1"}
              onChange={(e) => handleChange(e)}
              className="m-0"
            />

          <div className="col-sm-2">
            <CustomButton
            text={t("Search")}
            icon={"search"}
             className="btn btn-sm btn-success"
             onClick={SearchBtnApi}
             />
            
            <CustomButton 
            text={t(" Export To Excel")}
            icon={"excel"}
            className="btn btn-sm btn-success ml-2" 
            onClick={downLoadExcel}
            />
          </div>
        </div>
      </Accordion>
      <Heading
        title={t("Quotation Detail")}
        secondTitle={
          <>
            <ColorCodingSearch
              color={"white"}
              label={t("New")}
              //   onClick={() => handleCallViewMedReq(id)}
            />
            <ColorCodingSearch
              color={"#FFC0CB"}
              label={t("Rate Set")}
              //   onClick={() => handleCallViewMedReq(id)}
            />
          </>
        }
      />
      <div className="row">
        <div className="col-sm-12">
          <Tables>
            <thead>
              <tr>
                <th>{t("Sr No.")}</th>
                <th>{t("View")}</th>
                <th>{t("Print")}</th>
                <th>{t("Set Rate")}</th>
                <th>{t("Quotation No")}</th>
                <th>{t("From Date")}</th>
                <th>{t("From To")}</th>
                <th>{t("Supplier Name")}</th>
                <th>{t("Supplier State")}</th>
                <th>{t("Rate")}</th>
                <th>{t("Disc %")}</th>
                <th>{t(DefaultCurrencyName == "INR" ? "IGST %" : "Tax")}</th>
                <th>{t(DefaultCurrencyName == "INR" ? "CGST %" : "Tax")}</th>
                <th>{t(DefaultCurrencyName == "INR" ? "SGST %" : "Tax")}</th>
                <th>{t("Disc Amt")}</th>
                <th>{t(DefaultCurrencyName == "INR" ? "GST Amt" : "Tax Amt")}</th>
                <th>{t("Buy Price")}</th>
                <th>{t("Net Amt")}</th>
              </tr>
            </thead>
            <tbody>
              {tableData?.map((row, index) => (
                <tr key={index} style={{backgroundColor: row?.rowcolor}}>
                  <td data-title="Sr No.">{index + 1}</td>
                  <td data-title="View">
                    <i
                      className="fa fa-search"
                      style={{ color: "#03a0e7", marginLeft: 8 }}
                      onClick={() =>
                        handleModel(
                          "Item Detail",
                          "70vw",
                          "Store Location (SI)",
                          true,
                          <ShowDetailsModel
                            handleChangeModel={handleChangeModel}
                            items={row}
                            index={index}
                            OnChangeTax={OnChangeTax}
                          />
                        )
                      }
                    ></i>
                  </td>
                  <td data-title="Print" onClick={()=>printReport(row?.Qutationno)}>
                        <i
                          className="fa fa-print"
                          style={{ color: "#03a0e7" }}
                        ></i>
                      </td>
                    <td data-title="Set Rate">
                      {row?.rowcolor==="white" && (
                      <i
                        className="fa fa-check"
                        style={{ color: "#03a0e7", marginLeft: 8 }}
                        onClick={()=>setRateApi(row)}
                      ></i>
                      )}
                    </td>
                  <td data-title="Quotation No">{row?.Qutationno}</td>
                  <td data-title="From Date">{row?.fromdate}</td>
                  <td data-title="To Date">{row?.todate}</td>
                  <td data-title="Supplier Name">{row?.VendorName}</td>
                  <td data-title="Supplier State">{row?.VednorStateName}</td>
                  <td data-title="Rate">{row?.Rate}</td>
                  <td data-title="Disc %">{row?.DiscountPer}</td>
                  <td data-title="IGST %">{row?.IGSTPer}</td>
                  <td data-title="CGST %">{row?.CGSTPer}</td>
                  <td data-title="SGST %">{row?.SGSTPer}</td>
                  <td data-title="Disc Amt">{row?.DiscountAmt}</td>
                  <td data-title="GST Amt">{row?.GSTAmount}</td>
                  <td data-title="Buy Price">{row?.BuyPrice}</td>
                  <td data-title="Net Amt">{row?.FinalPrice}</td>
                </tr>
              ))}
            </tbody>
          </Tables>
        </div>
      </div>
    </>
  );
};

export default VendorQuotationComparison;
