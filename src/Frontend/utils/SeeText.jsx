import React from "react";
import { Dialog } from "primereact/dialog";
import { useTranslation } from "react-i18next";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";

const SeeText = ({ show, handleShow, data }) => {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  return (
    <>
      <Dialog
        header={t("See Text")}
        visible={show}
        onHide={() => {
          handleShow();
        }}
        draggable={false}
        className={theme}
        style={{ width: "500px" }}
      >
        <div className="row">
          <div className="col-sm-12">
            <div>{data}</div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default SeeText;
