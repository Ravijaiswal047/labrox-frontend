import React, { useEffect, useState } from "react";
import Tables from "../../../../components/UI/customTable";
import ColorCodingSearch from "../../../../components/ModalComponent/ColorCodingSearch";
import Heading from "../../../../components/UI/Heading";
import Input from "../../../../components/formComponent/Input";
import DatePicker from "../../../../components/formComponent/DatePicker";
import ReactSelect from "../../../../components/formComponent/ReactSelect";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../../../utils/axiosInstance";
import moment from "moment/moment";
import { toast } from "react-toastify";

const MaterialDeliveryLocationStatus = () => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState({
    CurrentLocation: "",
    FromDate: new Date(),
    ToDate: new Date(),
    BatchNo: "",
  });
  const [DropDownList, setDropDownList] = useState({
    curentlocation: [],
    dataTable: [],
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
  const GetBindCurrentLocaton = () => {
    axiosInstance
      .get("SendIssueItemReceiveStatus/bindalldata")
      .then((res) => {
        const response = res?.data?.message;
        console.log(response);
        const newRes = response?.map((ele) => ({
          label: ele?.location,
          value: ele?.locationId,
        }));
        setDropDownList((prev) => ({ ...prev, curentlocation: newRes }));
      })
      .catch(() => console.log("Something went wrong"));
  };

  const handleSearch = () => {
    const formattedPayload = {
      fromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
      toDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
      batchNumber: payload?.BatchNo ? String(payload?.BatchNo) : "",
      location: payload?.CurrentLocation
        ? String(payload?.CurrentLocation)
        : "",
      type: "2",
    };
    axiosInstance
      .post("SendIssueItemReceiveStatus/searchbatch", formattedPayload)
      .then((res) => {
        const response = res?.data?.message;

        if (Array.isArray(response)) {
          console.log("A");
          setDropDownList((prev) => ({ ...prev, dataTable: response }));
        } else {
          setDropDownList((prev) => ({ ...prev, dataTable: [] }));
          toast.warning("No data found");
        }
      })
      .catch((err) => {
        const errorMsg =
          err?.response?.data?.message ||
          "Something went wrong. Please try again.";
        toast.error(errorMsg);
      });
  };

  useEffect(() => {
    GetBindCurrentLocaton();
  }, []);
  return (
    <>
      <div className="card">
        <Heading
          name={"Material Delivery Location Update"}
          isBreadcrumb={true}
        />
        <div className="row px-2 py-2">
          <ReactSelect
            name="CurrentLocation"
            id="CurrentLocation"
            removeIsClearable={true}
            dynamicOptions={DropDownList?.curentlocation}
            placeholderName="Current Location"
            value={payload?.CurrentLocation}
            onChange={handleSelectChange}
            className={"required-fields"}
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
          <div className="col-sm-2">
            <button className="btn btn-sm btn-success" onClick={handleSearch}>
              {t("Search")}
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
                  <th>{t("Print Dispatch Invoice")}</th>
                </tr>
              </thead>
              <tbody>
                {DropDownList?.dataTable?.map((row, index) => (
                  <tr
                    key={index}
                    style={{
                      backgroundColor: row?.Rowcolor || "transparent",
                    }}
                  >
                    <td data-title="#">{index + 1}</td>
                    <td data-title="View Detail">
                      <span
                      // onClick={() => handleViewDetail(row)}
                      >
                        <i class="fas fa-search"></i>
                      </span>
                    </td>
                    <td data-title="Batch No">{row?.BatchNumber}</td>
                    <td data-title="Batch CreatedDate">
                      {row?.BatchCreatedDateTime}
                    </td>
                    <td data-title="Batch CreatedBy">
                      {row?.BatchCreatedByName || "-"}
                    </td>
                    <td data-title="Dispatch Date">{row?.DispatchDate}</td>
                    <td data-title="Dispatch By">{row?.DispatchByUserName}</td>
                    <td data-title="Dispatch From Location">
                      {row?.DispatchFrom || "-"}
                    </td>
                    <td data-title="Dispatch To Location">{row?.DispatchTo}</td>
                    <td data-title="Status">
                      {row?.DispatchStatus === 1
                        ? "Dispatched"
                        : row?.DispatchStatus === 2
                          ? "Received"
                          : "Pending"}
                    </td>
                    <td data-title="Print Dispatch Invoice">
                      <span
                      // onClick={() => handlePrintDispatchInvoice(row)}
                      >
                        🖨️
                      </span>
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

export default MaterialDeliveryLocationStatus;
