import React, { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import { axiosInstance } from "../../utils/axiosInstance";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { WorkOrderID } from "../../utils/Constants";
import Input from "../../components/formComponent/Input";
import { number } from "../../utils/helpers";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import moment from "moment";
import { toast } from "react-toastify";

const InterfaceBookingData = () => {
  const { t } = useTranslation();
  const [companyInterface, setCompanyInterface] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    InterfaceCompany: "",
    SelectTypes: "",
    ItemValue: "",
    SearchType: "all",
  });

  const handleSearchSelectChange = (label, value) => {
    setPayload({
      ...payload,
      [label]: value?.value,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleDateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const getInterfaceCompany = () => {
    axiosInstance
      .get("ItemMasterInterface/BindInterfaceCompany")
      .then((res) => {
        const data = res?.data?.message;
        const val = data.map((ele) => {
          return {
            value: ele?.CompanyName,
            label: ele?.CompanyName,
          };
        });
        setCompanyInterface(val);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearch = () => {
    console.log(payload);
    setLoading(true);
    axiosInstance
      .post("CRMIntegration/GetHL7Booking", {
        SelectTypes: payload?.SelectTypes,
        ItemValue: payload?.ItemValue,
        IsBookedStatus: payload?.SearchType,
        InterfaceClient: payload?.InterfaceCompany ?? "",
        FromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
        FromTime: "00:00:00",
        ToTime: "23:59:59",
        ToDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
      })
      .then((res) => {
        if (res?.data?.success) {
          const data = res?.data?.message;
          setTableData(data);
        } else {
          setTableData([]);
        }

        setLoading(false);
      })
      .catch((err) => {
        setTableData([]);
        toast.error(
          err.response.data.message
            ? err.response.data.message
            : "Something Went Wrong",
        );
        setLoading(false);
      });
    setLoading(false);
  };

  const handleRePush = (WorkOrderID) => {
    axiosInstance
      .post("CRMIntegration/UpdateIsBooking", {
        WorkOrderID: WorkOrderID,
      })
      .then((res) => {
        toast.success("RePush Successfully");
        handleSearch();
      })
      .catch((err) => {
        toast.error(
          err.response.data.message
            ? err.response.data.message
            : "Something Went Wrong",
        );
      });
  };

  const GetName = (value) => {
    const data = companyInterface?.filter((ele) => ele?.value == value);
    return data[0]?.label;
  };
  useEffect(() => {
    getInterfaceCompany();
  }, []);

  return (
    <>
      <Accordion
        name={t("Interface Booking Data")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={companyInterface}
              //   removeIsClearable={true}
              name="InterfaceCompany"
              lable="Interface Company"
              id="InterfaceCompany"
              placeholderName="Interface Company"
              value={payload?.InterfaceCompany}
              onChange={handleSearchSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <div className="d-flex" style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <SelectBox
                  options={WorkOrderID}
                  selectedValue={payload?.SelectTypes}
                  name="SelectTypes"
                  id="SelectTypes"
                  lable="SelectTypes"
                  onChange={handleSelectChange}
                />
              </div>
              <div style={{ width: "50%" }}>
                <Input
                  className="select-input-box form-control input-sm"
                  type="text"
                  name="ItemValue"
                  value={payload?.ItemValue}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="FromDate"
              value={payload?.FromDate}
              placeholder=""
              id="FromDate"
              lable="FromDate"
              onChange={handleDateSelect}
              maxDate={new Date(payload.ToDate)}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              name="ToDate"
              value={payload?.ToDate}
              placeholder=""
              id="ToDate"
              lable="ToDate"
              onChange={handleDateSelect}
              maxDate={new Date()}
              minDate={new Date(payload.FromDate)}
            />
          </div>
          <div className="col-sm-3">
            <div className="d-flex align-items-center justify-content-around">
              <div className="col-sm-3 d-flex">
                <div className="mt-1">
                  <input
                    type="radio"
                    id="Booked"
                    value="booked"
                    name="SearchType"
                    checked={payload?.SearchType == "booked"}
                    onChange={(e) => {
                      setPayload({ ...payload, SearchType: e.target.value });
                    }}
                  />
                </div>
                <label htmlFor="Booked" className="ml-2">
                  {t("Booked")}
                </label>
              </div>
              <div className="col-sm-3 d-flex">
                <div className="mt-1">
                  <input
                    type="radio"
                    id="Pending"
                    value="pending"
                    name="SearchType"
                    checked={payload?.SearchType == "pending"}
                    onChange={(e) => {
                      setPayload({ ...payload, SearchType: e.target.value });
                    }}
                  />
                </div>
                <label htmlFor="Pending" className="ml-2">
                  {t("Pending")}
                </label>
              </div>
              <div className="col-sm-3 d-flex">
                <div className="mt-1">
                  <input
                    type="radio"
                    id="Fail"
                    value="fail"
                    name="SearchType"
                    checked={payload.SearchType == "fail"}
                    onChange={(e) => {
                      setPayload({ ...payload, SearchType: e.target.value });
                    }}
                  />
                </div>
                <label htmlFor="Fail" className="ml-2">
                  {t("Fail")}
                </label>
              </div>
              <div className="col-sm-3 d-flex">
                <div className="mt-1">
                  <input
                    type="radio"
                    id="All"
                    value="all"
                    name="SearchType"
                    checked={payload.SearchType == "all"}
                    onChange={(e) => {
                      setPayload({ ...payload, SearchType: e.target.value });
                    }}
                  />
                </div>
                <label htmlFor="All" className="ml-2">
                  {t("All")}
                </label>
              </div>
            </div>
          </div>
          <div className="col-sm-1">
            <button
              className="btn btn-block btn-success btn-sm"
              onClick={() => handleSearch()}
            >
              {t("Search")}
            </button>
          </div>
        </div>
      </Accordion>
      <Accordion title={"Search Data"} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <div className="row p-2 ">
            <div className="col-12">
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Interface Client")}</th>
                    <th>{t("Type")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("WorkOrderID")}</th>
                    <th>{t("Patient Name")}</th>
                    <th>{t("UHID No.")}</th>
                    <th>{t("Mobile")}</th>
                    <th>{t("Gender")}</th>
                    {/* <th>{t("Test Code")}</th> */}
                    {/* <th>{t("Item Name")}</th> */}
                    {/* <th>{t("Sin No")}</th> */}
                    <th>{t("Response")}</th>
                    <th>{t("TPA Name")}</th>
                    <th>{t("Status")}</th>
                    <th>{t("Entry Date")}</th>
                    <th>{t("RePush")}</th>
                  </tr>
                </thead>
                <tbody>
                  {console.log(tableData)}
                  {tableData &&
                    tableData?.map((data, index) => (
                      <>
                        <tr key={index}>
                          <td data-title={"S.No"}>{index + 1}</td>
                          <td data-title={"Interface Client"}>
                            {data?.InterfaceClientName}
                          </td>
                          <td data-title={"Type"}>{data?.Type}</td>
                          <td data-title={"Centre"}>
                            {data?.Interface_CentreName}
                          </td>
                          <td data-title={"WorkOrderID"}>
                            {data?.WorkOrderID}
                          </td>
                          <td data-title={"Patient Name"}>{data?.PName}</td>
                          <td data-title={"UHID No."}>{data?.Patient_ID}</td>
                          <td data-title={"Mobile"}>{data?.Phone}</td>
                          <td data-title={"Gender"}>{data?.Gender}</td>
                          {/* <td data-title={"Test Code"}></td> */}
                          {/* <td data-title={"Item Name"}></td> */}
                          {/* <td data-title={"Sin No"}></td> */}
                          <td data-title={"Response"}>{data?.Response}</td>
                          <td data-title={"TPA Name"}>{data?.TPA_Name}</td>
                          <td data-title={"Status"}>
                            {data?.IsBooked == "0" && "Pending"}
                            {data?.IsBooked == "1" && "Booked"}
                            {data?.IsBooked == "-1" && "Failed"}
                          </td>
                          <td data-title={"Entry Date"}>{data?.BookingDate}</td>
                          <td data-title={"RePush"}>
                            {data?.IsBooked == "-1" && (
                              <button
                                className="btn btn-block btn-success btn-sm"
                                onClick={() => handleRePush(data?.WorkOrderID)}
                              >
                                {t("RePush")}
                              </button>
                            )}
                          </td>
                        </tr>
                      </>
                    ))}
                </tbody>
              </Tables>
            </div>
          </div>
        )}
      </Accordion>
    </>
  );
};

export default InterfaceBookingData;
