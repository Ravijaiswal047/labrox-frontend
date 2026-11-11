import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "primereact/dialog";
import { useLocalStorage } from "../../../utils/hooks/useLocalStorage";

function NearTatModal({ show, onHandleShow, tableData = [], onTatClick }) {
  const { t } = useTranslation();
  const theme = useLocalStorage("theme", "get");

  const isMobile = window.innerWidth < 768;
  let outsideTat = 0;
  let nearTat = 0;
  let withinTat = 0;

  tableData.forEach((item) => {
    if (item?.TATDelay == 1) outsideTat++;
    else if (item?.TATIntimate == 1) nearTat++;
    else withinTat++;
  });

  const allCount = tableData.length;

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHandleShow();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onHandleShow]);

  // const handleClick = (value) => {
  //   if (value !== null) {
  //     onTatClick(value);
  //   }
  //   onHandleShow();
  // };

  return (
    <Dialog
      header={t("TAT SUMMARY")}
      visible={show}
      top={"25%"}
      className={theme}
      onHide={onHandleShow}
      style={{ width: isMobile ? "90vw" : "30vw" }}
    >
      <div className="p-3">

        <div
          style={{ fontWeight: "700", cursor: "pointer" }}
        //onClick={() => handleClick(null)}
        >
          All TAT : {allCount}
        </div>

        <div
          style={{ fontWeight: "700", color: "green", cursor: "pointer" }}
        //onClick={() => handleClick("1")}
        >
          Within TAT : {withinTat}
        </div>

        <div
          style={{ fontWeight: "700", color: "#b59b00", cursor: "pointer" }}
        //onClick={() => handleClick("2")}
        >
          Near TAT : {nearTat}
        </div>

        <div
          style={{ fontWeight: "700", color: "red", cursor: "pointer" }}
        //onClick={() => handleClick("3")}
        >
          Outside TAT : {outsideTat}
        </div>

        <div className="mt-3">
          <button
            className="btn btn-secondary btn-sm px-3"
            onClick={onHandleShow}
          >
            {t("Close")}
          </button>
        </div>

      </div>
    </Dialog>
  );
}

export default NearTatModal;