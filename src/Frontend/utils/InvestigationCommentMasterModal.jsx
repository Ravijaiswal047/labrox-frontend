import React from "react";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { useTranslation } from "react-i18next";

const theme = useLocalStorage("theme", "get");

const InvestigationCommentMasterModal = ({ show, handleShow }) => {
  const { t } = useTranslation();
  return (
    <>
      <Dialog
        header={t("Comments")}
        visible={show}
        onHide={() => {
          handleShow();
        }}
        draggable={false}
        className={theme}
        style={{ width: "500px" }}
      >
        <div className="col-12">{show?.data}</div>
      </Dialog>
    </>
  );
};

export default InvestigationCommentMasterModal;
