import { useEffect, useState } from "react";
import Accordion from "@app/components/UI/Accordion";
import Loading from "../../components/loader/Loading";
import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
import Input from "../../components/formComponent/Input";
import { axiosInstance } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import NoRecordFound from "../../components/formComponent/NoRecordFound";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { SRAFormatDate } from "../../utils/helpers";
import LogisticSampleViewModal from "../utils/LogisticSampleViewModal";
import { toast } from "react-toastify";
import { SearchButton } from "../../components/UI/CustomButton";

const LogisticHubMaster = () => {
    const [loading, setLoading] = useState(false);
    const [allCentre, setAllCentre] = useState([]);
    const [fieldBoyOptions, setFieldBoyOptions] = useState([]);
    const [payload, setPayload] = useState({
        FromCentre: "",
        Zone: "",
        State: "",
        City: "",
        FromDate: SRAFormatDate(new Date()),
        ToDate: SRAFormatDate(new Date()),
    });
    const [logisticReceiveData, setLogisticReceiveData] = useState([]);
    const [showLogisticSampleViewModal, setShowLogisticSampleViewModal] =
        useState(false);

    const [batchDetail, setBatchDetail] = useState([]);

    const [t] = useTranslation();

    // fetch centres
    useEffect(() => {
        const fetchCentre = async () => {
            setLoading(true);
            try {
                const res = await axiosInstance.post("SRA/BindSampleTransferCentre", {
                    AllCentre: "1",
                });

                const data = res?.data?.message || [];
                const mapped = data.map((r) => ({
                    label: r.Centre,
                    value: String(r.CentreID),
                }));

                setAllCentre(mapped);
            } catch (err) {
                console.error("Failed to load centers", err);
                setAllCentre([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCentre();
    }, []);



    const handleSelectChange = (name, value) => {
        setPayload({ ...payload, [name]: value.value });
    };

    const handleDateSelect = (...args) => {
        const date = args[0];
        const fieldName = args[1];

        const val = date ? new Date(date).toISOString() : null;
        setPayload((prev) => ({ ...prev, [fieldName]: val }));
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        if (id === "BatchNo") setPayload((prev) => ({ ...prev, BatchNo: value }));
        if (id === "RouteNo") setPayload((prev) => ({ ...prev, RouteNo: value }));
    };

    const handleSearch = async () => {
        const payloadData = {
            FromCentreID: payload.FromCentre,
            BatchNo: payload.BatchNo,
            RouteNo: payload.RouteNo,
            FromDate: payload.FromDate,
            ToDate: payload.ToDate,
            Type: payload.Type,
        };

        setLoading(true);
        try {
            const res = await axiosInstance.post(
                "SRA/RecievePageBatchSearch",
                payloadData,
            );
            const message = res.data?.message ?? [];

            if (Array.isArray(message)) {
                setLogisticReceiveData(message);
            } else {
                setLogisticReceiveData([]);
                if (
                    typeof message === "string" &&
                    message.toLowerCase().includes("no record")
                ) {
                    toast.error("No records found.");
                }
            }
        } catch (err) {
            console.error("Search failed", err);
        } finally {
            setLoading(false);
        }
    };

    const typeOptions = [
        { label: "All", value: "All" },
        { label: "Accepted", value: "Accepted" },
        { label: "Not Accepted", value: "NAccepted" },
    ];


    return (
        <>
            <Accordion
                name={t("Logistic Pickup Summary")}
                defaultValue={true}
                isBreadcrumb={true}
            >
                <div className="row pt-2 px-2 py-2">
                    <div className="col-12">
                        <div className="row gap-3 justify-content-start d-flex align-items-center">
                            {/* Transfer To */}

                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <ReactSelect
                                    dynamicOptions={allCentre}
                                    name="FromCentre"
                                    lable={t("From Centre")}
                                    id="FromCentre"
                                    removeIsClearable={true}
                                    placeholderName={t("From Centre")}
                                    value={
                                        allCentre.find((o) => o.value === payload.FromCentre) ??
                                        null
                                    }
                                    onChange={handleSelectChange}
                                    isDisabled={loading || allCentre.length === 0}
                                />
                            </div>

                            {/* SIN No */}
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <Input
                                    id="Oracle Customer Code"
                                    className="select-input-box form-control form-control-sm"
                                    type="text"
                                    name="Oracle Customer Code"
                                    maxLength={20}
                                    lable="OracleCustomerCode"
                                    //   value={payload.BatchNo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <Input
                                    id="Latitude"
                                    className="select-input-box form-control form-control-sm"
                                    type="text"
                                    name="Latitude"
                                    maxLength={20}
                                    lable="Latitude"
                                    //   value={payload.RouteNo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <Input
                                    id="Longitude"
                                    className="select-input-box form-control form-control-sm"
                                    type="text"
                                    name="Longitude"
                                    maxLength={20}
                                    lable="Longitude"
                                    //   value={payload.RouteNo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <Input
                                    id="Oracle Customer Site"
                                    className="select-input-box form-control form-control-sm"
                                    type="text"
                                    name="Oracle Customer Site"
                                    maxLength={20}
                                    lable="OracleCustomerSite"
                                    //   value={payload.BatchNo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <Input
                                    id="Oracle Location Code"
                                    className="select-input-box form-control form-control-sm"
                                    type="text"
                                    name="Oracle Location Code"
                                    maxLength={20}
                                    lable="OracleLocationCode"
                                    //   value={payload.BatchNo}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="col-12 col-sm-6 col-md-2 my-1">
                                <Input
                                    id="Oracle Location Name"
                                    className="select-input-box form-control form-control-sm"
                                    type="text"
                                    name="Oracle Location Name"
                                    maxLength={20}
                                    lable="OracleLocationName"
                                    //   value={payload.BatchNo}
                                    onChange={handleInputChange}
                                />
                            </div>


                        </div>
                    </div>
                </div>
                <Accordion
                    title={t("Address")}
                    defaultValue={true}
                >
                    <div className="row pt-2 px-2 py-2">
                        <div className="col-12">
                            <div className="row gap-3 justify-content-start d-flex align-items-center">
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="BussinessZone"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="BussinessZone"
                                        maxLength={20}
                                        lable="BussinessZone"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="State"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="State"
                                        maxLength={20}
                                        lable="State"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="City"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="City"
                                        maxLength={20}
                                        lable="City"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="CityZone"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="CityZone"
                                        maxLength={20}
                                        lable="CityZone"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="Locality"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="Locality"
                                        maxLength={20}
                                        lable="Locality"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="Pincode"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="Pincode"
                                        maxLength={20}
                                        lable="Pincode"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="LandlineNo"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="LandlineNo"
                                        maxLength={20}
                                        lable="LandlineNo"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        onInput={(e) => number(e, 10)}
                                        lable="Mobile No"
                                        placeholder=" "
                                        className="required-fields"
                                        id="Mobile No"
                                        type="number"
                                        name="Mobile1"
                                        //   value={payload?.Mobile1}
                                        onChange={handleInputChange}
                                    //   onBlur={handleBlur}
                                    />
                                </div>{" "}
                                <div className="col-sm-2">
                                    <Input
                                        name="Email"
                                        placeholder=" "
                                        id="Email"
                                        lable="Email"
                                        type="email"
                                        max={30}
                                        className="required-fields"
                                        onChange={handleSelectChange}
                                    //   value={formData?.Email}
                                    />
                                    {/* {formData?.Email.trim() === "" && (
                              <span className="error-message">{errors?.Emailempty}</span>
                            )}
                            {!emailRegex.test(formData?.Email) &&
                              formData?.Email.trim().length > 0 && (
                                <span className="error-message">{errors?.Emailvalid}</span>
                              )} */}
                                </div>

                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <DatePicker
                                        className="custom-calendar"
                                        name="AgreementFromDate"
                                        placeholder=" "
                                        id="AgreementFromDate"
                                        lable="Agreement From Date"
                                        value={payload.FromDate ? new Date(payload.FromDate) : null}
                                        onChange={handleDateSelect}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <DatePicker
                                        className="custom-calendar"
                                        name="AgreementToDate"
                                        placeholder=" "
                                        id="AgreementToDate"
                                        lable="Agreement To Date"
                                        value={payload.ToDate ? new Date(payload.ToDate) : null}
                                        onChange={handleDateSelect}
                                    />
                                </div>






                            </div>
                        </div>
                    </div>
                </Accordion>
                <Accordion
                    title={t("Contact Person Detail")}
                    defaultValue={true}
                >
                    <div className="row pt-2 px-2 py-2">
                        <div className="col-12">
                            <div className="row gap-3 justify-content-start d-flex align-items-center">

                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="Name"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="Name"
                                        maxLength={20}
                                        lable="Name"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        onInput={(e) => number(e, 10)}
                                        lable="Mobile No"
                                        placeholder=" "
                                        className="required-fields"
                                        id="Mobile No"
                                        type="number"
                                        name="Mobile1"
                                        //   value={payload?.Mobile1}
                                        onChange={handleInputChange}
                                    //   onBlur={handleBlur}
                                    />
                                </div>{" "}
                                <div className="col-sm-2">
                                    <Input
                                        name="Email"
                                        placeholder=" "
                                        id="Email"
                                        lable="Email"
                                        type="email"
                                        max={30}
                                        className="required-fields"
                                        onChange={handleSelectChange}
                                    //   value={formData?.Email}
                                    />
                                    {/* {formData?.Email.trim() === "" && (
                              <span className="error-message">{errors?.Emailempty}</span>
                            )}
                            {!emailRegex.test(formData?.Email) &&
                              formData?.Email.trim().length > 0 && (
                                <span className="error-message">{errors?.Emailvalid}</span>
                              )} */}
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 ">
                                    <ReactSelect
                                        //   dynamicOptions={fieldBoyOptions}
                                        name="Designation"
                                        lable={t("Designation")}
                                        id="Designation"
                                        removeIsClearable={true}
                                        placeholderName={t("Designation")}
                                        //   value={
                                        //     fieldBoyOptions.find((o) => o.value === payload.FieldBoy) ??
                                        //     null
                                        //   }
                                        onChange={handleSelectChange}

                                    />
                                </div>


                            </div>
                        </div>
                    </div>
                </Accordion>
                <Accordion
                    title={t("Sales Detail")}
                    defaultValue={true}
                >
                    <div className="row pt-2 px-2 py-2">
                        <div className="col-12">
                            <div className="row gap-3 justify-content-start d-flex align-items-center">

                                <div className="col-12 col-sm-6 col-md-2 ">
                                    <ReactSelect
                                        //   dynamicOptions={fieldBoyOptions}
                                        name="UnitHead"
                                        lable={t("UnitHead")}
                                        id="UnitHead"
                                        removeIsClearable={true}
                                        placeholderName={t("UnitHead")}
                                        //   value={
                                        //     fieldBoyOptions.find((o) => o.value === payload.FieldBoy) ??
                                        //     null
                                        //   }
                                        onChange={handleSelectChange}

                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 ">
                                    <ReactSelect
                                        //   dynamicOptions={fieldBoyOptions}
                                        name="BussinessUnit"
                                        lable={t("BussinessUnit")}
                                        id="BussinessUnit"
                                        removeIsClearable={true}
                                        placeholderName={t("BussinessUnit")}
                                        //   value={
                                        //     fieldBoyOptions.find((o) => o.value === payload.FieldBoy) ??
                                        //     null
                                        //   }
                                        onChange={handleSelectChange}

                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 ">
                                    <ReactSelect
                                        //   dynamicOptions={fieldBoyOptions}
                                        name="SubUnit"
                                        lable={t("SubUnit")}
                                        id="SubUnit"
                                        removeIsClearable={true}
                                        placeholderName={t("SubUnit")}
                                        //   value={
                                        //     fieldBoyOptions.find((o) => o.value === payload.FieldBoy) ??
                                        //     null
                                        //   }
                                        onChange={handleSelectChange}

                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 ">
                                    <ReactSelect
                                        //   dynamicOptions={fieldBoyOptions}
                                        name="SalesHierarchy"
                                        lable={t("SalesHierarchy")}
                                        id="Sales Hierarchy"
                                        removeIsClearable={true}
                                        placeholderName={t("SalesHierarchy")}
                                        //   value={
                                        //     fieldBoyOptions.find((o) => o.value === payload.FieldBoy) ??
                                        //     null
                                        //   }
                                        onChange={handleSelectChange}

                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="OnlineUserName"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="OnlineUserName"
                                        maxLength={20}
                                        lable="OnlineUserName"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />

                                </div>
                                <div className="col-12 col-sm-6 col-md-2 my-1">
                                    <Input
                                        id="OnlinePassword"
                                        className="select-input-box form-control form-control-sm"
                                        type="text"
                                        name="OnlinePassword"
                                        maxLength={20}
                                        lable="OnlinePassword"
                                        //   value={payload.BatchNo}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="col-12 col-sm-6 col-md-2 ">
                                    <ReactSelect
                                        //   dynamicOptions={fieldBoyOptions}
                                        name="TagProcessingLab"
                                        lable={t("TagProcessing ab")}
                                        id="TagProcessingLab"
                                        removeIsClearable={true}
                                        placeholderName={t("TagProcessingLab")}
                                        //   value={
                                        //     fieldBoyOptions.find((o) => o.value === payload.FieldBoy) ??
                                        //     null
                                        //   }
                                        onChange={handleSelectChange}

                                    />
                                </div>


                            </div>
                        </div>
                    </div>
                </Accordion>


            </Accordion>


            {/* <Accordion defaultValue={true} title={t("")}>
        <div className="row gx-3 gy-3">
          <div className="card w-100">
            <div className="card-body p-2">
              <div className="table-responsive" style={{ width: "100%" }}>
                {logisticReceiveData.length > 0 ? (
                  <Tables
                    style={{
                      maxHeight: "400px",
                      overflowY: "auto",
                    }}
                  >
                    <thead>
                      <tr>
                        <th scope="col">{t("#")}</th>
                        <th scope="col">{t("From Centre")}</th>
                        <th scope="col">{t("Batch No.")}</th>
                        <th scope="col">{t("Vials Qty.")}</th>
                        <th scope="col">{t("Field Boy")}</th>
                        <th scope="col">{t("Courier Detail")}</th>
                        <th scope="col">{t("Docker No.")}</th>
                        <th scope="col">{t("Status")}</th>
                        <th scope="col">{t("Send Date")}</th>
                        <th scope="col">{t("View")}</th>
                        <th scope="col">{t("Action")}</th>
                      </tr>
                    </thead>

                    <tbody>
                      {logisticReceiveData.map((row, idx) => {
                        const statusColor =
                          row.Status === "Transferred"
                            ? "text-success"
                            : row.Status === "Recieved"
                              ? "text-warning"
                              : "text-primary";

                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td data-title={t("From Centre")}>
                              {t(row.FromCentre)}
                            </td>
                            <td data-title={t("Batch No.")}>
                              {t(row.dispatchcode)}
                            </td>
                            <td data-title={t("Vials Qty.")}>
                              {t(row.Quantity)}
                            </td>
                            <td data-title={t("Field Boy")}>
                              {t(row.PickUpFieldBoy)}
                            </td>
                            <td data-title={t("Courier Detail")}>
                              {t(row.CourierDetail)}
                            </td>
                            <td data-title={t("Docker No.")}>
                              {t(row.CourierDocketNo)}
                            </td>
                            <td
                              data-title={t("Status")}
                              className={statusColor}
                            >
                              {t(row.Status)}
                            </td>
                            <td data-title={t("Send Date")}>
                              {t(row.SendDate)}
                            </td>
                            <td data-title={t("View")}>
                              <FontAwesomeIcon
                                icon={faSearch}
                                className="text-info cursor-pointer"
                                onClick={() => {
                                  viewDispatchDetail(row.dispatchcode);
                                  setShowLogisticSampleViewModal(true);
                                }}
                              />
                            </td>
                            <td data-title={t("Action")}>
                              {row.Status === "Transferred" ? (
                                <span
                                  className="text-link text-primary"
                                  style={{
                                    textDecoration: "underline",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    handleReceive(row.dispatchcode)
                                  }
                                >
                                  {t("Receive")}
                                </span>
                              ) : (
                                <span>{""}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Tables>
                ) : (
                  <NoRecordFound />
                )}
              </div>
            </div>
          </div>
        </div>
      </Accordion> */}
            {/* 
      <LogisticSampleViewModal
        show={showLogisticSampleViewModal}
        handleClose={() => setShowLogisticSampleViewModal(false)}
        // centerId={payload.center}
        // batchNo={payload.batchNo}
        rows={batchDetail}
      /> */}
        </>
    );
};

export default LogisticHubMaster;
