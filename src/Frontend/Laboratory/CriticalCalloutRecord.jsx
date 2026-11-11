import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import moment from "moment";

import { axiosInstance } from "../../utils/axiosInstance";
import SampleRemark from "../utils/SampleRemark";
import DatePicker from "../../components/formComponent/DatePicker";
import ExportFile from "../../components/formComponent/ExportFile";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Accordion from "@app/components/UI/Accordion";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
const CriticalCalloutRecord = () => {
  const { t } = useTranslation();

  const [searchData, setSearchData] = useState({
    IsCommunicate: 0,
    IsFollowUp: 0,
    FromDate: new Date(),
    ToDate: new Date(),
  });
  const [communicate, setCommunicate] = useState(false);
  const [searchLoad, setSearchLoad] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedRow, setSelectedRow] = useState({});
  const dateSelect = (value, name) => {
    setSearchData({ ...searchData, [name]: value });
  };
  const getColor = () => {
    if (searchData?.IsCommunicate == 1) return "#47cd47";
    if (searchData?.IsFollowUp == 1) return "#f19dac";
  };
  const handleSearch = (Communicate, FollowUp) => {
    setSearchData({
      ...searchData,
      IsCommunicate: Communicate,
      IsFollowUp: FollowUp,
    });
    setSearchLoad(true);
    axiosInstance
      .post("TestData/getCriticalRecord", {
        FromDate: moment(searchData?.FromDate).format("YYYY-MM-DD"),
        ToDate: moment(searchData?.ToDate).format("YYYY-MM-DD"),
        IsCommunicate: Communicate,
        IsFollowUp: FollowUp,
      })
      .then((res) => {
        setTableData(res?.data?.message);
        setSearchLoad(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
        setTableData([]);
        setSearchLoad(false);
      });
  };
  const handleCommunicate = (ele, comm, follow) => {
    setSelectedRow({ ...ele, IsCommunicate: comm, IsFollowUp: follow });
    setCommunicate((prev) => !prev);
  };
  const handleSave = (data) => {
    console.log(data);
    if (data != "") {
      axiosInstance
        .post("TestData/SaveCriticalRecord", {
          ...selectedRow,
          InformedTo: data,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          handleCommunicate({});
          handleSearch(searchData?.IsCommunicate, searchData?.IsFollowUp);
        })
        .catch((err) =>
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          ),
        );
    } else {
      toast.error("Please enter Follow Up..");
    }
  };
  return (
    <>
      {communicate && (
        <SampleRemark
          show={communicate}
          PageName={selectedRow?.InformedTo}
          handleShow={handleCommunicate}
          state={selectedRow}
          handleSave={handleSave}
          title={"Enter Communicate"}
        />
      )}
      <Accordion
        name={t("Critical Record")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="From Date"
              lable="From Date"
              name="FromDate"
              value={searchData?.FromDate}
              onChange={dateSelect}
              maxDate={new Date(searchData?.ToDate)}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="To Date"
              lable="To Date"
              name="ToDate"
              value={searchData?.ToDate}
              maxDate={new Date()}
              minDate={new Date(searchData.FromDate)}
              onChange={dateSelect}
            />
          </div>
          <div className="col-sm-1">
            <button
              type="Search"
              className="btn btn-block btn-info btn-sm"
              onClick={() => handleSearch(0, 0)}
            >
              {t("Search")}
            </button>
          </div>

          <div className="col-sm-1">
            <ExportFile dataExcel={tableData} />
          </div>
          <div className="col-sm-1">
            <button
              type="button"
              className="btn btn-block btn-primary btn-sm"
              onClick={() => handleSearch(0, 0)}
            >
              {t("Pending")}
            </button>
          </div>
          <div className="col-sm-1">
            <button
              type="button"
              className="btn btn-block btn-sm"
              style={{ backgroundColor: "#47cd47", color: "white" }}
              onClick={() => handleSearch(1, 0)}
            >
              {t("Communicate")}
            </button>
          </div>
          <div className="col-sm-1">
            <button
              type="button"
              className="btn btn-block btn-sm"
              style={{ backgroundColor: "#f19dac", color: "white" }}
              onClick={() => handleSearch(0, 1)}
            >
              {t("Follow Up")}
            </button>
          </div>
        </div>
      </Accordion>

      <Accordion title={t("Search Data")} defaultValue={true}>
        {searchLoad ? (
          <Loading />
        ) : tableData?.length > 0 ? (
          <>
            <Tables>
              <thead className="cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Patient ID")}</th>
                  <th>{t("LabNo.")}</th>
                  <th>{t("PatientName")}</th>
                  <th>{t("Request Date")}</th>
                  <th>{t("Parameters")}</th>
                  <th>{t("Result")}</th>
                  <th>{t("Mobile No.")}</th>
                  <th>{t("Ref. Doctor")}</th>
                  <th>{t("Centre")}</th>
                  <th>{t("Marked By")}</th>
                  <th>{t("Communicate")}</th>
                  <th>{t("Follow Up")}</th>
                  <th>{t("Inform Date")}</th>
                  <th>{t("Informed To")}</th>
                  <th>{t("Informed By")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} style={{ backgroundColor: getColor() }}>
                    <td data-title="S.No">{index + 1}</td>
                    <td data-title="Patient ID">{row?.PatientCode}</td>
                    <td data-title="LabNo.">{row?.LedgertransactionNo}</td>

                    <td data-title="PatientName">{row?.PatientName}</td>
                    <td data-title="Request Date">
                      {moment(row?.ApprovedDate).format("DD-MM-YYYY")}
                    </td>
                    <td data-title="Parameters">{row?.Parameters}</td>
                    <td data-title="Result">{row?.Result}</td>
                    <td data-title="Mobile No.">{row?.Mobile}</td>

                    <td data-title="Ref. Doctor">{row?.ReferDoctor}</td>
                    <td data-title="Centre">{row?.centre}</td>
                    <td data-title="Marked By">{row?.MarkedBy}</td>

                    <td data-title="Communicate">
                      <button
                        className="btn btn-primary btn-sm p-1"
                        onClick={() =>
                          handleCommunicate(row, 1, row?.IsFollowUp)
                        }
                      >
                        {t("Communicate")}
                      </button>
                    </td>

                    <td data-title="Follow Up">
                      <button
                        className="btn btn-primary btn-sm p-1"
                        onClick={() =>
                          handleCommunicate(row, row?.IsCommunicate, 1)
                        }
                      >
                        {t("Follow Up")}
                      </button>
                    </td>

                    <td data-title="Inform Date">
                      {row?.InformedDate != "" &&
                        moment(row?.InformedDate).format("DD-MM-YYYY")}
                    </td>
                    <td data-title="Informed To">{row?.InformedTo}</td>
                    <td data-title="Informed By">{row?.InformedBy}</td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </>
        ) : (
          <NoRecordFound />
        )}
      </Accordion>
    </>
  );
};

export default CriticalCalloutRecord;
