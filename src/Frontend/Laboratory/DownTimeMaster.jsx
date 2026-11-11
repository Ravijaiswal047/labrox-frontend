import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import Button from "../../components/formComponent/Button";
import DatePicker from "../../components/formComponent/DatePicker";
import CustomTimePicker from "../../components/formComponent/TimePicker";
import moment from "moment";
import { guidNumber } from "../util/Commonservices";
import DownTimeModal from "../utils/DownTimeModal";
import FullTextEditor from "../../components/formComponent/TextEditor";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { Link } from "react-router-dom";

const DownTimeMaster = () => {
  const [load, setLoad] = useState(false);
  const [show, setShow] = useState({
    modal: false,
    view: "",
  });
  const [Editor, setEditor] = useState("");
  const [Editable, setEditable] = useState(false);
  const [EditorChange, setEditorChange] = useState("");
  const [tableData, setTableData] = useState([]);
  const [showReleasePoints, setShowReleasePoints] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [payload, setPayload] = useState({
    DownTimeDate: new Date(),
    FromTime: moment(new Date().setHours(0, 0, 0, 0)).format("HH:mm:ss"),
    ToTime: moment(new Date().setHours(23, 59, 0, 0)).format("HH:mm:ss"),
    Points: "",
    EmailToClient: 0,
    InhouseEmail: 0,
    IsShowAlertToAllEmployee: 0,
    IsShowAlertToSuperAdmin: 0,
    DownTimeIdHash: guidNumber(),
    IsReviewed: 0,
    IsApproved: 0,
    Id: "",
  });
  console.log(payload, Editable, Editor);
  const { t } = useTranslation();
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (
      name === "EmailToClient" ||
      "InhouseEmail" ||
      "IsShowAlertToAllEmployee" ||
      "IsShowAlertToSuperAdmin"
    ) {
      setPayload({
        ...payload,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      });
    } else {
      setPayload({ ...payload, [name]: value });
    }
  };

  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };

  const handleTime = (time, name) => {
    const timeFormat = moment(time).format("HH:mm:ss");
    setPayload({ ...payload, [name]: timeFormat });
  };

  const handleChange = (data) => {
    setEditorChange(data);
  };

  const handleAddDownTime = (url, data, IsReviewed, IsApproved) => {
    setLoad(true);
    axiosInstance
      .post(url, {
        ...data,
        Points: EditorChange,
        IsReviewed: IsReviewed,
        IsApproved: IsApproved,
        DownTimeDate: moment(data?.DownTimeDate).format("YYYY-MM-DD"),
      })
      .then((res) => {
        setLoad(false);
        toast.success(res?.data?.message);
        fetch();
        setPayload({
          ...payload,
          Id: "",
          DownTimeDate: new Date(),
          FromTime: moment(new Date().setHours(0, 0, 0, 0)).format("HH:mm:ss"),
          ToTime: moment(new Date().setHours(23, 59, 0, 0)).format("HH:mm:ss"),
          Points: "",
          EmailToClient: 0,
          InhouseEmail: 0,
          IsShowAlertToAllEmployee: 0,
          IsShowAlertToSuperAdmin: 0,
          DownTimeIdHash: guidNumber(),
          IsReviewed: 0,
          IsApproved: 0,
        });
        setEditable(true);
        setEditor("");
        setEditorChange("");
      })
      .catch((err) => {
        setLoad(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const fetch = () => {
    setLoad(true);
    axiosInstance
      .get("CompanyMaster/GetDownTimeDetails")
      .then((res) => {
        if (res?.data?.success) {
          const data = res.data?.message.length > 0 ? res.data?.message : "";
          let val = data.map((ele) => {
            return {
              DownTimeDate: ele?.DownTimeDate,
              FromTime: ele?.FromTime,
              ToTime: ele?.ToTime,
              Points: ele?.Points,
              EmailToClient: ele?.EmailToClient,
              InhouseEmail: ele?.InhouseEmail,
              IsShowAlertToAllEmployee: ele?.IsShowAlertToAllEmployee,
              IsShowAlertToSuperAdmin: ele?.IsShowAlertToSuperAdmin,
              Id: ele?.ID.toString(),
              DownTimeIdHash: ele?.DownTimeIdHash,
              DownTimePointsReviewRight: ele?.DownTimePointsReviewRight,
              DownTimePointsApprovalRight: ele?.DownTimePointsApprovalRight,
              IsReviewed: ele?.IsReviewed,
              IsApproved: ele?.IsApproved,
            };
          });
          setTableData(val);
        } else {
          setTableData([]);
          toast.error("No Record Found");
        }

        setLoad(false);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
        setLoad(false);
      });
  };
  console.log(EditorChange);
  const handleUpdate = (data) => {
    setEditable(true);
    setEditorChange(data?.Points);
    setPayload({
      ...data,
      DownTimeDate: new Date(data.DownTimeDate),
    });
  };

  const handleView = (data) => {
    setShowReleasePoints({
      modal: true,
      data: data,
      index: -1,
    });
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      {show?.modal && (
        <UploadFile
          show={show?.modal}
          handleClose={() => setShow({ ...show, modal: false })}
          documentId={
            showReleasePoints?.data?.DownTimeIdHash
              ? showReleasePoints?.data?.DownTimeIdHash
              : payload?.DownTimeIdHash
          }
          pageName={"downtimemaster"}
          viewDoc={show}
        />
      )}
      {showReleasePoints?.modal && (
        <DownTimeModal
          show={showReleasePoints?.modal}
          handleShow={() =>
            setShowReleasePoints({ modal: false, data: "", index: -1 })
          }
          PageName={showReleasePoints?.data}
          title={"View Release Points"}
          setShow={setShow}
        />
      )}
      <Accordion
        name={t("Down Time Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div>
          <div className="row pt-2 pl-2 pr-2">
            <div className="col-sm-2">
              <DatePicker
                className="custom-calendar"
                name="DownTimeDate"
                value={payload?.DownTimeDate}
                onChange={dateSelect}
                placeholder=" "
                id="DownTimeDate"
                lable="DownTimeDate"
                minDate={new Date()}
              />
            </div>
            <div className="col-sm-1 pl-3">
              <CustomTimePicker
                name="FromTime"
                placeholder="FromTime"
                value={moment(payload?.FromTime, "HH:mm:ss").toDate()}
                id="FromTime"
                lable="FromTime"
                onChange={handleTime}
              />
            </div>
            <div className="col-sm-1 pl-3">
              <CustomTimePicker
                name="ToTime"
                placeholder="ToTime"
                value={moment(payload?.ToTime, "HH:mm:ss").toDate()}
                id="ToTime"
                lable="ToTime"
                onChange={handleTime}
              />
            </div>
            <div className="col-sm-1 mt-1 d-flex">
              <div className="mt-1">
                <input
                  id="EmailToClient"
                  name="EmailToClient"
                  type="checkbox"
                  checked={payload?.EmailToClient}
                  onChange={handleInputChange}
                />
              </div>
              <label className="ml-2" htmlFor="EmailToClient">
                {t("EmailToClient")}
              </label>
            </div>
            <div className="col-sm-1 mt-1 d-flex">
              <div className="mt-1">
                <input
                  id="InhouseEmail"
                  name="InhouseEmail"
                  type="checkbox"
                  checked={payload?.InhouseEmail}
                  onChange={handleInputChange}
                />
              </div>
              <label className="ml-2" htmlFor="EmailToClient">
                {t("InhouseEmail")}
              </label>
            </div>
            <div className="col-sm-2 mt-1 d-flex">
              <div className="mt-1">
                <input
                  id="IsShowAlertToAllEmployee"
                  name="IsShowAlertToAllEmployee"
                  type="checkbox"
                  checked={payload?.IsShowAlertToAllEmployee}
                  onChange={handleInputChange}
                />
              </div>
              <label className="ml-2" htmlFor="IsShowAlertToAllEmployee">
                {t("IsShowAlertToAllEmployee")}
              </label>
            </div>
            <div className="col-sm-2 mt-1 d-flex">
              <div className="mt-1">
                <input
                  id="IsShowAlertToSuperAdmin"
                  name="IsShowAlertToSuperAdmin"
                  type="checkbox"
                  checked={payload?.IsShowAlertToSuperAdmin}
                  onChange={handleInputChange}
                />
              </div>
              <label className="ml-2" htmlFor="IsShowAlertToSuperAdmin">
                {t("IsShowAlertToSuperAdmin")}
              </label>
            </div>
            <div className="col-sm-2 col-md-2">
              <button
                className="btn btn-info btn-sm btn-block"
                id="btnUpload"
                onClick={() => {
                  setShow({ modal: true, view: "new" });
                }}
              >
                {t("Upload Release Points")}
              </button>
            </div>
          </div>
          <div className="p-2 col-sm-12">
            <FullTextEditor
              value={EditorChange}
              setValue={handleChange}
              EditTable={Editable}
              setEditTable={setEditable}
            />
          </div>
          <div className="pl-2 pb-2">
            {load ? (
              <Loading />
            ) : (
              <Button
                name={payload.Id ? "Update Down Time" : "Save Down Time"}
                className={"btn btn-sm btn-primary mx-1"}
                handleClick={() =>
                  handleAddDownTime(
                    "CompanyMaster/SaveDownTimeMaster",
                    payload,
                    payload?.IsReviewed,
                    payload?.IsApproved,
                  )
                }
              />
            )}
          </div>
        </div>
      </Accordion>
      <Accordion defaultValue={true}>
        <div className="row p-2">
          <div className="col-12">
            <Tables>
              <thead>
                <tr>
                  <th>{t("Down Time Date")}</th>
                  <th>{t("From Time")}</th>
                  <th>{t("To Time ")}</th>
                  <th>{t("Release Points")}</th>
                  <th>{t("Email To Client")}</th>
                  <th>{t("Inhouse Client")}</th>
                  <th>{t("Show Alert to All Employee")}</th>
                  <th>{t("Show Alert to Super Admin")}</th>
                  <th>{t("Action")}</th>
                  <th>{t("Review")}</th>
                  <th>{t("Approve")}</th>
                </tr>
              </thead>{" "}
              <tbody>
                {tableData?.map((data, index) => (
                  <tr key={index}>
                    <td>{data?.DownTimeDate}</td>
                    <td>{data?.FromTime}</td>
                    <td>{data?.ToTime}</td>
                    <td onClick={() => handleView(data)}>
                      <Link> {t("View")}</Link>
                    </td>
                    <td>{data?.EmailToClient == 1 ? "Yes" : "No"}</td>
                    <td>{data?.InhouseEmail == 1 ? "Yes" : "No"}</td>
                    <td>
                      {data?.IsShowAlertToAllEmployee == 1 ? "Yes" : "No"}
                    </td>
                    <td>{data?.IsShowAlertToSuperAdmin == 1 ? "Yes" : "No"}</td>
                    <td>
                      <i
                        className="fa fa-edit"
                        onClick={() => handleUpdate(data)}
                        style={{ color: "#605ca8", cursor: "pointer" }}
                      ></i>
                    </td>
                    <td>
                      {data?.DownTimePointsReviewRight == 0 ? (
                        ""
                      ) : data?.IsReviewed == 0 ? (
                        <Link
                          onClick={() =>
                            handleAddDownTime(
                              "CompanyMaster/SaveDownTimeMaster",
                              data,
                              1,
                              data.IsApproved,
                            )
                          }
                        >
                          {" "}
                          {t("Review")}
                        </Link>
                      ) : (
                        "Reviewed"
                      )}
                    </td>

                    <td>
                      {data?.DownTimePointsApprovalRight == 0 ? (
                        ""
                      ) : data?.IsApproved == 0 ? (
                        <Link
                          onClick={() =>
                            handleAddDownTime(
                              "CompanyMaster/SaveDownTimeMaster",
                              data,
                              data.IsReviewed,
                              1,
                            )
                          }
                        >
                          {" "}
                          {t("Approve")}
                        </Link>
                      ) : (
                        "Approved"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DownTimeMaster;
