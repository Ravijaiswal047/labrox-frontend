import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

import { useTranslation } from "react-i18next";
import { axiosInstance } from "../../utils/axiosInstance";
import ReactSelect from "../../components/formComponent/ReactSelect";
const SampleRemark = ({
  show,
  handleShow,
  state,
  PageName,
  handleSave,
  title,
}) => {
  const [payload, setPayload] = useState(PageName);
  const [data, setData] = useState({
    BillingRemarks: "",
  });
  const [load, setLoad] = useState(false);
  const [remarkData, setRemarkData] = useState([]);
  const theme = useLocalStorage("theme", "get");
  const isMobile = window.innerWidth <= 768;
  const { t } = useTranslation();

  const handleSearch = () => {
    setLoad(true);
    const data = { Type: "BillingRemarks" };
    if (data) {
      axiosInstance
        // .post("Global/getGlobalDataByFieldType", data)
        .post("/Global/GetGlobalData", data)
        .then((res) => {
          if (res?.data?.success && Array.isArray(res?.data?.message)) {
            const selectedData = res?.data?.message
              ?.map((item) => ({
                label: item?.FieldDisplay,
                value: item?.FieldID,
              }));
            console.log({ selectedData });
            const updatedData = [
              ...selectedData,
              { label: "Others", value: 1 },
            ];
            setRemarkData(updatedData);
          } else {
            const updatedData = [{ label: "Others", value: 1 }];
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
    {
      title === "Billing Remarks" && handleSearch();
    }
  }, []);

  const handleSearchSelectChange = (label, value) => {
    console.log({ label, value });
    setData((prev) => ({ ...prev, [label]: value?.value }));
    setPayload(value?.value != 1 ? value?.label : "");
  };

  useEffect(() => {
    if (show && state?.Remarks && remarkData?.length > 0) {
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
    }
  }, [show, state?.Remarks, remarkData]);

  console.log({ state, data });
  return (
    <>
      <Dialog
        header={t(title)}
        visible={show}
        top={"25%"}
        className={theme}
        onHide={handleShow}
        style={{
          width: isMobile ? "70vw" : "17vw",
        }}
      >
        <div className="modal-card">
          {title === "Billing Remarks" && (
            <ReactSelect
              dynamicOptions={remarkData}
              name="BillingRemarks"
              lable={t("BillingRemarks")}
              id="BillingRemarks"
              removeIsClearable={true}
              placeholderName={t("BillingRemarks")}
              value={data?.BillingRemarks}
              onChange={handleSearchSelectChange}
            />
          )}
          {((title === "Billing Remarks" && data?.BillingRemarks == 1) ||
            title !== "Billing Remarks") && (
            <textarea
              style={{ width: "100%", height: "20vh" }}
              className="form-control-txtarea p-2"
              name="CustomReason"
              onChange={(e) => {
                setPayload(e?.target?.value);
              }}
              value={payload}
              disabled={title === "Remarks" || title === "PricksRemarks"}
            ></textarea>
          )}

          {title == "Remarks" || title == "PricksRemarks" ? (
            <></>
          ) : (
            <div className="d-flex justify-content-centre">
              <div className="col-sm-6">
                <button
                  type="button"
                  className="btn btn-block btn-success btn-sm"
                  onClick={() => {
                    handleSave(payload, state?.index, state?.SINNo);
                  }}
                >
                  {t("Save")}
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
          )}
        </div>
      </Dialog>
    </>
  );
};

export default SampleRemark;
