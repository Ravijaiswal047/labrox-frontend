import React, { useState } from "react";
import DatePicker from "../../../../components/formComponent/DatePicker";
import { useTranslation } from "react-i18next";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import Input from "../../../../components/formComponent/Input";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../../../components/UI/customTable";

const DispatchMaterial = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    CurrentLocation: "",
    ToLocation: "",
    IssueFromDate: new Date(),
    IssueToDate: new Date(),
    FromDate: new Date(),
    ToDate: new Date(),
    IssueInvoiceNo: "",
    BatchNo: "",
  });
  const handleSelectChange = (name, value) => {
    console.log("value", value, name);
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
    { color: "#ADD8E6", id: "1", labelKey: "Pending" },
    { color: "#90EE90", id: "2", labelKey: "BatchCreated" },
    { color: "#FFA500", id: "3", labelKey: "Dispatched" },
    { color: "#FF6347", id: "4", labelKey: "Delivered" },
    { color: "#FFD700", id: "5", labelKey: "Received" },
  ];

  return (
    <>
      <div className="card">
        <Heading name={"Consume Store Item"} isBreadcrumb={true} />
        <div className="row px-2 py-2">
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
          <ReactSelect
            name="ToLocation "
            id="ToLocation "
            removeIsClearable={true}
            // dynamicOptions={}
            placeholderName="To Location "
            value={payload?.ToLocation}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />

          <DatePicker
            name="IssueFromDate"
            id="IssueFromDate"
            value={payload?.IssueFromDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Issue From Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <DatePicker
            name="IssueToDate"
            id="IssueToDate"
            value={payload?.IssueToDate}
            onChange={dateSelect}
            maxDate={new Date()}
            placeholder=""
            lable={t("Issue TO Date")}
            className="custom-calendar"
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <ReactSelect
            name="Status"
            id="Status"
            removeIsClearable={true}
            dynamicOptions={[
              { label: "Status ", value: "Status " },
              { label: "Pending", value: "Pending" },
              { label: "BatchCreated", value: "BatchCreated" },
              { label: "Dispatched", value: "Dispatched" },
              { label: "Delivered", value: "Delivered" },
              { label: "Received", value: "Received" },
              { label: "All", value: "All" },
            ]}
            placeholderName="Status"
            value={payload?.Status}
            onChange={handleSelectChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <Input
            type="text"
            placeholder=" "
            lable="Issue Invoice No"
            id="IssueInvoiceNo"
            name="IssueInvoiceNo"
            value={payload?.IssueInvoiceNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            <button className="btn btn-sm btn-success">{t("Search")}</button>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading
          name={"Issue Detail"}
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
                  <th>{t("Issue Invoice No")}</th>
                  <th>{t("Issue Date")}</th>
                  <th>{t("Dispatch From Location")}</th>
                  <th>{t("Dispatch To Location")}</th>
                  <th>{t("Status")}</th>
                  <th>{t("Print Invoice")}</th>
                  <th>{t("Print Address")}</th>
                  <th>
                    <input type="checkbox" name="isDelete" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="#">{index + 1}</td>
                    <td data-title="View Item">
                      {/* Add view logic here */}
                      <button onClick={() => handleView(row)}>🔍</button>
                    </td>
                    <td data-title="Indent No">{row?.IndentNo}</td>
                    <td data-title="Indent Date">{row?.IndentDate}</td>
                    <td data-title="Issue Invoice No">{row?.IssueInvoiceNo}</td>
                    <td data-title="Issue Date">{row?.IssueDate}</td>
                    <td data-title="Dispatch From Location">
                      {row?.DispatchFromLocation}
                    </td>
                    <td data-title="Dispatch To Location">
                      {row?.DispatchToLocation}
                    </td>
                    <td data-title="Status">{row?.Status}</td>
                    <td data-title="Print Invoice">
                      {/* Example: print logic */}
                      <button onClick={() => handlePrintInvoice(row)}>
                        🖨️
                      </button>
                    </td>
                    <td data-title="Print Address">
                      <button onClick={() => handlePrintAddress(row)}>
                        📄
                      </button>
                    </td>
                    <td data-title="Select">
                      <input
                        type="checkbox"
                        checked={row?.isChecked || false}
                        onChange={(e) =>
                          handleCheckboxChange(index, e.target.checked)
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </div>
      <div className="card mt-2">
        <Heading name={"Pending Batch"} isBreadcrumb={true} />
        <div className="row p-2">
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
          <Input
            type="text"
            placeholder=" "
            lable="Batch No"
            id="BatchNo"
            name="BatchNo"
            value={payload?.BatchNo}
            onChange={handleChange}
            respclass={"col-xl-2 col-sm-4 col-md-6 co-12"}
          />
          <div className="col-sm-2">
            <button className="btn btn-sm btn-success">{t("Search")}</button>
          </div>
        </div>
        <div className="row px-2">
          <div className="col-sm-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("#")}</th>
                  <th>{t("View Detail")}</th>
                  <th>{t("Dispatch")}</th>
                  <th>{t("Batch Number")}</th>
                  <th>{t("Batch Created Date")}</th>
                  <th>{t("Batch Created by")}</th>
                  <th>{t("From Location")}</th>
                  <th>{t("To Location")}</th>
                  <th>{t("Print Address")}</th>
                  <th>{t("Print Dispatch Invoice")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((row, index) => (
                  <tr key={index}>
                    <td data-title="#">{index + 1}</td>
                    <td data-title="View Detail">
                      <button onClick={() => handleViewDetail(row)}>🔍</button>
                    </td>
                    <td data-title="Dispatch">{row?.Dispatch}</td>
                    <td data-title="Batch Number">{row?.BatchNumber}</td>
                    <td data-title="Batch Created Date">
                      {row?.BatchCreatedDate}
                    </td>
                    <td data-title="Batch Created by">{row?.CreatedBy}</td>
                    <td data-title="From Location">{row?.FromLocation}</td>
                    <td data-title="To Location">{row?.ToLocation}</td>
                    <td data-title="Print Address">
                      <button onClick={() => handlePrintAddress(row)}>
                        📄
                      </button>
                    </td>
                    <td data-title="Print Dispatch Invoice">
                      <button onClick={() => handlePrintDispatchInvoice(row)}>
                        🖨️
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

export default DispatchMaterial;
