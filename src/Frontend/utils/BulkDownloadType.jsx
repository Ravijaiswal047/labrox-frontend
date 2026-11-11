import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

import { useTranslation } from "react-i18next";
import { CustomButton } from "../../components/UI/CustomButton";
function BulkDownloadType({ show, onHide, onSubmit }) {
  const [dataForEmail, setDataForEmail] = useState({
    letterHead: 0,
    Signature: 0,
  });

  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      header={t("BulkDownloadType")}
      onHide={onHide}
      className={theme}
      visible={show}
    >
      <div className="row mt-1">
        {/* <div className="col-sm-3">
          <label htmlFor="letterHead">{t("With LetterHead")}</label>
          <input
            type={"checkbox"}
            checked={dataForEmail?.letterHead}
            name="letterHead"
            id="letterHead"
            onChange={(e) => {
              setDataForEmail({
                ...dataForEmail,
                [e.target.name]: e.target.checked ? 1 : 0,
              });
            }}
          />
        </div> */}
        <div className="col-auto d-flex align-items-center justify-content-center p-2" style={{
          gap: "5px"
        }}>
          <label class="switch mb-0">
            <input
              type="checkbox"
              checked={dataForEmail?.letterHead}
              name="letterHead"
              id="letterHead"
              onChange={(e) => {
                setDataForEmail({
                  ...dataForEmail,
                  [e.target.name]: e.target.checked ? 1 : 0,
                });
              }}
            />
            <span class="slider"></span>
          </label>
          <strong>
            <span>{t("With LetterHead")}</span>
          </strong>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-3">
          {/* <button
            className="btn btn-sm btn-success mx-2"
            onClick={() => onSubmit(dataForEmail)}
          >
            {t("Download")}
          </button> */}
          <CustomButton
            onClick={() => onSubmit(dataForEmail)}
            text={"Download"}
            icon={"download"}
          />
        </div>
      </div>
    </Dialog>
  );
}

export default BulkDownloadType;
