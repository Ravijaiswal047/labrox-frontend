import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Input from "../../components/formComponent/Input";
import { axiosInstance, axiosReport } from "../../utils/axiosInstance";
import DatePicker from "../../components/formComponent/DatePicker";
import Tables from "../../components/UI/customTable";
import Loading from "../../components/loader/Loading";
// import TestSelectModalForDaySpecial from "../util/TestSelectModalForDaySpecial";
// import CentreSelectModalForDaySpecial from "../../Frontend/util/CentreSelectModalForDaySpecial";
import { dateConfig } from "../../utils/helpers";
import { toast } from "react-toastify";
import { Modal } from "react-bootstrap";

import Accordion from "@app/components/UI/Accordion";
import NoRecordFound from "../../components/formComponent/NoRecordFound";
import TestSelectModalForDaySpecial from "../utils/TestSelectModalForDaySpecial";
import CentreSelectModalForDaySpecial from "../utils/CentreSelectModalForDaySpecial";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { CustomButton } from "../../components/UI/CustomButton";
import UploadFile from "../utils/UploadFileModal/UploadFile";
import { guidNumber } from "../../utils/generateGuid";
const payLoadConst = {
  DaySepecial: "",
  Description: "",
  FromValidityDate: new Date(),
  ToValidityDate: new Date(),
  isActive: 1,
  DiscountPer: "",
  PromotionalID: "",
  PromotionalGuid: "",
};
const DaySpecialTest = () => {
  const { t } = useTranslation();
  const [payload, setPayload] = useState(payLoadConst);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [DiscountId, setDiscountId] = useState({});
  const [show, setShow] = useState(false);
  const [showdep, setShowdep] = useState(false);
  const [pageType, setPageType] = useState(false);
  const userdata = useLocalStorage("userData", "get");
  const DefaultCurrencyName = userdata?.DefaultCurrencyName;
  const isKESCurrency = DefaultCurrencyName === "KES";
  console.log(DefaultCurrencyName, "DefaultCurrencyName")
  const [isFileLinked, setIsFileLinked] = useState(false);
  const [showFileModal, setShowFileModal] = useState({
      modal: false,
      data: "",
      index: -1,
    });
  const [previewFile, setPreviewFile] = useState({
    modal: false,
    url: "",
    type: "",
  });

    const handleOpenUploadModal = () => {
        const currentGuid = payload.PromotionalGuid ? payload.PromotionalGuid : guidNumber();
        setPayload(prev => ({ ...prev, PromotionalGuid: currentGuid }));
        setShowFileModal({
          modal: true,
          data: currentGuid,
          index: -1,
        });
      };
  const handleCaptureUploadedFile = (name, count, isUploaded, guid) => {
    if (count > 0) {
      setIsFileLinked(true);
      if (guid) {
        setPayload((prev) => {
          const guids = prev.PromotionalGuid ? prev.PromotionalGuid.split(",") : [];
          if (!guids.includes(guid)) {
            guids.push(guid);
          }
          return { ...prev, PromotionalGuid: guids.join(",") };
        });
      }
      toast.success(`${count} file(s) linked successfully.`);
    }
  };
  const getPromotionalDataList = () => {
    setLoading(true);
    axiosInstance
      .get("Promotional/Allpromotionaldata")
      .then((res) => {
        if (res.status === 200) {
          setData(res.data.message);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    getPromotionalDataList();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e?.target;

    if (name === "DiscountPer") {
      const isValidInput =
        /^\d+(\.\d{0,2})?$/.test(value) &&
        parseFloat(value) >= 0 &&
        parseFloat(value) <= 100;
      setPayload({
        ...payload,
        [name]: isValidInput || value === "" ? value : payload[name],
      });
    } else {
      setPayload((payload) => ({
        ...payload,
        [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
      }));
    }
  };

  const dateSelect = (date, name) => {
    if (name === "FromValidityDate") {
      const updateDate =
        new Date(payload?.ToValidityDate) - date < 0
          ? date
          : payload.ToValidityDate;
      setPayload({ ...payload, [name]: date, ToValidityDate: updateDate });
    } else {
      setPayload({ ...payload, [name]: date });
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleClosedep = () => setShowdep(false);
  const handleShowdep = () => setShowdep(true);

  const disableData = (Id, isActive) => {
    if (window.confirm("Are You Sure?")) {
      axiosInstance
        .post("Promotional/DeActivePromotionaData", {
          PromotionalID: Id,
          isActive: isActive,
        })
        .then((res) => {
          if (isActive == 1) {
            toast.success("Active Successfully");
          } else toast.success(res?.data?.message);

          getPromotionalDataList();
        })
        .catch((err) => console.log(err));
    }
  };

  const handlePreviewFile = (awskey) => {
    axiosInstance
      .post("CommonController/GetFileUrl", { Key: awskey })
      .then((res) => {
        const message = res?.data?.message;
        const extension = awskey?.split(".").pop()?.toLowerCase();
        setPreviewFile({
          modal: true,
          url:
            typeof message === "string"
              ? message
              : message?.downloadUrl || message?.imgUrl || "",
          type: extension,
        });
      })
      .catch(() => {
        toast.error("Unable to preview file");
      });
  };

  console.log(payload.PromotionalID);

  const createPromotion = () => {
    if (payload.DaySepecial !== "") {
      if (isKESCurrency && !payload?.PromotionalGuid) {
        toast.error("Please upload a file");
        return;
      }

      axiosInstance
        .post("Promotional/InsertPromotionalData", {
          DaySepecial: payload?.DaySepecial.trim(),
          FromValidityDate: payload?.FromValidityDate,
          ToValidityDate: payload?.ToValidityDate,
          isActive: payload?.isActive,
          DiscountPer: payload?.DiscountPer,
          Description: payload?.Description || "",
          PromotionalGuid: payload?.PromotionalGuid || "",
        })
        .then((response) => {
          setPayload(payLoadConst);
          setIsFileLinked(false);
          toast.success(response.data.message);
          setPageType(false);
          getPromotionalDataList();
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    } else {
      toast.error("Please specify a DaySpecial Name");
    }
  };
  const updatePromotion = () => {
    if (payload.DaySepecial !== "") {
      axiosInstance
        .post("Promotional/UpdatePromotionalData", {
          DaySepecial: payload?.DaySepecial.trim(),
          FromValidityDate: payload?.FromValidityDate,
          ToValidityDate: payload?.ToValidityDate,
          isActive: payload?.isActive ? 1 : 0,
          DiscountPer: payload?.DiscountPer?.toString(),
          PromotionalID: payload?.PromotionalID,
        })
        .then((response) => {
          setPayload(payLoadConst);
          toast.success(response.data.message);
          setPageType(false);
          getPromotionalDataList();
        })
        .catch((err) => {
          toast.error(err.response.data.message);
        });
    } else {
      toast.error("Please specify a DaySpecial Name");
    }
  };

  return (
    <>
      {DiscountId && show && (
        <TestSelectModalForDaySpecial
          show={show}
          handleClose={handleClose}
          DiscountData={DiscountId}
        />
      )}

      {showdep && (
        <CentreSelectModalForDaySpecial
          show={showdep}
          handleClose={handleClosedep}
          DiscountData={DiscountId}
        />
      )}
      <Accordion
        name={t("Day Special Master")}
        defaultValue={true}
        isBreadcrumb={true}
      >
        <div className="row  pt-2 pl-2 pr-2">
          <div className="col-sm-2">
            <Input
              name={"DaySepecial"}
              className="required-fields"
              placeholder=" "
              id="Day Special"
              lable="Day Special"
              value={payload?.DaySepecial}
              onChange={handleChange}
            />
          </div>

          {isKESCurrency && (
            <div className="col-sm-2">
              <Input
                name={"Description"}
                placeholder=" "
                id="Description"
                lable="Description"
                value={payload?.Description}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="From Date"
              lable="From Date"
              name="FromValidityDate"
              value={
                payload?.FromValidityDate
                  ? new Date(payload?.FromValidityDate)
                  : new Date()
              }
              onChange={dateSelect}
            />
          </div>

          <div className="col-sm-2">
            <DatePicker
              className="custom-calendar"
              placeholder=" "
              id="To Date"
              lable="To Date"
              name="ToValidityDate"
              value={
                payload?.ToValidityDate
                  ? new Date(payload?.ToValidityDate)
                  : new Date()
              }
              minDate={payload?.FromValidityDate}
              onChange={dateSelect}
            />
          </div>

          {!isKESCurrency && (
            <div className="col-sm-2">
              <Input
                name={"DiscountPer"}
                placeholder=" "
                id="Discount"
                lable="Discount %"
                value={payload?.DiscountPer}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="col-sm-1 d-flex">
            <label className="" htmlFor="inputText">
              {t("IsActive")}
            </label>
            &nbsp;
            <div className="mt-1">
              <input
                type={"checkbox"}
                name={"isActive"}
                checked={payload?.isActive == 1 ? true : false}
                onChange={handleChange}
              />
            </div>
          </div>
          {isKESCurrency && (
            <div className="col-sm-1">
              <CustomButton
                icon="add"
                text={isFileLinked || payload?.PromotionalGuid ? t("File Linked") : t("Upload file")}
                onClick={handleOpenUploadModal}
              />
            </div>
          )}
          <div className="col-sm-1">
            {pageType ? (
              <button
                type="Search"
                className="btn btn-block btn-success btn-sm"
                onClick={updatePromotion}
              >
                {t("Update")}
              </button>
            ) : (
              <button
                type="Search"
                className="btn btn-success btn-info btn-sm"
                onClick={createPromotion}
              >
                {t("Create")}
              </button>
            )}
          </div>
        </div>
      </Accordion>

      {isKESCurrency && showFileModal?.modal && (
        <UploadFile
          show={showFileModal?.modal}
          handleClose={() => {
            setShowFileModal({ modal: false, data: "", index: -1 });
          }}
          documentId={showFileModal?.data}
          pageName="POInvoice"
          handleUploadCount={handleCaptureUploadedFile}
        />
      )}

      <Modal
        show={previewFile?.modal}
        onHide={() => setPreviewFile({ modal: false, url: "", type: "" })}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{t("Document Preview")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            className="text-center"
            style={{
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {previewFile?.type === "pdf" ? (
              <iframe
                src={`${previewFile?.url}#toolbar=0`}
                width="100%"
                height="500px"
                style={{ border: "none" }}
                title="Viewer"
              />
            ) : ["jpg", "jpeg", "png", "gif"].includes(previewFile?.type) ? (
              <img
                src={previewFile?.url}
                alt="Document"
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            ) : (
              <div className="text-center mt-5">{t("No Document Found")}</div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {loading ? (
        <Loading />
      ) : (
        <Accordion title="Search Detail" defaultValue={true}>
          {data && data.length !== 0 ? (
            <Tables>
              <thead className="cf">
                <tr className="text-center">
                  <th>{t("S.No")}</th>
                  <th>{t("Day Special Name")}</th>
                  {isKESCurrency && (
                    <th>{t("Description")}</th>
                  )}
                  <th>{t("Created By")} </th>
                  <th>{t("Created On")}</th>
                  {!isKESCurrency && (
                    <th>{t("Discount")}</th>
                  )}
                  <th>{t("Valid From")}</th>
                  <th>{t("Valid To")}</th>
                  <th>{t("Status")}</th>
                  {isKESCurrency && (
                    <th>{t("Promotional Image")}</th>
                  )}
                  <th>{t("Action")}</th>
                  <th>{t("Centre")}</th>
                  {!isKESCurrency && (
                    <th>{t("Test")}</th>
                  )}
                  <th>{t("De-Active")}</th>
                </tr>
              </thead>
              <tbody>
                {data &&
                  data.map((data, i) => (
                    <tr key={i}>
                      <td data-title={t("S.No")}>{i + 1} &nbsp;</td>
                      <td data-title={t("Day Special Name")}>
                        {data?.DaySepecial}&nbsp;
                      </td>
                      {isKESCurrency && (
                        <td data-title={t("Description")}>
                          {data?.Description}&nbsp;
                        </td>
                      )}
                      <td data-title={t("Created By")}>
                        {data?.CreatedByName} &nbsp;
                      </td>
                      <td data-title={t("Created On")}>
                        {dateConfig(data?.CreatedOn)}&nbsp;
                      </td>
                      {!isKESCurrency && (
                        <td data-title={t("Discount %")}>
                          {data?.DiscountPer} &nbsp;
                        </td>
                      )}
                      <td data-title={t("Valid From")}>
                        {dateConfig(data?.FromValidityDate)}
                      </td>
                      <td data-title={t("Valid To")}>
                        {dateConfig(data?.ToValidityDate)} &nbsp;
                      </td>
                      <td data-title={t("Status")}>
                        {data?.isActiveStatus}&nbsp;
                      </td>
                      {isKESCurrency && (
                        <td data-title={t("Preview")} className="text-center">
                          {data?.awskey && (
                            <i
                              className="fa fa-paperclip text-primary cursor-pointer"
                              style={{ fontSize: "14px" }}
                              title={t("View Attachments")}
                              onClick={() => handlePreviewFile(data?.awskey)}
                            />
                          )}
                        </td>
                      )}
                      <td data-title={t("Edit")}>
                        <button
                          id="AddInvestigation"
                          className="form-control btn btn-warning  btn-sm"
                          style={{
                            borderRadius: "20px",
                            color: "white",
                            width: "28px",
                          }}
                          onClick={() => {
                            setPageType(true);
                            setPayload({
                              DaySepecial: data?.DaySepecial,
                              FromValidityDate: new Date(
                                data?.FromValidityDate,
                              ),
                              ToValidityDate: new Date(data?.ToValidityDate),
                              isActive: data?.isActive,
                              DiscountPer: data?.DiscountPer,
                              PromotionalID: data?.PromotionalID,
                            });
                          }}
                        >
                          <i class="fa fa-edit"></i>
                        </button>
                      </td>
                      <td data-title={t("Centre")}>
                        <button
                          className="form-control btn btn-info btn-sm"
                          style={{
                            borderRadius: "20px",
                            color: "white",
                            width: "30px",
                            marginLeft: "2px",
                          }}
                          onClick={() => {
                            handleShowdep();
                            setDiscountId(data);
                          }}
                        >
                          <i class="fa fa-plus"></i>
                        </button>
                      </td>
                      {!isKESCurrency && (
                      <td data-title={t("Test")}>
                        <button
                          className="form-control btn btn-primary btn-sm"
                          style={{
                            borderRadius: "20px",
                            color: "white",
                            width: "30px",
                            marginLeft: "2px",
                          }}
                          onClick={() => {
                            handleShow();
                            setDiscountId(data);
                          }}
                        >
                          <i class="fa fa-plus"></i>
                        </button>
                        &nbsp;{" "}
                      </td>
                      )}
                      <td data-title={t("Remove")}>
                        <button
                          id="AddInvestigation"
                          className={`form-control btn ${data?.isActive === 0 ? "btn-success" : "btn-danger"
                            }  btn-sm`}
                          style={{
                            borderRadius: "20px",
                            color: "white",
                            width: "28px",
                          }}
                          onClick={() =>
                            disableData(
                              data.PromotionalID,
                              data?.isActive == 0 ? 1 : 0,
                            )
                          }
                        >
                          <i
                            class={`${data?.isActive === 0 ? "fa fa-check" : "fa fa-ban"
                              }`}
                          ></i>
                        </button>
                        &nbsp;{" "}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Tables>
          ) : (
            <NoRecordFound />
          )}
        </Accordion>
      )}
    </>
  );
};

export default DaySpecialTest;
