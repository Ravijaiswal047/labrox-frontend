import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { All_Zero, ChangeRateDDL } from "../../utils/Constants";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
import DatePicker from "../../components/formComponent/DatePicker";
import moment from "moment";

function ScheduleTransferRateType({ show, onHandleShow, Centres, Department, Billing }) {
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;

  const EMPTY = {
    CentreID: "",
    DepartmentID: "",
    ChangeRateDDL: "1",
    ChangeRateTxt: "",
    ChangeRatePer: "0",
    TransferCentreID: "",
    BillingCategoryId: 0,
    FromDate: new Date(),
    ToDate: new Date(),
  };

  const [payload, setPayload] = useState(EMPTY);
  const [error, setError]     = useState({});
  const [load, setLoad]       = useState(false);

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const dateSelect = (value, name) => {
    setPayload((prev) => ({ ...prev, [name]: value }));
  };

  const validations = () => {
    const err = {};
    if (!payload.CentreID)         err.CentreID         = "This Field is Required";
    if (!payload.TransferCentreID) err.TransferCentreID = "This Field is Required";
    if (!payload.ChangeRateTxt && !payload.ChangeRatePer) {
      err.ChangeRateTxt = "Either ChangeRateTxt or ChangeRatePer is required.";
      err.ChangeRatePer = "Either ChangeRateTxt or ChangeRatePer is required.";
    }
    return err;
  };

  const handleSubmit = () => {
    const errs = validations();
    if (Object.keys(errs).length > 0) { setError(errs); return; }

    setLoad(true);
    axiosInstance
      .post("ScheduleRateList/SaveTransferRateType", {
        centreID:        payload.CentreID,
        transferCentreID: payload.TransferCentreID,
        departmentID:    Array.isArray(payload.DepartmentID)
                           ? payload.DepartmentID.map(Number)
                           : [],
        billingCategoryId: Number(payload.BillingCategoryId),
        changeRateDDL:   payload.ChangeRateDDL,
        changeRateTxt:   payload.ChangeRateTxt,
        changeRatePer:   payload.ChangeRatePer,
        fromDate:        moment(payload.FromDate).format("YYYY-MM-DD"),
        toDate:          moment(payload.ToDate).format("YYYY-MM-DD"),
      })
      .then((res) => {
        toast.success(res?.data?.message);
        setError({});
        setPayload(EMPTY);
        onHandleShow();
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Error Occurred");
      })
      .finally(() => setLoad(false));
  };

  useEffect(() => {
    if (payload.CentreID && payload.TransferCentreID &&
        payload.CentreID === payload.TransferCentreID) {
      setPayload((prev) => ({ ...prev, TransferCentreID: "" }));
      toast.error("Source and Destination Centre can't be same.");
    }
  }, [payload.CentreID, payload.TransferCentreID]);

  return (
    <Dialog
      header="Transfer RateType"
      onHide={onHandleShow}
      visible={show}
      className={theme}
      style={{ width: isMobile ? "80vw" : "50vw" }}
    >
      <div className="row bootRow">
        <div className="col-sm-12 col-md-6">
          <label>From RateType:</label>
          <ReactSelect
            dynamicOptions={[{ label: "Select RateType", value: "" }, ...Centres]}
            id="SRT_CentreID"
            name="CentreID"
            placeholderName="Select RateType"
            value={payload.CentreID}
            onChange={(_, e) => setPayload((prev) => ({ ...prev, CentreID: e?.value?.toString() ?? "" }))}
            searchable={true}
            removeIsClearable={true}
          />
          {!payload.CentreID && <span className="error-message">{error.CentreID}</span>}
        </div>
        <div className="col-sm-12 col-md-6">
          <label>To RateType:</label>
          <ReactSelect
            dynamicOptions={[{ label: "Select RateType", value: "" }, ...Centres]}
            id="SRT_TransferCentreID"
            name="TransferCentreID"
            placeholderName="Select RateType"
            value={payload.TransferCentreID}
            onChange={(_, e) => setPayload((prev) => ({ ...prev, TransferCentreID: e?.value?.toString() ?? "" }))}
            searchable={true}
            removeIsClearable={true}
          />
          {!payload.TransferCentreID && <span className="error-message">{error.TransferCentreID}</span>}
        </div>
      </div>

      <div className="row bootRow">
        <div className="col-sm-12 col-md-6">
          <label>Department:</label>
          <MultiSelectComp
            name="DepartmentID"
            options={Department}
            value={payload.DepartmentID}
            onChange={(name, val) => setPayload((prev) => ({ ...prev, [name]: val }))}
          />
        </div>
        <div className="col-sm-12 col-md-6">
          <label>Billing Category:</label>
          <SelectBox
            options={[{ label: "Select BillingCategory", value: 0 }, ...Billing]}
            name="BillingCategoryId"
            selectedValue={payload.BillingCategoryId}
            onChange={handleSelectChange}
          />
        </div>
      </div>

      <div className="row bootRow">
        <div className="col-md-3 col-sm-12">
          <label>ChangeRateDDL:</label>
          <SelectBox
            options={ChangeRateDDL}
            name="ChangeRateDDL"
            selectedValue={payload.ChangeRateDDL}
            onChange={handleSelectChange}
          />
        </div>
        <div className="col-md-3 col-sm-12">
          <label>ChangeRateTxt:</label>
          <Input
            type="number"
            name="ChangeRateTxt"
            placeholder="ChangeRateTxt"
            value={payload.ChangeRateTxt}
            disabled={!!payload.ChangeRatePer}
            onChange={(e) =>
              setPayload((prev) => ({
                ...prev,
                ChangeRateTxt: e.target.value,
                ChangeRatePer: e.target.value ? "" : prev.ChangeRatePer,
              }))
            }
          />
          {!payload.ChangeRatePer && !payload.ChangeRateTxt &&
            <span className="error-message">{error.ChangeRateTxt}</span>}
        </div>
        <div className="col-md-3 col-sm-12">
          <label>ChangeRatePercentage:</label>
          <Input
            type="number"
            name="ChangeRatePer"
            placeholder="ChangeRatePercentage"
            value={payload.ChangeRatePer}
            disabled={!!payload.ChangeRateTxt}
            onChange={(e) =>
              setPayload((prev) => ({
                ...prev,
                ChangeRatePer: e.target.value,
                ChangeRateTxt: e.target.value ? "" : prev.ChangeRateTxt,
              }))
            }
          />
          {!payload.ChangeRateTxt && !payload.ChangeRatePer &&
            <span className="error-message">{error.ChangeRatePer}</span>}
        </div>
      </div>

      <div className="row bootRow">
        <div className="col-md-6 col-sm-12">
          <label>All/Zero Rate:</label>
          <SelectBox options={All_Zero} onChange={handleSelectChange} />
        </div>
      </div>

      <div className="row bootRow">
        <div className="col-sm-12 col-md-6">
          <DatePicker
            name="FromDate"
            id="SRT_FromDate"
            lable="From Date"
            value={payload.FromDate}
            onChange={dateSelect}
          />
        </div>
        <div className="col-sm-12 col-md-6">
          <DatePicker
            name="ToDate"
            id="SRT_ToDate"
            lable="To Date"
            value={payload.ToDate}
            onChange={dateSelect}
            minDate={new Date(payload.FromDate)}
          />
        </div>
      </div>

      {load ? (
        <Loading />
      ) : (
        <div className="row mt-2 mb-1 ml-1">
          <div className="col-md-3 col-sm-3">
            <button
              type="button"
              className="btn btn-block btn-success btn-sm"
              onClick={handleSubmit}
            >
              Transfer Rate
            </button>
          </div>
          <div className="col-sm-1 col-md-1">
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={onHandleShow}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export default ScheduleTransferRateType;
