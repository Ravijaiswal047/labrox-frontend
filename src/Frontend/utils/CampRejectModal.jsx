import React, { useState } from "react";
import { toast } from "react-toastify";
import { axiosInstance } from "../../utils/axiosInstance";

import Input from "../../components/formComponent/Input";
import Loading from "../../components/loader/Loading";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
const CampRejectModal = ({ selectedData, show, onHide, title }) => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({
    RejectReason: "",
  });

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setPayload({ ...payload, [name]: value });
  };

  const handleReject = () => {
    if (payload?.RejectReason === "") {
      toast.error("Please enter Reject Reason.");
    } else {
      setLoading(true);
      axiosInstance
        .post("Camp/RejectCampRequestID", {
          CampRequestID: selectedData?.ID,
          RejectReason: payload?.RejectReason,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setLoading(false);
          setPayload({
            ...payload,
            RejectReason: "",
          });
          onHide();
        })
        .catch((err) => {
          toast.error(
            err?.response?.data?.message
              ? err?.response?.data?.message
              : "Something went wrong.",
          );
          setPayload({
            ...payload,
            RejectReason: "",
          });
          setLoading(false);
        });
    }
  };

  const theme = useLocalStorage("theme", "get");
  return (
    <>
      <Dialog
        header={`${selectedData?.CampName} - Reason for Rejection`}
        visible={show}
        onHide={onHide}
        className={theme}
      >
        <div className="row">
          <div className="col-sm-12">
            <Input
              name="RejectReason"
              id="RejectReason"
              value={payload?.RejectReason}
              max="70"
              onChange={handleChange}
              placeholder="Enter Reject Reason"
              label="Reject Reason"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4">
            {!loading ? (
              <button
                className="btn btn-sm btn-block btn-danger"
                onClick={handleReject}
              >
                Reject
              </button>
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default CampRejectModal;
