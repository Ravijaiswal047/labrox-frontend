import React, { useEffect } from "react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import Input from "../../components/formComponent/Input";
import { SelectBox } from "../../components/formComponent/SelectBox";
import { All_Zero, ChangeRateDDL } from "../../utils/Constants";
import { SelectBoxWithCheckbox } from "../../components/formComponent/MultiSelectBox";
import { axiosInstance } from "../../utils/axiosInstance";
import Loading from "../../components/loader/Loading";
import ReactSelect from "../../components/formComponent/ReactSelect";
import MultiSelectComp from "../../components/formComponent/MultiSelectComp";
function TransferRateType({
  show,
  onHandleShow,
  Centres,
  Department,
  Billing,
}) {
  const [payload, setPayload] = useState({
    CentreID: "",
    DepartmentID: "",
    ChangeRateDDL: "1",
    ChangeRateTxt: "",
    ChangeRatePer: "0",
    TransferCentreID: "",
    BillingCategoryId: 0,
  });

  const [error, setError] = useState({});
  const [load, setLoad] = useState(false);
  const handleChanges = (name, value) => {
    // const val = select.map((ele) => {
    //   return ele?.value;
    // });
    // console.log(val);
    setPayload({ ...payload, [name]: value });
  };

  const handleSelectChange = (event) => {
    const { name, value } = event?.target;
    setPayload({ ...payload, [name]: value });
  };

  console.log(payload);

  const validations = () => {
    let err = {};

    if (payload?.CentreID === "") {
      err.CentreID = "This Field is Required";
    }

    // if (payload?.DepartmentID === "" || payload?.DepartmentID?.length == 0) {
    //   err.DepartmentID = "This Field is Required";
    // }

    // if (payload?.ChangeRateDDL === "") {
    //   err.ChangeRateDDL = "This Field is Required";
    // }
    if (!payload?.ChangeRateTxt && !payload?.ChangeRatePer) {
      err.ChangeRateTxt = "Either ChangeRateTxt or ChangeRatePer is required.";
      err.ChangeRatePer = "Either ChangeRateTxt or ChangeRatePer is required.";
    }

    if (payload?.TransferCentreID === "") {
      err.TransferCentreID = "This Field is Required";
    }

    return err;
  };

  const handleSubmit = () => {
    const generatedError = validations();
    console.log(generatedError);
    if (generatedError === "" || Object.keys(generatedError).length === 0) {
      setLoad(true);
      axiosInstance
        .post("RateList/SaveTransferRateType", {
          ...payload,
          BillingCategoryId: Number(payload?.BillingCategoryId),
          DepartmentID: payload?.DepartmentID || [],
        })
        .then((res) => {
          console.log(res);

          setLoad(false);
          toast.success(res?.data?.message);
          onHandleShow();
          setError({});
          setPayload({
            CentreID: "",
            DepartmentID: 0,
            ChangeRateDDL: "1",
            ChangeRateTxt: "",
            TransferCentreID: "",
            BillingCategoryId: 0,
          });
        })
        .catch((err) => {
          setLoad(false);
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Error Occured",
          );
        })
        .finally(() => {
          setLoad(false);
        });
    } else {
      setError(generatedError);
    }
  };

  useEffect(() => {
    if (payload?.CentreID !== "" && payload?.TransferCentreID !== "") {
      if (payload?.CentreID === payload?.TransferCentreID) {
        setPayload({ ...payload, TransferCentreID: "" });
        toast.error("Source And Destination Centre Cant Be Same.");
      }
    }
  }, [payload?.CentreID, payload?.TransferCentreID]);
  console.log(payload);
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  console.log(payload);
  return (
    <Dialog
      header="Transfer RateType"
      onHide={onHandleShow}
      visible={show}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "50vw",
      }}
    >
      <>
        <div className="row bootRow">
          <div className="col-sm-12 col-md-6">
            <label>From RateType:</label>
            {/* <SelectBox
              options={[{ label: "Select RateType", value: "" }, ...Centres]}
              name="CentreID"
              onChange={handleSelectChange}
              selectedValue={payload?.CentreID}
            /> */}

            <ReactSelect
              dynamicOptions={[
                { label: "Select RateType", value: "" },
                ...Centres,
              ]}
              id="CentreID"
              name="CentreID"
              placeholderName="Select RateType"
              onChange={(_, e) => {
                setPayload({
                  ...payload,
                  CentreID: e?.value?.toString() ?? "",
                });
              }}
              value={payload?.CentreID}
              searchable={true}
              removeIsClearable={true}
            />
            {payload?.CentreID == "" && (
              <span className="error-message">{error?.CentreID}</span>
            )}
          </div>
          <div className="col-sm-12 col-md-6">
            <label>To RateType:</label>
            {/* //<SelectBox
            //  options={[{ label: "Select RateType", value: "" }, ...Centres]}
             // name="TransferCentreID"
             // onChange={handleSelectChange}
             // selectedValue={payload?.TransferCentreID}
           // /> */}

            <ReactSelect
              dynamicOptions={[
                { label: "Select RateType", value: "" },
                ...Centres,
              ]}
              id="TransferCentreID"
              name="TransferCentreID"
              placeholderName="Select RateType"
              value={payload?.TransferCentreID}
              onChange={(_, e) => {
                setPayload({
                  ...payload,
                  TransferCentreID: e?.value?.toString() ?? "",
                });
              }}
              searchable={true}
              removeIsClearable={true}
            />
            {payload?.TransferCentreID == "" && (
              <span className="error-message">{error?.TransferCentreID}</span>
            )}
          </div>
        </div>
        <div className="row bootRow">
          <div className="col-sm-12 col-md-6">
            <label>Department:</label>
            <MultiSelectComp
              name="DepartmentID"
              options={Department}
              value={payload?.DepartmentID}
              onChange={handleChanges}
            />
            {/* {payload?.DepartmentID == "" && (
              <span className="error-message">{error?.DepartmentID}</span>
            )} */}
          </div>
          <div className="col-sm-12 col-md-6">
            <label>Billing Category:</label>
            <SelectBox
              options={[
                { label: "Select BillingCategory", value: 0 },
                ...Billing,
              ]}
              id="Billing Category"
              name="BillingCategoryId"
              selectedValue={payload?.BillingCategoryId}
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
              onChange={handleSelectChange}
              selectedValue={payload?.ChangeRateDDL}
            />
            {/* {payload?.ChangeRateDDL == "" && (
              <span className="error-message">{error?.ChangeRateDDL}</span>
            )} */}
          </div>

          <div className="col-md-3 col-sm-12">
            <label>ChangeRateTxt:</label>
            <Input
              className="select-input-box form-control input-sm"
              placeholder="ChangeRateTxt"
              type="number"
              name="ChangeRateTxt"
              value={payload?.ChangeRateTxt}
              onChange={(e) => {
                setPayload({
                  ...payload,
                  ChangeRateTxt: e.target.value,
                  ChangeRatePer: e.target.value ? "" : payload?.ChangeRatePer,
                });
              }}
              disabled={!!payload?.ChangeRatePer}
            />
            {payload?.ChangeRatePer === "" && !payload?.ChangeRateTxt && (
              <span className="error-message">{error?.ChangeRateTxt}</span>
            )}
          </div>

          <div className="col-md-3 col-sm-12">
            <label>ChangeRatePercentage:</label>
            <Input
              className="select-input-box form-control input-sm"
              placeholder="ChangeRatePercentage"
              type="number"
              name="ChangeRatePer"
              value={payload?.ChangeRatePer}
              onChange={(e) => {
                setPayload({
                  ...payload,
                  ChangeRatePer: e.target.value,
                  ChangeRateTxt: e.target.value ? "" : payload?.ChangeRateTxt,
                });
              }}
              disabled={!!payload?.ChangeRateTxt}
            />
            {payload?.ChangeRateTxt === "" && !payload?.ChangeRatePer && (
              <span className="error-message">{error?.ChangeRatePer}</span>
            )}
          </div>
        </div>
        <div className="row bootRow">
          <div className="col-md-6 col-sm-12">
            <label>All/Zero Rate:</label>
            <SelectBox
              options={All_Zero}
              onChange={handleSelectChange}
              // selectedValue={selectedValueCheck(
              //   All_Zero,
              //   payload?.ChangeRateDDL
              // )}
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
                id="btnSave"
                onClick={handleSubmit}
              >
                Transfer Rate
              </button>
            </div>
            <div className="co-sm-1 col-md-1">
              <button
                type="button"
                className="btn  btn-danger btn-sm"
                id="btnClose"
                onClick={onHandleShow}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    </Dialog>
  );
}

export default TransferRateType;
