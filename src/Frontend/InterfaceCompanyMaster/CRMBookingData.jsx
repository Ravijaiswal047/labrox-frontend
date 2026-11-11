import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import moment from "moment";
import Accordion from "@components/UI/Accordion";
import ReactSelect from "@components/formComponent/ReactSelect";
import Input from "@components/formComponent/Input";
import DatePicker from "@components/formComponent/DatePicker";
import Tables from "@components/UI/customTable";
import Loading from "@components/loader/Loading";
import { axiosInstance } from "@app/utils/axiosInstance";
import { SearchButton, CustomButton } from "../../components/UI/CustomButton";
import ColorCodingSearch from "../../components/ModalComponent/ColorCodingSearch";
import DateTimeCell from "../../utils/DateTimeCell";
import Pagination from "../../Pagination/Pagination";
import { axiosReport } from "../../utils/axiosInstance";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const colorCodingData = [
  { color: "#c3e6cb", id: "booked", labelKey: "Booked" },
  { color: "#ffeeba", id: "pending", labelKey: "Pending" },
  { color: "#f5c6cb", id: "fail", labelKey: "Failed" },
];

const statusColorMap = {
  Booked: "#c3e6cb",
  Pending: "#ffeeba",
  Failed: "#f5c6cb",
};

const initialPayload = {
  InterfaceCompany: "",
  PatientID: "",
  WorkOrderID: "",
  FromDate: new Date(),
  ToDate: new Date(),
};

const CRMBookingData = () => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [companyOptions, setCompanyOptions] = useState([]);
  const [payload, setPayload] = useState(initialPayload);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalBooked, setTotalBooked] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [exporting, setExporting] = useState(false);

  // ---- Repush Order/Report: simple explanation ----
  // repushOrderLoading: remembers which row's "Repush Order" button is
  // currently loading, so only that row's button shows the spinner.
  const [repushOrderLoading, setRepushOrderLoading] = useState({});
  // repushReportModal: controls the "Repush Report" popup — show/hide it,
  // and remember which row (data) it was opened for.
  const [repushReportModal, setRepushReportModal] = useState({
    show: false,
    data: null,
  });
  // repushStatus: which radio button the user picked inside the popup —
  // "Approved" or "Rejected".
  const [repushStatus, setRepushStatus] = useState("");
  // repushReportLoading: true while the Submit button's API call is running.
  const [repushReportLoading, setRepushReportLoading] = useState(false);

  const fetchCompanies = () => {
    axiosInstance
      .get("ItemMasterInterface/GetInterfacemasterById")
      .then((res) => {
        const data = res?.data?.message ?? [];
        const active = data
          .filter((item) => item?.IsActive === 1)
          .map((item) => ({ value: item?.ID, label: item?.CompanyName }));
        setCompanyOptions(active);
      })
      .catch((err) => toast.error(err?.response?.data?.message ?? "Something Went Wrong"));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSelectChange = (label, value) => {
    setPayload((prev) => ({ ...prev, [label]: value?.value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const getBookingStatus = (isBooked) => {
    if (Number(isBooked) === 1) return "Booked";
    if (Number(isBooked) === -1) return "Failed";
    return "Pending";
  };

  // Booked/Pending/Failed counts come from the backend (totals across every
  // page of the current filter) rather than being computed from the loaded
  // page's rows, which would only ever reflect the current page.
  const statusCounts = {
    all: totalCount,
    booked: totalBooked,
    pending: totalPending,
    fail: totalFailed,
  };

  const filteredData = tableData.filter((d) => {
    if (statusFilter === "booked") return Number(d?.IsBooked) === 1;
    if (statusFilter === "pending") return Number(d?.IsBooked) === 0;
    if (statusFilter === "fail") return Number(d?.IsBooked) === -1;
    return true;
  });

  // Shared with export — same filter fields the backend expects for both
  // CRMIntegration/GetBookingData and CRMIntegration/export-booking-data.
  const buildFilterPayload = (page, size) => ({
    interfaceClientID: payload?.InterfaceCompany ? [payload.InterfaceCompany] : [],
    workOrderID: payload?.WorkOrderID ?? "",
    patientID: payload?.PatientID ?? "",
    fromDate: moment(payload?.FromDate).format("DD-MMM-YYYY"),
    toDate: moment(payload?.ToDate).format("DD-MMM-YYYY"),
    pageNumber: page,
    pageSize: size,
  });

  const handleSearch = (page = 1, size = pageSize) => {
    setLoading(true);
    setStatusFilter("all");
    setCurrentPage(page);

    axiosInstance
      .post("CRMIntegration/GetBookingData", buildFilterPayload(page, size))
      .then((res) => {
        if (res?.data?.success && Array.isArray(res?.data?.message)) {
          setTableData(res?.data?.message ?? []);
          setTotalCount(res?.data?.data?.totalCount || 0);
          setTotalBooked(res?.data?.data?.totalBooked || 0);
          setTotalPending(res?.data?.data?.totalPending || 0);
          setTotalFailed(res?.data?.data?.totalFailed || 0);
        } else {
          setTableData([]);
          setTotalCount(0);
          setTotalBooked(0);
          setTotalPending(0);
          setTotalFailed(0);
        }
        setLoading(false);
      })
      .catch((err) => {
        setTableData([]);
        setTotalCount(0);
        setTotalBooked(0);
        setTotalPending(0);
        setTotalFailed(0);
        toast.error(err?.response?.data?.message ?? "Something Went Wrong");
        setLoading(false);
      });
  };

  const handleExport = () => {
    setExporting(true);

    // Export the full matching result set, not just the currently loaded
    // page — pageNumber/pageSize are still required by the endpoint's
    // request shape, so ask for everything in one go.
    axiosReport
      .post(
        "CRMIntegration/export-booking-data",
        buildFilterPayload(1, totalCount > 0 ? totalCount : 100000),
        { responseType: "blob" }
      )
      .then(async (res) => {
        const blob = res.data;
        // A validation/error response can still land here as a JSON blob
        // instead of a proper Excel file — surface it instead of downloading junk.
        if (blob.type && blob.type.includes("json")) {
          const text = await blob.text();
          const result = JSON.parse(text);
          toast.error(result?.message ?? result?.title ?? "Export failed.");
          return;
        }
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `CRM_Booking_Data_${moment(payload?.FromDate).format("DD-MMM-YYYY")}_to_${moment(payload?.ToDate).format("DD-MMM-YYYY")}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => toast.error(err?.response?.data?.message ?? "Something Went Wrong"))
      .finally(() => setExporting(false));
  };

  // "Repush Order" button (per row): sends this row's Work Order ID + HIS
  // Test Code to the RepushOrderByTest API so the order gets pushed again.
  const handleRepushOrder = (data, rowKey) => {
    setRepushOrderLoading((prev) => ({ ...prev, [rowKey]: true })); // show spinner on this row's button only
    axiosInstance
      .post("CRMIntegration/RepushOrderByTest", {
        workOrderID: data?.WorkOrderID,
        hisTestCode: data?.ItemId_interface,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message ?? "Order repushed successfully");
        } else {
          toast.error(res?.data?.message ?? "Failed to repush order");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? "Something Went Wrong");
      })
      .finally(() => setRepushOrderLoading((prev) => ({ ...prev, [rowKey]: false })));
  };

  // "Repush Report" button (per row): just opens the popup and remembers
  // which row it was clicked for. The actual API call happens after the
  // user picks Approve/Reject inside the popup and hits Submit.
  const openRepushReportModal = (data) => {
    setRepushReportModal({ show: true, data });
    setRepushStatus("Approved"); // Approve is pre-selected by default when the popup opens
  };

  // Closes the popup and clears its state so it opens fresh next time.
  const closeRepushReportModal = () => {
    setRepushReportModal({ show: false, data: null });
    setRepushStatus("");
  };

  // Popup's Submit button: sends Work Order ID + LIS Item ID + the picked
  // status (Approved/Rejected) to the RepushReportByTest API.
  const handleRepushReport = () => {
    if (!repushStatus) {
      toast.error(t("Please select Approve or Reject")); // stop if nothing is picked yet
      return;
    }
    const data = repushReportModal?.data;
    setRepushReportLoading(true);
    axiosInstance
      .post("CRMIntegration/RepushReportByTest", {
        workOrderID: data?.WorkOrderID,
        ourLISItemID: data?.OurItemID,
        status: repushStatus,
      })
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message ?? "Report repushed successfully");
          closeRepushReportModal(); // close popup only when it actually worked
        } else {
          toast.error(res?.data?.message ?? "Failed to repush report");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? "Something Went Wrong");
      })
      .finally(() => setRepushReportLoading(false));
  };


  return (
    <>
      <Accordion name={t("CRM Booking Data")} isBreadcrumb={true} defaultValue={true}>
        <div className="row pt-2 pl-2 pr-2 mt-1">
          <div className="col-sm-3">
            <ReactSelect
              dynamicOptions={companyOptions}
              name="InterfaceCompany"
              lable="Interface Company"
              id="InterfaceCompany"
              placeholderName="Interface Company"
              value={payload?.InterfaceCompany}
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              name="PatientID"
              id="PatientID"
              lable="Patient ID"
              value={payload?.PatientID}
              onChange={handleChange}
            />
          </div>
          <div className="col-sm-2">
            <Input
              type="text"
              name="WorkOrderID"
              id="WorkOrderID"
              lable="Work Order ID"
              value={payload?.WorkOrderID}
              onChange={handleChange}
            />
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
          <div className="col-sm-1">
            <SearchButton
              text={"Search"}
              onClick={() => handleSearch(1)}
            / >
          </div>
          <div className="col-sm-1 mb-1">
            <CustomButton
              text={"Export"}
              icon="excel"
              variant="success"
              loading={exporting}
              onClick={handleExport}
            />
          </div>
        </div>
      </Accordion>
      <Accordion 
        title={"Search Data"} 
        defaultValue={true}
        notOpen={true}
        linkTo="#"
        linkTitle={
          <div
            className="d-none d-md-flex align-items-center justify-content-between"
            id="pr_id_11"
            style={{
              gap:"5px"
            }}
          >
            <div
              style={{
                fontWeight: statusFilter === "all" ? 700 : 400,
                textDecoration: statusFilter === "all" ? "underline" : "none",
                cursor: "pointer",
              }}
              onClick={() => setStatusFilter("all")}
            >
              {t("All")} ({statusCounts.all})
            </div>
            {colorCodingData.map(({ color, labelKey, id }) => (
              <div
                key={id}
                style={{
                  fontWeight: statusFilter === id ? 700 : 400,
                  textDecoration: statusFilter === id ? "underline" : "none",
                }}
              >
                <ColorCodingSearch
                  color={color}
                  label={`${t(labelKey)} (${statusCounts[id]})`}
                  cursor="pointer"
                  onClick={() => setStatusFilter((prev) => (prev === id ? "all" : id))}
                />
              </div>
            ))}
          </div>
        }
        >
        {(loading) ? (
          <Loading />
        ) : (
          <div className="row p-2 ">
            <div className="col-12">
              {filteredData?.length > 0 ? (
              <Tables>
                <thead>
                  <tr>
                    <th>{t("S.No")}</th>
                    <th>{t("Company Name")}</th>
                    <th>{t("Work Order ID")}</th>
                    <th>{t("Patient ID")}</th>
                    <th>{t("Patient Name")}</th>
                    <th>{t("Age/Gender")}</th>
                    <th>{t("Mobile")}</th>
                    <th>{t("Centre")}</th>
                    <th>{t("LIS Item ID")}</th>
                    <th>{t("LIS Test Code")}</th>
                    <th style={{ width: "200px", minWidth: "200px" }}>{t("LIS Test Name")}</th>
                    <th>{t("HIS Test Code")}</th>
                    <th>{t("Sample Collection Date")}</th>
                    <th>{t("TPA Name")}</th>
                    <th>{t("Rate")}</th>
                    <th>{t("Amount")}</th>
                    <th>{t("Discount")}</th>
                    <th>{t("Entry Date")}</th>
                    <th>{t("Repush Order")}</th>
                    <th>{t("Repush Report")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData?.map((data, index) => {
                    const status = getBookingStatus(data?.IsBooked);
                    const rowKey = data?.ID ?? index;
                    return (
                      <tr key={data?.ID ?? index} style={{ backgroundColor: statusColorMap[status] }}>
                        <td data-title={"S.No"}>{index + 1}</td>
                        <td data-title={"Company Name"}>{data?.InterfaceClient ?? data?.CompanyName}</td>
                        <td data-title={"Work Order ID"}>{data?.WorkOrderID}</td>
                        <td data-title={"Patient ID"}>{data?.Patient_ID}</td>
                        <td data-title={"Patient Name"}>
                          {data?.Title} {data?.PName}
                        </td>
                        <td data-title={"Age/Gender"}>
                          {data?.Age} / {data?.Gender}
                        </td>
                        <td data-title={"Mobile"}>{data?.Mobile || data?.Phone}</td>
                        <td data-title={"Centre"}>{data?.centre || data?.Interface_CentreName || data?.CentreID_Interface}</td>
                        <td data-title={"LIS Item ID"}>{data?.OurItemID}</td>
                        <td data-title={"LIS Test Code"}>{data?.OurTestCode}</td>
                        <td
                          data-title={"LIS Test Name"}
                          style={{ width: "200px", minWidth: "200px", whiteSpace: "normal", wordBreak: "break-word" }}
                        >
                          {data?.OurItemName}
                        </td>
                        <td data-title={"HIS Test Code"}>{data?.ItemId_interface}</td>

                        <td data-title={"Sample Collection Date"}>
                          <DateTimeCell dateString={data?.SampleCollectionDate} />
                        </td>
                        <td data-title={"TPA Name"}>{data?.TPA_Name}</td>
                        <td data-title={"Rate"}>{data?.Rate}</td>
                        <td data-title={"Amount"}>{data?.Amount}</td>
                        <td data-title={"Discount"}>{data?.Discount}</td>
                        <td data-title={"Entry Date"}>
                          <DateTimeCell dateString={data?.EntryDateTime} />
                        </td>
                        <td data-title={"Repush Order"} style={{ whiteSpace: "nowrap" }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "#d9fd0d",
                              borderColor: "#d9fd0d",
                              color: "#0c0202",
                              whiteSpace: "nowrap",
                            }}
                            disabled={repushOrderLoading[rowKey]}
                            onClick={() => handleRepushOrder(data, rowKey)}
                          >
                            {repushOrderLoading[rowKey] ? t("Repushing...") : t("Repush Order")}
                          </button>
                        </td>
                        <td data-title={"Repush Report"} style={{ whiteSpace: "nowrap" }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              backgroundColor: "#198754",
                              borderColor: "#198754",
                              color: "#fff",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => openRepushReportModal(data)}
                          >
                            {t("Repush Report")}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Tables>
              ) : (
                <div className="text-center p-3">{t("No Records Found")}</div>
              )}
            </div>
            {totalCount > 0 && tableData?.length > 0 && (
              <div className="col-12 d-flex flex-wrap justify-content-end align-items-end gap-2">
                <div style={{ minWidth: "110px" }}>
                  <ReactSelect
                    value={pageSize}
                    dynamicOptions={[
                      { label: "25", value: 25 },
                      { label: "50", value: 50 },
                      { label: "100", value: 100 },
                      { label: "150", value: 150 },
                    ]}
                    name="pageSize"
                    lable={t("Page Size")}
                    removeIsClearable={true}
                    onChange={(name, option) => {
                      const size = option?.value;
                      setPageSize(size);
                      handleSearch(1, size);
                    }}
                  />
                </div>
                <Pagination
                  className="pagination-bar mb-2"
                  currentPage={currentPage}
                  totalCount={totalCount}
                  pageSize={pageSize}
                  onPageChange={(page) => {
                    handleSearch(page);
                  }}
                />
              </div>
            )}
          </div>
        )}
      </Accordion>
      {/* Repush Report popup: opens when "Repush Report" is clicked on a row.
          User picks Approve or Reject, then Submit calls the API. */}
      <Dialog
        header={t("Repush Report")}
        className={theme}
        visible={repushReportModal.show}
        style={{ width: "420px", maxWidth: "95vw" }}
        onHide={closeRepushReportModal}
        modal
      >
        <div className="row px-2 pb-2">
          <div className="col-12 mb-2">
            <strong>{t("Work Order ID")}:</strong> {repushReportModal.data?.WorkOrderID}
            <br />
            <strong>{t("LIS Item Name")}:</strong> {repushReportModal.data?.OurItemName}
          </div>
          <div className="col-12">
            <div className="d-flex align-items-center" style={{ gap: "16px" }}>
              <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                <input
                  type="radio"
                  name="radioSelection"
                  id="radioApprove"
                  value="Approved"
                  checked={repushStatus === "Approved"}
                  onChange={(e) => setRepushStatus(e.target.value)}
                />
                <label className="control-label mb-0" htmlFor="radioApprove">
                  {t("Approve")}
                </label>
              </div>
              <div className="d-flex align-items-center" style={{ gap: "6px" }}>
                <input
                  type="radio"
                  name="radioSelection"
                  id="radioReject"
                  value="Rejected"
                  checked={repushStatus === "Rejected"}
                  onChange={(e) => setRepushStatus(e.target.value)}
                />
                <label className="control-label mb-0" htmlFor="radioReject">
                  {t("Reject")}
                </label>
              </div>
            </div>
          </div>
          <div className="col-12 mt-3 d-flex justify-content-end">
            <CustomButton
              text={"Submit"}
              icon="check"
              variant="success"
              loading={repushReportLoading}
              onClick={handleRepushReport}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CRMBookingData;
