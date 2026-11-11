import React, { useState } from "react";
import Heading from "../../../../components/UI/Heading";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Tables from "../../../../components/UI/customTable";

const LogisticUpdate = () => {
  const { t } = useTranslation();
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    CurrentLocation: "",
    FromDate: new Date(),
    ToDate: new Date(),
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
    { color: "#ADD8E6", id: "3", labelKey: "Dispatched" },
    { color: "#88E788", id: "4", labelKey: "Delivered" },
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
          <div className="col-sm-2 d-flex">
            <button className="btn btn-sm btn-success">{t("Search")}</button>
            <button className="btn btn-sm btn-success ml-2">
              {t("Export to Excel")}
            </button>
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
                  <th>{t("View Detail")}</th>
                  <th>{t("Batch No")}</th>
                  <th>{t("Batch CreatedDate")}</th>
                  <th>{t("Batch CreatedBy")}</th>
                  <th>{t("Dispatch Date")}</th>
                  <th>{t("Dispatch By")}</th>
                  <th>{t("Dispatch From Location")}</th>
                  <th>{t("Dispatch To Location")}</th>
                  <th>{t("Status")}</th>
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
                    <td data-title="Batch No">{row?.BatchNo}</td>
                    <td data-title="Batch CreatedDate">
                      {row?.BatchCreatedDate}
                    </td>
                    <td data-title="Batch CreatedBy">{row?.BatchCreatedBy}</td>
                    <td data-title="Dispatch Date">{row?.DispatchDate}</td>
                    <td data-title="Dispatch By">{row?.DispatchBy}</td>
                    <td data-title="Dispatch From Location">
                      {row?.DispatchFromLocation}
                    </td>
                    <td data-title="Dispatch To Location">
                      {row?.DispatchToLocation}
                    </td>
                    <td data-title="Status">{row?.Status}</td>
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

export default LogisticUpdate;
