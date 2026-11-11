import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Accordion from "../../../components/UI/Accordion";
import DatePicker from "../../../components/formComponent/DatePicker";
import Heading from "../../../components/UI/Heading";
import ColorCodingSearch from "../../../components/formComponent/ColorCodingSearch";
import { Button } from "react-bootstrap";
import { SelectBoxWithCheckbox } from "../../../components/formComponent/MultiSelectBox";
import { axiosInstance } from "../../../utils/axiosInstance";
import moment from "moment";
import Loading from "../../../components/loader/Loading";
import ReactSelect from "../../../components/formComponent/ReactSelect";
import "../../Sales/TableOverflow.css";
import Tables from "../../../components/UI/customTable";
import NoRecordFound from "../../../components/formComponent/NoRecordFound";
import { FaRegSave } from "react-icons/fa";
import Input from "../../../components/formComponent/Input";
import FunnelDetailsModal from "../../SalesFunnel/FunnelModal/FunnelDetailsModal";
import AddCallModal from "./AddCallModal";
import SaveModal from "./SaveModal";
import { toast } from "react-toastify";
import { SalesConvertedOptions } from "../../../utils/Constants";

const DailyCallReports = () => {
  const { t } = useTranslation();
  const [load, setLoad] = useState(false);
  const [empIds, setEmpIds] = useState([]);

  // modals
  const [show, setShow] = useState(false);
  const [showAddCall, setShowAddCall] = useState(false);
  const [showSave, setShowSave] = useState(false);

  const [selectedRow, setSelectedRow] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    Date: new Date(),
  });
  const [empName, setEmpName] = useState({});

  const [BindFor, setBindFor] = useState([]);
  const [BindForAddCall, setBindForAddCall] = useState([]);
  const [TableData, setTableData] = useState([]);

  const [employeeList, setEmployeeList] = useState([]);

  const employeeOptions = employeeList.map((emp) => ({
    value: emp.EmployeeId,
    label: emp.Name,
  }));

  const dateSelect = (value, name) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleReactChange = (name, e) => {
    setFormData((prev) => ({
      ...prev,
      [name]: e?.value,
    }));

    setEmpName(e?.label);
  };

  const colorCodingData = [
    { color: "#FFB366", labelKey: "MSL" },
    { color: "#80D4FF", labelKey: "Followup Call" },
    { color: "#FF99FF", labelKey: " New Call" },
    { color: "#ADFF2F", labelKey: "Submitted" },
    { color: "#00FFFF", labelKey: "Approved" },
    { color: "#DC1C3E", labelKey: "Rejected" },
  ];

  const getBindCreatedForDropDown = () => {
    axiosInstance
      .get("SalesFunnel/BindCreatedFor")
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.CreatedFor,
            label: ele?.CreatedForName,
          };
        });
        setBindFor(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };
  const getBindCreatedForDropDownAddCall = () => {
    axiosInstance
      .get("SalesFunnel/BindCreatedFor", {
        params: {
          bindfor: "mslapprove",
        },
      })
      .then((res) => {
        const data = res?.data?.message;
        const States = data?.map((ele) => {
          return {
            value: ele?.CreatedFor,
            label: ele?.CreatedForName,
          };
        });
        setBindForAddCall(States);
      })
      .catch((err) => {
        toast.error(err?.res?.data ? err?.res?.data : "Something Went Wrong");
      });
  };

  const handleViewRow = async (id) => {
    try {
      setLoad(true);
      const res = await axiosInstance.post("SalesFunnel/TravelDCRDetail", {
        FunnelId: String(id),
      });
      const resList = res?.data?.message;
      setSelectedRow(resList);
      setShow(true);
      setLoad(false);
    } catch (error) {
      setLoad(false);
      console.log(error);
    }
  };

  const getsearch = async () => {
    try {
      setLoad(true);

      const res = await axiosInstance.post("SalesFunnel/TravelDcrSearch", {
        EmployeeId: String(formData?.employeeId),
        TravelDate: moment(formData?.Date).format("YYYY-MM-DD"),
      });

      if (res?.data?.success) {
        const { dcrData, employeeList } = res.data.data;

        setTableData(dcrData || []);
        setEmployeeList(employeeList || []);
      } else {
        setTableData([]);
        setEmployeeList([]);
      }

      setLoad(false);
    } catch (err) {
      console.error(err);
      setTableData([]);
      setEmployeeList([]);
      setLoad(false);
    }
  };

  const DeleteRow = async (id) => {
    try {
      setLoad(true);

      const res = await axiosInstance.post("SalesFunnel/DcrDelete", {
        DcrId: Number(id),
      });

      if (res?.data?.success) {
        toast.success(res?.data?.message);
        getsearch(); // refresh table
      } else {
        toast.error(res?.data?.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoad(false);
    }
  };

  const handleSaveRow = (row) => {
    try {
      setSelectedRow(row);
      setShowSave(true);
    } catch (error) {
      console.log(error);
    }
  };

  const getRowColor = (val) => {
    if (val.IsApproved === "1") {
      return "aqua";
    } else if (val.IsRejected === "1") {
      return "#dc1c3e";
    } else if (val.IsSubmitted === "1") {
      return "greenyellow";
    } else if (val.DCRType === "MSL") {
      return "#FFB366";
    } else if (val.DCRType === "Followup") {
      return "#80D4FF";
    } else {
      return "#FF99FF";
    }
  };

  useEffect(() => {
    getBindCreatedForDropDown();
    getBindCreatedForDropDownAddCall()
  }, []);

  useEffect(() => {
    getsearch();
  }, [showSave || showAddCall]);

  return (
    <>
      {show && (
        <FunnelDetailsModal
          show={show}
          onHide={() => setShow(false)}
          Dcrdata={selectedRow}
          Dcr={true}
        />
      )}
      {showAddCall && (
        <AddCallModal
          show={showAddCall}
          onHide={() => setShowAddCall(false)}
          employeeList={BindFor}
          date={formData?.Date}
          empId={formData?.employeeId}
          empName={empName}
          AddCallEmployeeList={BindForAddCall}
        />
      )}
      {showSave && (
        <SaveModal
          show={showSave}
          onHide={() => setShowSave(false)}
          Data={selectedRow}
          empIds={selectedRow?.JointWorkRequestedBy || []}
        />
      )}
      <Accordion
        name={t("DailyCall-Reports")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <ReactSelect
              autoSelectFirst={true}
              dynamicOptions={BindFor}
              name="employeeId"
              placeholderName={"Employee"}
              id="employeeId"
              lable={t("Employee")}
              value={formData?.employeeId}
              onChange={handleReactChange}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              name="Date"
              value={formData?.Date}
              className="custom-calendar"
              placeholder=" "
              id="Date"
              lable="Date"
              onChange={dateSelect}
            />
          </div>
          <div
            style={{ gap: "6px" }}
            className="d-flex px-2  d-flex justify-content-start"
          >
            {load ? (
              <Loading />
            ) : (
              <Button className="rounded" onClick={getsearch}>
                Search
              </Button>
            )}

            {load ? (
              <Loading />
            ) : (
              <Button onClick={() => setShowAddCall(true)} className="rounded">
                Add Call
              </Button>
            )}
          </div>
        </div>
        <Heading
          title={"DailyCall-Reports Lists"}
          secondTitle={colorCodingData?.map(({ color, labelKey, id }) => (
            <ColorCodingSearch key={id} color={color} label={t(labelKey)} />
          ))}
        />
        <div className="row px-2 mt-2 mb-2">
          <div className="col-12">
            <Tables removeScrollOverFlow={true} style={{
              maxHeight: "400px",
              overflowY: "auto",
            }}>
              <thead style={{ position: "sticky", top: 0, }}>
                <tr>
                  <th style={{ width: "3%" }}>{t("Call")}</th>
                  <th>{t("Client/Doctor")}</th>
                  <th>{t("Tagged With")}</th>
                  <th>{t("Meeting")}</th>
                  <th>{t("MOM")}</th>
                  <th>{t("Remarks")}</th>
                  {/* <th style={{ width: "3%" }}>{t("Product")}</th> */}
                  <th>{t("Next Follow up")}</th>
                  <th>{t("Last Call MOM")}</th>
                  <th>{t("RejectReason")}</th>
                  <th>{t("Competitor")}</th>
                  <th>{t("JoinCall")}</th>
                  <th>{t("SalesConverted")}</th>
                  <th style={{ width: "4%" }}>{t("Action")}</th>
                </tr>
              </thead>

              <tbody>
                {TableData?.length > 0 ? (
                  TableData.map((row, index) => (
                    <tr
                      key={index}
                      style={{ backgroundColor: getRowColor(row) }}
                    >
                      <td
                        data-title={t("Call")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        {"Call"} {index + 1}
                      </td>
                      <td
                        data-title={t("Client/Doctor")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <span>
                          {row.OrganizationName} |
                          <span
                            style={{ cursor: "pointer", color: "blue" }}
                            onClick={() => handleViewRow(row?.FunnelId)}
                          >
                            Details
                          </span>
                        </span>
                      </td>
                      <td
                        data-title={t("Tagged With")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        {row.CentreName}
                      </td>
                      <td
                        data-title={t("Meeting")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <ReactSelect
                          removeIsClearable={true}
                          className="w-100"
                          dynamicOptions={[
                            { label: t("Yes"), value: "1" },
                            { label: t("No"), value: "0" },
                          ]}
                          value={row.IsMeeting}
                          name="IsMeeting"
                          onChange={(name, opt) =>
                            setTableData((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, [name]: opt.value } : r,
                              ),
                            )
                          }
                        />
                      </td>

                      <td
                        data-title={t("MOM")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <Input
                          value={row.MOM}
                          onChange={(e) =>
                            setTableData((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, MOM: e.target.value } : r,
                              ),
                            )
                          }
                          className="w-100"
                        />
                      </td>

                      <td
                        data-title={t("Remarks")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <Input
                          value={row.Remarks}
                          onChange={(e) =>
                            setTableData((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? { ...r, Remarks: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          className="w-100"
                        />
                      </td>
                      {/* 
                      <td
                        data-title={t("Product")}
                        className="text-center"
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <a
                          title="View"
                          className="fa fa-search coloricon"
                          onClick={""}
                        ></a>
                      </td> */}
                      <td
                        data-title={t("Next Follow Up")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <DatePicker
                          name="NextFollowUp"
                          id={`NextFollowUp_${index}`}
                          value={new Date(row.NextFollowUp)}
                          onChange={(value) =>
                            setTableData((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, NextFollowUp: value } : r,
                              ),
                            )
                          }
                          className="w-100"
                        />
                      </td>

                      <td
                        data-title={t("Last Call MOM")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        {row.LastMOM}
                      </td>
                      <td
                        data-title={t("RejectReason")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        {row.RejectReason}
                      </td>
                      <td
                        data-title={t("Competitor")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <Input
                          value={row.Competitor}
                          onChange={(e) =>
                            setTableData((prev) =>
                              prev.map((r, i) =>
                                i === index
                                  ? { ...r, Competitor: e.target.value }
                                  : r,
                              ),
                            )
                          }
                          className="w-100"
                        />
                      </td>
                        <td
                        data-title={t("Join Call")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                        <SelectBoxWithCheckbox
                          // autoSelectFirst={true}
                          options={employeeOptions}
                          value={row.JointWorkRequestedBy}
                          name="JointWorkRequestedBy"
                          onChange={(val, name) => {
                            const ids = val.map((v) => v.value);
                            setTableData((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, [name]: ids } : r,
                              ),
                            );
                            // setEmpIds((prev) => {
                            //   const updated = [...prev];
                            //   updated[index] = ids;
                            //   return updated;
                            // });
                          }}
                        />
                      </td>
                      <td
                        data-title={t("SalesConverted")}
                        style={{ backgroundColor: getRowColor(row) }}
                      >
                          <ReactSelect
                            dynamicOptions={SalesConvertedOptions}
                            name="SalesConverted"
                            lable={t("SalesConverted")}
                            id="SalesConverted"
                            removeIsClearable={true}
                            // placeholderName={t("SalesConverted")}
                            value={row?.SalesConverted}
                            onChange={(label, value) => {
                            setTableData((prev) =>
                              prev.map((r, i) =>
                                i === index ? { ...r, [label]: value?.value } : r,
                              ),
                            );
                          }}
                          />
                      </td>
                      {row.IsSubmitted === "0" ? (
                        <td
                          data-title={t("Action")}
                          style={{ backgroundColor: getRowColor(row) }}
                        >
                          <>
                            <span
                              className="mr-3"
                              title="Save"
                              style={{ cursor: "pointer" }}
                              onClick={() => {
                                handleSaveRow(row);
                              }}
                            >
                              <FaRegSave size={17} />
                            </span>
                            |
                            <span
                              className="ml-3"
                              title="Delete"
                              style={{ cursor: "pointer" }}
                              onClick={() => DeleteRow(row.DCRId)}
                            >
                              ❌
                            </span>
                          </>
                        </td>
                      ) : (
                        <td
                          data-title={t("Action")}
                          style={{ backgroundColor: getRowColor(row) }}
                          className="text-center"
                        >
                          {"-"}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={20} className="text-center">
                      <NoRecordFound />
                    </td>
                  </tr>
                )}
              </tbody>
            </Tables>
          </div>
        </div>
      </Accordion>
    </>
  );
};

export default DailyCallReports;
