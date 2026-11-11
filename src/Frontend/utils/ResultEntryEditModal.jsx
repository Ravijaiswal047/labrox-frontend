import React, { useRef } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Tables from "../../components/UI/customTable";
import Input from "../../components/formComponent/Input";
import { useLocalStorage } from "../../utils/hooks/useLocalStorage";
import { Dialog } from "primereact/dialog";
import "./ResultEntryEditModal.css";

function ResultEntryEditModal({ show, handleClose, handleSave }) {
  const [EditData, setEditData] = useState(show?.data);
  // i18n start
  console.log("EditData::", EditData);
  const { t } = useTranslation();
  const textareaRef = useRef(null);

  // i18n end
  const handleChange = (e) => {
    const { name, value } = e.target;
    let data = EditData?.DisplayReading
      ? EditData?.DisplayReading.split("-")
      : ["", ""];

    if (name === "MinValue") {
      data[0] = value;
      const val = `${data[0]}-${data[1]}`;
      // setEditData({ ...EditData, [name]: value, DisplayReading: val });
      setEditData({ ...EditData, [name]: value});
    }
    if (name === "MaxValue") {
      data[1] = value;
      const val = `${data[0]}-${data[1]}`;
      // setEditData({ ...EditData, [name]: value, DisplayReading: val });
      setEditData({ ...EditData, [name]: value});
    }
    if (name === "ReadingFormat") {
      setEditData({ ...EditData, [name]: value });
    }
    if (name === "DisplayReading") {
      setEditData((prev) => ({ ...prev, ["DisplayReading"]: value }));
    }
    if (name === "MethodName") {
      setEditData((prev) => ({ ...prev, ["MethodName"]: value }));
    }
  };
  const handleTextareaChange = (e) => {
    handleChange(e);

    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };
  const isMobile = window.innerWidth <= 768;
  const theme = useLocalStorage("theme", "get");
  return (
    <Dialog
      header={"Change Reference Range of " + show?.data?.TestName}
      onHide={handleClose}
      visible={show}
      className={theme}
      style={{
        width: isMobile ? "80vw" : "43vw",
      }}
    >
      <div className="">
        <Tables>
          <thead className="cf">
            <tr>
              <th>{t("Min Value")}</th>
              <th>{t("Max Value")}</th>
              <th>{t("Unit")}</th>
              <th>{t("Display Reading")}</th>
              <th>{t("Method Name")}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td data-title={t("Min Value")}>
                <Input
                  type="text"
                  className="select-input-box form-control input-sm"
                  name="MinValue"
                  value={EditData?.MinValue}
                  onChange={handleChange}
                />
              </td>
              <td data-title={t("Max Value")}>
                <Input
                  type="text"
                  className="select-input-box form-control input-sm"
                  name="MaxValue"
                  value={EditData?.MaxValue}
                  onChange={handleChange}
                />
              </td>
              <td data-title={t("Unit Type")}>
                <Input
                  type="text"
                  className="select-input-box form-control input-sm"
                  name="ReadingFormat"
                  value={EditData?.ReadingFormat}
                  onChange={handleChange}
                />
              </td>
              {/* <td data-title={t("Display Reading")}>
                <Input
                  max={2}
                  type="text"
                  className="select-input-box form-control input-sm"
                  name="DisplayReading"
                  value={EditData?.DisplayReading}
                  onChange={handleChange}
                  // readOnly // enable globally for all
                />
              </td> */}
              <td data-title={t("Display Reading")}>
                <textarea
                  ref={textareaRef}
                  className="select-input-box form-control input-sm"
                  name="DisplayReading"
                  value={EditData?.DisplayReading || ""}
                  onChange={handleTextareaChange}
                  // rows={3}
                  style={{
                    overflow: "auto",   // 👈 allow scroll
                    resize: "none",
                    maxHeight: "120px"  // 👈 optional: limit growth so scroll appears
                  }}
                />
              </td>
              <td data-title={t("Display Reading")}>
                <Input
                  max={2}
                  type="text"
                  className="select-input-box form-control input-sm"
                  name="MethodName"
                  value={EditData?.MethodName}
                  onChange={handleChange}
                  // readOnly // enable globally for all
                />
              </td>
            </tr>
          </tbody>
        </Tables>

        <div
          style={{ gap: "10px" }}
          className="mt-2 d-flex align-items-center justify-content-center"
        >
          <button
            type="button"
            style={{ width: "120px" }}
            className="btn btn-success my-0 btn-block btn-sm rounded"
            onClick={() => handleSave(EditData, "Edit")}
          >
            {t("Save")}
          </button>
          <button
            type="button"
            style={{ width: "120px" }}
            className="btn btn-danger my-0 btn-block btn-sm rounded"
            onClick={handleClose}
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

export default ResultEntryEditModal;
