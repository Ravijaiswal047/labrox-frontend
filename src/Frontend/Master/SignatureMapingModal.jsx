import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";

import { axiosInstance } from "../../utils/axiosInstance";

import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SignatureMapingModal = ({
  show,
  setShow,
  handleSelctData,
  selectedData,
}) => {
  const { t } = useTranslation();

  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");

  const [signatureImg, setSignatureImg] = useState("");
  const getFileUrl = () => {
    const reqPayload = {
      Key: selectedData?.SignatureID,
    };
    axiosInstance
      .post("CommonController/GetFileUrl", reqPayload)
      .then((res) => {
        let { message, success } = res.data;
        if (success) {
          setSignatureImg(message);
        }
      })
      .catch((err) => {
        if (err.response.status === 401) {
          window.sessionStorage.clear();
          window.location.href = "/login";
        }
      });
  };

  useEffect(() => getFileUrl(), []);
  return (
    <>
      <Dialog
        header={t("Doctor Signature")}
        visible={show}
        className={theme}
        onHide={() => setShow(false)}
        style={{
          width: isMobile ? "40vw" : "75vw",
        }}
      >
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <img
              src={signatureImg}
              alt="Signature"
              className="img-fluid signature-image"
              style={{
                maxWidth: "500px",
                height: "auto",
                border: "1px solid #ccc",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                padding: "8px",
                backgroundColor: "#fff",
              }}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default SignatureMapingModal;
