import { Dialog } from "primereact/dialog";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const IsBillAndReportModal = ({ show, setShow, config, setConfig }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const [localConfig, setLocalConfig] = useState({
    IsMailReport: 1,
    IsMailBill: 1,
    IsWhatsappReport: 1,
    IsWhatsappBill: 1,
    IsSmsReport: 1,
    IsSmsBill: 1,
  });

  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  console.log({ localConfig });
  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;
    setLocalConfig((prev) => ({
      ...prev,
      [id]: checked ? 1 : 0,
    }));
  };

  const handleUpdate = () => {
    setConfig(localConfig);
    setShow(false);
  };

  const renderCheckbox = (id) => (
    <div className="form-check">
      <input
        type="checkbox"
        className="form-check-input"
        id={id}
        checked={!!localConfig[id]}
        onChange={handleCheckboxChange}
      />
      <label className="form-check-label ml-2" htmlFor={id}>
        {t(id)}
      </label>
    </div>
  );

  return (
    <Dialog
      header={t("Update Bill And Report")}
      visible={show}
      className={theme}
      top="25%"
      style={{ width: isMobile ? "60vw" : "40vw" }}
      onHide={() => setShow(false)}
    >
      <div className="container-fluid">
        {[
          { label: "Mail", ids: ["IsMailReport", "IsMailBill"] },
          { label: "Whatsapp", ids: ["IsWhatsappReport", "IsWhatsappBill"] },
          { label: "SMS", ids: ["IsSmsReport", "IsSmsBill"] },
        ].map((group) => (
          <div className="row align-items-center mb-2" key={group.label}>
            <div className="col-sm-2 font-weight-bold">{t(group.label)}:</div>
            <div className="col-sm-5">{renderCheckbox(group.ids[0])}</div>
            <div className="col-sm-5">{renderCheckbox(group.ids[1])}</div>
          </div>
        ))}

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-success btn-sm"
            onClick={handleUpdate}
          >
            {t("Update")}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default IsBillAndReportModal;
