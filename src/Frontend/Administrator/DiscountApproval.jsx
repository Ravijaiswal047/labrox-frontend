import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Accordion from "@app/components/UI/Accordion";
import Input from "../../components/formComponent/Input";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import { isChecked } from "../util/Commonservices";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { dateConfig, number, shouldIncludeAIIMSID } from "../../utils/helpers";
import { CustomButton, SearchButton } from "../../components/UI/CustomButton";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Pagination from "../../Pagination/Pagination";
import { SearchBy, StatusCheck } from "../../utils/Constants";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";

const DiscountApproval = () => {
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [testDetailDialog, setTestDetailDialog] = useState({ visible: false, details: [] });
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const [payload, setPayload] = useState({
    selectTypes: "",
    itemValue: "",
    fromDate: new Date(),
    fromTime: "00:00",
    toDate: new Date(),
    toTime: "23:59",
    centreID: [],
    discountApprovedByID: "",
    isDiscountApproved: 0,
  });

  const userData = useLocalStorage("userData", "get");
  const isDiscountApprovedByOther = userData?.IsDiscountApprovedByOther;
  const [notApproved, setNotApproved] = useState(false);
  console.log("isDiscountApprovedByOther", isDiscountApprovedByOther);

  const [Center, setCenter] = useState([]);
  const [loading, setLoading] = useState(false);
  const [DiscApprove, setDiscApprove] = useState([]);
  const [tableData, setTableData] = useState([]);

  const { t } = useTranslation();

  const getRowStyle = (isDiscountApproved) => {
    const val = Number(isDiscountApproved);
    if (val === 1) return { backgroundColor: "#90ee90" }; // Approved (Success Green)
    if (val === -1) return { backgroundColor: "#f5c6cb" }; // Rejected (Failed Red)
    if (val === 0) return { backgroundColor: "#fff3cd" }; // Pending (Pending Yellow)
    return {};
  };

  const getAccessCentres = () => {
    axiosInstance
      .get("Centre/getAccessCentres")
      .then((res) => {
        let data = res.data.message;
        let CentreDataValue = data.map((ele) => ({
          value: ele.CentreID,
          label: ele.Centre,
        }));
        setCenter(CentreDataValue);
      })
      .catch((err) => console.log(err));
  };

  const getDiscountApproval = () => {
    axiosInstance
      .get("DiscountApprovalByEmployee/BindDiscApprovedBy")
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.message)) {
          const data = res?.data?.message;
          const val = data.map((ele) => ({
            label: ele?.EmployeeName,
            value: ele?.EmployeeID,
          }));
          val.unshift({ label: "Discount Approved By", value: "" });
          setDiscApprove(val);
        }
      })
      .catch((err) => {
        console.log("Error while getting approved by", err)
      });
  };

  useEffect(() => {
    if (Number(isDiscountApprovedByOther) === 0 && DiscApprove.length > 0) {
      const found = DiscApprove.find(
        (item) => Number(item.value) === Number(userData?.EmployeeID)
      );
      if (found) {
        setPayload((prev) => ({
          ...prev,
          discountApprovedByID: found.value,
        }));
        setNotApproved(false);
      } else {
        setNotApproved(true);
        setPayload((prev) => ({ ...prev, discountApprovedByID: "" }));
      }
    }
  }, [DiscApprove, isDiscountApprovedByOther, userData?.EmployeeID]);

  const handleReactSelectChange = (name, options) => {
    setPayload({ ...payload, [name]: options.value });
  };

  const handleMultiSelectChange = (name, value) => {
    setPayload({ ...payload, [name]: value });
  };

  useEffect(() => {
    getAccessCentres();
    getDiscountApproval();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const searchFilteredData = useMemo(() => {
    return tableData
      .map((item, index) => ({ ...item, originalIndex: index }))
      .filter((item) => {
        return (
          item?.PatientName?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
          item?.LedgerTransactionNo?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
          item?.Centre?.toLowerCase()?.includes(searchText?.toLowerCase())
        );
      });
  }, [tableData, searchText]);

  const summary = useMemo(() => {
    return searchFilteredData.reduce(
      (acc, ele) => {
        acc.gross += Number(ele?.GrossAmount || 0);
        acc.discount += Number(ele?.DiscountOnTotal || 0);
        acc.net += Number(ele?.NetAmount || 0);
        const status = Number(ele?.IsDiscountApproved);
        if (status === 0) acc.pending += 1;
        if (status === 1) acc.approved += 1;
        if (status === -1) acc.rejected += 1;
        return acc;
      },
      { gross: 0, discount: 0, net: 0, pending: 0, approved: 0, rejected: 0 }
    );
  }, [searchFilteredData]);

  const filteredTableData = useMemo(() => {
    return searchFilteredData.filter((item) => {
      return (
        payload?.isDiscountApproved === 2 ||
        Number(item?.IsDiscountApproved) === Number(payload?.isDiscountApproved)
      );
    });
  }, [searchFilteredData, payload?.isDiscountApproved]);

  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * pageSize;
    const lastPageIndex = firstPageIndex + pageSize;
    return filteredTableData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, pageSize, filteredTableData]);

  const handleKeyDown = (e) => {
    if (e?.key === "Enter") getTableData();
  };

  const getTableData = () => {
    setLoading(true);
    axiosInstance
      .post("DiscountApprovalByEmployee/getDiscountApprovalData", {
        ...payload,
        fromDate: moment(payload?.fromDate).format("DD-MMM-YYYY"),
        toDate: moment(payload?.toDate).format("DD-MMM-YYYY"),
        centreID: payload?.centreID?.map((c) => Number(c)) || [],
        discountApprovedByID: Number(payload?.discountApprovedByID || ""),
        isDiscountApproved: 2, // Always fetch all for client-side filtering
      })
      .then((res) => {
        if(res?.data.success && Array.isArray(res?.data?.message)){
          const data = res?.data?.message;
          const val = data?.map((ele) => ({ ...ele, isChecked: false }));
          setTableData(val);
          setLoading(false);
          setCurrentPage(1);
        } else {
          toast.error(res?.data?.message);
          setTableData([]);
          setLoading(false);
          setCurrentPage(1);
        }
      })
      .catch((err) => {
        toast.error(
          err?.data?.message ? err?.data?.message : "Something Went Wrong"
        );
        setLoading(false);
      });
  };

  const handleChangeNew = (e, index) => {
    const { name, checked } = e.target;
    if (index >= 0) {
      const data = [...tableData];
      data[index][name] = checked;
      setTableData(data);
    } else {
      const data = [...tableData];
      filteredTableData.forEach((ele) => {
        if (Number(ele?.IsDiscountApproved) === 0) {
          data[ele.originalIndex].isChecked = checked;
        }
      });
      setTableData(data);
    }
  };

  const handleTime = (time, secondName) => {
    const TimeStamp = time?.Hour + ":" + time?.Minute + ":" + time?.second;
    setPayload({ ...payload, [secondName]: TimeStamp });
  };

  const postApi = (status) => {
    const data = tableData
      .filter((ele) => ele?.isChecked)
      .map((ele) => ({
        ...ele,
        IsDiscountApproved: status,
      }));

    if (data.length > 0) {
      setLoading(true);
      axiosInstance
        .post("DiscountApprovalByEmployee/UpdateDiscApprovedBy", data)
        .then((res) => {
          if (res.data?.success) {
            toast.success(res?.data?.message);
            getTableData();
          } else {
            toast.error(res?.data?.message);
            setLoading(false);
          }
        })
        .catch((err) => {
          toast.error(
            err?.data?.message ? err?.data?.message : "Something Went Wrong"
          );
          setLoading(false);
        });
    } else {
      toast.error("please Choose One Test");
    }
  };

  const dateSelect = (value, name) => {
    setPayload({ ...payload, [name]: value });
  };

  const handleOpenTestDetail = (ele) => {
    let details = [];
    try { details = JSON.parse(ele?.TestDetails || "[]"); } catch {}
    setTestDetailDialog({ visible: true, details });
  };

  const handleCloseTestDetail = () => {
    setTestDetailDialog({ visible: false, details: [] });
  };

  return (
    <>
      {(() => {
        const hasRefund = testDetailDialog.details.some((d) => d?.IsRefund === 1);
        return (
          <Dialog
            header={t("Test Details")}
            visible={testDetailDialog.visible}
            onHide={handleCloseTestDetail}
            className={theme}
            style={{ width: isMobile ? "95vw" : "55vw" }}
          >
            {testDetailDialog.details.length > 0 ? (
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Department")}</th>
                    <th>{t("Test Code")}</th>
                    <th>{t("Test Name")}</th>
                    <th>{t("Status")}</th>
                    {hasRefund && <th>{t("Refunded")}</th>}
                  </tr>
                </thead>
                <tbody>
                  {testDetailDialog.details.map((d, di) => (
                    <tr key={di}>
                      <td>{di + 1}</td>
                      <td>{d?.DepartmentName}</td>
                      <td>{d?.TestCode}</td>
                      <td>{d?.TestName}</td>
                      <td className={`Status-${d?.Status}`}>
                        {StatusCheck[d?.Status] || d?.Status}
                      </td>
                      {hasRefund && (
                        <td style={{ textAlign: "center" }}>
                          {d?.IsRefund === 1 ? (
                            <i className="fa fa-check text-danger" />
                          ) : (
                            <span style={{ color: "#aaa" }}>—</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Tables>
            ) : (
              <NoRecordFound />
            )}
          </Dialog>
        );
      })()}
      <Accordion
        name="Discount Approval"
        isBreadcrumb={true}
        defaultValue={true}
        linkTo="#"
        linkTitle={
          <>
          {tableData.length>0 && <div
            className="d-flex align-items-center"
            style={{ gap: "10px", flexWrap: "wrap" }}
          >
            <div className="link-title-container" id="pr_id_11">
              <div className="link-title-item">
                {t("Gross")} : {summary.gross.toFixed(2)}
              </div>
              <div className="link-title-item">
                {t("Disc")} : {summary.discount.toFixed(2)}
              </div>
              <div className="link-title-item">
                {t("Net")} : {summary.net.toFixed(2)}
              </div>
            </div>
          </div>}
          </>
        }
      >
        <div className="row px-2 mt-2">
          <div className="col-sm-2">
            <div className="d-flex" style={{ display: "flex" }}>
              <div style={{ width: "50%" }}>
                <SelectBox
                  options={[
                    ...SearchBy,
                    ...(shouldIncludeAIIMSID()
                      ? [{ label: "AIIMSID", value: "AIIMSID" }]
                      : []),
                  ]}
                  selectedValue={payload?.selectTypes}
                  name="selectTypes"
                  id="selectTypes"
                  lable="Select Type"
                  onChange={handleChange}
                />
              </div>
              <div style={{ width: "50%" }}>
                {payload?.selectTypes === "Mobile" ? (
                  <Input
                    className="select-input-box form-control input-sm"
                    type="number"
                    name="itemValue"
                    max={10}
                    onKeyDown={handleKeyDown}
                    value={payload?.itemValue}
                    onChange={handleChange}
                    onInput={(e) => number(e, 10)}
                  />
                ) : (
                  <Input
                    className="select-input-box form-control input-sm"
                    type="text"
                    name="itemValue"
                    max={20}
                    onKeyDown={handleKeyDown}
                    value={payload?.itemValue}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-2">
            <DatePicker
              name="fromDate"
              value={payload?.fromDate}
              onChange={dateSelect}
              className="custom-calendar"
              placeholder=" "
              id="fromDate"
              lable="From Date"
              maxDate={new Date()}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              name="toDate"
              value={payload?.toDate}
              onChange={dateSelect}
              className="custom-calendar"
              placeholder=" "
              id="toDate"
              lable="To Date"
              maxDate={new Date()}
              minDate={new Date(payload.fromDate)}
            />
          </div>

          <div className="col-sm-2">
            <MultiSelectComp
              options={Center}
              name="centreID"
              placeholder=""
              id="centreID"
              label="Centre"
              value={payload?.centreID}
              onChange={handleMultiSelectChange}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={DiscApprove}
              name="discountApprovedByID"
              placeholderName={"Discount Approved By"}
              removeIsClearable={true}
              id="discountApprovedByID"
              label="Discount Approved By"
              value={payload?.discountApprovedByID}
              onChange={handleReactSelectChange}
              isDisabled={Number(isDiscountApprovedByOther) === 0}
            />
          </div>
          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "Pending", value: 0 },
                { label: "Approved", value: 1 },
                { label: "Rejected", value: -1 },
                { label: "All", value: 2 },
              ]}
              name="isDiscountApproved"
              placeholderName={"Status"}
              removeIsClearable={true}
              id="isDiscountApproved"
              label="Status"
              value={payload?.isDiscountApproved}
              onChange={handleReactSelectChange}
              isDisabled={isDiscountApprovedByOther === 0}
            />
          </div>

          <div className="col-sm-1 mb-2">
            <SearchButton text={"Search"} onClick={getTableData} />
          </div>

          {summary.pending > 0 && (
            <>
              <div className="col-sm-1 mb-2">
                <CustomButton
                  variant="success"
                  text={t("Approve")}
                  icon={"save"}
                  className="col-sm-12"
                  onClick={() => postApi(1)}
                  style={{
                    backgroundColor: "#28a745",
                    borderColor: "#28a745",
                    color: "white",
                  }}
                />
              </div>
              <div className="col-sm-1 mb-2">
                <CustomButton
                  variant="danger"
                  text={t("Reject")}
                  icon={"cancel"}
                  className="col-sm-12"
                  onClick={() => postApi(-1)}
                  style={{
                    backgroundColor: "#dc3545",
                    borderColor: "#dc3545",
                    color: "white",
                  }}
                />
              </div>
            </>
          )}
        </div>
        {notApproved && (
          <div className="row px-2">
            <div className="col-sm-12 text-center">
              <h3 style={{ color: "red", fontWeight: "bold" }}>
                {t("You don’t have permission to approve discounts. Please reach out to an authorized person.")}
              </h3>
            </div>
          </div>
        )}
      </Accordion>

      {loading ? (
        <Loading />
      ) : (
        <>
          <Accordion
            title={t("Search Detail")}
            defaultValue={true}
            notOpen={true}
            linkTo="#"
            linkTitle={
              <div className="d-flex align-items-center" style={{ gap: "10px", flexWrap: "wrap" }}>
                

                <div className="d-flex align-items-center" style={{ gap: "10px", marginLeft: "10px" }}>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPayload({ ...payload, isDiscountApproved: 2 });
                    }}
                    style={{
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 800,
                      color: payload.isDiscountApproved === 2 ? "#007bff" : "#555",
                      borderBottom: payload.isDiscountApproved === 2 ? "2px solid #007bff" : "none"
                    }}
                  >
                    {t("All")} ({searchFilteredData.length})
                  </div>

                  {[
                    { id: 0, color: "#fff3cd", label: "Pending", count: summary.pending },
                    { id: 1, color: "#90ee90", label: "Approved", count: summary.approved },
                    { id: -1, color: "#f5c6cb", label: "Rejected", count: summary.rejected },
                  ].map((item) => (
                    <ColorCodingSearch
                      key={item.id}
                      color={item.color}
                      label={`${t(item.label)} (${item.count})`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPayload({ ...payload, isDiscountApproved: item.id });
                      }}
                      cursor="pointer"
                    />
                  ))}
                </div>

                <Input
                  type="text"
                  placeholder="Search Detail..."
                  value={searchText}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mt-0"
                  style={{ width: "150px", height: "25px" }}
                />
              </div>
            }
          >
            {filteredTableData?.length > 0 ? (() => {
              const colHeaders = [
                t("S.No"),
                t("Billing Date"),
                t("Booking Centre"),
                t("Visit No"),
                t("Patient Name"),
                t("Gender"),
                t("Gross Amt."),
                t("Discount Amt."),
                t("Net Amt."),
                t("Dis Reason"),
                t("Created By"),
                t("Approved By"),
                t("Test Detail"),
                t("Action"),
              ];
              return (
              <>
                <Tables>
                  <thead className="cf">
                    <tr>
                      {colHeaders.map((ele, index) => (
                        index === colHeaders.length - 1 ? (
                          <th key={index}>
                            <input
                              type="checkbox"
                              checked={
                                filteredTableData.length > 0 &&
                                filteredTableData
                                  .filter((ele) => Number(ele?.IsDiscountApproved) === 0)
                                  .every((ele) => ele.isChecked) &&
                                filteredTableData.some((ele) => Number(ele?.IsDiscountApproved) === 0)
                              }
                              onChange={handleChangeNew}
                            />
                          </th>
                        ) : (
                          <th key={index}>{ele}</th>
                        )
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData?.map((ele, index) => (
                      <tr
                        key={index}
                        style={getRowStyle(ele?.IsDiscountApproved)}
                      >
                        {[
                          (currentPage - 1) * pageSize + index + 1,
                          (ele?.BillingDATE),
                          ele?.Centre,
                          ele?.LedgerTransactionNo,
                          ele?.PatientName,
                          ele?.Gender,
                          ele?.GrossAmount,
                          ele?.DiscountOnTotal,
                          ele?.NetAmount,
                          ele?.DiscountReason,
                          ele?.CreatedByName,
                          ele?.DiscountApprovedByName,
                          <i
                            className="fa fa-eye coloricon"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleOpenTestDetail(ele)}
                          />,
                          Number(ele?.IsDiscountApproved) === 0 ? (
                            <input
                              type="checkbox"
                              checked={ele?.isChecked}
                              name="isChecked"
                              onChange={(e) =>
                                handleChangeNew(e, ele.originalIndex)
                              }
                            />
                          ) : [1, -1].includes(Number(ele?.IsDiscountApproved)) ? (
                            <div className="text-left" style={{ fontSize: "11px" }}>
                              <div>
                                <strong style={{ color: "black" }}>
                                  {Number(ele?.IsDiscountApproved) === 1
                                    ? "AppBy :"
                                    : "RegBy :"}
                                </strong>{" "}
                                {ele?.DiscountApprovedByNameSession}
                              </div>
                              <div>
                                <strong style={{ color: "black" }}>
                                  {Number(ele?.IsDiscountApproved) === 1
                                    ? "App Date :"
                                    : "Reg Date :"}
                                </strong>{" "}
                                {ele?.DiscountApprovedDate}
                              </div>
                            </div>
                          ) : (
                            "-"
                          ),
                        ].map((item, i) => (
                          <td key={i} data-title={colHeaders[i] ?? ""}>
                            {item}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Tables>

                {/* Pagination */}
                {filteredTableData.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-end align-items-end gap-2">
                    {filteredTableData.length >= 50 && (
                      <div style={{ minWidth: "150px" }}>
                        <ReactSelect
                          value={pageSize}
                          dynamicOptions={[
                            { label: "25", value: 25 },
                            { label: "50", value: 50 },
                            { label: "100", value: 100 },
                            { label: "150", value: 150 },
                          ]}
                          name={"pageSize"}
                          label={t("pageSize")}
                          removeIsClearable={true}
                          onChange={(_name, value) => {
                            setPageSize(value?.value);
                            setCurrentPage(1);
                          }}
                        />
                      </div>
                    )}
                    <Pagination
                      className="pagination-bar"
                      currentPage={currentPage}
                      totalCount={filteredTableData.length}
                      pageSize={pageSize}
                      onPageChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}

                  {/* Approve/Reject buttons moved to header */}
                </>
              );
            })() : (
              <NoRecordFound />
            )}
            </Accordion>
          </>
        )}
    </>
  );
};

export default DiscountApproval;