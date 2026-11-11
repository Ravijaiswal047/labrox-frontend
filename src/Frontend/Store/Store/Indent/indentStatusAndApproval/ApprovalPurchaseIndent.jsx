import React, { useState } from "react";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Accordion from "../../../../components/UI/Accordion";
import DatePicker from "../../../../components/formComponent/DatePicker";
import Input from "../../../../components/formComponent/Input";
import Heading from "../../../../components/UI/Heading";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../../../components/UI/customTable";

const ApprovalPurchaseIndent = () => {
  const { t } = useTranslation();
  const initialState = {
    CurrentLocation: "",
    FromDate: new Date(),
    ToDate: new Date(),
    ToLocation: "",
    IndentNo: "",
    IndentStatus: "",
    Action: "",
  };
  const [payload, setPayload] = useState(initialState);
  const [tableData, setTableData] = useState([]);
  const handleSelectChange = (name, value) => {
    setPayload((prev) => ({ ...prev, [name]: value?.value }));
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked === true ? "1" : "0") : value,
    }));
  };
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  const colorCodingData = [
    { color: "#ADD8E6", id: "1", labelKey: "New" }, // Light Blue
    { color: "#90EE90", id: "2", labelKey: "Issued" }, // Light Green
    { color: "#FFA500", id: "3", labelKey: "Close" }, // Orange
    { color: "#FF6347", id: "4", labelKey: "Reject" }, // Tomato Red
    { color: "#FFD700", id: "5", labelKey: "Partial Issue" }, // Gold
    { color: "#9370DB", id: "6", labelKey: "Partial Receive" }, // Medium Purple
  ];

  return (
    <>
      <div className="card">
        <Heading name={"Indent Status and Approval"} isBreadcrumb={true} />
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

          <DatePicker
            name="FromDate"
            id="FromDate"
            value={payload?.FromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
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
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="ToLocation"
            id="ToLocation"
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="To Location"
            value={payload?.ToLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="IndentNo"
            id="IndentNo"
            name="IndentNo"
            value={payload?.IndentNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="IndentStatus"
            id="IndentStatus"
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="Indent Status"
            value={payload?.IndentStatus}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Action"
            id="Action"
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="Action"
            value={payload?.Action}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            <button className="btn btn-primary" onClick={() => {}}>
              {t("Search")}
            </button>
            <button className="btn btn-primary ml-2" onClick={() => {}}>
              {t("Export To Excel")}
            </button>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading
          name={"Indent Detail"}
          isBreadcrumb={true}
          secondTitle={
            <>
              {colorCodingData?.map(({ color, labelKey, id }) => (
                <ColorCodingSearch
                  key={id}
                  color={color}
                  label={t(labelKey)}
                  //   onClick={() => handleCallViewMedReq(id)}
                />
              ))}
            </>
          }
        />
        <div className="row">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("View Item")}</th>
                  <th>{t("Indent No")}</th>
                  <th>{t("Indent Date")}</th>
                  <th>{t("Indent From Location")}</th>
                  <th>{t("Indent To Location")}</th>
                  <th>{t("Created User")}</th>
                  <th>{t("Checked User")}</th>
                  <th>{t("Checked Date")}</th>
                  <th>{t("Approved User")}</th>
                  <th>{t("Approved Date")}</th>
                  <th>{t("PO Status")}</th>
                  <th>{t("Print PO")}</th>
                  <th>{t("Narration")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Expected Date")}</th>
                  <th>{t("Action Type")}</th>
                  <th>{t("Next Action")}</th>
                  <th>{t("Print")}</th>
                  <th>{t("Dispatch")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="#">{index + 1}</td>
                    <td data-title="View Item">
                      <button onClick={() => handleViewItem(row)}>🔍</button>
                    </td>
                    <td data-title="Indent No">{row?.indentNo}</td>
                    <td data-title="Indent Date">{row?.indentDate}</td>
                    <td data-title="Indent From Location">
                      {row?.indentFromLocation}
                    </td>
                    <td data-title="Indent To Location">
                      {row?.indentToLocation}
                    </td>
                    <td data-title="Created User">{row?.createdUser}</td>
                    <td data-title="Checked User">{row?.checkedUser}</td>
                    <td data-title="Checked Date">{row?.checkedDate}</td>
                    <td data-title="Approved User">{row?.approvedUser}</td>
                    <td data-title="Approved Date">{row?.approvedDate}</td>
                    <td data-title="PO Status">{row?.poStatus}</td>
                    <td data-title="Print PO">
                      <button onClick={() => handlePrintPO(row)}>🖨️</button>
                    </td>
                    <td data-title="Narration">{row?.narration}</td>
                    <td data-title="Status">{row?.status}</td>
                    <td data-title="Expected Date">{row?.expectedDate}</td>
                    <td data-title="Action Type">{row?.actionType}</td>
                    <td data-title="Next Action">{row?.nextAction}</td>
                    <td data-title="Print">
                      <button onClick={() => handlePrint(row)}>🖨️</button>
                    </td>
                    <td data-title="Dispatch">
                      <button onClick={() => handleDispatch(row)}>📦</button>
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

export default ApprovalPurchaseIndent;
