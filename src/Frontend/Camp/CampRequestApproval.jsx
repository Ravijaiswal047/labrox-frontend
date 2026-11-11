import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { axiosInstance } from "../../utils/axiosInstance";
import { CheckApprovalRights } from "../../utils/NetworkApi/commonApi";
import { toast } from "react-toastify";
import moment from "moment";
import CampTestDetailModal from "../utils/CampTestDetailModal";
import Accordion from "@app/components/UI/Accordion";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { SearchButton } from "../../components/UI/CustomButton";

const CampRequestApproval = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [type, setType] = useState([]);
  const [show, setShow] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [approvscreen, setapprovscreen] = useState(false);
  const [selectedData, setSelectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    FromTime: "00:00",
    ToDate: new Date(),
    ToTime: "23:59",
    Status: "-1",
    Type: "0",
  });
  const dateSelect = (date, name) => {
    setPayload({
      ...payload,
      [name]: date,
    });
  };
  //   const { data } = useContext(MyContext);
  const [accessed, setAccess] = useState([]);

  const access = accessed?.some(
    (item) => item.VerificationType == "2" && item.IsActive == 1,
  );

  const IsApprove = accessed?.some(
    (item) => item.VerificationType == "3" && item.IsActive == 1,
  );
  console.log(IsApprove);
  const StatusType = [
    {
      label: "All",
      value: "-1",
    },
    {
      label: "Pending",
      value: "0",
    },
    {
      label: "Approved",
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
  const handleChange = (event) => {
    const { name, value } = event?.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleSearch = (data) => {
    setLoading(true);
    const updatedFormData = {
      FromDate: moment(payload?.FromDate).format("YYYY-MM-DD 00:00:00"),
      ToDate: moment(payload?.ToDate).format("YYYY-MM-DD 23:59:59"),
      SearchType: data,
      status: ["2", "3", "4"].includes(data) ? "-1" : payload?.Status,
      TypeID: payload?.Type,
    };
    axiosInstance
      .post("Camp/SearchCampRequestforapproval", updatedFormData)
      .then((res) => {
        setTableData(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong.",
        );
        setTableData([]);
        setLoading(false);
      });
  };

  const handleCampCreate = (ele) => {
    setLoading(true);
    axiosInstance
      .post("", { ID: ele?.id })
      .then((res) => {
        toast.success(res?.data?.message);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  const handleapprovereject = (ele) => {
    axiosInstance
      .post("Camp/CheckCampRequest", {
        ID: ele?.ID,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(ele);
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
      <Accordion
        name={t("Camp Approval Search")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        {!access ? (
          <div className="card-header">
            {" "}
            <p style={{ color: "red", padding: "2px" }}>
              {t("You don't have access to this page.")}
            </p>
          </div>
        ) : null}

        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2 ">
            <DatePicker
              name="FromDate"
              id="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
              disabled={!access}
              placeholder=""
              lable={t("From Date")}
            />
          </div>
          <div className="col-sm-2 ">
            <DatePicker
              name="ToDate"
              id="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              maxDate={new Date()}
              minDate={new Date(payload?.FromDate)}
              disabled={!access}
              placeholder=""
              lable={t("To Date")}
            />
          </div>
          <div className="col-sm-2">
            <SelectBox
              options={[...StatusType]}
              name="Status"
              id="Status"
              selectedValue={payload?.Status}
              onChange={handleChange}
              isDisabled={!access}
              placeholder=""
              lable={t("Status")}
            />
          </div>
          <div className="col-sm-4">
            <div style={{ display: "flex" }}>
              <div
                style={{
                  height: "20px",
                  width: "20px",
                  backgroundColor: "#b0c4de",
                  border: "1px solid black",
                  marginLeft: "10px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (access) {
                    handleSearch("2");
                  }
                }}
              ></div>
              <label style={{ marginRight: "10px", marginLeft: "10px" }}>
                {t("Pending")}
              </label>

              <div
                style={{
                  height: "20px",
                  width: "20px",
                  backgroundColor: "#FFC0CB",
                  border: "1px solid black",
                  cursor: "pointer",
                }}
                disabled={!access}
                onClick={() => {
                  if (access) {
                    handleSearch("3");
                  }
                }}
              ></div>

              <label style={{ marginLeft: "25px", marginRight: "25px" }}>
                {t("Approved")}
              </label>

              <div
                style={{
                  height: "20px",
                  width: "20px",
                  backgroundColor: "white",
                  border: "1px solid black",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (access) {
                    handleSearch("4");
                  }
                }}
                disabled={!access}
              ></div>
              <label style={{ marginLeft: "25px" }}>{t("Rejected")}</label>
            </div>
          </div>
          <div className="col-sm-1">
            <SearchButton
                text={"Search"}
                onClick={() => handleSearch("0")}
              disabled={!access}
            />
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {loading ? (
          <Loading />
        ) : (
          <>
            {tableData?.length > 0 ? (
              <>
                <Tables>
                  <thead className="cf">
                    <tr>
                      <th>{t("S.No.")}</th>
                      <th>{t("Camp Centre")}</th>
                      <th>{t("Camp Name")}</th>
                      <th>{t("Camp Type")}</th>
                      <th>{t("Camp Start Date")}</th>
                      <th>{t("Camp End Date")}</th>
                      <th>{t("Created By")}</th>
                      <th>{t("Created Date")}</th>
                      <th>{t("Approved/Reject")}</th>
                      <th>{t("View Test")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData?.map((ele, index) => (
                      <tr
                        key={index}
                        style={{
                          backgroundColor: ele.IsActive
                            ? ele.IsApproved
                              ? "#FFC0CB"
                              : "#b0c4de"
                            : "white",
                        }}
                      >
                        <td data-title={t("S.No")}>{index + 1}</td>
                        <td data-title={t("Camp Centre")}>
                          {ele?.Company_Name}
                        </td>
                        <td data-title={t("Camp Name")}>{ele?.CampName}</td>
                        <td data-title={t("Camp Type")}>{ele?.CampType}</td>
                        <td data-title={t("Camp Start Date")}>
                          {ele?.StartDate}
                        </td>
                        <td data-title={t("Camp End Date")}>{ele?.EndDate}</td>
                        <td data-title={t("Created By")}>{ele?.CreatedBy}</td>
                        <td data-title={t("Created Date")}>
                          {ele?.CreatedDate}
                        </td>
                        {console.log(IsApprove)}
                        <td data-title={t("Approved Reject")}>
                          {!IsApprove &&
                          ele.IsApproved === 0 &&
                          ele.IsActive === 1 ? (
                            <span
                              style={{
                                fontWeight: "bold",
                                color: "#b24040",
                              }}
                            >
                              {t("Don't Have Rights To Approve")}
                            </span>
                          ) : (
                            ele.IsActive === 1 &&
                            ele.IsApproved === 0 && (
                              <Link
                                to="/camprequest"
                                state={{
                                  data: ele,
                                  id: ele?.ID,
                                }}
                                style={{
                                  fontWeight: "bold",
                                  color: "#b24040",
                                }}
                              >
                                {t("Approved / Reject")}
                              </Link>
                            )
                          )}
                        </td>
                        <td data-title={t("View Test")}>
                          {
                            <div
                              className="fa fa-search"
                              onClick={() => {
                                setSelectedData(ele);
                                setShow("show");
                              }}
                            ></div>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Tables>
              </>
            ) : (
              <>
                <NoRecordFound />
              </>
            )}
          </>
        )}{" "}
      </Accordion>
    </>
  );
};

export default CampRequestApproval;
