import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import moment from "moment";
import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import {
  getPaymentModes,
  GetRateTypeByGlobalCentre,
} from "../../utils/NetworkApi/commonApi";
import AdvancePaymentCancelModal from "./AdvancePaymentCancelModal";
import ValidatePaymentReceiptDetail from "./ValidatePaymentReceiptDetail";
import DatePicker from "../../components/formComponent/DatePicker";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { DateTypeSearch, Status } from "../../utils/Constants";
import Loading from "../../components/loader/Loading";
import Tables from "../../components/UI/customTable";
import Accordion from "@app/components/UI/Accordion";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import ValidatePaymentModal from "./ValidatePaymentModal";
import ReactSelect from "../../components/formComponent/ReactSelect";
import PaymentValidateModal from "../utils/PaymentValidateModal";

const ValidatePayment = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [CentreData, setCentreData] = useState([]);
  const [PaymentMode, setPaymentMode] = useState([]);
  const [showAccept, setShowAccept] = useState({
    modal: false,
    data: "",
    index: -1,
  });
  const [payload, setPayload] = useState({
    FromDate: new Date(),
    ToDate: new Date(),
    CentreID: "",
    PaymentMode: "",
    DateTypeSearch: "ivac.ReceiveDate",
    Status: "0",
  });
  const [show, setShow] = useState({
    id: "",
    modalShow: false,
    cancelReason: "",
  });
  const [showValidateModal, setShowValidateModal] = useState({
    data: "",
    validateModal: false,
  });
  const [receiptData, setShowReceiptData] = useState({
    data: "",
    receiptModal: false,
  });
  console.log(receiptData);

  const { t } = useTranslation();
  const handleReceiptDetail = (ele) => {
    console.log(ele);
    axiosInstance
      .post("Accounts/ShowValidatePayment", {
        ReceiptNo: ele?.ReceiptNo,
      })
      .then((res) => {
        setShowReceiptData({
          data: res?.data?.message,
          receiptModal: true,
        });
      })
      .catch((err) =>
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        ),
      );
  };
  const handleSearchSelectChange = (label, value) => {
    setPayload({ ...payload, [label]: value?.value.toString() });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event?.target;
    setPayload({ ...payload, [name]: value });
  };

  const dateSelect = (value, name) => {
    setPayload({
      ...payload,
      [name]: value,
    });
  };
  console.log(tableData);

  const handleSearch = () => {
    setLoading(true);
    axiosInstance

      .post("Accounts/ValidatePaymentMode", {
        ...payload,
        DateTypeSearch: payload?.DateTypeSearch,
        FromDate: moment(payload.FromDate).format("YYYY-MM-DD"),
        ToDate: moment(payload.ToDate).format("YYYY-MM-DD"),
      })
      .then((res) => {
        setLoading(false);
        setTableData(res?.data?.message);
      })
      .catch((err) => {
        setTableData([]);
        setLoading(false);
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something went wrong",
        );
      });
  };
  const handleClose = () => {
    setShowValidateModal({
      data: "",
      validateModal: false,
    });
    handleSearch();
  };
  const handleHide = () => {
    setShow({
      id: "",
      modalShow: false,
      cancelReason: "",
    });
  };
  const handleChangeNew = (e) => {
    const { name, value } = e.target;
    setShow({ ...show, [name]: value });
  };

  const handleCancel = () => {
    if (show?.cancelReason) {
      axiosInstance
        .post("Accounts/CancelPayment", {
          Id: show?.id,
          CancelReason: show?.cancelReason,
        })
        .then((res) => {
          handleSearch();
          setShow({
            ...show,
            id: "",
            modalShow: false,
            cancelReason: "",
          });
          // The API answers HTTP 200 for refusals too, carrying success:false,
          // so the flag has to be read here - otherwise a refusal is announced
          // as a green success toast.
          if (res?.data?.success) {
            toast.success(res?.data?.message);
          } else {
            toast.error(res?.data?.message || "Something Went Wrong");
          }
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something Went Wrong",
          );
        });
    } else {
      toast.error("Please Enter Cancel Reason");
    }
  };
  const handleAccept = (ele) => {
    axiosInstance
      .post("Accounts/AcceptPayment", {
        Id: ele?.ID,
        ReceiptNo: ele?.ReceiptNo,
      })
      .then((res) => {
        // Same HTTP 200 + success:false contract as CancelPayment above: a
        // permission refusal ("You have no right to validate invoice amount")
        // arrives on the success path and must not be toasted as a success.
        if (res?.data?.success) {
          toast.success(res?.data?.message);
        } else {
          toast.error(res?.data?.message || "Something Went Wrong");
        }
        handleSearch();
        setShowAccept({ modal: false, data: "", index: -1 });
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Something Went Wrong",
        );
      });
  };
  useEffect(() => {
    getPaymentModes("PaymentMode", setPaymentMode);
    GetRateTypeByGlobalCentre(setCentreData);
  }, []);

  return (
    <>
      {showAccept?.modal && (
        <PaymentValidateModal
          show={showAccept}
          handleClose={() =>
            setShowAccept({ modal: false, data: "", index: -1 })
          }
          title={"Confirmation"}
          handleAccept={handleAccept}
        />
      )}
      {showValidateModal?.validateModal && (
        <ValidatePaymentModal
          showValidateModal={showValidateModal}
          handleClose={handleClose}
        />
      )}

      {receiptData?.receiptModal && (
        <ValidatePaymentReceiptDetail
          receiptData={receiptData}
          setShowReceiptData={setShowReceiptData}
        />
      )}
      {show?.modalShow && (
        <AdvancePaymentCancelModal
          show={show}
          handleChange={handleChangeNew}
          onhide={handleHide}
          handleCancel={handleCancel}
        />
      )}
      <Accordion
        name={t("Pending Amount Validation")}
        isBreadcrumb={true}
        defaultValue={true}
      >
        <div className="row px-2 mt-2 mb-1">
          <div className="col-sm-2">
            <SelectBox
              lable="Date Type"
              id="Date Type"
              options={DateTypeSearch}
              selectedValue={payload?.DateTypeSearch}
              name="DateTypeSearch"
              onChange={handleSelectChange}
            />
          </div>
          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="FromDate"
              lable="FromDate"
              name="FromDate"
              value={payload?.FromDate}
              onChange={dateSelect}
              maxDate={new Date()}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="ToDate"
              lable="ToDate"
              name="ToDate"
              value={payload?.ToDate}
              onChange={dateSelect}
              minDate={new Date(payload.FromDate)}
            />
          </div>

          <div className="col-sm-2">
            <ReactSelect
              dynamicOptions={[
                { label: "All Panel", value: "" },
                ...(CentreData ?? []),
              ]}
              name="CentreID"
              lable={payload?.CentreID === "" ? t("Rate Type") : t("Panel")}
              id="CentreID"
              removeIsClearable={true}
              placeholderName={
                payload?.CentreID === "" ? t("Rate Type") : t("Panel")
              }
              value={payload?.CentreID}
              onChange={handleSearchSelectChange}
            />
            {/* <SelectBox
              options={[{ label: "All", value: "" }, ...CentreData]}
              selectedValue={payload?.CentreID}
              name="CentreID"
              lable="Panel"
              id="CentreID"
              onChange={handleSelectChange}
            /> */}
          </div>

          <div className="col-sm-2">
            <SelectBox
              options={[
                { label: "Both", value: "-1" },
                { label: "Pending", value: "0" },
                { label: "Approval", value: "1" },
              ]}
              lable="Status"
              id="Status"
              name="Status"
              selectedValue={payload?.Status}
              onChange={handleSelectChange}
            />
          </div>

          <div className="col-sm-2">
            <SelectBox
              lable="PaymentMode"
              id="PaymentMode"
              options={[{ label: "All", value: "" }, ...PaymentMode]}
              name="PaymentMode"
              selectedValue={payload?.PaymentMode}
              onChange={handleSelectChange}
            />
          </div>
        </div>
        <div className="row px-2 mt-1 mb-1">
          <div className="col-sm-1">
            {loading ? (
              <Loading />
            ) : (
              <button
                className="btn btn-block btn-info btn-sm"
                type="button"
                onClick={handleSearch}
              >
                {t("Search")}
              </button>
            )}
          </div>
        </div>
      </Accordion>
      <Accordion title={t("Search Detail")} defaultValue={true}>
        {tableData?.length > 0 ? (
          <>
            <Tables>
              <thead className=" cf">
                <tr>
                  <th>{t("S.No")}</th>
                  <th>{t("Type")}</th>
                  <th>{t("Paid By")}</th>
                  <th>{t("Paid Date")}</th>
                  <th>{t("Client Name")}</th>
                  <th>{t("Transaction ID")}</th>
                  <th>{t("Payment Mode")}</th>

                  <th>{t("Paid Amount")}</th>

                  <th>{t("Bank Name")}</th>
                  <th>{t("Cheque No")}</th>
                  <th>{t("Cheque Date")}</th>
                  <th>{t("Remarks")}</th>
                  <th>{t("Edit")}</th>
                  <th>{t("Accept")}</th>
                  <th>{t("Cancel")}</th>
                </tr>
              </thead>
              <tbody>
                {tableData?.map((ele, index) => (
                  <tr key={index}>
                    <td data-title={t("S.No")}>
                      {index + 1}&nbsp;&nbsp;
                      {ele?.MonthlyInvoiceType == 1 && (
                        <button
                          onClick={() => {
                            handleReceiptDetail(ele);
                          }}
                        >
                          <i
                            className="fa fa-plus"
                            style={{ marginTop: "3px" }}
                          ></i>
                        </button>
                      )}
                      &nbsp;
                    </td>
                    <td data-title={t("Type")}>{ele?.AdvType} &nbsp;</td>
                    <td data-title={t("Paid By")}>{ele?.EntryBy} &nbsp;</td>
                    <td data-title={t("Paid Date")}>{ele?.EntryDate} &nbsp;</td>
                    <td data-title={t("Client Name")}>{ele?.centre} &nbsp;</td>
                    <td data-title={t("Transaction ID")}>
                      {ele?.ReceiptNo} &nbsp;
                    </td>
                    <td data-title={t("Payment Mode")}>
                      {ele?.PaymentMode} &nbsp;
                    </td>

                    <td data-title={t("Paid Amount")} className="amount">
                      {ele?.ReceivedAmt} &nbsp;
                    </td>

                    <td data-title={t("Bank Name")}>{ele?.BankName} &nbsp;</td>
                    <td data-title={t("Cheque No.")}>{ele?.CardNo} &nbsp;</td>
                    <td data-title={t("Cheque Date")}>
                      {ele?.CardDate} &nbsp;
                    </td>
                    <td data-title={t("Remarks")}>{ele?.remarks} &nbsp;</td>
                    <td data-title={t("Edit")}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          setShowValidateModal({
                            data: ele,
                            validateModal: true,
                          })
                        }
                        disabled={
                          ele?.ValidateStatus == 0 && ele?.IsCancel == 0
                            ? false
                            : true
                        }
                      >
                        {t("Edit")}
                      </button>
                      &nbsp;
                    </td>
                    <td data-title={t("Accept")}>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setShowAccept({
                            modal: true,
                            data: ele,
                            index: index,
                          });
                        }}
                        disabled={
                          ele?.ValidateStatus == 0 && ele?.IsCancel == 0
                            ? false
                            : true
                        }
                      >
                        {t("Accept")}
                      </button>
                      &nbsp;
                    </td>
                    <td data-title={t("Cancel")}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setShow({
                            id: ele?.ID,
                            modalShow: true,
                            cancelReason: "",
                          });
                        }}
                        disabled={
                          ele?.ValidateStatus == 0 && ele?.IsCancel == 0
                            ? false
                            : true
                        }
                      >
                        {t("Cancel")}
                      </button>
                      &nbsp;
                    </td>
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

export default ValidatePayment;
