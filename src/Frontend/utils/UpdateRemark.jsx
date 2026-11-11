import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { axiosInstance } from "../../utils/axiosInstance";
import { toast } from "react-toastify";

import { useTranslation } from "react-i18next";
import ReactSelect from "../../components/formComponent/ReactSelect";
const UpdateRemark = ({
  show,
  handleShow,
  state,
  PageName,
  title,
  TableData,
  status,
}) => {
  const [payload, setPayload] = useState(PageName);
  const isMobile = window.innerWidth <= 768;

  const [data, setData] = useState({
    BillingRemarks: "",
  });
  const [load, setLoad] = useState(false);
  const [remarkData, setRemarkData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const { t } = useTranslation();
  useEffect(() => {
    setPayload(PageName);
    setIsEdit(!!PageName);
  }, [PageName]);
  const handleUpdateRemark = (payload, ledgerId) => {
    if (!isEdit && payload === "") {
      toast.error("Remark Can't Be Saved Blank");
      return;
    }
    let updatePayload = {
      Remarks: payload,
      LedgerTransactionID: ledgerId,
    };
    axiosInstance
      .post("CommonController/UpdateRemarks", updatePayload)
      .then((res) => {
        if (res?.data?.success) {
          toast.success(res?.data?.message);
          handleShow();
          TableData(status);
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message
            ? err?.response?.data?.message
            : "Error Occured",
        );
      });
  };

  const theme = useLocalStorage("theme", "get");
  console.log({ PageName, state });

  const handleSearch = () => {
    setLoad(true);
    const data = [{ Type: "BillingRemarks" }];
    if (data.length > 0) {
      axiosInstance
        .post("Global/getGlobalDataByFieldType", data)
        .then((res) => {
          if (res?.data?.success && Array.isArray(res?.data?.message)) {
            const selectedData = res?.data?.message
              ?.filter((item) => item?.IsActive === 1)
              ?.map((item) => ({
                label: item?.FieldDisplay,
                value: item?.FieldId,
              }));
            console.log({ selectedData });
            const updatedData = [
              { label: "SelectRemark", value: 0 },
              ...selectedData,
              { label: "Others", value: 1 },
            ];
            setRemarkData(updatedData);
          } else {
            const updatedData = [
              { label: "SelectRemark", value: 0 },
              { label: "Others", value: 1 },
            ];
            setRemarkData(updatedData);
            console?.log(res?.data?.message);
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
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearchSelectChange = (label, value) => {
    console.log({ label, value });
    setData((prev) => ({ ...prev, [label]: value?.value }));
    setPayload(value?.value !== 1 && value?.value !== 0 ? value?.label : "");
  };

  useEffect(() => {
    if (show && remarkData?.length > 0) {
      if (state?.Remarks) {
        const selectedOption = remarkData?.find(
          (ele) => ele?.label === state?.Remarks,
        );
        if (selectedOption) {
          setData({ BillingRemarks: selectedOption?.value });
          setPayload(selectedOption?.value !== 1 ? selectedOption?.label : "");
        } else {
          setData({ BillingRemarks: 1 });
          setPayload(state?.Remarks);
        }
      } else {
        setData({ BillingRemarks: 0 });
        setPayload("");
      }
    }
  }, [show, state?.Remarks, remarkData]);
  return (
    <>
      <Dialog
        header={t(title)}
        visible={show}
        top={"25%"}
        className={theme}
        onHide={handleShow}
        style={{
          width: isMobile ? "30vw" : "17vw",
        }}
      >
        <div className="modal-card">
          <ReactSelect
            dynamicOptions={remarkData}
            name="BillingRemarks"
            lable={t("BillingRemarks")}
            id="BillingRemarks"
            removeIsClearable={true}
            placeholderName={t("SelectRemark")}
            value={data?.BillingRemarks}
            onChange={handleSearchSelectChange}
          />
          {data?.BillingRemarks == 1 && (
            <textarea
              style={{ width: "100%", height: "20vh" }}
              className="form-control-txtarea p-2"
              name="CustomReason"
              onChange={(e) => {
                setPayload(e?.target?.value);
              }}
              value={payload}
            ></textarea>
          )}

          <div className="d-flex justify-content-centre">
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-success btn-sm"
                onClick={() => {
                  handleUpdateRemark(payload, state?.LedgerTransactionID);
                }}
              >
                {t("Update")}
              </button>
            </div>
            <div className="col-sm-6">
              <button
                type="button"
                className="btn btn-block btn-danger btn-sm"
                onClick={handleShow}
              >
                {t("Close")}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default UpdateRemark;
