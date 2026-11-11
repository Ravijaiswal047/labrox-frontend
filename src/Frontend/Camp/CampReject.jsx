import moment from "moment";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import { CheckApprovalRights } from "../../utils/NetworkApi/commonApi";
import { isRejected } from "@reduxjs/toolkit";
import CampTestDetailModal from "../utils/CampTestDetailModal";
import CampRejectModal from "../utils/CampRejectModal";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import Accordion from "@app/components/UI/Accordion";
import { CancelButton, SearchButton } from "../../components/UI/CustomButton";
const CampReject = () => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const [rejectshow, setrejectShow] = useState(false);
  const [type, setType] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    FromTime: "00:00",
    ToDate: new Date(),
    ToTime: "23:59",
    Status: "0",
    Type: "0",
  });
  const [accessed, setAccess] = useState([]);
  const IsReject = accessed?.some(
    (item) => item.VerificationType == "3" || item.IsActive == 1,
  );
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event?.target;
    setPayload({ ...payload, [name]: value });
  };

  const StatusType = [
    {
      label: "All",
      value: "0",
    },
    {
      label: "Created",
      value: "1",
    },
    {
      label: "Rejected",
      value: "2",
    },
  ];

  const getType = () => {
    axiosInstance
      .get("centre/getCentreType")
      .then((res) => {
        const data = res?.data?.message;
        const Type = data?.map((ele) => {
          return {
            value: ele?.id,
            label: ele?.Centretype,
          };
        });
        setType(Type);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleSearch = (data) => {
    setLoading(true);

    axiosInstance
      .post("Camp/SearchCampRequest", {
        FromDate: moment(payload?.FromDate).format("YYYY-MM-DD"),
        ToDate: moment(payload?.ToDate).format("YYYY-MM-DD"),
        SearchType: data,
        status: Number(payload?.Status),
        TypeID: payload?.Type,
      })
      .then((res) => {
        if (res?.data?.success) setTableData(res?.data?.message);
        else {
          setTableData([]);
          toast.error("No Record Found");
        }
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message);
        setTableData([]);
        setLoading(false);
      });
  };

  const getColor = (ele) => {
    switch (ele?.IsActive) {
      case 0:
        return "white";
      case 1:
        return "#FFC0CB";
    }
  };
  useEffect(() => {
    getType();
    CheckApprovalRights(setAccess);
  }, []);
  return (
    <>
      {show && (
        <CampTestDetailModal
          selectedData={selectedData}
          show={show}
          onHide={() => {
            setShow(false);
          }}
        />
      )}
      {rejectshow && (
        <CampRejectModal
          title="Camp Details"
          selectedData={selectedData}
          show={rejectshow}
          onHide={() => {
            handleSearch(0);
            setrejectShow(false);
          }}
        />
      )}
      <Accordion
        name={t("Camp Reject")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {!IsReject ? (
          <div className="card-header">
            {" "}
            <p style={{ color: "red" }}>
              {t("You don't have access to this page.")}
            </p>
          </div>
        ) : null}

        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <DatePicker
              name="FromDate"
              id="FromDate"
              value={payload?.FromDate}
              disabled={!IsReject}
              onChange={dateSelect}
              maxDate={new Date()}
              lable={t("From Date")}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="ToDate"
              id="ToDate"
              value={payload?.ToDate}
              disabled={!IsReject}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={new Date(payload?.FromDate)}
              lable={t("To Date")}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={[...StatusType]}
              name="Status"
              id="Status"
              isDisabled={!IsReject}
              selectedValue={payload?.Status}
              onChange={handleChange}
              lable={t("Status")}
            />
          </div>
          {isRejected ? (
            <div className="col-sm-3 d-flex align-items-center">
              <div style={{ display: "flex" }}>
                <div
                  style={{
                    height: "20px",
                    width: "20px",
                    backgroundColor: "#FFC0CB",
                    border: "1px solid black",
                  }}
                  onClick={() => {
                    handleSearch(3);
                  }}
                ></div>

                <label style={{ marginLeft: "5px", marginRight: "25px" }}>
                  {t("Created")}
                </label>

                <div
                  style={{
                    height: "20px",
                    width: "20px",
                    backgroundColor: "white",
                    border: "1px solid black",
                  }}
                  onClick={() => {
                    handleSearch(4);
                  }}
                ></div>
                <label style={{ marginLeft: "5px" }}>{t("Rejected")}</label>
                <div className="col-sm-3">
                  <SearchButton
                    text={"Search"}
                    style={{ marginLeft: "25px" }}
                    disabled={!IsReject}
                    onClick={() => handleSearch(0)}
                  />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {tableData?.length > 0 ? (
          <>
            {loading ? (
              <Loading />
            ) : (
              <Tables>
                <thead className="cf">
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Camp Centre")}</th>
                    <th>{t("Camp Name")}</th>
                    <th>{t("Camp Type")}</th>
                    <th>{t("Camp Date")}</th>
                    <th>{t("Created By")}</th>
                    <th>{t("Created Date	")}</th>
                    <th>{t("Reject")}</th>
                    <th>{t("View Test")}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData?.map((ele, index) => (
                    <tr key={index} style={{ backgroundColor: getColor(ele) }}>
                      <td data-title="S.No">{index + 1}&nbsp;</td>
                      <td data-title="Camp Centre">
                        {ele?.Company_Name}&nbsp;
                      </td>
                      <td data-title="Camp Name">{ele?.CampName}&nbsp;</td>
                      <td data-title="Camp Type">{ele?.CampType}&nbsp;</td>
                      <td data-title="Camp Date">{ele?.StartDate}&nbsp;</td>
                      <td data-title="Created By">{ele?.CreatedBy}&nbsp;</td>
                      <td data-title="Created Date">
                        {ele?.CreatedDate}&nbsp;
                      </td>
                      <td data-title="Reject">
                        {ele?.IsActive === 1 ? (
                          <CancelButton
                            text={"Reject"}
                            onClick={() => {
                              setSelectedData(ele);
                              setrejectShow("rejectshow");
                            }}
                          />
                        ) : (
                          <></>
                        )}
                        &nbsp;
                      </td>
                      <td data-title="View Test">
                        <i
                          className="fa fa-search"
                          onClick={() => {
                            setSelectedData(ele);
                            setShow("show");
                          }}
                        />{" "}
                        &nbsp;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Tables>
            )}
          </>
        ) : (
          <>
            <NoRecordFound />
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default CampReject;
