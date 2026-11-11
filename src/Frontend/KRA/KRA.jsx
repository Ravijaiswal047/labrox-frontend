import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import moment from "moment";
import { toast } from "react-toastify";

import Accordion from "../../components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import ReactSelect from "../../components/formComponent/ReactSelect";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import FinanceModal from "../../components/ModalComponent/FinanceModal";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";

import { axiosInstance } from "../../utils/axiosInstance";
import {
  getAccessCentresReports,
  GetRateTypeByGlobalCentre,
} from "../../utils/NetworkApi/commonApi";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { ExportToExcel } from "../../utils/helpers";

const typeList = [
  { label: "Cash Bill", value: "1" },
  { label: "Insurance Bill", value: "2" },
  { label: "Credit Note Bill", value: "3" },
];

// const patientTypeList = [
//   { label: "ALL", value: "" },
//   { label: "OPD", value: "OPD" },
//   { label: "IPD", value: "IPD" },
//   { label: "EMG/Day Care", value: "EMG" },
// ];

const postedTypeList = [
  { label: "ALL", value: "" },
  { label: "Posted", value: "Posted" },
  { label: "Un-Posted", value: "UnPosted" },
  { label: "Failed", value: "Failed" },
];


// const KRA_PUSH_FIELDS = [
//   "maxAmountCanRefundToKRA",
//   "crDrReason",
//   "type",
//   "billDate",
//   "kraPinNo",
//   "kraCentreID",
//   "updateTo",
//   "qrCode",
//   "isPostedSuccessfully",
//   "isTryToPush",
//   "resultMsg",
//   "patientID",
//   "transactionID",
//   "paymentModeID",
//   "ledgertransactionNo",
//   "typeOfTnx",
//   "centreID",
//   "billNo",
//   "pName",
//   "salesTyCd",
//   "rcptTyCd",
//   "pmtTyCd",
//   "salesSttsCd",
//   "salesDt",
//   "cfmDt",
//   "tc",
//   "taxblAmtA",
//   "taxblAmtB",
//   "taxblAmtC",
//   "taxblAmtD",
//   "taxblAmtE",
//   "totAmt",
//   "prchrAcptcYn",
//   "userName",
//   "remarks",
//   "approval",
//   "isPaidSomeAmount",
//   "panelPaybleAmount",
//   "patientPaybleAmount",
//   "crDrAgainst",
//   "totalBill",
//   "panelID",
//   "originalInvoiceNo",
//   "isRefundInvoice",
// ];

const KRA = () => {
  const { t } = useTranslation();

  const initialState = {
    PatientName: "",
    BillPanelInvNo: "",
    PatientId: "",
    PanelGroup: "",
    Panel: "",
    FromBillDate: new Date(),
    ToBillDate: new Date(),
    Type: "1",
    //PatientType: "OPD",
    PostedType: "UnPosted",
    CentreId: "",
  };

  const [payload, setPayload] = useState(initialState);
  const [dropDownList, setDropDownList] = useState({
    centreList: [],
    panelGroupList: [],
    panelList: [],
  });

  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPushAlert, setShowPushAlert] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const dateSelect = (date, name) => {
    setPayload((prev) => ({ ...prev, [name]: date }));
  };

  const handleSelectChange = (name, selected) => {
    const value = selected?.value ?? "";
    setPayload((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "PanelGroup") updated.Panel = "";
      return updated;
    });

  };

  const bindPanelGroup = () => {
    axiosInstance
      .get("centre/getCentreType")
      .then((res) => {
        const data = Array.isArray(res?.data?.message) ? res.data.message : [];
        const list = data.map((ele) => ({
          label: ele?.Centretype,
          value: ele?.id,
        }));
        setDropDownList((prev) => ({ ...prev, panelGroupList: list }));
      })
      .catch(() => console.log("Unable to load Panel Group"));
  };


  const bindPanel = () => {
    GetRateTypeByGlobalCentre((list) =>
      setDropDownList((prev) => ({ ...prev, panelList: list }))
    );
  };

  const bindCentre = () => {
    getAccessCentresReports((list) =>
      setDropDownList((prev) => ({ ...prev, centreList: list }))
    );
  };

  const handleSearch = () => {
    // if (!payload?.CentreId) {
    //   toast.error("Please select Centre");
    //   return;
    // }

    const requestBody = {
      postedType: payload?.PostedType || "",
      patientID: String(payload?.PatientId || ""),
      patientType: "",
      type: payload?.Type || "",
      patientName: payload?.PatientName || "",
      billNo: String(payload?.BillPanelInvNo || ""),
      fromDate: moment(payload?.FromBillDate).format("DD-MMM-YYYY"),
      toDate: moment(payload?.ToBillDate).format("DD-MMM-YYYY"),
      centreID: String(payload?.CentreId || ""),
      panelID: String(payload?.Panel || ""),
      panelGroupID: String(payload?.PanelGroup || ""),
    };

    setIsLoading(true);
    axiosInstance
      .post("KRABindbilldata/BindBillData", requestBody)
      .then((res) => {
        const data = Array.isArray(res?.data?.data) ? res.data.data : [];
        setTableData(data);
        setFilteredData(data);
        setSelectedRows([]);
        setSearchText("");
        toast.success(res?.data?.message);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      })
      .finally(() => setIsLoading(false));
  };

  const handleDownloadExcel = () => {
    if (!filteredData?.length) {
      toast.error("No data to download");
      return;
    }

    // const excelData = filteredData.map((row, index) => ({
    //   "S.No.": index + 1,
    //   "Patient ID": row?.PatientCode ?? "",
    //   "Payer Name": row?.PName ?? "",
    //   "Bill No/Invoice No.": row?.BillNo ?? "",
    //   "Bill Date": row?.BillDate ?? "",
    //   "Bill Amount": row?.BillAmount ?? "",
    //   "Patient Payble Amount": row?.PaybyPatient ?? "",
    //   "Panel Payble Amount": row?.PayByPanel ?? "",
    //   "KRA Pin": row?.KRAPIN ?? "",
    //   "SCU Invoice No": row?.SUCNo ?? "",
    // }));

    ExportToExcel(filteredData, "KRA_Push_Bills.xlsx");
  };

  const handleFilter = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (!value) {
      setFilteredData(tableData);
      return;
    }
    const lower = value.toLowerCase();
    setFilteredData(
      tableData.filter((row) =>
        Object.values(row || {}).some((cell) =>
          String(cell ?? "").toLowerCase().includes(lower)
        )
      )
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedRows(checked ? filteredData.map((_, i) => i) : []);
  };

  const handleCheckboxChange = (index) => {
    setSelectedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handlePushToKRA = () => {
    if (selectedRows.length === 0) {
      toast.warning("Please select at least one record");
      return;
    }
    setShowPushAlert(true);
  };

  const confirmPushToKRA = async () => {
    const requestBody = selectedRows.map((index) => (filteredData[index])
    );

    try {
      const res = await axiosInstance.post(
        "KRABindbilldata/PushToKRA",
        requestBody
      );
      if (res?.data?.success) {
        toast.success(res?.data?.message || "Pushed to KRA Successfully");
        handleSearch();
        return true;
      }
      toast.error(res?.data?.message || "Push failed");
      return false;
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error Occurred");
      return false;
    }
  }; 

   const handleReset = () => {
    setPayload(initialState);
   }

 
  useEffect(() => {
    bindPanelGroup();
    bindPanel();
    bindCentre();
  }, []);

  return (
    <>
    
      {showPushAlert && (
        <FinanceModal
          visible={showPushAlert}
          setVisible={() => setShowPushAlert(false)}
          modalWidth="24vw"
          Header={t("Alert !!")}
          buttonName={t("Ok")}
          handleAPI={async () => {
            const ok = await confirmPushToKRA();
            if (ok) setShowPushAlert(false);
          }}
        >
          <span
            className="d-flex justify-content-center"
            style={{ fontWeight: "bold" }}
          >
            {t(`Selected Data Push To KRA Successfully.`)}
          </span>
        </FinanceModal>
      )}

      <Accordion name={t("Push To KRA")} isBreadcrumb={true} defaultValue={true}>
        <div className="row px-2 pt-2">
          <Input
            type="text"
            placeholder=" "
            lable="Patient Name"
            id="PatientName"
            name="PatientName"
            value={payload?.PatientName}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Bill/Panel Inv. No."
            id="BillPanelInvNo"
            name="BillPanelInvNo"
            value={payload?.BillPanelInvNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Patient ID"
            id="PatientId"
            name="PatientId"
            value={payload?.PatientId}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <ReactSelect
            name="PanelGroup"
            id="PanelGroup"
            //removeIsClearable={true}
            dynamicOptions={dropDownList?.panelGroupList}
            placeholderName="Centre Type"
            value={payload?.PanelGroup}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <ReactSelect
            name="Panel"
            id="Panel"
            // removeIsClearable={true}
            dynamicOptions={dropDownList?.panelList}
            placeholderName="Rate Type"
            value={payload?.Panel}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <DatePicker
            name="FromBillDate"
            id="FromBillDate"
            value={payload?.FromBillDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Bill Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
          <DatePicker
            name="ToBillDate"
            id="ToBillDate"
            value={payload?.ToBillDate}
            onChange={dateSelect}
            maxDate={new Date()}
            minDate={new Date(payload?.FromBillDate)}
            placeholder=""
            lable={t("To Bill Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <ReactSelect
            name="Type"
            id="Type"
            removeIsClearable={true}
            dynamicOptions={typeList}
            placeholderName="Type"
            value={payload?.Type}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          {/* {payload?.Type !== "Insurance" && (
            <ReactSelect
              name="PatientType"
              id="PatientType"
              removeIsClearable={true}
              dynamicOptions={patientTypeList}
              placeholderName="Patient Type"
              value={payload?.PatientType}
              onChange={handleSelectChange}
              respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
            />
          )} */}

          <ReactSelect
            name="PostedType"
            id="PostedType"
            removeIsClearable={true}
            dynamicOptions={postedTypeList}
            placeholderName="Posted Type"
            value={payload?.PostedType}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />

          <ReactSelect
            name="CentreId"
            id="CentreId"
            // removeIsClearable={true}
            // dynamicOptions={[ {label: "Select Centre", value: "" }, ...dropDownList?.centreList]}
            dynamicOptions={dropDownList?.centreList}
            placeholderName="Centre"
            value={payload?.CentreId}
            onChange={handleSelectChange}
            //className={"required-fields"}
            respclass={"col-xl-2 col-sm-4 col-md-6 col-12"}
          />
        {/* </div> */}

        {/* <div className="row px-2 py-2 justify-content-center"> */}
          <SearchButton
            text={isLoading ? "Searching..." : "Search"}
            onClick={handleSearch}
            disabled={isLoading}
            className="mx-2"
          />
          <CustomButton
            text="Reset"
            icon={"refresh"}
            variant="danger"
            onClick={handleReset}
            className="mx-2"
          />
          <CustomButton
            text="Download Excel"
            icon={"excel"}
            variant="success"
            onClick={handleDownloadExcel}
            className="mx-2"
          />
        </div>
      </Accordion>

      <Accordion
        title={t("Search Result")}
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        className="mt-2"
        linkTitle={
          <div className="d-flex align-items-center pt-2">
            <Input
              type="text"
              //placeholder="Filter Searched Data Only"
              lable="Filter Searched Data Only"
              id="kraSearchFilter"
              name="kraSearchFilter"
              value={searchText}
              onClick={(e) => e.stopPropagation()}
              onChange={handleFilter}
            />
          </div>
        }
      >
        {/* <div className="row px-2 pt-2"> */}
          <div className="col-12">
            {filteredData?.length > 0 ? (
              <Tables>
                <thead
                  className="text-center"
                  style={{ position: "sticky", top: 0, zIndex: 99 }}
                >
                  <tr>
                    <th>{t("S.No.")}</th>
                    <th>{t("Patient ID")}</th>
                    <th>{t("Payer Name")}</th>
                    <th>{t("Bill No/Invoice No.")}</th>
                    <th>{t("Bill Date")}</th>
                    <th>{t("Bill Amount")}</th>
                    <th>{t("Patient Payble Amount")}</th>
                    <th>{t("Panel Payble Amount")}</th>
                    <th>{t("KRA Pin")}</th>
                    <th>{t("SCU Invoice No")}</th>
                    {/* <th>{t("Type")}</th> */}
                    <th>
                      {t("Action")}
                      {/* <br />
                      <input
                        type="checkbox"
                        checked={
                          filteredData.length > 0 &&
                          selectedRows.length === filteredData.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      /> */}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={index}>
                      <td data-title="S.No.">{index + 1}</td>
                      <td data-title="Patient ID">{row.PatientCode}</td>
                      <td data-title="Payer Name">{row.PName}</td>
                      <td data-title="Bill No/Invoice No.">{row.BillNo}</td>
                      <td data-title="Bill Date">{row.BillDate}</td>
                      <td data-title="Bill Amount">{row.BillAmount}</td>
                      <td data-title="Patient Payble Amount">{row.PaybyPatient}</td>
                      <td data-title="Panel Payble Amount">{row.PayByPanel}</td>
                      <td data-title="KRA Pin">{row.KraPinNo}</td>
                      <td data-title="SCU Invoice No">{row.SUCNo}</td>
                      {/* <td data-title="Type">{payload?.Type}</td> */}
                      <td data-title="Action" className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(index)}
                          onChange={() => handleCheckboxChange(index)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            ) : (
              <NoRecordFound />
            )}
          </div>
        {/* </div> */}

        {tableData?.length > 0 && (
          <div className="row px-4 py-2 justify-content-end">
            <CustomButton
              text="PUSH TO KRA"
              icon={"send"}
              variant="success"
              onClick={handlePushToKRA}
            />
          </div>
        )}
      </Accordion>
    </>
  );
};

export default KRA;